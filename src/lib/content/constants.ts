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

/** Mọi component phần bài, theo thứ tự; cũng là khung 6 phần của bài lab (content-standard §2). */
export const LESSON_SECTIONS = ['Goal', 'Knowledge', 'Resources', 'Practice', 'DeepDive', 'Mastery'] as const;
export type SectionName = (typeof LESSON_SECTIONS)[number];

/** Dạng bài (ADR-0011): bài đọc chỉ dạy kiến thức, bài lab có lab và ô đánh dấu từng bước. */
export const LESSON_KINDS = ['reading', 'lab'] as const;
export type LessonKind = (typeof LESSON_KINDS)[number];

/** Khung bài theo dạng bài. Ba phần đầu của hai khung trùng nhau nên số thứ tự phần không đổi. */
export const LESSON_FRAMES: Record<LessonKind, readonly SectionName[]> = {
  reading: ['Goal', 'Knowledge', 'Resources'],
  lab: LESSON_SECTIONS,
};

/** Mã mục duy nhất của bài đọc (nút "Đã học xong bài"), do hệ thống sinh. */
export const doneItemId = (lessonId: string) => `${lessonId}.done`;
