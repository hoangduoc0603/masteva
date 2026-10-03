import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import { parse as parseYaml } from 'yaml';
import type { Node } from 'unist';

export interface ExtractedLesson {
  /** Tên các component khung bài ở cấp cao nhất, theo thứ tự xuất hiện. */
  sections: string[];
  /** Mã của mọi `<Check id="…">`, theo thứ tự xuất hiện. */
  checkIds: string[];
  /** Check thiếu `id` hoặc `id` không phải chuỗi cố định. */
  invalidChecks: number;
  /** Mọi đường dẫn trong link Markdown và thuộc tính `href`. */
  links: string[];
}

interface JsxAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

interface JsxElement extends Node {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string | null;
  attributes: JsxAttribute[];
}

interface LinkNode extends Node {
  type: 'link';
  url: string;
}

function isJsxElement(node: Node): node is JsxElement {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

function stringAttribute(node: JsxElement, name: string): string | undefined {
  const attr = node.attributes.find((a) => a.type === 'mdxJsxAttribute' && a.name === name);
  return typeof attr?.value === 'string' ? attr.value : undefined;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function splitFrontmatter(raw: string): { data: unknown; body: string } {
  const match = FRONTMATTER.exec(raw);
  if (!match) return { data: {}, body: raw };
  return { data: parseYaml(match[1]) ?? {}, body: raw.slice(match[0].length) };
}

export function extractLesson(body: string, sectionNames: readonly string[]): ExtractedLesson {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(body);
  const result: ExtractedLesson = { sections: [], checkIds: [], invalidChecks: 0, links: [] };

  for (const child of tree.children as Node[]) {
    if (isJsxElement(child) && child.name && sectionNames.includes(child.name)) {
      result.sections.push(child.name);
    }
  }

  visit(tree, (node: Node) => {
    if (node.type === 'link') {
      result.links.push((node as LinkNode).url);
      return;
    }
    if (!isJsxElement(node)) return;
    const href = stringAttribute(node, 'href');
    if (href) result.links.push(href);
    if (node.name === 'Check') {
      const id = stringAttribute(node, 'id');
      if (id) result.checkIds.push(id);
      else result.invalidChecks += 1;
    }
  });

  return result;
}
