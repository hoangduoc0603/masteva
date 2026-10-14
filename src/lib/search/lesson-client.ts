import { create, insertMultipleAsync, search } from 'zbsearch';
import type { SearchClient } from 'fumadocs-core/search/client';
import type { SortedResult } from 'fumadocs-core/search';
import { createVietnameseTokenizer } from './vi-tokenizer';
import { groupResults, toDocuments, type SearchFile, type SearchFilePage } from './lesson-index';

const schema = { id: 'string', page_id: 'string', type: 'string', content: 'string', url: 'string' } as const;

export interface LessonSearchOptions {
  /** Mã các file nội dung (mỗi roadmap một hoặc vài file), theo thứ tự hiển thị. */
  ids: readonly string[];
  load: (id: string) => Promise<SearchFile>;
}

export interface LessonSearchClient extends SearchClient {
  /** Các file cần có trước (của roadmap đang xem): tìm trả kết quả ngay khi cả nhóm này vào chỉ mục. */
  setFirst(ids: readonly string[]): void;
  /** Số file đã vào chỉ mục. */
  loadedCount(): number;
  /** Báo mỗi khi thêm một file vào chỉ mục, để giao diện tìm lại và bổ sung kết quả. */
  subscribe(listener: () => void): () => void;
}

/**
 * Client tìm nội dung bài cho hộp ⌘K (ADR-009). Nội dung chia thành nhiều file theo roadmap: lần tìm đầu tải
 * mọi file song song và đưa dần vào một chỉ mục chung. Có nhóm file ưu tiên thì trả kết quả ngay khi nhóm đó xong,
 * các file khác vào sau và giao diện tìm lại. File tải lỗi bị bỏ qua lần này, lần tìm sau tải lại.
 */
export function createLessonSearchClient({ ids, load }: LessonSearchOptions): LessonSearchClient {
  // Cùng tokenizer tiếng Việt như ô tìm trang chủ (ADR-005); không cần sắp xếp nên tắt `sort` cho nhẹ.
  const db = create({ schema, components: { tokenizer: createVietnameseTokenizer() }, sort: { enabled: false } });
  const pages = new Map<string, SearchFilePage>();
  const tasks = new Map<string, Promise<void>>();
  const listeners = new Set<() => void>();
  let inserting: Promise<void> = Promise.resolve();
  let loaded = 0;
  let first: readonly string[] = [];

  const insert = (file: SearchFile): Promise<void> => {
    // Chèn lần lượt từng file, theo lô và nhường luồng chính giữa các lô: dựng cả nghìn tài liệu một mạch làm ô gõ đứng.
    inserting = inserting.then(async () => {
      await insertMultipleAsync(db, toDocuments(file), { batchSize: 500 });
      for (const page of file.pages) pages.set(page.url, page);
      loaded += 1;
      for (const listener of listeners) listener();
    });
    return inserting;
  };

  /** Tải một file rồi đưa vào chỉ mục; `after` là việc phải xong trước khi chèn (nhóm file ưu tiên). */
  const ensure = (id: string, after: Promise<void> = Promise.resolve()): Promise<void> => {
    let task = tasks.get(id);
    if (!task) {
      task = Promise.all([load(id), after])
        .then(([file]) => insert(file))
        .catch(() => {
          tasks.delete(id);
        });
      tasks.set(id, task);
    }
    return task;
  };

  return {
    setFirst(next) {
      first = next;
    },
    loadedCount: () => loaded,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async search(query: string): Promise<SortedResult[]> {
      const term = query.trim();
      if (!term) return [];
      const priority = first.filter((id) => ids.includes(id));
      // Mọi file tải song song; nhóm ưu tiên vào chỉ mục trước, các file khác chèn sau cả nhóm.
      if (priority.length > 0) {
        const head = Promise.all(priority.map((id) => ensure(id))).then(() => undefined);
        for (const id of ids) if (!priority.includes(id)) void ensure(id, head);
        await head;
      } else {
        await Promise.all(ids.map((id) => ensure(id)));
      }
      const result = await search(db, {
        term,
        properties: ['content'],
        limit: 60,
        groupBy: { properties: ['page_id'], maxResult: 8 },
      });
      return groupResults(result.groups ?? [], pages, term);
    },
  };
}
