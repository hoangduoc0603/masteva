import {
  emptyProgress,
  LEGACY_PROGRESS_STORAGE_KEY,
  mergeProgress,
  parseProgress,
  PROGRESS_STORAGE_KEY,
  type Progress,
} from './model';
import type { ProgressStore, StorageLike } from './store';
import {
  addPending,
  applyRemote,
  chunkPending,
  diffProgress,
  emptyPending,
  guestRows,
  isPendingChanges,
  nextCursor,
  pendingSize,
  removeSent,
  type PendingChanges,
  type RemoteRows,
} from './sync';

/**
 * Đồng bộ tiến độ theo tài khoản (spec 2026-10-07 §6). Kho tiến độ chuyển sang bản sao của tài khoản;
 * thay đổi của người học vào hàng đợi lưu trên máy rồi được đẩy lên, thay đổi từ máy khác được kéo về theo con trỏ.
 * Không phụ thuộc Supabase: phần mạng nằm sau `RemoteProgress`.
 */
export interface RemoteProgress {
  /** Mọi dòng có `synced_at` sau `since` (null là tất cả). */
  pull(since: string | null): Promise<RemoteRows>;
  push(changes: PendingChanges): Promise<void>;
}

export const accountProgressKey = (userId: string): string => `masteva:account:${userId}:progress`;
export const accountMetaKey = (userId: string): string => `masteva:account:${userId}:sync`;

/** Lấy trùng vài giây khi kéo về, phòng giao dịch ghi xong muộn hơn thời điểm `now()` của nó. */
export const PULL_OVERLAP_MS = 5000;
export const PUSH_DELAY_MS = 1500;
export const RETRY_DELAY_MS = 30_000;

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

type Meta = { v: 1; cursor: string | null; pending: PendingChanges };

export interface AccountSyncOptions {
  store: ProgressStore;
  storage: StorageLike;
  remote: RemoteProgress;
  userId: string;
  now?: () => Date;
}

const ACCOUNT_PROGRESS_KEY = /^masteva:account:(.+):progress$/;

function readMeta(storage: StorageLike, userId: string): Meta | null {
  try {
    const raw = storage.getItem(accountMetaKey(userId));
    if (!raw) return null;
    const meta: unknown = JSON.parse(raw);
    if (
      typeof meta === 'object' && meta !== null && 'v' in meta && meta.v === 1 &&
      'cursor' in meta && (meta.cursor === null || typeof meta.cursor === 'string') &&
      'pending' in meta && isPendingChanges(meta.pending)
    ) {
      return { v: 1, cursor: meta.cursor, pending: meta.pending };
    }
    return null;
  } catch {
    return null;
  }
}

function saveMeta(storage: StorageLike, userId: string, meta: Meta): void {
  try {
    storage.setItem(accountMetaKey(userId), JSON.stringify(meta));
  } catch {
    // Hết quota: kho tiến độ đã báo `persistent = false`; lần sau sẽ đồng bộ lại từ server.
  }
}

/**
 * Khoá mở kho lúc tải trang. Đã có phiên và máy đã có bản sao của tài khoản đó thì mở ngay bản sao,
 * không chờ supabase-js tải xong (tránh nháy tiến độ rỗng và tích nhầm vào khoá khách).
 * Chưa có bản sao thì mở tiến độ khách để `start()` gộp vào tài khoản.
 */
export function initialProgressKey(storage: StorageLike, authKey: string): string {
  try {
    const raw = storage.getItem(authKey);
    const session: unknown = raw ? JSON.parse(raw) : null;
    const user = typeof session === 'object' && session !== null && 'user' in session ? session.user : null;
    const id = typeof user === 'object' && user !== null && 'id' in user && typeof user.id === 'string' ? user.id : null;
    if (id && storage.getItem(accountMetaKey(id)) !== null) return accountProgressKey(id);
  } catch {
    // Phiên lưu hỏng: mở tiến độ khách.
  }
  return PROGRESS_STORAGE_KEY;
}

/**
 * Xếp hàng thay đổi trên bản sao của tài khoản trong lúc chưa có `AccountSync` (supabase-js đang tải).
 * Trả về hàm nhả; gọi ngay trước `start()`.
 */
export function queueEarlyChanges(store: ProgressStore, storage: StorageLike): () => void {
  const userId = ACCOUNT_PROGRESS_KEY.exec(store.storageKey)?.[1];
  if (!userId) return () => {};
  return store.onChange((before, after) => {
    const meta = readMeta(storage, userId);
    if (meta) saveMeta(storage, userId, { ...meta, pending: addPending(meta.pending, diffProgress(before, after)) });
  });
}

function readGuest(storage: StorageLike): Progress {
  for (const key of [PROGRESS_STORAGE_KEY, LEGACY_PROGRESS_STORAGE_KEY]) {
    try {
      const raw = storage.getItem(key);
      if (raw) return parseProgress(JSON.parse(raw)) ?? emptyProgress();
    } catch {
      return emptyProgress();
    }
  }
  return emptyProgress();
}

export class AccountSync {
  private status: SyncStatus = 'idle';
  private readonly statusListeners = new Set<() => void>();
  private chain: Promise<void> = Promise.resolve();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private unsubscribe: (() => void) | undefined;
  private stopped = false;

  constructor(private readonly options: AccountSyncOptions) {}

  getStatus = (): SyncStatus => this.status;

  subscribeStatus = (listener: () => void): (() => void) => {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  };

  pendingCount(): number {
    return pendingSize(this.readMeta()?.pending ?? emptyPending());
  }

  /**
   * Chuyển kho sang bản sao của tài khoản rồi đồng bộ. Chưa có bản sao trên máy (lần đầu đăng nhập,
   * hoặc sau khi đăng xuất) thì gộp tiến độ khách vào tài khoản ngay trên máy, xếp hàng để đẩy lên,
   * và ghi bản rỗng vào khoá khách (để khoá v1 không được chuyển lại). Không chờ mạng mới gộp.
   */
  async start(): Promise<void> {
    const { store, storage, userId } = this.options;
    let meta = this.readMeta();
    store.switchKey(accountProgressKey(userId));
    if (!meta) {
      const guest = readGuest(storage);
      const current = store.getSnapshot().progress;
      store.replaceProgress(mergeProgress(current, guest));
      meta = { v: 1, cursor: null, pending: addPending(emptyPending(), guestRows(guest)) };
      this.saveMeta(meta);
      storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(emptyProgress()));
    }
    this.unsubscribe = store.onChange((before, after) => this.enqueue(diffProgress(before, after, this.now())));
    await this.syncNow();
  }

  /** Kéo về rồi đẩy lên. Gọi khi mở trang, khi tab hiện lại, khi có mạng lại. */
  syncNow(): Promise<void> {
    return this.run(async () => {
      await this.pull();
      await this.push();
    });
  }

  stop(): void {
    this.stopped = true;
    clearTimeout(this.timer);
    this.unsubscribe?.();
  }

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }

  private enqueue(changes: PendingChanges): void {
    if (pendingSize(changes) === 0) return;
    const meta = this.readMeta() ?? { v: 1, cursor: null, pending: emptyPending() };
    this.saveMeta({ ...meta, pending: addPending(meta.pending, changes) });
    this.schedule(PUSH_DELAY_MS, () => this.run(() => this.push()));
  }

  private async pull(): Promise<void> {
    const before = this.readMeta();
    const since = before?.cursor ? new Date(Date.parse(before.cursor) - PULL_OVERLAP_MS).toISOString() : null;
    const rows = await this.options.remote.pull(since);
    if (this.stopped) return;
    // Đọc lại: trong lúc chờ mạng người học có thể đã tích thêm.
    const meta = this.readMeta() ?? { v: 1, cursor: null, pending: emptyPending() };
    const { progress, pending } = applyRemote(this.options.store.getSnapshot().progress, meta.pending, rows);
    this.options.store.replaceProgress(progress);
    this.saveMeta({ ...meta, cursor: nextCursor(meta.cursor, rows), pending });
  }

  private async push(): Promise<void> {
    for (const batch of chunkPending(this.readMeta()?.pending ?? emptyPending())) {
      await this.options.remote.push(batch);
      if (this.stopped) return;
      const meta = this.readMeta();
      if (meta) this.saveMeta({ ...meta, pending: removeSent(meta.pending, batch) });
    }
  }

  /** Chạy lần lượt, không chồng lên nhau; lỗi mạng thì báo `error` và hẹn thử lại. */
  private run(task: () => Promise<void>): Promise<void> {
    const next = this.chain.then(async () => {
      if (this.stopped) return;
      this.setStatus('syncing');
      try {
        await task();
        if (!this.stopped) this.setStatus('synced');
      } catch {
        if (this.stopped) return;
        this.setStatus('error');
        this.schedule(RETRY_DELAY_MS, () => this.syncNow());
      }
    });
    this.chain = next;
    return next;
  }

  private schedule(delay: number, task: () => Promise<void>): void {
    if (this.stopped) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void task(), delay);
  }

  private setStatus(status: SyncStatus): void {
    if (status === this.status) return;
    this.status = status;
    for (const listener of this.statusListeners) listener();
  }

  private readMeta(): Meta | null {
    return readMeta(this.options.storage, this.options.userId);
  }

  private saveMeta(meta: Meta): void {
    saveMeta(this.options.storage, this.options.userId, meta);
  }
}

/**
 * Phiên kết thúc; kho quay về tiến độ khách. Người học đăng xuất hoặc xoá tài khoản (`signed-out`):
 * xoá bản sao của tài khoản. Phiên tự kết thúc (`expired`, ví dụ làm mới token thất bại): giữ bản sao
 * và hàng đợi, lần đăng nhập lại cùng tài khoản sẽ đẩy lên.
 */
export function endAccountSession(
  storage: StorageLike,
  store: ProgressStore,
  userId: string,
  reason: 'signed-out' | 'expired',
): void {
  if (reason === 'signed-out') {
    storage.removeItem(accountProgressKey(userId));
    storage.removeItem(accountMetaKey(userId));
  }
  store.switchKey(PROGRESS_STORAGE_KEY);
}
