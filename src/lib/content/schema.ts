import { z } from 'zod';
import { LESSON_STATUSES, LEVELS, TOPIC_KINDS, TRACKS, type LessonStatus } from './constants';

export {
  LESSON_SECTIONS,
  LESSON_STATUSES,
  LEVELS,
  TOPIC_KINDS,
  TRACKS,
  type Level,
  type LessonStatus,
  type TopicKind,
  type Track,
} from './constants';

/** Mã bài: `<mã bước>.<số>`, ví dụ `d1.1`. */
export const lessonIdPattern = /^[a-z]+\d*x?\.\d+$/;
/** Mã mục: `<mã bài>.<slug>`, ví dụ `d1.1.exit-code`. */
export const checkIdPattern = /^[a-z]+\d*x?\.\d+\.[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Mã chủ đề: `<mã bước>.<slug>`, ví dụ `j5.generics`. */
export const topicIdPattern = /^[a-z]+\d+\.[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Mã mốc dự án: `<mã dự án>.<slug>`, ví dụ `neobank.discovery`. */
export const milestoneIdPattern = /^[a-z][a-z0-9-]*\.[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugPattern = /^[a-z][a-z0-9-]*$/;

const localized = z.record(z.string(), z.string()).refine((v) => typeof v.vi === 'string', {
  message: 'Phải có bản tiếng Việt (vi)',
});

const verifiedSchema = z.object({
  date: z.iso.date(),
  os: z.string().min(1),
  tools: z.record(z.string(), z.string()),
});

/** Một nút trên sơ đồ roadmap (spec §4.2). */
export const topicSchema = z
  .object({
    id: z.string().regex(topicIdPattern),
    title: z.string().min(1),
    kind: z.enum(TOPIC_KINDS).default('core'),
    options: z.array(z.string().min(1)).min(2).optional(),
    summary: z.string().optional(),
    requires: z.array(z.string()).default([]),
    resources: z
      .array(z.object({ title: z.string().min(1), url: z.url(), note: z.string().optional() }))
      .max(3)
      .default([]),
  })
  .refine((t) => t.kind !== 'pick' || (t.options?.length ?? 0) >= 2, {
    message: 'Chủ đề "pick" phải có ít nhất 2 lựa chọn trong "options"',
    path: ['options'],
  });
export type Topic = z.infer<typeof topicSchema>;

/** Trường riêng của Masteva trong frontmatter bài học (architecture §5.2). */
export const lessonFields = {
  id: z.string().regex(lessonIdPattern),
  step: z.string().min(1),
  prerequisites: z.array(z.string()).default([]),
  /** Chủ đề trên sơ đồ mà bài này bao phủ (spec §4.3). */
  topics: z.array(z.string().regex(topicIdPattern)).min(1),
  status: z.enum(LESSON_STATUSES),
  verified: verifiedSchema.optional(),
  outdatedNote: z.string().optional(),
  /** Chỉ ở bản dịch: hash nội dung bản gốc mà bản dịch dựa vào. */
  source: z.string().optional(),
};

type LessonFieldValues = {
  status: LessonStatus;
  verified?: unknown;
  outdatedNote?: string;
};

/** Ràng buộc chéo giữa các trường, dùng chung cho schema của Fumadocs và script kiểm tra. */
export function refineLesson(value: LessonFieldValues, ctx: z.RefinementCtx) {
  if (value.status === 'verified' && !value.verified) {
    ctx.addIssue({ code: 'custom', path: ['verified'], message: 'Bài "verified" phải có ngày và môi trường kiểm chứng' });
  }
  if (value.status === 'outdated' && !value.outdatedNote) {
    ctx.addIssue({ code: 'custom', path: ['outdatedNote'], message: 'Bài "outdated" phải ghi phần có thể đã cũ' });
  }
}

/** Trường riêng của Masteva trong meta.json của một bước (chặng). */
export const stepFields = {
  id: z.string().min(1),
  code: z.string().min(1),
  short: z.string().min(1),
  track: z.enum(TRACKS),
  prerequisites: z.array(z.string()).default([]),
  /** Chặng tuỳ chọn: mọi chủ đề trong đó coi là `opt`. */
  optional: z.boolean().default(false),
  topics: z.array(topicSchema).default([]),
  /** Bước của roadmap khác dạy đầy đủ phần liên quan. */
  links: z.array(z.object({ step: z.string().min(1), note: z.string().optional() })).default([]),
};

export const roadmapSchema = z.object({
  id: z.string().regex(slugPattern),
  area: z.string().min(1),
  track: z.enum(TRACKS),
  title: localized,
  description: localized,
  /** Bước của roadmap khác nên học trước. */
  recommended: z.array(z.string()).default([]),
  levels: z
    .array(z.object({ id: z.enum(LEVELS), title: localized, goal: localized, steps: z.array(z.string()).min(1) }))
    .min(1),
});
export type Roadmap = z.infer<typeof roadmapSchema>;

export const projectSchema = z.object({
  id: z.string().regex(slugPattern),
  title: localized,
  summary: localized,
  milestones: z
    .array(z.object({ id: z.string().regex(milestoneIdPattern), title: localized, needs: z.array(z.string()).min(1) }))
    .min(1),
});
export type Project = z.infer<typeof projectSchema>;

export const idsLockSchema = z.object({
  /** Mọi mã mục đã từng phát hành. */
  ids: z.array(z.string()),
  /** Mọi mã chủ đề đã từng phát hành. */
  topics: z.array(z.string()).default([]),
  /** Mọi mã mốc dự án đã từng phát hành. */
  milestones: z.array(z.string()).default([]),
  /** Mã cũ → mã thay thế (mục, chủ đề hoặc mốc), dùng khi gộp hoặc đổi tên. */
  replacements: z.record(z.string(), z.string()).default({}),
});
export type IdsLock = z.infer<typeof idsLockSchema>;
