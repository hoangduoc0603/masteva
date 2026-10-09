import { describe, expect, it } from 'vitest';
import { extractLesson, splitFrontmatter } from '@/lib/content/extract';
import { LESSON_SECTIONS } from '@/lib/content/constants';
import {
  mergeLock,
  resolveReplacement,
  validateCodeRefs,
  validateInternalLinks,
  validateLessonStructure,
  validateLock,
  validateTranslation,
} from '@/lib/content/validate';
import { parseLessonFileName } from '@/lib/content/repo';

const lesson = (sections: string[], body = '') =>
  sections.map((name) => `<${name}>\n\n${name === 'Knowledge' ? body : 'Nội dung.'}\n\n</${name}>`).join('\n\n');

describe('extractLesson', () => {
  it('reads top-level sections, check ids and links', () => {
    const body = lesson([...LESSON_SECTIONS], '<Check id="d1.1.a">A</Check>\n\n[bài D0](/learn/d0/d0-1) <Card href="/learn/x/y" />');
    const extracted = extractLesson(body, LESSON_SECTIONS);
    expect(extracted.sections).toEqual([...LESSON_SECTIONS]);
    expect(extracted.checkIds).toEqual(['d1.1.a']);
    expect(extracted.links).toEqual(['/learn/d0/d0-1', '/learn/x/y']);
  });

  it('counts checks without a literal id', () => {
    const extracted = extractLesson(lesson([...LESSON_SECTIONS], '<Check>A</Check>\n\n<Check id={x}>B</Check>'), LESSON_SECTIONS);
    expect(extracted.invalidChecks).toBe(2);
  });

  it('splits frontmatter', () => {
    const { data, body } = splitFrontmatter('---\nid: d1.1\nstatus: draft\n---\n# Body');
    expect(data).toEqual({ id: 'd1.1', status: 'draft' });
    expect(body).toBe('# Body');
  });
});

describe('validateLessonStructure', () => {
  const ok = { sections: [...LESSON_SECTIONS], checkIds: ['d1.1.a', 'd1.1.b'], invalidChecks: 0, links: [] };

  it('accepts a well-formed lesson', () => {
    expect(validateLessonStructure('d1.1', ok)).toEqual([]);
  });

  it('rejects missing or misordered sections', () => {
    expect(validateLessonStructure('d1.1', { ...ok, sections: ['Goal', 'Practice', 'Knowledge'] })).toHaveLength(1);
  });

  it('rejects duplicate ids and ids from another lesson', () => {
    const errors = validateLessonStructure('d1.1', { ...ok, checkIds: ['d1.1.a', 'd1.1.a', 'd1.2.b', 'd1.1.Bad'] });
    expect(errors.join('\n')).toMatch(/trùng: d1\.1\.a/);
    expect(errors.join('\n')).toMatch(/d1\.2\.b/);
    expect(errors.join('\n')).toMatch(/d1\.1\.Bad/);
  });
});

describe('ids lock', () => {
  it('fails when a released id disappears without replacement', () => {
    const errors = validateLock({ ids: ['a', 'b'], replacements: {} }, new Set(['a']));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/"b"/);
  });

  it('accepts a removed id that has a live replacement', () => {
    expect(validateLock({ ids: ['a', 'b'], replacements: { b: 'a' } }, new Set(['a']))).toEqual([]);
  });

  it('fails when the replacement itself is gone', () => {
    expect(validateLock({ ids: ['b'], replacements: { b: 'c' } }, new Set(['a']))).toHaveLength(1);
  });

  it('appends new ids without reordering existing ones', () => {
    expect(mergeLock({ ids: ['z', 'a'], replacements: {} }, ['a', 'c', 'b']).ids).toEqual(['z', 'a', 'b', 'c']);
  });

  it('resolves replacement chains and stops on cycles', () => {
    expect(resolveReplacement('a', { a: 'b', b: 'c' })).toBe('c');
    expect(['a', 'b']).toContain(resolveReplacement('a', { a: 'b', b: 'a' }));
  });
});

describe('translations and links', () => {
  it('rejects translation ids unknown to the source', () => {
    expect(validateTranslation(['d1.1.a'], ['d1.1.a', 'd1.1.x'])).toEqual([
      'Bản dịch có mã mục không tồn tại ở bản gốc: d1.1.x',
    ]);
  });

  it('checks only /learn links', () => {
    const errors = validateInternalLinks(['/learn/d1/d1-1#goal', '/learn/d9/d9-1', 'https://x.dev', '#a'], new Set(['/learn/d1/d1-1']));
    expect(errors).toEqual(['Link nội bộ không tồn tại: /learn/d9/d9-1']);
  });

  it('parses lesson file names', () => {
    expect(parseLessonFileName('d1-1.mdx')).toEqual({ slug: 'd1-1', lang: 'vi' });
    expect(parseLessonFileName('d1-1.en.mdx')).toEqual({ slug: 'd1-1', lang: 'en' });
    expect(parseLessonFileName('meta.json')).toBeNull();
  });
});

describe('validateCodeRefs', () => {
  const steps = new Map([
    ['J1', 3],
    ['SB3', 2],
    ['M5', 0],
  ]);

  it('accepts known step and lesson codes', () => {
    expect(validateCodeRefs('Xem J1, bài SB3.2 và chặng M5.', steps)).toEqual([]);
  });

  it('reports an unknown step code once', () => {
    expect(validateCodeRefs('Ở J12, rồi lại J12', steps)).toEqual(['nhắc mã chặng "J12" không có trong roadmap nào']);
  });

  it('reports a lesson number beyond the lessons of the step', () => {
    expect(validateCodeRefs('bài SB3.3', steps)).toEqual(['nhắc bài "SB3.3" nhưng chặng SB3 chỉ có 2 bài']);
  });

  it('does not check lesson numbers of a step without lessons', () => {
    expect(validateCodeRefs('M5.4', steps)).toEqual([]);
  });

  it('ignores fenced and inline code', () => {
    expect(validateCodeRefs('```\nJ99\n```\n`J98` và J1', steps)).toEqual([]);
  });

  it('does not match inside longer tokens', () => {
    expect(validateCodeRefs('J2EE, JDK 25, MD5, SB30x', steps)).toEqual([]);
  });
});
