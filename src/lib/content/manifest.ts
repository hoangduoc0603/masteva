import 'server-only';
import { loadLessonFiles, loadLessons, loadLock, loadRoadmaps, loadSteps, type LessonEntry, type StepMeta } from './repo';
import type { Roadmap } from './schema';

/**
 * Manifest tiến độ (architecture §5.5): cây bước → bài → mã mục và bảng mã thay thế.
 * Tạo lúc build, truyền xuống trình duyệt qua props; không cần file JSON công khai.
 */
export interface ManifestLesson {
  id: string;
  title: string;
  path: string;
  items: string[];
}

export interface ManifestStep {
  id: string;
  code: string;
  title: string;
  short: string;
  track: StepMeta['track'];
  prerequisites: string[];
  lessons: ManifestLesson[];
}

export interface RoadmapManifest {
  roadmap: Roadmap;
  steps: ManifestStep[];
  optional: ManifestStep[];
  replacements: Record<string, string>;
}

function lessonsByStep(): Map<string, LessonEntry[]> {
  const map = new Map<string, LessonEntry[]>();
  for (const lesson of loadLessons()) {
    const list = map.get(lesson.stepId) ?? [];
    list.push(lesson);
    map.set(lesson.stepId, list);
  }
  return map;
}

export function getStepManifest(stepId: string): ManifestStep {
  const meta = loadSteps().get(stepId);
  if (!meta) throw new Error(`Bước không tồn tại: ${stepId}`);
  const lessons = lessonsByStep().get(stepId) ?? [];
  const ordered = meta.pages
    .map((slug) => lessons.find((l) => l.slug === slug))
    .filter((l): l is LessonEntry => Boolean(l));
  return {
    id: meta.id,
    code: meta.code,
    title: meta.title,
    short: meta.short,
    track: meta.track,
    prerequisites: meta.prerequisites,
    lessons: ordered.map((l) => ({ id: l.id, title: l.title, path: l.path, items: l.checkIds })),
  };
}

export function getRoadmapManifest(roadmapId: string): RoadmapManifest | undefined {
  const roadmap = loadRoadmaps().find((r) => r.id === roadmapId);
  if (!roadmap) return undefined;
  return {
    roadmap,
    steps: roadmap.steps.map(getStepManifest),
    optional: roadmap.optional.map(getStepManifest),
    replacements: loadLock().replacements,
  };
}

export function getLessonItems(lessonId: string): string[] {
  return loadLessons().find((l) => l.id === lessonId)?.checkIds ?? [];
}

export function getReplacements(): Record<string, string> {
  return loadLock().replacements;
}

export function getLessonSourceHash(stepId: string, slug: string): string | undefined {
  return loadLessons().find((l) => l.stepId === stepId && l.slug === slug)?.sourceHash;
}

/** Bài đã có bản dịch sang `lang` chưa (bản gốc luôn coi là có). */
export function hasTranslation(stepId: string, slug: string, lang: string): boolean {
  return loadLessonFiles().some((f) => f.stepId === stepId && f.slug === slug && f.lang === lang);
}
