import type { IdsLock } from './schema';
import { LESSON_SECTIONS, checkIdPattern } from './schema';
import type { ExtractedLesson } from './extract';

/** Kiểm tra khung 6 phần và mã mục của một bài (bản gốc hoặc bản dịch). */
export function validateLessonStructure(lessonId: string, extracted: ExtractedLesson): string[] {
  const errors: string[] = [];
  const expected = LESSON_SECTIONS.join(' → ');
  if (extracted.sections.join(' → ') !== expected) {
    errors.push(`Khung bài phải đúng thứ tự ${expected}; đang có: ${extracted.sections.join(' → ') || '(trống)'}`);
  }
  if (extracted.invalidChecks > 0) {
    errors.push(`${extracted.invalidChecks} <Check> thiếu id dạng chuỗi cố định`);
  }
  const seen = new Set<string>();
  for (const id of extracted.checkIds) {
    if (seen.has(id)) errors.push(`Mã mục bị trùng: ${id}`);
    seen.add(id);
    if (!checkIdPattern.test(id) || !id.startsWith(`${lessonId}.`)) {
      errors.push(`Mã mục "${id}" phải có dạng ${lessonId}.<slug>`);
    }
  }
  return errors;
}

/** Bản dịch không được có mã mục không tồn tại ở bản gốc. */
export function validateTranslation(sourceIds: readonly string[], translationIds: readonly string[]): string[] {
  const source = new Set(sourceIds);
  return translationIds
    .filter((id) => !source.has(id))
    .map((id) => `Bản dịch có mã mục không tồn tại ở bản gốc: ${id}`);
}

/**
 * Mã đã phát hành không được biến mất nếu không có mã thay thế (BR-003),
 * và mã thay thế phải còn tồn tại.
 */
export function validateLock(lock: IdsLock, currentIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  for (const id of lock.ids) {
    if (currentIds.has(id)) continue;
    const replacement = resolveReplacement(id, lock.replacements);
    if (replacement === id) {
      errors.push(`Mã đã phát hành "${id}" không còn trong nội dung; thêm mã thay thế vào ids.lock.json`);
    } else if (!currentIds.has(replacement)) {
      errors.push(`Mã thay thế "${replacement}" của "${id}" không tồn tại`);
    }
  }
  return errors;
}

/** Đi theo chuỗi thay thế (a → b → c), dừng khi gặp vòng lặp. */
export function resolveReplacement(id: string, replacements: Readonly<Record<string, string>>): string {
  let current = id;
  const visited = new Set<string>();
  while (replacements[current] && !visited.has(current)) {
    visited.add(current);
    current = replacements[current];
  }
  return current;
}

/** Thêm mã mới vào file khoá, giữ nguyên thứ tự đã có. */
export function mergeLock(lock: IdsLock, currentIds: Iterable<string>): IdsLock {
  const known = new Set(lock.ids);
  const added = [...currentIds].filter((id) => !known.has(id)).sort();
  return { ids: [...lock.ids, ...added], replacements: lock.replacements };
}

/**
 * Link nội bộ dạng `/learn/<bước>/<bài>` phải trỏ tới bài có thật.
 * Link ngoài, link neo (#) và link tương đối được bỏ qua.
 */
export function validateInternalLinks(links: readonly string[], lessonPaths: ReadonlySet<string>): string[] {
  return links
    .filter((link) => link.startsWith('/learn/'))
    .map((link) => link.split('#')[0].replace(/\/$/, ''))
    .filter((path) => !lessonPaths.has(path))
    .map((path) => `Link nội bộ không tồn tại: ${path}`);
}
