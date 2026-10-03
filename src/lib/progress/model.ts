/**
 * Mô hình tiến độ (architecture §7.1). Chỉ lưu mục đã hoàn thành, không phụ thuộc ngôn ngữ.
 * Tổng của bài, bước, roadmap luôn được tính lại từ manifest, không lưu.
 */
export const PROGRESS_VERSION = 1;
export const PROGRESS_STORAGE_KEY = `masteva:progress:v${PROGRESS_VERSION}`;

export interface Progress {
  v: typeof PROGRESS_VERSION;
  /** Mã mục → thời điểm hoàn thành (ISO 8601). */
  items: Record<string, string>;
}

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/**
 * Kiểm tra dữ liệu thô. Viết tay thay vì dùng Zod để không kéo thư viện schema
 * xuống trình duyệt (ngân sách JavaScript, architecture §1).
 */
export function isProgress(raw: unknown): raw is Progress {
  if (typeof raw !== 'object' || raw === null) return false;
  const { v, items } = raw as { v?: unknown; items?: unknown };
  if (v !== PROGRESS_VERSION || typeof items !== 'object' || items === null || Array.isArray(items)) return false;
  return Object.entries(items).every(([id, at]) => id.length > 0 && typeof at === 'string' && ISO_DATETIME.test(at));
}

export function emptyProgress(): Progress {
  return { v: PROGRESS_VERSION, items: {} };
}

/** Đi theo chuỗi mã thay thế, dừng khi gặp vòng lặp. */
function resolve(id: string, replacements: Readonly<Record<string, string>>): string {
  let current = id;
  const visited = new Set<string>();
  while (replacements[current] && !visited.has(current)) {
    visited.add(current);
    current = replacements[current];
  }
  return current;
}

/**
 * Đọc dữ liệu thô từ storage hoặc file nhập: kiểm tra schema rồi ánh xạ mã cũ sang mã thay thế.
 * Trả về `null` nếu dữ liệu không hợp lệ.
 */
export function parseProgress(raw: unknown, replacements: Readonly<Record<string, string>> = {}): Progress | null {
  if (!isProgress(raw)) return null;
  return applyReplacements(raw, replacements);
}

export function applyReplacements(progress: Progress, replacements: Readonly<Record<string, string>>): Progress {
  const items: Record<string, string> = {};
  for (const [id, at] of Object.entries(progress.items)) {
    const target = resolve(id, replacements);
    items[target] = items[target] && items[target] < at ? items[target] : at;
  }
  return { v: PROGRESS_VERSION, items };
}

/** Gộp hai bản tiến độ: lấy hợp, cùng mã thì giữ thời điểm sớm hơn (FR-PROGRESS-003). */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const items: Record<string, string> = { ...a.items };
  for (const [id, at] of Object.entries(b.items)) {
    items[id] = items[id] && items[id] < at ? items[id] : at;
  }
  return { v: PROGRESS_VERSION, items };
}

export function toggleItem(progress: Progress, id: string, now: Date = new Date()): Progress {
  const items = { ...progress.items };
  if (items[id]) delete items[id];
  else items[id] = now.toISOString();
  return { v: PROGRESS_VERSION, items };
}

export interface Tally {
  done: number;
  total: number;
}

export function tally(progress: Progress, ids: readonly string[]): Tally {
  return { done: ids.filter((id) => progress.items[id]).length, total: ids.length };
}

/** Mục chưa xong đầu tiên theo thứ tự cho trước, dùng cho nút "Học tiếp". */
export function firstIncomplete<T>(progress: Progress, entries: readonly T[], idsOf: (entry: T) => readonly string[]): T | undefined {
  return entries.find((entry) => {
    const ids = idsOf(entry);
    return ids.length > 0 && ids.some((id) => !progress.items[id]);
  });
}
