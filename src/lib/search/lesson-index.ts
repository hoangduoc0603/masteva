/**
 * Chỉ mục tìm nội dung bài (⌘K) ở dạng gọn (spec 2026-10-05, ADR-009). Lúc build chỉ xuất nội dung
 * từng trang theo ngôn ngữ; trình duyệt trải ra thành tài liệu zbsearch và dựng chỉ mục khi mở hộp tìm.
 * Cách trải và gom kết quả theo đúng `buildDocuments`/`searchAdvanced` của Fumadocs để kết quả không đổi.
 */
import { createContentHighlighter, type SortedResult } from 'fumadocs-core/search';

/** Một trang bài lúc build, lấy từ `source` của Fumadocs. */
export interface SearchSourcePage {
  url: string;
  title: string;
  description?: string;
  crumbs: string[];
  structuredData: {
    headings: { id: string; content: string }[];
    contents: { heading: string | undefined; content: string }[];
  };
}

/** `headings` là `[id, nội dung]`; `texts` là `[id mục chứa đoạn, nội dung]`, id rỗng khi không thuộc mục nào. */
export interface SearchFilePage {
  url: string;
  title: string;
  crumbs: string[];
  headings: [string, string][];
  texts: [string, string][];
}

export interface SearchFile {
  v: 1;
  pages: SearchFilePage[];
}

export interface SearchDoc {
  id: string;
  page_id: string;
  type: 'page' | 'heading' | 'text';
  content: string;
  url: string;
}

export function buildSearchFile(pages: SearchSourcePage[]): SearchFile {
  return {
    v: 1,
    pages: pages.map((p) => {
      const texts = p.structuredData.contents.map((c): [string, string] => [c.heading ?? '', c.content]);
      // Như Fumadocs: mô tả trang là một đoạn văn, trừ khi đã có đoạn trùng.
      if (p.description && !texts.some(([, content]) => content === p.description)) texts.unshift(['', p.description]);
      return {
        url: p.url,
        title: p.title,
        crumbs: p.crumbs,
        headings: p.structuredData.headings.map((h): [string, string] => [h.id, h.content]),
        texts,
      };
    }),
  };
}

export function toDocuments(file: SearchFile): SearchDoc[] {
  return file.pages.flatMap((p) => {
    let n = 0;
    const doc = (type: 'heading' | 'text', content: string, anchor: string): SearchDoc => ({
      id: `${p.url}-${n++}`,
      page_id: p.url,
      type,
      content,
      url: anchor ? `${p.url}#${anchor}` : p.url,
    });
    return [
      { id: p.url, page_id: p.url, type: 'page' as const, content: p.title, url: p.url },
      ...p.headings.map(([id, content]) => doc('heading', content, id)),
      ...p.texts.map(([id, content]) => doc('text', content, id)),
    ];
  });
}

/** Một nhóm kết quả của zbsearch khi tìm với `groupBy: { properties: ['page_id'] }`. */
export interface SearchGroup {
  values: unknown[];
  /** zbsearch trả `type` dạng chuỗi theo schema, nên không dùng thẳng `SearchDoc`. */
  result: { document: Pick<SearchDoc, 'id' | 'content' | 'url'> & { type: string } }[];
}

/** Gom kết quả theo trang như `searchAdvanced` của Fumadocs: dòng trang trước, rồi các mục và đoạn khớp. */
export function groupResults(groups: SearchGroup[], pages: Map<string, SearchFilePage>, query: string, limit = 60): SortedResult[] {
  const highlighter = createContentHighlighter(query);
  const list: SortedResult[] = [];
  for (const group of groups) {
    if (list.length >= limit) break;
    const page = pages.get(String(group.values[0]));
    if (!page) continue;
    list.push({ id: page.url, type: 'page', content: highlighter.highlightMarkdown(page.title), breadcrumbs: page.crumbs, url: page.url });
    for (const { document } of group.result) {
      if (list.length >= limit) break;
      if (document.type === 'page') continue;
      list.push({
        id: document.id,
        type: document.type === 'heading' ? 'heading' : 'text',
        content: highlighter.highlightMarkdown(document.content),
        breadcrumbs: page.crumbs,
        url: document.url,
      });
    }
  }
  return list;
}
