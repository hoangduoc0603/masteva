import { z } from 'zod';
import { LESSON_STATUSES, TRACKS, type LessonStatus } from './constants';

export { LESSON_SECTIONS, LESSON_STATUSES, TRACKS, type LessonStatus, type Track } from './constants';

/** Mã bài: `<mã bước>.<số>`, ví dụ `d1.1`. */
export const lessonIdPattern = /^[a-z]+\d*x?\.\d+$/;
/** Mã mục: `<mã bài>.<slug>`, ví dụ `d1.1.exit-code`. */
export const checkIdPattern = /^[a-z]+\d*x?\.\d+\.[a-z0-9]+(?:-[a-z0-9]+)*$/;

const verifiedSchema = z.object({
  date: z.iso.date(),
  os: z.string().min(1),
  tools: z.record(z.string(), z.string()),
});

/** Trường riêng của Masteva trong frontmatter bài học (architecture §5.2). */
export const lessonFields = {
  id: z.string().regex(lessonIdPattern),
  step: z.string().min(1),
  prerequisites: z.array(z.string()).default([]),
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

/** Trường riêng của Masteva trong meta.json của một bước. */
export const stepFields = {
  id: z.string().min(1),
  code: z.string().min(1),
  short: z.string().min(1),
  track: z.enum(TRACKS),
  prerequisites: z.array(z.string()).default([]),
};

const localized = z.record(z.string(), z.string()).refine((v) => typeof v.vi === 'string', {
  message: 'Phải có bản tiếng Việt (vi)',
});

export const roadmapSchema = z.object({
  id: z.string().min(1),
  area: z.string().min(1),
  level: z.string().min(1),
  title: localized,
  description: localized,
  steps: z.array(z.string()).min(1),
  optional: z.array(z.string()).default([]),
  hubs: z
    .array(z.object({ id: z.string(), after: z.string(), title: localized }))
    .default([]),
});
export type Roadmap = z.infer<typeof roadmapSchema>;

export const idsLockSchema = z.object({
  /** Mọi mã mục đã từng phát hành. */
  ids: z.array(z.string()),
  /** Mã cũ → mã thay thế, dùng khi gộp hoặc đổi tên mục. */
  replacements: z.record(z.string(), z.string()).default({}),
});
export type IdsLock = z.infer<typeof idsLockSchema>;
