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
export function validateLock(lock: Pick<IdsLock, 'ids' | 'replacements'>, currentIds: ReadonlySet<string>): string[] {
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

/** Thêm mã mới vào danh sách đã phát hành, giữ nguyên thứ tự cũ. */
export function mergeKeys(known: readonly string[], current: Iterable<string>): string[] {
  const seen = new Set(known);
  const added = [...new Set(current)].filter((id) => !seen.has(id)).sort();
  return [...known, ...added];
}

/** Thêm mã mục mới vào file khoá, giữ nguyên thứ tự đã có. */
export function mergeLock<T extends Pick<IdsLock, 'ids'>>(lock: T, currentIds: Iterable<string>): T {
  return { ...lock, ids: mergeKeys(lock.ids, currentIds) };
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

export interface ContentGraph {
  roadmaps: { id: string; recommended: string[]; levels: { steps: string[] }[] }[];
  steps: { id: string; topics: { id: string; requires: string[] }[]; links: { step: string }[] }[];
  projects: { id: string; milestones: { id: string; needs: string[] }[] }[];
  lessons: { id: string; stepId: string; topics: string[] }[];
}

/** Kiểm tra quan hệ giữa roadmap, bước, chủ đề, dự án và bài (spec §4.5). */
export function validateGraph(graph: ContentGraph): string[] {
  const errors: string[] = [];
  const stepIds = new Set(graph.steps.map((s) => s.id));

  const owner = new Map<string, string>();
  for (const roadmap of graph.roadmaps) {
    for (const stepId of roadmap.levels.flatMap((l) => l.steps)) {
      if (!stepIds.has(stepId)) errors.push(`roadmap "${roadmap.id}": bước "${stepId}" không tồn tại`);
      const previous = owner.get(stepId);
      if (previous) errors.push(`bước "${stepId}" thuộc cả "${previous}" và "${roadmap.id}"`);
      else owner.set(stepId, roadmap.id);
    }
    for (const id of roadmap.recommended) {
      if (!stepIds.has(id)) errors.push(`roadmap "${roadmap.id}": "recommended" trỏ tới bước "${id}" không tồn tại`);
    }
  }
  for (const step of graph.steps) {
    if (!owner.has(step.id)) errors.push(`bước "${step.id}" không thuộc roadmap nào`);
  }

  const topicStep = new Map<string, string>();
  for (const step of graph.steps) {
    for (const topic of step.topics) {
      if (!topic.id.startsWith(`${step.id}.`)) errors.push(`chủ đề "${topic.id}" phải bắt đầu bằng "${step.id}."`);
      if (topicStep.has(topic.id)) errors.push(`mã chủ đề bị trùng: ${topic.id}`);
      else topicStep.set(topic.id, step.id);
    }
  }
  for (const step of graph.steps) {
    for (const topic of step.topics) {
      for (const req of topic.requires) {
        if (!topicStep.has(req)) errors.push(`chủ đề "${topic.id}": "requires" trỏ tới "${req}" không tồn tại`);
      }
    }
    for (const link of step.links) {
      if (!stepIds.has(link.step)) errors.push(`bước "${step.id}": "links" trỏ tới bước "${link.step}" không tồn tại`);
    }
  }

  const milestoneIds = new Set<string>();
  for (const project of graph.projects) {
    for (const milestone of project.milestones) {
      if (!milestone.id.startsWith(`${project.id}.`)) {
        errors.push(`mốc "${milestone.id}" phải bắt đầu bằng "${project.id}."`);
      }
      if (milestoneIds.has(milestone.id)) errors.push(`mã mốc bị trùng: ${milestone.id}`);
      milestoneIds.add(milestone.id);
      for (const need of milestone.needs) {
        if (!stepIds.has(need) && !topicStep.has(need)) errors.push(`mốc "${milestone.id}": "needs" trỏ tới "${need}" không tồn tại`);
      }
    }
  }

  const linked = new Map(graph.steps.map((s) => [s.id, new Set(s.links.map((l) => l.step))]));
  for (const lesson of graph.lessons) {
    for (const topicId of lesson.topics) {
      const stepId = topicStep.get(topicId);
      if (!stepId) errors.push(`bài "${lesson.id}": chủ đề "${topicId}" không tồn tại`);
      else if (stepId !== lesson.stepId && !linked.get(lesson.stepId)?.has(stepId)) {
        errors.push(
          `bài "${lesson.id}": chủ đề "${topicId}" thuộc bước "${stepId}", không thuộc bước "${lesson.stepId}" hay bước được liên kết`,
        );
      }
    }
  }
  return errors;
}
