import type { ReactNode } from 'react';
import type { TOCItemType } from 'fumadocs-core/toc';
import { LESSON_FRAMES, LESSON_SECTIONS, type LessonKind, type SectionName } from '@/lib/content/constants';
import type { Messages } from '@/lib/messages';

/** Neo cố định của từng phần, dùng cho mục lục. */
export const SECTION_ANCHORS: Record<SectionName, string> = {
  Goal: 'goal',
  Knowledge: 'knowledge',
  Resources: 'resources',
  Practice: 'practice',
  DeepDive: 'deep-dive',
  Mastery: 'mastery',
};

/**
 * Mục lục bài theo khung của dạng bài: ba mục với bài đọc, sáu mục với bài lab.
 * Bài đọc lồng các đề mục `###` của bài (`headings`, mục lục Fumadocs sinh từ MDX) dưới mục Kiến thức;
 * theo chuẩn bài đọc, đề mục `###` chỉ nằm trong phần Kiến thức.
 */
export function sectionToc(t: Messages, kind: LessonKind, headings: readonly TOCItemType[] = []): TOCItemType[] {
  return LESSON_FRAMES[kind].flatMap((name) => {
    const item = { title: t.lesson.sections[name], url: `#${SECTION_ANCHORS[name]}`, depth: 2 };
    if (kind !== 'reading' || name !== 'Knowledge') return [item];
    return [item, ...headings.filter((heading) => heading.depth === 3)];
  });
}

/**
 * Tạo các component khung bài (content-standard §2) gắn với chữ giao diện của ngôn ngữ đang xem.
 * Tiêu đề phần do component sinh ra, tác giả không tự viết. Ba phần đầu đứng cùng vị trí trong khung
 * bài đọc và khung bài lab, nên số thứ tự theo `LESSON_SECTIONS` đúng cho cả hai dạng bài.
 */
export function createSectionComponents(t: Messages): Record<SectionName, (props: { children?: ReactNode }) => ReactNode> {
  const make = (name: SectionName, index: number) =>
    function Section({ children }: { children?: ReactNode }) {
      const anchor = SECTION_ANCHORS[name];
      return (
        <section aria-labelledby={anchor} data-section={name} className="ms-sec">
          <h2 id={anchor} className="ms-sec-h">
            {/* Số thứ tự chỉ để nhìn; tên phần là tên của heading. */}
            <span className="ms-sec-n" aria-hidden="true">
              {index + 1}
            </span>
            <span>{t.lesson.sections[name]}</span>
          </h2>
          {children}
        </section>
      );
    };
  return Object.fromEntries(LESSON_SECTIONS.map((name, index) => [name, make(name, index)])) as Record<
    SectionName,
    (props: { children?: ReactNode }) => ReactNode
  >;
}
