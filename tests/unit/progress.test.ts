import { describe, expect, it, vi } from 'vitest';
import {
  applyReplacements,
  emptyProgress,
  isProgress,
  LEGACY_PROGRESS_STORAGE_KEY,
  mergeProgress,
  parseProgress,
  PROGRESS_STORAGE_KEY,
  setStart,
  setTopicMark,
  tally,
  toggleItem,
  type Progress,
} from '@/lib/progress/model';
import { memoryStorage, ProgressStore, type StorageLike } from '@/lib/progress/store';

const T1 = '2026-10-01T00:00:00.000Z';
const T2 = '2026-10-02T00:00:00.000Z';
const T3 = '2026-10-03T00:00:00.000Z';
const progress = (p: Partial<Progress> = {}): Progress => ({ v: 2, items: {}, topics: {}, start: {}, ...p });

describe('progress model v2', () => {
  it('validates the stored shape', () => {
    expect(
      isProgress(progress({ items: { 'd1.1.a': T1 }, topics: { 'j5.generics': { s: 'learning', at: T1 } }, start: { java: 'middle' } })),
    ).toBe(true);
    expect(isProgress({ v: 1, items: {} })).toBe(false);
    expect(isProgress(progress({ items: { a: 'yesterday' } }))).toBe(false);
    expect(isProgress({ ...progress(), topics: { a: { s: 'maybe', at: T1 } } })).toBe(false);
    expect(isProgress({ ...progress(), start: { java: 'expert' } })).toBe(false);
    expect(isProgress({ ...progress(), items: [] })).toBe(false);
    expect(isProgress(null)).toBe(false);
  });

  it('upgrades v1 data and applies replacements', () => {
    expect(parseProgress({ v: 1, items: { old: T1 } }, { old: 'new' })).toEqual(progress({ items: { new: T1 } }));
  });

  it('rejects invalid data', () => {
    expect(parseProgress({ foo: 1 })).toBeNull();
    expect(parseProgress({ v: 9, items: {} })).toBeNull();
  });

  it('toggles an item on and off and keeps topics', () => {
    const base = progress({ topics: { 'j1.a': { s: 'done', at: T1 } } });
    const on = toggleItem(base, 'd1.1.a', new Date(T2));
    expect(on.items['d1.1.a']).toBe(T2);
    expect(on.topics).toEqual(base.topics);
    expect(toggleItem(on, 'd1.1.a').items).toEqual({});
  });

  it('sets and clears a topic mark', () => {
    const marked = setTopicMark(progress(), 'j5.generics', 'done', new Date(T2));
    expect(marked.topics['j5.generics']).toEqual({ s: 'done', at: T2 });
    expect(setTopicMark(marked, 'j5.generics', null).topics).toEqual({});
  });

  it('sets and clears the starting level', () => {
    const started = setStart(progress(), 'java', 'middle');
    expect(started.start).toEqual({ java: 'middle' });
    expect(setStart(started, 'java', null).start).toEqual({});
  });

  it('merges items by earliest, topics by latest, start by the current value', () => {
    const a = progress({ items: { x: T2 }, topics: { t: { s: 'learning', at: T1 } }, start: { java: 'middle' } });
    const b = progress({
      items: { x: T1, y: T3 },
      topics: { t: { s: 'done', at: T2 }, u: { s: 'skipped', at: T1 } },
      start: { java: 'senior', devops: 'middle' },
    });
    expect(mergeProgress(a, b)).toEqual(
      progress({
        items: { x: T1, y: T3 },
        topics: { t: { s: 'done', at: T2 }, u: { s: 'skipped', at: T1 } },
        start: { java: 'middle', devops: 'middle' },
      }),
    );
  });

  it('maps retired item and topic ids, following chains', () => {
    const old = progress({ items: { a: T2, c: T1 }, topics: { 'j1.old': { s: 'done', at: T1 } } });
    const mapped = applyReplacements(old, { a: 'b', b: 'c', 'j1.old': 'j1.new' });
    expect(mapped.items).toEqual({ c: T1 });
    expect(mapped.topics).toEqual({ 'j1.new': { s: 'done', at: T1 } });
  });

  it('drops __proto__ keys from imported data without touching prototypes', () => {
    const raw = JSON.parse(`{"v":2,"items":{"a":"${T1}"},"topics":{"__proto__":{"s":"done","at":"${T1}"},"j1.a":{"s":"done","at":"${T1}"}},"start":{}}`);
    const parsed = parseProgress(raw)!;
    expect(Object.getPrototypeOf(parsed.topics)).toBe(Object.prototype);
    expect(Object.keys(parsed.topics)).toEqual(['j1.a']);
  });

  it('survives replacement cycles', () => {
    expect(Object.keys(applyReplacements(progress({ items: { a: T1 } }), { a: 'b', b: 'a' }).items)).toHaveLength(1);
  });

  it('tallies items', () => {
    expect(tally(progress({ items: { 'a.1': T1 } }), ['a.1', 'a.2'])).toEqual({ done: 1, total: 2 });
  });
});

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

describe('ProgressStore', () => {
  it('persists toggles and notifies listeners', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);
    store.toggle('d1.1.a');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).items).toHaveProperty('d1.1.a');
    expect(new ProgressStore(storage).getSnapshot().progress.items).toHaveProperty('d1.1.a');
  });

  it('migrates the v1 key once and keeps it', () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_PROGRESS_STORAGE_KEY, JSON.stringify({ v: 1, items: { 'd1.1.old': T1 } }));
    const store = new ProgressStore(storage, { 'd1.1.old': 'd1.1.new' });
    expect(store.getSnapshot().progress.items).toEqual({ 'd1.1.new': T1 });
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).v).toBe(2);
    expect(storage.getItem(LEGACY_PROGRESS_STORAGE_KEY)).not.toBeNull();
  });

  it('stores topic marks and the starting level', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage);
    store.setTopic('j5.generics', 'learning');
    store.setStart('java', 'middle');
    const saved = new ProgressStore(storage).getSnapshot().progress;
    expect(saved.topics['j5.generics'].s).toBe('learning');
    expect(saved.start).toEqual({ java: 'middle' });
    store.setTopic('j5.generics', null);
    expect(store.getSnapshot().progress.topics).toEqual({});
  });

  it('falls back to memory when storage is unavailable', () => {
    const store = new ProgressStore(null);
    store.toggle('d1.1.a');
    store.setTopic('j1.a', 'done');
    expect(store.getSnapshot()).toMatchObject({ persistent: false, progress: { items: { 'd1.1.a': expect.any(String) } } });
    expect(store.getSnapshot().progress.topics['j1.a'].s).toBe('done');
  });

  it('reports non-persistent when writes throw', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {},
    };
    const store = new ProgressStore(storage);
    store.toggle('d1.1.a');
    expect(store.getSnapshot().persistent).toBe(false);
  });

  it('keeps migrated v1 progress in memory when writing v2 fails', () => {
    const storage: StorageLike = {
      getItem: (key) => (key === LEGACY_PROGRESS_STORAGE_KEY ? JSON.stringify({ v: 1, items: { 'd1.1.a': T1 } }) : null),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {},
    };
    expect(new ProgressStore(storage).getSnapshot()).toEqual({ progress: progress({ items: { 'd1.1.a': T1 } }), persistent: false });
  });

  it('does not migrate v1 again once v2 exists', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress({ items: { b: T2 } })));
    storage.setItem(LEGACY_PROGRESS_STORAGE_KEY, JSON.stringify({ v: 1, items: { a: T1 } }));
    expect(new ProgressStore(storage).getSnapshot().progress.items).toEqual({ b: T2 });
  });

  it('ignores corrupted storage', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, '{not json');
    expect(new ProgressStore(storage).getSnapshot().progress).toEqual(emptyProgress());
  });

  it('imports v1 and v2 files by merging', () => {
    const store = new ProgressStore(new MemoryStorage(), { old: 'new' });
    store.toggle('kept');
    store.setTopic('j1.a', 'learning');
    // Trả về số mục và chủ đề có trong file nhập, không phải tổng sau khi gộp.
    expect(store.importData({ v: 1, items: { old: T1 } })).toBe(1);
    expect(store.importData(progress({ topics: { 'j2.b': { s: 'skipped', at: T1 } } }))).toBe(1);
    expect(Object.keys(store.exportData().items).sort()).toEqual(['kept', 'new']);
    expect(store.importData({ v: 9 })).toBeNull();
  });

  it('switches to another storage key without migrating v1 there', () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_PROGRESS_STORAGE_KEY, JSON.stringify({ v: 1, items: { old: T1 } }));
    storage.setItem('acct', JSON.stringify(progress({ items: { mine: T2 } })));
    const store = new ProgressStore(storage);
    store.switchKey('acct');
    expect(store.storageKey).toBe('acct');
    expect(store.getSnapshot().progress.items).toEqual({ mine: T2 });
    store.switchKey('empty-acct');
    expect(store.getSnapshot().progress.items).toEqual({});
    expect(storage.getItem('empty-acct')).toBeNull();
  });

  it('reports learner changes with before and after, but not replacements or reloads', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage);
    const changes: [Progress, Progress][] = [];
    store.onChange((before, after) => changes.push([before, after]));
    store.toggle('a');
    store.setTopic('t', 'done');
    store.setStart('java', 'middle');
    store.importData(progress({ items: { b: T1 } }));
    store.replaceProgress(progress({ items: { c: T1 } }));
    store.reload();
    expect(changes).toHaveLength(4);
    expect(changes[0][0].items).toEqual({});
    expect(Object.keys(changes[0][1].items)).toEqual(['a']);
  });

  it('replaceProgress persists, applies replacements and notifies subscribers', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage, { old: 'new' });
    const listener = vi.fn();
    store.subscribe(listener);
    store.replaceProgress(progress({ items: { old: T1 } }));
    expect(store.getSnapshot().progress.items).toEqual({ new: T1 });
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).items).toEqual({ new: T1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('memoryStorage keeps values in memory', () => {
    const storage = memoryStorage();
    storage.setItem('k', 'v');
    expect(storage.getItem('k')).toBe('v');
    storage.removeItem('k');
    expect(storage.getItem('k')).toBeNull();
  });

  it('reloads when another tab writes', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage);
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress({ items: { x: T1 } })));
    store.reload();
    expect(store.getSnapshot().progress.items).toHaveProperty('x');
  });
});
