import { describe, expect, it } from 'vitest';
import { compareOutput, extractJavaExamples } from '@/lib/content/examples';

const fence = (lang: string, body: string) => `\`\`\`${lang}\n${body}\n\`\`\``;

describe('extractJavaExamples', () => {
  it('pairs each java block with the text block right after it, also inside JSX', () => {
    const body = [
      'Lời dẫn.',
      fence('java', 'void main() { IO.println(1); }'),
      'Kết quả:',
      fence('text', '1'),
      fence('java', 'void main() { IO.println(2); }'),
      '<Predict question="In gì?">',
      '',
      fence('text', '2'),
      '',
      '</Predict>',
    ].join('\n\n');
    expect(extractJavaExamples(body).map((e) => [e.code, e.expected])).toEqual([
      ['void main() { IO.println(1); }', '1'],
      ['void main() { IO.println(2); }', '2'],
    ]);
  });

  it('leaves expected empty when the next code block is java or there is none', () => {
    const body = [fence('java', 'void main() {}'), fence('java', 'void main() { IO.println(3); }')].join('\n\n');
    expect(extractJavaExamples(body).map((e) => e.expected)).toEqual([undefined, undefined]);
  });

  it('skips java blocks marked norun and ignores other languages', () => {
    const body = [fence('java norun', '@RestController class A {}'), fence('text', 'x'), fence('bash', 'ls'), fence('text', 'y')].join('\n\n');
    expect(extractJavaExamples(body)).toEqual([]);
  });

  it('flags output that varies between runs', () => {
    const body = [fence('java', 'void main() {}'), fence('text varies', '[B, A]')].join('\n\n');
    expect(extractJavaExamples(body)[0]).toMatchObject({ expected: '[B, A]', varies: true });
  });

  it('reports the line of the java block, shifted by the frontmatter offset', () => {
    const body = ['Dòng 1.', '', fence('java', 'void main() {}')].join('\n');
    expect(extractJavaExamples(body, 10)[0].line).toBe(13);
  });

  describe('file name', () => {
    const nameFor = (code: string, output: string) =>
      extractJavaExamples([fence('java', code), fence('text', output)].join('\n\n'))[0].fileName;

    it('uses the public class when there is one', () => {
      expect(nameFor('public class Shop { public static void main(String[] a) {} }', '')).toBe('Shop.java');
    });

    it('reads the program frame of a stack trace, not the JDK frames', () => {
      const trace = [
        'Exception in thread "main" java.util.ConcurrentModificationException',
        '\tat java.base/java.util.ArrayList$Itr.next(ArrayList.java:1050)',
        '\tat RemoveInLoop.main(RemoveInLoop.java:9)',
      ].join('\n');
      expect(nameFor('void main() {}', trace)).toBe('RemoveInLoop.java');
    });

    it('reads a compiler error', () => {
      expect(nameFor('void main() {}', 'CompileGuard.java:8: error: incompatible types')).toBe('CompileGuard.java');
    });

    it('falls back to Main.java', () => {
      expect(nameFor('void main() {}', '[KB-02]')).toBe('Main.java');
    });
  });
});

describe('compareOutput', () => {
  it('ignores trailing spaces, CRLF and blank edges', () => {
    expect(compareOutput('a  \r\nb\n\n', '\na\nb')).toEqual({ match: true });
  });

  it('reports the first differing line', () => {
    expect(compareOutput('a\nb\nc', 'a\nx\nc')).toEqual({ match: false, line: 2, actual: 'b', expected: 'x' });
  });

  it('reports missing or extra lines', () => {
    expect(compareOutput('a', 'a\nb')).toEqual({ match: false, line: 2, actual: undefined, expected: 'b' });
  });
});
