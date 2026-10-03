import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { extractLesson, splitFrontmatter, type ExtractedLesson } from './extract';
import {
  LESSON_SECTIONS,
  idsLockSchema,
  lessonFields,
  refineLesson,
  roadmapSchema,
  stepFields,
  type IdsLock,
  type Roadmap,
} from './schema';
import {
  mergeLock,
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
  if (!fs.existsSync(LOCK_FILE)) return { ids: [], replacements: {} };
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
        sourceHash: hashContent(f.raw),
      };
    });
  return lessonsCache;
}

export interface ContentReport {
  errors: string[];
  currentIds: Set<string>;
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

  for (const roadmap of loadRoadmaps()) {
    for (const stepId of [...roadmap.steps, ...roadmap.optional]) {
      if (!steps.has(stepId)) errors.push(`roadmap "${roadmap.id}": bước "${stepId}" không tồn tại`);
    }
    for (const hub of roadmap.hubs) {
      if (!roadmap.steps.includes(hub.after)) errors.push(`roadmap "${roadmap.id}": ${hub.id} đặt sau bước không có trong roadmap`);
    }
  }

  validateLock(loadLock(), currentIds).forEach((e) => errors.push(`ids.lock.json: ${e}`));
  return { errors, currentIds };
}

/** Thêm mã mục mới vào file khoá. Trả về số mã đã thêm. */
export function updateLock(currentIds: Set<string>): number {
  const lock = loadLock();
  const next = mergeLock(lock, currentIds);
  const added = next.ids.length - lock.ids.length;
  if (added > 0) writeLock(next);
  return added;
}
