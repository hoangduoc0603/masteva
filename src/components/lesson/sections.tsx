import type { ReactNode } from 'react';
import { LESSON_SECTIONS } from '@/lib/content/constants';
import type { Messages } from '@/lib/messages';

type SectionName = (typeof LESSON_SECTIONS)[number];

/** Neo cố định của từng phần, dùng cho mục lục. */
export const SECTION_ANCHORS: Record<SectionName, string> = {
  Goal: 'goal',
  Knowledge: 'knowledge',
  Resources: 'resources',
  Practice: 'practice',
  DeepDive: 'deep-dive',
  Mastery: 'mastery',
};

export function sectionToc(t: Messages) {
  return LESSON_SECTIONS.map((name) => ({
    title: t.lesson.sections[name],
    url: `#${SECTION_ANCHORS[name]}`,
    depth: 2,
  }));
}

/**
 * Tạo 6 component khung bài (content-standard §2) gắn với chữ giao diện của ngôn ngữ đang xem.
 * Tiêu đề phần do component sinh ra, tác giả không tự viết.
 */
export function createSectionComponents(t: Messages): Record<SectionName, (props: { children?: ReactNode }) => ReactNode> {
  const make = (name: SectionName) =>
    function Section({ children }: { children?: ReactNode }) {
      const anchor = SECTION_ANCHORS[name];
      return (
        <section aria-labelledby={anchor} data-section={name} className="lesson-section">
          <h2 id={anchor} className="scroll-mt-24">
            {t.lesson.sections[name]}
          </h2>
          {children}
        </section>
      );
    };
  return Object.fromEntries(LESSON_SECTIONS.map((name) => [name, make(name)])) as Record<
    SectionName,
    (props: { children?: ReactNode }) => ReactNode
  >;
}
