import { describe, expect, it } from 'vitest';
import type { Progress } from '@/lib/progress/model';
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
  toPayload,
  type PendingChanges,
  type RemoteRows,
} from '@/lib/progress/sync';

const T1 = '2026-10-01T10:00:00.000Z';
const T2 = '2026-10-02T10:00:00.000Z';
const T3 = '2026-10-03T10:00:00.000Z';
const NOW = new Date('2026-10-07T00:00:00.000Z');
const progress = (p: Partial<Progress> = {}): Progress => ({ v: 2, items: {}, topics: {}, start: {}, ...p });
const rows = (r: Partial<RemoteRows> = {}): RemoteRows => ({ items: [], topics: [], starts: [], ...r });

describe('diffProgress', () => {
  it('turns ticks, unticks, marks and levels into rows stamped now', () => {
    const before = progress({ items: { a: T1 }, topics: { t1: { s: 'learning', at: T1 } }, start: { java: 'middle' } });
    const after = progress({ items: { b: T2 }, topics: { t2: { s: 'done', at: T2 } }, start: { java: 'senior' } });
    expect(diffProgress(before, after, NOW)).toEqual({
      items: {
        a: { item_id: 'a', completed_at: null, changed_at: NOW.toISOString() },
        b: { item_id: 'b', completed_at: T2, changed_at: NOW.toISOString() },
      },
      topics: {
        t1: { topic_id: 't1', mark: null, changed_at: NOW.toISOString() },
        t2: { topic_id: 't2', mark: 'done', changed_at: T2 },
      },
      starts: { java: { roadmap_id: 'java', level: 'senior', changed_at: NOW.toISOString() } },
    });
  });

  it('returns nothing when nothing changed', () => {
    const same = progress({ items: { a: T1 }, topics: { t: { s: 'done', at: T1 } }, start: { java: 'middle' } });
    expect(pendingSize(diffProgress(same, structuredClone(same), NOW))).toBe(0);
  });

  it('does not read inherited values for keys such as constructor', () => {
    const removed = diffProgress(progress({ items: { constructor: T1 } }), progress(), NOW);
    expect(removed.items.constructor).toEqual({ item_id: 'constructor', completed_at: null, changed_at: NOW.toISOString() });
  });
});

describe('guestRows', () => {
  it('keeps original times; starting levels get time zero so the account wins', () => {
    const rows = guestRows(progress({ items: { a: T1 }, topics: { t: { s: 'skipped', at: T2 } }, start: { java: 'middle' } }));
    expect(rows.items.a).toEqual({ item_id: 'a', completed_at: T1, changed_at: T1 });
    expect(rows.topics.t).toEqual({ topic_id: 't', mark: 'skipped', changed_at: T2 });
    expect(rows.starts.java).toEqual({ roadmap_id: 'java', level: 'middle', changed_at: '1970-01-01T00:00:00.000Z' });
  });
});

describe('pending queue', () => {
  it('keeps the newer row per key', () => {
    const q = addPending(emptyPending(), { ...emptyPending(), items: { a: { item_id: 'a', completed_at: T1, changed_at: T2 } } });
    const older = addPending(q, { ...emptyPending(), items: { a: { item_id: 'a', completed_at: null, changed_at: T1 } } });
    expect(older.items.a.completed_at).toBe(T1);
    const newer = addPending(q, { ...emptyPending(), items: { a: { item_id: 'a', completed_at: null, changed_at: T3 } } });
    expect(newer.items.a.completed_at).toBeNull();
  });

  it('removeSent keeps rows changed again after they were sent', () => {
    const sent: PendingChanges = { ...emptyPending(), items: { a: { item_id: 'a', completed_at: T1, changed_at: T1 }, b: { item_id: 'b', completed_at: T1, changed_at: T1 } } };
    const queue = addPending(sent, { ...emptyPending(), items: { b: { item_id: 'b', completed_at: null, changed_at: T2 } } });
    expect(Object.keys(removeSent(queue, sent).items)).toEqual(['b']);
  });

  it('drops rows the server would reject, so one bad row cannot block syncing', () => {
    const q = addPending(emptyPending(), {
      items: {
        'd1.1.ok': { item_id: 'd1.1.ok', completed_at: T1, changed_at: T1 },
        'D1.1.Bad': { item_id: 'D1.1.Bad', completed_at: T1, changed_at: T1 },
        'd1.1.feb30': { item_id: 'd1.1.feb30', completed_at: '2026-02-30T10:00:00.000Z', changed_at: T1 },
      },
      topics: { 't x': { topic_id: 't x', mark: 'done', changed_at: T1 } },
      starts: { java: { roadmap_id: 'java', level: 'middle', changed_at: 'not a date' } },
    });
    expect(Object.keys(q.items)).toEqual(['d1.1.ok']);
    expect(q.topics).toEqual({});
    expect(q.starts).toEqual({});
  });

  it('validates stored queues', () => {
    expect(isPendingChanges(emptyPending())).toBe(true);
    expect(isPendingChanges({ items: { a: { item_id: 'a', completed_at: null, changed_at: T1 } }, topics: {}, starts: {} })).toBe(true);
    expect(isPendingChanges({ items: { a: { item_id: 'a' } }, topics: {}, starts: {} })).toBe(false);
    expect(isPendingChanges({ items: [] })).toBe(false);
    expect(isPendingChanges(null)).toBe(false);
  });
});

describe('applyRemote', () => {
  it('applies server rows and normalises server timestamps', () => {
    const result = applyRemote(progress({ items: { gone: T1 } }), emptyPending(), rows({
      items: [
        { item_id: 'a', completed_at: '2026-10-01T10:00:00+00:00', changed_at: '2026-10-01T10:00:00+00:00', synced_at: '2026-10-07T04:26:24.242053+00:00' },
        { item_id: 'gone', completed_at: null, changed_at: '2026-10-02T10:00:00+00:00', synced_at: '2026-10-07T04:26:24.242053+00:00' },
      ],
      topics: [{ topic_id: 't', mark: 'done', changed_at: '2026-10-02T10:00:00.5+00:00', synced_at: '2026-10-07T04:26:24.242053+00:00' }],
      starts: [{ roadmap_id: 'java', level: 'middle', changed_at: T1, synced_at: '2026-10-07T04:26:24.242053+00:00' }],
    }));
    expect(result.progress).toEqual(progress({
      items: { a: T1 },
      topics: { t: { s: 'done', at: '2026-10-02T10:00:00.500Z' } },
      start: { java: 'middle' },
    }));
  });

  it('keeps a pending local change that is newer, drops one that is older', () => {
    const pending: PendingChanges = {
      ...emptyPending(),
      items: {
        newer: { item_id: 'newer', completed_at: T3, changed_at: T3 },
        older: { item_id: 'older', completed_at: T1, changed_at: T1 },
      },
    };
    const local = progress({ items: { newer: T3, older: T1 } });
    const result = applyRemote(local, pending, rows({
      items: [
        { item_id: 'newer', completed_at: null, changed_at: '2026-10-02T10:00:00+00:00', synced_at: T3 },
        { item_id: 'older', completed_at: null, changed_at: '2026-10-02T10:00:00+00:00', synced_at: T3 },
      ],
    }));
    expect(result.progress.items).toEqual({ newer: T3 });
    expect(Object.keys(result.pending.items)).toEqual(['newer']);
  });

  it('resolves replaced ids and keeps the newest row for each target', () => {
    const map = { 'old.t': 'new.t' };
    const untickedLater = applyRemote(progress(), emptyPending(), rows({
      topics: [
        { topic_id: 'old.t', mark: 'done', changed_at: T1, synced_at: T3 },
        { topic_id: 'new.t', mark: null, changed_at: T2, synced_at: T3 },
      ],
    }), map);
    expect(untickedLater.progress.topics).toEqual({});

    const markedLater = applyRemote(progress(), emptyPending(), rows({
      topics: [
        { topic_id: 'new.t', mark: null, changed_at: T2, synced_at: T3 },
        { topic_id: 'old.t', mark: 'done', changed_at: T3, synced_at: T3 },
      ],
    }), map);
    expect(markedLater.progress.topics).toEqual({ 'new.t': { s: 'done', at: T3 } });
  });

  it('keeps a newer pending change on the new id against rows for the old id', () => {
    const pending: PendingChanges = {
      ...emptyPending(),
      topics: { 'new.t': { topic_id: 'new.t', mark: 'learning', changed_at: T3 } },
    };
    const result = applyRemote(progress({ topics: { 'new.t': { s: 'learning', at: T3 } } }), pending, rows({
      topics: [{ topic_id: 'old.t', mark: 'done', changed_at: T2, synced_at: T3 }],
    }), { 'old.t': 'new.t' });
    expect(result.progress.topics).toEqual({ 'new.t': { s: 'learning', at: T3 } });
    expect(Object.keys(result.pending.topics)).toEqual(['new.t']);
  });
});

describe('cursor, chunks, payload', () => {
  it('moves the cursor to the latest synced_at by time, not by string', () => {
    const r = rows({
      items: [{ item_id: 'a', completed_at: null, changed_at: T1, synced_at: '2026-10-07T04:26:24.9+00:00' }],
      topics: [{ topic_id: 't', mark: null, changed_at: T1, synced_at: '2026-10-07T04:26:24.242053+00:00' }],
    });
    expect(nextCursor(null, r)).toBe('2026-10-07T04:26:24.9+00:00');
    expect(nextCursor('2026-10-08T00:00:00+00:00', r)).toBe('2026-10-08T00:00:00+00:00');
    expect(nextCursor(T1, rows())).toBe(T1);
  });

  it('splits a large queue into chunks of at most max rows', () => {
    const p = emptyPending();
    for (let i = 0; i < 5; i++) p.items[`i${i}`] = { item_id: `i${i}`, completed_at: T1, changed_at: T1 };
    p.topics.t = { topic_id: 't', mark: 'done', changed_at: T1 };
    const chunks = chunkPending(p, 4);
    expect(chunks.map(pendingSize)).toEqual([4, 2]);
    expect(chunkPending(emptyPending())).toEqual([]);
  });

  it('builds the RPC payload', () => {
    const p: PendingChanges = { ...emptyPending(), starts: { java: { roadmap_id: 'java', level: null, changed_at: T1 } } };
    expect(toPayload(p)).toEqual({ p_items: [], p_topics: [], p_starts: [{ roadmap_id: 'java', level: null, changed_at: T1 }] });
  });
});
