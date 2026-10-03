# Kế hoạch triển khai: tách ba roadmap và sơ đồ roadmap mới

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Với dự án này, CLAUDE.md cấm `subagent-driven-development` trừ khi người dùng yêu cầu, nên mặc định chạy bằng `superpowers:executing-plans`.

**Mục tiêu:** thay roadmap chung bằng ba roadmap Java, DevOps, Microservices (từ nền tảng tới Senior), có sơ đồ "trục giữa", khung chi tiết chủ đề, tiến độ theo chủ đề và trang dự án.

**Kiến trúc:**
- Nội dung (roadmap, chặng có `topics`, dự án) được kiểm tra bằng Zod lúc build.
- Hàm thuần trong `src/lib/content/views.ts` dựng dữ liệu cho trang.
- Trang roadmap render sẵn thành HTML tĩnh.
- Một client component nhỏ đọc tiến độ v2 trong localStorage rồi gắn trạng thái lên DOM, đồng thời điều khiển khung chi tiết (`<dialog>`).

**Tech stack:** Next.js 16 (static export), Fumadocs 16, React 19, TypeScript strict, Zod 4 (chỉ lúc build), Vitest, Playwright + axe, Tailwind 4, CSS thuần cho component riêng.

**Spec:** `docs/superpowers/specs/2026-10-03-tach-roadmap-design.md`. Người thực hiện đọc cả spec lẫn kế hoạch này.

## Ràng buộc chung

- **Chỉ static export:** không route động, không middleware, không server action. Mọi thứ chạy lúc build hoặc trên trình duyệt.
- **Client component** không import Zod, `src/lib/content/repo.ts` hay `src/lib/content/manifest.ts`. Chỉ được `import type` từ `schema.ts` và `views.ts`.
- **TDD bắt buộc** cho `src/lib/progress` và `src/lib/content`. Không áp TDD cho giao diện.
- **Code sạch:** không `any`, không `@ts-ignore`, không tắt lint.
- **Không commit** khi người dùng chưa yêu cầu. Các bước "Điểm kiểm tra" chỉ chạy lệnh kiểm tra.
- **File khoá mã:** không đổi hay xoá mã đã có trong `content/ids.lock.json`. Mã chủ đề (`topics`) và mã mốc (`milestones`) cũng được khoá.
- **Ngân sách:** trang roadmap có JS ≤ 260 KB gzip, HTML ≤ 150 KB gzip.
- **Ngôn ngữ:** chữ giao diện và tài liệu bằng tiếng Việt; tên biến, hàm, file bằng tiếng Anh. Bản tiếng Anh của chữ giao diện nằm trong `messages/en.json`.
- **Truy cập:**
  - tương phản AA (chữ 4.5:1, viền control 3:1) ở cả sáng và tối;
  - dùng được hoàn toàn bằng bàn phím;
  - tôn trọng `prefers-reduced-motion`;
  - vùng bấm trên mobile ≥ 44px.
- **Thiết kế:** hướng **Night Lab** (người dùng chọn ngày 03/10/2026, sau vòng thiết kế lại bằng skill ui-ux-pro-max). Nguồn: `docs/design-direction.md`, `design/README.md`, token ở `design/tokens.css`, CSS các trang mới ở `design/roadmap.css`. Theme tối là mặc định. Màu roadmap lấy từ `--track-java`, `--track-devops`, `--track-microservices`.
- **CSS các trang mới:** `design/roadmap.css` là nguồn duy nhất, chép nguyên văn sang `src/app/roadmap.css`. Muốn đổi giao diện thì sửa file thiết kế trước, rồi chép lại.
- **Khoảng đỏ của typecheck:** từ Task 3 tới hết Task 10, `pnpm typecheck` và `pnpm build` sẽ đỏ, vì trang cũ còn dùng API đã đổi. Trong khoảng này chỉ chạy `pnpm test` và `pnpm content:check`.
- **Ngoài phạm vi:** đổi giao diện các component bài học (Terminal, Check, Predict, Callout…) theo `design-direction.md` §5 làm ở kế hoạch sau. Kế hoạch này chỉ đổi token, font và thanh tiến độ.

## Điểm cần soát kỹ

Các trường hợp spec không nói rõ nhưng dễ làm hỏng trải nghiệm. Mỗi dòng đã có test ở task tương ứng.

1. **Người học đã có tiến độ v1** (đã tích ở D1.1, có thể kèm mã thay thế): sau khi chuyển sang v2 không mất mục nào, và khoá v1 vẫn còn. Test ở Task 4 (`migrates the v1 key once and keeps it`) và Task 14 (E2E nạp khoá v1).
2. **Chủ đề tự đánh "đã xong" rồi bỏ tích mục trong bài:** trạng thái vẫn "đã xong", vì trạng thái tự đặt luôn thắng. Test ở Task 5 (`explicit mark wins over lesson items`).
3. **URL có hash không phải chủ đề** (`#step-d1`, `#khong-co`): không mở khung chi tiết, không lỗi; `#step-…` cuộn tới thẻ chặng. Test ở Task 14.
4. **Đã xong mọi chủ đề chính, hoặc mọi cấp còn lại đã đánh "đã biết":** nút "Học tiếp" biến mất, thay bằng câu "đã xong mọi chủ đề chính". Test ở Task 5 (`returns undefined when everything is done`).
5. **Nhập file tiến độ v1 vào máy đang có v2 kèm `topics`:** gộp được, giữ cả hai. Test ở Task 4 (`imports v1 and v2 files by merging`).

---

### Task 1: Thiết kế local hoàn chỉnh

> Cập nhật 03/10/2026: người dùng chưa ưng bản "Sổ tay kỹ sư". Đã cài skill ui-ux-pro-max, dựng ba phương án trên trang roadmap; người dùng chọn **V2 · Night Lab** (file các phương án đã xoá sau khi chọn). Night Lab đã được gộp vào `design/tokens.css`, `design/roadmap.css`, `design/components.css` và mọi trang mẫu. Các bước dưới mô tả sản phẩm cần có; chúng đã được làm lại theo Night Lab.

Không có test tự động. Kiểm tra bằng trình duyệt trong app, chạy cấu hình `design` ở `.claude/launch.json` (server tĩnh cổng 4400).

**Files:**
- Create: `design/roadmap.html`, `design/roadmaps.html`, `design/home.html`, `design/project.html`, `design/index.html`
- Modify: `design/lesson-desktop.html`, `design/lesson-mobile.html`, `design/components.css`, `design/system.html`, `design/README.md`
- Create: `design/components/RoadmapMap.md`, `design/components/TopicDrawer.md`
- Delete: `design/components/RoadmapNode.md`, `design/components/RoadmapRow.md`, `design/roadmap-options.html`

**Interfaces:**
- Produces: tên class `rm-*` và các thuộc tính `data-st`, `data-kind`, `data-topic`, `data-step`, `data-level`, `data-view`, `data-hide-skipped`. Task 9–10 dùng đúng các tên này. Bảng CSS ở Task 9 là nguồn chuẩn; file thiết kế dùng cùng tên.

- [ ] **Step 1:** Tạo `design/roadmap.html` bằng HTML tĩnh, dùng `tokens.css` và Google Fonts (Literata, IBM Plex Sans, IBM Plex Mono).
  - Nội dung là roadmap Java đầy đủ 20 chặng, lấy đúng bảng §7.1 của spec.
  - Trạng thái mẫu: J1–J4 đã xong, đang học "Generics".
  - Phải có đủ:
    - header: kicker, tên, mô tả, số cấp/chặng/chủ đề, "Học tiếp", "Tôi đã biết";
    - thanh công cụ dính khi cuộn: Sơ đồ/Danh sách, "Ẩn mục đã bỏ qua", "Cách đọc sơ đồ";
    - ba khung cấp, trục, trạm, thẻ so le, chip đủ 4 trạng thái và 2 loại (`pick`, `opt`);
    - chip "Học ở …" và "Dùng ở …";
    - khung chi tiết `<dialog>` mở được bằng click và bằng `#j5.generics`;
    - thanh "Học tiếp" dính đáy trên mobile;
    - nút đổi sáng/tối.
  - JavaScript thuần trong file: mở/đóng khung, đổi trạng thái chip, chuyển view, đổi theme.
  - Thêm một bộ chọn màu roadmap (Java/DevOps/Microservices) chỉ để xem màu.
- [ ] **Step 2:** Tạo `design/roadmaps.html`: danh mục ba roadmap, mỗi thẻ có màu riêng, ba vạch tiến độ theo cấp, số chặng và số chủ đề (lấy từ §7), nút "Học tiếp" hoặc "Mở roadmap".
- [ ] **Step 3:** Tạo `design/home.html`, gồm:
  - tagline và intro (lấy từ `messages/vi.json`);
  - khối "Bạn đang học" (Java · J5 Generics);
  - ba thẻ roadmap như Step 2;
  - "Dự án xuyên suốt" (Neobank mini, Hub hội thoại);
  - "Mỗi bài có 6 phần";
  - một câu về việc tiến độ lưu trên trình duyệt.
- [ ] **Step 4:** Tạo `design/project.html` cho Neobank mini: tóm tắt, 5 mốc theo bảng §8 của spec, mỗi mốc liệt kê chặng cần học (link về roadmap) và "k/n chủ đề chính".
- [ ] **Step 5:** Sửa `design/lesson-desktop.html` và `design/lesson-mobile.html`:
  - breadcrumb thành "DevOps / D1 Linux";
  - thanh bên nhóm theo roadmap;
  - dưới tiêu đề thêm chip chủ đề "Tiến trình, signal, exit code" và "systemd và journald".
- [ ] **Step 6:** Tạo `design/index.html`: liệt kê mọi trang, mỗi trang có iframe desktop (1440, thu nhỏ) và iframe mobile (390) đặt cạnh nhau.
- [ ] **Step 7:** Cập nhật design system:
  - Thêm vào `design/components.css` các class `rm-*` của chip, trạm, khung chi tiết.
  - Thay mục RoadmapRow/RoadmapNode trong `design/system.html` bằng RoadmapMap và TopicDrawer.
  - Viết `design/components/RoadmapMap.md` và `TopicDrawer.md` theo cấu trúc các file component hiện có (câu đầu là tóm tắt, rồi quy tắc trạng thái, truy cập, mobile).
  - Xoá các file cũ và `roadmap-options.html`.
- [ ] **Step 8:** Tự kiểm tra:
  - Mở từng trang bằng `mcp__Claude_Browser__*` ở 1440×900 và 390×844, sáng và tối.
  - Không cuộn ngang ở 390px.
  - Tab tới chip, Enter mở khung, Esc đóng và focus quay về chip.
  - Sửa mọi lỗi thấy được trong một lượt, kiểm tra lại tối đa một lượt.
- [ ] **Step 9: Điểm dừng.** Báo người dùng duyệt thiết kế local; chờ duyệt rồi mới làm Task 2.
- [ ] **Step 10:** Sau khi được duyệt, xoá hai artifact trên claude.ai bằng `Artifact` action `delete`:
  - https://claude.ai/artifact/TVvPCVtmKMSvV1zQJJfCRV
  - https://claude.ai/artifact/52T9HcSaN5KCFV8gWQhpbA

  Người dùng đã đồng ý ở bước brainstorming, nhưng vẫn xác nhận lại ngay trước khi xoá. Sau đó sửa `docs/design-direction.md`: thay hai link artifact bằng đường dẫn `design/index.html` và `design/system.html`.

---

### Task 2: Schema nội dung và kiểm tra đồ thị

**Files:**
- Modify: `src/lib/content/constants.ts`, `src/lib/content/schema.ts`, `src/lib/content/validate.ts`
- Test: `tests/unit/content-graph.test.ts` (mới), `tests/unit/content-validate.test.ts` (giữ nguyên, phải vẫn xanh)

**Interfaces:**
- Produces:
  - `TRACKS = ['java','devops','microservices']`
  - `LEVELS = ['foundation','middle','senior']`, `type Level`
  - `TOPIC_KINDS = ['core','pick','opt']`, `type TopicKind`
  - `topicIdPattern`
  - `topicSchema`, `type Topic`; `stepFields` (thêm `optional`, `topics`, `links`); `lessonFields` (thêm `topics`)
  - `roadmapSchema` (có `levels`, `recommended`, `track`), `type Roadmap`
  - `projectSchema`, `type Project`
  - `idsLockSchema` (thêm `topics`, `milestones`)
  - `validateGraph(graph: ContentGraph): string[]`
  - `mergeKeys(known: readonly string[], current: Iterable<string>): string[]`
  - `validateLock(lock: Pick<IdsLock,'ids'|'replacements'>, current: ReadonlySet<string>): string[]`

- [ ] **Step 1: Viết test trước.** Tạo `tests/unit/content-graph.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { projectSchema, roadmapSchema, topicSchema } from '@/lib/content/schema';
import { mergeKeys, validateGraph, type ContentGraph } from '@/lib/content/validate';

const graph = (over: Partial<ContentGraph> = {}): ContentGraph => ({
  roadmaps: [
    { id: 'java', recommended: [], levels: [{ steps: ['j1', 'j2'] }] },
    { id: 'devops', recommended: ['j1'], levels: [{ steps: ['d1'] }] },
  ],
  steps: [
    { id: 'j1', topics: [{ id: 'j1.a', requires: [] }], links: [] },
    { id: 'j2', topics: [{ id: 'j2.b', requires: ['j1.a'] }], links: [{ step: 'd1' }] },
    { id: 'd1', topics: [{ id: 'd1.c', requires: [] }], links: [] },
  ],
  projects: [{ id: 'neobank', milestones: [{ id: 'neobank.one', needs: ['j2', 'd1.c'] }] }],
  lessons: [{ id: 'j2.1', stepId: 'j2', topics: ['j2.b', 'd1.c'] }],
  ...over,
});

describe('validateGraph', () => {
  it('accepts a consistent graph', () => {
    expect(validateGraph(graph())).toEqual([]);
  });

  it('requires every step to belong to exactly one roadmap', () => {
    const errors = validateGraph(
      graph({
        roadmaps: [
          { id: 'java', recommended: [], levels: [{ steps: ['j1', 'j2', 'x9'] }] },
          { id: 'devops', recommended: [], levels: [{ steps: ['j1'] }] },
        ],
      }),
    ).join('\n');
    expect(errors).toMatch(/bước "x9" không tồn tại/);
    expect(errors).toMatch(/"j1" thuộc cả "java" và "devops"/);
    expect(errors).toMatch(/bước "d1" không thuộc roadmap nào/);
  });

  it('checks topic ids', () => {
    const steps = [
      { id: 'j1', topics: [{ id: 'j1.a', requires: [] }, { id: 'j9.wrong', requires: [] }], links: [] },
      { id: 'j2', topics: [{ id: 'j1.a', requires: [] }], links: [] },
      { id: 'd1', topics: [], links: [] },
    ];
    const errors = validateGraph(graph({ steps, projects: [], lessons: [] })).join('\n');
    expect(errors).toMatch(/"j9\.wrong" phải bắt đầu bằng "j1\."/);
    expect(errors).toMatch(/mã chủ đề bị trùng: j1\.a/);
  });

  it('reports dangling references', () => {
    const steps = [
      { id: 'j1', topics: [{ id: 'j1.a', requires: ['j1.none'] }], links: [{ step: 'zz' }] },
      { id: 'j2', topics: [{ id: 'j2.b', requires: [] }], links: [] },
      { id: 'd1', topics: [{ id: 'd1.c', requires: [] }], links: [] },
    ];
    const errors = validateGraph(
      graph({
        steps,
        roadmaps: [
          { id: 'java', recommended: ['nope'], levels: [{ steps: ['j1', 'j2'] }] },
          { id: 'devops', recommended: [], levels: [{ steps: ['d1'] }] },
        ],
        projects: [{ id: 'neobank', milestones: [{ id: 'neobank.one', needs: ['ghost'] }] }],
        lessons: [],
      }),
    ).join('\n');
    expect(errors).toMatch(/"requires" trỏ tới "j1\.none"/);
    expect(errors).toMatch(/"links" trỏ tới bước "zz"/);
    expect(errors).toMatch(/"recommended" trỏ tới bước "nope"/);
    expect(errors).toMatch(/"needs" trỏ tới "ghost"/);
  });

  it('checks milestone ids', () => {
    const projects = [{ id: 'neobank', milestones: [{ id: 'other.one', needs: ['j1'] }, { id: 'other.one', needs: ['j1'] }] }];
    const errors = validateGraph(graph({ projects })).join('\n');
    expect(errors).toMatch(/"other\.one" phải bắt đầu bằng "neobank\."/);
    expect(errors).toMatch(/mã mốc bị trùng: other\.one/);
  });

  it('checks lesson topics', () => {
    const errors = validateGraph(graph({ lessons: [{ id: 'j2.1', stepId: 'j2', topics: ['j1.a', 'j2.none'] }] })).join('\n');
    expect(errors).toMatch(/chủ đề "j1\.a" thuộc bước "j1"/);
    expect(errors).toMatch(/chủ đề "j2\.none" không tồn tại/);
  });
});

describe('schemas', () => {
  it('requires options for pick topics and defaults kind to core', () => {
    expect(topicSchema.safeParse({ id: 'j7.build-tool', title: 'Maven hoặc Gradle', kind: 'pick' }).success).toBe(false);
    expect(topicSchema.parse({ id: 'j5.generics', title: 'Generics' })).toMatchObject({ kind: 'core', requires: [], resources: [] });
    expect(topicSchema.safeParse({ id: 'J5.Generics', title: 'x' }).success).toBe(false);
  });

  it('parses a roadmap with levels', () => {
    const roadmap = roadmapSchema.parse({
      id: 'java',
      area: 'backend',
      track: 'java',
      title: { vi: 'Java' },
      description: { vi: 'Mô tả' },
      levels: [{ id: 'foundation', title: { vi: 'Nền tảng' }, goal: { vi: 'Mục tiêu' }, steps: ['j1'] }],
    });
    expect(roadmap.recommended).toEqual([]);
    expect(roadmapSchema.safeParse({ ...roadmap, levels: [] }).success).toBe(false);
  });

  it('parses a project', () => {
    expect(
      projectSchema.safeParse({
        id: 'neobank',
        title: { vi: 'Neobank mini' },
        summary: { vi: 'Tóm tắt' },
        milestones: [{ id: 'neobank.discovery', title: { vi: 'Khám phá' }, needs: ['m3'] }],
      }).success,
    ).toBe(true);
  });
});

describe('mergeKeys', () => {
  it('appends new keys sorted, keeping existing order', () => {
    expect(mergeKeys(['z', 'a'], new Set(['a', 'c', 'b']))).toEqual(['z', 'a', 'b', 'c']);
  });
});
```

- [ ] **Step 2: Chạy test, phải đỏ.**
  - Lệnh: `pnpm test -- tests/unit/content-graph.test.ts`
  - Kết quả mong đợi: FAIL vì `validateGraph`, `mergeKeys`, `projectSchema` chưa có.

- [ ] **Step 3: Viết code.** Thay `src/lib/content/constants.ts` bằng:

```ts
/**
 * Hằng số nội dung dùng được ở cả máy chủ lẫn trình duyệt.
 * Tách khỏi schema.ts để component phía trình duyệt không kéo theo Zod.
 */
export const TRACKS = ['java', 'devops', 'microservices'] as const;
export type Track = (typeof TRACKS)[number];

/** Ba cấp của một roadmap, theo thứ tự. */
export const LEVELS = ['foundation', 'middle', 'senior'] as const;
export type Level = (typeof LEVELS)[number];

/** core: chủ đề chính; pick: chọn một trong `options`; opt: tuỳ chọn, không tính vào tiến độ. */
export const TOPIC_KINDS = ['core', 'pick', 'opt'] as const;
export type TopicKind = (typeof TOPIC_KINDS)[number];

export const LESSON_STATUSES = ['draft', 'verified', 'outdated'] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

/** Thứ tự bắt buộc của khung 6 phần (content-standard §2). */
export const LESSON_SECTIONS = ['Goal', 'Knowledge', 'Resources', 'Practice', 'DeepDive', 'Mastery'] as const;
```

Trong `src/lib/content/schema.ts`, đổi import và export ở đầu file:

```ts
import { z } from 'zod';
import { LESSON_STATUSES, LEVELS, TOPIC_KINDS, TRACKS, type LessonStatus } from './constants';

export {
  LESSON_SECTIONS,
  LESSON_STATUSES,
  LEVELS,
  TOPIC_KINDS,
  TRACKS,
  type Level,
  type LessonStatus,
  type TopicKind,
  type Track,
} from './constants';
```

Ngay sau `checkIdPattern`, thêm:

```ts
/** Mã chủ đề: `<mã bước>.<slug>`, ví dụ `j5.generics`. */
export const topicIdPattern = /^[a-z]+\d+\.[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Mã mốc dự án: `<mã dự án>.<slug>`, ví dụ `neobank.discovery`. */
export const milestoneIdPattern = /^[a-z][a-z0-9-]*\.[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugPattern = /^[a-z][a-z0-9-]*$/;

const localized = z.record(z.string(), z.string()).refine((v) => typeof v.vi === 'string', {
  message: 'Phải có bản tiếng Việt (vi)',
});

/** Một nút trên sơ đồ roadmap (spec §4.2). */
export const topicSchema = z
  .object({
    id: z.string().regex(topicIdPattern),
    title: z.string().min(1),
    kind: z.enum(TOPIC_KINDS).default('core'),
    options: z.array(z.string().min(1)).min(2).optional(),
    summary: z.string().optional(),
    requires: z.array(z.string()).default([]),
    resources: z
      .array(z.object({ title: z.string().min(1), url: z.url(), note: z.string().optional() }))
      .max(3)
      .default([]),
  })
  .refine((t) => t.kind !== 'pick' || (t.options?.length ?? 0) >= 2, {
    message: 'Chủ đề "pick" phải có ít nhất 2 lựa chọn trong "options"',
    path: ['options'],
  });
export type Topic = z.infer<typeof topicSchema>;
```

Trong `lessonFields`, thêm sau `prerequisites`:

```ts
  /** Chủ đề trên sơ đồ mà bài này bao phủ (spec §4.3). */
  topics: z.array(z.string().regex(topicIdPattern)).min(1),
```

Thay `stepFields`, xoá khai báo `localized` cũ phía dưới, và thay `roadmapSchema`, `idsLockSchema`:

```ts
/** Trường riêng của Masteva trong meta.json của một bước (chặng). */
export const stepFields = {
  id: z.string().min(1),
  code: z.string().min(1),
  short: z.string().min(1),
  track: z.enum(TRACKS),
  prerequisites: z.array(z.string()).default([]),
  /** Chặng tuỳ chọn: mọi chủ đề trong đó coi là `opt`. */
  optional: z.boolean().default(false),
  topics: z.array(topicSchema).default([]),
  /** Bước của roadmap khác dạy đầy đủ phần liên quan. */
  links: z.array(z.object({ step: z.string().min(1), note: z.string().optional() })).default([]),
};

export const roadmapSchema = z.object({
  id: z.string().regex(slugPattern),
  area: z.string().min(1),
  track: z.enum(TRACKS),
  title: localized,
  description: localized,
  /** Bước của roadmap khác nên học trước. */
  recommended: z.array(z.string()).default([]),
  levels: z
    .array(
      z.object({ id: z.enum(LEVELS), title: localized, goal: localized, steps: z.array(z.string()).min(1) }),
    )
    .min(1),
});
export type Roadmap = z.infer<typeof roadmapSchema>;

export const projectSchema = z.object({
  id: z.string().regex(slugPattern),
  title: localized,
  summary: localized,
  milestones: z
    .array(z.object({ id: z.string().regex(milestoneIdPattern), title: localized, needs: z.array(z.string()).min(1) }))
    .min(1),
});
export type Project = z.infer<typeof projectSchema>;

export const idsLockSchema = z.object({
  /** Mọi mã mục đã từng phát hành. */
  ids: z.array(z.string()),
  /** Mọi mã chủ đề đã từng phát hành. */
  topics: z.array(z.string()).default([]),
  /** Mọi mã mốc dự án đã từng phát hành. */
  milestones: z.array(z.string()).default([]),
  /** Mã cũ → mã thay thế (mục, chủ đề hoặc mốc), dùng khi gộp hoặc đổi tên. */
  replacements: z.record(z.string(), z.string()).default({}),
});
export type IdsLock = z.infer<typeof idsLockSchema>;
```

Trong `src/lib/content/validate.ts`, đổi chữ ký `validateLock` và `mergeLock`, rồi thêm `mergeKeys`, các kiểu đồ thị và `validateGraph` vào cuối file:

```ts
export function validateLock(lock: Pick<IdsLock, 'ids' | 'replacements'>, currentIds: ReadonlySet<string>): string[] {
```

```ts
/** Thêm mã mới vào danh sách đã phát hành, giữ nguyên thứ tự cũ. */
export function mergeKeys(known: readonly string[], current: Iterable<string>): string[] {
  const seen = new Set(known);
  const added = [...new Set(current)].filter((id) => !seen.has(id)).sort();
  return [...known, ...added];
}

/** Thêm mã mục mới vào file khoá, giữ nguyên thứ tự đã có. */
export function mergeLock<T extends Pick<IdsLock, 'ids'>>(lock: T, currentIds: Iterable<string>): T {
  return { ...lock, ids: mergeKeys(lock.ids, currentIds) };
}

export interface ContentGraph {
  roadmaps: { id: string; recommended: string[]; levels: { steps: string[] }[] }[];
  steps: { id: string; topics: { id: string; requires: string[] }[]; links: { step: string }[] }[];
  projects: { id: string; milestones: { id: string; needs: string[] }[] }[];
  lessons: { id: string; stepId: string; topics: string[] }[];
}

/** Kiểm tra quan hệ giữa roadmap, bước, chủ đề, dự án và bài (spec §4.5). */
export function validateGraph(graph: ContentGraph): string[] {
  const errors: string[] = [];
  const stepIds = new Set(graph.steps.map((s) => s.id));

  const owner = new Map<string, string>();
  for (const roadmap of graph.roadmaps) {
    for (const stepId of roadmap.levels.flatMap((l) => l.steps)) {
      if (!stepIds.has(stepId)) errors.push(`roadmap "${roadmap.id}": bước "${stepId}" không tồn tại`);
      const previous = owner.get(stepId);
      if (previous) errors.push(`bước "${stepId}" thuộc cả "${previous}" và "${roadmap.id}"`);
      else owner.set(stepId, roadmap.id);
    }
    for (const id of roadmap.recommended) {
      if (!stepIds.has(id)) errors.push(`roadmap "${roadmap.id}": "recommended" trỏ tới bước "${id}" không tồn tại`);
    }
  }
  for (const step of graph.steps) {
    if (!owner.has(step.id)) errors.push(`bước "${step.id}" không thuộc roadmap nào`);
  }

  const topicStep = new Map<string, string>();
  for (const step of graph.steps) {
    for (const topic of step.topics) {
      if (!topic.id.startsWith(`${step.id}.`)) errors.push(`chủ đề "${topic.id}" phải bắt đầu bằng "${step.id}."`);
      if (topicStep.has(topic.id)) errors.push(`mã chủ đề bị trùng: ${topic.id}`);
      else topicStep.set(topic.id, step.id);
    }
  }
  for (const step of graph.steps) {
    for (const topic of step.topics) {
      for (const req of topic.requires) {
        if (!topicStep.has(req)) errors.push(`chủ đề "${topic.id}": "requires" trỏ tới "${req}" không tồn tại`);
      }
    }
    for (const link of step.links) {
      if (!stepIds.has(link.step)) errors.push(`bước "${step.id}": "links" trỏ tới bước "${link.step}" không tồn tại`);
    }
  }

  const milestoneIds = new Set<string>();
  for (const project of graph.projects) {
    for (const milestone of project.milestones) {
      if (!milestone.id.startsWith(`${project.id}.`)) {
        errors.push(`mốc "${milestone.id}" phải bắt đầu bằng "${project.id}."`);
      }
      if (milestoneIds.has(milestone.id)) errors.push(`mã mốc bị trùng: ${milestone.id}`);
      milestoneIds.add(milestone.id);
      for (const need of milestone.needs) {
        if (!stepIds.has(need) && !topicStep.has(need)) errors.push(`mốc "${milestone.id}": "needs" trỏ tới "${need}" không tồn tại`);
      }
    }
  }

  const linked = new Map(graph.steps.map((s) => [s.id, new Set(s.links.map((l) => l.step))]));
  for (const lesson of graph.lessons) {
    for (const topicId of lesson.topics) {
      const stepId = topicStep.get(topicId);
      if (!stepId) errors.push(`bài "${lesson.id}": chủ đề "${topicId}" không tồn tại`);
      else if (stepId !== lesson.stepId && !linked.get(lesson.stepId)?.has(stepId)) {
        errors.push(
          `bài "${lesson.id}": chủ đề "${topicId}" thuộc bước "${stepId}", không thuộc bước "${lesson.stepId}" hay bước được liên kết`,
        );
      }
    }
  }
  return errors;
}
```

Xoá thân cũ của `mergeLock` (bản cũ trả về `{ ids, replacements }`).

- [ ] **Step 4: Chạy test, phải xanh.**
  - Lệnh: `pnpm test -- tests/unit/content-graph.test.ts tests/unit/content-validate.test.ts`
  - Kết quả mong đợi: PASS cả hai file.

- [ ] **Step 5: Điểm kiểm tra.** Chạy `pnpm lint`. Không chạy typecheck ở đây vì `repo.ts` còn dùng `roadmap.steps` (Task 3 sửa).

---

### Task 3: Dữ liệu nội dung và bộ đọc nội dung

**Files:**
- Create (dùng một lần, xoá cuối task): `scripts/import-outline.ts`
- Create: `content/roadmaps/java.json`, `content/roadmaps/devops.json`, `content/roadmaps/microservices.json` (script sinh), `content/projects/neobank.json`, `content/projects/hub-chat.json`
- Create/overwrite: 58 file `content/steps/<id>/meta.json` (script sinh)
- Delete: `content/roadmaps/senior-backend.json`, `content/steps/{b0,b1,b2,b3,b4,bx,j0,jx,m0}` (script xoá; thư mục nào có `.mdx` thì script dừng)
- Modify: `content/steps/d1/d1-1.mdx` (frontmatter `topics`), `content/ids.lock.json` (tự cập nhật), `src/lib/content/repo.ts`, `scripts/content.ts`

**Interfaces:**
- Consumes: mọi schema và hàm của Task 2.
- Produces (`repo.ts`):
  - `loadRoadmaps(): Roadmap[]`
  - `loadSteps(): Map<string, StepMeta>`, với `StepMeta` có `optional`, `topics`, `links`, `pages`
  - `loadProjects(): Project[]`
  - `loadLessons(): LessonEntry[]`, với `LessonEntry` có thêm `topics: string[]`
  - `checkContent(): ContentReport`, với `{ errors; currentIds; currentTopics; currentMilestones }`
  - `updateLock(report: ContentReport): { ids: number; topics: number; milestones: number }`

- [ ] **Step 1:** Tạo `scripts/import-outline.ts`. Script đọc bảng §7 của spec và sinh `meta.json` cùng ba file roadmap.

```ts
/**
 * Dùng một lần: đọc bảng dàn ý (spec §7) và sinh meta.json cho 58 chặng cùng 3 file roadmap.
 * Chạy: pnpm exec tsx scripts/import-outline.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const SPEC = 'docs/superpowers/specs/2026-10-03-tach-roadmap-design.md';
const STEPS_DIR = 'content/steps';
const ROADMAPS_DIR = 'content/roadmaps';

type Level = 'foundation' | 'middle' | 'senior';
type Kind = 'core' | 'pick' | 'opt';
interface Topic { id: string; title: string; kind?: Kind; options?: string[] }
interface Step { roadmap: string; level: Level; code: string; id: string; title: string; optional: boolean; topics: Topic[]; links: { step: string }[] }

const ROADMAPS: Record<string, { id: string; area: string; track: string; title: string; description: string; recommended: string[] }> = {
  '7.1': {
    id: 'java',
    area: 'backend',
    track: 'java',
    title: 'Java backend, từ nền tảng tới Senior',
    description: 'Viết Java đúng, làm chủ một service Spring Boot trên production, rồi tới quyết định kiến trúc và tối ưu JVM.',
    recommended: [],
  },
  '7.2': {
    id: 'devops',
    area: 'devops',
    track: 'devops',
    title: 'DevOps, từ Linux tới vận hành ở quy mô',
    description: 'Tự vận hành một máy Linux, đưa ứng dụng lên production bằng container, CI/CD, cloud và Kubernetes, rồi giữ hệ thống an toàn và đáng tin cậy.',
    recommended: [],
  },
  '7.3': {
    id: 'microservices',
    area: 'backend',
    track: 'microservices',
    title: 'Microservices, từ ranh giới service tới tiến hoá kiến trúc',
    description: 'Biết khi nào nên tách và tách ở đâu, xây hệ thống nhiều service chạy được, rồi vận hành, mở rộng và tiến hoá nó.',
    recommended: ['j11', 'j12', 'd6', 'd7'],
  },
};
const LEVEL: Record<string, Level> = { 'Nền tảng': 'foundation', Middle: 'middle', Senior: 'senior' };
const LEVEL_TITLE: Record<Level, string> = { foundation: 'Nền tảng', middle: 'Middle', senior: 'Senior' };
const STOPWORDS = new Set(['va', 'hoac', 'cua', 'cho', 'voi', 'trong', 'cac', 'mot', 'la']);

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w && !STOPWORDS.has(w))
    .slice(0, 5)
    .join('-');
}

function parseTopics(stepId: string, cell: string, optionalStep: boolean): { topics: Topic[]; links: { step: string }[] } {
  const topics: Topic[] = [];
  const links: { step: string }[] = [];
  const used = new Set<string>();
  for (const raw of cell.split('; ')) {
    let text = raw.trim();
    if (text.startsWith('→')) {
      links.push({ step: text.replace('→', '').trim().toLowerCase() });
      continue;
    }
    let kind: Kind = optionalStep ? 'opt' : 'core';
    if (text.endsWith('*(chọn một)*')) {
      kind = optionalStep ? 'opt' : 'pick';
      text = text.replace('*(chọn một)*', '').trim();
    } else if (text.endsWith('*(tuỳ chọn)*')) {
      kind = 'opt';
      text = text.replace('*(tuỳ chọn)*', '').trim();
    }
    let slug = slugify(text);
    for (let n = 2; used.has(slug); n += 1) slug = `${slugify(text)}-${n}`;
    used.add(slug);
    const topic: Topic = { id: `${stepId}.${slug}`, title: text };
    if (kind !== 'core') topic.kind = kind;
    if (kind === 'pick') topic.options = text.split(/, | hoặc /).map((s) => s.trim()).filter(Boolean);
    topics.push(topic);
  }
  return { topics, links };
}

function parseSpec(): Step[] {
  const lines = fs.readFileSync(SPEC, 'utf8').split('\n');
  const start = lines.findIndex((l) => l.startsWith('## 7.'));
  const end = lines.findIndex((l) => l.startsWith('## 8.'));
  const steps: Step[] = [];
  let roadmap = '';
  let level: Level = 'foundation';
  for (const line of lines.slice(start, end)) {
    const section = /^### (7\.\d)/.exec(line);
    if (section) roadmap = ROADMAPS[section[1]].id;
    const lv = /^\*\*Cấp (Nền tảng|Middle|Senior):\*\*/.exec(line);
    if (lv) level = LEVEL[lv[1]];
    const row = /^\| ([JDM]\d+) \| (.+?) \| (.+) \|$/.exec(line);
    if (!row) continue;
    const [, code, rawTitle, cell] = row;
    const optional = rawTitle.includes('*(chặng tuỳ chọn)*');
    const title = rawTitle.replace('*(chặng tuỳ chọn)*', '').trim();
    const id = code.toLowerCase();
    steps.push({ roadmap, level, code, id, title, optional, ...parseTopics(id, cell, optional) });
  }
  return steps;
}

function goals(): Record<string, Record<Level, string>> {
  const lines = fs.readFileSync(SPEC, 'utf8').split('\n');
  const out: Record<string, Record<Level, string>> = {};
  let roadmap = '';
  for (const line of lines) {
    const section = /^### (7\.\d)/.exec(line);
    if (section) roadmap = ROADMAPS[section[1]].id;
    const lv = /^\*\*Cấp (Nền tảng|Middle|Senior):\*\* (.+)$/.exec(line);
    if (lv && roadmap) {
      const goal = lv[2].trim().replace(/\.$/, '');
      (out[roadmap] ??= {} as Record<Level, string>)[LEVEL[lv[1]]] = `${goal.charAt(0).toUpperCase()}${goal.slice(1)}.`;
    }
  }
  return out;
}

function shortOf(title: string): string {
  return title.length <= 20 ? title : title.split(/, | và |: /)[0].trim();
}

function main() {
  const steps = parseSpec();
  if (steps.length !== 58) throw new Error(`Cần 58 chặng, đọc được ${steps.length}`);
  const newIds = new Set(steps.map((s) => s.id));

  for (const dir of fs.readdirSync(STEPS_DIR)) {
    const full = path.join(STEPS_DIR, dir);
    if (!fs.statSync(full).isDirectory() || newIds.has(dir)) continue;
    if (fs.readdirSync(full).some((f) => f.endsWith('.mdx'))) throw new Error(`Thư mục ${dir} còn bài học, không xoá`);
    fs.rmSync(full, { recursive: true });
    console.log(`xoá ${full}`);
  }

  steps.forEach((step, i) => {
    const prev = steps[i - 1];
    const dir = path.join(STEPS_DIR, step.id);
    const metaFile = path.join(dir, 'meta.json');
    const pages: string[] = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')).pages ?? [] : [];
    const meta = {
      title: step.title,
      id: step.id,
      code: step.code,
      short: shortOf(step.title),
      // Mã roadmap trùng với nhánh (java, devops, microservices).
      track: step.roadmap,
      prerequisites: prev && prev.roadmap === step.roadmap ? [prev.id] : [],
      ...(step.optional ? { optional: true } : {}),
      topics: step.topics,
      links: step.links,
      pages,
    };
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(metaFile, `${JSON.stringify(meta, null, 2)}\n`);
  });

  const levelGoals = goals();
  for (const r of Object.values(ROADMAPS)) {
    const own = steps.filter((s) => s.roadmap === r.id);
    const levels = (['foundation', 'middle', 'senior'] as const).map((lv) => ({
      id: lv,
      title: { vi: LEVEL_TITLE[lv] },
      goal: { vi: levelGoals[r.id][lv] },
      steps: own.filter((s) => s.level === lv).map((s) => s.id),
    }));
    const roadmap = { id: r.id, area: r.area, track: r.track, title: { vi: r.title }, description: { vi: r.description }, recommended: r.recommended, levels };
    fs.writeFileSync(path.join(ROADMAPS_DIR, `${r.id}.json`), `${JSON.stringify(roadmap, null, 2)}\n`);
  }
  fs.rmSync(path.join(ROADMAPS_DIR, 'senior-backend.json'), { force: true });
  console.log(`✓ ${steps.length} chặng, ${steps.reduce((n, s) => n + s.topics.length, 0)} chủ đề`);
}

main();
```

- [ ] **Step 2: Chạy script.**
  - Lệnh: `pnpm exec tsx scripts/import-outline.ts`
  - Kết quả mong đợi: các dòng `xoá content/steps/b0` … `m0`, rồi `✓ 58 chặng, … chủ đề` (khoảng 330).
- [ ] **Step 3: Soát dữ liệu.**
  - Lệnh: `cat content/steps/d1/meta.json content/steps/j5/meta.json content/steps/d18/meta.json content/roadmaps/microservices.json`
  - Phải thấy:
    - `d1` có `"pages": ["d1-1"]`, các chủ đề `d1.tien-trinh-signal-exit-code` và `d1.systemd-journald`;
    - `j5` có `j5.generics`;
    - `d18` có `"optional": true` và mọi chủ đề `"kind": "opt"`;
    - `microservices.json` có `"recommended": ["j11","j12","d6","d7"]`.
  - Slug nào vô nghĩa thì sửa tay trong `meta.json`. Chưa phát hành nên đổi tự do.
- [ ] **Step 4:** Tạo `content/projects/neobank.json`:

```json
{
  "id": "neobank",
  "title": { "vi": "Neobank mini" },
  "summary": { "vi": "Một ngân hàng số thu nhỏ chạy trên máy bạn: tài khoản, sổ cái kép, chuyển tiền liên ngân hàng, thẻ và đối soát. Mỗi mốc dùng kiến thức từ cả ba roadmap." },
  "milestones": [
    { "id": "neobank.discovery", "title": { "vi": "Khám phá miền ngân hàng" }, "needs": ["m3", "j19"] },
    { "id": "neobank.ledger", "title": { "vi": "Sổ cái kép và tài khoản" }, "needs": ["j12", "j14", "m5"] },
    { "id": "neobank.transfers", "title": { "vi": "Chuyển tiền liên ngân hàng và saga" }, "needs": ["m6", "m7", "m9"] },
    { "id": "neobank.cards", "title": { "vi": "Thẻ, rủi ro thời gian thực, xử lý cuối ngày" }, "needs": ["j16", "m13", "d12"] },
    { "id": "neobank.compliance", "title": { "vi": "Bảo mật, tuân thủ, đối soát, khôi phục" }, "needs": ["j13", "m10", "d15", "d17"] }
  ]
}
```

Tạo `content/projects/hub-chat.json`:

```json
{
  "id": "hub-chat",
  "title": { "vi": "Hub hội thoại đa kênh" },
  "summary": { "vi": "Một hệ thống gom hội thoại từ nhiều kênh về một nơi, đi từ một service chạy bằng Compose tới nhiều service trên Kubernetes có giám sát đầy đủ." },
  "milestones": [
    { "id": "hub-chat.contract-first", "title": { "vi": "Hợp đồng trước, chạy bằng Compose" }, "needs": ["j11", "m4", "d6"] },
    { "id": "hub-chat.modular-k8s", "title": { "vi": "Modular monolith lên Kubernetes" }, "needs": ["j19", "d11"] },
    { "id": "hub-chat.event-driven", "title": { "vi": "Hướng sự kiện và tự động hoá" }, "needs": ["m5", "d7"] },
    { "id": "hub-chat.split", "title": { "vi": "Tách service thật" }, "needs": ["m3", "m15"] },
    { "id": "hub-chat.production", "title": { "vi": "Production giả lập" }, "needs": ["d12", "d16", "m9"] },
    { "id": "hub-chat.governance", "title": { "vi": "Quản trị và tổng kết" }, "needs": ["m18", "j20"] }
  ]
}
```

- [ ] **Step 5:** Sửa frontmatter của `content/steps/d1/d1-1.mdx`: thêm một dòng sau `prerequisites: [d0]`.

```yaml
topics: [d1.tien-trinh-signal-exit-code, d1.systemd-journald]
```

- [ ] **Step 6:** Sửa `src/lib/content/repo.ts`.
  - Đổi import:

```ts
import {
  LESSON_SECTIONS,
  idsLockSchema,
  lessonFields,
  projectSchema,
  refineLesson,
  roadmapSchema,
  stepFields,
  type IdsLock,
  type Project,
  type Roadmap,
} from './schema';
import {
  mergeKeys,
  validateGraph,
  validateInternalLinks,
  validateLessonStructure,
  validateLock,
  validateTranslation,
} from './validate';
```

  - Thêm hằng `PROJECTS_DIR` và hàm `loadProjects` cạnh `loadRoadmaps`:

```ts
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');

let projectsCache: Project[] | undefined;
export function loadProjects(): Project[] {
  projectsCache ??= fs.existsSync(PROJECTS_DIR)
    ? fs
        .readdirSync(PROJECTS_DIR)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => projectSchema.parse(readJson(path.join(PROJECTS_DIR, f))))
    : [];
  return projectsCache;
}
```

  - Trong `LessonEntry` thêm `topics: string[];`. Trong `loadLessons`, thêm `topics: frontmatter?.topics ?? [],` vào object trả về.
  - Đổi `ContentReport` và cuối `checkContent`. Thay vòng `for (const roadmap of loadRoadmaps())` cùng dòng `validateLock` cũ bằng đoạn dưới:

```ts
export interface ContentReport {
  errors: string[];
  currentIds: Set<string>;
  currentTopics: Set<string>;
  currentMilestones: Set<string>;
}
```

```ts
  const projects = loadProjects();
  const sourceLessons = parsed.filter((p) => p.file.lang === DEFAULT_LANG && p.frontmatter);
  validateGraph({
    roadmaps: loadRoadmaps().map((r) => ({ id: r.id, recommended: r.recommended, levels: r.levels })),
    steps: [...steps.values()].map((s) => ({
      id: s.id,
      topics: s.topics.map((t) => ({ id: t.id, requires: t.requires })),
      links: s.links,
    })),
    projects: projects.map((p) => ({ id: p.id, milestones: p.milestones.map((m) => ({ id: m.id, needs: m.needs })) })),
    lessons: sourceLessons.map((p) => ({ id: p.frontmatter!.id, stepId: p.file.stepId, topics: p.frontmatter!.topics })),
  }).forEach((e) => errors.push(e));

  const currentTopics = new Set([...steps.values()].flatMap((s) => s.topics.map((t) => t.id)));
  const currentMilestones = new Set(projects.flatMap((p) => p.milestones.map((m) => m.id)));
  const lock = loadLock();
  validateLock(lock, currentIds).forEach((e) => errors.push(`ids.lock.json: ${e}`));
  validateLock({ ids: lock.topics, replacements: lock.replacements }, currentTopics).forEach((e) =>
    errors.push(`ids.lock.json (topics): ${e}`),
  );
  validateLock({ ids: lock.milestones, replacements: lock.replacements }, currentMilestones).forEach((e) =>
    errors.push(`ids.lock.json (milestones): ${e}`),
  );
  return { errors, currentIds, currentTopics, currentMilestones };
}
```

    Hai chỗ `p.frontmatter!` an toàn vì đã lọc `p.frontmatter` ở dòng trên. Cấu hình lint hiện tại (`eslint-config-next`) không cấm non-null assertion.

  - Thay `updateLock`:

```ts
/** Thêm mã mục, mã chủ đề, mã mốc mới vào file khoá. Trả về số mã đã thêm theo từng loại. */
export function updateLock(report: ContentReport): { ids: number; topics: number; milestones: number } {
  const lock = loadLock();
  const next: IdsLock = {
    ids: mergeKeys(lock.ids, report.currentIds),
    topics: mergeKeys(lock.topics, report.currentTopics),
    milestones: mergeKeys(lock.milestones, report.currentMilestones),
    replacements: lock.replacements,
  };
  const added = {
    ids: next.ids.length - lock.ids.length,
    topics: next.topics.length - lock.topics.length,
    milestones: next.milestones.length - lock.milestones.length,
  };
  if (added.ids + added.topics + added.milestones > 0) writeLock(next);
  return added;
}
```

  - Xoá import `mergeLock` khỏi `repo.ts` vì không còn dùng.
- [ ] **Step 7:** Thay `scripts/content.ts`:

```ts
/**
 * Kiểm tra nội dung (architecture §10) và cập nhật file khoá mã.
 *
 *   tsx scripts/content.ts check           chỉ kiểm tra
 *   tsx scripts/content.ts check --write   kiểm tra rồi thêm mã mục, mã chủ đề, mã mốc mới vào content/ids.lock.json
 */
import { checkContent, loadLock, updateLock } from '../src/lib/content/repo';

const write = process.argv.includes('--write');
const report = checkContent();

if (report.errors.length > 0) {
  console.error(`✗ Nội dung có ${report.errors.length} lỗi:`);
  for (const error of report.errors) console.error(`  - ${error}`);
  process.exit(1);
}

const summary = `${report.currentIds.size} mã mục, ${report.currentTopics.size} mã chủ đề, ${report.currentMilestones.size} mã mốc`;
if (write) {
  const added = updateLock(report);
  console.log(`✓ Nội dung hợp lệ. ${summary}; thêm ${added.ids} mục, ${added.topics} chủ đề, ${added.milestones} mốc vào ids.lock.json.`);
} else {
  const lock = loadLock();
  const unlocked =
    [...report.currentIds].filter((id) => !lock.ids.includes(id)).length +
    [...report.currentTopics].filter((id) => !lock.topics.includes(id)).length +
    [...report.currentMilestones].filter((id) => !lock.milestones.includes(id)).length;
  console.log(`✓ Nội dung hợp lệ. ${summary}.`);
  if (unlocked > 0) console.log(`  ${unlocked} mã chưa có trong ids.lock.json; chạy "pnpm content:lock" để thêm.`);
}
```

- [ ] **Step 8: Khoá mã.**
  - Lệnh: `pnpm content:lock`
  - Kết quả mong đợi: `✓ Nội dung hợp lệ. 12 mã mục, … mã chủ đề, 11 mã mốc; thêm 0 mục, … chủ đề, 11 mốc vào ids.lock.json.`
  - Sau đó chạy `git diff content/ids.lock.json`: phải thấy 12 mã `d1.1.*` vẫn nguyên, chỉ thêm `topics` và `milestones`.
- [ ] **Step 9:** Xoá `scripts/import-outline.ts`.
- [ ] **Step 10: Điểm kiểm tra.** Chạy `pnpm content:check && pnpm test`: cả hai phải xanh.

---

### Task 4: Tiến độ phiên bản 2 (model và store)

**Files:**
- Modify: `src/lib/progress/model.ts`, `src/lib/progress/store.ts`
- Test: `tests/unit/progress.test.ts` (viết lại toàn bộ)

**Interfaces:**
- Consumes: `Level`, `LEVELS` từ `@/lib/content/constants`.
- Produces:
  - `PROGRESS_VERSION = 2`
  - `PROGRESS_STORAGE_KEY = 'masteva:progress:v2'`, `LEGACY_PROGRESS_STORAGE_KEY = 'masteva:progress:v1'`
  - `TOPIC_MARKS`, `type TopicMark = 'learning' | 'done' | 'skipped'`
  - `interface Progress { v: 2; items; topics: Record<string, { s: TopicMark; at: string }>; start: Record<string, Level> }`
  - `isProgress`, `parseProgress(raw, replacements?)`, `applyReplacements`, `mergeProgress`, `toggleItem`
  - `setTopicMark(p, id, mark | null, now?)`, `setStart(p, roadmapId, level | null)`
  - `emptyProgress`, `tally`
  - `ProgressStore`: các method `toggle(id)`, `setTopic(id, mark | null)`, `setStart(roadmapId, level | null)`, `importData`, `exportData`, `reload`, `setReplacements`
  - Bỏ `firstIncomplete`.

- [ ] **Step 1: Viết test trước.** Thay toàn bộ `tests/unit/progress.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  applyReplacements,
  emptyProgress,
  isProgress,
  LEGACY_PROGRESS_STORAGE_KEY,
  mergeProgress,
  parseProgress,
  PROGRESS_STORAGE_KEY,
  setStart,
  setTopicMark,
  tally,
  toggleItem,
  type Progress,
} from '@/lib/progress/model';
import { ProgressStore, type StorageLike } from '@/lib/progress/store';

const T1 = '2026-10-01T00:00:00.000Z';
const T2 = '2026-10-02T00:00:00.000Z';
const T3 = '2026-10-03T00:00:00.000Z';
const progress = (p: Partial<Progress> = {}): Progress => ({ v: 2, items: {}, topics: {}, start: {}, ...p });

describe('progress model v2', () => {
  it('validates the stored shape', () => {
    expect(
      isProgress(progress({ items: { 'd1.1.a': T1 }, topics: { 'j5.generics': { s: 'learning', at: T1 } }, start: { java: 'middle' } })),
    ).toBe(true);
    expect(isProgress({ v: 1, items: {} })).toBe(false);
    expect(isProgress(progress({ items: { a: 'yesterday' } }))).toBe(false);
    expect(isProgress({ ...progress(), topics: { a: { s: 'maybe', at: T1 } } })).toBe(false);
    expect(isProgress({ ...progress(), start: { java: 'expert' } })).toBe(false);
    expect(isProgress({ ...progress(), items: [] })).toBe(false);
    expect(isProgress(null)).toBe(false);
  });

  it('upgrades v1 data and applies replacements', () => {
    expect(parseProgress({ v: 1, items: { old: T1 } }, { old: 'new' })).toEqual(progress({ items: { new: T1 } }));
  });

  it('rejects invalid data', () => {
    expect(parseProgress({ foo: 1 })).toBeNull();
    expect(parseProgress({ v: 9, items: {} })).toBeNull();
  });

  it('toggles an item on and off and keeps topics', () => {
    const base = progress({ topics: { 'j1.a': { s: 'done', at: T1 } } });
    const on = toggleItem(base, 'd1.1.a', new Date(T2));
    expect(on.items['d1.1.a']).toBe(T2);
    expect(on.topics).toEqual(base.topics);
    expect(toggleItem(on, 'd1.1.a').items).toEqual({});
  });

  it('sets and clears a topic mark', () => {
    const marked = setTopicMark(progress(), 'j5.generics', 'done', new Date(T2));
    expect(marked.topics['j5.generics']).toEqual({ s: 'done', at: T2 });
    expect(setTopicMark(marked, 'j5.generics', null).topics).toEqual({});
  });

  it('sets and clears the starting level', () => {
    const started = setStart(progress(), 'java', 'middle');
    expect(started.start).toEqual({ java: 'middle' });
    expect(setStart(started, 'java', null).start).toEqual({});
  });

  it('merges items by earliest, topics by latest, start by the current value', () => {
    const a = progress({ items: { x: T2 }, topics: { t: { s: 'learning', at: T1 } }, start: { java: 'middle' } });
    const b = progress({
      items: { x: T1, y: T3 },
      topics: { t: { s: 'done', at: T2 }, u: { s: 'skipped', at: T1 } },
      start: { java: 'senior', devops: 'middle' },
    });
    expect(mergeProgress(a, b)).toEqual(
      progress({
        items: { x: T1, y: T3 },
        topics: { t: { s: 'done', at: T2 }, u: { s: 'skipped', at: T1 } },
        start: { java: 'middle', devops: 'middle' },
      }),
    );
  });

  it('maps retired item and topic ids, following chains', () => {
    const old = progress({ items: { a: T2, c: T1 }, topics: { 'j1.old': { s: 'done', at: T1 } } });
    const mapped = applyReplacements(old, { a: 'b', b: 'c', 'j1.old': 'j1.new' });
    expect(mapped.items).toEqual({ c: T1 });
    expect(mapped.topics).toEqual({ 'j1.new': { s: 'done', at: T1 } });
  });

  it('survives replacement cycles', () => {
    expect(Object.keys(applyReplacements(progress({ items: { a: T1 } }), { a: 'b', b: 'a' }).items)).toHaveLength(1);
  });

  it('tallies items', () => {
    expect(tally(progress({ items: { 'a.1': T1 } }), ['a.1', 'a.2'])).toEqual({ done: 1, total: 2 });
  });
});

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

describe('ProgressStore', () => {
  it('persists toggles and notifies listeners', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);
    store.toggle('d1.1.a');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).items).toHaveProperty('d1.1.a');
    expect(new ProgressStore(storage).getSnapshot().progress.items).toHaveProperty('d1.1.a');
  });

  it('migrates the v1 key once and keeps it', () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_PROGRESS_STORAGE_KEY, JSON.stringify({ v: 1, items: { 'd1.1.old': T1 } }));
    const store = new ProgressStore(storage, { 'd1.1.old': 'd1.1.new' });
    expect(store.getSnapshot().progress.items).toEqual({ 'd1.1.new': T1 });
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY)!).v).toBe(2);
    expect(storage.getItem(LEGACY_PROGRESS_STORAGE_KEY)).not.toBeNull();
  });

  it('stores topic marks and the starting level', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage);
    store.setTopic('j5.generics', 'learning');
    store.setStart('java', 'middle');
    const saved = new ProgressStore(storage).getSnapshot().progress;
    expect(saved.topics['j5.generics'].s).toBe('learning');
    expect(saved.start).toEqual({ java: 'middle' });
    store.setTopic('j5.generics', null);
    expect(store.getSnapshot().progress.topics).toEqual({});
  });

  it('falls back to memory when storage is unavailable', () => {
    const store = new ProgressStore(null);
    store.toggle('d1.1.a');
    store.setTopic('j1.a', 'done');
    expect(store.getSnapshot()).toMatchObject({ persistent: false, progress: { items: { 'd1.1.a': expect.any(String) } } });
    expect(store.getSnapshot().progress.topics['j1.a'].s).toBe('done');
  });

  it('reports non-persistent when writes throw', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    const store = new ProgressStore(storage);
    store.toggle('d1.1.a');
    expect(store.getSnapshot().persistent).toBe(false);
  });

  it('ignores corrupted storage', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, '{not json');
    expect(new ProgressStore(storage).getSnapshot().progress).toEqual(emptyProgress());
  });

  it('imports v1 and v2 files by merging', () => {
    const store = new ProgressStore(new MemoryStorage(), { old: 'new' });
    store.toggle('kept');
    store.setTopic('j1.a', 'learning');
    expect(store.importData({ v: 1, items: { old: T1 } })).toBe(3);
    expect(store.importData(progress({ topics: { 'j2.b': { s: 'skipped', at: T1 } } }))).toBe(4);
    expect(Object.keys(store.exportData().items).sort()).toEqual(['kept', 'new']);
    expect(store.importData({ v: 9 })).toBeNull();
  });

  it('reloads when another tab writes', () => {
    const storage = new MemoryStorage();
    const store = new ProgressStore(storage);
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress({ items: { x: T1 } })));
    store.reload();
    expect(store.getSnapshot().progress.items).toHaveProperty('x');
  });
});
```

- [ ] **Step 2: Chạy test, phải đỏ.**
  - Lệnh: `pnpm test -- tests/unit/progress.test.ts`
  - Kết quả mong đợi: FAIL (thiếu `setTopicMark`, `LEGACY_PROGRESS_STORAGE_KEY`, v2).

- [ ] **Step 3: Viết code.** Thay toàn bộ `src/lib/progress/model.ts`:

```ts
import { LEVELS, type Level } from '@/lib/content/constants';

/**
 * Mô hình tiến độ (spec §5). Lưu mục đã tích, trạng thái người học tự đặt cho chủ đề
 * và cấp bắt đầu của từng roadmap. Không phụ thuộc ngôn ngữ.
 * Tổng của bài, chặng, roadmap luôn được tính lại từ dữ liệu trang, không lưu.
 */
export const PROGRESS_VERSION = 2;
export const PROGRESS_STORAGE_KEY = `masteva:progress:v${PROGRESS_VERSION}`;
export const LEGACY_PROGRESS_STORAGE_KEY = 'masteva:progress:v1';

export const TOPIC_MARKS = ['learning', 'done', 'skipped'] as const;
export type TopicMark = (typeof TOPIC_MARKS)[number];

export interface TopicEntry {
  s: TopicMark;
  at: string;
}

export interface Progress {
  v: typeof PROGRESS_VERSION;
  /** Mã mục → thời điểm hoàn thành (ISO 8601). */
  items: Record<string, string>;
  /** Mã chủ đề → trạng thái người học tự đặt. */
  topics: Record<string, TopicEntry>;
  /** Mã roadmap → cấp bắt đầu ("Tôi đã biết" các cấp trước đó). */
  start: Record<string, Level>;
}

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isItems(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.entries(value).every(([id, at]) => id.length > 0 && typeof at === 'string' && ISO_DATETIME.test(at));
}

function isTopicEntry(value: unknown): value is TopicEntry {
  return (
    isRecord(value) &&
    (TOPIC_MARKS as readonly unknown[]).includes(value.s) &&
    typeof value.at === 'string' &&
    ISO_DATETIME.test(value.at)
  );
}

/**
 * Kiểm tra dữ liệu thô. Viết tay thay vì dùng Zod để không kéo thư viện schema
 * xuống trình duyệt (ngân sách JavaScript, architecture §1).
 */
export function isProgress(raw: unknown): raw is Progress {
  if (!isRecord(raw) || raw.v !== PROGRESS_VERSION || !isItems(raw.items)) return false;
  if (!isRecord(raw.topics) || !Object.values(raw.topics).every(isTopicEntry)) return false;
  return isRecord(raw.start) && Object.values(raw.start).every((l) => (LEVELS as readonly unknown[]).includes(l));
}

function isLegacyProgress(raw: unknown): raw is { v: 1; items: Record<string, string> } {
  return isRecord(raw) && raw.v === 1 && isItems(raw.items);
}

export function emptyProgress(): Progress {
  return { v: PROGRESS_VERSION, items: {}, topics: {}, start: {} };
}

/** Đi theo chuỗi mã thay thế, dừng khi gặp vòng lặp. */
function resolve(id: string, replacements: Readonly<Record<string, string>>): string {
  let current = id;
  const visited = new Set<string>();
  while (replacements[current] && !visited.has(current)) {
    visited.add(current);
    current = replacements[current];
  }
  return current;
}

/**
 * Đọc dữ liệu thô từ storage hoặc file nhập: nhận v2, tự nâng v1,
 * rồi ánh xạ mã cũ sang mã thay thế. Trả về `null` nếu dữ liệu không hợp lệ.
 */
export function parseProgress(raw: unknown, replacements: Readonly<Record<string, string>> = {}): Progress | null {
  if (isProgress(raw)) return applyReplacements(raw, replacements);
  if (isLegacyProgress(raw)) return applyReplacements({ ...emptyProgress(), items: raw.items }, replacements);
  return null;
}

export function applyReplacements(progress: Progress, replacements: Readonly<Record<string, string>>): Progress {
  const items: Record<string, string> = {};
  for (const [id, at] of Object.entries(progress.items)) {
    const target = resolve(id, replacements);
    items[target] = items[target] && items[target] < at ? items[target] : at;
  }
  const topics: Record<string, TopicEntry> = {};
  for (const [id, entry] of Object.entries(progress.topics)) {
    const target = resolve(id, replacements);
    topics[target] = topics[target] && topics[target].at > entry.at ? topics[target] : entry;
  }
  return { ...progress, items, topics };
}

/**
 * Gộp hai bản tiến độ (FR-PROGRESS-003): mục lấy hợp, giữ thời điểm sớm hơn;
 * chủ đề giữ bản đặt sau cùng; cấp bắt đầu ưu tiên bản hiện có (`a`).
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const items: Record<string, string> = { ...a.items };
  for (const [id, at] of Object.entries(b.items)) {
    items[id] = items[id] && items[id] < at ? items[id] : at;
  }
  const topics: Record<string, TopicEntry> = { ...a.topics };
  for (const [id, entry] of Object.entries(b.topics)) {
    topics[id] = topics[id] && topics[id].at >= entry.at ? topics[id] : entry;
  }
  return { v: PROGRESS_VERSION, items, topics, start: { ...b.start, ...a.start } };
}

export function toggleItem(progress: Progress, id: string, now: Date = new Date()): Progress {
  const items = { ...progress.items };
  if (items[id]) delete items[id];
  else items[id] = now.toISOString();
  return { ...progress, items };
}

/** Đặt hoặc xoá (`null`) trạng thái người học tự đặt cho một chủ đề. */
export function setTopicMark(progress: Progress, id: string, mark: TopicMark | null, now: Date = new Date()): Progress {
  const topics = { ...progress.topics };
  if (mark === null) delete topics[id];
  else topics[id] = { s: mark, at: now.toISOString() };
  return { ...progress, topics };
}

/** Đặt hoặc xoá (`null`) cấp bắt đầu của một roadmap. */
export function setStart(progress: Progress, roadmapId: string, level: Level | null): Progress {
  const start = { ...progress.start };
  if (level === null) delete start[roadmapId];
  else start[roadmapId] = level;
  return { ...progress, start };
}

export interface Tally {
  done: number;
  total: number;
}

export function tally(progress: Progress, ids: readonly string[]): Tally {
  return { done: ids.filter((id) => progress.items[id]).length, total: ids.length };
}
```

Trong `src/lib/progress/store.ts`:
- đổi import thành `import { emptyProgress, LEGACY_PROGRESS_STORAGE_KEY, mergeProgress, parseProgress, PROGRESS_STORAGE_KEY, setStart, setTopicMark, toggleItem, type Progress, type TopicMark } from './model';` và `import type { Level } from '@/lib/content/constants';`;
- thêm hai method sau `toggle`;
- thay `importData` và `read`.

```ts
  setTopic(id: string, mark: TopicMark | null): void {
    this.write(setTopicMark(this.snapshot.progress, id, mark));
  }

  setStart(roadmapId: string, level: Level | null): void {
    this.write(setStart(this.snapshot.progress, roadmapId, level));
  }

  /** Gộp tiến độ từ file nhập. Trả về số mục và chủ đề sau khi gộp, hoặc `null` nếu file sai. */
  importData(raw: unknown): number | null {
    const incoming = parseProgress(raw, this.replacements);
    if (!incoming) return null;
    const merged = mergeProgress(this.snapshot.progress, incoming);
    this.write(merged);
    return Object.keys(merged.items).length + Object.keys(merged.topics).length;
  }
```

```ts
  private read(): ProgressSnapshot {
    if (!this.storage) return { progress: this.snapshot?.progress ?? emptyProgress(), persistent: false };
    try {
      const raw = this.storage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) return { progress: parseProgress(JSON.parse(raw), this.replacements) ?? emptyProgress(), persistent: true };
      const legacy = this.storage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
      const migrated = legacy ? parseProgress(JSON.parse(legacy), this.replacements) : null;
      // Chuyển dữ liệu v1 sang khoá v2 một lần; giữ khoá v1 để có thể quay lui (spec §5).
      if (migrated) this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(migrated));
      return { progress: migrated ?? emptyProgress(), persistent: true };
    } catch {
      return { progress: this.snapshot?.progress ?? emptyProgress(), persistent: false };
    }
  }
```

  Hằng `PROGRESS_STORAGE_KEY` trong bộ nghe sự kiện `storage` tự trỏ sang khoá v2, không phải sửa.

- [ ] **Step 4: Chạy test, phải xanh.** Lệnh: `pnpm test -- tests/unit/progress.test.ts`. Kết quả mong đợi: PASS.
- [ ] **Step 5: Điểm kiểm tra.** Chạy `pnpm test`: mọi file unit phải xanh.

---

### Task 5: Logic tiến độ theo roadmap

**Files:**
- Create: `src/lib/progress/roadmap.ts`
- Test: `tests/unit/progress-roadmap.test.ts`

**Interfaces:**
- Consumes: `Progress`, `Tally` (Task 4); `Level`, `TopicKind` (Task 2).
- Produces:
  - `interface LiteTopic { id: string; title: string; kind: TopicKind; items: string[] }`
  - `interface LiteStep { id: string; code: string; topics: LiteTopic[] }`
  - `interface LiteLevel { id: Level; steps: LiteStep[] }`
  - `interface RoadmapLite { id: string; title: string; levels: LiteLevel[] }`
  - `type TopicState = 'todo' | 'learning' | 'done' | 'skipped'`
  - `topicState`, `isCounted`, `tallyTopics`, `skippedLevels`, `nextTopic`, `roadmapTally`, `currentTopic`

- [ ] **Step 1: Viết test trước.** Tạo `tests/unit/progress-roadmap.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Progress } from '@/lib/progress/model';
import {
  currentTopic,
  nextTopic,
  roadmapTally,
  skippedLevels,
  tallyTopics,
  topicState,
  type RoadmapLite,
} from '@/lib/progress/roadmap';

const T1 = '2026-10-01T00:00:00.000Z';
const T2 = '2026-10-02T00:00:00.000Z';
const T3 = '2026-10-03T00:00:00.000Z';
const p = (over: Partial<Progress> = {}): Progress => ({ v: 2, items: {}, topics: {}, start: {}, ...over });

const java: RoadmapLite = {
  id: 'java',
  title: 'Java',
  levels: [
    {
      id: 'foundation',
      steps: [
        {
          id: 'j1',
          code: 'J1',
          topics: [
            { id: 'j1.a', title: 'A', kind: 'core', items: ['j1.1.x', 'j1.1.y'] },
            { id: 'j1.opt', title: 'Opt', kind: 'opt', items: [] },
          ],
        },
      ],
    },
    {
      id: 'middle',
      steps: [
        {
          id: 'j11',
          code: 'J11',
          topics: [
            { id: 'j11.b', title: 'B', kind: 'pick', items: [] },
            { id: 'j11.c', title: 'C', kind: 'core', items: [] },
          ],
        },
      ],
    },
  ],
};
const a = java.levels[0].steps[0].topics[0];

describe('topicState', () => {
  it('derives state from lesson items', () => {
    expect(topicState(p(), a)).toBe('todo');
    expect(topicState(p({ items: { 'j1.1.x': T1 } }), a)).toBe('learning');
    expect(topicState(p({ items: { 'j1.1.x': T1, 'j1.1.y': T1 } }), a)).toBe('done');
  });

  it('explicit mark wins over lesson items', () => {
    expect(topicState(p({ topics: { 'j1.a': { s: 'done', at: T1 } } }), a)).toBe('done');
    expect(topicState(p({ items: { 'j1.1.x': T1, 'j1.1.y': T1 }, topics: { 'j1.a': { s: 'skipped', at: T1 } } }), a)).toBe('skipped');
    expect(topicState(p({ items: { 'j1.1.x': T1, 'j1.1.y': T1 }, topics: { 'j1.a': { s: 'learning', at: T1 } } }), a)).toBe('learning');
  });

  it('treats a topic without lessons as todo until marked', () => {
    expect(topicState(p(), java.levels[1].steps[0].topics[1])).toBe('todo');
  });
});

describe('tallies', () => {
  it('counts core and pick topics, ignoring optional and skipped ones', () => {
    const topics = java.levels.flatMap((l) => l.steps.flatMap((s) => s.topics));
    const progress = p({ topics: { 'j1.a': { s: 'done', at: T1 }, 'j11.c': { s: 'skipped', at: T1 }, 'j1.opt': { s: 'done', at: T1 } } });
    expect(tallyTopics(progress, topics)).toEqual({ done: 1, total: 2 });
  });

  it('excludes skipped levels from the roadmap tally', () => {
    expect(roadmapTally(p(), java)).toEqual({ done: 0, total: 3 });
    expect(roadmapTally(p({ start: { java: 'middle' } }), java)).toEqual({ done: 0, total: 2 });
  });
});

describe('skippedLevels', () => {
  it('returns the levels before the starting level', () => {
    expect([...skippedLevels(p(), java)]).toEqual([]);
    expect([...skippedLevels(p({ start: { java: 'middle' } }), java)]).toEqual(['foundation']);
  });
});

describe('nextTopic', () => {
  it('returns the first todo counted topic', () => {
    expect(nextTopic(p(), java)?.topic.id).toBe('j1.a');
  });

  it('prefers a topic in progress', () => {
    expect(nextTopic(p({ topics: { 'j11.c': { s: 'learning', at: T1 } } }), java)?.topic.id).toBe('j11.c');
  });

  it('starts from the chosen level', () => {
    const result = nextTopic(p({ start: { java: 'middle' } }), java);
    expect(result?.topic.id).toBe('j11.b');
    expect(result?.step.id).toBe('j11');
  });

  it('returns undefined when everything is done', () => {
    const done = { s: 'done' as const, at: T1 };
    expect(nextTopic(p({ topics: { 'j1.a': done, 'j11.b': done, 'j11.c': done } }), java)).toBeUndefined();
  });
});

describe('currentTopic', () => {
  const devops: RoadmapLite = {
    id: 'devops',
    title: 'DevOps',
    levels: [{ id: 'foundation', steps: [{ id: 'd1', code: 'D1', topics: [{ id: 'd1.x', title: 'X', kind: 'core', items: ['d1.1.a', 'd1.1.b'] }] }] }],
  };

  it('picks the most recent topic in progress across roadmaps', () => {
    const progress = p({ items: { 'd1.1.a': T3 }, topics: { 'j11.c': { s: 'learning', at: T2 } } });
    expect(currentTopic(progress, [java, devops])).toMatchObject({ roadmap: { id: 'devops' }, topic: { id: 'd1.x' }, at: T3 });
  });

  it('returns undefined when nothing is in progress', () => {
    expect(currentTopic(p(), [java, devops])).toBeUndefined();
  });
});
```

- [ ] **Step 2: Chạy test, phải đỏ.** Lệnh: `pnpm test -- tests/unit/progress-roadmap.test.ts`. Kết quả mong đợi: FAIL (thiếu module).
- [ ] **Step 3: Viết code.** Tạo `src/lib/progress/roadmap.ts`:

```ts
import type { Level, TopicKind } from '@/lib/content/constants';
import type { Progress, Tally } from './model';

/**
 * Tiến độ theo roadmap (spec §5). Dữ liệu "lite" chỉ gồm những gì trình duyệt cần
 * để tính trạng thái, được tạo lúc build và truyền xuống qua props.
 */
export interface LiteTopic {
  id: string;
  title: string;
  kind: TopicKind;
  /** Mã mục của mọi bài gắn với chủ đề này. */
  items: string[];
}

export interface LiteStep {
  id: string;
  code: string;
  topics: LiteTopic[];
}

export interface LiteLevel {
  id: Level;
  steps: LiteStep[];
}

export interface RoadmapLite {
  id: string;
  title: string;
  levels: LiteLevel[];
}

export type TopicState = 'todo' | 'learning' | 'done' | 'skipped';

/** Trạng thái tự đặt thắng; nếu không có thì suy ra từ mục đã tích trong các bài gắn với chủ đề. */
export function topicState(progress: Progress, topic: Pick<LiteTopic, 'id' | 'items'>): TopicState {
  const mark = progress.topics[topic.id]?.s;
  if (mark) return mark;
  const done = topic.items.filter((id) => progress.items[id]).length;
  if (topic.items.length > 0 && done === topic.items.length) return 'done';
  return done > 0 ? 'learning' : 'todo';
}

/** Chủ đề tuỳ chọn không tính vào tiến độ. */
export const isCounted = (topic: Pick<LiteTopic, 'kind'>) => topic.kind !== 'opt';

/** Đếm chủ đề chính đã xong; chủ đề bị bỏ qua bị loại khỏi cả tử và mẫu. */
export function tallyTopics(progress: Progress, topics: readonly LiteTopic[]): Tally {
  let done = 0;
  let total = 0;
  for (const topic of topics) {
    if (!isCounted(topic)) continue;
    const state = topicState(progress, topic);
    if (state === 'skipped') continue;
    total += 1;
    if (state === 'done') done += 1;
  }
  return { done, total };
}

/** Các cấp đứng trước cấp bắt đầu mà người học đã chọn ("Tôi đã biết"). */
export function skippedLevels(progress: Progress, roadmap: RoadmapLite): Set<Level> {
  const start = progress.start[roadmap.id];
  const index = start ? roadmap.levels.findIndex((l) => l.id === start) : 0;
  return new Set(roadmap.levels.slice(0, Math.max(index, 0)).map((l) => l.id));
}

function activeTopics(progress: Progress, roadmap: RoadmapLite) {
  const skipped = skippedLevels(progress, roadmap);
  return roadmap.levels
    .filter((level) => !skipped.has(level.id))
    .flatMap((level) => level.steps.flatMap((step) => step.topics.filter(isCounted).map((topic) => ({ step, topic }))));
}

/** Chủ đề cho nút "Học tiếp": ưu tiên chủ đề đang học, rồi tới chủ đề chưa học đầu tiên. */
export function nextTopic(progress: Progress, roadmap: RoadmapLite): { step: LiteStep; topic: LiteTopic } | undefined {
  const candidates = activeTopics(progress, roadmap);
  return (
    candidates.find((c) => topicState(progress, c.topic) === 'learning') ??
    candidates.find((c) => topicState(progress, c.topic) === 'todo')
  );
}

/** Tiến độ của cả roadmap, không tính các cấp người học đã đánh "đã biết". */
export function roadmapTally(progress: Progress, roadmap: RoadmapLite): Tally {
  return tallyTopics(progress, activeTopics(progress, roadmap).map((c) => c.topic));
}

/** Chủ đề đang học có hoạt động gần nhất trên mọi roadmap, dùng cho khối "Bạn đang học". */
export function currentTopic(
  progress: Progress,
  roadmaps: readonly RoadmapLite[],
): { roadmap: RoadmapLite; step: LiteStep; topic: LiteTopic; at: string } | undefined {
  let best: { roadmap: RoadmapLite; step: LiteStep; topic: LiteTopic; at: string } | undefined;
  for (const roadmap of roadmaps) {
    for (const step of roadmap.levels.flatMap((l) => l.steps)) {
      for (const topic of step.topics) {
        if (topicState(progress, topic) !== 'learning') continue;
        const times = topic.items.map((id) => progress.items[id]).filter((at): at is string => Boolean(at));
        const at = progress.topics[topic.id]?.at ?? times.sort().at(-1) ?? '';
        if (!best || at > best.at) best = { roadmap, step, topic, at };
      }
    }
  }
  return best;
}
```

- [ ] **Step 4: Chạy test, phải xanh.** Lệnh: `pnpm test -- tests/unit/progress-roadmap.test.ts`. Kết quả mong đợi: PASS.
- [ ] **Step 5: Điểm kiểm tra.** Chạy `pnpm test`.

---

### Task 6: Dựng dữ liệu cho trang (views)

**Files:**
- Create: `src/lib/content/views.ts`
- Modify: `src/lib/content/manifest.ts` (viết lại)
- Test: `tests/unit/content-views.test.ts`

**Interfaces:**
- Consumes:
  - `Roadmap`, `Project`, `Topic` (Task 2, chỉ `import type`);
  - `RoadmapLite`, `LiteTopic` (Task 5);
  - các loader trong `repo.ts` (Task 3).
- Produces:
  - Từ `views.ts` (an toàn cho trình duyệt, chỉ có type và hàm thuần):
    - `LessonRef`, `StepRef`, `TopicRef`, `ProjectUse`, `TopicView`, `StepView`, `LevelView`, `RoadmapView`, `NeedView`, `ProjectView`, `LessonContext`, `ViewInput`, `StepInput`, `LessonInput`
    - `buildRoadmapView(input, roadmapId)`, `buildProjectView(input, projectId)`, `buildLessonContext(input, lessonId)`, `toLite(view)`
  - Từ `manifest.ts` (server-only):
    - `getRoadmapView(id, lang)`, `listRoadmapViews(lang)`
    - `getProjectView(id, lang)`, `listProjectViews(lang)`
    - `getLessonContext(lessonId, lang)`
    - `getLessonItems`, `getReplacements`, `getLessonSourceHash`, `hasTranslation` (giữ chữ ký cũ)

- [ ] **Step 1: Viết test trước.** Tạo `tests/unit/content-views.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Topic } from '@/lib/content/schema';
import { buildLessonContext, buildProjectView, buildRoadmapView, toLite, type ViewInput } from '@/lib/content/views';

const topic = (id: string, extra: Partial<Topic> = {}): Topic => ({ id, title: id.toUpperCase(), kind: 'core', requires: [], resources: [], ...extra });

const input: ViewInput = {
  lang: 'vi',
  roadmaps: [
    {
      id: 'java',
      area: 'backend',
      track: 'java',
      title: { vi: 'Java', en: 'Java EN' },
      description: { vi: 'Mô tả' },
      recommended: [],
      levels: [
        { id: 'foundation', title: { vi: 'Nền tảng' }, goal: { vi: 'Mục tiêu 1' }, steps: ['j1'] },
        { id: 'middle', title: { vi: 'Middle' }, goal: { vi: 'Mục tiêu 2' }, steps: ['j2'] },
      ],
    },
    {
      id: 'devops',
      area: 'devops',
      track: 'devops',
      title: { vi: 'DevOps' },
      description: { vi: 'Mô tả' },
      recommended: ['j1'],
      levels: [{ id: 'foundation', title: { vi: 'Nền tảng' }, goal: { vi: 'G' }, steps: ['d1', 'd2'] }],
    },
  ],
  steps: new Map([
    ['j1', { id: 'j1', code: 'J1', title: 'Một', optional: false, topics: [topic('j1.a')], links: [], pages: [] }],
    ['j2', { id: 'j2', code: 'J2', title: 'Hai', optional: false, topics: [topic('j2.b', { requires: ['j1.a'] })], links: [{ step: 'd1', note: 'Container' }], pages: [] }],
    ['d1', { id: 'd1', code: 'D1', title: 'Linux', optional: false, topics: [topic('d1.x'), topic('d1.y', { kind: 'opt' })], links: [], pages: ['d1-1'] }],
    ['d2', { id: 'd2', code: 'D2', title: 'Mesh', optional: true, topics: [topic('d2.z')], links: [], pages: [] }],
  ]),
  lessons: [{ id: 'd1.1', stepId: 'd1', slug: 'd1-1', path: '/learn/d1/d1-1', title: 'Tiến trình', checkIds: ['d1.1.a', 'd1.1.b'], topics: ['d1.x'] }],
  projects: [
    {
      id: 'neobank',
      title: { vi: 'Neobank mini' },
      summary: { vi: 'Tóm tắt' },
      milestones: [
        { id: 'neobank.one', title: { vi: 'Mốc một' }, needs: ['j2'] },
        { id: 'neobank.two', title: { vi: 'Mốc hai' }, needs: ['d1.x'] },
      ],
    },
  ],
};

describe('buildRoadmapView', () => {
  it('numbers steps across levels and localizes titles', () => {
    const view = buildRoadmapView({ ...input, lang: 'en' }, 'java')!;
    expect(view.title).toBe('Java EN');
    expect(view.levels.map((l) => [l.index, l.steps.map((s) => s.number)])).toEqual([
      [1, [1]],
      [2, [2]],
    ]);
    expect(view.stepCount).toBe(2);
    expect(view.topicCount).toBe(2);
  });

  it('attaches lessons, items, requires, links and project uses', () => {
    const devops = buildRoadmapView(input, 'devops')!;
    const d1 = devops.levels[0].steps[0];
    expect(d1.lessons.map((l) => l.id)).toEqual(['d1.1']);
    expect(d1.topics[0]).toMatchObject({ id: 'd1.x', items: ['d1.1.a', 'd1.1.b'], projects: [{ projectId: 'neobank', milestoneIndex: 2 }] });
    expect(devops.recommended).toEqual([{ id: 'j1', code: 'J1', title: 'Một', roadmapId: 'java' }]);

    const j2 = buildRoadmapView(input, 'java')!.levels[1].steps[0];
    expect(j2.links).toEqual([{ id: 'd1', code: 'D1', title: 'Linux', roadmapId: 'devops', note: 'Container' }]);
    expect(j2.topics[0].requires).toEqual([{ id: 'j1.a', title: 'J1.A', stepId: 'j1', roadmapId: 'java' }]);
    expect(j2.projects).toEqual([{ projectId: 'neobank', projectTitle: 'Neobank mini', milestoneTitle: 'Mốc một', milestoneIndex: 1 }]);
  });

  it('treats every topic of an optional step as optional', () => {
    expect(buildRoadmapView(input, 'devops')!.levels[0].steps[1].topics[0].kind).toBe('opt');
  });

  it('returns undefined for an unknown roadmap', () => {
    expect(buildRoadmapView(input, 'nope')).toBeUndefined();
  });
});

describe('toLite', () => {
  it('keeps only what the browser needs', () => {
    expect(toLite(buildRoadmapView(input, 'devops')!)).toEqual({
      id: 'devops',
      title: 'DevOps',
      levels: [
        {
          id: 'foundation',
          steps: [
            {
              id: 'd1',
              code: 'D1',
              topics: [
                { id: 'd1.x', title: 'D1.X', kind: 'core', items: ['d1.1.a', 'd1.1.b'] },
                { id: 'd1.y', title: 'D1.Y', kind: 'opt', items: [] },
              ],
            },
            { id: 'd2', code: 'D2', topics: [{ id: 'd2.z', title: 'D2.Z', kind: 'opt', items: [] }] },
          ],
        },
      ],
    });
  });
});

describe('buildProjectView', () => {
  it('resolves step and topic needs with their counted topics', () => {
    const view = buildProjectView(input, 'neobank')!;
    expect(view.milestones[0].needs[0]).toMatchObject({ kind: 'step', id: 'j2', code: 'J2', roadmapId: 'java', topics: [{ id: 'j2.b' }] });
    expect(view.milestones[1].needs[0]).toMatchObject({ kind: 'topic', id: 'd1.x', code: 'D1', roadmapId: 'devops', topics: [{ id: 'd1.x' }] });
  });
});

describe('buildLessonContext', () => {
  it('returns the roadmap, step and topics of a lesson', () => {
    expect(buildLessonContext(input, 'd1.1')).toEqual({
      roadmap: { id: 'devops', title: 'DevOps', track: 'devops' },
      step: { id: 'd1', code: 'D1', title: 'Linux', roadmapId: 'devops' },
      topics: [{ id: 'd1.x', title: 'D1.X', stepId: 'd1', roadmapId: 'devops' }],
    });
  });
});
```

- [ ] **Step 2: Chạy test, phải đỏ.** Lệnh: `pnpm test -- tests/unit/content-views.test.ts`. Kết quả mong đợi: FAIL (thiếu module).
- [ ] **Step 3: Viết code.** Tạo `src/lib/content/views.ts`:

```ts
import type { Level, TopicKind, Track } from './constants';
import type { Project, Roadmap, Topic } from './schema';
import type { LiteTopic, RoadmapLite } from '@/lib/progress/roadmap';

/**
 * Dựng dữ liệu cho trang từ nội dung đã kiểm tra (spec §4, §6).
 * Chỉ có type và hàm thuần: dùng được lúc build và trong test; component phía trình duyệt chỉ `import type`.
 */
export interface StepInput {
  id: string;
  code: string;
  title: string;
  optional: boolean;
  topics: Topic[];
  links: { step: string; note?: string }[];
  pages: string[];
}

export interface LessonInput {
  id: string;
  stepId: string;
  slug: string;
  path: string;
  title: string;
  checkIds: string[];
  topics: string[];
}

export interface ViewInput {
  lang: string;
  roadmaps: Roadmap[];
  steps: ReadonlyMap<string, StepInput>;
  lessons: LessonInput[];
  projects: Project[];
}

export interface LessonRef {
  id: string;
  title: string;
  path: string;
  items: string[];
}

export interface StepRef {
  id: string;
  code: string;
  title: string;
  roadmapId: string;
}

export interface TopicRef {
  id: string;
  title: string;
  stepId: string;
  roadmapId: string;
}

export interface ProjectUse {
  projectId: string;
  projectTitle: string;
  milestoneTitle: string;
  milestoneIndex: number;
}

export interface TopicView {
  id: string;
  title: string;
  kind: TopicKind;
  options: string[];
  summary?: string;
  requires: TopicRef[];
  resources: { title: string; url: string; note?: string }[];
  lessons: LessonRef[];
  items: string[];
  projects: ProjectUse[];
}

export interface StepView {
  id: string;
  code: string;
  title: string;
  optional: boolean;
  /** Số thứ tự trạm trên trục, liên tục qua các cấp. */
  number: number;
  topics: TopicView[];
  lessons: LessonRef[];
  links: (StepRef & { note?: string })[];
  projects: ProjectUse[];
}

export interface LevelView {
  id: Level;
  index: number;
  title: string;
  goal: string;
  steps: StepView[];
}

export interface RoadmapView {
  id: string;
  track: Track;
  title: string;
  description: string;
  recommended: StepRef[];
  levels: LevelView[];
  stepCount: number;
  topicCount: number;
}

export interface NeedView {
  kind: 'step' | 'topic';
  id: string;
  /** Mã chặng (của chính nó, hoặc của chặng chứa chủ đề). */
  code: string;
  title: string;
  roadmapId: string;
  /** Chủ đề dùng để tính tiến độ của yêu cầu này. */
  topics: LiteTopic[];
}

export interface ProjectView {
  id: string;
  title: string;
  summary: string;
  milestones: { id: string; index: number; title: string; needs: NeedView[] }[];
}

export interface LessonContext {
  roadmap: { id: string; title: string; track: Track };
  step: StepRef;
  topics: TopicRef[];
}

const pick = (value: Record<string, string>, lang: string) => value[lang] ?? value.vi;

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Không tìm thấy ${what} (nội dung chưa qua content:check?)`);
  return value;
}

function indexContent(input: ViewInput) {
  const roadmapOfStep = new Map<string, Roadmap>();
  for (const roadmap of input.roadmaps) {
    for (const stepId of roadmap.levels.flatMap((l) => l.steps)) roadmapOfStep.set(stepId, roadmap);
  }
  const topicStep = new Map<string, StepInput>();
  for (const step of input.steps.values()) for (const topic of step.topics) topicStep.set(topic.id, step);

  const lessonRef = (l: LessonInput): LessonRef => ({ id: l.id, title: l.title, path: l.path, items: l.checkIds });
  const lessonsByTopic = new Map<string, LessonRef[]>();
  for (const lesson of input.lessons) {
    for (const topicId of lesson.topics) lessonsByTopic.set(topicId, [...(lessonsByTopic.get(topicId) ?? []), lessonRef(lesson)]);
  }

  const uses = new Map<string, ProjectUse[]>();
  for (const project of input.projects) {
    project.milestones.forEach((milestone, i) => {
      const use: ProjectUse = {
        projectId: project.id,
        projectTitle: pick(project.title, input.lang),
        milestoneTitle: pick(milestone.title, input.lang),
        milestoneIndex: i + 1,
      };
      for (const need of milestone.needs) uses.set(need, [...(uses.get(need) ?? []), use]);
    });
  }

  const stepRef = (id: string): StepRef => {
    const step = must(input.steps.get(id), `bước ${id}`);
    return { id, code: step.code, title: step.title, roadmapId: must(roadmapOfStep.get(id), `roadmap của ${id}`).id };
  };
  const topicRef = (id: string): TopicRef => {
    const step = must(topicStep.get(id), `chủ đề ${id}`);
    const topic = must(step.topics.find((t) => t.id === id), `chủ đề ${id}`);
    return { id, title: topic.title, stepId: step.id, roadmapId: must(roadmapOfStep.get(step.id), `roadmap của ${step.id}`).id };
  };
  const kindOf = (step: StepInput, topic: Topic): TopicKind => (step.optional ? 'opt' : topic.kind);
  const liteTopic = (step: StepInput, topic: Topic): LiteTopic => ({
    id: topic.id,
    title: topic.title,
    kind: kindOf(step, topic),
    items: (lessonsByTopic.get(topic.id) ?? []).flatMap((l) => l.items),
  });

  return { roadmapOfStep, topicStep, lessonsByTopic, uses, stepRef, topicRef, kindOf, liteTopic, lessonRef };
}

export function buildRoadmapView(input: ViewInput, roadmapId: string): RoadmapView | undefined {
  const roadmap = input.roadmaps.find((r) => r.id === roadmapId);
  if (!roadmap) return undefined;
  const idx = indexContent(input);
  let number = 0;

  const levels: LevelView[] = roadmap.levels.map((level, i) => ({
    id: level.id,
    index: i + 1,
    title: pick(level.title, input.lang),
    goal: pick(level.goal, input.lang),
    steps: level.steps.map((stepId): StepView => {
      number += 1;
      const step = must(input.steps.get(stepId), `bước ${stepId}`);
      const lessons = step.pages
        .map((slug) => input.lessons.find((l) => l.stepId === stepId && l.slug === slug))
        .filter((l): l is LessonInput => Boolean(l))
        .map(idx.lessonRef);
      return {
        id: step.id,
        code: step.code,
        title: step.title,
        optional: step.optional,
        number,
        topics: step.topics.map((topic) => {
          const topicLessons = idx.lessonsByTopic.get(topic.id) ?? [];
          return {
            id: topic.id,
            title: topic.title,
            kind: idx.kindOf(step, topic),
            options: topic.options ?? [],
            summary: topic.summary,
            requires: topic.requires.map(idx.topicRef),
            resources: topic.resources,
            lessons: topicLessons,
            items: topicLessons.flatMap((l) => l.items),
            projects: idx.uses.get(topic.id) ?? [],
          };
        }),
        lessons,
        links: step.links.map((link) => ({ ...idx.stepRef(link.step), note: link.note })),
        projects: idx.uses.get(step.id) ?? [],
      };
    }),
  }));

  return {
    id: roadmap.id,
    track: roadmap.track,
    title: pick(roadmap.title, input.lang),
    description: pick(roadmap.description, input.lang),
    recommended: roadmap.recommended.map(idx.stepRef),
    levels,
    stepCount: number,
    topicCount: levels.flatMap((l) => l.steps).reduce((n, s) => n + s.topics.length, 0),
  };
}

export function toLite(view: RoadmapView): RoadmapLite {
  return {
    id: view.id,
    title: view.title,
    levels: view.levels.map((level) => ({
      id: level.id,
      steps: level.steps.map((step) => ({
        id: step.id,
        code: step.code,
        topics: step.topics.map((t) => ({ id: t.id, title: t.title, kind: t.kind, items: t.items })),
      })),
    })),
  };
}

export function buildProjectView(input: ViewInput, projectId: string): ProjectView | undefined {
  const project = input.projects.find((p) => p.id === projectId);
  if (!project) return undefined;
  const idx = indexContent(input);
  return {
    id: project.id,
    title: pick(project.title, input.lang),
    summary: pick(project.summary, input.lang),
    milestones: project.milestones.map((milestone, i) => ({
      id: milestone.id,
      index: i + 1,
      title: pick(milestone.title, input.lang),
      needs: milestone.needs.map((need): NeedView => {
        const ownerStep = idx.topicStep.get(need);
        if (ownerStep) {
          const ref = idx.topicRef(need);
          const topic = must(ownerStep.topics.find((t) => t.id === need), `chủ đề ${need}`);
          return { kind: 'topic', id: need, code: ownerStep.code, title: ref.title, roadmapId: ref.roadmapId, topics: [idx.liteTopic(ownerStep, topic)] };
        }
        const step = must(input.steps.get(need), `bước ${need}`);
        const ref = idx.stepRef(need);
        return { kind: 'step', id: need, code: ref.code, title: ref.title, roadmapId: ref.roadmapId, topics: step.topics.map((t) => idx.liteTopic(step, t)) };
      }),
    })),
  };
}

export function buildLessonContext(input: ViewInput, lessonId: string): LessonContext | undefined {
  const lesson = input.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  const idx = indexContent(input);
  const roadmap = idx.roadmapOfStep.get(lesson.stepId);
  if (!roadmap) return undefined;
  return {
    roadmap: { id: roadmap.id, title: pick(roadmap.title, input.lang), track: roadmap.track },
    step: idx.stepRef(lesson.stepId),
    topics: lesson.topics.map(idx.topicRef),
  };
}
```

Thay toàn bộ `src/lib/content/manifest.ts`:

```ts
import 'server-only';
import { loadLessonFiles, loadLessons, loadLock, loadProjects, loadRoadmaps, loadSteps } from './repo';
import {
  buildLessonContext,
  buildProjectView,
  buildRoadmapView,
  type LessonContext,
  type ProjectView,
  type RoadmapView,
  type ViewInput,
} from './views';

/** Dữ liệu cho trang, tạo lúc build từ `content/` (spec §6). Không bao giờ chạy ở trình duyệt. */
function viewInput(lang: string): ViewInput {
  return { lang, roadmaps: loadRoadmaps(), steps: loadSteps(), lessons: loadLessons(), projects: loadProjects() };
}

export function getRoadmapView(roadmapId: string, lang: string): RoadmapView | undefined {
  return buildRoadmapView(viewInput(lang), roadmapId);
}

export function listRoadmapViews(lang: string): RoadmapView[] {
  const input = viewInput(lang);
  return input.roadmaps.flatMap((r) => buildRoadmapView(input, r.id) ?? []);
}

export function getProjectView(projectId: string, lang: string): ProjectView | undefined {
  return buildProjectView(viewInput(lang), projectId);
}

export function listProjectViews(lang: string): ProjectView[] {
  const input = viewInput(lang);
  return input.projects.flatMap((p) => buildProjectView(input, p.id) ?? []);
}

export function getLessonContext(lessonId: string, lang: string): LessonContext | undefined {
  return buildLessonContext(viewInput(lang), lessonId);
}

export function getLessonItems(lessonId: string): string[] {
  return loadLessons().find((l) => l.id === lessonId)?.checkIds ?? [];
}

export function getReplacements(): Record<string, string> {
  return loadLock().replacements;
}

export function getLessonSourceHash(stepId: string, slug: string): string | undefined {
  return loadLessons().find((l) => l.stepId === stepId && l.slug === slug)?.sourceHash;
}

/** Bài đã có bản dịch sang `lang` chưa (bản gốc luôn coi là có). */
export function hasTranslation(stepId: string, slug: string, lang: string): boolean {
  return loadLessonFiles().some((f) => f.stepId === stepId && f.slug === slug && f.lang === lang);
}
```

Thứ tự roadmap ở `listRoadmapViews` theo tên file: `devops`, `java`, `microservices`. Danh mục cần thứ tự Java, DevOps, Microservices, nên thêm hằng thứ tự và sắp xếp:

```ts
const ROADMAP_ORDER = ['java', 'devops', 'microservices'];
// trong listRoadmapViews:
return input.roadmaps
  .flatMap((r) => buildRoadmapView(input, r.id) ?? [])
  .sort((a, b) => ROADMAP_ORDER.indexOf(a.id) - ROADMAP_ORDER.indexOf(b.id));
```

- [ ] **Step 4: Chạy test, phải xanh.** Lệnh: `pnpm test -- tests/unit/content-views.test.ts`. Kết quả mong đợi: PASS.
- [ ] **Step 5: Điểm kiểm tra.** Chạy `pnpm test && pnpm content:check`.

---

### Task 7: Nền giao diện (token, font, thanh tiến độ)

**Files:**
- Modify: `src/app/global.css`, `src/app/[lang]/layout.tsx`, `src/components/progress/progress-bar.tsx`, `src/components/provider.tsx`
- Create: `src/app/roadmap.css` (chép từ `design/roadmap.css`)

**Interfaces:**
- Produces: các biến CSS từ `design/tokens.css` (`--ground`, `--surface`, `--sunk`, `--ink`, `--muted`, `--rule`, `--field`, `--accent`, `--on-accent`, `--selection`, `--focus`, `--green`, `--track-*`, `--radius-*`) và font `--font-head`, `--font-body`, `--font-ui`, `--font-mono` có trong mọi trang; theme tối mặc định; toàn bộ class `rm-*`, `rc-*`, `pj-*`, `hm-*`, `ls-*`. Task 9–13 dùng chúng.

- [ ] **Step 1:** Phần đầu `src/app/global.css`, từ `@import` tới hết khối `.dark { --color-fd-muted-foreground… }`, thay bằng:

```css
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
/* Token thiết kế "Night Lab": nguồn sự thật ở design/tokens.css. */
@import '../../design/tokens.css';
@import './roadmap.css';

/* Ánh xạ token sang biến màu của Fumadocs. */
:root,
.dark {
  --color-fd-background: var(--ground);
  --color-fd-foreground: var(--ink);
  --color-fd-muted: var(--ground);
  --color-fd-muted-foreground: var(--muted);
  --color-fd-popover: var(--surface);
  --color-fd-popover-foreground: var(--ink);
  --color-fd-card: var(--surface);
  --color-fd-card-foreground: var(--ink);
  --color-fd-border: var(--rule);
  --color-fd-primary: var(--accent);
  --color-fd-primary-foreground: var(--on-accent);
  --color-fd-secondary: var(--ground);
  --color-fd-secondary-foreground: var(--ink);
  --color-fd-accent: var(--selection);
  --color-fd-accent-foreground: var(--ink);
  --color-fd-ring: var(--focus);
  --color-fd-warning: var(--amber);
  /* Font tự host bằng next/font (layout.tsx) đặt các biến --font-*-src. */
  --font-head: var(--font-bricolage-src), var(--font-bevn-src), 'Segoe UI', sans-serif;
  --font-body: var(--font-bevn-src), 'Segoe UI', Roboto, sans-serif;
  --font-ui: var(--font-bevn-src), 'Segoe UI', Roboto, sans-serif;
  --font-mono: var(--font-jbmono-src), ui-monospace, Menlo, Consolas, monospace;
  --default-font-family: var(--font-ui);
  --default-mono-font-family: var(--font-mono);
}

body {
  font-family: var(--font-ui);
}

/* Màu nhánh cho các lớp cũ của trang bài học (nhãn nơi chạy, trạng thái bài). */
@theme {
  --color-track-java: var(--track-java);
  --color-track-devops: var(--track-devops);
  --color-track-microservices: var(--track-microservices);
  --color-track-neobank: var(--green);
}
```

Xoá các khối `.roadmap-*` cũ trong cùng file (từ `/* ---------- Roadmap ---------- */` tới hết khối `@media (max-width: 640px)`). Giữ nguyên các khối `.lesson-*`.
- [ ] **Step 2:** Trong `src/app/[lang]/layout.tsx`, thay import `Inter` và hằng `inter`:

```ts
import { Be_Vietnam_Pro, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';

const bricolage = Bricolage_Grotesque({ subsets: ['latin', 'vietnamese'], weight: ['500', '700', '800'], variable: '--font-bricolage-src' });
const beVietnam = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600'], variable: '--font-bevn-src' });
const jetbrains = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600'], variable: '--font-jbmono-src' });
```

  Chỗ đang dùng `inter.className` (trên `<html>` hoặc `<body>`) thay bằng `` `${bricolage.variable} ${beVietnam.variable} ${jetbrains.variable}` ``.

  Trong `src/components/provider.tsx`, đặt theme tối làm mặc định:

```tsx
    <RootProvider i18n={i18n} search={{ SearchDialog }} theme={{ defaultTheme: 'dark' }}>
```
- [ ] **Step 3:** Trong `src/components/progress/progress-bar.tsx`, đổi `Bar`. Rãnh có viền `field` để luôn thấy được (tương phản ≥ 3:1), và thanh chạy bằng `transform` thay cho `width`:

```tsx
export function Bar({ done, total, label, className }: { done: number; total: number; label: string; className?: string }) {
  const ratio = total === 0 ? 0 : done / total;
  return (
    <div
      className={cn('relative h-2 overflow-hidden rounded-full bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--field)]', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
    >
      <div
        className="absolute inset-0 origin-left bg-[var(--accent)] transition-transform motion-reduce:transition-none"
        style={{ transform: `scaleX(${ratio})` }}
      />
    </div>
  );
}
```

- [ ] **Step 4:** Chép CSS các trang mới: `cp design/roadmap.css src/app/roadmap.css`. File đã gồm sơ đồ roadmap, thẻ roadmap, trang dự án, trang chủ, breadcrumb và chip chủ đề trong bài, cùng lớp Night Lab.
- [ ] **Step 5: Điểm kiểm tra.** Chạy `pnpm lint && pnpm test`. Build và typecheck vẫn đỏ (xem Ràng buộc chung).

---

### Task 8: Chữ giao diện (messages)

**Files:**
- Modify: `messages/vi.json`, `messages/en.json`

**Interfaces:**
- Produces: các khoá `roadmaps.*`, `roadmap.*`, `tracks.*`, `projects.*`, `home.*`, `lesson.topics`, đúng như dưới đây. Task 9–13 dùng đúng các tên này.

- [ ] **Step 1:** Trong `messages/vi.json`:
  - thay các khối `roadmaps`, `roadmap`, `tracks`;
  - thêm khối `projects` và `home` sau `tracks`;
  - thêm khoá `"topics": "Chủ đề trong bài"` vào khối `lesson`.

```json
  "roadmaps": {
    "title": "Các roadmap",
    "subtitle": "Mỗi roadmap đi từ nền tảng tới Senior, chia thành các chặng theo thứ tự. Bạn có thể học song song nhiều roadmap.",
    "open": "Mở roadmap",
    "continue": "Học tiếp"
  },
  "roadmap": {
    "kicker": "Roadmap · {track}",
    "levels": "{count} cấp",
    "steps": "{count} chặng",
    "topics": "{count} chủ đề",
    "doneCount": "Đã xong {done}/{total} chủ đề chính",
    "continueTo": "Học tiếp: {title}",
    "startAt": "Bắt đầu: {title}",
    "finished": "Bạn đã xong mọi chủ đề chính của roadmap này.",
    "recommended": "Nên học trước",
    "known": "Tôi đã biết",
    "knownNone": "Chưa gì",
    "view": "Cách xem",
    "viewMap": "Sơ đồ",
    "viewList": "Danh sách",
    "hideSkipped": "Ẩn mục đã bỏ qua",
    "howToRead": "Cách đọc sơ đồ",
    "howToReadBody": "Đi từ trên xuống. Mỗi trạm là một chặng, mỗi ô là một chủ đề. Bấm vào chủ đề để xem chi tiết và đánh dấu tiến độ. Tiến độ chỉ lưu trong trình duyệt này.",
    "levelLabel": "Cấp {n}",
    "levelKnown": "Bạn đã đánh dấu là đã biết cấp này.",
    "showLevel": "Vẫn xem",
    "here": "Bạn đang ở đây",
    "stepCount": "{done}/{total} chủ đề chính",
    "optionalStep": "Chặng tuỳ chọn",
    "kindCore": "Chủ đề chính",
    "kindPick": "Chọn một",
    "kindOpt": "Tuỳ chọn",
    "seeAlso": "Học ở {code} {title}",
    "usedIn": "Dùng ở {project}, mốc {n}",
    "state": { "todo": "chưa học", "learning": "đang học", "done": "đã xong", "skipped": "đã bỏ qua" },
    "mark": { "todo": "Chưa học", "learning": "Đang học", "done": "Đã xong", "skipped": "Bỏ qua" },
    "status": "Trạng thái",
    "lessons": "Bài học trên Masteva",
    "lessonSoon": "Bài cho chủ đề này đang được soạn.",
    "requires": "Nên học trước",
    "projects": "Dùng ở dự án",
    "resources": "Đọc thêm",
    "close": "Đóng",
    "movedTitle": "Roadmap này đã được tách thành ba",
    "movedBody": "Java, DevOps và Microservices giờ là ba roadmap riêng, mỗi roadmap đi từ nền tảng tới Senior. Tiến độ của bạn vẫn còn nguyên."
  },
  "tracks": {
    "java": "Java",
    "devops": "DevOps",
    "microservices": "Microservices"
  },
  "projects": {
    "title": "Dự án xuyên suốt",
    "milestone": "Mốc {n}",
    "needs": "Cần học",
    "progress": "{done}/{total} chủ đề chính",
    "open": "Xem dự án"
  },
  "home": {
    "learningNow": "Bạn đang học",
    "pickRoadmap": "Chọn một roadmap bên dưới để bắt đầu.",
    "roadmapsTitle": "Roadmap",
    "partsTitle": "Mỗi bài có 6 phần, theo đúng thứ tự này",
    "parts": [
      { "title": "Mục tiêu", "body": "Học xong hiểu được gì, làm được gì, giải thích được tình huống production nào." },
      { "title": "Kiến thức", "body": "Giải thích từ nền lên: cái gì, vì sao, bên dưới chạy thế nào, sai ở đâu." },
      { "title": "Tài liệu", "body": "Vài nguồn chính thức để đọc thêm, kèm ghi chú đọc phần nào. Không bắt buộc." },
      { "title": "Thực hành", "body": "Lab chạy trên máy thật, ghi rõ nơi chạy lệnh và kết quả mong đợi." },
      { "title": "Đào sâu", "body": "Câu hỏi mở có lời giải ẩn, và cách làm việc này cùng AI cho đúng." },
      { "title": "Dấu hiệu đã nắm chắc", "body": "Những việc bạn tự làm được. Tích từng mục để theo dõi tiến độ." }
    ],
    "progressNote": "Tiến độ được lưu ngay trong trình duyệt này, không cần tài khoản. Muốn học tiếp trên máy khác, xuất tiến độ ra file ở trang roadmap rồi nhập lại."
  },
```

- [ ] **Step 2:** Trong `messages/en.json`, làm tương tự với cùng cấu trúc khoá:

```json
  "roadmaps": {
    "title": "Roadmaps",
    "subtitle": "Each roadmap goes from foundations to senior, split into ordered steps. You can follow several roadmaps at once.",
    "open": "Open roadmap",
    "continue": "Continue"
  },
  "roadmap": {
    "kicker": "Roadmap · {track}",
    "levels": "{count} levels",
    "steps": "{count} steps",
    "topics": "{count} topics",
    "doneCount": "{done}/{total} core topics done",
    "continueTo": "Continue: {title}",
    "startAt": "Start: {title}",
    "finished": "You have finished every core topic of this roadmap.",
    "recommended": "Learn first",
    "known": "I already know",
    "knownNone": "Nothing yet",
    "view": "View",
    "viewMap": "Map",
    "viewList": "List",
    "hideSkipped": "Hide skipped",
    "howToRead": "How to read this map",
    "howToReadBody": "Read from top to bottom. Each station is a step, each chip is a topic. Select a topic to see details and track your progress. Progress is stored in this browser only.",
    "levelLabel": "Level {n}",
    "levelKnown": "You marked this level as already known.",
    "showLevel": "Show anyway",
    "here": "You are here",
    "stepCount": "{done}/{total} core topics",
    "optionalStep": "Optional step",
    "kindCore": "Core topic",
    "kindPick": "Pick one",
    "kindOpt": "Optional",
    "seeAlso": "Learn in {code} {title}",
    "usedIn": "Used in {project}, milestone {n}",
    "state": { "todo": "not started", "learning": "in progress", "done": "done", "skipped": "skipped" },
    "mark": { "todo": "Not started", "learning": "In progress", "done": "Done", "skipped": "Skip" },
    "status": "Status",
    "lessons": "Lessons on Masteva",
    "lessonSoon": "Lessons for this topic are being written.",
    "requires": "Learn first",
    "projects": "Used in projects",
    "resources": "Further reading",
    "close": "Close",
    "movedTitle": "This roadmap has been split into three",
    "movedBody": "Java, DevOps and Microservices are now separate roadmaps, each going from foundations to senior. Your progress is kept."
  },
  "tracks": {
    "java": "Java",
    "devops": "DevOps",
    "microservices": "Microservices"
  },
  "projects": {
    "title": "End-to-end projects",
    "milestone": "Milestone {n}",
    "needs": "Learn",
    "progress": "{done}/{total} core topics",
    "open": "View project"
  },
  "home": {
    "learningNow": "You are learning",
    "pickRoadmap": "Pick a roadmap below to start.",
    "roadmapsTitle": "Roadmaps",
    "partsTitle": "Every lesson has 6 parts, in this order",
    "parts": [
      { "title": "Goal", "body": "What you will understand and be able to do, and which production situations you can explain." },
      { "title": "Knowledge", "body": "Explained from the ground up: what, why, how it works underneath, where it goes wrong." },
      { "title": "Resources", "body": "A few official sources for further reading, with notes on what to read. Optional." },
      { "title": "Practice", "body": "Labs on your own machine, with where to run each command and the expected output." },
      { "title": "Deep dive", "body": "Open questions with hidden answers, and how to work on this with AI correctly." },
      { "title": "Mastery", "body": "Things you can do on your own. Tick each one to track your progress." }
    ],
    "progressNote": "Progress is stored in this browser, no account needed. To continue on another machine, export your progress on a roadmap page and import it there."
  },
```

  Thêm `"topics": "Topics in this lesson"` vào khối `lesson` của `en.json`.
- [ ] **Step 3: Điểm kiểm tra.** Chạy lệnh dưới để so khoá hai file:

```bash
node -e "const a=require('./messages/vi.json'),b=require('./messages/en.json');const k=(o,p='')=>Object.entries(o).flatMap(([x,v])=>typeof v==='object'&&!Array.isArray(v)?k(v,p+x+'.'):[p+x]);const d=k(a).filter(x=>!k(b).includes(x));console.log(d.length?d:'ok')"
```

  Kết quả mong đợi: `ok`. Riêng khối `ui` vốn được phép thiếu ở `en`; nếu lệnh liệt kê khoá `ui.*` thì bỏ qua.

---

### Task 9: Sơ đồ roadmap và khung chi tiết (server component, CSS)

**Files:**
- Create: `src/components/roadmap/roadmap-map.tsx`, `src/components/roadmap/topic-drawer.tsx`

**Interfaces:**
- Consumes: `RoadmapView`, `StepView`, `TopicView` (Task 6); `Messages`, `format`; các khoá messages (Task 8).
- Produces:
  - `<RoadmapMap view lang t />` và `<TopicDrawer view lang t />` (server), dùng class trong `src/app/roadmap.css`.
  - Hợp đồng DOM cho Task 10:

| Phần tử | Thuộc tính |
|---|---|
| Chip | `a.rm-chip[data-topic][data-kind][data-st]`, bên trong có `[data-st-label]` |
| Thẻ chặng | `li.rm-step[data-step][data-side]`, kèm `[data-optional]` |
| Nhãn "Bạn đang ở đây" | `p.rm-here[data-here]` |
| Cấp | `section.rm-level[data-level]` |
| Số đếm | `[data-count="step:<id>"]`, `[data-count="level:<id>"]` |
| Thanh tiến độ | `[data-bar="level:<id>"]` |
| Tiến độ bài | `[data-items]` |
| Khung chi tiết | `dialog[data-drawer]`, `section[data-panel]`, `button[data-mark]`, `button[data-close]`, `button[data-show-level]` |

- [ ] **Step 1:** Tạo `src/components/roadmap/roadmap-map.tsx`:

```tsx
import { format, type Messages } from '@/lib/messages';
import type { RoadmapView, StepView, TopicView } from '@/lib/content/views';

/**
 * Sơ đồ "trục giữa" (spec §6.1). Render lúc build thành danh sách có thứ tự lồng nhau;
 * CSS vẽ thành trục trên màn rộng và một cột trên mobile. Trạng thái do RoadmapClient gắn sau.
 */
export function RoadmapMap({ view, lang, t }: { view: RoadmapView; lang: string; t: Messages }) {
  return (
    <div className="rm-map">
      {view.levels.map((level) => (
        <section key={level.id} className="rm-level" data-level={level.id} aria-labelledby={`level-${level.id}`}>
          <header className="rm-level-head">
            <p className="rm-level-k">{format(t.roadmap.levelLabel, { n: level.index })}</p>
            <h2 id={`level-${level.id}`} className="rm-level-t">
              {level.title}
            </h2>
            <p className="rm-level-goal">{level.goal}</p>
            <div className="rm-level-progress">
              <span className="rm-bar">
                <i data-bar={`level:${level.id}`} />
              </span>
              <span data-count={`level:${level.id}`} />
            </div>
            <p className="rm-level-known">
              {t.roadmap.levelKnown}{' '}
              <button type="button" data-show-level={level.id}>
                {t.roadmap.showLevel}
              </button>
            </p>
          </header>
          <ol className="rm-rail">
            {level.steps.map((step) => (
              <StepCard key={step.id} step={step} lang={lang} t={t} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function StepCard({ step, lang, t }: { step: StepView; lang: string; t: Messages }) {
  const refs = step.links.length + step.projects.length > 0;
  return (
    <li className="rm-step" id={`step-${step.id}`} data-step={step.id} data-side={step.number % 2 === 1 ? 'l' : 'r'} data-optional={step.optional || undefined}>
      <span className="rm-station" aria-hidden="true">
        {String(step.number).padStart(2, '0')}
      </span>
      <div className="rm-card">
        <p className="rm-here" data-here={step.id} hidden>
          {t.roadmap.here}
        </p>
        <h3 className="rm-step-t">
          <span className="rm-code">{step.code}</span> {step.title}
        </h3>
        <p className="rm-step-meta">
          {step.optional ? <span className="rm-tag">{t.roadmap.optionalStep}</span> : null}
          <span data-count={`step:${step.id}`} />
        </p>
        <ul className="rm-topics">
          {step.topics.map((topic) => (
            <TopicChip key={topic.id} topic={topic} t={t} />
          ))}
        </ul>
        {refs ? (
          <ul className="rm-refs">
            {step.links.map((link) => (
              <li key={link.id}>
                <a href={`/${lang}/roadmaps/${link.roadmapId}#step-${link.id}`}>{format(t.roadmap.seeAlso, { code: link.code, title: link.title })}</a>
              </li>
            ))}
            {step.projects.map((use) => (
              <li key={`${use.projectId}-${use.milestoneIndex}`}>
                <a href={`/${lang}/projects/${use.projectId}`}>{format(t.roadmap.usedIn, { project: use.projectTitle, n: use.milestoneIndex })}</a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function TopicChip({ topic, t }: { topic: TopicView; t: Messages }) {
  const tag = topic.kind === 'pick' ? t.roadmap.kindPick : topic.kind === 'opt' ? t.roadmap.kindOpt : null;
  return (
    <li>
      <a className="rm-chip" href={`#${topic.id}`} data-topic={topic.id} data-kind={topic.kind} data-st="todo">
        <span className="rm-dot" aria-hidden="true" />
        <span className="rm-chip-t">{topic.title}</span>
        {tag ? <span className="rm-tag">{tag}</span> : null}
        <span className="sr-only" data-st-label>
          {`, ${t.roadmap.state.todo}`}
        </span>
      </a>
    </li>
  );
}
```

- [ ] **Step 2:** Tạo `src/components/roadmap/topic-drawer.tsx`:

```tsx
import { Fragment } from 'react';
import type { Messages } from '@/lib/messages';
import type { RoadmapView, StepView, TopicRef, TopicView } from '@/lib/content/views';

const MARKS = ['todo', 'learning', 'done', 'skipped'] as const;

/**
 * Khung chi tiết chủ đề (spec §6.1 mục 5). Mọi panel render sẵn và ẩn;
 * RoadmapClient mở `<dialog>` và hiện đúng panel theo hash `#<mã chủ đề>`.
 */
export function TopicDrawer({ view, lang, t }: { view: RoadmapView; lang: string; t: Messages }) {
  return (
    <dialog className="rm-drawer" data-drawer>
      <div className="rm-drawer-bar">
        <button type="button" className="rm-close" data-close>
          {t.roadmap.close}
        </button>
      </div>
      {view.levels.flatMap((level) =>
        level.steps.flatMap((step) =>
          step.topics.map((topic) => <TopicPanel key={topic.id} topic={topic} step={step} roadmapId={view.id} lang={lang} t={t} />),
        ),
      )}
    </dialog>
  );
}

function topicHref(ref: TopicRef, roadmapId: string, lang: string) {
  return ref.roadmapId === roadmapId ? `#${ref.id}` : `/${lang}/roadmaps/${ref.roadmapId}#${ref.id}`;
}

function TopicPanel({ topic, step, roadmapId, lang, t }: { topic: TopicView; step: StepView; roadmapId: string; lang: string; t: Messages }) {
  const kind = topic.kind === 'pick' ? t.roadmap.kindPick : topic.kind === 'opt' ? t.roadmap.kindOpt : t.roadmap.kindCore;
  return (
    <section className="rm-panel" data-panel={topic.id} aria-labelledby={`t-${topic.id}`} hidden>
      <p className="rm-panel-k">
        {step.code} {step.title}, {kind.toLowerCase()}
      </p>
      <h2 id={`t-${topic.id}`} className="rm-panel-t">
        {topic.title}
      </h2>
      <div className="rm-status" role="group" aria-label={t.roadmap.status}>
        {MARKS.map((mark) => (
          <button key={mark} type="button" data-mark={mark} aria-pressed="false">
            {t.roadmap.mark[mark]}
          </button>
        ))}
      </div>
      {topic.summary ? <p className="rm-panel-p">{topic.summary}</p> : null}
      <h3 className="rm-panel-h">{t.roadmap.lessons}</h3>
      {topic.lessons.length > 0 ? (
        <ul>
          {topic.lessons.map((lesson) => (
            <li key={lesson.id}>
              <a href={`/${lang}${lesson.path}`}>{lesson.title}</a> <span className="rm-muted" data-items={lesson.items.join(' ')} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rm-muted">{t.roadmap.lessonSoon}</p>
      )}
      {topic.requires.length > 0 ? (
        <>
          <h3 className="rm-panel-h">{t.roadmap.requires}</h3>
          <p className="rm-panel-l">
            {topic.requires.map((ref, i) => (
              <Fragment key={ref.id}>
                {i > 0 ? ', ' : null}
                <a href={topicHref(ref, roadmapId, lang)}>{ref.title}</a>
              </Fragment>
            ))}
          </p>
        </>
      ) : null}
      {topic.projects.length > 0 ? (
        <>
          <h3 className="rm-panel-h">{t.roadmap.projects}</h3>
          <ul>
            {topic.projects.map((use) => (
              <li key={`${use.projectId}-${use.milestoneIndex}`}>
                <a href={`/${lang}/projects/${use.projectId}`}>
                  {use.projectTitle}: {use.milestoneTitle}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {topic.resources.length > 0 ? (
        <>
          <h3 className="rm-panel-h">{t.roadmap.resources}</h3>
          <ul>
            {topic.resources.map((r) => (
              <li key={r.url}>
                <a href={r.url}>{r.title}</a>
                {r.note ? `: ${r.note}` : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 3:** CSS đã có trong `src/app/roadmap.css` (chép ở Task 7, nguồn `design/roadmap.css`). Đối chiếu tên class và thuộc tính `data-*` trong hai component trên với file đó; `design/roadmap.html` là bản mẫu chạy được của đúng cấu trúc này.
- [ ] **Step 4: Điểm kiểm tra.** Chạy `pnpm lint`. Hai component chưa được trang nào dùng; Task 10 mới ráp vào.

---

### Task 10: Glue phía trình duyệt, trang roadmap, danh mục, đường dẫn cũ

**Files:**
- Create: `src/lib/prefs.ts`, `src/components/roadmap/roadmap-dom.ts`, `src/components/roadmap/roadmap-client.tsx`, `src/components/roadmap/roadmap-cards.tsx` (thay file cũ cùng tên), `src/app/[lang]/(home)/roadmaps/senior-backend/page.tsx`
- Modify: `src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx`, `src/app/[lang]/(home)/roadmaps/page.tsx`
- Delete: `src/components/roadmap/roadmap-steps.tsx`

**Interfaces:**
- Consumes:
  - từ Task 5: `topicState`, `tallyTopics`, `nextTopic`, `roadmapTally`, `skippedLevels`, `RoadmapLite`, `TopicState`;
  - từ Task 4: `getProgressStore().setTopic/.setStart`, `useProgress`, `useReplacements`;
  - từ Task 6: `getRoadmapView`, `listRoadmapViews`, `toLite`;
  - hợp đồng DOM của Task 9.
- Produces:
  - `usePref(key, fallback): [string, (value: string) => void]`
  - `<RoadmapClient lite levels replacements />`
  - `<RoadmapCardList roadmaps lang showContinue? />`, dùng kiểu `RoadmapCardData = { id; track; title; description; stepCount; topicCount; levels: { id: Level; title: string }[]; lite: RoadmapLite }`

- [ ] **Step 1:** Tạo `src/lib/prefs.ts`:

```ts
'use client';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tuỳ chọn hiển thị của người xem (view sơ đồ/danh sách, ẩn mục bỏ qua).
 * Lưu localStorage; nếu bị chặn thì giữ trong bộ nhớ của tab.
 */
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export function usePref(key: string, fallback: string): [string, (value: string) => void] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const set = useCallback(
    (value: string) => {
      memory.set(key, value);
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Bộ nhớ trình duyệt bị chặn: giữ trong bộ nhớ tab.
      }
      listeners.forEach((l) => l());
    },
    [key],
  );
  return [raw ?? fallback, set];
}
```

- [ ] **Step 2:** Tạo `src/components/roadmap/roadmap-dom.ts`:

```ts
import { format } from '@/lib/messages';
import type { Progress, Tally } from '@/lib/progress/model';
import { skippedLevels, tallyTopics, topicState, type RoadmapLite, type TopicState } from '@/lib/progress/roadmap';

/**
 * Gắn trạng thái tiến độ lên sơ đồ đã render sẵn (hợp đồng DOM của RoadmapMap và TopicDrawer).
 * Sơ đồ do Server Component tạo, nên cập nhật bằng thuộc tính thay vì render lại phía trình duyệt.
 */
export interface DomLabels {
  state: Record<TopicState, string>;
  stepCount: string;
}

const byAttr = (root: ParentNode, attr: string, value: string) =>
  root.querySelectorAll<HTMLElement>(`[${attr}="${CSS.escape(value)}"]`);

function setTally(root: ParentNode, key: string, tally: Tally, template: string) {
  byAttr(root, 'data-count', key).forEach((el) => {
    el.textContent = format(template, { done: tally.done, total: tally.total });
  });
  byAttr(root, 'data-bar', key).forEach((el) => {
    el.style.transform = `scaleX(${tally.total === 0 ? 0 : tally.done / tally.total})`;
  });
}

export function applyProgress(root: HTMLElement, lite: RoadmapLite, progress: Progress, hereStepId: string | undefined, labels: DomLabels) {
  const skipped = skippedLevels(progress, lite);
  for (const level of lite.levels) {
    byAttr(root, 'data-level', level.id).forEach((el) => el.toggleAttribute('data-known', skipped.has(level.id)));
    setTally(root, `level:${level.id}`, tallyTopics(progress, level.steps.flatMap((s) => s.topics)), '{done}/{total}');
    for (const step of level.steps) {
      const stepTally = tallyTopics(progress, step.topics);
      setTally(root, `step:${step.id}`, stepTally, labels.stepCount);
      byAttr(root, 'data-step', step.id).forEach((el) => {
        el.toggleAttribute('data-current', step.id === hereStepId);
        el.toggleAttribute('data-done', stepTally.total > 0 && stepTally.done === stepTally.total);
      });
      byAttr(root, 'data-here', step.id).forEach((el) => {
        el.hidden = step.id !== hereStepId;
      });
      for (const topic of step.topics) {
        const state = topicState(progress, topic);
        byAttr(root, 'data-topic', topic.id).forEach((chip) => {
          chip.dataset.st = state;
          const label = chip.querySelector('[data-st-label]');
          if (label) label.textContent = `, ${labels.state[state]}`;
        });
        byAttr(root, 'data-panel', topic.id).forEach((panel) => {
          panel.querySelectorAll('[data-mark]').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-mark') === state)));
        });
      }
    }
  }
  root.querySelectorAll<HTMLElement>('[data-items]').forEach((el) => {
    const ids = (el.dataset.items ?? '').split(' ').filter(Boolean);
    el.textContent = ids.length > 0 ? `${ids.filter((id) => progress.items[id]).length}/${ids.length}` : '';
  });
}
```

- [ ] **Step 3:** Tạo `src/components/roadmap/roadmap-client.tsx`:

```tsx
'use client';
import { useEffect } from 'react';
import type { Level } from '@/lib/content/constants';
import { format } from '@/lib/messages';
import { getProgressStore } from '@/lib/progress/store';
import { useProgress, useReplacements } from '@/lib/progress/use-progress';
import { nextTopic, roadmapTally, topicState, type RoadmapLite } from '@/lib/progress/roadmap';
import type { TopicMark } from '@/lib/progress/model';
import { usePref } from '@/lib/prefs';
import { useMessages } from '@/components/messages-provider';
import { applyProgress } from './roadmap-dom';

const VIEW_KEY = 'masteva:roadmap-view';
const HIDE_KEY = 'masteva:roadmap-hide-skipped';

/**
 * Phần tương tác của trang roadmap: nút "Học tiếp", "Tôi đã biết", thanh công cụ,
 * gắn trạng thái lên sơ đồ và điều khiển khung chi tiết (spec §6.1).
 */
export function RoadmapClient({
  lite,
  levels,
  replacements,
}: {
  lite: RoadmapLite;
  levels: { id: Level; title: string }[];
  replacements: Record<string, string>;
}) {
  useReplacements(replacements);
  const { progress } = useProgress();
  const t = useMessages();
  const [view, setView] = usePref(VIEW_KEY, 'map');
  const [hideSkipped, setHideSkipped] = usePref(HIDE_KEY, 'false');
  const next = nextTopic(progress, lite);
  const total = roadmapTally(progress, lite);
  const started = lite.levels.some((l) => l.steps.some((s) => s.topics.some((tp) => topicState(progress, tp) !== 'todo')));
  const start = progress.start[lite.id];
  const rootId = `roadmap-${lite.id}`;

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.dataset.view = view;
    root.dataset.hideSkipped = hideSkipped;
  }, [rootId, view, hideSkipped]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    applyProgress(root, lite, progress, nextTopic(progress, lite)?.step.id, { state: t.roadmap.state, stepCount: t.roadmap.stepCount });
  }, [rootId, lite, progress, t]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    const dialog = root?.querySelector('dialog[data-drawer]');
    if (!root || !(dialog instanceof HTMLDialogElement)) return;
    let opener: HTMLElement | null = null;

    const open = (id: string) => {
      const panel = dialog.querySelector<HTMLElement>(`[data-panel="${CSS.escape(id)}"]`);
      if (!panel) return;
      dialog.querySelectorAll<HTMLElement>('[data-panel]').forEach((p) => {
        p.hidden = p !== panel;
      });
      dialog.setAttribute('aria-labelledby', `t-${id}`);
      opener ??= root.querySelector<HTMLElement>(`[data-topic="${CSS.escape(id)}"]`);
      opener?.scrollIntoView({ block: 'center' });
      if (!dialog.open) dialog.showModal();
    };
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && !id.startsWith('step-')) open(id);
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const chip = target.closest<HTMLElement>('a[data-topic]');
      if (chip?.dataset.topic) {
        event.preventDefault();
        opener = chip;
        window.history.replaceState(null, '', `#${chip.dataset.topic}`);
        open(chip.dataset.topic);
        return;
      }
      const markButton = target.closest<HTMLElement>('[data-mark]');
      const panelId = markButton?.closest<HTMLElement>('[data-panel]')?.dataset.panel;
      if (markButton && panelId) {
        const mark = markButton.dataset.mark;
        getProgressStore().setTopic(panelId, mark === 'todo' ? null : (mark as TopicMark));
        return;
      }
      if (target.closest('[data-close]')) {
        dialog.close();
        return;
      }
      if (target === dialog) {
        dialog.close();
        return;
      }
      const level = target.closest<HTMLElement>('[data-show-level]')?.dataset.showLevel;
      if (level) root.querySelector(`[data-level="${CSS.escape(level)}"]`)?.setAttribute('data-expanded', '');
    };
    const onClose = () => {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      opener?.focus();
      opener = null;
    };

    root.addEventListener('click', onClick);
    dialog.addEventListener('close', onClose);
    window.addEventListener('hashchange', fromHash);
    fromHash();
    return () => {
      root.removeEventListener('click', onClick);
      dialog.removeEventListener('close', onClose);
      window.removeEventListener('hashchange', fromHash);
    };
  }, [rootId]);

  const knownOptions = [
    { value: null, label: t.roadmap.knownNone },
    ...levels.slice(0, -1).map((level, i) => ({ value: levels[i + 1].id, label: level.title })),
  ];
  const ctaLabel = next ? format(started ? t.roadmap.continueTo : t.roadmap.startAt, { title: next.topic.title }) : '';

  return (
    <>
      <div className="rm-actions">
        {next ? (
          <a className="rm-cta" href={`#${next.topic.id}`} data-testid="continue">
            {ctaLabel}
          </a>
        ) : (
          <p className="rm-finished">{t.roadmap.finished}</p>
        )}
        <p className="rm-total">{format(t.roadmap.doneCount, { done: total.done, total: total.total })}</p>
        <div className="rm-known">
          <span id={`${rootId}-known`}>{t.roadmap.known}</span>
          <div className="rm-seg" role="group" aria-labelledby={`${rootId}-known`}>
            {knownOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={(start ?? null) === option.value}
                onClick={() => getProgressStore().setStart(lite.id, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="rm-toolbar">
        <div className="rm-seg" role="group" aria-label={t.roadmap.view}>
          <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
            {t.roadmap.viewMap}
          </button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            {t.roadmap.viewList}
          </button>
        </div>
        <label>
          <input type="checkbox" checked={hideSkipped === 'true'} onChange={(e) => setHideSkipped(String(e.target.checked))} />
          {t.roadmap.hideSkipped}
        </label>
        <details className="rm-legend">
          <summary>{t.roadmap.howToRead}</summary>
          <p>{t.roadmap.howToReadBody}</p>
        </details>
      </div>
      {next ? (
        <a className="rm-dock" href={`#${next.topic.id}`}>
          {ctaLabel}
        </a>
      ) : null}
    </>
  );
}
```

  Ghi chú về cách cài đặt:
  - Bấm vào nền mờ (backdrop) thì `event.target` là chính `dialog`. Vì `onClick` gắn trên `root`, mà `dialog` nằm trong `root`, nên sự kiện vẫn tới được nhánh `target === dialog`.
  - Nếu lint báo `react-hooks/exhaustive-deps` cho effect thứ hai thì giữ nguyên danh sách phụ thuộc như trên. Không tắt quy tắc.

- [ ] **Step 4:** Thay `src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage, i18n, type Language } from '@/lib/i18n';
import { format, getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { loadRoadmaps } from '@/lib/content/repo';
import { getReplacements, getRoadmapView } from '@/lib/content/manifest';
import { toLite } from '@/lib/content/views';
import { RoadmapMap } from '@/components/roadmap/roadmap-map';
import { TopicDrawer } from '@/components/roadmap/topic-drawer';
import { RoadmapClient } from '@/components/roadmap/roadmap-client';
import { ProgressTransfer } from '@/components/progress/progress-transfer';

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => loadRoadmaps().map((r) => ({ lang, roadmap: r.id })));
}

async function resolve(props: PageProps<'/[lang]/roadmaps/[roadmap]'>) {
  const { lang, roadmap } = await props.params;
  if (!isLanguage(lang)) notFound();
  const view = getRoadmapView(roadmap, lang);
  if (!view) notFound();
  return { lang: lang as Language, view };
}

export async function generateMetadata(props: PageProps<'/[lang]/roadmaps/[roadmap]'>): Promise<Metadata> {
  const { lang, view } = await resolve(props);
  return { title: view.title, description: view.description, alternates: alternatesFor(lang, `/roadmaps/${view.id}`) };
}

export default async function RoadmapPage(props: PageProps<'/[lang]/roadmaps/[roadmap]'>) {
  const { lang, view } = await resolve(props);
  const t = getMessages(lang);
  return (
    <main className="rm-page" id={`roadmap-${view.id}`} data-track={view.track} data-view="map">
      <header>
        <p className="rm-kicker">{format(t.roadmap.kicker, { track: t.tracks[view.track] })}</p>
        <h1 className="rm-title">{view.title}</h1>
        <p className="rm-desc">{view.description}</p>
        <ul className="rm-facts">
          <li>{format(t.roadmap.levels, { count: view.levels.length })}</li>
          <li>{format(t.roadmap.steps, { count: view.stepCount })}</li>
          <li>{format(t.roadmap.topics, { count: view.topicCount })}</li>
        </ul>
        {view.recommended.length > 0 ? (
          <p className="rm-recommended">
            {t.roadmap.recommended}:{' '}
            {view.recommended.map((step, i) => (
              <span key={step.id}>
                {i > 0 ? ', ' : null}
                <a href={`/${lang}/roadmaps/${step.roadmapId}#step-${step.id}`}>
                  {step.code} {step.title}
                </a>
              </span>
            ))}
          </p>
        ) : null}
        <RoadmapClient lite={toLite(view)} levels={view.levels.map((l) => ({ id: l.id, title: l.title }))} replacements={getReplacements()} />
      </header>
      <RoadmapMap view={view} lang={lang} t={t} />
      <TopicDrawer view={view} lang={lang} t={t} />
      <section className="mt-16 border-t pt-6">
        <ProgressTransfer />
      </section>
    </main>
  );
}
```

- [ ] **Step 5:** Thay `src/components/roadmap/roadmap-cards.tsx`:

```tsx
'use client';
import type { Level, Track } from '@/lib/content/constants';
import { format } from '@/lib/messages';
import { useProgress } from '@/lib/progress/use-progress';
import { currentTopic, nextTopic, roadmapTally, tallyTopics, type RoadmapLite } from '@/lib/progress/roadmap';
import { useMessages } from '@/components/messages-provider';

export interface RoadmapCardData {
  id: string;
  track: Track;
  title: string;
  description: string;
  stepCount: number;
  topicCount: number;
  levels: { id: Level; title: string }[];
  lite: RoadmapLite;
}

/** Danh sách thẻ roadmap kèm tiến độ theo cấp; trang chủ bật thêm khối "Bạn đang học". */
export function RoadmapCardList({ roadmaps, lang, showContinue = false }: { roadmaps: RoadmapCardData[]; lang: string; showContinue?: boolean }) {
  const { progress } = useProgress();
  const t = useMessages();
  const current = showContinue ? currentTopic(progress, roadmaps.map((r) => r.lite)) : undefined;

  return (
    <div className="flex flex-col gap-8">
      {showContinue ? (
        <section className="rc-continue" aria-labelledby="learning-now">
          <h2 id="learning-now" className="rc-continue-k">
            {t.home.learningNow}
          </h2>
          {current ? (
            <a className="rc-continue-link" href={`/${lang}/roadmaps/${current.roadmap.id}#${current.topic.id}`}>
              <span className="rc-continue-code">
                {current.roadmap.title}, {current.step.code}
              </span>
              <span className="rc-continue-t">{current.topic.title}</span>
            </a>
          ) : (
            <p className="rc-muted">{t.home.pickRoadmap}</p>
          )}
        </section>
      ) : null}
      <ul className="rc-list">
        {roadmaps.map((roadmap) => {
          const next = nextTopic(progress, roadmap.lite);
          const total = roadmapTally(progress, roadmap.lite);
          const started = total.done > 0 || (next !== undefined && progress.topics[next.topic.id] !== undefined);
          return (
            <li key={roadmap.id} className="rc-card" data-track={roadmap.track}>
              <p className="rm-kicker">{format(t.roadmap.kicker, { track: t.tracks[roadmap.track] })}</p>
              <h3 className="rc-title">
                <a href={`/${lang}/roadmaps/${roadmap.id}`}>{roadmap.title}</a>
              </h3>
              <p className="rc-desc">{roadmap.description}</p>
              <ul className="rc-levels">
                {roadmap.levels.map((level) => {
                  const lite = roadmap.lite.levels.find((l) => l.id === level.id);
                  const tally = tallyTopics(progress, lite?.steps.flatMap((s) => s.topics) ?? []);
                  return (
                    <li key={level.id}>
                      <span>{level.title}</span>
                      <span className="rm-bar">
                        <i style={{ transform: `scaleX(${tally.total ? tally.done / tally.total : 0})` }} />
                      </span>
                      <span className="rc-count">
                        {tally.done}/{tally.total}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="rc-facts">
                {format(t.roadmap.steps, { count: roadmap.stepCount })}, {format(t.roadmap.topics, { count: roadmap.topicCount })}
              </p>
              <a className="rm-cta" href={`/${lang}/roadmaps/${roadmap.id}${started && next ? `#${next.topic.id}` : ''}`}>
                {started ? t.roadmaps.continue : t.roadmaps.open}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

  Class `rc-*` đã có trong `src/app/roadmap.css`.

  Biến `--tc` ở `.rc-card` cũng dùng cho `.rm-bar i`, vì class này đã có sẵn trong `roadmap.css`.

- [ ] **Step 6:** Thay `src/app/[lang]/(home)/roadmaps/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { listRoadmapViews } from '@/lib/content/manifest';
import { toLite } from '@/lib/content/views';
import { RoadmapCardList, type RoadmapCardData } from '@/components/roadmap/roadmap-cards';

export async function generateMetadata(props: PageProps<'/[lang]/roadmaps'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return { title: t.roadmaps.title, description: t.roadmaps.subtitle, alternates: alternatesFor(lang, '/roadmaps') };
}

export function roadmapCards(lang: string): RoadmapCardData[] {
  return listRoadmapViews(lang).map((view) => ({
    id: view.id,
    track: view.track,
    title: view.title,
    description: view.description,
    stepCount: view.stepCount,
    topicCount: view.topicCount,
    levels: view.levels.map((l) => ({ id: l.id, title: l.title })),
    lite: toLite(view),
  }));
}

export default async function RoadmapsPage(props: PageProps<'/[lang]/roadmaps'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">{t.roadmaps.title}</h1>
        <p className="max-w-2xl text-fd-muted-foreground">{t.roadmaps.subtitle}</p>
      </header>
      <RoadmapCardList roadmaps={roadmapCards(lang)} lang={lang} />
    </main>
  );
}
```

  Next.js không cho file `page.tsx` export hàm ngoài các export đã quy định. Vì vậy chuyển `roadmapCards` sang `src/lib/content/cards.ts`: file có `import 'server-only'`, import `listRoadmapViews` và `toLite`, cùng `import type { RoadmapCardData }`. Trang import từ đó. Trang chủ ở Task 12 cũng dùng hàm này.

- [ ] **Step 7:** Tạo `src/app/[lang]/(home)/roadmaps/senior-backend/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { i18n, isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { listRoadmapViews } from '@/lib/content/manifest';

/** Đường dẫn của roadmap chung cũ: giữ lại để link cũ không hỏng (spec §6.2). */
export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export const metadata: Metadata = { robots: { index: false } };

export default async function MovedRoadmapPage(props: PageProps<'/[lang]/roadmaps/senior-backend'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-16">
      <h1 className="text-3xl font-semibold">{t.roadmap.movedTitle}</h1>
      <p className="text-fd-muted-foreground">{t.roadmap.movedBody}</p>
      <ul className="flex flex-col gap-2">
        {listRoadmapViews(lang).map((view) => (
          <li key={view.id}>
            <a className="text-[var(--accent)] underline" href={`/${lang}/roadmaps/${view.id}`}>
              {view.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 8:** Xoá `src/components/roadmap/roadmap-steps.tsx`.
  - Chạy `grep -rn "roadmap-steps\|getRoadmapManifest\|roadmap-filter\|roadmap-cta" src`: kết quả phải rỗng, trừ trang chủ (Task 12 sửa).
  - Trong `progress-transfer.tsx`, đổi `className="roadmap-filter"` của hai nút thành `className="rm-close"`, để có viền `field` thay cho class đã xoá.
- [ ] **Step 9: Điểm kiểm tra.** Tạm sửa `src/app/[lang]/(home)/page.tsx`: thay `<RoadmapCards lang={lang} />` bằng `null` và xoá import, để build qua được (Task 12 làm lại trang này). Rồi chạy `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
  - Kết quả mong đợi: build xong, có route `/vi/roadmaps/java`, `/vi/roadmaps/devops`, `/vi/roadmaps/microservices`, `/vi/roadmaps/senior-backend`.
  - Mở `out/vi/roadmaps/java.html` qua `pnpm exec serve out -l 4401` (chạy nền) bằng trình duyệt trong app. Bấm một chip, khung chi tiết phải mở. Dừng server sau khi xem.

---

### Task 11: Trang dự án

**Files:**
- Create: `src/app/[lang]/(home)/projects/[project]/page.tsx`, `src/components/project/milestone-progress.tsx`

**Interfaces:**
- Consumes: `getProjectView`, `listProjectViews` (Task 6); `tallyTopics`, `LiteTopic` (Task 5).
- Produces: route `/[lang]/projects/[project]`.

- [ ] **Step 1:** Tạo `src/components/project/milestone-progress.tsx`:

```tsx
'use client';
import { format } from '@/lib/messages';
import { useProgress } from '@/lib/progress/use-progress';
import { tallyTopics, type LiteTopic } from '@/lib/progress/roadmap';
import { useMessages } from '@/components/messages-provider';

/** "k/n chủ đề chính" của một mốc dự án, tính từ chủ đề của các chặng cần học. */
export function MilestoneProgress({ topics }: { topics: LiteTopic[] }) {
  const { progress } = useProgress();
  const t = useMessages();
  const tally = tallyTopics(progress, topics);
  return <span className="pj-count">{format(t.projects.progress, { done: tally.done, total: tally.total })}</span>;
}
```

- [ ] **Step 2:** Tạo `src/app/[lang]/(home)/projects/[project]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { i18n, isLanguage } from '@/lib/i18n';
import { format, getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { loadProjects } from '@/lib/content/repo';
import { getProjectView } from '@/lib/content/manifest';
import { MilestoneProgress } from '@/components/project/milestone-progress';

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => loadProjects().map((p) => ({ lang, project: p.id })));
}

async function resolve(props: PageProps<'/[lang]/projects/[project]'>) {
  const { lang, project } = await props.params;
  if (!isLanguage(lang)) notFound();
  const view = getProjectView(project, lang);
  if (!view) notFound();
  return { lang, view };
}

export async function generateMetadata(props: PageProps<'/[lang]/projects/[project]'>): Promise<Metadata> {
  const { lang, view } = await resolve(props);
  return { title: view.title, description: view.summary, alternates: alternatesFor(lang, `/projects/${view.id}`) };
}

export default async function ProjectPage(props: PageProps<'/[lang]/projects/[project]'>) {
  const { lang, view } = await resolve(props);
  const t = getMessages(lang);
  return (
    <main className="pj-page">
      <p className="rm-kicker">{t.projects.title}</p>
      <h1 className="rm-title">{view.title}</h1>
      <p className="rm-desc">{view.summary}</p>
      <ol className="pj-milestones">
        {view.milestones.map((m) => (
          <li key={m.id} className="pj-milestone">
            <p className="pj-k">{format(t.projects.milestone, { n: m.index })}</p>
            <h2 className="pj-t">{m.title}</h2>
            <MilestoneProgress topics={m.needs.flatMap((n) => n.topics)} />
            <p className="pj-needs-h">{t.projects.needs}</p>
            <ul className="pj-needs">
              {m.needs.map((need) => (
                <li key={need.id}>
                  <a href={`/${lang}/roadmaps/${need.roadmapId}#${need.kind === 'step' ? `step-${need.id}` : need.id}`}>
                    <span className="rm-code">{need.code}</span> {need.title}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}
```

- [ ] **Step 3:** Class `pj-*` đã có trong `src/app/roadmap.css`; đối chiếu với `design/project.html`.
- [ ] **Step 4: Điểm kiểm tra.** Chạy `pnpm typecheck && pnpm build`. Phải có route `/vi/projects/neobank` và `/vi/projects/hub-chat`.

---

### Task 12: Trang chủ

**Files:**
- Modify: `src/app/[lang]/(home)/page.tsx`

**Interfaces:**
- Consumes: `roadmapCards(lang)` (`src/lib/content/cards.ts`, Task 10); `listProjectViews` (Task 6); `RoadmapCardList` (Task 10).

- [ ] **Step 1:** Thay `src/app/[lang]/(home)/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { roadmapCards } from '@/lib/content/cards';
import { listProjectViews } from '@/lib/content/manifest';
import { RoadmapCardList } from '@/components/roadmap/roadmap-cards';

export async function generateMetadata(props: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return { alternates: alternatesFor(lang, '') };
}

export default async function HomePage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return (
    <main className="hm-page">
      <section className="hm-hero">
        <h1 className="hm-title">{t.app.tagline}</h1>
        <p className="rm-desc">{t.app.intro}</p>
      </section>
      <section aria-labelledby="roadmaps-title" className="hm-block">
        <h2 id="roadmaps-title" className="hm-h">
          {t.home.roadmapsTitle}
        </h2>
        <RoadmapCardList roadmaps={roadmapCards(lang)} lang={lang} showContinue />
      </section>
      <section aria-labelledby="projects-title" className="hm-block">
        <h2 id="projects-title" className="hm-h">
          {t.projects.title}
        </h2>
        <ul className="hm-projects">
          {listProjectViews(lang).map((project) => (
            <li key={project.id}>
              <a href={`/${lang}/projects/${project.id}`} className="hm-project">
                <span className="hm-project-t">{project.title}</span>
                <span className="hm-project-d">{project.summary}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="parts-title" className="hm-block">
        <h2 id="parts-title" className="hm-h">
          {t.home.partsTitle}
        </h2>
        <ol className="hm-parts">
          {t.home.parts.map((part, i) => (
            <li key={part.title}>
              <span className="hm-part-n">{i + 1}</span>
              <span className="hm-part-t">{part.title}</span>
              <span className="hm-part-d">{part.body}</span>
            </li>
          ))}
        </ol>
        <p className="hm-note">{t.home.progressNote}</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 2:** Class `hm-*` đã có trong `src/app/roadmap.css`; đối chiếu với `design/home.html`.
- [ ] **Step 3: Điểm kiểm tra.** Chạy `pnpm typecheck && pnpm lint && pnpm build`.

---

### Task 13: Trang bài học (breadcrumb, chip chủ đề, thanh bên)

**Files:**
- Modify: `src/app/[lang]/learn/[[...slug]]/page.tsx`, `src/app/[lang]/learn/layout.tsx`

**Interfaces:**
- Consumes: `getLessonContext`, `listRoadmapViews` (Task 6); `page.data.topics` (Fumadocs schema đã có `topics` từ Task 2).

- [ ] **Step 1:** Trong `src/app/[lang]/learn/[[...slug]]/page.tsx`:
  - Import `getLessonContext` từ `@/lib/content/manifest`.
  - Trong `LessonPage`, thêm biến sau `const sourceHash = …`:

```tsx
  const context = getLessonContext(page.data.id, lang);
```

  - Ngay trước `<DocsTitle>`, chèn breadcrumb:

```tsx
      {context ? (
        <nav className="ls-crumb" aria-label={t.nav.roadmaps}>
          <a href={`/${lang}/roadmaps/${context.roadmap.id}`}>{context.roadmap.title}</a>
          <span aria-hidden="true">/</span>
          <a href={`/${lang}/roadmaps/${context.roadmap.id}#step-${context.step.id}`}>
            {context.step.code} {context.step.title}
          </a>
        </nav>
      ) : null}
```

  - Trong khối `<div className="flex flex-col gap-3 border-b pb-6">`, ngay sau `<LessonStatusBadge … />`, chèn chip chủ đề:

```tsx
        {context && context.topics.length > 0 ? (
          <div className="ls-topics">
            <span className="ls-topics-k">{t.lesson.topics}</span>
            <ul>
              {context.topics.map((topic) => (
                <li key={topic.id}>
                  <a href={`/${lang}/roadmaps/${topic.roadmapId}#${topic.id}`}>{topic.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
```

- [ ] **Step 2:** Thay `src/app/[lang]/learn/layout.tsx`. Thanh bên nhóm theo roadmap, mỗi roadmap chỉ hiện các chặng đã có bài:

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { notFound } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { isLanguage } from '@/lib/i18n';
import { listRoadmapViews } from '@/lib/content/manifest';

/** Thanh bên theo roadmap: mỗi roadmap là một nhóm, chỉ hiện chặng đã có bài (spec §6.2). */
function sidebarTree(lang: string): PageTree.Root {
  const children: PageTree.Node[] = [];
  for (const roadmap of listRoadmapViews(lang)) {
    const folders = roadmap.levels
      .flatMap((level) => level.steps)
      .filter((step) => step.lessons.length > 0)
      .map(
        (step): PageTree.Folder => ({
          type: 'folder',
          name: `${step.code} ${step.title}`,
          defaultOpen: true,
          children: step.lessons.map((lesson): PageTree.Item => {
            const [, stepId, slug] = lesson.path.split('/').filter(Boolean);
            const page = source.getPage([stepId, slug], lang);
            return { type: 'page', name: page?.data.title ?? lesson.title, url: `/${lang}${lesson.path}` };
          }),
        }),
      );
    if (folders.length > 0) children.push({ type: 'separator', name: roadmap.title }, ...folders);
  }
  return { name: 'Masteva', children };
}

export default async function Layout(props: LayoutProps<'/[lang]/learn'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return (
    <DocsLayout tree={sidebarTree(lang)} {...baseOptions(lang)}>
      {props.children}
    </DocsLayout>
  );
}
```

  Nếu TypeScript báo kiểu `PageTree.Item` hay `PageTree.Folder` thiếu trường bắt buộc, đọc `node_modules/fumadocs-core/dist/definitions-*.d.ts` để thêm đúng trường. Không ép kiểu bằng `as`.
- [ ] **Step 3:** Class `ls-*` đã có trong `src/app/roadmap.css`.
- [ ] **Step 4: Điểm kiểm tra.** Chạy `pnpm typecheck && pnpm lint && pnpm build`. Mở `/vi/learn/d1/d1-1` bản build:
  - Thanh bên phải có nhóm "DevOps, từ Linux tới vận hành ở quy mô" và trong đó "D1 Linux".
  - Breadcrumb trỏ đúng.
  - Hai chip chủ đề trỏ tới `/vi/roadmaps/devops#d1.…`.

---

### Task 14: E2E

**Files:**
- Modify: `tests/e2e/learning.spec.ts`

**Interfaces:**
- Consumes: mọi route và hợp đồng DOM ở trên; `data-testid="continue"`, `data-testid="progress-import"`, `data-testid="lesson-progress"`.

- [ ] **Step 1:** Trong `tests/e2e/learning.spec.ts`:
  - Xoá hai test `tiến độ hiện trên trang roadmap…` và `không có lỗi truy cập nghiêm trọng`.
  - Trong test `xuất rồi nhập tiến độ`, đổi `'/vi/roadmaps/senior-backend'` thành `'/vi/roadmaps/devops'`.
  - Thêm các test sau vào cuối file:

```ts
const DEVOPS = '/vi/roadmaps/devops';
const PROCESS_TOPIC = 'd1.tien-trinh-signal-exit-code';
const chip = (page: Page, id: string) => page.locator(`[data-topic="${id}"]`);

test('tích mục trong bài làm chủ đề thành "đang học" và nút Học tiếp trỏ tới nó', async ({ page }) => {
  await page.goto(LESSON);
  await page.locator(CHECK).check();
  await page.goto(DEVOPS);
  await expect(chip(page, PROCESS_TOPIC)).toHaveAttribute('data-st', 'learning');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', `#${PROCESS_TOPIC}`);
  await expect(page.locator('[data-here="d1"]')).toBeVisible();
});

test('khung chi tiết: mở, đánh dấu, đóng bằng Esc, còn sau khi tải lại', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  const generics = chip(page, 'j5.generics');
  await generics.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/#j5\.generics$/);
  await dialog.locator('[data-panel="j5.generics"]').getByRole('button', { name: 'Đã xong' }).click();
  await expect(generics).toHaveAttribute('data-st', 'done');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(generics).toBeFocused();
  await page.reload();
  await expect(chip(page, 'j5.generics')).toHaveAttribute('data-st', 'done');
});

test('mở thẳng chủ đề bằng hash, hash lạ không làm hỏng trang', async ({ page }) => {
  await page.goto('/vi/roadmaps/java#j5.generics');
  await expect(page.getByRole('heading', { name: 'Generics', level: 2 })).toBeVisible();
  await page.goto('/vi/roadmaps/java#khong-co');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.goto('/vi/roadmaps/java#step-j5');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#step-j5')).toBeInViewport();
});

test('"Tôi đã biết" thu gọn cấp và đổi nút Học tiếp', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await page.getByRole('group', { name: 'Tôi đã biết' }).getByRole('button', { name: 'Nền tảng' }).click();
  await expect(page.locator('[data-level="foundation"]')).toHaveAttribute('data-known', '');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', '#j11.ioc-dependency-injection');
});

test('chuyển sang view danh sách và nhớ lựa chọn', async ({ page }) => {
  await page.goto('/vi/roadmaps/microservices');
  await page.getByRole('group', { name: 'Cách xem' }).getByRole('button', { name: 'Danh sách' }).click();
  await expect(page.locator('#roadmap-microservices')).toHaveAttribute('data-view', 'list');
  await page.reload();
  await expect(page.locator('#roadmap-microservices')).toHaveAttribute('data-view', 'list');
});

test('tiến độ v1 đã lưu được giữ sau khi nâng cấp', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('masteva:progress:v2')) {
      localStorage.setItem('masteva:progress:v1', JSON.stringify({ v: 1, items: { 'd1.1.exit-code': '2026-10-01T00:00:00.000Z' } }));
    }
  });
  await page.goto(LESSON);
  await expect(page.locator(CHECK)).toBeChecked();
});

test('đường dẫn cũ dẫn tới ba roadmap mới', async ({ page }) => {
  await page.goto('/vi/roadmaps/senior-backend');
  for (const id of ['java', 'devops', 'microservices']) {
    await expect(page.locator(`a[href="/vi/roadmaps/${id}"]`)).toBeVisible();
  }
});

test('trang dự án liệt kê mốc và chặng cần học', async ({ page }) => {
  await page.goto('/vi/projects/neobank');
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(5);
  await expect(page.locator('a[href="/vi/roadmaps/microservices#step-m3"]')).toBeVisible();
});

test('mobile: không cuộn ngang, có thanh Học tiếp ở đáy', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'chỉ kiểm tra trên mobile');
  await page.goto('/vi/roadmaps/devops');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('.rm-dock')).toBeVisible();
});

test('không có lỗi truy cập nghiêm trọng, sáng và tối', async ({ page }) => {
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const url of [LESSON, '/vi', '/vi/roadmaps', '/vi/roadmaps/java', '/vi/projects/neobank']) {
      await page.goto(url);
      expect(await seriousViolations(page), `${url} (${scheme})`).toEqual([]);
    }
  }
});
```

- [ ] **Step 2: Chạy E2E.**
  - Lệnh: `pnpm e2e`
  - Kết quả mong đợi: mọi test PASS trên cả hai project `desktop` và `mobile`.
  - Test nào đỏ thì sửa code, không sửa kỳ vọng. Riêng slug chủ đề có thể đã đổi tay ở Task 3 Step 3, khi đó cập nhật hằng `PROCESS_TOPIC` và `#j11.…` cho khớp.
- [ ] **Step 3: Điểm kiểm tra.** Chạy `pnpm verify`: phải xanh toàn bộ.

---

### Task 15: Tài liệu

**Files:**
- Modify: `docs/product-vision.md`, `docs/features.md`, `docs/architecture.md`, `docs/content-standard.md`, `docs/design-direction.md`, `docs/status.md`, `docs/README.md`, `README.md`

- [ ] **Step 1: `product-vision.md`.**
  - §2 "Phạm vi nội dung": thay "lộ trình Senior Java · DevOps · Microservices cùng hai dự án xuyên suốt" bằng "ba roadmap Java, DevOps và Microservices, mỗi roadmap từ nền tảng tới Senior, cùng hai dự án xuyên suốt".
  - §9: thêm dòng `| 03/10/2026 | Tách thành ba roadmap độc lập từ nền tảng tới Senior; dự án thành trang riêng ([spec](superpowers/specs/2026-10-03-tach-roadmap-design.md)) |`.
- [ ] **Step 2: `features.md`.**
  - Module ROADMAP:
    - FR-ROADMAP-005 (điểm hội tụ) đổi thành "Thẻ chặng hiện dự án và mốc dùng kiến thức của chặng".
    - Thêm FR-ROADMAP-009 "Sơ đồ trục giữa có view danh sách" và FR-ROADMAP-010 "Khung chi tiết chủ đề, mở bằng hash".
  - Module PROGRESS: thêm FR-PROGRESS-008 "Trạng thái tự đặt cho chủ đề (đang học, đã xong, bỏ qua)" và FR-PROGRESS-009 "Tôi đã biết: chọn cấp bắt đầu".
  - FR-PROJECT-006: ghi rõ mốc dự án tham chiếu bước của cả ba roadmap.
- [ ] **Step 3: `architecture.md`.**
  - §5.1: bảng thực thể thêm "Chủ đề" (`j5.generics`), "Cấp" (trong roadmap); Roadmap đổi thành `java`, `devops`, `microservices`; Dự án và Mốc dùng mã mới (`neobank.ledger`).
  - §5.2: thêm trường `topics` (bắt buộc).
  - §5.4: file khoá có `topics` và `milestones`.
  - §7: tiến độ v2, khoá `masteva:progress:v2`, chuyển từ v1.
  - Bảng route: thêm `/[lang]/projects/[project]` và trang tĩnh `senior-backend`.
- [ ] **Step 4: `content-standard.md`.** Thêm mục "Chủ đề trên sơ đồ":
  - mỗi bài khai báo `topics` trong frontmatter;
  - mã chủ đề `<bước>.<slug>` và được khoá;
  - viết `summary` 1–2 câu;
  - `resources` tối đa 3 nguồn;
  - `pick` phải có `options`.
- [ ] **Step 5: `design-direction.md`.**
  - §6: thay mô tả trang roadmap cũ bằng sơ đồ trục giữa, kèm link `design/roadmap.html`.
  - Đầu file: đổi bảng "Tài liệu trực quan" sang `design/index.html` và `design/system.html` (nếu Task 1 Step 10 chưa làm).
- [ ] **Step 6: `status.md`.**
  - Chuyển mục "Định hướng thiết kế" và "Tách roadmap" sang bảng "Đã xong".
  - Bước tiếp theo: "Áp dụng giao diện bài học theo design-direction §5 (kế hoạch riêng)", rồi Giai đoạn 1.
  - Vấn đề đã biết: bỏ dòng "tên bước chỉ có tiếng Việt" nếu đã xử lý; thêm dòng "tên chủ đề chỉ có tiếng Việt (meta.json)".
- [ ] **Step 7: `README.md` (gốc project).** Cập nhật mục cấu trúc nội dung (`content/roadmaps/*.json`, `content/projects/`, `topics` trong `meta.json`) và thêm lệnh xem thiết kế `pnpm exec serve design -l 4400`.
- [ ] **Step 8: Điểm kiểm tra.** Chạy `grep -rn "senior-backend\|điểm hội tụ" docs README.md`. Chỉ còn nhắc trong spec, trong lịch sử quyết định, và ở trang tĩnh giữ link cũ.

---

### Task 16: Kiểm chứng cuối

**Files:** không có file mới, trừ `.impeccable/critique/` do công cụ ghi.

- [ ] **Step 1:** Chạy `pnpm verify`. Kết quả mong đợi: typecheck, lint, test, content:check, build và e2e đều xanh. Ghi lại số unit test và số E2E.
- [ ] **Step 2: Đo ngân sách.**

```bash
node -e "const fs=require('fs'),z=require('zlib');for(const f of ['out/vi/roadmaps/java.html','out/vi/roadmaps/devops.html']){const h=fs.readFileSync(f);const js=[...new Set([...h.toString().matchAll(/src=\"(\/_next\/[^\"]+\.js)\"/g)].map(m=>m[1]))];console.log(f,'html',z.gzipSync(h).length,'js',js.reduce((n,p)=>n+z.gzipSync(fs.readFileSync('out'+p)).length,0))}"
```

  Kết quả mong đợi: html ≤ 153 600 byte và js ≤ 266 240 byte (260 KB).
  - Nếu HTML vượt: chuyển nội dung khung chi tiết sang `public/roadmaps/<id>.topics.json` sinh lúc build, rồi nạp khi mở khung (spec §11).
  - Nếu JS vượt: kiểm tra client component có import nhầm module build-only không.
- [ ] **Step 3:** Chạy `/impeccable critique` cho `src/app/[lang]/(home)/roadmaps/[roadmap]`. Ghi điểm vào `docs/status.md`, so với 24/40 của giai đoạn 0.
- [ ] **Step 4:** Dùng skill `superpowers:verification-before-completion` và báo người dùng:
  - các lệnh đã chạy và kết quả;
  - số đo ngân sách;
  - điểm critique;
  - những gì còn lại.

  Không commit nếu người dùng chưa yêu cầu.
