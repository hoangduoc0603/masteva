# Chỉ mục tìm kiếm gọn: kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay bản xuất Orama 16 MB (`/api/search`) bằng file tài liệu gọn theo ngôn ngữ (`/<lang>/search.json`), dựng chỉ mục zbsearch trên trình duyệt khi mở ⌘K lần đầu.

**Architecture:** Hàm thuần trong `src/lib/search/lesson-index.ts` biến trang Fumadocs thành file gọn (build) và file gọn thành tài liệu zbsearch, gom kết quả theo trang (trình duyệt). `src/lib/search/lesson-client.ts` tạo `SearchClient` của Fumadocs có cache và thử lại khi lỗi. Route tĩnh `src/app/[lang]/search.json/route.ts` sinh file lúc build; `src/components/search.tsx` dùng client mới.

**Tech Stack:** Next.js 16 static export, Fumadocs 16.15, zbsearch 4.0.1, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-05-chi-muc-tim-kiem-gon-design.md`

## Global Constraints

- Static export: route handler phải `dynamic = 'force-static'`, `dynamicParams = false`, có `generateStaticParams`.
- Trình duyệt không import Zod, `repo.ts`, `manifest.ts`; `lesson-index.ts` và `lesson-client.ts` chỉ import `zbsearch`, `fumadocs-core/search` và tokenizer.
- Cùng tokenizer `createVietnameseTokenizer()` (ADR-005); `sort` tắt.
- TDD bắt buộc cho `src/lib/search`.
- File `vi` dưới 2 MB chưa nén, dưới 500 KB gzip với nội dung hiện tại.
- Không commit (người dùng chưa yêu cầu).

## Review Focus

1. Tải `search.json` lỗi (mạng chập chờn): hộp tìm không sập, lần gõ sau tải lại (unit ở Task 3).
2. Gõ nhanh khi file đang tải: chỉ một request (unit ở Task 3, E2E ở Task 4).
3. Đoạn văn trước tiêu đề mục đầu tiên (không có `heading`): url không có `#` thừa (unit ở Task 1).
4. Trang có `description` trùng một đoạn văn: không lặp kết quả (unit ở Task 1).
5. Trang `en` dùng nội dung dự phòng tiếng Việt: hộp tìm `en` vẫn ra kết quả, không lỗi 404 (E2E chạy với `vi,en` ở Task 4 mở ⌘K trên trang `vi`; file `en` kiểm bằng request trực tiếp).

---

### Task 1: `buildSearchFile` và `toDocuments` (TDD)

**Files:**
- Create: `src/lib/search/lesson-index.ts`
- Test: `tests/unit/lesson-index.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface SearchSourcePage { url: string; title: string; description?: string; crumbs: string[]; structuredData: { headings: { id: string; content: string }[]; contents: { heading: string | undefined; content: string }[] } }
  export interface SearchFilePage { url: string; title: string; crumbs: string[]; headings: [string, string][]; texts: [string, string][] }
  export interface SearchFile { v: 1; pages: SearchFilePage[] }
  export interface SearchDoc { id: string; page_id: string; type: 'page' | 'heading' | 'text'; content: string; url: string }
  export function buildSearchFile(pages: SearchSourcePage[]): SearchFile
  export function toDocuments(file: SearchFile): SearchDoc[]
  ```

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest';
import { buildSearchFile, toDocuments, type SearchSourcePage } from '@/lib/search/lesson-index';

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
          texts: [['', 'Mô tả bài'], ['', 'Mở đầu'], ['tien-trinh', 'Mỗi chương trình đang chạy']],
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
```

- [ ] **Step 2:** `pnpm vitest run tests/unit/lesson-index.test.ts` → FAIL (module chưa có).
- [ ] **Step 3: Code**

```ts
/**
 * Chỉ mục tìm nội dung bài (⌘K) ở dạng gọn (spec 2026-10-05, ADR-009): lúc build chỉ xuất nội dung,
 * trình duyệt dựng chỉ mục zbsearch khi mở hộp tìm lần đầu.
 */
export interface SearchSourcePage { … như Interfaces … }
export interface SearchFilePage { … }
export interface SearchFile { v: 1; pages: SearchFilePage[] }
export interface SearchDoc { … }

export function buildSearchFile(pages: SearchSourcePage[]): SearchFile {
  return {
    v: 1,
    pages: pages.map((p) => {
      const texts: [string, string][] = p.structuredData.contents.map((c) => [c.heading ?? '', c.content]);
      if (p.description && !texts.some(([, c]) => c === p.description)) texts.unshift(['', p.description]);
      return { url: p.url, title: p.title, crumbs: p.crumbs, headings: p.structuredData.headings.map((h) => [h.id, h.content]), texts };
    }),
  };
}

export function toDocuments(file: SearchFile): SearchDoc[] {
  return file.pages.flatMap((p) => {
    let n = 0;
    const doc = (type: SearchDoc['type'], content: string, anchor: string): SearchDoc => ({
      id: `${p.url}-${n++}`, page_id: p.url, type, content, url: anchor ? `${p.url}#${anchor}` : p.url,
    });
    return [
      { id: p.url, page_id: p.url, type: 'page' as const, content: p.title, url: p.url },
      ...p.headings.map(([id, content]) => doc('heading', content, id)),
      ...p.texts.map(([id, content]) => doc('text', content, id)),
    ];
  });
}
```

- [ ] **Step 4:** chạy lại → PASS.

### Task 2: `groupResults` (TDD)

**Files:** Modify `src/lib/search/lesson-index.ts`; Test `tests/unit/lesson-index.test.ts`.

**Interfaces:**
- Produces: `export interface SearchGroup { values: unknown[]; result: { document: SearchDoc }[] }` và `export function groupResults(groups: SearchGroup[], pages: Map<string, SearchFilePage>, query: string, limit?: number): SortedResult[]` (`SortedResult` từ `fumadocs-core/search`).

Hành vi giống `searchAdvanced` của Fumadocs: mỗi nhóm thêm một dòng `page` (id là url trang, nội dung là tiêu đề đã tô), rồi các dòng không phải `page` của nhóm; dừng khi đủ `limit` (mặc định 60); `breadcrumbs` lấy `crumbs` của trang; nhóm không tìm thấy trang thì bỏ qua.

- [ ] **Step 1: Test**

```ts
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
    const groups = [{ values: ['/khong-co'], result: [] }, { values: [page.url], result: docs.map((document) => ({ document })) }];
    expect(groupResults(groups, pages, 'x', 2)).toHaveLength(2);
  });
});
```

- [ ] **Step 2:** FAIL (`groupResults` chưa có). **Step 3:** code theo hành vi trên với `createContentHighlighter(query).highlightMarkdown`. **Step 4:** PASS.

### Task 3: `createLessonSearchClient` (TDD)

**Files:** Create `src/lib/search/lesson-client.ts`; Test `tests/unit/lesson-client.test.ts`.

**Interfaces:**
- Consumes: `SearchFile`, `toDocuments`, `groupResults`, `createVietnameseTokenizer`.
- Produces: `export function createLessonSearchClient(load: () => Promise<SearchFile>): SearchClient` (`SearchClient` = `{ search(query: string): Promise<SortedResult[]> }`, kiểu lấy từ `fumadocs-core/search/client`).

Hành vi: từ khoá rỗng sau `trim` trả `[]` và không gọi `load`; lần đầu gọi `load` một lần, dựng DB zbsearch (`schema { id, page_id, type, content, url }` đều `'string'`, tokenizer tiếng Việt, `sort: { enabled: false }`, `insertMultiple`); các lần gọi đồng thời dùng chung promise; `load` lỗi thì trả `[]` và lần sau gọi lại `load`; tìm `{ term, properties: ['content'], limit: 60, groupBy: { properties: ['page_id'], maxResult: 8 } }` rồi `groupResults`.

- [ ] **Step 1: Test**

```ts
import { describe, expect, it, vi } from 'vitest';
import { buildSearchFile } from '@/lib/search/lesson-index';
import { createLessonSearchClient } from '@/lib/search/lesson-client';

const file = buildSearchFile([
  { url: '/vi/learn/d1/d1-1', title: 'Tiến trình, signal, systemd và journald', crumbs: ['DevOps', 'D1 Linux'], structuredData: { headings: [], contents: [{ heading: undefined, content: 'Quản lý tiến trình' }] } },
  { url: '/vi/learn/j1/j1-1', title: 'JDK, javac và jshell', crumbs: ['Java', 'J1 Công cụ'], structuredData: { headings: [], contents: [{ heading: undefined, content: 'Cài JDK 25' }] } },
]);

describe('createLessonSearchClient', () => {
  it('gõ không dấu ra trang có dấu', async () => {
    const client = createLessonSearchClient(async () => file);
    const out = await client.search('tien trinh');
    expect(out[0]).toMatchObject({ type: 'page', url: '/vi/learn/d1/d1-1' });
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
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(file);
    const client = createLessonSearchClient(load);
    expect(await client.search('jdk')).toEqual([]);
    expect((await client.search('jdk'))[0]).toMatchObject({ url: '/vi/learn/j1/j1-1' });
    expect(load).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2:** FAIL. **Step 3:** code. **Step 4:** PASS; `pnpm typecheck`.

### Task 4: Route `search.json`, hộp ⌘K dùng client mới, gỡ `/api/search`

**Files:**
- Create: `src/app/[lang]/search.json/route.ts`
- Modify: `src/components/search.tsx`
- Delete: `src/app/api/search/route.ts`
- Test: `tests/e2e/learning.spec.ts`

- Route: giống `topics.json`; `generateStaticParams` → `i18n.languages.map((lang) => ({ lang }))`; `GET` lấy `source.getPages(lang)`, đọc `structuredData` (giá trị, hàm, hoặc `page.data.load()` như `buildIndexDefault` của Fumadocs), `crumbs` = `[t.tracks[ctx.roadmap.track], \`${ctx.step.code} ${ctx.step.title}\`]` với `ctx = getLessonContext(page.data.id, lang)` (không có ngữ cảnh thì `[]`), trả `Response.json(buildSearchFile(pages))`.
- `search.tsx`: bỏ `staticClient`, `initDB`, `create`; thêm `const clients = new Map<string, SearchClient>()` và `clientFor(locale)` tạo `createLessonSearchClient(() => fetch(\`/${locale}/search.json\`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))))`; `useDocsSearch({ client: clientFor(locale) })` (kiểm tra `ClientPreset` có nhận client tuỳ chỉnh; nếu không, dùng preset `type: 'custom'` hoặc tương đương mà bản Fumadocs này hỗ trợ — ghi Ruling).
- E2E mới:
  - `hộp ⌘K chỉ tải search.json khi mở và chỉ một lần`: theo dõi `page.on('request')` các url chứa `search.json`; vào `/vi/roadmaps/java`, chờ `networkidle`, đếm 0; mở ⌘K, gõ "tien trinh" rồi "jdk", thấy kết quả; đếm đúng 1 và url kết thúc `/vi/search.json`.
  - `file search.json gọn, /api/search không còn`: `request.get('/vi/search.json')` ok, độ dài body < 2 MB; `request.get('/en/search.json')` ok; `request.get('/api/search')` status 404.
- [ ] `pnpm e2e:build`, chạy E2E liên quan; ghi kích thước file `vi` (thô và gzip) vào ledger.

### Task 5: Tài liệu và kiểm tra cuối

- `docs/architecture.md`: thêm dòng ADR-009 vào bảng ADR; sửa đoạn nhắc `/api/search` nếu có.
- `docs/status.md`: thay dòng chỉ mục 16 MB bằng số đo mới.
- `pnpm verify`; review cuối bằng subagent; không commit.
