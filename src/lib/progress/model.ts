import { LEVELS, type Level } from '@/lib/content/constants';

/**
 * Mô hình tiến độ (spec §5). Lưu mục đã tích, trạng thái người học tự đặt cho chủ đề
 * và cấp bắt đầu của từng roadmap. Không phụ thuộc ngôn ngữ.
 * Tổng của bài, chặng, roadmap luôn được tính lại từ dữ liệu trang, không lưu.
 */
export const PROGRESS_VERSION = 2;
export const PROGRESS_STORAGE_KEY = `masteva:progress:v${PROGRESS_VERSION}`;
export const LEGACY_PROGRESS_STORAGE_KEY = 'masteva:progress:v1';

/** `todo` tự đặt dùng khi người học muốn coi chủ đề là chưa học dù đã tích mục trong bài. */
export const TOPIC_MARKS = ['todo', 'learning', 'done', 'skipped'] as const;
export type TopicMark = (typeof TOPIC_MARKS)[number];

export interface TopicEntry {
  s: TopicMark;
  at: string;
}

export interface Progress {
  v: typeof PROGRESS_VERSION;
  /** Mã mục → thời điểm hoàn thành (ISO 8601). */
  items: Record<string, string>;
  /** Mã chủ đề → trạng thái người học tự đặt. */
  topics: Record<string, TopicEntry>;
  /** Mã roadmap → cấp bắt đầu ("Tôi đã biết" các cấp trước đó). */
  start: Record<string, Level>;
}

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isItems(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.entries(value).every(([id, at]) => id.length > 0 && typeof at === 'string' && ISO_DATETIME.test(at));
}

function isTopicEntry(value: unknown): value is TopicEntry {
  return (
    isRecord(value) &&
    (TOPIC_MARKS as readonly unknown[]).includes(value.s) &&
    typeof value.at === 'string' &&
    ISO_DATETIME.test(value.at)
  );
}

/**
 * Kiểm tra dữ liệu thô. Viết tay thay vì dùng Zod để không kéo thư viện schema
 * xuống trình duyệt (ngân sách JavaScript, architecture §1).
 */
export function isProgress(raw: unknown): raw is Progress {
  if (!isRecord(raw) || raw.v !== PROGRESS_VERSION || !isItems(raw.items)) return false;
  if (!isRecord(raw.topics) || !Object.values(raw.topics).every(isTopicEntry)) return false;
  return isRecord(raw.start) && Object.values(raw.start).every((l) => (LEVELS as readonly unknown[]).includes(l));
}

function isLegacyProgress(raw: unknown): raw is { v: 1; items: Record<string, string> } {
  return isRecord(raw) && raw.v === 1 && isItems(raw.items);
}

export function emptyProgress(): Progress {
  return { v: PROGRESS_VERSION, items: {}, topics: {}, start: {} };
}

/** Đi theo chuỗi mã thay thế, dừng khi gặp vòng lặp. */
function resolve(id: string, replacements: Readonly<Record<string, string>>): string {
  let current = id;
  const visited = new Set<string>();
  while (Object.hasOwn(replacements, current) && !visited.has(current)) {
    visited.add(current);
    current = replacements[current];
  }
  return current;
}

/**
 * Đọc dữ liệu thô từ storage hoặc file nhập: nhận v2, tự nâng v1,
 * rồi ánh xạ mã cũ sang mã thay thế. Trả về `null` nếu dữ liệu không hợp lệ.
 */
export function parseProgress(raw: unknown, replacements: Readonly<Record<string, string>> = {}): Progress | null {
  if (isProgress(raw)) return applyReplacements(raw, replacements);
  if (isLegacyProgress(raw)) return applyReplacements({ ...emptyProgress(), items: raw.items }, replacements);
  return null;
}

/** Khoá có thể đổi prototype của object khi gán; bỏ qua khi đọc dữ liệu nhập. */
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function applyReplacements(progress: Progress, replacements: Readonly<Record<string, string>>): Progress {
  const items: Record<string, string> = {};
  for (const [id, at] of Object.entries(progress.items)) {
    const target = resolve(id, replacements);
    if (UNSAFE_KEYS.has(target)) continue;
    items[target] = items[target] && items[target] < at ? items[target] : at;
  }
  const topics: Record<string, TopicEntry> = {};
  for (const [id, entry] of Object.entries(progress.topics)) {
    const target = resolve(id, replacements);
    if (UNSAFE_KEYS.has(target)) continue;
    topics[target] = topics[target] && topics[target].at > entry.at ? topics[target] : entry;
  }
  return { ...progress, items, topics };
}

/**
 * Gộp hai bản tiến độ (FR-PROGRESS-003): mục lấy hợp, giữ thời điểm sớm hơn;
 * chủ đề giữ bản đặt sau cùng; cấp bắt đầu ưu tiên bản hiện có (`a`).
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const items: Record<string, string> = { ...a.items };
  for (const [id, at] of Object.entries(b.items)) {
    items[id] = items[id] && items[id] < at ? items[id] : at;
  }
  const topics: Record<string, TopicEntry> = { ...a.topics };
  for (const [id, entry] of Object.entries(b.topics)) {
    topics[id] = topics[id] && topics[id].at >= entry.at ? topics[id] : entry;
  }
  return { v: PROGRESS_VERSION, items, topics, start: { ...b.start, ...a.start } };
}

export function toggleItem(progress: Progress, id: string, now: Date = new Date()): Progress {
  const items = { ...progress.items };
  if (items[id]) delete items[id];
  else items[id] = now.toISOString();
  return { ...progress, items };
}

/** Đặt hoặc xoá (`null`) trạng thái người học tự đặt cho một chủ đề. */
export function setTopicMark(progress: Progress, id: string, mark: TopicMark | null, now: Date = new Date()): Progress {
  const topics = { ...progress.topics };
  if (mark === null) delete topics[id];
  else topics[id] = { s: mark, at: now.toISOString() };
  return { ...progress, topics };
}

/** Đặt hoặc xoá (`null`) cấp bắt đầu của một roadmap. */
export function setStart(progress: Progress, roadmapId: string, level: Level | null): Progress {
  const start = { ...progress.start };
  if (level === null) delete start[roadmapId];
  else start[roadmapId] = level;
  return { ...progress, start };
}

export interface Tally {
  done: number;
  total: number;
}

export function tally(progress: Progress, ids: readonly string[]): Tally {
  return { done: ids.filter((id) => progress.items[id]).length, total: ids.length };
}
