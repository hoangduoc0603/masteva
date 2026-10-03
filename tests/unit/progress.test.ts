import { describe, expect, it, vi } from 'vitest';
import {
  applyReplacements,
  emptyProgress,
  firstIncomplete,
  isProgress,
  mergeProgress,
  parseProgress,
  PROGRESS_STORAGE_KEY,
  tally,
  toggleItem,
  type Progress,
} from '@/lib/progress/model';
import { ProgressStore, type StorageLike } from '@/lib/progress/store';

const at = (iso: string) => iso;
const progress = (items: Record<string, string>): Progress => ({ v: 1, items });

describe('progress model', () => {
  it('validates the stored shape', () => {
    expect(isProgress(progress({ 'd1.1.a': at('2026-10-01T00:00:00.000Z') }))).toBe(true);
    expect(isProgress({ v: 2, items: {} })).toBe(false);
    expect(isProgress({ v: 1, items: { 'd1.1.a': 'yesterday' } })).toBe(false);
    expect(isProgress({ v: 1, items: [] })).toBe(false);
    expect(isProgress(null)).toBe(false);
  });

  it('toggles an item on and off', () => {
    const on = toggleItem(emptyProgress(), 'd1.1.a', new Date('2026-10-01T00:00:00Z'));
    expect(on.items['d1.1.a']).toBe('2026-10-01T00:00:00.000Z');
    expect(toggleItem(on, 'd1.1.a').items).toEqual({});
  });

  it('merges by union and keeps the earliest timestamp', () => {
    const a = progress({ x: at('2026-10-02T00:00:00.000Z'), y: at('2026-10-01T00:00:00.000Z') });
    const b = progress({ x: at('2026-10-01T00:00:00.000Z'), z: at('2026-10-03T00:00:00.000Z') });
    expect(mergeProgress(a, b).items).toEqual({
      x: '2026-10-01T00:00:00.000Z',
      y: '2026-10-01T00:00:00.000Z',
      z: '2026-10-03T00:00:00.000Z',
    });
  });

  it('maps retired ids to their replacements, following chains', () => {
    const old = progress({ a: at('2026-10-02T00:00:00.000Z'), c: at('2026-10-01T00:00:00.000Z') });
    expect(applyReplacements(old, { a: 'b', b: 'c' }).items).toEqual({ c: '2026-10-01T00:00:00.000Z' });
  });

  it('survives replacement cycles', () => {
    const old = progress({ a: at('2026-10-01T00:00:00.000Z') });
    expect(Object.keys(applyReplacements(old, { a: 'b', b: 'a' }).items)).toHaveLength(1);
  });

  it('rejects invalid import data', () => {
    expect(parseProgress({ foo: 1 })).toBeNull();
  });

  it('tallies and finds the first incomplete entry', () => {
    const p = progress({ 'a.1': at('2026-10-01T00:00:00.000Z') });
    expect(tally(p, ['a.1', 'a.2'])).toEqual({ done: 1, total: 2 });
    const lessons = [
      { id: 'a', items: ['a.1'] },
      { id: 'empty', items: [] },
      { id: 'b', items: ['b.1'] },
    ];
    expect(firstIncomplete(p, lessons, (l) => l.items)?.id).toBe('b');
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

  it('falls back to memory when storage is unavailable', () => {
    const store = new ProgressStore(null);
    store.toggle('d1.1.a');
    expect(store.getSnapshot()).toMatchObject({ persistent: false, progress: { items: { 'd1.1.a': expect.any(String) } } });
  });

  it('reports non-persistent when writes throw', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    const store = new ProgressStore(storage);
    store.toggle('d1.1.a');
    expect(store.getSnapshot().persistent).toBe(false);
  });

  it('ignores corrupted storage', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, '{not json');
    const store = new ProgressStore(storage);
    expect(store.getSnapshot().progress.items).toEqual({});
  });

  it('imports by merging and applies replacements', () => {
    const store = new ProgressStore(new MemoryStorage(), { old: 'new' });
    store.toggle('kept');
    const count = store.importData({ v: 1, items: { old: '2026-10-01T00:00:00.000Z' } });
    expect(count).toBe(2);
    expect(Object.keys(store.exportData().items).sort()).toEqual(['kept', 'new']);
    expect(store.importData({ v: 9 })).toBeNull();
  });

  it('reloads when another tab writes', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage);
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress({ x: '2026-10-01T00:00:00.000Z' })));
    store.reload();
    expect(store.getSnapshot().progress.items).toHaveProperty('x');
  });
});
