import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import type { Node } from 'unist';

/** Một ví dụ Java của bài đọc: khối code và output ghi ngay sau nó (content-standard §3.3). */
export interface JavaExample {
  /** Dòng mở khối code trong file bài (tính từ 1). */
  line: number;
  code: string;
  /** Khối ` ```text ` gần nhất sau khối code, trước khối code kế tiếp; không có thì `undefined`. */
  expected?: string;
  /** Khối output có meta `varies`: output đổi giữa các lần chạy, chỉ chạy chứ không so. */
  varies: boolean;
  /** Tên file khi chạy bằng `java <file>`, khớp với tên file mà output nhắc tới. */
  fileName: string;
}

interface CodeNode extends Node {
  type: 'code';
  lang?: string | null;
  meta?: string | null;
  value: string;
}

const words = (meta: string | null | undefined) => (meta ?? '').split(/\s+/);

/** Khung stack trace của chương trình (không phải của module JDK như `java.base/`) và lỗi biên dịch. */
const PROGRAM_FRAME = /^\s*at (?![\w.]+\/)[\w.$<>]+\((\w+)\.java:\d+\)/gm;
const COMPILER_ERROR = /^(\w+)\.java:\d+: error:/m;

function fileNameFor(code: string, expected: string | undefined): string {
  const publicClass = /^\s*public\s+(?:final\s+)?(?:class|record|interface|enum)\s+(\w+)/m.exec(code);
  if (publicClass) return `${publicClass[1]}.java`;
  if (expected) {
    const frames = [...expected.matchAll(PROGRAM_FRAME)];
    const fromTrace = frames.at(-1)?.[1] ?? COMPILER_ERROR.exec(expected)?.[1];
    if (fromTrace) return `${fromTrace}.java`;
  }
  return 'Main.java';
}

/**
 * Trích ví dụ Java từ thân bài (đã bỏ frontmatter). `lineOffset` là số dòng frontmatter, để số dòng
 * báo ra trỏ đúng vào file bài. Khối Java có meta `norun` bị bỏ qua: đoạn không chạy riêng được.
 */
export function extractJavaExamples(body: string, lineOffset = 0): JavaExample[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(body);
  const blocks: CodeNode[] = [];
  visit(tree, 'code', (node: CodeNode) => {
    blocks.push(node);
  });

  const examples: JavaExample[] = [];
  blocks.forEach((block, index) => {
    if (block.lang !== 'java' || words(block.meta).includes('norun')) return;
    const next = blocks[index + 1];
    const output = next?.lang === 'text' ? next : undefined;
    examples.push({
      line: (block.position?.start.line ?? 0) + lineOffset,
      code: block.value,
      expected: output?.value,
      varies: words(output?.meta).includes('varies'),
      fileName: fileNameFor(block.value, output?.value),
    });
  });
  return examples;
}

export type OutputComparison =
  | { match: true }
  | { match: false; line: number; actual: string | undefined; expected: string | undefined };

const normalize = (text: string) =>
  text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/^\n+|\n+$/g, '')
    .split('\n');

/** So output thật với output ghi trong bài, bỏ qua khoảng trắng cuối dòng và dòng trống ở hai đầu. */
export function compareOutput(actual: string, expected: string): OutputComparison {
  const a = normalize(actual);
  const e = normalize(expected);
  for (let i = 0; i < Math.max(a.length, e.length); i++) {
    if (a[i] !== e[i]) return { match: false, line: i + 1, actual: a[i], expected: e[i] };
  }
  return { match: true };
}
