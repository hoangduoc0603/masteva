import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';

/**
 * Các quy tắc cơ học của bài đọc (content-standard §3, §4), kiểm bằng máy để người duyệt
 * chỉ còn chấm những gì cần phán đoán.
 */

/** Từ thừa hoặc làm người học thấy mình kém (content-standard §4, nghiên cứu 10.4). */
const FILLER_WORDS = ['đơn giản', 'dễ dàng', 'chỉ cần', 'chúng ta', 'đơn thuần', 'hiển nhiên', 'rõ ràng là'];

interface JsxElement extends Parent {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string | null;
  attributes: { type: string; name?: string; value?: unknown }[];
}

interface CodeNode extends Node {
  type: 'code';
  lang?: string | null;
  meta?: string | null;
  value: string;
}

interface HeadingNode extends Parent {
  type: 'heading';
  depth: number;
}

const isElement = (node: Node, name?: string): node is JsxElement =>
  (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && (name === undefined || (node as JsxElement).name === name);

const calloutKind = (node: Node) =>
  isElement(node, 'Callout') ? node.attributes.find((a) => a.name === 'kind')?.value : undefined;

function plainText(node: Node): string {
  if (node.type === 'text' || node.type === 'inlineCode') return (node as Node & { value: string }).value;
  return 'children' in node ? (node as Parent).children.map(plainText).join('') : '';
}

export function validateReadingStyle(body: string): string[] {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(body);
  const errors: string[] = [];

  // Mục lục bài đọc lồng các ### của phần Kiến thức, nên ### nằm chỗ khác là lạc khỏi mục lục.
  for (const child of tree.children as Node[]) {
    if (isElement(child, 'Knowledge')) continue;
    visit(child, 'heading', (heading: HeadingNode) => {
      if (heading.depth === 3) {
        errors.push(`Đề mục ### "${plainText(heading)}" phải nằm trong <Knowledge> (mục lục chỉ lồng đề mục của phần Kiến thức)`);
      }
    });
  }

  const knowledge = (tree.children as Node[]).find((child) => isElement(child, 'Knowledge')) as JsxElement | undefined;
  if (knowledge) {
    const kinds = knowledge.children.map(calloutKind);
    const count = (kind: string) => kinds.filter((k) => k === kind).length;
    if (count('ai') !== 1 || count('link') !== 1 || kinds.at(-2) !== 'ai' || kinds.at(-1) !== 'link') {
      errors.push('Phần <Knowledge> phải kết thúc bằng đúng một <Callout kind="ai"> rồi một <Callout kind="link">');
    }
  }

  let production = 0;
  visit(tree, (node: Node) => {
    if (calloutKind(node) === 'production') production++;
  });
  if (production > 2) errors.push(`Bài đọc có ${production} callout "production"; tối đa 2`);

  visit(tree, 'code', (code: CodeNode) => {
    const title = /title="[^"]*"/.exec(code.meta ?? '');
    if (title) errors.push(`Khối code ghi tên file (${title[0]}); bài đọc chỉ hiện code (content-standard §3.3)`);
    const elided = code.lang !== 'text' && code.value.split('\n').some((line) => line.trim() === '...' || line.includes('(...)'));
    if (elided) errors.push('Khối code dùng "..." để lược bỏ; ghi phần lược bỏ bằng comment hợp lệ, ví dụ // các field khác');
  });

  // Chỉ xét văn: text trong code và inline code không phải lời của bài.
  const prose: string[] = [];
  visit(tree, 'text', (text: Node & { value: string }) => {
    prose.push(text.value);
  });
  const joined = prose.join('\n');
  const found = FILLER_WORDS.map((word) => ({ word, at: joined.search(new RegExp(`(?<!\\p{L})${word}(?!\\p{L})`, 'iu')) }))
    .filter((hit) => hit.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((hit) => `"${hit.word}"`);
  if (found.length > 0) errors.push(`Văn bài dùng ${found.join(', ')}; viết lại theo giọng văn ở content-standard §4`);

  return errors;
}
