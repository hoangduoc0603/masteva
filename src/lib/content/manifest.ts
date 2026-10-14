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
import { planSearchFiles } from '@/lib/search/files';

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

interface SearchScopeData {
  files: string[];
  steps: Record<string, string>;
  roadmaps: Record<string, string[]>;
}

let searchPlan: { scope: SearchScopeData; fileSteps: Map<string, ReadonlySet<string>> } | undefined;

function loadSearchPlan() {
  if (!searchPlan) {
    const views = listRoadmapViews('vi').map((roadmap) => ({ id: roadmap.id, steps: roadmap.levels.flatMap((level) => level.steps) }));
    const plan = planSearchFiles(views.map((r) => ({ id: r.id, steps: r.steps.map((step) => ({ id: step.id, lessons: step.lessons.length })) })));
    const steps: Record<string, string> = {};
    const roadmaps: Record<string, string[]> = {};
    for (const file of plan) (roadmaps[file.roadmap] ??= []).push(file.id);
    for (const roadmap of views) {
      if (!Object.hasOwn(roadmaps, roadmap.id)) continue;
      for (const step of roadmap.steps) steps[step.id] = roadmap.id;
    }
    searchPlan = {
      scope: { files: plan.map((file) => file.id), steps, roadmaps },
      fileSteps: new Map(plan.map((file) => [file.id, new Set(file.steps)])),
    };
  }
  return searchPlan;
}

/**
 * Phạm vi tìm nội dung bài (ADR-009): mỗi roadmap có bài được chia thành các file `/<lang>/search/<roadmap>-<n>.json`
 * (`planSearchFiles`); `steps` cho biết chặng thuộc roadmap nào và `roadmaps` cho biết roadmap gồm những file nào,
 * để hộp tìm ưu tiên các file của roadmap đang xem.
 */
export function getSearchScope(): SearchScopeData {
  return loadSearchPlan().scope;
}

/** Các chặng có bài nằm trong một file tìm kiếm; `undefined` nếu không có file mang mã đó. */
export function getSearchFileSteps(fileId: string): ReadonlySet<string> | undefined {
  return loadSearchPlan().fileSteps.get(fileId);
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
