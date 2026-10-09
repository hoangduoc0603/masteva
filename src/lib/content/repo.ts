import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { extractLesson, splitFrontmatter, type ExtractedLesson } from './extract';
import {
  LESSON_SECTIONS,
  idsLockSchema,
  lessonFields,
  projectSchema,
  refineLesson,
  roadmapSchema,
  stepFields,
  type IdsLock,
  type Project,
  type Roadmap,
} from './schema';
import {
  mergeKeys,
  validateCodeRefs,
  validateGraph,
  validateInternalLinks,
  validateLessonStructure,
  validateLock,
  validateTranslation,
} from './validate';

/**
 * Đọc nội dung trực tiếp từ thư mục `content/`.
 * Chỉ chạy lúc build hoặc trong script (dùng `fs`), không bao giờ ở trình duyệt.
 */
const CONTENT_DIR = path.join(process.cwd(), 'content');
const STEPS_DIR = path.join(CONTENT_DIR, 'steps');
const ROADMAPS_DIR = path.join(CONTENT_DIR, 'roadmaps');
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');
export const LOCK_FILE = path.join(CONTENT_DIR, 'ids.lock.json');
const DEFAULT_LANG = 'vi';

const stepMetaSchema = z.object({ title: z.string(), pages: z.array(z.string()).default([]), ...stepFields });
export type StepMeta = z.infer<typeof stepMetaSchema>;

const lessonFrontmatterSchema = z
  .object({ title: z.string(), description: z.string().optional(), ...lessonFields })
  .superRefine(refineLesson);

export interface LessonFile {
  stepId: string;
  slug: string;
  lang: string;
  file: string;
  raw: string;
}

export interface LessonEntry {
  id: string;
  stepId: string;
  slug: string;
  /** Đường dẫn không kèm ngôn ngữ, ví dụ `/learn/d1/d1-1`. */
  path: string;
  title: string;
  checkIds: string[];
  /** Chủ đề trên sơ đồ mà bài bao phủ. */
  topics: string[];
  /** Hash nội dung bản gốc, để bản dịch ghi lại nó dựa vào phiên bản nào. */
  sourceHash: string;
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

let roadmapsCache: Roadmap[] | undefined;
export function loadRoadmaps(): Roadmap[] {
  roadmapsCache ??= fs
    .readdirSync(ROADMAPS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => roadmapSchema.parse(readJson(path.join(ROADMAPS_DIR, f))));
  return roadmapsCache;
}

let projectsCache: Project[] | undefined;
export function loadProjects(): Project[] {
  projectsCache ??= fs.existsSync(PROJECTS_DIR)
    ? fs
        .readdirSync(PROJECTS_DIR)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => projectSchema.parse(readJson(path.join(PROJECTS_DIR, f))))
    : [];
  return projectsCache;
}

let stepsCache: Map<string, StepMeta> | undefined;
export function loadSteps(): Map<string, StepMeta> {
  if (!stepsCache) {
    stepsCache = new Map();
    for (const dir of fs.readdirSync(STEPS_DIR).sort()) {
      const metaFile = path.join(STEPS_DIR, dir, 'meta.json');
      if (!fs.existsSync(metaFile)) continue;
      const meta = stepMetaSchema.parse(readJson(metaFile));
      stepsCache.set(meta.id, meta);
    }
  }
  return stepsCache;
}

/** `d1-1.mdx` → ngôn ngữ mặc định; `d1-1.en.mdx` → `en`. */
export function parseLessonFileName(name: string): { slug: string; lang: string } | null {
  const match = /^([a-z0-9-]+?)(?:\.([a-z]{2}))?\.mdx$/.exec(name);
  if (!match) return null;
  return { slug: match[1], lang: match[2] ?? DEFAULT_LANG };
}

export function loadLessonFiles(): LessonFile[] {
  const files: LessonFile[] = [];
  for (const stepId of fs.readdirSync(STEPS_DIR).sort()) {
    const dir = path.join(STEPS_DIR, stepId);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      const parsed = parseLessonFileName(name);
      if (!parsed) continue;
      const file = path.join(dir, name);
      files.push({ stepId, ...parsed, file, raw: fs.readFileSync(file, 'utf8') });
    }
  }
  return files;
}

export function hashContent(raw: string): string {
  return createHash('sha256').update(raw).digest('hex').slice(0, 12);
}

export function loadLock(): IdsLock {
  if (!fs.existsSync(LOCK_FILE)) return { ids: [], topics: [], milestones: [], replacements: {} };
  return idsLockSchema.parse(readJson(LOCK_FILE));
}

export function writeLock(lock: IdsLock): void {
  fs.writeFileSync(LOCK_FILE, `${JSON.stringify(lock, null, 2)}\n`);
}

interface ParsedLesson {
  file: LessonFile;
  frontmatter: z.infer<typeof lessonFrontmatterSchema> | null;
  extracted: ExtractedLesson;
  errors: string[];
}

function parseLesson(file: LessonFile): ParsedLesson {
  const { data, body } = splitFrontmatter(file.raw);
  const parsed = lessonFrontmatterSchema.safeParse(data);
  const errors = parsed.success
    ? []
    : parsed.error.issues.map((i) => `Frontmatter "${i.path.join('.')}": ${i.message}`);
  return { file, frontmatter: parsed.success ? parsed.data : null, extracted: extractLesson(body, LESSON_SECTIONS), errors };
}

let lessonsCache: LessonEntry[] | undefined;
/** Bài học bản gốc (ngôn ngữ mặc định), dùng cho manifest và tính tiến độ. */
export function loadLessons(): LessonEntry[] {
  lessonsCache ??= loadLessonFiles()
    .filter((f) => f.lang === DEFAULT_LANG)
    .map((f) => {
      const { frontmatter, extracted } = parseLesson(f);
      return {
        id: frontmatter?.id ?? f.slug.replace(/-/g, '.'),
        stepId: f.stepId,
        slug: f.slug,
        path: `/learn/${f.stepId}/${f.slug}`,
        title: frontmatter?.title ?? f.slug,
        checkIds: extracted.checkIds,
        topics: frontmatter?.topics ?? [],
        sourceHash: hashContent(f.raw),
      };
    });
  return lessonsCache;
}

export interface ContentReport {
  errors: string[];
  currentIds: Set<string>;
  currentTopics: Set<string>;
  currentMilestones: Set<string>;
}

/** Chạy mọi kiểm tra nội dung (architecture §10). */
export function checkContent(): ContentReport {
  const errors: string[] = [];
  const steps = loadSteps();
  const files = loadLessonFiles();
  const parsed = files.map(parseLesson);
  const lessonPaths = new Set(files.filter((f) => f.lang === DEFAULT_LANG).map((f) => `/learn/${f.stepId}/${f.slug}`));
  const sourceIdsBySlug = new Map<string, string[]>();
  const currentIds = new Set<string>();

  for (const lesson of parsed.filter((p) => p.file.lang === DEFAULT_LANG)) {
    sourceIdsBySlug.set(`${lesson.file.stepId}/${lesson.file.slug}`, lesson.extracted.checkIds);
    for (const id of lesson.extracted.checkIds) currentIds.add(id);
  }

  for (const lesson of parsed) {
    const where = path.relative(process.cwd(), lesson.file.file);
    const report = (message: string) => errors.push(`${where}: ${message}`);
    lesson.errors.forEach(report);
    const fm = lesson.frontmatter;
    if (!fm) continue;

    if (fm.step !== lesson.file.stepId) report(`step "${fm.step}" phải trùng thư mục "${lesson.file.stepId}"`);
    if (fm.id.replace(/\./g, '-') !== lesson.file.slug) report(`id "${fm.id}" phải khớp tên file "${lesson.file.slug}"`);
    if (!steps.has(lesson.file.stepId)) report(`thư mục bước "${lesson.file.stepId}" thiếu meta.json`);
    else if (lesson.file.lang === DEFAULT_LANG && !steps.get(lesson.file.stepId)?.pages.includes(lesson.file.slug)) {
      report(`chưa được liệt kê trong "pages" của meta.json`);
    }

    validateLessonStructure(fm.id, lesson.extracted).forEach(report);
    validateInternalLinks(lesson.extracted.links, lessonPaths).forEach(report);

    if (lesson.file.lang !== DEFAULT_LANG) {
      const sourceIds = sourceIdsBySlug.get(`${lesson.file.stepId}/${lesson.file.slug}`);
      if (!sourceIds) report('bản dịch không có bản gốc tiếng Việt');
      else validateTranslation(sourceIds, lesson.extracted.checkIds).forEach(report);
    }
  }

  // Mã chặng và mã bài nhắc trong văn bản phải tồn tại (spec 2026-10-09 §5).
  const codeCounts = new Map([...steps.values()].map((s) => [s.code, s.pages.length]));
  for (const lesson of parsed.filter((p) => p.file.lang === DEFAULT_LANG)) {
    const where = path.relative(process.cwd(), lesson.file.file);
    validateCodeRefs(lesson.file.raw, codeCounts).forEach((e) => errors.push(`${where}: ${e}`));
  }
  const jsonFiles = [
    ...[...steps.keys()].map((id) => path.join(STEPS_DIR, id, 'meta.json')),
    ...(fs.existsSync(PROJECTS_DIR) ? fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.json')).map((f) => path.join(PROJECTS_DIR, f)) : []),
  ];
  for (const file of jsonFiles) {
    const where = path.relative(process.cwd(), file);
    validateCodeRefs(fs.readFileSync(file, 'utf8'), codeCounts).forEach((e) => errors.push(`${where}: ${e}`));
  }

  const projects = loadProjects();
  validateGraph({
    roadmaps: loadRoadmaps().map((r) => ({ id: r.id, recommended: r.recommended, levels: r.levels })),
    steps: [...steps.values()].map((s) => ({
      id: s.id,
      topics: s.topics.map((t) => ({ id: t.id, requires: t.requires })),
      links: s.links,
    })),
    projects: projects.map((p) => ({ id: p.id, milestones: p.milestones.map((m) => ({ id: m.id, needs: m.needs })) })),
    lessons: parsed.flatMap((p) =>
      p.file.lang === DEFAULT_LANG && p.frontmatter
        ? [{ id: p.frontmatter.id, stepId: p.file.stepId, topics: p.frontmatter.topics }]
        : [],
    ),
  }).forEach((e) => errors.push(e));

  const currentTopics = new Set([...steps.values()].flatMap((s) => s.topics.map((t) => t.id)));
  const currentMilestones = new Set(projects.flatMap((p) => p.milestones.map((m) => m.id)));
  const lock = loadLock();
  validateLock(lock, currentIds).forEach((e) => errors.push(`ids.lock.json: ${e}`));
  validateLock({ ids: lock.topics, replacements: lock.replacements }, currentTopics).forEach((e) =>
    errors.push(`ids.lock.json (topics): ${e}`),
  );
  validateLock({ ids: lock.milestones, replacements: lock.replacements }, currentMilestones).forEach((e) =>
    errors.push(`ids.lock.json (milestones): ${e}`),
  );
  return { errors, currentIds, currentTopics, currentMilestones };
}

/** Thêm mã mục, mã chủ đề, mã mốc mới vào file khoá. Trả về số mã đã thêm theo từng loại. */
export function updateLock(report: ContentReport): { ids: number; topics: number; milestones: number } {
  const lock = loadLock();
  const next: IdsLock = {
    ids: mergeKeys(lock.ids, report.currentIds),
    topics: mergeKeys(lock.topics, report.currentTopics),
    milestones: mergeKeys(lock.milestones, report.currentMilestones),
    replacements: lock.replacements,
  };
  const added = {
    ids: next.ids.length - lock.ids.length,
    topics: next.topics.length - lock.topics.length,
    milestones: next.milestones.length - lock.milestones.length,
  };
  if (added.ids + added.topics + added.milestones > 0) writeLock(next);
  return added;
}
