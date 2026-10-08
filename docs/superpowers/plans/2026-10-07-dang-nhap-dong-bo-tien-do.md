# Đăng nhập Google và đồng bộ tiến độ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (project `CLAUDE.md` không cho dùng subagent-driven-development nếu người dùng chưa yêu cầu). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người học đăng nhập bằng Google thì tiến độ lưu theo tài khoản và đồng bộ giữa các máy; không đăng nhập thì mọi thứ như cũ.

**Architecture:** Site vẫn là static export. Trình duyệt gọi thẳng Supabase (Auth PKCE + REST + RPC `sync_progress`) bằng khoá publishable, quyền do RLS. `ProgressStore` hiện có giữ vai trò bộ nhớ tại máy: khách dùng khoá `masteva:progress:v2`, người đã đăng nhập dùng bản sao `masteva:account:<user_id>:progress`. Lớp `AccountSync` (logic thuần, test được trong Node) theo dõi thay đổi của store, xếp vào hàng đợi, đẩy lên và kéo về theo con trỏ `synced_at`. `supabase-js` chỉ được tải bằng `import()` khi bấm đăng nhập hoặc khi máy đã có phiên.

**Tech Stack:** Next.js 16 static export, Fumadocs UI, React 19, TypeScript strict, Vitest, Playwright, `@supabase/supabase-js` 2.117.2, Supabase CLI 2.120.0 (local).

**Spec:** [docs/superpowers/specs/2026-10-07-tai-khoan-dong-bo-tien-do-design.md](../specs/2026-10-07-tai-khoan-dong-bo-tien-do-design.md). Database: `supabase/migrations/20261007041618_learning_progress.sql`.

## Global Constraints

- Không thêm route động, middleware, server action; mọi thứ chạy lúc build hoặc trên trình duyệt (`CLAUDE.md`).
- Component phía trình duyệt không import Zod, `src/lib/content/repo.ts`, `manifest.ts`.
- Khách không tải `supabase-js` và không gửi request nào tới Supabase.
- Trình duyệt chỉ dùng khoá `sb_publishable_…` (biến `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`); không có khoá secret trong code, `.env.example`, Git, log.
- Thiếu `NEXT_PUBLIC_SUPABASE_URL` hoặc `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` lúc build thì tính năng tài khoản ẩn hoàn toàn (site chạy như hiện tại).
- Chỉ đăng nhập Google. Đăng xuất xoá bản sao của tài khoản; lần đầu đăng nhập trên máy tự gộp tiến độ khách rồi xoá tiến độ khách.
- Tích một mục phản hồi < 100 ms: ghi máy trước, mạng sau.
- TDD cho `src/lib/progress` (quy ước project). Không TDD cho giao diện.
- Không dùng `any`, `@ts-ignore`, tắt lint. Pin phiên bản `@supabase/supabase-js` chính xác (`--save-exact`).
- Không commit trong lúc làm; chỉ commit khi người dùng yêu cầu (`CLAUDE.md` gốc). Các bước "Commit" của skill được thay bằng chạy kiểm tra.
- **Khác spec §6 (chính xác hơn):** gộp tiến độ khách theo thời điểm gốc thay vì lấy hợp tuyệt đối. Mục và chủ đề của khách được xếp hàng với thời điểm gốc, nên thao tác mới hơn trên tài khoản (ví dụ bỏ tích ở máy khác) vẫn thắng; cấp bắt đầu của khách có thời điểm 0, nên tài khoản đã có cấp bắt đầu thì giữ của tài khoản. Task 9 cập nhật spec.

## Review Focus

- Server trả thời gian dạng `2026-10-07T04:26:24.242053+00:00` (đã thử với REST local), trình duyệt lưu dạng `…Z`: so sánh phải theo thời điểm, không theo chuỗi; giá trị lưu vào `Progress` phải chuẩn hoá về `toISOString()` (Task 1).
- Hơn 1.000 dòng khi kéo về (`max_rows` của PostgREST) phải phân trang; hơn 2.000 dòng chờ đẩy phải chia lô (giới hạn của `sync_progress`) (Task 1, Task 3, Task 4).
- Người học tích tiếp trong lúc một lần đẩy đang chạy: thao tác mới không được bị xoá khỏi hàng đợi khi lần đẩy cũ trả về (Task 3).
- Sau lần đăng nhập đầu và đăng xuất, khoá v1 `masteva:progress:v1` không được làm sống lại tiến độ khách đã gộp (Task 3).
- Đăng xuất khi còn thay đổi chưa đồng bộ phải hỏi lại trước khi xoá bản sao (Task 5).

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `src/lib/progress/sync.ts` (mới) | Kiểu dòng đồng bộ, hàng đợi, diff, áp dữ liệu server, chia lô. Thuần, không I/O |
| `src/lib/progress/store.ts` (sửa) | Thêm đổi khoá lưu, `onChange`, `replaceProgress`, `removeItem`, `memoryStorage`, export `browserStorage` |
| `src/lib/progress/account-sync.ts` (mới) | `AccountSync`: bản sao tài khoản, gộp tiến độ khách, hàng đợi lưu trên máy, đẩy/kéo, thử lại |
| `src/lib/account/config.ts` (mới) | Biến môi trường công khai, khoá lưu phiên, `hasStoredSession` |
| `src/lib/account/supabase.ts` (mới) | Tải `supabase-js` khi cần, tạo client PKCE |
| `src/lib/account/database.types.ts` (sinh) | Kiểu TypeScript từ schema local |
| `src/lib/account/remote.ts` (mới) | `RemoteProgress` trên Supabase: kéo phân trang, đẩy qua RPC |
| `src/lib/account/controller.ts` (mới) | Trạng thái tài khoản cho UI, đăng nhập, đăng xuất, xoá tài khoản, nối `AccountSync` |
| `src/lib/account/return-path.ts` (mới) | Kiểm đường dẫn quay lại sau đăng nhập |
| `src/components/account/account-menu.tsx` (mới) | Nút Đăng nhập / menu tài khoản trên header |
| `src/components/account/auth-callback.tsx` (mới) | Xử lý trang callback |
| `src/components/progress/progress-desc.tsx` (mới) | Câu mô tả tiến độ theo trạng thái tài khoản |
| `src/app/[lang]/(home)/auth/callback/page.tsx` (mới) | Trang tĩnh nhận kết quả OAuth |
| `src/app/[lang]/(home)/privacy/page.tsx` (mới) | Chính sách quyền riêng tư |
| `src/app/account.css` (mới) | Kiểu của nút và menu tài khoản |
| `src/lib/layout.shared.tsx`, `messages/vi.json`, `messages/en.json`, `src/app/global.css`, `src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx` (sửa) | Gắn menu, chữ giao diện, CSS, mô tả tiến độ |
| `supabase/config.toml`, `.env.example`, `public/_headers`, `package.json`, `vitest.db.config.ts`, `scripts/test-db.sh` | Cấu hình |
| `tests/unit/progress-sync.test.ts`, `tests/unit/account-sync.test.ts`, `tests/unit/return-path.test.ts`, `tests/unit/progress.test.ts` (sửa), `tests/db/account-remote.test.ts`, `tests/e2e/account.spec.ts` | Kiểm thử |

---

### Task 1: Logic đồng bộ thuần (`sync.ts`)

**Files:**
- Create: `src/lib/progress/sync.ts`
- Test: `tests/unit/progress-sync.test.ts`

**Interfaces:**
- Consumes: `Progress`, `TopicMark` từ `src/lib/progress/model.ts`; `Level` từ `src/lib/content/constants.ts`.
- Produces:
  - `type ItemRow = { item_id: string; completed_at: string | null; changed_at: string }`
  - `type TopicRow = { topic_id: string; mark: TopicMark | null; changed_at: string }`
  - `type StartRow = { roadmap_id: string; level: Level | null; changed_at: string }`
  - `type PendingChanges = { items: Record<string, ItemRow>; topics: Record<string, TopicRow>; starts: Record<string, StartRow> }`
  - `type RemoteRows = { items: (ItemRow & { synced_at: string })[]; topics: (TopicRow & { synced_at: string })[]; starts: (StartRow & { synced_at: string })[] }`
  - `MAX_ROWS_PER_PUSH = 2000`
  - `emptyPending(): PendingChanges`, `pendingSize(p): number`, `isPendingChanges(raw: unknown): raw is PendingChanges`
  - `diffProgress(before: Progress, after: Progress, now?: Date): PendingChanges`
  - `guestRows(progress: Progress): PendingChanges`
  - `addPending(queue, changes): PendingChanges`, `removeSent(queue, sent): PendingChanges`
  - `applyRemote(progress, pending, rows: RemoteRows): { progress: Progress; pending: PendingChanges }`
  - `nextCursor(cursor: string | null, rows: RemoteRows): string | null`
  - `chunkPending(p, max?): PendingChanges[]`, `toPayload(p): { p_items: ItemRow[]; p_topics: TopicRow[]; p_starts: StartRow[] }`

- [ ] **Step 1: Viết test (đỏ)**

```ts
// tests/unit/progress-sync.test.ts
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

  it('ignores inherited keys such as constructor', () => {
    expect(pendingSize(diffProgress(progress(), progress({ items: { constructor: T1 } }), NOW))).toBe(1);
    expect(diffProgress(progress(), progress(), NOW).items).toEqual({});
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
```

- [ ] **Step 2: Chạy test, phải đỏ**

Run: `pnpm exec vitest run tests/unit/progress-sync.test.ts`
Expected: FAIL, `Failed to resolve import "@/lib/progress/sync"`.

- [ ] **Step 3: Viết `sync.ts`**

```ts
// src/lib/progress/sync.ts
import type { Level } from '@/lib/content/constants';
import type { Progress, TopicMark } from './model';

/**
 * Dữ liệu đồng bộ tiến độ với Supabase (spec 2026-10-07 §3, migration learning_progress).
 * Mỗi khoá của `Progress` là một dòng; giá trị null là đã bỏ tích hoặc đã xoá (tombstone).
 * Dùng `type` thay cho `interface` để gán được vào kiểu `Json` của supabase-js.
 */
export type ItemRow = { item_id: string; completed_at: string | null; changed_at: string };
export type TopicRow = { topic_id: string; mark: TopicMark | null; changed_at: string };
export type StartRow = { roadmap_id: string; level: Level | null; changed_at: string };

/** Thay đổi chưa đẩy lên, theo mã: mỗi mã chỉ giữ thao tác mới nhất. */
export type PendingChanges = {
  items: Record<string, ItemRow>;
  topics: Record<string, TopicRow>;
  starts: Record<string, StartRow>;
};

type Synced = { synced_at: string };
/** Dòng kéo về từ server; `synced_at` do server đặt, làm con trỏ. */
export type RemoteRows = {
  items: (ItemRow & Synced)[];
  topics: (TopicRow & Synced)[];
  starts: (StartRow & Synced)[];
};

/** Bằng giới hạn trong hàm `sync_progress`. */
export const MAX_ROWS_PER_PUSH = 2000;

/** Cấp bắt đầu không có thời điểm; bản của khách lấy mốc 0 để tài khoản đã có thì giữ của tài khoản. */
const EPOCH = new Date(0).toISOString();

/** Server trả `+00:00` và micro giây; so theo thời điểm, không so chuỗi. */
const time = (iso: string): number => Date.parse(iso);
const normalize = (iso: string): string => new Date(iso).toISOString();
const own = <T>(record: Record<string, T>, key: string): T | undefined =>
  Object.hasOwn(record, key) ? record[key] : undefined;
const unionKeys = (a: object, b: object): Set<string> => new Set([...Object.keys(a), ...Object.keys(b)]);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function emptyPending(): PendingChanges {
  return { items: {}, topics: {}, starts: {} };
}

export function pendingSize(p: PendingChanges): number {
  return Object.keys(p.items).length + Object.keys(p.topics).length + Object.keys(p.starts).length;
}

/** Kiểm tra hàng đợi đọc từ storage. Viết tay để không kéo Zod xuống trình duyệt. */
export function isPendingChanges(raw: unknown): raw is PendingChanges {
  const rowsOk = (value: unknown) =>
    isRecord(value) && Object.values(value).every((row) => isRecord(row) && typeof row.changed_at === 'string');
  return isRecord(raw) && rowsOk(raw.items) && rowsOk(raw.topics) && rowsOk(raw.starts);
}

/** Thay đổi giữa hai bản tiến độ thành dòng. Chủ đề giữ thời điểm của nó (file nhập có thể mang thời điểm cũ). */
export function diffProgress(before: Progress, after: Progress, now: Date = new Date()): PendingChanges {
  const at = now.toISOString();
  const out = emptyPending();
  for (const id of unionKeys(before.items, after.items)) {
    const value = own(after.items, id) ?? null;
    if (value !== (own(before.items, id) ?? null)) out.items[id] = { item_id: id, completed_at: value, changed_at: at };
  }
  for (const id of unionKeys(before.topics, after.topics)) {
    const entry = own(after.topics, id);
    if (entry?.s !== own(before.topics, id)?.s) {
      out.topics[id] = { topic_id: id, mark: entry?.s ?? null, changed_at: entry ? entry.at : at };
    }
  }
  for (const id of unionKeys(before.start, after.start)) {
    const level = own(after.start, id) ?? null;
    if (level !== (own(before.start, id) ?? null)) out.starts[id] = { roadmap_id: id, level, changed_at: at };
  }
  return out;
}

/** Toàn bộ tiến độ khách thành dòng chờ đẩy, giữ thời điểm gốc để so với dữ liệu trên tài khoản. */
export function guestRows(progress: Progress): PendingChanges {
  const out = emptyPending();
  for (const [id, at] of Object.entries(progress.items)) out.items[id] = { item_id: id, completed_at: at, changed_at: at };
  for (const [id, entry] of Object.entries(progress.topics)) out.topics[id] = { topic_id: id, mark: entry.s, changed_at: entry.at };
  for (const [id, level] of Object.entries(progress.start)) out.starts[id] = { roadmap_id: id, level, changed_at: EPOCH };
  return out;
}

function mergeRows<R extends { changed_at: string }>(queue: Record<string, R>, rows: Record<string, R>): Record<string, R> {
  const out = { ...queue };
  for (const [id, row] of Object.entries(rows)) {
    const current = own(out, id);
    if (!current || time(current.changed_at) <= time(row.changed_at)) out[id] = row;
  }
  return out;
}

export function addPending(queue: PendingChanges, changes: PendingChanges): PendingChanges {
  return {
    items: mergeRows(queue.items, changes.items),
    topics: mergeRows(queue.topics, changes.topics),
    starts: mergeRows(queue.starts, changes.starts),
  };
}

function dropSent<R extends { changed_at: string }>(queue: Record<string, R>, sent: Record<string, R>): Record<string, R> {
  const out = { ...queue };
  for (const [id, row] of Object.entries(sent)) {
    if (own(out, id)?.changed_at === row.changed_at) delete out[id];
  }
  return out;
}

/** Bỏ các dòng đã đẩy lên, trừ dòng đã có thao tác mới hơn trong lúc chờ. */
export function removeSent(queue: PendingChanges, sent: PendingChanges): PendingChanges {
  return {
    items: dropSent(queue.items, sent.items),
    topics: dropSent(queue.topics, sent.topics),
    starts: dropSent(queue.starts, sent.starts),
  };
}

/**
 * Áp dòng từ server lên tiến độ trên máy. Thao tác chưa đẩy lên mà không cũ hơn dòng server thì giữ;
 * cũ hơn thì bỏ khỏi hàng đợi và lấy bản server (bản mới nhất thắng).
 */
export function applyRemote(
  progress: Progress,
  pending: PendingChanges,
  rows: RemoteRows,
): { progress: Progress; pending: PendingChanges } {
  const items = { ...progress.items };
  const topics = { ...progress.topics };
  const start = { ...progress.start };
  const next: PendingChanges = { items: { ...pending.items }, topics: { ...pending.topics }, starts: { ...pending.starts } };
  const localWins = (queue: Record<string, { changed_at: string }>, id: string, changedAt: string): boolean => {
    const local = own(queue, id);
    if (local && time(local.changed_at) >= time(changedAt)) return true;
    delete queue[id];
    return false;
  };

  for (const row of rows.items) {
    if (localWins(next.items, row.item_id, row.changed_at)) continue;
    if (row.completed_at) items[row.item_id] = normalize(row.completed_at);
    else delete items[row.item_id];
  }
  for (const row of rows.topics) {
    if (localWins(next.topics, row.topic_id, row.changed_at)) continue;
    if (row.mark) topics[row.topic_id] = { s: row.mark, at: normalize(row.changed_at) };
    else delete topics[row.topic_id];
  }
  for (const row of rows.starts) {
    if (localWins(next.starts, row.roadmap_id, row.changed_at)) continue;
    if (row.level) start[row.roadmap_id] = row.level;
    else delete start[row.roadmap_id];
  }
  return { progress: { ...progress, items, topics, start }, pending: next };
}

/** Con trỏ mới là `synced_at` muộn nhất (giữ nguyên chuỗi server để lọc chính xác). */
export function nextCursor(cursor: string | null, rows: RemoteRows): string | null {
  let best = cursor;
  for (const row of [...rows.items, ...rows.topics, ...rows.starts]) {
    if (best === null || time(row.synced_at) > time(best)) best = row.synced_at;
  }
  return best;
}

export function chunkPending(p: PendingChanges, max: number = MAX_ROWS_PER_PUSH): PendingChanges[] {
  const chunks: PendingChanges[] = [];
  let current = emptyPending();
  let size = 0;
  const flush = () => {
    if (size > 0) chunks.push(current);
    current = emptyPending();
    size = 0;
  };
  for (const [id, row] of Object.entries(p.items)) {
    if (size === max) flush();
    current.items[id] = row;
    size++;
  }
  for (const [id, row] of Object.entries(p.topics)) {
    if (size === max) flush();
    current.topics[id] = row;
    size++;
  }
  for (const [id, row] of Object.entries(p.starts)) {
    if (size === max) flush();
    current.starts[id] = row;
    size++;
  }
  flush();
  return chunks;
}

/** Tham số của RPC `sync_progress`. */
export function toPayload(p: PendingChanges): { p_items: ItemRow[]; p_topics: TopicRow[]; p_starts: StartRow[] } {
  return { p_items: Object.values(p.items), p_topics: Object.values(p.topics), p_starts: Object.values(p.starts) };
}
```

- [ ] **Step 4: Chạy test, phải xanh**

Run: `pnpm exec vitest run tests/unit/progress-sync.test.ts`
Expected: PASS. Nếu test "ignores inherited keys" đỏ vì `diffProgress(progress(), progress({ items: { constructor: T1 } }))` trả 0, kiểm lại `own()`.

- [ ] **Step 5: Kiểm tra**

Run: `pnpm typecheck && pnpm lint`
Expected: không lỗi.

---

### Task 2: `ProgressStore` đổi được khoá lưu và báo thay đổi

**Files:**
- Modify: `src/lib/progress/store.ts`
- Modify: `tests/unit/progress.test.ts` (lớp `MemoryStorage` cuối file, thêm test trong `describe('ProgressStore')`)

**Interfaces:**
- Consumes: `applyReplacements`, `PROGRESS_STORAGE_KEY` từ `model.ts`.
- Produces:
  - `interface StorageLike { getItem(key): string | null; setItem(key, value): void; removeItem(key): void }`
  - `new ProgressStore(storage, replacements?, key = PROGRESS_STORAGE_KEY)`
  - `store.storageKey: string` (getter), `store.switchKey(key: string): void`
  - `store.onChange(listener: (before: Progress, after: Progress) => void): () => void` — chỉ gọi cho thao tác của người học (`toggle`, `setTopic`, `setStart`, `importData`)
  - `store.replaceProgress(progress: Progress): void` — ghi mà không gọi `onChange`
  - `export function browserStorage(): StorageLike | null`, `export function memoryStorage(): StorageLike`

- [ ] **Step 1: Viết test (đỏ)**

Sửa `MemoryStorage` ở cuối `tests/unit/progress.test.ts`:

```ts
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
```

Thêm vào cuối `describe('ProgressStore', …)`:

```ts
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
```

Thêm `memoryStorage` vào import từ `@/lib/progress/store` và một test:

```ts
  it('memoryStorage keeps values in memory', () => {
    const storage = memoryStorage();
    storage.setItem('k', 'v');
    expect(storage.getItem('k')).toBe('v');
    storage.removeItem('k');
    expect(storage.getItem('k')).toBeNull();
  });
```

- [ ] **Step 2: Chạy test, phải đỏ**

Run: `pnpm exec vitest run tests/unit/progress.test.ts`
Expected: FAIL (`switchKey is not a function`, `memoryStorage` không được export).

- [ ] **Step 3: Sửa `store.ts`**

Thay toàn bộ phần khai báo và lớp (giữ nguyên comment đầu file), các thay đổi chính:

```ts
import {
  applyReplacements,
  emptyProgress,
  LEGACY_PROGRESS_STORAGE_KEY,
  mergeProgress,
  parseProgress,
  PROGRESS_STORAGE_KEY,
  setStart,
  setTopicMark,
  toggleItem,
  type Progress,
  type TopicMark,
} from './model';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type ChangeListener = (before: Progress, after: Progress) => void;

export class ProgressStore {
  private snapshot: ProgressSnapshot;
  private readonly listeners = new Set<Listener>();
  private readonly changeListeners = new Set<ChangeListener>();

  constructor(
    private readonly storage: StorageLike | null,
    private replacements: Readonly<Record<string, string>> = {},
    private key: string = PROGRESS_STORAGE_KEY,
  ) {
    this.snapshot = this.read();
  }

  /** Khoá đang lưu: tiến độ khách, hoặc bản sao của tài khoản khi đã đăng nhập. */
  get storageKey(): string {
    return this.key;
  }

  /** Chuyển sang khoá khác (đăng nhập, đăng xuất) và đọc lại. */
  switchKey(key: string): void {
    this.key = key;
    this.reload();
  }

  /** Báo thay đổi do người học làm, để đồng bộ tài khoản xếp vào hàng đợi. */
  onChange = (listener: ChangeListener): (() => void) => {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  };

  toggle(id: string): void {
    this.update(toggleItem(this.snapshot.progress, id));
  }

  setTopic(id: string, mark: TopicMark | null): void {
    this.update(setTopicMark(this.snapshot.progress, id, mark));
  }

  setStart(roadmapId: string, level: Level | null): void {
    this.update(setStart(this.snapshot.progress, roadmapId, level));
  }

  importData(raw: unknown): number | null {
    const incoming = parseProgress(raw, this.replacements);
    if (!incoming) return null;
    this.update(mergeProgress(this.snapshot.progress, incoming));
    return Object.keys(incoming.items).length + Object.keys(incoming.topics).length;
  }

  /** Ghi bản tiến độ từ server, không coi là thao tác của người học. */
  replaceProgress(progress: Progress): void {
    this.write(applyReplacements(progress, this.replacements));
  }

  private update(next: Progress): void {
    const before = this.snapshot.progress;
    this.write(next);
    for (const listener of this.changeListeners) listener(before, next);
  }
```

Trong `read()`, dùng `this.key` thay cho `PROGRESS_STORAGE_KEY`, và chỉ chuyển v1 khi đang ở khoá khách:

```ts
      const raw = this.storage.getItem(this.key);
      if (raw) return { progress: parseProgress(JSON.parse(raw), this.replacements) ?? emptyProgress(), persistent: true };
      if (this.key !== PROGRESS_STORAGE_KEY) return { progress: emptyProgress(), persistent: true };
      const legacy = this.storage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
```

Trong `write()`, `this.storage.setItem(this.key, …)`. `setReplacements`, `exportData`, `reload`, `emit`, `subscribe`, `getSnapshot` giữ nguyên.

Cuối file:

```ts
export function browserStorage(): StorageLike | null {
  // giữ nguyên thân hàm hiện có, chỉ thêm `export`
}

/** Storage trong bộ nhớ, dùng khi trình duyệt chặn localStorage. */
export function memoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

let shared: ProgressStore | undefined;

export function getProgressStore(): ProgressStore {
  if (!shared) {
    const store = new ProgressStore(browserStorage());
    window.addEventListener('storage', (event) => {
      if (event.key === store.storageKey) store.reload();
    });
    shared = store;
  }
  return shared;
}
```

- [ ] **Step 4: Chạy test, phải xanh**

Run: `pnpm exec vitest run tests/unit/progress.test.ts`
Expected: PASS, gồm các test cũ.

- [ ] **Step 5: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: không lỗi, toàn bộ unit test xanh.

---

### Task 3: `AccountSync` — bản sao tài khoản, gộp lần đầu, đẩy và kéo

**Files:**
- Create: `src/lib/progress/account-sync.ts`
- Test: `tests/unit/account-sync.test.ts`

**Interfaces:**
- Consumes: Task 1 (`addPending`, `applyRemote`, `chunkPending`, `diffProgress`, `emptyPending`, `guestRows`, `isPendingChanges`, `nextCursor`, `pendingSize`, `removeSent`, `PendingChanges`, `RemoteRows`); Task 2 (`ProgressStore`, `StorageLike`); `model.ts` (`emptyProgress`, `mergeProgress`, `parseProgress`, `PROGRESS_STORAGE_KEY`, `LEGACY_PROGRESS_STORAGE_KEY`).
- Produces:
  - `interface RemoteProgress { pull(since: string | null): Promise<RemoteRows>; push(changes: PendingChanges): Promise<void> }`
  - `accountProgressKey(userId): string` → `masteva:account:<id>:progress`; `accountMetaKey(userId): string` → `masteva:account:<id>:sync`
  - `PULL_OVERLAP_MS = 5000`, `PUSH_DELAY_MS = 1500`, `RETRY_DELAY_MS = 30000`
  - `type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'`
  - `class AccountSync { constructor(options: AccountSyncOptions); start(): Promise<void>; syncNow(): Promise<void>; pendingCount(): number; getStatus(): SyncStatus; subscribeStatus(l: () => void): () => void; stop(): void }`
  - `clearAccountData(storage: StorageLike, store: ProgressStore, userId: string): void`

- [ ] **Step 1: Viết test (đỏ)**

```ts
// tests/unit/account-sync.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AccountSync,
  accountMetaKey,
  accountProgressKey,
  clearAccountData,
  PUSH_DELAY_MS,
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
    clearAccountData(storage, store, USER);
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

  it('stop() ends syncing; clearAccountData removes the account copy', async () => {
    const { storage, store, remote, sync } = setup();
    await sync.start();
    sync.stop();
    store.toggle('a');
    await vi.advanceTimersByTimeAsync(PUSH_DELAY_MS);
    expect(remote.pushes).toHaveLength(0);
    clearAccountData(storage, store, USER);
    expect(storage.getItem(accountMetaKey(USER))).toBeNull();
    expect(storage.getItem(accountProgressKey(USER))).toBeNull();
    expect(store.storageKey).toBe(PROGRESS_STORAGE_KEY);
  });
});
```


- [ ] **Step 2: Chạy test, phải đỏ**

Run: `pnpm exec vitest run tests/unit/account-sync.test.ts`
Expected: FAIL, không tìm thấy `@/lib/progress/account-sync`.

- [ ] **Step 3: Viết `account-sync.ts`**

```ts
// src/lib/progress/account-sync.ts
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
      meta = { v: 1, cursor: null, pending: guestRows(guest) };
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
    try {
      const raw = this.options.storage.getItem(accountMetaKey(this.options.userId));
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

  private saveMeta(meta: Meta): void {
    try {
      this.options.storage.setItem(accountMetaKey(this.options.userId), JSON.stringify(meta));
    } catch {
      // Hết quota: kho tiến độ đã báo `persistent = false`; lần sau sẽ đồng bộ lại từ server.
    }
  }
}

/** Đăng xuất hoặc xoá tài khoản: bỏ bản sao của tài khoản, kho quay về tiến độ khách. */
export function clearAccountData(storage: StorageLike, store: ProgressStore, userId: string): void {
  storage.removeItem(accountProgressKey(userId));
  storage.removeItem(accountMetaKey(userId));
  store.switchKey(PROGRESS_STORAGE_KEY);
}
```

- [ ] **Step 4: Chạy test, phải xanh**

Run: `pnpm exec vitest run tests/unit/account-sync.test.ts`
Expected: PASS. Nếu test "applies pulled rows…" đỏ ở con trỏ, kiểm `PULL_OVERLAP_MS` và `Date.parse` với chuỗi `+00:00`.

- [ ] **Step 5: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: không lỗi.

---

### Task 4: Supabase client, adapter và test tích hợp với database local

**Files:**
- Modify: `package.json` (dependency, script `test:db`)
- Create: `src/lib/account/config.ts`, `src/lib/account/supabase.ts`, `src/lib/account/remote.ts`, `src/lib/account/database.types.ts` (sinh), `.env.example`, `vitest.db.config.ts`, `scripts/test-db.sh`, `tests/db/account-remote.test.ts`
- Modify: `supabase/config.toml`

**Interfaces:**
- Consumes: Task 1 (`toPayload`, `RemoteRows`, `PendingChanges`), Task 3 (`RemoteProgress`).
- Produces:
  - `config.ts`: `SUPABASE_URL: string`, `SUPABASE_PUBLISHABLE_KEY: string`, `accountEnabled: boolean`, `AUTH_STORAGE_KEY = 'masteva:auth'`, `hasStoredSession(): boolean`
  - `supabase.ts`: `type MastevaClient = SupabaseClient<Database>`, `loadSupabase(): Promise<MastevaClient>`
  - `remote.ts`: `PAGE_SIZE = 1000`, `supabaseRemote(client: MastevaClient): RemoteProgress`

- [ ] **Step 1: Cài thư viện**

```bash
pnpm add @supabase/supabase-js@2.117.2 --save-exact
```

- [ ] **Step 2: Cấu hình Supabase local**

Trong `supabase/config.toml`, mục `[auth]`:

```toml
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/**", "http://127.0.0.1:3000/**", "http://localhost:4174/**"]
```

Mục `[auth.email]`: `enable_signup = false` (không cho tự đăng ký bằng email; test dùng admin API tạo user).

Thêm cuối file (đã thử: thiếu biến môi trường thì `supabase start` vẫn chạy):

```toml
# Đăng nhập Google. Giá trị đặt trong biến môi trường (hoặc supabase/.env, không commit), không ghi vào file này.
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
skip_nonce_check = false
```

Thêm `.env` vào `supabase/.gitignore`. Tạo `.env.example`:

```bash
# Tài khoản (Supabase). Để trống thì site chạy như cũ, không có đăng nhập.
# Local: lấy từ `supabase status -o env` (API_URL, PUBLISHABLE_KEY). Chỉ dùng khoá sb_publishable_….
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Chỉ cho Supabase local (supabase/.env hoặc shell), không đưa lên trình duyệt.
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=
```

Chạy lại để áp cấu hình:

```bash
supabase stop && supabase start -x realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
```

Expected: in ra `API_URL`, `PUBLISHABLE_KEY`.

- [ ] **Step 3: Sinh kiểu và viết module**

```bash
supabase gen types --local --lang typescript --schema public > src/lib/account/database.types.ts
```

```ts
// src/lib/account/config.ts
/**
 * Cấu hình tài khoản, đọc lúc build từ biến NEXT_PUBLIC_* (Next.js nhúng vào bundle).
 * Thiếu một trong hai thì tính năng tài khoản ẩn hoàn toàn.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const accountEnabled = SUPABASE_URL !== '' && SUPABASE_PUBLISHABLE_KEY !== '';

/** Khoá supabase-js lưu phiên; có khoá này thì mới cần tải supabase-js khi mở trang. */
export const AUTH_STORAGE_KEY = 'masteva:auth';

export function hasStoredSession(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
```

```ts
// src/lib/account/supabase.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { AUTH_STORAGE_KEY, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';
import type { Database } from './database.types';

export type MastevaClient = SupabaseClient<Database>;

let client: Promise<MastevaClient> | undefined;

/**
 * Tải supabase-js khi cần (bấm đăng nhập, hoặc máy đã có phiên), không nằm trong JavaScript ban đầu.
 * PKCE: trang callback nhận `?code=` và supabase-js tự đổi lấy phiên khi khởi tạo (`detectSessionInUrl`).
 */
export function loadSupabase(): Promise<MastevaClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        flowType: 'pkce',
        storageKey: AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }),
  );
  return client;
}
```

```ts
// src/lib/account/remote.ts
import { TOPIC_MARKS, type TopicMark } from '@/lib/progress/model';
import { LEVELS, type Level } from '@/lib/content/constants';
import type { RemoteProgress } from '@/lib/progress/account-sync';
import { toPayload } from '@/lib/progress/sync';
import type { MastevaClient } from './supabase';

/** Bằng `max_rows` của PostgREST (supabase/config.toml); kéo về theo trang để không bị cắt. */
export const PAGE_SIZE = 1000;

type Page<T> = PromiseLike<{ data: T[] | null; error: unknown }>;

async function allPages<T>(page: (from: number, to: number) => Page<T>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

const isMark = (value: string | null): value is TopicMark | null =>
  value === null || (TOPIC_MARKS as readonly string[]).includes(value);
const isLevel = (value: string | null): value is Level | null =>
  value === null || (LEVELS as readonly string[]).includes(value);

/** Tiến độ trên Supabase: kéo ba bảng theo `synced_at` (RLS chỉ trả dòng của người đang đăng nhập), đẩy qua RPC. */
export function supabaseRemote(client: MastevaClient): RemoteProgress {
  return {
    async pull(since) {
      const items = await allPages((from, to) => {
        const query = client.from('progress_items').select('item_id, completed_at, changed_at, synced_at');
        return (since ? query.gt('synced_at', since) : query).order('synced_at').order('item_id').range(from, to);
      });
      const topics = await allPages((from, to) => {
        const query = client.from('topic_marks').select('topic_id, mark, changed_at, synced_at');
        return (since ? query.gt('synced_at', since) : query).order('synced_at').order('topic_id').range(from, to);
      });
      const starts = await allPages((from, to) => {
        const query = client.from('roadmap_starts').select('roadmap_id, level, changed_at, synced_at');
        return (since ? query.gt('synced_at', since) : query).order('synced_at').order('roadmap_id').range(from, to);
      });
      return {
        items,
        topics: topics.flatMap((row) => (isMark(row.mark) ? [{ ...row, mark: row.mark }] : [])),
        starts: starts.flatMap((row) => (isLevel(row.level) ? [{ ...row, level: row.level }] : [])),
      };
    },
    async push(changes) {
      const { error } = await client.rpc('sync_progress', toPayload(changes));
      if (error) throw error;
    },
  };
}
```

`remote.ts` import `@/lib/content/constants` (không kéo Zod) và `model.ts` (đã dùng ở trình duyệt). Nếu `tsc` báo `toPayload(changes)` không gán được vào tham số RPC kiểu `Json`, kiểm lại `ItemRow`/`TopicRow`/`StartRow` là `type` chứ không phải `interface`.

- [ ] **Step 4: Viết test tích hợp (đỏ trước khi có `remote.ts` hoàn chỉnh; nếu viết sau thì chạy để xác nhận)**

```ts
// vitest.db.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

/** Test chạy với Supabase local (`pnpm test:db`), không nằm trong `pnpm test`. */
export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: { include: ['tests/db/**/*.test.ts'], environment: 'node', testTimeout: 30_000 },
});
```

```bash
#!/usr/bin/env bash
# scripts/test-db.sh — test database và adapter Supabase trên Supabase local.
# Cần `supabase start` đang chạy. Khoá lấy từ `supabase status` (khoá mẫu của bản local, không phải bí mật thật).
set -euo pipefail
supabase test db
eval "$(supabase status -o env 2>/dev/null)"
SUPABASE_TEST_URL="$API_URL" \
SUPABASE_TEST_PUBLISHABLE_KEY="$PUBLISHABLE_KEY" \
SUPABASE_TEST_SECRET_KEY="$SECRET_KEY" \
  pnpm exec vitest run --config vitest.db.config.ts
```

`chmod +x scripts/test-db.sh`; trong `package.json` thêm `"test:db": "bash scripts/test-db.sh"`.

```ts
// tests/db/account-remote.test.ts
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, expect, it } from 'vitest';
import type { Database } from '@/lib/account/database.types';
import { supabaseRemote } from '@/lib/account/remote';
import type { MastevaClient } from '@/lib/account/supabase';
import { emptyPending, type PendingChanges } from '@/lib/progress/sync';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu ${name}: chạy bằng \`pnpm test:db\``);
  return value;
}

const url = env('SUPABASE_TEST_URL');
const admin = createClient<Database>(url, env('SUPABASE_TEST_SECRET_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const suffix = `-${Date.now()}@test.local`;

async function signedIn(name: string): Promise<MastevaClient> {
  const email = `${name}${suffix}`;
  const password = 'test-password-123';
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error) throw created.error;
  const client = createClient<Database>(url, env('SUPABASE_TEST_PUBLISHABLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

function items(count: number, prefix: string, at: string): PendingChanges {
  const p = emptyPending();
  for (let i = 0; i < count; i++) p.items[`${prefix}.${i}`] = { item_id: `${prefix}.${i}`, completed_at: at, changed_at: at };
  return p;
}

let a: MastevaClient;
let b: MastevaClient;

beforeAll(async () => {
  a = await signedIn('a');
  b = await signedIn('b');
});

afterAll(async () => {
  const { data } = await admin.auth.admin.listUsers();
  for (const user of data.users.filter((u) => u.email?.endsWith(suffix))) await admin.auth.admin.deleteUser(user.id);
});

it('đẩy lên và kéo về hơn một trang (1.000 dòng)', async () => {
  const remote = supabaseRemote(a);
  await remote.push(items(1500, 'page', '2026-10-01T10:00:00.000Z'));
  const rows = await remote.pull(null);
  expect(rows.items).toHaveLength(1500);
  expect(new Set(rows.items.map((r) => r.item_id)).size).toBe(1500);
});

it('người khác không thấy dòng của A', async () => {
  expect((await supabaseRemote(b).pull(null)).items).toHaveLength(0);
});

it('since chỉ trả dòng ghi sau con trỏ', async () => {
  const remote = supabaseRemote(a);
  const all = await remote.pull(null);
  const cursor = all.items.map((r) => r.synced_at).sort().at(-1) ?? null;
  await remote.push(items(1, 'later', '2026-10-02T10:00:00.000Z'));
  expect((await remote.pull(cursor)).items.map((r) => r.item_id)).toEqual(['later.0']);
});

it('trạng thái chủ đề và cấp bắt đầu đi khứ hồi, kể cả tombstone', async () => {
  const remote = supabaseRemote(a);
  await remote.push({
    items: {},
    topics: { 'j5.generics': { topic_id: 'j5.generics', mark: 'done', changed_at: '2026-10-03T10:00:00.000Z' } },
    starts: { java: { roadmap_id: 'java', level: null, changed_at: '2026-10-03T10:00:00.000Z' } },
  });
  const rows = await remote.pull(null);
  expect(rows.topics.map((r) => [r.topic_id, r.mark])).toEqual([['j5.generics', 'done']]);
  expect(rows.starts.map((r) => [r.roadmap_id, r.level])).toEqual([['java', null]]);
});
```

- [ ] **Step 5: Chạy test**

Run: `pnpm test:db`
Expected: pgTAP 30/30, sau đó 4 test Vitest PASS.

- [ ] **Step 6: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test && supabase db advisors --local`
Expected: không lỗi; advisors "No issues found".

---

### Task 5: Trạng thái tài khoản và menu trên header

**Files:**
- Create: `src/lib/account/controller.ts`, `src/components/account/account-menu.tsx`, `src/components/progress/progress-desc.tsx`, `src/app/account.css`
- Modify: `src/lib/layout.shared.tsx`, `src/app/global.css`, `messages/vi.json`, `messages/en.json`, `src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx:75`

**Interfaces:**
- Consumes: Task 2 (`getProgressStore`, `browserStorage`, `memoryStorage`), Task 3 (`AccountSync`, `clearAccountData`, `SyncStatus`), Task 4 (`accountEnabled`, `hasStoredSession`, `loadSupabase`, `supabaseRemote`).
- Produces (`controller.ts`):
  - `type AccountState = { status: 'disabled' } | { status: 'guest' } | { status: 'loading' } | { status: 'signed-in'; email: string; sync: SyncStatus }`
  - `SERVER_ACCOUNT_STATE: AccountState` (`loading`), `getAccountState(): AccountState`, `subscribeAccount(l): () => void`, `useAccount(): AccountState`
  - `initAccount(): Promise<void>` — gọi được nhiều lần, chạy một lần; xong khi lần đồng bộ đầu đã chạy (thành công hay lỗi)
  - `signIn(lang: string): Promise<void>`, `signOut(options?: { force?: boolean }): Promise<'done' | 'unsynced'>`, `deleteAccount(): Promise<void>`
  - `RETURN_PATH_KEY = 'masteva:auth:return'`

Không TDD (giao diện và lớp nối; logic đã test ở Task 1–4). Kiểm bằng E2E ở Task 8.

- [ ] **Step 1: Chữ giao diện**

Thêm vào `messages/vi.json` khoá `account` và hai khoá trong `progress`:

```json
"account": {
  "signIn": "Đăng nhập",
  "signInTitle": "Đăng nhập bằng Google để lưu tiến độ theo tài khoản",
  "signInFailed": "Không mở được trang đăng nhập. Thử lại sau.",
  "menu": "Tài khoản {email}",
  "signOut": "Đăng xuất",
  "unsyncedConfirm": "Còn thay đổi chưa đồng bộ lên tài khoản. Đăng xuất bây giờ sẽ mất các thay đổi này. Vẫn đăng xuất?",
  "deleteAccount": "Xoá tài khoản",
  "deleteConfirm": "Xoá tài khoản và toàn bộ tiến độ lưu theo tài khoản? Không khôi phục được.",
  "deleteFailed": "Chưa xoá được tài khoản. Thử lại sau.",
  "syncing": "Đang đồng bộ…",
  "synced": "Đã đồng bộ",
  "syncError": "Chưa đồng bộ được, sẽ tự thử lại",
  "privacy": "Quyền riêng tư",
  "callbackTitle": "Đăng nhập",
  "callbackWorking": "Đang đăng nhập và gộp tiến độ…",
  "callbackFailed": "Đăng nhập không thành công.",
  "callbackBack": "Về trang chủ"
},
```

Trong `progress`: `"descSignedIn": "Tiến độ lưu theo tài khoản và đồng bộ giữa các máy. Xuất ra file nếu muốn giữ một bản riêng."`, `"descGuest": "Tiến độ chỉ lưu trong trình duyệt này. Đăng nhập bằng Google để dùng trên nhiều máy, hoặc xuất ra file để chuyển sang máy khác; nhập file sẽ gộp với tiến độ đang có, không ghi đè."`. Giữ `desc` (dùng khi tính năng tài khoản tắt).

`messages/en.json`: cùng khoá, bản tiếng Anh:

```json
"account": {
  "signIn": "Sign in",
  "signInTitle": "Sign in with Google to save progress to your account",
  "signInFailed": "Could not open the sign-in page. Try again later.",
  "menu": "Account {email}",
  "signOut": "Sign out",
  "unsyncedConfirm": "Some changes are not synced to your account yet. Signing out now will lose them. Sign out anyway?",
  "deleteAccount": "Delete account",
  "deleteConfirm": "Delete your account and all progress saved to it? This cannot be undone.",
  "deleteFailed": "Could not delete the account. Try again later.",
  "syncing": "Syncing…",
  "synced": "Synced",
  "syncError": "Not synced yet, will retry",
  "privacy": "Privacy",
  "callbackTitle": "Sign in",
  "callbackWorking": "Signing in and merging progress…",
  "callbackFailed": "Sign-in failed.",
  "callbackBack": "Back to home"
},
```

`progress.descSignedIn`: "Progress is saved to your account and synced across devices. Export a file if you want your own copy." `progress.descGuest`: "Progress is saved in this browser only. Sign in with Google to use it on several devices, or export a file to move it; importing merges with your current progress instead of overwriting it."

- [ ] **Step 2: `controller.ts`**

```ts
// src/lib/account/controller.ts
import { useSyncExternalStore } from 'react';
import type { User } from '@supabase/supabase-js';
import { AccountSync, clearAccountData, type SyncStatus } from '@/lib/progress/account-sync';
import { browserStorage, getProgressStore, memoryStorage, type StorageLike } from '@/lib/progress/store';
import { accountEnabled, hasStoredSession } from './config';
import { supabaseRemote } from './remote';
import { loadSupabase } from './supabase';

/**
 * Trạng thái tài khoản cho giao diện (spec 2026-10-07 §6). Khách chưa có phiên thì không tải supabase-js.
 * Chỉ dùng ở trình duyệt.
 */
export type AccountState =
  | { status: 'disabled' }
  | { status: 'guest' }
  | { status: 'loading' }
  | { status: 'signed-in'; email: string; sync: SyncStatus };

export const SERVER_ACCOUNT_STATE: AccountState = { status: 'loading' };
/** Đường dẫn để quay lại sau khi đăng nhập xong, lưu trong sessionStorage. */
export const RETURN_PATH_KEY = 'masteva:auth:return';

let state: AccountState = SERVER_ACCOUNT_STATE;
const listeners = new Set<() => void>();
let initialized: Promise<void> | undefined;
let sync: AccountSync | undefined;
let userId: string | undefined;
let storage: StorageLike | undefined;

function setState(next: AccountState): void {
  state = next;
  for (const listener of listeners) listener();
}

export const getAccountState = (): AccountState => state;
export const subscribeAccount = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useAccount(): AccountState {
  return useSyncExternalStore(subscribeAccount, getAccountState, () => SERVER_ACCOUNT_STATE);
}

function localStore(): StorageLike {
  storage ??= browserStorage() ?? memoryStorage();
  return storage;
}

function isCallbackWithCode(): boolean {
  return new URLSearchParams(window.location.search).has('code');
}

export function initAccount(): Promise<void> {
  initialized ??= (async () => {
    if (!accountEnabled) return setState({ status: 'disabled' });
    if (!hasStoredSession() && !isCallbackWithCode()) return setState({ status: 'guest' });
    await connect();
  })();
  return initialized;
}

async function connect(): Promise<void> {
  try {
    const client = await loadSupabase();
    client.auth.onAuthStateChange((_event, session) => {
      // Không gọi supabase-js ngay trong callback này (có thể khoá chết); chạy ở lượt sau.
      setTimeout(() => void handleUser(session?.user ?? null), 0);
    });
    // Trên trang callback, bước này đổi `?code=` lấy phiên (PKCE).
    const { data } = await client.auth.getSession();
    await handleUser(data.session?.user ?? null);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void sync?.syncNow();
    });
    window.addEventListener('online', () => void sync?.syncNow());
  } catch {
    setState({ status: 'guest' });
  }
}

async function handleUser(user: User | null): Promise<void> {
  if (user && user.id === userId) return;
  if (userId) stopAndClear();
  if (!user) return setState({ status: 'guest' });
  userId = user.id;
  const client = await loadSupabase();
  const current = new AccountSync({ store: getProgressStore(), storage: localStore(), remote: supabaseRemote(client), userId: user.id });
  sync = current;
  const email = user.email ?? '';
  const publish = () => {
    if (sync === current) setState({ status: 'signed-in', email, sync: current.getStatus() });
  };
  current.subscribeStatus(publish);
  publish();
  await current.start();
}

function stopAndClear(): void {
  sync?.stop();
  if (userId) clearAccountData(localStore(), getProgressStore(), userId);
  sync = undefined;
  userId = undefined;
}

export async function signIn(lang: string): Promise<void> {
  try {
    const { pathname, search, hash } = window.location;
    sessionStorage.setItem(RETURN_PATH_KEY, pathname + search + hash);
  } catch {
    // Không lưu được thì sau khi đăng nhập về trang chủ.
  }
  const client = await loadSupabase();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/${lang}/auth/callback` },
  });
  if (error) throw error;
}

/** Đẩy nốt thay đổi rồi đăng xuất. Còn thay đổi chưa đẩy được thì trả `unsynced` để giao diện hỏi lại. */
export async function signOut(options: { force?: boolean } = {}): Promise<'done' | 'unsynced'> {
  await sync?.syncNow();
  if (!options.force && sync && sync.pendingCount() > 0) return 'unsynced';
  const client = await loadSupabase();
  stopAndClear();
  setState({ status: 'guest' });
  await client.auth.signOut({ scope: 'local' });
  return 'done';
}

export async function deleteAccount(): Promise<void> {
  const client = await loadSupabase();
  const { error } = await client.rpc('delete_my_account');
  if (error) throw error;
  stopAndClear();
  setState({ status: 'guest' });
  await client.auth.signOut({ scope: 'local' });
}
```

- [ ] **Step 3: Component menu**

```tsx
// src/components/account/account-menu.tsx
'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
import { useMessages } from '@/components/messages-provider';
import { format } from '@/lib/format';
import { deleteAccount, initAccount, signIn, signOut, useAccount } from '@/lib/account/controller';

/** Nút Đăng nhập hoặc menu tài khoản trên header (spec 2026-10-07 §6). */
export function AccountMenu({ lang }: { lang: string }) {
  const t = useMessages();
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void initAccount();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  if (account.status === 'disabled') return null;
  // Giữ chỗ để header không xô khi trạng thái tới.
  if (account.status === 'loading') return <span className="am-slot" aria-hidden="true" />;

  if (account.status === 'guest') {
    return (
      <div className="am">
        <button
          type="button"
          className="am-btn"
          title={t.account.signInTitle}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await signIn(lang);
            } catch {
              setError(t.account.signInFailed);
              setBusy(false);
            }
          }}
        >
          {t.account.signIn}
        </button>
        {error ? <span role="alert" className="am-error">{error}</span> : null}
      </div>
    );
  }

  const syncText = account.sync === 'error' ? t.account.syncError : account.sync === 'syncing' ? t.account.syncing : t.account.synced;

  async function onSignOut() {
    setBusy(true);
    let result = await signOut();
    if (result === 'unsynced' && window.confirm(t.account.unsyncedConfirm)) result = await signOut({ force: true });
    setBusy(false);
    if (result === 'done') setOpen(false);
  }

  async function onDelete() {
    if (!window.confirm(t.account.deleteConfirm)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      setOpen(false);
    } catch {
      setError(t.account.deleteFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="am" ref={rootRef}>
      <button
        type="button"
        className="am-btn am-avatar"
        aria-label={format(t.account.menu, { email: account.email })}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <UserRound aria-hidden="true" size={18} />
        {account.sync === 'error' ? <span className="am-dot" aria-hidden="true" /> : null}
      </button>
      {open ? (
        <div id={panelId} className="am-panel">
          <p className="am-email">{account.email}</p>
          <p className="am-sync" role="status">{syncText}</p>
          <button type="button" className="am-item" disabled={busy} onClick={onSignOut}>
            {t.account.signOut}
          </button>
          <a className="am-item" href={`/${lang}/privacy`}>
            {t.account.privacy}
          </a>
          <button type="button" className="am-item am-danger" disabled={busy} onClick={onDelete}>
            {t.account.deleteAccount}
          </button>
          {error ? <p role="alert" className="am-error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
```

```css
/* src/app/account.css — nút và menu tài khoản trên header (spec 2026-10-07 §6) */
.am { position: relative; display: inline-flex; align-items: center; }
.am-slot { display: inline-block; width: 92px; height: 36px; }
.am-btn { min-height: 36px; padding: 0 14px; border: 1px solid var(--field); border-radius: var(--radius-pill); background: var(--surface); color: var(--ink); font-size: 14px; font-weight: 500; cursor: pointer; }
.am-btn:focus-visible, .am-item:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.am-btn:disabled { opacity: 0.6; cursor: progress; }
.am-avatar { position: relative; display: inline-grid; place-items: center; width: 36px; padding: 0; }
.am-dot { position: absolute; top: 2px; right: 2px; width: 8px; height: 8px; border-radius: 50%; background: var(--amber); }
.am-panel { position: absolute; top: calc(100% + 8px); right: 0; z-index: 50; display: grid; gap: 2px; min-width: 240px; padding: 10px; border: 1px solid var(--rule); border-radius: var(--radius-md); background: var(--surface); box-shadow: 0 12px 32px rgba(2, 6, 23, 0.18); }
.am-email { margin: 0 6px; font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.am-sync { margin: 0 6px 6px; font-size: 13px; color: var(--muted); }
.am-item { display: block; min-height: 40px; padding: 0 6px; border: 0; border-radius: var(--radius-sm); background: none; color: var(--ink); font-size: 14px; line-height: 40px; text-align: left; text-decoration: none; cursor: pointer; }
.am-item:hover { background: var(--sunk); }
.am-danger { color: var(--red); }
.am-error { margin: 4px 6px 0; font-size: 13px; color: var(--red); }
@media (max-width: 1023px) { .am-panel { left: 0; right: auto; } .am-btn { min-height: 44px; } .am-avatar { width: 44px; } }
```

Trong `src/app/global.css`, sau `@import './lesson.css';` thêm `@import './account.css';`.

- [ ] **Step 4: Gắn vào header**

`src/lib/layout.shared.tsx`:

```tsx
import { AccountMenu } from '@/components/account/account-menu';
// …
    // Không có mục nav: trang chủ là nơi chọn roadmap (spec 2026-10-05 §3). Chỉ có nút tài khoản.
    links: [{ type: 'custom', secondary: true, children: <AccountMenu lang={lang} /> }],
```

Fumadocs hiển thị mục `secondary` ở header từ `lg` trở lên; dưới `lg` nằm trong menu thả xuống của header (trang roadmap, trang chủ) hoặc cuối thanh bên (trang bài học).

- [ ] **Step 5: Mô tả tiến độ theo tài khoản**

```tsx
// src/components/progress/progress-desc.tsx
'use client';
import { useMessages } from '@/components/messages-provider';
import { useAccount } from '@/lib/account/controller';

/** Câu mô tả nơi lưu tiến độ, đổi theo trạng thái đăng nhập. */
export function ProgressDesc() {
  const t = useMessages();
  const account = useAccount();
  const text =
    account.status === 'signed-in' ? t.progress.descSignedIn : account.status === 'disabled' ? t.progress.desc : t.progress.descGuest;
  return <p className="rm-xfer-d">{text}</p>;
}
```

Trong `src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx`, thay `<p className="rm-xfer-d">{t.progress.desc}</p>` bằng `<ProgressDesc />` (import từ `@/components/progress/progress-desc`). Lúc render tĩnh trạng thái là `loading` nên hiện `descGuest`.

- [ ] **Step 6: Kiểm tra trên trình duyệt (khách)**

Run: `pnpm typecheck && pnpm lint && pnpm test`, rồi tạo `.env.local` với `API_URL`/`PUBLISHABLE_KEY` của `supabase status -o env`, chạy dev server (`preview_start` với cấu hình `pnpm dev`), mở `/vi/roadmaps/java`.
Expected: nút "Đăng nhập" trên header (desktop), trong menu header (mobile 375px); tab Network không có request tới `127.0.0.1:54321` và không có chunk supabase-js trước khi bấm.

---

### Task 6: Trang callback và đường dẫn quay lại

**Files:**
- Create: `src/lib/account/return-path.ts`, `tests/unit/return-path.test.ts`, `src/components/account/auth-callback.tsx`, `src/app/[lang]/(home)/auth/callback/page.tsx`

**Interfaces:**
- Consumes: Task 5 (`initAccount`, `getAccountState`, `RETURN_PATH_KEY`).
- Produces: `safeReturnPath(raw: string | null, lang: string): string`.

- [ ] **Step 1: Test (đỏ)**

```ts
// tests/unit/return-path.test.ts
import { describe, expect, it } from 'vitest';
import { safeReturnPath } from '@/lib/account/return-path';

describe('safeReturnPath', () => {
  it('keeps same-site paths with query and hash', () => {
    expect(safeReturnPath('/vi/roadmaps/java#j5.generics', 'vi')).toBe('/vi/roadmaps/java#j5.generics');
    expect(safeReturnPath('/vi/learn/d1/d1-1?x=1', 'vi')).toBe('/vi/learn/d1/d1-1?x=1');
  });

  it('falls back to the home page for missing, external or looping targets', () => {
    for (const raw of [null, '', 'https://evil.test/', '//evil.test/x', '/\\evil.test', 'javascript:alert(1)', '/vi/auth/callback?code=1']) {
      expect(safeReturnPath(raw, 'vi')).toBe('/vi');
    }
  });
});
```

Run: `pnpm exec vitest run tests/unit/return-path.test.ts` → FAIL (chưa có module).

- [ ] **Step 2: Cài đặt**

```ts
// src/lib/account/return-path.ts
/**
 * Đường dẫn quay lại sau khi đăng nhập: chỉ nhận đường dẫn trong site, không quay lại chính trang callback.
 * Giá trị đến từ sessionStorage nên vẫn coi là dữ liệu không tin cậy.
 */
export function safeReturnPath(raw: string | null, lang: string): string {
  const home = `/${lang}`;
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return home;
  if (raw.split(/[?#]/)[0].endsWith('/auth/callback')) return home;
  return raw;
}
```

Run lại test → PASS.

- [ ] **Step 3: Component và trang**

```tsx
// src/components/account/auth-callback.tsx
'use client';
import { useEffect, useState } from 'react';
import { useMessages } from '@/components/messages-provider';
import { getAccountState, initAccount, RETURN_PATH_KEY } from '@/lib/account/controller';
import { safeReturnPath } from '@/lib/account/return-path';

/** Nhận kết quả OAuth: đổi mã lấy phiên, gộp tiến độ khách, rồi quay lại trang trước khi đăng nhập. */
export function AuthCallback({ lang }: { lang: string }) {
  const t = useMessages();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error') || window.location.hash.includes('error=') || !params.has('code')) {
      setFailed(true);
      return;
    }
    void (async () => {
      await initAccount();
      if (getAccountState().status !== 'signed-in') {
        setFailed(true);
        return;
      }
      let target: string | null = null;
      try {
        target = sessionStorage.getItem(RETURN_PATH_KEY);
        sessionStorage.removeItem(RETURN_PATH_KEY);
      } catch {
        // Không đọc được thì về trang chủ.
      }
      window.location.replace(safeReturnPath(target, lang));
    })();
  }, [lang]);

  return (
    <div className="hm-wrap">
      <h1 className="hm-t">{t.account.callbackTitle}</h1>
      {failed ? (
        <p role="alert">
          {t.account.callbackFailed} <a href={`/${lang}`}>{t.account.callbackBack}</a>
        </p>
      ) : (
        <p role="status">{t.account.callbackWorking}</p>
      )}
    </div>
  );
}
```

```tsx
// src/app/[lang]/(home)/auth/callback/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AuthCallback } from '@/components/account/auth-callback';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

export async function generateMetadata(props: PageProps<'/[lang]/auth/callback'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return { title: getMessages(lang).account.callbackTitle, robots: { index: false } };
}

/** Trang tĩnh nhận `?code=` từ Supabase Auth (PKCE); mọi xử lý chạy trên trình duyệt. */
export default async function AuthCallbackPage(props: PageProps<'/[lang]/auth/callback'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return (
    <main className="hm">
      <AuthCallback lang={lang} />
    </main>
  );
}
```

Kiểm tên lớp `hm`, `hm-wrap`, `hm-t` có trong `src/app/roadmap.css` (dùng ở trang chủ); nếu `hm-t` không có, dùng lớp tiêu đề `h1` của trang chủ (`src/app/[lang]/(landing)/page.tsx`).

- [ ] **Step 4: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: build tạo `out/vi/auth/callback.html` (hoặc `out/vi/auth/callback/index.html`).

---

### Task 7: Trang quyền riêng tư

**Files:**
- Create: `src/app/[lang]/(home)/privacy/page.tsx`
- Modify: `messages/vi.json`, `messages/en.json` (khoá `privacy`)

**Interfaces:**
- Consumes: `getMessages`, `isLanguage`.
- Produces: trang `/<lang>/privacy`, được link từ menu tài khoản (Task 5).

**Chặn:** cần email liên hệ do người dùng cung cấp (ghi vào `privacy.contact`). Không tự điền.

- [ ] **Step 1: Chữ giao diện**

`messages/vi.json`:

```json
"privacy": {
  "title": "Quyền riêng tư",
  "updated": "Cập nhật ngày 07/10/2026",
  "sections": [
    { "h": "Không đăng nhập", "p": "Tiến độ học chỉ lưu trong trình duyệt của bạn (localStorage). Masteva không nhận, không gửi đi dữ liệu này." },
    { "h": "Khi đăng nhập bằng Google", "p": "Masteva nhận từ Google địa chỉ email và mã người dùng để tạo tài khoản. Tiến độ học (mục đã tích, trạng thái chủ đề, cấp bắt đầu và thời điểm thao tác) được lưu theo tài khoản để dùng trên nhiều máy. Không dùng cho quảng cáo, không bán hay chia sẻ cho bên thứ ba." },
    { "h": "Nơi lưu", "p": "Dữ liệu tài khoản lưu trên Supabase (máy chủ ở Singapore), chỉ chính bạn đọc và sửa được tiến độ của mình." },
    { "h": "Xoá dữ liệu", "p": "Chọn \"Xoá tài khoản\" trong menu tài khoản để xoá tài khoản và toàn bộ tiến độ lưu theo tài khoản. Việc xoá có hiệu lực ngay và không khôi phục được." },
    { "h": "Liên hệ", "p": "Mọi yêu cầu về dữ liệu cá nhân gửi tới {contact}." }
  ],
  "contact": "<email người dùng cung cấp>"
}
```

`messages/en.json`: cùng cấu trúc, bản tiếng Anh tương ứng ("Privacy", "Updated 7 October 2026", "Without signing in", "When you sign in with Google", "Where data is stored", "Deleting your data", "Contact").

- [ ] **Step 2: Trang**

```tsx
// src/app/[lang]/(home)/privacy/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { format, getMessages } from '@/lib/messages';

export async function generateMetadata(props: PageProps<'/[lang]/privacy'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return { title: getMessages(lang).privacy.title };
}

/** Chính sách quyền riêng tư cho tài khoản (Luật Bảo vệ dữ liệu cá nhân 2025; architecture §11). */
export default async function PrivacyPage(props: PageProps<'/[lang]/privacy'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang).privacy;
  return (
    <main className="hm">
      <article className="hm-wrap prose">
        <h1>{t.title}</h1>
        <p>{t.updated}</p>
        {t.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{format(s.p, { contact: t.contact })}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
```

- [ ] **Step 3: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm build`, mở `/vi/privacy` trên dev server.
Expected: trang hiện đủ 5 mục, email liên hệ đúng.

---

### Task 8: CSP và E2E với Supabase giả lập

**Files:**
- Modify: `public/_headers`, `package.json` (script `e2e:build`)
- Create: `tests/e2e/account.spec.ts`

**Interfaces:**
- Consumes: mọi task trước.

- [ ] **Step 1: CSP**

Trong `public/_headers`, đổi `connect-src 'self'` thành `connect-src 'self' https://*.supabase.co`. Chuyển hướng sang Google là điều hướng trang, không cần thêm nguồn.

- [ ] **Step 2: Build E2E có cấu hình tài khoản**

`package.json`:

```json
"e2e:build": "MASTEVA_LOCALES=vi,en NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_e2e next build",
```

E2E chặn mọi request tới `127.0.0.1:54321` bằng `page.route`, nên không cần Supabase local đang chạy.

- [ ] **Step 3: Viết E2E**

```ts
// tests/e2e/account.spec.ts
import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

/** Khớp NEXT_PUBLIC_SUPABASE_URL của `pnpm e2e:build`. Mọi request tới đây bị chặn và trả dữ liệu giả. */
const SUPABASE = 'http://127.0.0.1:54321';
const LESSON = '/vi/learn/d1/d1-1';
const USER = { id: '11111111-1111-1111-1111-111111111111', email: 'hoc@vien.test' };

function fakeJwt(): string {
  const part = (v: object) => Buffer.from(JSON.stringify(v)).toString('base64url');
  return `${part({ alg: 'HS256', typ: 'JWT' })}.${part({ sub: USER.id, email: USER.email, role: 'authenticated', exp: 4102444800 })}.sig`;
}

const SESSION = {
  access_token: fakeJwt(),
  refresh_token: 'refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 4102444800,
  user: { id: USER.id, aud: 'authenticated', role: 'authenticated', email: USER.email, app_metadata: { provider: 'google' }, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' },
};

async function mockSupabase(page: Page, items: object[]): Promise<unknown[]> {
  const pushes: unknown[] = [];
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' };
  await page.route(`${SUPABASE}/**`, async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (pathname === '/rest/v1/progress_items') return json(items);
    if (pathname === '/rest/v1/topic_marks' || pathname === '/rest/v1/roadmap_starts') return json([]);
    if (pathname === '/rest/v1/rpc/sync_progress') {
      pushes.push(request.postDataJSON());
      return json('2026-10-07T00:00:00+00:00');
    }
    if (pathname === '/auth/v1/user') return json(SESSION.user);
    if (pathname === '/auth/v1/logout') return route.fulfill({ status: 204, headers: cors });
    return json({ message: `chưa giả lập ${pathname}` }, 404);
  });
  return pushes;
}

/** Đặt phiên đã đăng nhập một lần cho cả tab (không đặt lại sau khi đăng xuất). */
async function signedIn(page: Page) {
  await page.addInitScript((session) => {
    if (sessionStorage.getItem('e2e-seeded')) return;
    localStorage.setItem('masteva:auth', JSON.stringify(session));
    sessionStorage.setItem('e2e-seeded', '1');
  }, SESSION);
}

/** Tên file chunk chứa supabase-js trong bản build (chuỗi lỗi của auth-js không bị đổi tên khi nén). */
async function supabaseChunks(): Promise<string[]> {
  const dir = 'out/_next/static/chunks';
  const names = (await fs.readdir(dir, { recursive: true })).filter((n) => n.endsWith('.js'));
  const hits: string[] = [];
  for (const name of names) {
    if ((await fs.readFile(path.join(dir, name), 'utf8')).includes('AuthSessionMissingError')) hits.push(path.basename(name));
  }
  return hits;
}

test.describe('tài khoản', () => {
  // Trên mobile nút tài khoản nằm trong menu header; luồng giống hệt, chỉ kiểm trên desktop.
  test.skip(({ isMobile }) => isMobile);

  test('khách: có nút Đăng nhập, không tải supabase-js, không gọi Supabase', async ({ page }) => {
    const chunks = await supabaseChunks();
    expect(chunks.length).toBeGreaterThan(0);
    const supabaseCalls: string[] = [];
    const scripts: string[] = [];
    page.on('request', (r) => {
      if (r.url().startsWith(SUPABASE)) supabaseCalls.push(r.url());
      if (r.resourceType() === 'script') scripts.push(path.basename(new URL(r.url()).pathname));
    });
    await page.goto('/vi/roadmaps/java');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Đăng nhập' }).filter({ visible: true })).toBeVisible();
    expect(supabaseCalls).toEqual([]);
    expect(scripts.filter((s) => chunks.includes(s))).toEqual([]);
  });

  test('đã đăng nhập: kéo tiến độ từ tài khoản, tích mục thì đẩy lên', async ({ page }) => {
    const pushes = await mockSupabase(page, [
      { item_id: 'd1.1.exit-code', completed_at: '2026-10-01T10:00:00+00:00', changed_at: '2026-10-01T10:00:00+00:00', synced_at: '2026-10-01T10:00:00.123456+00:00' },
    ]);
    await signedIn(page);
    await page.goto(LESSON);
    await expect(page.locator('[data-check-id="d1.1.exit-code"]')).toBeChecked();
    const pushed = page.waitForRequest((r) => r.url() === `${SUPABASE}/rest/v1/rpc/sync_progress` && r.method() === 'POST');
    await page.locator('[data-check-id="d1.1.process-tree"]').check();
    const body = (await pushed).postDataJSON();
    expect(body.p_items).toEqual([expect.objectContaining({ item_id: 'd1.1.process-tree', completed_at: expect.any(String) })]);
    expect(pushes.length).toBeGreaterThan(0);
  });

  test('đăng xuất: về tiến độ khách, xoá bản sao tài khoản và phiên', async ({ page }) => {
    await mockSupabase(page, [
      { item_id: 'd1.1.exit-code', completed_at: '2026-10-01T10:00:00+00:00', changed_at: '2026-10-01T10:00:00+00:00', synced_at: '2026-10-01T10:00:00+00:00' },
    ]);
    await signedIn(page);
    await page.goto('/vi/roadmaps/java');
    await page.getByRole('button', { name: `Tài khoản ${USER.email}` }).filter({ visible: true }).click();
    await page.getByRole('button', { name: 'Đăng xuất' }).click();
    await expect(page.getByRole('button', { name: 'Đăng nhập' }).filter({ visible: true })).toBeVisible();
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('masteva:account:') || k === 'masteva:auth'));
    expect(left).toEqual([]);
    await page.goto(LESSON);
    await expect(page.locator('[data-check-id="d1.1.exit-code"]')).not.toBeChecked();
  });

  test('callback có lỗi thì báo và có đường về trang chủ', async ({ page }) => {
    await page.goto('/vi/auth/callback?error=access_denied');
    await expect(page.getByRole('alert')).toContainText('Đăng nhập không thành công');
    await expect(page.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/vi');
  });
});
```

Nếu test "đã đăng nhập" đỏ vì supabase-js không nhận phiên giả (ví dụ đòi `getClaims` kiểm JWT), đọc lỗi trong console (`read_console_messages`) rồi bổ sung trường còn thiếu vào `SESSION`; không đổi code sản phẩm để chiều test.

- [ ] **Step 4: Chạy E2E**

Run: `pnpm e2e`
Expected: test cũ vẫn xanh (header có thêm nút Đăng nhập, kiểm axe không có lỗi nghiêm trọng), 4 test mới xanh ở project desktop, bị bỏ qua ở mobile.

---

### Task 9: Tài liệu, kiểm tra toàn bộ và thử đăng nhập Google thật

**Files:**
- Modify: `README.md`, `docs/architecture.md` (§7.2, §11, §13), `docs/superpowers/specs/2026-10-07-tai-khoan-dong-bo-tien-do-design.md` (§6 cách gộp lần đầu), `docs/status.md`, `CLAUDE.md` (mục Supabase: lệnh `pnpm test:db`)

- [ ] **Step 1: Tài liệu**

- README: bảng biến môi trường thêm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; bảng lệnh Supabase thêm `pnpm test:db`; mục Deploy thêm hai biến trên Workers Builds (giá trị từ project cloud, khi có).
- Spec §6: lần đầu đăng nhập gộp theo thời điểm gốc (mục, chủ đề) và tài khoản giữ cấp bắt đầu; ghi lý do (bỏ tích mới hơn trên máy khác vẫn thắng).
- Architecture §11: CSP `connect-src` có `https://*.supabase.co`; §13: thêm `pnpm test:db` và E2E tài khoản.
- Status: mốc "Đăng nhập Google và đồng bộ tiến độ", số test, việc còn chờ người dùng.

- [ ] **Step 2: Kiểm tra toàn bộ**

Run: `pnpm verify` rồi `pnpm test:db`
Expected: tất cả xanh. Ghi số unit, E2E, pgTAP vào `docs/status.md`.

- [ ] **Step 3: Đo JavaScript**

So kích thước JS ban đầu của trang bài học (gzip) với số trong `docs/status.md` (287 KB ngày 03/10/2026): phần tăng chỉ là `AccountMenu`, `controller.ts` và `sync.ts` (không có supabase-js). Ghi số mới vào status.

- [ ] **Step 4: Thử đăng nhập Google thật trên local (cần người dùng)**

Người dùng tạo OAuth client "Web application" trên Google Cloud Console với Authorized redirect URI `http://127.0.0.1:54321/auth/v1/callback`, rồi tự đặt `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` trong `supabase/.env` (không gửi qua chat), chạy lại `supabase stop && supabase start …`. Sau đó trên `pnpm dev`:

1. Khách tích vài mục ở `/vi/learn/j1/j1-1`, bấm Đăng nhập → Google → quay về đúng trang, các mục vẫn tích; `supabase db query --local "select item_id from public.progress_items"` thấy các mục đó.
2. Mở cửa sổ ẩn danh, đăng nhập cùng tài khoản → thấy cùng tiến độ; bỏ tích một mục, quay lại cửa sổ đầu (chuyển tab) → mục đó bỏ tích.
3. Đăng xuất → trang về tiến độ khách rỗng. Xoá tài khoản ở cửa sổ kia → `auth.users` không còn user.

Báo kết quả từng bước cho người dùng kèm ảnh chụp màn hình (không có email thật trong ảnh).
