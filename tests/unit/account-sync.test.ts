import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AccountSync,
  accountMetaKey,
  accountProgressKey,
  endAccountSession,
  initialProgressKey,
  PUSH_DELAY_MS,
  queueEarlyChanges,
  RETRY_DELAY_MS,
  type RemoteProgress,
} from '@/lib/progress/account-sync';
import { LEGACY_PROGRESS_STORAGE_KEY, PROGRESS_STORAGE_KEY, type Progress } from '@/lib/progress/model';
import { memoryStorage, ProgressStore, type StorageLike } from '@/lib/progress/store';
import { pendingSize, type PendingChanges, type RemoteRows } from '@/lib/progress/sync';

const T1 = '2026-10-01T10:00:00.000Z';
const NOW = new Date('2026-10-07T00:00:00.000Z');
const USER = 'u1';
const progress = (p: Partial<Progress> = {}): Progress => ({ v: 2, items: {}, topics: {}, start: {}, ...p });
const noRows = (): RemoteRows => ({ items: [], topics: [], starts: [] });

class FakeRemote implements RemoteProgress {
  pulls: (string | null)[] = [];
  pushes: PendingChanges[] = [];
  rows: RemoteRows = noRows();
  failPush = false;
  failPull = false;
  holdPush: Promise<void> | null = null;
  async pull(since: string | null) {
    this.pulls.push(since);
    if (this.failPull) throw new Error('offline');
    return this.rows;
  }
  async push(changes: PendingChanges) {
    if (this.holdPush) await this.holdPush;
    if (this.failPush) throw new Error('offline');
    this.pushes.push(changes);
  }
}

function setup(guest: Progress = progress()) {
  const storage: StorageLike = memoryStorage();
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(guest));
  const store = new ProgressStore(storage);
  const remote = new FakeRemote();
  const sync = new AccountSync({ store, storage, remote, userId: USER, now: () => NOW });
  return { storage, store, remote, sync };
}

const meta = (storage: StorageLike) => JSON.parse(storage.getItem(accountMetaKey(USER))!);

beforeEach(() => {
  vi.useFakeTimers();
  // `toggle` lấy giờ từ `new Date()`; cố định để so được với NOW.
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

describe('AccountSync.start', () => {
  it('merges guest progress into the account on first sign-in, pushes it and empties the guest key', async () => {
    const { storage, store, remote, sync } = setup(progress({ items: { 'd1.1.a': T1 } }));
    await sync.start();
    expect(store.storageKey).toBe(accountProgressKey(USER));
    expect(store.getSnapshot().progress.items).toEqual({ 'd1.1.a': T1 });
    expect(remote.pushes).toHaveLength(1);
    expect(remote.pushes[0].items['d1.1.a']).toEqual({ item_id: 'd1.1.a', completed_at: T1, changed_at: T1 });
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).items).toEqual({});
    expect(pendingSize(meta(storage).pending)).toBe(0);
  });

  it('does not bring v1 guest progress back after sign-out', async () => {
    const storage: StorageLike = memoryStorage();
    storage.setItem(LEGACY_PROGRESS_STORAGE_KEY, JSON.stringify({ v: 1, items: { 'd1.1.old': T1 } }));
    const store = new ProgressStore(storage);
    const sync = new AccountSync({ store, storage, remote: new FakeRemote(), userId: USER, now: () => NOW });
    await sync.start();
    endAccountSession(storage, store, USER, 'signed-out');
    expect(store.storageKey).toBe(PROGRESS_STORAGE_KEY);
    expect(store.getSnapshot().progress.items).toEqual({});
  });

  it('merges locally even when offline, and keeps the rows queued', async () => {
    const { storage, store, remote, sync } = setup(progress({ topics: { 'j5.generics': { s: 'done', at: T1 } } }));
    remote.failPull = true;
    await sync.start();
    expect(store.getSnapshot().progress.topics).toHaveProperty('j5.generics');
    expect(sync.getStatus()).toBe('error');
    expect(Object.keys(meta(storage).pending.topics)).toEqual(['j5.generics']);
  });

  it('leaves the guest key alone when the account copy already exists on this device', async () => {
    const { storage, sync } = setup(progress({ items: { guest: T1 } }));
    storage.setItem(accountMetaKey(USER), JSON.stringify({ v: 1, cursor: null, pending: { items: {}, topics: {}, starts: {} } }));
    await sync.start();
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).items).toEqual({ guest: T1 });
  });

  it('applies pulled rows and pulls again from the cursor minus the overlap', async () => {
    const { store, remote, sync } = setup();
    remote.rows = { ...noRows(), items: [{ item_id: 'x', completed_at: T1, changed_at: T1, synced_at: '2026-10-06T00:00:10+00:00' }] };
    await sync.start();
    expect(store.getSnapshot().progress.items).toEqual({ x: T1 });
    await sync.syncNow();
    expect(remote.pulls).toEqual([null, '2026-10-06T00:00:05.000Z']);
  });
});

describe('AccountSync after start', () => {
  it('queues learner changes and pushes them after a short delay', async () => {
    const { store, remote, sync } = setup();
    await sync.start();
    store.toggle('d1.1.b');
    expect(sync.pendingCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(PUSH_DELAY_MS);
    expect(remote.pushes.at(-1)?.items['d1.1.b']?.completed_at).toBe(NOW.toISOString());
    expect(sync.pendingCount()).toBe(0);
    expect(sync.getStatus()).toBe('synced');
  });

  it('keeps a change made while a push is in flight', async () => {
    const storage: StorageLike = memoryStorage();
    const store = new ProgressStore(storage);
    const remote = new FakeRemote();
    // Không cố định `now`: lần bỏ tích sau phải mang thời điểm mới hơn lần đẩy đang chạy.
    const sync = new AccountSync({ store, storage, remote, userId: USER });
    await sync.start();
    let release!: () => void;
    remote.holdPush = new Promise((resolve) => (release = resolve));
    store.toggle('a');
    await vi.advanceTimersByTimeAsync(PUSH_DELAY_MS);
    vi.setSystemTime(new Date(NOW.getTime() + 1000));
    store.toggle('a');
    release();
    await vi.advanceTimersByTimeAsync(0);
    expect(sync.pendingCount()).toBe(1);
  });

  it('retries after a failed push and keeps the queue meanwhile', async () => {
    const { store, remote, sync } = setup();
    await sync.start();
    remote.failPush = true;
    store.toggle('a');
    await vi.advanceTimersByTimeAsync(PUSH_DELAY_MS);
    expect(sync.getStatus()).toBe('error');
    expect(sync.pendingCount()).toBe(1);
    remote.failPush = false;
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
    expect(sync.pendingCount()).toBe(0);
  });

  it('pushes more than 2,000 rows in several calls', async () => {
    const items: Record<string, string> = {};
    for (let i = 0; i < 2500; i++) items[`d1.1.i${i}`] = T1;
    const { remote, sync } = setup(progress({ items }));
    await sync.start();
    expect(remote.pushes.map(pendingSize)).toEqual([2000, 500]);
  });

  it('stop() ends syncing; signing out removes the account copy', async () => {
    const { storage, store, remote, sync } = setup();
    await sync.start();
    sync.stop();
    store.toggle('a');
    await vi.advanceTimersByTimeAsync(PUSH_DELAY_MS);
    expect(remote.pushes).toHaveLength(0);
    endAccountSession(storage, store, USER, 'signed-out');
    expect(storage.getItem(accountMetaKey(USER))).toBeNull();
    expect(storage.getItem(accountProgressKey(USER))).toBeNull();
    expect(store.storageKey).toBe(PROGRESS_STORAGE_KEY);
  });
});

describe('session ending and early start', () => {
  it('keeps the account copy and queue when the session ends on its own, removes them on sign-out', async () => {
    const { storage, store, remote, sync } = setup();
    await sync.start();
    remote.failPush = true;
    store.toggle('a');
    await vi.advanceTimersByTimeAsync(PUSH_DELAY_MS);
    sync.stop();
    endAccountSession(storage, store, USER, 'expired');
    expect(store.storageKey).toBe(PROGRESS_STORAGE_KEY);
    expect(storage.getItem(accountMetaKey(USER))).not.toBeNull();
    // Đăng nhập lại cùng tài khoản: hàng đợi cũ vẫn được đẩy lên.
    remote.failPush = false;
    const again = new AccountSync({ store, storage, remote, userId: USER, now: () => NOW });
    await again.start();
    expect(remote.pushes.at(-1)?.items.a).toBeDefined();
    again.stop();
    endAccountSession(storage, store, USER, 'signed-out');
    expect(storage.getItem(accountMetaKey(USER))).toBeNull();
    expect(storage.getItem(accountProgressKey(USER))).toBeNull();
    expect(store.storageKey).toBe(PROGRESS_STORAGE_KEY);
  });

  it('opens the account copy at once only when a session is stored and this device already has the copy', () => {
    const storage = memoryStorage();
    expect(initialProgressKey(storage, 'auth')).toBe(PROGRESS_STORAGE_KEY);
    storage.setItem('auth', JSON.stringify({ user: { id: USER } }));
    // Chưa có bản sao: để start() gộp tiến độ khách.
    expect(initialProgressKey(storage, 'auth')).toBe(PROGRESS_STORAGE_KEY);
    storage.setItem(accountMetaKey(USER), JSON.stringify({ v: 1, cursor: null, pending: { items: {}, topics: {}, starts: {} } }));
    expect(initialProgressKey(storage, 'auth')).toBe(accountProgressKey(USER));
    storage.setItem('auth', 'not json');
    expect(initialProgressKey(storage, 'auth')).toBe(PROGRESS_STORAGE_KEY);
  });

  it('queues changes made on the account copy before sync starts', async () => {
    const storage = memoryStorage();
    storage.setItem(accountMetaKey(USER), JSON.stringify({ v: 1, cursor: null, pending: { items: {}, topics: {}, starts: {} } }));
    const store = new ProgressStore(storage, {}, accountProgressKey(USER));
    const release = queueEarlyChanges(store, storage);
    store.toggle('early');
    release();
    const remote = new FakeRemote();
    const sync = new AccountSync({ store, storage, remote, userId: USER, now: () => NOW });
    await sync.start();
    expect(Object.keys(remote.pushes[0].items)).toEqual(['early']);
  });

  it('does not queue early changes on the guest key, nor after release', () => {
    const storage = memoryStorage();
    const guest = new ProgressStore(storage);
    queueEarlyChanges(guest, storage)();
    guest.toggle('g');
    expect(storage.getItem(accountMetaKey(USER))).toBeNull();
    storage.setItem(accountMetaKey(USER), JSON.stringify({ v: 1, cursor: null, pending: { items: {}, topics: {}, starts: {} } }));
    const store = new ProgressStore(storage, {}, accountProgressKey(USER));
    queueEarlyChanges(store, storage)();
    store.toggle('after');
    expect(meta(storage).pending.items).toEqual({});
  });

  it('pushes the valid rows of an imported guest file and drops ids the server would reject', async () => {
    const { remote, sync } = setup(progress({ items: { 'd1.1.ok': T1, 'D1.1.Bad': T1 } }));
    await sync.start();
    expect(Object.keys(remote.pushes[0].items)).toEqual(['d1.1.ok']);
    expect(sync.pendingCount()).toBe(0);
  });
});
