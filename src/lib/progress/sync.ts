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

/** Cùng ràng buộc với bảng trong migration learning_progress: dòng sai bị server từ chối cả lần gọi. */
const ID = /^[a-z0-9][a-z0-9._-]{0,127}$/;
const ROADMAP_ID = /^[a-z0-9][a-z0-9._-]{0,63}$/;

/** Thời điểm Postgres nhận được: đọc được, và JS không tự đẩy sang ngày khác (30/02 thành 02/03). */
function isTimestamp(value: string): boolean {
  const t = Date.parse(value);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === value.slice(0, 10);
}

const validItem = (row: ItemRow) =>
  ID.test(row.item_id) && isTimestamp(row.changed_at) && (row.completed_at === null || isTimestamp(row.completed_at));
const validTopic = (row: TopicRow) => ID.test(row.topic_id) && isTimestamp(row.changed_at);
const validStart = (row: StartRow) => ROADMAP_ID.test(row.roadmap_id) && isTimestamp(row.changed_at);

function mergeRows<R extends { changed_at: string }>(
  queue: Record<string, R>,
  rows: Record<string, R>,
  valid: (row: R) => boolean,
): Record<string, R> {
  const out = { ...queue };
  for (const [id, row] of Object.entries(rows)) {
    // Bỏ dòng server sẽ từ chối (ví dụ mã sai trong file nhập), để một dòng hỏng không chặn cả hàng đợi.
    if (!valid(row)) continue;
    const current = own(out, id);
    if (!current || time(current.changed_at) <= time(row.changed_at)) out[id] = row;
  }
  return out;
}

export function addPending(queue: PendingChanges, changes: PendingChanges): PendingChanges {
  return {
    items: mergeRows(queue.items, changes.items, validItem),
    topics: mergeRows(queue.topics, changes.topics, validTopic),
    starts: mergeRows(queue.starts, changes.starts, validStart),
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
