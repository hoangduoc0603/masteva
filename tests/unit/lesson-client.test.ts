import { describe, expect, it, vi } from 'vitest';
import { buildSearchFile, type SearchFile } from '@/lib/search/lesson-index';
import { createLessonSearchClient } from '@/lib/search/lesson-client';

const devops = buildSearchFile([
  {
    url: '/vi/learn/d1/d1-1',
    title: 'Tiến trình, signal, systemd và journald',
    crumbs: ['DevOps', 'D1 Linux'],
    structuredData: { headings: [], contents: [{ heading: undefined, content: 'Quản lý tiến trình' }] },
  },
]);
const java = buildSearchFile([
  {
    url: '/vi/learn/j1/j1-1',
    title: 'JDK, javac và jshell',
    crumbs: ['Java', 'J1 Công cụ'],
    structuredData: { headings: [], contents: [{ heading: undefined, content: 'Cài JDK 25 và quản lý tiến trình build' }] },
  },
]);
const kubernetes = buildSearchFile([
  {
    url: '/vi/learn/k5/k5-1',
    title: 'Scheduler, affinity, taint và toleration',
    crumbs: ['Kubernetes', 'K5 Scheduling'],
    structuredData: { headings: [], contents: [{ heading: undefined, content: 'Scheduler chọn node cho tiến trình của pod' }] },
  },
]);
const files: Record<string, SearchFile> = { devops, java, kubernetes };
const loader = () => vi.fn(async (id: string) => files[id]);

/** Một promise điều khiển bằng tay, để giữ một file "đang tải". */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe('createLessonSearchClient', () => {
  it('gõ không dấu ra trang có dấu, tìm trên mọi file', async () => {
    const client = createLessonSearchClient({ ids: ['java', 'devops'], load: loader() });
    const out = await client.search('tien trinh');
    expect(out.filter((r) => r.type === 'page').map((r) => r.url).sort()).toEqual(['/vi/learn/d1/d1-1', '/vi/learn/j1/j1-1']);
    expect(out.find((r) => r.url === '/vi/learn/d1/d1-1')).toMatchObject({ breadcrumbs: ['DevOps', 'D1 Linux'] });
    expect((await client.search('jshell')).some((r) => r.url === '/vi/learn/d1/d1-1')).toBe(false);
  });

  it('từ khoá rỗng không tải file', async () => {
    const load = loader();
    expect(await createLessonSearchClient({ ids: ['java', 'devops'], load }).search('   ')).toEqual([]);
    expect(load).not.toHaveBeenCalled();
  });

  it('tìm đồng thời chỉ tải mỗi file một lần', async () => {
    const load = loader();
    const client = createLessonSearchClient({ ids: ['java', 'devops'], load });
    await Promise.all([client.search('jdk'), client.search('javac'), client.search('tien')]);
    expect(load.mock.calls.map(([id]) => id).sort()).toEqual(['devops', 'java']);
  });

  it('có file ưu tiên thì trả kết quả của nó trước, báo khi file khác vào chỉ mục', async () => {
    const slow = deferred<SearchFile>();
    const load = vi.fn((id: string) => (id === 'java' ? slow.promise : Promise.resolve(files[id])));
    const client = createLessonSearchClient({ ids: ['java', 'devops'], load });
    const changes = vi.fn();
    client.subscribe(changes);
    client.setFirst(['devops']);

    const early = await client.search('tien trinh');
    expect(load.mock.calls.map(([id]) => id)).toEqual(['devops', 'java']);
    expect(early.filter((r) => r.type === 'page').map((r) => r.url)).toEqual(['/vi/learn/d1/d1-1']);
    expect(client.loadedCount()).toBe(1);

    slow.resolve(java);
    await vi.waitFor(() => expect(client.loadedCount()).toBe(2));
    expect(changes).toHaveBeenCalledTimes(2);
    const full = await client.search('tien trinh');
    expect(full.filter((r) => r.type === 'page')).toHaveLength(2);
  });

  it('ưu tiên cả nhóm file của một roadmap: trả kết quả khi cả nhóm vào chỉ mục, file khác vào sau', async () => {
    const slow = deferred<SearchFile>();
    const load = vi.fn((id: string) => (id === 'java' ? slow.promise : Promise.resolve(files[id])));
    const client = createLessonSearchClient({ ids: ['java', 'devops', 'kubernetes'], load });
    client.setFirst(['devops', 'kubernetes']);

    const early = await client.search('tien trinh');
    expect(load.mock.calls.map(([id]) => id).slice(0, 2)).toEqual(['devops', 'kubernetes']);
    expect(early.filter((r) => r.type === 'page').map((r) => r.url).sort()).toEqual(['/vi/learn/d1/d1-1', '/vi/learn/k5/k5-1']);
    expect(client.loadedCount()).toBe(2);

    slow.resolve(java);
    await vi.waitFor(() => expect(client.loadedCount()).toBe(3));
    expect((await client.search('tien trinh')).filter((r) => r.type === 'page')).toHaveLength(3);
  });

  it('file ưu tiên không có trong danh sách thì chờ mọi file', async () => {
    const client = createLessonSearchClient({ ids: ['java', 'devops'], load: loader() });
    client.setFirst(['khong-co']);
    expect((await client.search('tien trinh')).filter((r) => r.type === 'page')).toHaveLength(2);
  });

  it('một file tải lỗi thì vẫn tìm trên file còn lại, lần sau tải lại đúng file lỗi', async () => {
    const load = vi
      .fn<(id: string) => Promise<SearchFile>>()
      .mockImplementation(async (id) => files[id])
      .mockImplementationOnce(async () => Promise.reject(new Error('offline')));
    const client = createLessonSearchClient({ ids: ['java', 'devops'], load });
    const first = await client.search('tien trinh');
    expect(first.filter((r) => r.type === 'page').map((r) => r.url)).toEqual(['/vi/learn/d1/d1-1']);
    const second = await client.search('tien trinh');
    expect(second.filter((r) => r.type === 'page')).toHaveLength(2);
    expect(load.mock.calls.map(([id]) => id)).toEqual(['java', 'devops', 'java']);
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
    await createLessonSearchClient({ ids: ['x'], load: async () => big }).search('bai');
    expect(ticked).toBe(true);
  });
});
