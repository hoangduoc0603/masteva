import 'server-only';
import { loadLessonFiles, loadLessons, loadLock, loadProjects, loadRoadmaps, loadSteps } from './repo';
import {
  buildLessonContext,
  buildProjectView,
  buildRoadmapView,
  type LessonContext,
  type ProjectView,
  type RoadmapView,
  type ViewInput,
} from './views';

/** Dữ liệu cho trang, tạo lúc build từ `content/` (spec §6). Không bao giờ chạy ở trình duyệt. */
function viewInput(lang: string): ViewInput {
  return { lang, roadmaps: loadRoadmaps(), steps: loadSteps(), lessons: loadLessons(), projects: loadProjects() };
}

export function getRoadmapView(roadmapId: string, lang: string): RoadmapView | undefined {
  return buildRoadmapView(viewInput(lang), roadmapId);
}

const ROADMAP_ORDER = ['java', 'spring-boot', 'devops', 'kubernetes', 'microservices'];

export function listRoadmapViews(lang: string): RoadmapView[] {
  const input = viewInput(lang);
  return input.roadmaps
    .flatMap((r) => buildRoadmapView(input, r.id) ?? [])
    .sort((a, b) => ROADMAP_ORDER.indexOf(a.id) - ROADMAP_ORDER.indexOf(b.id));
}

let searchScope: { files: string[]; steps: Record<string, string> } | undefined;

/**
 * Phạm vi tìm nội dung bài (ADR-009): mỗi roadmap có bài là một file `/<lang>/search/<roadmap>.json`;
 * `steps` cho biết chặng thuộc roadmap nào, để hộp tìm ưu tiên file của roadmap đang xem.
 */
export function getSearchScope(): { files: string[]; steps: Record<string, string> } {
  if (!searchScope) {
    const steps: Record<string, string> = {};
    const files: string[] = [];
    for (const roadmap of listRoadmapViews('vi')) {
      const all = roadmap.levels.flatMap((level) => level.steps);
      if (!all.some((step) => step.lessons.length > 0)) continue;
      files.push(roadmap.id);
      for (const step of all) steps[step.id] = roadmap.id;
    }
    searchScope = { files, steps };
  }
  return searchScope;
}

export function getProjectView(projectId: string, lang: string): ProjectView | undefined {
  return buildProjectView(viewInput(lang), projectId);
}

export function listProjectViews(lang: string): ProjectView[] {
  const input = viewInput(lang);
  return input.projects.flatMap((p) => buildProjectView(input, p.id) ?? []);
}

export function getLessonContext(lessonId: string, lang: string): LessonContext | undefined {
  return buildLessonContext(viewInput(lang), lessonId);
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
