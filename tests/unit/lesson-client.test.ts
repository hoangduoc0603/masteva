import { describe, expect, it, vi } from 'vitest';
import { buildSearchFile, type SearchFile } from '@/lib/search/lesson-index';
import { createLessonSearchClient } from '@/lib/search/lesson-client';

const file = buildSearchFile([
  {
    url: '/vi/learn/d1/d1-1',
    title: 'Tiến trình, signal, systemd và journald',
    crumbs: ['DevOps', 'D1 Linux'],
    structuredData: { headings: [], contents: [{ heading: undefined, content: 'Quản lý tiến trình' }] },
  },
  {
    url: '/vi/learn/j1/j1-1',
    title: 'JDK, javac và jshell',
    crumbs: ['Java', 'J1 Công cụ'],
    structuredData: { headings: [], contents: [{ heading: undefined, content: 'Cài JDK 25' }] },
  },
]);

describe('createLessonSearchClient', () => {
  it('gõ không dấu ra trang có dấu', async () => {
    const client = createLessonSearchClient(async () => file);
    const out = await client.search('tien trinh');
    expect(out[0]).toMatchObject({ type: 'page', url: '/vi/learn/d1/d1-1', breadcrumbs: ['DevOps', 'D1 Linux'] });
    expect(out.some((r) => r.url === '/vi/learn/j1/j1-1')).toBe(false);
  });

  it('từ khoá rỗng không tải file', async () => {
    const load = vi.fn(async () => file);
    expect(await createLessonSearchClient(load).search('   ')).toEqual([]);
    expect(load).not.toHaveBeenCalled();
  });

  it('tìm đồng thời chỉ tải một lần', async () => {
    const load = vi.fn(async () => file);
    const client = createLessonSearchClient(load);
    await Promise.all([client.search('jdk'), client.search('javac'), client.search('tien')]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('tải lỗi thì trả rỗng và lần sau tải lại', async () => {
    const load = vi.fn<() => Promise<SearchFile>>().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(file);
    const client = createLessonSearchClient(load);
    expect(await client.search('jdk')).toEqual([]);
    expect((await client.search('jdk'))[0]).toMatchObject({ url: '/vi/learn/j1/j1-1' });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('dựng chỉ mục theo lô, nhường luồng chính giữa các lô', async () => {
    const big = buildSearchFile(
      Array.from({ length: 300 }, (_, i) => ({
        url: `/vi/learn/x/x-${i}`,
        title: `Bài ${i}`,
        crumbs: [],
        structuredData: { headings: [], contents: Array.from({ length: 10 }, (_, k) => ({ heading: undefined, content: `đoạn ${k} của bài ${i}` })) },
      })),
    );
    let ticked = false;
    setTimeout(() => {
      ticked = true;
    }, 0);
    await createLessonSearchClient(async () => big).search('bai');
    expect(ticked).toBe(true);
  });
});
