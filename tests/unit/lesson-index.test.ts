import { describe, expect, it } from 'vitest';
import { buildSearchFile, groupResults, toDocuments, type SearchSourcePage } from '@/lib/search/lesson-index';

const page: SearchSourcePage = {
  url: '/vi/learn/d1/d1-1',
  title: 'Tiến trình',
  description: 'Mô tả bài',
  crumbs: ['DevOps', 'D1 Linux'],
  structuredData: {
    headings: [{ id: 'tien-trinh', content: 'Tiến trình là gì' }],
    contents: [
      { heading: undefined, content: 'Mở đầu' },
      { heading: 'tien-trinh', content: 'Mỗi chương trình đang chạy' },
    ],
  },
};

describe('buildSearchFile', () => {
  it('giữ tiêu đề, mục, đoạn văn và thêm mô tả như một đoạn không có mục', () => {
    expect(buildSearchFile([page])).toEqual({
      v: 1,
      pages: [
        {
          url: '/vi/learn/d1/d1-1',
          title: 'Tiến trình',
          crumbs: ['DevOps', 'D1 Linux'],
          headings: [['tien-trinh', 'Tiến trình là gì']],
          texts: [
            ['', 'Mô tả bài'],
            ['', 'Mở đầu'],
            ['tien-trinh', 'Mỗi chương trình đang chạy'],
          ],
        },
      ],
    });
  });

  it('không thêm mô tả khi đã có đoạn văn trùng', () => {
    const same = { ...page, description: 'Mở đầu' };
    expect(buildSearchFile([same]).pages[0].texts.filter(([, c]) => c === 'Mở đầu')).toHaveLength(1);
  });
});

describe('toDocuments', () => {
  it('trải file thành tài liệu trang, mục và đoạn văn với url đúng', () => {
    const docs = toDocuments(buildSearchFile([page]));
    expect(docs[0]).toEqual({ id: '/vi/learn/d1/d1-1', page_id: '/vi/learn/d1/d1-1', type: 'page', content: 'Tiến trình', url: '/vi/learn/d1/d1-1' });
    expect(docs.filter((d) => d.type === 'heading').map((d) => d.url)).toEqual(['/vi/learn/d1/d1-1#tien-trinh']);
    expect(docs.filter((d) => d.type === 'text').map((d) => d.url)).toEqual(['/vi/learn/d1/d1-1', '/vi/learn/d1/d1-1', '/vi/learn/d1/d1-1#tien-trinh']);
    expect(new Set(docs.map((d) => d.id)).size).toBe(docs.length);
  });
});

describe('groupResults', () => {
  const file = buildSearchFile([page]);
  const pages = new Map(file.pages.map((p) => [p.url, p]));
  const docs = toDocuments(file);

  it('trang đứng trước các dòng khớp của nó, có breadcrumbs, không lặp dòng trang', () => {
    const groups = [{ values: [page.url], result: [{ document: docs[0] }, { document: docs[1] }, { document: docs[4] }] }];
    const out = groupResults(groups, pages, 'tiến');
    expect(out.map((r) => [r.type, r.url])).toEqual([
      ['page', page.url],
      ['heading', `${page.url}#tien-trinh`],
      ['text', `${page.url}#tien-trinh`],
    ]);
    expect(out[0].breadcrumbs).toEqual(['DevOps', 'D1 Linux']);
    expect(out[0].content).toContain('<mark>');
  });

  it('bỏ nhóm không có trang và dừng ở limit', () => {
    const groups = [
      { values: ['/khong-co'], result: [] },
      { values: [page.url], result: docs.map((document) => ({ document })) },
    ];
    expect(groupResults(groups, pages, 'x', 2)).toHaveLength(2);
  });
});
