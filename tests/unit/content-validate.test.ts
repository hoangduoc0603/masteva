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
  validateShellComments,
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
  const lab = { sections: [...LESSON_SECTIONS], checkIds: ['d1.1.a', 'd1.1.b'], invalidChecks: 0, links: [] };
  const reading = { sections: ['Goal', 'Knowledge', 'Resources'], checkIds: [], invalidChecks: 0, links: [] };

  it('accepts a reading lesson with three sections and gives it the single item <lesson>.done', () => {
    expect(validateLessonStructure('j5.3', 'reading', reading)).toEqual({ errors: [], itemIds: ['j5.3.done'] });
  });

  it('accepts a well-formed lab lesson and keeps its check ids as items', () => {
    expect(validateLessonStructure('d1.1', 'lab', lab)).toEqual({ errors: [], itemIds: ['d1.1.a', 'd1.1.b'] });
  });

  it('rejects missing or misordered sections', () => {
    expect(validateLessonStructure('d1.1', 'lab', { ...lab, sections: ['Goal', 'Practice', 'Knowledge'] }).errors).toHaveLength(1);
  });

  it('rejects a reading lesson whose sections are misordered, missing, or include lab sections', () => {
    for (const sections of [['Knowledge', 'Goal', 'Resources'], ['Goal', 'Knowledge'], [...LESSON_SECTIONS]]) {
      expect(validateLessonStructure('j5.3', 'reading', { ...reading, sections }).errors).toEqual([
        `Khung bài phải đúng thứ tự Goal → Knowledge → Resources; đang có: ${sections.join(' → ')}`,
      ]);
    }
  });

  it('rejects a reading lesson that has <Check>, with or without an id', () => {
    expect(validateLessonStructure('j5.3', 'reading', { ...reading, checkIds: ['j5.3.a'] }).errors).toEqual(['Bài đọc không được có <Check>']);
    expect(validateLessonStructure('j5.3', 'reading', { ...reading, invalidChecks: 1 }).errors).toEqual(['Bài đọc không được có <Check>']);
  });

  it('still requires all six sections of a lab lesson', () => {
    expect(validateLessonStructure('d1.1', 'lab', { ...lab, sections: ['Goal', 'Knowledge', 'Resources'] }).errors).toHaveLength(1);
  });

  it('rejects a lesson without a kind', () => {
    expect(validateLessonStructure('d1.1', undefined, lab).errors).toEqual(['Thiếu dạng bài (kind: reading hoặc lab) trong frontmatter']);
  });

  it('rejects duplicate ids and ids from another lesson', () => {
    const { errors } = validateLessonStructure('d1.1', 'lab', { ...lab, checkIds: ['d1.1.a', 'd1.1.a', 'd1.2.b', 'd1.1.Bad'] });
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
    ['K2', 0],
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

  it('checks Kubernetes step codes but not K8s or K3s', () => {
    expect(validateCodeRefs('Xem K2, chạy trên K8s và K3s.', steps)).toEqual([]);
    expect(validateCodeRefs('Xem K12.', steps)).toEqual(['nhắc mã chặng "K12" không có trong roadmap nào']);
  });

  it('ignores fenced and inline code', () => {
    expect(validateCodeRefs('```\nJ99\n```\n`J98` và J1', steps)).toEqual([]);
  });

  it('does not match inside longer tokens', () => {
    expect(validateCodeRefs('J2EE, JDK 25, MD5, SB30x', steps)).toEqual([]);
  });
});

describe('validateShellComments', () => {
  const fence = '```';
  const term = (where: string, code: string) => `<Terminal where="${where}">\n\n${fence}bash\n${code}\n${fence}\n\n</Terminal>`;

  it('reports a trailing comment in a mac terminal block with its line number', () => {
    expect(validateShellComments(`Dòng đầu.\n\n${term('mac', 'echo a\nsleep 5   # chờ kube-proxy')}`)).toEqual([
      'dòng 7: chú thích "#" trong <Terminal where="mac"> làm hỏng lệnh trên zsh của macOS; đưa lời giải thích ra văn bản',
    ]);
  });

  it('reports a comment-only line and a comment after a function brace', () => {
    expect(validateShellComments(term('mac', '# chờ CA nạp cấu hình\ndem() {  # đếm\n  echo x\n}'))).toHaveLength(2);
  });

  it('ignores heredoc bodies, quoted text and non-comment hashes', () => {
    const code = [
      "cat > a.yaml <<'EOF'",
      'port: 80   # cổng của Service',
      'EOF',
      `echo 'a # b' "c # d"`,
      'echo $# ${#x} a#b',
      'cat <<-END',
      '  # trong heredoc',
      'END',
    ].join('\n');
    expect(validateShellComments(term('mac', code))).toEqual([]);
  });

  it('checks only mac terminal blocks and only fenced code', () => {
    expect(validateShellComments(term('vm', 'sleep 5   # bash hiểu chú thích'))).toEqual([]);
    expect(validateShellComments(`# Tiêu đề\n\n${fence}bash\nls   # ngoài Terminal\n${fence}`)).toEqual([]);
  });
});
