import type { Level, TopicKind, Track } from './constants';
import type { Project, Roadmap, Topic } from './schema';
import type { LiteTopic, RoadmapLite } from '@/lib/progress/roadmap';

/**
 * Dựng dữ liệu cho trang từ nội dung đã kiểm tra (spec §4, §6).
 * Chỉ có type và hàm thuần: dùng được lúc build và trong test; component phía trình duyệt chỉ `import type`.
 */
export interface StepInput {
  id: string;
  code: string;
  title: string;
  optional: boolean;
  topics: Topic[];
  links: { step: string; note?: string }[];
  pages: string[];
}

export interface LessonInput {
  id: string;
  stepId: string;
  slug: string;
  path: string;
  title: string;
  checkIds: string[];
  topics: string[];
}

export interface ViewInput {
  lang: string;
  roadmaps: Roadmap[];
  steps: ReadonlyMap<string, StepInput>;
  lessons: LessonInput[];
  projects: Project[];
}

export interface LessonRef {
  id: string;
  title: string;
  path: string;
  items: string[];
}

export interface StepRef {
  id: string;
  code: string;
  title: string;
  roadmapId: string;
}

export interface TopicRef {
  id: string;
  title: string;
  stepId: string;
  roadmapId: string;
}

export interface ProjectUse {
  projectId: string;
  projectTitle: string;
  milestoneTitle: string;
  milestoneIndex: number;
}

export interface TopicView {
  id: string;
  title: string;
  kind: TopicKind;
  options: string[];
  summary?: string;
  requires: TopicRef[];
  resources: { title: string; url: string; note?: string }[];
  lessons: LessonRef[];
  items: string[];
  projects: ProjectUse[];
  /** Vị trí trong chặng, đếm từ 1. */
  position: { index: number; count: number };
  /** Chủ đề liền trước và liền sau theo thứ tự roadmap, xuyên chặng và cấp. */
  prev?: { id: string; title: string };
  next?: { id: string; title: string };
}

export interface StepView {
  id: string;
  code: string;
  title: string;
  optional: boolean;
  /** Số thứ tự trạm trên trục, liên tục qua các cấp. */
  number: number;
  topics: TopicView[];
  lessons: LessonRef[];
  links: (StepRef & { note?: string })[];
  projects: ProjectUse[];
}

export interface LevelView {
  id: Level;
  index: number;
  title: string;
  goal: string;
  steps: StepView[];
}

export interface RoadmapView {
  id: string;
  track: Track;
  title: string;
  description: string;
  recommended: StepRef[];
  levels: LevelView[];
  stepCount: number;
  topicCount: number;
}

export interface NeedView {
  kind: 'step' | 'topic';
  id: string;
  /** Mã chặng (của chính nó, hoặc của chặng chứa chủ đề). */
  code: string;
  title: string;
  roadmapId: string;
  /** Chủ đề dùng để tính tiến độ của yêu cầu này. */
  topics: LiteTopic[];
}

export interface ProjectView {
  id: string;
  title: string;
  summary: string;
  milestones: { id: string; index: number; title: string; needs: NeedView[] }[];
}

/** Dữ liệu một thẻ roadmap (danh mục, trang chủ). */
export interface RoadmapCardData {
  id: string;
  track: Track;
  title: string;
  description: string;
  stepCount: number;
  topicCount: number;
  levels: { id: Level; title: string }[];
  lite: RoadmapLite;
}

export interface LessonContext {
  roadmap: { id: string; title: string; track: Track };
  step: StepRef;
  topics: TopicRef[];
}

const pick = (value: Record<string, string>, lang: string) => value[lang] ?? value.vi;

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Không tìm thấy ${what} (nội dung chưa qua content:check?)`);
  return value;
}

function indexContent(input: ViewInput) {
  const roadmapOfStep = new Map<string, Roadmap>();
  for (const roadmap of input.roadmaps) {
    for (const stepId of roadmap.levels.flatMap((l) => l.steps)) roadmapOfStep.set(stepId, roadmap);
  }
  const topicStep = new Map<string, StepInput>();
  for (const step of input.steps.values()) for (const topic of step.topics) topicStep.set(topic.id, step);

  const lessonRef = (l: LessonInput): LessonRef => ({ id: l.id, title: l.title, path: l.path, items: l.checkIds });
  // Theo thứ tự `pages` của chặng, không theo tên file (`d1-10` đứng sau `d1-2`).
  const pageOrder = (l: LessonInput) => input.steps.get(l.stepId)?.pages.indexOf(l.slug) ?? -1;
  const ordered = [...input.lessons].sort((a, b) => a.stepId.localeCompare(b.stepId) || pageOrder(a) - pageOrder(b));
  const lessonsByTopic = new Map<string, LessonRef[]>();
  for (const lesson of ordered) {
    for (const topicId of lesson.topics) lessonsByTopic.set(topicId, [...(lessonsByTopic.get(topicId) ?? []), lessonRef(lesson)]);
  }

  const uses = new Map<string, ProjectUse[]>();
  for (const project of input.projects) {
    project.milestones.forEach((milestone, i) => {
      const use: ProjectUse = {
        projectId: project.id,
        projectTitle: pick(project.title, input.lang),
        milestoneTitle: pick(milestone.title, input.lang),
        milestoneIndex: i + 1,
      };
      for (const need of milestone.needs) uses.set(need, [...(uses.get(need) ?? []), use]);
    });
  }

  const stepRef = (id: string): StepRef => {
    const step = must(input.steps.get(id), `bước ${id}`);
    return { id, code: step.code, title: step.title, roadmapId: must(roadmapOfStep.get(id), `roadmap của ${id}`).id };
  };
  const topicRef = (id: string): TopicRef => {
    const step = must(topicStep.get(id), `chủ đề ${id}`);
    const topic = must(step.topics.find((t) => t.id === id), `chủ đề ${id}`);
    return { id, title: topic.title, stepId: step.id, roadmapId: must(roadmapOfStep.get(step.id), `roadmap của ${step.id}`).id };
  };
  const kindOf = (step: StepInput, topic: Topic): TopicKind => (step.optional ? 'opt' : topic.kind);
  const liteTopic = (step: StepInput, topic: Topic): LiteTopic => ({
    id: topic.id,
    title: topic.title,
    kind: kindOf(step, topic),
    items: (lessonsByTopic.get(topic.id) ?? []).flatMap((l) => l.items),
  });

  return { roadmapOfStep, topicStep, lessonsByTopic, uses, stepRef, topicRef, kindOf, liteTopic, lessonRef };
}

export function buildRoadmapView(input: ViewInput, roadmapId: string): RoadmapView | undefined {
  const roadmap = input.roadmaps.find((r) => r.id === roadmapId);
  if (!roadmap) return undefined;
  const idx = indexContent(input);
  let number = 0;

  const levels: LevelView[] = roadmap.levels.map((level, i) => ({
    id: level.id,
    index: i + 1,
    title: pick(level.title, input.lang),
    goal: pick(level.goal, input.lang),
    steps: level.steps.map((stepId): StepView => {
      number += 1;
      const step = must(input.steps.get(stepId), `bước ${stepId}`);
      const lessons = step.pages
        .map((slug) => input.lessons.find((l) => l.stepId === stepId && l.slug === slug))
        .filter((l): l is LessonInput => Boolean(l))
        .map(idx.lessonRef);
      return {
        id: step.id,
        code: step.code,
        title: step.title,
        optional: step.optional,
        number,
        topics: step.topics.map((topic, ti) => {
          const topicLessons = idx.lessonsByTopic.get(topic.id) ?? [];
          return {
            id: topic.id,
            title: topic.title,
            kind: idx.kindOf(step, topic),
            options: topic.options ?? [],
            summary: topic.summary,
            requires: topic.requires.map(idx.topicRef),
            resources: topic.resources,
            lessons: topicLessons,
            items: topicLessons.flatMap((l) => l.items),
            projects: idx.uses.get(topic.id) ?? [],
            position: { index: ti + 1, count: step.topics.length },
          };
        }),
        lessons,
        links: step.links.map((link) => ({ ...idx.stepRef(link.step), note: link.note })),
        projects: idx.uses.get(step.id) ?? [],
      };
    }),
  }));

  const ordered = levels.flatMap((l) => l.steps.flatMap((s) => s.topics));
  ordered.forEach((topic, i) => {
    const prev = ordered[i - 1];
    const next = ordered[i + 1];
    if (prev) topic.prev = { id: prev.id, title: prev.title };
    if (next) topic.next = { id: next.id, title: next.title };
  });

  return {
    id: roadmap.id,
    track: roadmap.track,
    title: pick(roadmap.title, input.lang),
    description: pick(roadmap.description, input.lang),
    recommended: roadmap.recommended.map(idx.stepRef),
    levels,
    stepCount: number,
    topicCount: levels.flatMap((l) => l.steps).reduce((n, s) => n + s.topics.length, 0),
  };
}

/** Một chủ đề trong file JSON của khung chi tiết: dữ liệu của chủ đề kèm chặng và cấp chứa nó. */
export interface TopicDetail extends TopicView {
  step: { code: string; title: string };
  level: string;
}

/**
 * Dữ liệu khung chi tiết của cả roadmap, theo mã chủ đề. Xuất thành file JSON tĩnh và
 * chỉ tải khi người học mở khung lần đầu, để HTML trang roadmap không phải chở nội dung này.
 */
export function topicDetails(view: RoadmapView): Record<string, TopicDetail> {
  const details: Record<string, TopicDetail> = {};
  for (const level of view.levels) {
    for (const step of level.steps) {
      for (const topic of step.topics) details[topic.id] = { ...topic, step: { code: step.code, title: step.title }, level: level.title };
    }
  }
  return details;
}

export function toLite(view: RoadmapView): RoadmapLite {
  return {
    id: view.id,
    title: view.title,
    levels: view.levels.map((level) => ({
      id: level.id,
      steps: level.steps.map((step) => ({
        id: step.id,
        code: step.code,
        topics: step.topics.map((t) => ({
          id: t.id,
          title: t.title,
          kind: t.kind,
          items: t.items,
          ...(t.lessons[0] ? { lesson: t.lessons[0].path } : {}),
        })),
      })),
    })),
  };
}

export function buildProjectView(input: ViewInput, projectId: string): ProjectView | undefined {
  const project = input.projects.find((p) => p.id === projectId);
  if (!project) return undefined;
  const idx = indexContent(input);
  return {
    id: project.id,
    title: pick(project.title, input.lang),
    summary: pick(project.summary, input.lang),
    milestones: project.milestones.map((milestone, i) => ({
      id: milestone.id,
      index: i + 1,
      title: pick(milestone.title, input.lang),
      needs: milestone.needs.map((need): NeedView => {
        const ownerStep = idx.topicStep.get(need);
        if (ownerStep) {
          const ref = idx.topicRef(need);
          const topic = must(ownerStep.topics.find((t) => t.id === need), `chủ đề ${need}`);
          return { kind: 'topic', id: need, code: ownerStep.code, title: ref.title, roadmapId: ref.roadmapId, topics: [idx.liteTopic(ownerStep, topic)] };
        }
        const step = must(input.steps.get(need), `bước ${need}`);
        const ref = idx.stepRef(need);
        return { kind: 'step', id: need, code: ref.code, title: ref.title, roadmapId: ref.roadmapId, topics: step.topics.map((t) => idx.liteTopic(step, t)) };
      }),
    })),
  };
}

export function buildLessonContext(input: ViewInput, lessonId: string): LessonContext | undefined {
  const lesson = input.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  const idx = indexContent(input);
  const roadmap = idx.roadmapOfStep.get(lesson.stepId);
  if (!roadmap) return undefined;
  return {
    roadmap: { id: roadmap.id, title: pick(roadmap.title, input.lang), track: roadmap.track },
    step: idx.stepRef(lesson.stepId),
    topics: lesson.topics.map(idx.topicRef),
  };
}
