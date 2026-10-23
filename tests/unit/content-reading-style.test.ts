import { describe, expect, it } from 'vitest';
import { validateReadingStyle } from '@/lib/content/reading-style';

const fence = (meta: string, body: string) => `\`\`\`${meta}\n${body}\n\`\`\``;
const callout = (kind: string) => `<Callout kind="${kind}">\n\nNội dung.\n\n</Callout>`;

/** Bài đọc hợp lệ; `knowledge` thay phần thân Kiến thức trước hai callout khép bài. */
const lesson = ({ goal = 'Mục tiêu.', knowledge = '### Khái niệm\n\nGiải thích.', closing = [callout('ai'), callout('link')] } = {}) =>
  ['<Goal>', goal, '</Goal>', '<Knowledge>', knowledge, ...closing, '</Knowledge>', '<Resources>', '- Tài liệu.', '</Resources>'].join('\n\n');

describe('validateReadingStyle', () => {
  it('accepts a well-formed reading lesson', () => {
    expect(validateReadingStyle(lesson())).toEqual([]);
  });

  it('keeps ### headings inside Knowledge', () => {
    expect(validateReadingStyle(lesson({ goal: '### Đề mục lạc\n\nMục tiêu.' }))).toEqual([
      'Đề mục ### "Đề mục lạc" phải nằm trong <Knowledge> (mục lục chỉ lồng đề mục của phần Kiến thức)',
    ]);
  });

  it('closes Knowledge with exactly one ai callout followed by one link callout', () => {
    const message = 'Phần <Knowledge> phải kết thúc bằng đúng một <Callout kind="ai"> rồi một <Callout kind="link">';
    for (const closing of [[callout('link'), callout('ai')], [callout('ai')], [callout('ai'), callout('link'), '### Thêm\n\nĐoạn.'], [callout('ai'), callout('ai'), callout('link')]]) {
      expect(validateReadingStyle(lesson({ closing }))).toContain(message);
    }
  });

  it('allows at most two production callouts', () => {
    const knowledge = ['### A', callout('production'), '### B', callout('production'), '### C', callout('production')].join('\n\n');
    expect(validateReadingStyle(lesson({ knowledge }))).toEqual(['Bài đọc có 3 callout "production"; tối đa 2']);
  });

  it('keeps code blocks free of file titles and of ... elisions', () => {
    const knowledge = [fence('java title="Main.java"', 'void main() {}'), fence('java', 'record P(...) {}'), fence('java', 'class A {\n    ...\n}')].join('\n\n');
    expect(validateReadingStyle(lesson({ knowledge }))).toEqual([
      'Khối code ghi tên file (title="Main.java"); bài đọc chỉ hiện code (content-standard §3.3)',
      'Khối code dùng "..." để lược bỏ; ghi phần lược bỏ bằng comment hợp lệ, ví dụ // các field khác',
      'Khối code dùng "..." để lược bỏ; ghi phần lược bỏ bằng comment hợp lệ, ví dụ // các field khác',
    ]);
  });

  it('accepts varargs, which also spell three dots', () => {
    expect(validateReadingStyle(lesson({ knowledge: fence('java', 'void log(String... parts) {}') }))).toEqual([]);
  });

  it('flags filler words in prose but not in code', () => {
    const knowledge = 'Bạn chỉ cần gọi `đơn giản()`. Chúng ta thấy nó Dễ dàng.\n\n' + fence('java', '// đơn giản');
    expect(validateReadingStyle(lesson({ knowledge }))).toEqual([
      'Văn bài dùng "chỉ cần", "chúng ta", "dễ dàng"; viết lại theo giọng văn ở content-standard §4',
    ]);
  });
});
