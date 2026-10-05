import { create, insertMultipleAsync, search } from 'zbsearch';
import type { SearchClient } from 'fumadocs-core/search/client';
import type { SortedResult } from 'fumadocs-core/search';
import { createVietnameseTokenizer } from './vi-tokenizer';
import { groupResults, toDocuments, type SearchFile, type SearchFilePage } from './lesson-index';

const schema = { id: 'string', page_id: 'string', type: 'string', content: 'string', url: 'string' } as const;

async function buildIndex(file: SearchFile) {
  // Cùng tokenizer tiếng Việt như ô tìm trang chủ (ADR-005); không cần sắp xếp nên tắt `sort` cho nhẹ.
  const db = create({ schema, components: { tokenizer: createVietnameseTokenizer() }, sort: { enabled: false } });
  // Chèn theo lô và nhường luồng chính giữa các lô: dựng ~8k tài liệu một mạch làm ô gõ đứng hàng trăm ms.
  await insertMultipleAsync(db, toDocuments(file), { batchSize: 500 });
  return { db, pages: new Map<string, SearchFilePage>(file.pages.map((p) => [p.url, p])) };
}

/**
 * Client tìm nội dung bài cho hộp ⌘K (ADR-009): tải file gọn ở lần tìm đầu, dựng chỉ mục một lần,
 * các lần tìm đồng thời dùng chung; tải lỗi thì trả rỗng và lần sau thử lại.
 */
export function createLessonSearchClient(load: () => Promise<SearchFile>): SearchClient {
  let ready: ReturnType<typeof buildIndex> | null = null;
  return {
    async search(query: string): Promise<SortedResult[]> {
      const term = query.trim();
      if (!term) return [];
      ready ??= load().then(buildIndex);
      let index: Awaited<ReturnType<typeof buildIndex>>;
      try {
        index = await ready;
      } catch {
        ready = null;
        return [];
      }
      const result = await search(index.db, {
        term,
        properties: ['content'],
        limit: 60,
        groupBy: { properties: ['page_id'], maxResult: 8 },
      });
      return groupResults(result.groups ?? [], index.pages, term);
    },
  };
}
