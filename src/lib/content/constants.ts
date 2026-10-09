/**
 * Hằng số nội dung dùng được ở cả máy chủ lẫn trình duyệt.
 * Tách khỏi schema.ts để component phía trình duyệt không kéo theo Zod.
 */
export const TRACKS = ['java', 'spring', 'devops', 'kubernetes', 'microservices'] as const;
export type Track = (typeof TRACKS)[number];

/** Ba cấp của một roadmap, theo thứ tự. */
export const LEVELS = ['foundation', 'middle', 'senior'] as const;
export type Level = (typeof LEVELS)[number];

/** core: chủ đề chính; pick: chọn một trong `options`; opt: tuỳ chọn, không tính vào tiến độ. */
export const TOPIC_KINDS = ['core', 'pick', 'opt'] as const;
export type TopicKind = (typeof TOPIC_KINDS)[number];

export const LESSON_STATUSES = ['draft', 'verified', 'outdated'] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

/** Thứ tự bắt buộc của khung 6 phần (content-standard §2). */
export const LESSON_SECTIONS = ['Goal', 'Knowledge', 'Resources', 'Practice', 'DeepDive', 'Mastery'] as const;
