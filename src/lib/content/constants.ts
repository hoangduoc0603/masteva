/**
 * Hằng số nội dung dùng được ở cả máy chủ lẫn trình duyệt.
 * Tách khỏi schema.ts để component phía trình duyệt không kéo theo Zod.
 */
export const TRACKS = ['java', 'devops', 'microservices', 'neobank'] as const;
export type Track = (typeof TRACKS)[number];

export const LESSON_STATUSES = ['draft', 'verified', 'outdated'] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

/** Thứ tự bắt buộc của khung 6 phần (content-standard §2). */
export const LESSON_SECTIONS = ['Goal', 'Knowledge', 'Resources', 'Practice', 'DeepDive', 'Mastery'] as const;
