# Trang chủ kiêm danh mục và phần đầu trang roadmap: kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang chủ thành nơi chọn roadmap có tìm kiếm roadmap và chủ đề; trang roadmap có phần đầu ổn định, thanh cấp dính và "Tôi đã biết" theo từng cấp.

**Architecture:** Chỉ mục tìm kiếm dựng lúc build (hàm thuần trong `views.ts`), truyền xuống component trình duyệt `RoadmapSearch` qua props; so khớp bằng hàm thuần `searchCatalog` dùng `normalizeVietnamese`. Phần đầu trang roadmap vẫn do `RoadmapClient` render; thanh dính thay `RoadmapToolbar`; đầu cấp vẫn là server component trong `roadmap-map.tsx`, nút đã biết xử lý bằng `data-*` qua bộ bắt click sẵn có.

**Tech Stack:** Next.js 16 static export, Fumadocs 16, React 19, TypeScript strict, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-05-trang-chu-roadmap-ux-design.md`. Bản mẫu: `design/home-v2.html`, `design/roadmap-v2.html`, CSS `design/v2.css`.

## Global Constraints

- Static export: không route động, không middleware, không server action.
- Component trình duyệt không import Zod, `src/lib/content/repo.ts`, `manifest.ts`; chỉ `import type` từ `views.ts`.
- `format` cho client lấy từ `@/lib/format`.
- Chữ giao diện có đủ `vi` và `en`; không em dash hay en dash trong chữ tiếng Việt.
- `design/roadmap.css` là nguồn; `src/app/roadmap.css` là bản chép y hệt (`cp`).
- TDD cho `src/lib/search` và `src/lib/content`; không TDD cho giao diện.
- WCAG AA, vùng chạm 44px trên mobile, tôn trọng `prefers-reduced-motion`.
- Không commit: lượt này người dùng chưa yêu cầu commit; báo lại khi xong.

## Review Focus

1. Từ khoá có dấu cách thừa, chữ hoa, có dấu hoặc không dấu: phải cho cùng kết quả (test ở Task 1).
2. Từ khoá khớp cả tên chủ đề lẫn tên chặng: chủ đề khớp tên đứng trước, không lặp (test ở Task 1).
3. Bấm "Tôi đã biết" ở Middle khi Nền tảng chưa biết: cả hai cấp thu gọn, nút "Vào học" nhảy sang Senior; "Hoàn tác" ở Middle chỉ mở lại Middle (E2E ở Task 6).
4. Khối tiếp tục khi đổi trạng thái: nút "Vào học" không dời chỗ (E2E đo `boundingBox` ở Task 5).
5. Mobile: bảng "Tuỳ chọn hiển thị" đóng khi bấm ra ngoài và khi nhấn Esc; không cuộn ngang (E2E ở Task 7).

---

### Task 1: `searchCatalog` (TDD)

**Files:**
- Create: `src/lib/search/catalog.ts`
- Test: `tests/unit/catalog.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface CatalogRoadmap { id: string; track: string; title: string; description: string }
  export interface CatalogTopic { roadmapId: string; code: string; stepTitle: string; id: string; title: string; hasLesson: boolean }
  export interface CatalogIndex { roadmaps: CatalogRoadmap[]; topics: CatalogTopic[] }
  export interface TopicHit { topic: CatalogTopic; mark: [number, number] | null } // vị trí tô trong topic.title
  export interface CatalogResult { roadmaps: CatalogRoadmap[]; topics: TopicHit[]; totalTopics: number }
  export function searchCatalog(index: CatalogIndex, query: string, limit?: number): CatalogResult // limit mặc định 8
  ```

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from 'vitest';
import { searchCatalog, type CatalogIndex } from '@/lib/search/catalog';

const index: CatalogIndex = {
  roadmaps: [
    { id: 'java', track: 'java', title: 'Java backend', description: 'Làm chủ Spring Boot trên production' },
    { id: 'devops', track: 'devops', title: 'DevOps', description: 'Container và Kubernetes' },
  ],
  topics: [
    { roadmapId: 'java', code: 'J12', stepTitle: 'Lưu trữ dữ liệu', id: 'j12.tx', title: 'Transaction và mức isolation', hasLesson: true },
    { roadmapId: 'java', code: 'J16', stepTitle: 'Cache và messaging', id: 'j16.kafka', title: 'Kafka hoặc RabbitMQ', hasLesson: true },
    { roadmapId: 'java', code: 'J16', stepTitle: 'Cache và messaging', id: 'j16.cache', title: 'Cache-aside và TTL', hasLesson: false },
    { roadmapId: 'devops', code: 'D5', stepTitle: 'Kafka trên Kubernetes', id: 'd5.ops', title: 'Vận hành broker', hasLesson: false },
    { roadmapId: 'java', code: 'J2', stepTitle: 'Ngôn ngữ Java', id: 'j2.dk', title: 'Điều khiển luồng', hasLesson: true },
  ],
};

describe('searchCatalog', () => {
  it('returns nothing for a blank query', () => {
    expect(searchCatalog(index, '   ')).toEqual({ roadmaps: [], topics: [], totalTopics: 0 });
  });

  it('matches without diacritics or case and marks the original title', () => {
    const r = searchCatalog(index, '  DIEU khien ');
    expect(r.topics.map((h) => h.topic.id)).toEqual(['j2.dk']);
    expect(r.topics[0].mark).toEqual([0, 10]);
    expect('Điều khiển luồng'.slice(0, 10)).toBe('Điều khiển');
  });

  it('puts title matches before step-title matches without duplicates', () => {
    const r = searchCatalog(index, 'kafka');
    expect(r.topics.map((h) => h.topic.id)).toEqual(['j16.kafka', 'd5.ops']);
    expect(r.topics[1].mark).toBeNull();
  });

  it('matches roadmaps by title or description', () => {
    expect(searchCatalog(index, 'kubernetes').roadmaps.map((x) => x.id)).toEqual(['devops']);
    expect(searchCatalog(index, 'spring').roadmaps.map((x) => x.id)).toEqual(['java']);
  });

  it('limits topics but reports the total', () => {
    const r = searchCatalog(index, 'a', 2);
    expect(r.topics).toHaveLength(2);
    expect(r.totalTopics).toBeGreaterThan(2);
  });
});
```

Ghi chú test thứ hai: `mark` là `[start, end)` theo chỉ số trong chuỗi gốc NFC; từ khoá sau khi bỏ khoảng trắng hai đầu là "dieu khien" (10 ký tự), khớp "Điều khiển" (10 ký tự NFC) nên `mark` = `[0, 10]`.

- [ ] **Step 2: Chạy, thấy fail vì module chưa có**

Run: `pnpm vitest run tests/unit/catalog.test.ts` → FAIL "Cannot find module".

- [ ] **Step 3: Cài đặt**

```ts
import { normalizeVietnamese } from './vi-tokenizer';

// (các interface như phần Interfaces)

/** Chuẩn hoá từng ký tự để biết vị trí khớp trong chuỗi gốc. */
function fold(text: string): { out: string; map: number[] } {
  let out = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    for (const ch of normalizeVietnamese(text[i])) {
      out += ch;
      map.push(i);
    }
  }
  return { out, map };
}

function markOf(text: string, q: string): [number, number] | null {
  const { out, map } = fold(text);
  const at = out.indexOf(q);
  return at < 0 ? null : [map[at], map[at + q.length - 1] + 1];
}

export function searchCatalog(index: CatalogIndex, query: string, limit = 8): CatalogResult {
  const q = normalizeVietnamese(query.trim()).replace(/\s+/g, ' ');
  if (!q) return { roadmaps: [], topics: [], totalTopics: 0 };
  const has = (s: string) => normalizeVietnamese(s).replace(/\s+/g, ' ').includes(q);
  const roadmaps = index.roadmaps.filter((r) => has(r.title) || has(r.description));
  const byTitle: TopicHit[] = [];
  const byStep: TopicHit[] = [];
  for (const topic of index.topics) {
    const mark = markOf(topic.title, q);
    if (mark) byTitle.push({ topic, mark });
    else if (has(topic.stepTitle)) byStep.push({ topic, mark: null });
  }
  const all = [...byTitle, ...byStep];
  return { roadmaps, topics: all.slice(0, limit), totalTopics: all.length };
}
```

- [ ] **Step 4: Chạy lại, thấy pass** (`pnpm vitest run tests/unit/catalog.test.ts`).

### Task 2: `catalogIndex` từ các roadmap view (TDD)

**Files:**
- Modify: `src/lib/content/views.ts` (thêm hàm)
- Modify: `src/lib/content/cards.ts` (thêm `catalog(lang)` server-only)
- Test: `tests/unit/content-views.test.ts`

**Interfaces:**
- Consumes: `CatalogIndex` (Task 1, `import type`), `RoadmapView`.
- Produces: `export function catalogIndex(views: RoadmapView[]): CatalogIndex` trong `views.ts`; `export function catalog(lang: string): CatalogIndex` trong `cards.ts` (gọi `listRoadmapViews(lang)`).

- [ ] **Step 1: Test** (thêm vào `content-views.test.ts`, dùng `input` sẵn có):

```ts
describe('catalogIndex', () => {
  it('lists roadmaps and every topic with its step and lesson flag', () => {
    const idx = catalogIndex([buildRoadmapView(input, 'devops')!]);
    expect(idx.roadmaps).toEqual([{ id: 'devops', track: 'devops', title: 'DevOps', description: 'Mô tả' }]);
    expect(idx.topics[0]).toEqual({ roadmapId: 'devops', code: 'D1', stepTitle: 'Linux', id: 'd1.x', title: 'D1.X', hasLesson: true });
    expect(idx.topics.find((t) => t.id === 'd1.y')?.hasLesson).toBe(false);
  });
});
```

- [ ] **Step 2: RED** (`catalogIndex is not a function`).
- [ ] **Step 3: Cài đặt** trong `views.ts`:

```ts
export function catalogIndex(views: RoadmapView[]): CatalogIndex {
  return {
    roadmaps: views.map((v) => ({ id: v.id, track: v.track, title: v.title, description: v.description })),
    topics: views.flatMap((v) =>
      v.levels.flatMap((l) =>
        l.steps.flatMap((s) =>
          s.topics.map((t) => ({ roadmapId: v.id, code: s.code, stepTitle: s.title, id: t.id, title: t.title, hasLesson: t.lessons.length > 0 })),
        ),
      ),
    ),
  };
}
```
và trong `cards.ts`: `export function catalog(lang: string): CatalogIndex { return catalogIndex(listRoadmapViews(lang)); }`.

- [ ] **Step 4: GREEN**, chạy cả `pnpm test`.

### Task 3: CSS chính thức

**Files:**
- Modify: `design/roadmap.css`, rồi `cp design/roadmap.css src/app/roadmap.css`
- Modify: `design/README.md` (ghi bản mẫu v2 là chuẩn, `home.html`/`roadmaps.html` đã thay thế)

Gộp quy tắc của `design/v2.css` vào cuối `design/roadmap.css` dưới tiêu đề `/* Trang chủ và phần đầu roadmap v2 (spec 2026-10-05) */`, đổi tên lớp:

| Bản mẫu | Chính thức |
|---|---|
| `.hm2`, `.hm2-*` | `.hm`, `.hm-*` (xoá các quy tắc `hm-*` cũ không còn dùng: `hm-hero`, `hm-block`, `hm-projects`, `hm-project*`, `hm-parts`, `hm-part*`, `hm-note`, `hm-title`, `hm-h` cũ) |
| `.v2-btn` | `.rm-btn` |
| `.v2-bar` (bọc thanh và nhãn) | `.rm-meter` (bên trong dùng `.rm-bar` + `<i data-bar>` sẵn có) |
| `.v2-icon` | `.ms-icon` |
| `.rm2-back`, `.rm2-title`, `.rm2-desc`, `.rm2-facts` | `.rm-back`, `.rm-title` (sửa quy tắc cũ), `.rm-desc`, `.rm-facts` |
| `.rm2-next*` | `.rm-next*` |
| `.rm2-bar`, `.rm2-levels`, `.rm2-tools`, `.rm2-tools-btn`, `.rm2-seg`, `.rm2-switch` | `.rm-levelbar`, `.rm-lvtabs`, `.rm-tools`, `.rm-tools-btn`, `.rm-seg` (thay quy tắc cũ), `.rm-switch` |
| `.rm2-head*`, `.rm2-known-*`, `.rm2-link`, `.rm2-level` | `.rm-lhead*`, `.rm-known-*`, `.rm-linkbtn`, gắn vào `.rm-level` |

Xoá quy tắc không còn dùng: `.rm-kicker`, `.rm-actions`, `.rm-known`, `.rm-total`, `.rm-toolbar*`, `.rm-legend*`, `.rm-level-head`, `.rm-level-k`, `.rm-level-goal`, `.rm-level-known*`, `.rm-level-progress`, `.rc-continue*`, `.rc-*` của thẻ cũ. Giữ: `.rm-dock` (dùng `ctaHref`), sơ đồ, chip, khung chi tiết. Không còn `v2.css` trong `src/`. `--fd-nav-height` dùng cho `top` của `.rm-levelbar`.

- [ ] Gộp, chép, chạy `pnpm vitest run tests/unit/styles.test.ts` (import CSS vẫn trong `src/`).

### Task 4: Trang chủ mới, nav, chuyển hướng `/roadmaps`

**Files:**
- Create: `src/components/home/roadmap-search.tsx` (client)
- Modify: `src/components/roadmap/roadmap-cards.tsx` (thẻ và khối "Đang học" theo bản mẫu)
- Modify: `src/app/[lang]/(home)/page.tsx`
- Modify: `src/app/[lang]/(home)/roadmaps/page.tsx` (thành trang chuyển hướng)
- Modify: `src/lib/layout.shared.tsx` (`links: []`)
- Modify: `messages/vi.json`, `messages/en.json`

**Interfaces:**
- Consumes: `catalog(lang)` (Task 2), `roadmapCards(lang)`, `searchCatalog` (Task 1).
- Produces: `RoadmapSearch({ index, cards, lang })`.

Nội dung:
- `page.tsx`: `<main className="hm"><div className="hm-wrap"><h1 className="hm-title">{t.home.title}</h1><p className="hm-lead">{t.home.lead}</p><RoadmapSearch index={catalog(lang)} cards={roadmapCards(lang)} lang={lang} /></div></main>`; bỏ khối dự án và "6 phần".
- `RoadmapSearch`: ô `input type="search"` có `label` hiện, gợi ý, phím `/` (bỏ qua khi `document.activeElement` là input, textarea, `[contenteditable]`); `useState` cho từ khoá; `useMemo(() => searchCatalog(index, q))`. Ô trống: `<RoadmapCardList roadmaps={cards} lang={lang} showContinue />`. Có từ khoá: vùng `aria-live="polite"` với nhóm Roadmap (lọc `cards` theo `result.roadmaps`, render `RoadmapCardList` không `showContinue`), nhóm Chủ đề (link `/${lang}/roadmaps/${roadmapId}#${id}`, tô `mark` bằng `<mark>`, nhãn "Bài"), dòng "Và n chủ đề khác", trạng thái không khớp với 5 nút gợi ý (`t.home.suggest`, mảng 5 chuỗi) điền vào ô.
- `RoadmapCardList`: khối "Đang học" chỉ render khi có `currentTopic` (bỏ câu "chọn một roadmap"); thẻ `<a className="hm-card">` bọc cả thẻ theo bản mẫu: ô chữ cái track (chữ cái đầu của `code` chặng đầu, J/D/M), tên `h3`, mô tả, số liệu, `.rm-meter` tổng chủ đề chính, nhãn `started ? continue : open`. Khối "Đang học" có nút `.rm-btn` "Học tiếp" trỏ `/${lang}/roadmaps/${roadmap.id}`... dùng `ctaHref` như trang roadmap: bài nếu có, ngược lại `#topicId`.
- `roadmaps/page.tsx`: giống `src/app/(root)/page.tsx`: `<meta httpEquiv="refresh" content={\`0; url=/${lang}/\`} />`, script `location.replace`, link về trang chủ; `generateMetadata` trả `robots: { index: false }`.
- Messages thêm `home.title`, `home.lead`, `home.searchLabel`, `home.searchPlaceholder`, `home.searchHint`, `home.resultRoadmaps`, `home.resultTopics`, `home.moreTopics` ("Và {n} chủ đề khác. Gõ cụ thể hơn để thu hẹp."), `home.noResult` ("Không có roadmap hay chủ đề nào khớp \"{q}\"."), `home.noResultHint`, `home.suggest` (mảng), `home.learningNow` (giữ), `roadmaps.open` = "Xem lộ trình"; bỏ `home.parts`, `home.partsTitle`, `home.progressNote`, `home.pickRoadmap`, `home.roadmapsTitle` nếu hết chỗ dùng (grep trước khi xoá).

- [ ] Code, `pnpm typecheck`, `pnpm lint`, build và xem trên trình duyệt (desktop, mobile, sáng/tối).

### Task 5: Phần đầu trang roadmap và khối tiếp tục

**Files:**
- Modify: `src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx`
- Modify: `src/components/roadmap/roadmap-client.tsx`
- Modify: `messages/*.json`
- Test: `tests/e2e/learning.spec.ts`

- `page.tsx`: `<a className="rm-back" href={\`/${lang}\`}>` + biểu tượng + `t.roadmap.allRoadmaps`; bỏ `rm-kicker`; số liệu thêm `format(t.roadmap.lessons, { count })` với `count = view.levels.flatMap(l => l.steps).reduce((n, s) => n + s.lessons.length, 0)`; `RoadmapToolbar` đặt ngoài `<header>` như hiện nay (Task 7 thay nội dung).
- `RoadmapClient` render khối:
  ```tsx
  <section className="rm-next" aria-labelledby={`${rootId}-next`} data-state={state}>
    <div className="rm-next-body">
      <p id={`${rootId}-next`} className="rm-next-k">{label}</p>
      <p className="rm-next-t">{title}</p>
      <p className="rm-next-m">{meta}</p>
    </div>
    {next ? <a className="rm-btn" href={ctaHref} data-testid="continue">{t.roadmap.enter}<ArrowIcon /></a> : null}
    <div className="rm-meter"><span className="rm-bar"><i style={{ transform: `scaleX(...)` }} /></span><span>{format(t.roadmap.doneCount, total)}</span></div>
  </section>
  ```
  `state` = `!next ? 'done' : started ? 'learning' : 'new'`; nhãn `t.roadmap.next.{new,learning,done}`; `meta` = `<b>{step.code}</b> {step title}` + `· bài {lessonCode}` nếu có (`lessonCode('/learn/j2/j2-1') === 'J2.1'`: lấy đoạn cuối, `toUpperCase`, `-` → `.`); trạng thái done: tiêu đề `t.roadmap.finished`, meta `t.roadmap.finishedHint`. `LiteStep` cần thêm `title` (sửa `toLite` và type `LiteStep`; cập nhật test `toLite` trong `content-views.test.ts` trước, RED rồi GREEN).
- Bỏ hàng "Tôi đã biết" (`knownOptions`) và `rm-total`.
- Messages: `roadmap.allRoadmaps`, `roadmap.enter` ("Vào học"), `roadmap.next.new/learning/done`, `roadmap.lessonCount`, `roadmap.finishedHint`, `roadmap.lessons` hiện là nhãn khung chi tiết nên đặt khoá mới `roadmap.lessonFacts` ("{count} bài học"); bỏ `roadmap.kicker`, `known`, `knownNone`.
- E2E mới: `nút Vào học không dời chỗ khi bắt đầu học` (đo `boundingBox` của `getByTestId('continue')` ở `/vi/roadmaps/java`, tích mục `j1.1.lab-compile-run` ở bài, quay lại, so `x`/`y`/`height` lệch dưới 1px). Sửa E2E cũ dùng `href` của `continue` nếu đổi.

### Task 6: Đầu cấp và "Tôi đã biết cấp này"

**Files:**
- Modify: `src/components/roadmap/roadmap-map.tsx`
- Modify: `src/components/roadmap/roadmap-client.tsx` (bộ bắt click)
- Modify: `src/components/roadmap/roadmap-dom.ts` (nếu cần cho nhãn)
- Modify: `messages/*.json`; Test: `tests/e2e/learning.spec.ts`

- `RoadmapMap` nhận thêm `levelIds` đã có trong `view.levels`. Đầu cấp:
  ```tsx
  <header className="rm-lhead">
    <span className="rm-lhead-n" aria-hidden="true">{level.index}</span>
    <div><h2 id={`level-${level.id}`} className="rm-lhead-t">{level.title}</h2><p className="rm-lhead-g">{level.goal}</p></div>
    {next ? <button type="button" className="rm-known-btn" data-known-set={next.id}><CheckIcon />{t.roadmap.knownLevel}</button> : null}
    <div className="rm-meter"><span className="rm-bar" aria-hidden="true"><i data-bar={`level:${level.id}`} /></span><span data-count={`level:${level.id}`} /></div>
    <div className="rm-known-row"><CheckIcon /><span><b>{t.roadmap.knownTitle}</b>{prev ? format(t.roadmap.knownIncludes, { levels: prevTitles }) : ''}. {format(t.roadmap.knownSkipped, { count: coreCount })}</span>
      <button type="button" className="rm-linkbtn" data-expand data-label-open={t.roadmap.reviewSteps} data-label-close={t.roadmap.collapse}>{t.roadmap.reviewSteps}</button>
      <button type="button" className="rm-linkbtn" data-known-undo={level.id}>{t.roadmap.undo}</button></div>
  </header>
  ```
  `section.rm-level` giữ `id`/`data-level` hiện có; thêm `id={\`level-${level.id}\`}` cho `section` (đổi id của `h2` thành `lt-${level.id}`, sửa `aria-labelledby`). Bỏ `rm-level-known` và nút `data-show-level`.
- `RoadmapClient` bộ bắt click:
  - `[data-known-set]` → `getProgressStore().setStart(lite.id, value as Level)`;
  - `[data-known-undo]` → cấp i: `setStart(lite.id, i === 0 ? null : levelId)` (i tìm trong `lite.levels`);
  - `[data-expand]` → bật/tắt `data-expanded` trên `.rm-level` chứa nó, đổi chữ theo `data-label-open/close`, `aria-expanded`.
- Messages: `roadmap.knownLevel`, `knownTitle`, `knownIncludes` (" (gồm cả {levels})"), `knownSkipped` ("{count} chủ đề chính không tính vào tiến độ."), `reviewSteps`, `collapse`, `undo`; bỏ `levelKnown`, `showLevel`, `levelLabel`.
- E2E: thay test "Tôi đã biết thu gọn cấp": bấm nút trong `section#level-foundation` → `data-known`, tab Nền tảng chứa "đã biết", `continue` có `href` `/vi/learn/j11/j11-1`; "Hoàn tác" → bỏ `data-known`. Thêm test Review Focus 3: bấm ở Middle khi chưa biết gì → cả `foundation` và `middle` có `data-known`, `continue` trỏ bài J18; "Hoàn tác" ở Middle → chỉ `foundation` còn `data-known`. Sửa test link `#step-j5` vào cấp đã biết (đổi cách đặt cấp bắt đầu cho đúng localStorage).

### Task 7: Thanh cấp dính

**Files:**
- Modify (viết lại): `src/components/roadmap/roadmap-toolbar.tsx`
- Modify: `src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx` (truyền props)
- Modify: `messages/*.json`; Test: `tests/e2e/learning.spec.ts`

- `RoadmapToolbar({ lite, levels }: { lite: RoadmapLite; levels: { id: Level; title: string }[] })`:
  - `useProgress`; với mỗi cấp: `tallyTopics(progress, lite level topics)`, `skippedLevels(progress, lite).has(id)`;
  - `<nav className="rm-levelbar" aria-label={t.roadmap.levelsNav} data-tools-open={open || undefined}>`, `<ol className="rm-lvtabs">` các `<a href={\`#level-${id}\`} aria-current={active === id}>` gồm `lv-t`, `lv-n` (`done/total` + `t.roadmap.knownSuffix` khi đã biết, thay cho `::after` của bản mẫu);
  - `active`: `IntersectionObserver` trên `section.rm-level` với `rootMargin: '-140px 0px -60% 0px'`, cập nhật `useState`;
  - nút `.rm-tools-btn` (`aria-expanded`, `aria-controls`, `aria-label={t.roadmap.displayOptions}`), bảng `#${rootId}-tools` `.rm-tools`; đóng khi `pointerdown` ra ngoài `nav` và khi `Escape` (đưa focus về nút);
  - trong `.rm-tools`: `.rm-seg` hai nút biểu tượng + chữ (giữ `usePref(VIEW_KEY)`), `label.rm-switch` với `input type="checkbox" role="switch"` (giữ `usePref(HIDE_KEY)`).
- Bỏ `details.rm-legend`; messages bỏ `howToRead`, `howToReadBody`; thêm `levelsNav`, `displayOptions`, `knownSuffix` (" · đã biết").
- E2E:
  - sửa `thanh công cụ dính…`: sau khi cuộn tới `#step-j10`, `.rm-levelbar` có `boundingBox().y` dưới 120; cuộn tới `#level-middle` thì tab Middle `aria-current="true"`;
  - mobile: `.rm-tools-btn` hiện, bấm mở `.rm-tools` (thấy nút "Danh sách"), nhấn Escape thì đóng; `scrollWidth <= innerWidth`;
  - sửa test chuyển view danh sách và "Ẩn mục đã bỏ qua" theo selector mới (`getByRole('switch', { name: 'Ẩn mục đã bỏ qua' })`).

### Task 8: E2E trang chủ, tài liệu, kiểm tra cuối

**Files:**
- Test: `tests/e2e/learning.spec.ts`
- Modify: `docs/status.md`, `docs/architecture.md` (§6 bảng nhóm trang: `/vi/` là danh mục, `/vi/roadmaps` chuyển hướng), `docs/features.md` nếu nhắc trang danh mục, `design/README.md`

- E2E:
  - `trang chủ không có link Roadmap trên nav`: `page.getByRole('navigation').getByRole('link', { name: 'Roadmap', exact: true })` có count 0;
  - `tìm kafka ra chủ đề J16 và mở đúng khung`: gõ vào `getByLabel('Tìm roadmap hoặc chủ đề')`, thấy link chứa "Kafka hoặc RabbitMQ" có `href` `/vi/roadmaps/java#j16.kafka-rabbitmq` (lấy id thật từ `content/steps/j16/meta.json`), bấm, thấy heading khung;
  - `tìm không dấu`: "giao dich" ra ít nhất một chủ đề;
  - `không khớp`: "zzzz" ra câu báo; bấm nút gợi ý "Docker" thì ô có giá trị "Docker" và có kết quả;
  - `/vi/roadmaps chuyển về trang chủ`: `page.goto('/vi/roadmaps')` rồi `toHaveURL(/\/vi\/?$/)`;
  - sửa test cũ "đường dẫn cũ dẫn tới ba roadmap mới" nếu phụ thuộc trang danh mục.
- Chạy `pnpm verify`, xem lại trên trình duyệt (desktop, mobile, sáng, tối), cập nhật tài liệu. Không commit.
