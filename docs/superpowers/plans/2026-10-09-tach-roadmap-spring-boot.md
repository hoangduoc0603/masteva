# Tách roadmap Spring Boot (đợt 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (project `CLAUDE.md` không dùng subagent-driven-development khi người dùng chưa yêu cầu). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tách sáu chặng Spring khỏi roadmap Java thành roadmap Spring Boot 14 chặng (8 chặng mới chỉ có khung), đánh số lại mã hiển thị của cả hai roadmap mà không mất tiến độ người học.

**Architecture:** Nội dung là nguồn sự thật: thêm `content/roadmaps/spring-boot.json`, sửa `java.json`, đổi `track`/`code`/`prerequisites` trong `meta.json` của chặng chuyển, thêm 8 thư mục chặng khung. Mã hiển thị trong nội dung đổi bằng một script thay một lượt. Code chỉ thêm track `spring`, tính mã bài theo mã chặng, và một kiểm tra nội dung chặn mã không tồn tại.

**Tech Stack:** Next.js 16 static export, Fumadocs, TypeScript strict, Zod (chỉ lúc build), Vitest, Playwright.

**Spec:** [docs/superpowers/specs/2026-10-09-tach-roadmap-spring-boot-design.md](../specs/2026-10-09-tach-roadmap-spring-boot-design.md)

## Global Constraints

- Không đổi mã nội bộ chặng (`j11`…`j20`), mã chủ đề, mã mục, id bài, URL bài; `content/ids.lock.json` chỉ được thêm mã chủ đề mới (`pnpm content:lock`).
- Bảng ánh xạ mã hiển thị: J11→SB1, J12→SB3, J13→SB6, J14→J11, J15→SB8, J16→SB9, J17→SB11, J18→J12, J19→J13, J20→J14. Thay một lượt, không thay tuần tự.
- Roadmap mới: id `spring-boot`, track `spring`, tiêu đề "Spring Boot, từ service đầu tiên tới hệ thống lớn".
- Màu `--track-spring`: sáng `#2e7031`, tối `#6fd27a`.
- Thứ tự roadmap: `java`, `spring-boot`, `devops`, `microservices`.
- TDD cho code trong `src/lib/content` và `src/lib/progress`; không TDD cho giao diện.
- Component trình duyệt không import Zod, `repo.ts`, `manifest.ts`.
- Không commit trong lúc làm; chỉ commit khi người dùng yêu cầu. Bước "Commit" của skill thay bằng chạy kiểm tra.
- Trước khi báo xong: `pnpm verify` xanh.

## Review Focus

- Đoạn văn nhắc **khoảng mã** sau khi thay (ví dụ "J11–J17" thành "SB1–SB11", "J14–J20") có thể sai nghĩa dù mã tồn tại: phải đọc lại từng chỗ (Task 4, bước rà khoảng mã).
- **Link trong bài trỏ cứng** tới `/roadmaps/java#…` của chặng đã chuyển sẽ mở trang Java nhưng không tìm thấy chặng: phải đổi sang `/roadmaps/spring-boot#…` (Task 4, bước rà link).
- Người học đã bấm "Tôi đã biết cấp này" ở Java: "Học tiếp" phải trỏ tới bài của chặng còn ở Java, không trỏ sang bài Spring (E2E ở Task 5).
- Tìm chủ đề Spring trên trang chủ phải ra roadmap Spring Boot, đúng tên và link (E2E ở Task 5).
- Mã bài hiển thị ("bài SB3.2") phải theo mã chặng mới, không theo đường dẫn `j12-2` (unit ở Task 2, E2E ở Task 5).

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `src/lib/content/validate.ts` (sửa) | Thêm `validateCodeRefs`: mã chặng và mã bài nhắc trong văn bản phải tồn tại |
| `src/lib/content/repo.ts` (sửa) | Gọi `validateCodeRefs` cho bài, `meta.json`, dự án trong `checkContent()` |
| `src/lib/content/views.ts` (sửa) | `LessonRef.code` tính từ mã chặng và thứ tự trang; `toLite` truyền `lessonCode` |
| `src/lib/progress/roadmap.ts` (sửa) | `LiteTopic.lessonCode` |
| `src/components/roadmap/roadmap-client.tsx` (sửa) | Dùng `lessonCode` thay hàm suy từ đường dẫn |
| `src/lib/content/constants.ts`, `manifest.ts` (sửa) | Track `spring`, thứ tự roadmap |
| `src/app/tokens.css`, `design/tokens.css`, `src/app/global.css`, `src/app/roadmap.css`, `design/roadmap.css`, `src/app/lesson.css` (sửa) | Màu track `spring` |
| `messages/vi.json`, `messages/en.json` (sửa) | `tracks.spring` |
| `content/roadmaps/spring-boot.json` (mới), `content/roadmaps/java.json` (sửa) | Cấu trúc hai roadmap |
| `content/steps/j11,j12,j13,j15,j16,j17/meta.json` (sửa) | `track`, `prerequisites` (mã đổi qua script) |
| `content/steps/j14,j18/meta.json` (sửa) | `prerequisites` |
| `content/steps/sb2,sb4,sb5,sb7,sb10,sb12,sb13,sb14/meta.json` (mới) | Khung chặng mới |
| `content/**/*.mdx`, `content/**/*.json` (sửa qua script) | Mã hiển thị mới |
| `tests/unit/content-validate.test.ts`, `tests/unit/content-views.test.ts`, `tests/e2e/learning.spec.ts` (sửa) | Kiểm thử |
| `docs/status.md`, `docs/architecture.md`, `docs/java-content-review.md` (sửa) | Tài liệu |

---

### Task 1: Kiểm tra mã chặng và mã bài trong nội dung

**Files:**
- Modify: `src/lib/content/validate.ts` (thêm cuối file)
- Modify: `src/lib/content/repo.ts` (trong `checkContent()`, sau vòng lặp bài)
- Test: `tests/unit/content-validate.test.ts`

**Interfaces:**
- Produces: `validateCodeRefs(text: string, steps: ReadonlyMap<string, number>): string[]` (map mã chặng → số bài).

- [ ] **Step 1: Viết test (đỏ)** — thêm vào cuối `tests/unit/content-validate.test.ts` (thêm `validateCodeRefs` vào import từ `@/lib/content/validate`):

```ts
describe('validateCodeRefs', () => {
  const steps = new Map([
    ['J1', 3],
    ['SB3', 2],
    ['M5', 0],
  ]);

  it('accepts known step and lesson codes', () => {
    expect(validateCodeRefs('Xem J1, bài SB3.2 và chặng M5.', steps)).toEqual([]);
  });

  it('reports an unknown step code once', () => {
    expect(validateCodeRefs('Ở J12, rồi lại J12', steps)).toEqual(['nhắc mã chặng "J12" không có trong roadmap nào']);
  });

  it('reports a lesson number beyond the lessons of the step', () => {
    expect(validateCodeRefs('bài SB3.3', steps)).toEqual(['nhắc bài "SB3.3" nhưng chặng SB3 chỉ có 2 bài']);
  });

  it('does not check lesson numbers of a step without lessons', () => {
    expect(validateCodeRefs('M5.4', steps)).toEqual([]);
  });

  it('ignores fenced and inline code', () => {
    expect(validateCodeRefs('```\nJ99\n```\n`J98` và J1', steps)).toEqual([]);
  });

  it('does not match inside longer tokens', () => {
    expect(validateCodeRefs('J2EE, JDK 25, MD5, SB30x', steps)).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy, phải đỏ**

Run: `pnpm exec vitest run tests/unit/content-validate.test.ts`
Expected: FAIL, `validateCodeRefs is not a function` (hoặc lỗi import).

- [ ] **Step 3: Viết hàm** — cuối `src/lib/content/validate.ts`:

```ts
/** Mã chặng hoặc mã bài nhắc trong văn bản: `J7`, `SB3`, `D12`, `M5`, `SB3.2`. */
const CODE_REF = /\b(J|SB|D|M)(\d{1,2})(?:\.(\d+))?\b/g;

/** Bỏ khối code (```…``` và `…`) để không bắt nhầm tên trong lệnh. */
function stripCode(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

/**
 * Văn bản chỉ được nhắc mã chặng có thật, và mã bài không vượt số bài của chặng
 * (spec 2026-10-09 §5). `steps`: mã chặng → số bài; chặng chưa có bài thì không kiểm số bài.
 */
export function validateCodeRefs(text: string, steps: ReadonlyMap<string, number>): string[] {
  const errors = new Set<string>();
  for (const [, prefix, num, lesson] of stripCode(text).matchAll(CODE_REF)) {
    const code = `${prefix}${num}`;
    const count = steps.get(code);
    if (count === undefined) errors.add(`nhắc mã chặng "${code}" không có trong roadmap nào`);
    else if (lesson !== undefined && count > 0 && Number(lesson) > count) {
      errors.add(`nhắc bài "${code}.${lesson}" nhưng chặng ${code} chỉ có ${count} bài`);
    }
  }
  return [...errors];
}
```

- [ ] **Step 4: Chạy, phải xanh**

Run: `pnpm exec vitest run tests/unit/content-validate.test.ts`
Expected: PASS.

- [ ] **Step 5: Gọi trong `checkContent()`** — trong `src/lib/content/repo.ts`, thêm `validateCodeRefs` vào import từ `./validate`; ngay sau vòng `for (const lesson of parsed) { … }`, thêm:

```ts
  // Mã chặng và mã bài nhắc trong văn bản phải tồn tại (spec 2026-10-09 §5).
  const codeCounts = new Map([...steps.values()].map((s) => [s.code, s.pages.length]));
  for (const lesson of parsed.filter((p) => p.file.lang === DEFAULT_LANG)) {
    const where = path.relative(process.cwd(), lesson.file.file);
    validateCodeRefs(lesson.file.raw, codeCounts).forEach((e) => errors.push(`${where}: ${e}`));
  }
  const jsonFiles = [
    ...[...steps.keys()].map((id) => path.join(STEPS_DIR, id, 'meta.json')),
    ...(fs.existsSync(PROJECTS_DIR) ? fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.json')).map((f) => path.join(PROJECTS_DIR, f)) : []),
  ];
  for (const file of jsonFiles) {
    const where = path.relative(process.cwd(), file);
    validateCodeRefs(fs.readFileSync(file, 'utf8'), codeCounts).forEach((e) => errors.push(`${where}: ${e}`));
  }
```

- [ ] **Step 6: Chạy kiểm tra nội dung hiện tại**

Run: `pnpm content:check`
Expected: `✓ Nội dung hợp lệ`. Nếu có lỗi, đó là nội dung đang nhắc mã sai (ví dụ số bài vượt quá): sửa văn bản cho đúng, ghi lại trong báo cáo cuối.

- [ ] **Step 7: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: không lỗi.

---

### Task 2: Mã bài tính theo mã chặng

**Files:**
- Modify: `src/lib/content/views.ts` (`LessonRef`, `indexContent`, `toLite`)
- Modify: `src/lib/progress/roadmap.ts` (`LiteTopic`)
- Modify: `src/components/roadmap/roadmap-client.tsx` (hàm `lessonCode` dòng 17–19 và chỗ dùng ở dòng 286)
- Test: `tests/unit/content-views.test.ts`

**Interfaces:**
- Produces: `LessonRef.code: string` (ví dụ `SB3.2`); `LiteTopic.lessonCode?: string`.

- [ ] **Step 1: Viết test (đỏ)** — thêm vào `describe('toLite', …)` trong `tests/unit/content-views.test.ts`:

```ts
  it('codes lessons by the step code and page order, not by the lesson path', () => {
    const renamed: ViewInput = {
      ...input,
      steps: new Map([...input.steps, ['d1', { ...input.steps.get('d1')!, code: 'SB3' }]]),
    };
    const devops = buildRoadmapView(renamed, 'devops')!;
    expect(devops.levels[0].steps[0].lessons[0].code).toBe('SB3.1');
    expect(toLite(devops).levels[0].steps[0].topics[0]).toMatchObject({ lesson: '/learn/d1/d1-1', lessonCode: 'SB3.1' });
  });
```

- [ ] **Step 2: Chạy, phải đỏ**

Run: `pnpm exec vitest run tests/unit/content-views.test.ts`
Expected: FAIL (`code` là `undefined`).

- [ ] **Step 3: Cài đặt**

`src/lib/content/views.ts`:

```ts
export interface LessonRef {
  id: string;
  title: string;
  path: string;
  items: string[];
  /** Mã bài theo mã chặng và thứ tự trong `pages`, ví dụ `SB3.2`. */
  code: string;
}
```

Trong `indexContent`, chuyển `pageOrder` lên trước `lessonRef` và tính `code`:

```ts
  // Theo thứ tự `pages` của chặng, không theo tên file (`d1-10` đứng sau `d1-2`).
  const pageOrder = (l: LessonInput) => input.steps.get(l.stepId)?.pages.indexOf(l.slug) ?? -1;
  const lessonRef = (l: LessonInput): LessonRef => ({
    id: l.id,
    title: l.title,
    path: l.path,
    items: l.checkIds,
    code: `${input.steps.get(l.stepId)?.code ?? l.stepId.toUpperCase()}.${pageOrder(l) + 1}`,
  });
```

Trong `toLite`, thay dòng `...(t.lessons[0] ? { lesson: t.lessons[0].path } : {}),` bằng:

```ts
          ...(t.lessons[0] ? { lesson: t.lessons[0].path, lessonCode: t.lessons[0].code } : {}),
```

`src/lib/progress/roadmap.ts`, trong `LiteTopic` sau `lesson?: string;`:

```ts
  /** Mã bài đầu tiên theo mã chặng (`SB3.2`), đi cùng `lesson`. */
  lessonCode?: string;
```

`src/components/roadmap/roadmap-client.tsx`: xoá hàm `lessonCode(path)` (dòng 17–19); thay biểu thức ở dòng 286 bằng:

```tsx
                {next.topic.lessonCode ? ` · ${format(t.roadmap.lessonRef, { code: next.topic.lessonCode })}` : null}
```

- [ ] **Step 4: Chạy, phải xanh; sửa test cũ so sánh `toEqual`**

Run: `pnpm exec vitest run tests/unit/content-views.test.ts`
Expected: test mới PASS. Test cũ dùng `toEqual` với `LessonRef` hoặc topic lite (ví dụ "keeps only what the browser needs") sẽ đỏ vì thêm trường: thêm `code: 'D1.1'` / `lessonCode: 'D1.1'` vào giá trị mong đợi cho khớp, không đổi gì khác.

- [ ] **Step 5: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: không lỗi. `typecheck` báo chỗ nào khác tự dựng `LessonRef` thì thêm `code` theo cùng công thức.

---

### Task 3: Track `spring`

**Files:**
- Modify: `src/lib/content/constants.ts:5`, `src/lib/content/manifest.ts:22`
- Modify: `src/app/tokens.css`, `design/tokens.css`, `src/app/global.css`, `src/app/roadmap.css`, `design/roadmap.css`, `src/app/lesson.css`
- Modify: `messages/vi.json`, `messages/en.json`

**Interfaces:**
- Produces: giá trị track `'spring'` hợp lệ trong schema; biến CSS `--track-spring`.

- [ ] **Step 1: Hằng số**

`src/lib/content/constants.ts`:

```ts
export const TRACKS = ['java', 'spring', 'devops', 'microservices'] as const;
```

`src/lib/content/manifest.ts`:

```ts
const ROADMAP_ORDER = ['java', 'spring-boot', 'devops', 'microservices'];
```

- [ ] **Step 2: Màu**

`src/app/tokens.css` và `design/tokens.css` (hai file phải giống nhau ở các dòng này): sau `--track-java: #be2f45;` trong `:root` thêm `  --track-spring: #2e7031;`; sau `--track-java: #ff7a59;` trong khối theme tối thêm `  --track-spring: #6fd27a;`.

`src/app/global.css`, sau `--color-track-java: var(--track-java);`:

```css
  --color-track-spring: var(--track-spring);
```

`src/app/roadmap.css` và `design/roadmap.css`, sau dòng `.rm-page[data-track='devops'] …` và sau dòng `:is(.hm-card, .hm-now, .hm-topic)[data-track='devops'] …`:

```css
.rm-page[data-track='spring'] { --tc: var(--track-spring); }
```

```css
:is(.hm-card, .hm-now, .hm-topic)[data-track='spring'] { --tc: var(--track-spring); }
```

`src/app/lesson.css`, sau quy tắc `.ms-tab-icon[data-track='devops']` và sau `.ms-step-code[data-track='devops']`:

```css
.ms-tab-icon[data-track='spring'] {
  background: var(--track-spring);
}
```

```css
.ms-step-code[data-track='spring'] {
  background: color-mix(in oklab, var(--track-spring) 16%, transparent);
  color: var(--track-spring);
}
```

- [ ] **Step 3: Chữ giao diện** — trong `tracks` của `messages/vi.json` và `messages/en.json`, thêm `"spring": "Spring Boot"` sau `"java"`.

- [ ] **Step 4: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test && diff src/app/roadmap.css design/roadmap.css`
Expected: không lỗi; `diff` không in gì.

---

### Task 4: Tái cấu trúc nội dung

**Files:**
- Create: `content/roadmaps/spring-boot.json`; `content/steps/{sb2,sb4,sb5,sb7,sb10,sb12,sb13,sb14}/meta.json`
- Modify: `content/roadmaps/java.json`; `meta.json` của `j11`–`j20`; mọi file `content/**/*.mdx`, `content/**/*.json` có mã hiển thị (qua script)

**Interfaces:**
- Consumes: track `spring` (Task 3), `validateCodeRefs` trong `content:check` (Task 1).

- [ ] **Step 1: Đổi mã hiển thị bằng một lượt thay** — lưu script vào thư mục scratchpad của session (không commit), chạy từ gốc repo:

```python
# remap_codes.py — chạy một lần: python3 remap_codes.py
import pathlib, re

MAP = {'J11': 'SB1', 'J12': 'SB3', 'J13': 'SB6', 'J14': 'J11', 'J15': 'SB8',
       'J16': 'SB9', 'J17': 'SB11', 'J18': 'J12', 'J19': 'J13', 'J20': 'J14'}
PATTERN = re.compile(r'\bJ(?:1[1-9]|20)\b')

files = changes = 0
for path in pathlib.Path('content').rglob('*'):
    if path.suffix not in ('.mdx', '.json') or path.name == 'ids.lock.json':
        continue
    text = path.read_text(encoding='utf-8')
    count = len(PATTERN.findall(text))
    if count:
        path.write_text(PATTERN.sub(lambda m: MAP[m.group(0)], text), encoding='utf-8')
        files += 1
        changes += count
print(f'{files} file, {changes} chỗ')
```

Expected: in ra khoảng 70 file, khoảng 900 chỗ. Kiểm: `grep -rnE '\bJ(1[5-9]|20)\b' content` không in gì; `grep -n '"code"' content/steps/j1[1-9]/meta.json content/steps/j20/meta.json` cho J11 (j14), J12 (j18), J13 (j19), J14 (j20), SB1, SB3, SB6, SB8, SB9, SB11.

- [ ] **Step 2: Rà khoảng mã** — tìm các chỗ nhắc khoảng mã và đọc từng chỗ:

Run: `grep -rnE '\b(J|SB)[0-9]{1,2}\s*[–-]\s*(J|SB)[0-9]{1,2}\b' content`
Expected: mỗi kết quả vẫn đúng nghĩa với cấu trúc mới (ví dụ "J1–J14" cho toàn roadmap Java). Chỗ sai nghĩa (ví dụ "SB1–J12" do khoảng cũ bắc qua hai roadmap) sửa tay thành cách nói đúng.

- [ ] **Step 3: Rà link cứng tới trang Java**

Run: `grep -rnE '/roadmaps/java#(step-)?j1[1-35-7]' content`
Expected: mọi link tới chặng hoặc chủ đề của `j11`, `j12`, `j13`, `j15`, `j16`, `j17` đổi `/roadmaps/java#` thành `/roadmaps/spring-boot#`. Chạy lại lệnh, không còn kết quả.

- [ ] **Step 4: Sửa `meta.json` của chặng chuyển và chặng Java**

Trong `content/steps/<id>/meta.json` đặt đúng các giá trị sau (mã đã đổi ở bước 1):

| id | `track` | `prerequisites` |
|---|---|---|
| j11 | `spring` | `["j10"]` |
| j12 | `spring` | `["sb2"]` |
| j13 | `spring` | `["sb5"]` |
| j15 | `spring` | `["sb7"]` |
| j16 | `spring` | `["j15"]` |
| j17 | `spring` | `["sb10"]` |
| j14 | `java` | `["j10"]` |
| j18 | `java` | `["j14"]` |
| j19 | `java` | `["j18"]` (không đổi) |
| j20 | `java` | `["j19"]` (không đổi) |

- [ ] **Step 5: Tạo khung 8 chặng mới** — mỗi thư mục một `meta.json` cùng định dạng chặng DevOps chưa có bài (`title`, `id`, `code`, `short`, `track`, `prerequisites`, `topics`, `links: []`, `pages: []`). Chủ đề không ghi `kind` là core; ghi `"kind": "opt"` cho chủ đề tuỳ chọn.

`content/steps/sb2/meta.json`:

```json
{
  "title": "Kiểm thử với Spring",
  "id": "sb2",
  "code": "SB2",
  "short": "Kiểm thử Spring",
  "track": "spring",
  "prerequisites": ["j11"],
  "topics": [
    { "id": "sb2.test-slice", "title": "Test slice: @WebMvcTest, @DataJpaTest" },
    { "id": "sb2.springboottest-context", "title": "@SpringBootTest và cache context" },
    { "id": "sb2.service-connection", "title": "Testcontainers với @ServiceConnection" },
    { "id": "sb2.docker-compose", "title": "Docker Compose khi phát triển" },
    { "id": "sb2.mockmvc-resttestclient", "title": "MockMvc và RestTestClient" },
    { "id": "sb2.chien-luoc-test", "title": "Chiến lược test cho service Spring" }
  ],
  "links": [],
  "pages": []
}
```

`content/steps/sb4/meta.json`:

```json
{
  "title": "Transaction",
  "id": "sb4",
  "code": "SB4",
  "short": "Transaction",
  "track": "spring",
  "prerequisites": ["j12"],
  "topics": [
    { "id": "sb4.transactional-proxy", "title": "@Transactional và proxy" },
    { "id": "sb4.propagation", "title": "Propagation" },
    { "id": "sb4.readonly-isolation", "title": "readOnly và isolation" },
    { "id": "sb4.rollback", "title": "Quy tắc rollback" },
    { "id": "sb4.tu-goi", "title": "Tự gọi và cách tránh" },
    { "id": "sb4.su-kien-sau-commit", "title": "Sự kiện sau commit với @TransactionalEventListener" },
    { "id": "sb4.transaction-dai", "title": "Transaction dài và khoá" }
  ],
  "links": [],
  "pages": []
}
```

`content/steps/sb5/meta.json`:

```json
{
  "title": "Spring Data JPA chuyên sâu",
  "id": "sb5",
  "code": "SB5",
  "short": "JPA chuyên sâu",
  "track": "spring",
  "prerequisites": ["sb4"],
  "topics": [
    { "id": "sb5.quan-he-cascade", "title": "Quan hệ entity và cascade" },
    { "id": "sb5.persistence-context", "title": "Persistence context, dirty checking, flush" },
    { "id": "sb5.fetch-plan", "title": "Fetch plan và @EntityGraph" },
    { "id": "sb5.projection-dto", "title": "Projection và DTO" },
    { "id": "sb5.specification", "title": "Specification và truy vấn động" },
    { "id": "sb5.auditing-soft-delete", "title": "Auditing và soft delete" },
    { "id": "sb5.batch", "title": "Batch insert và update" },
    { "id": "sb5.keyset", "title": "Phân trang keyset" },
    { "id": "sb5.migration-khong-downtime", "title": "Migration không downtime" },
    { "id": "sb5.spring-data-jdbc", "title": "Spring Data JDBC", "kind": "opt" }
  ],
  "links": [],
  "pages": []
}
```

`content/steps/sb7/meta.json`:

```json
{
  "title": "Gọi service khác",
  "id": "sb7",
  "code": "SB7",
  "short": "Gọi service khác",
  "track": "spring",
  "prerequisites": ["j13"],
  "topics": [
    { "id": "sb7.restclient", "title": "RestClient" },
    { "id": "sb7.http-service-client", "title": "HTTP Service Client với @HttpExchange" },
    { "id": "sb7.timeout-loi", "title": "Timeout và lỗi từ service khác" },
    { "id": "sb7.retryable", "title": "@Retryable và @ConcurrencyLimit" },
    { "id": "sb7.circuit-breaker", "title": "Circuit breaker với Resilience4j" },
    { "id": "sb7.grpc", "title": "gRPC với Spring gRPC", "kind": "opt" },
    { "id": "sb7.ssrf", "title": "Chống SSRF" }
  ],
  "links": [{ "step": "m9" }],
  "pages": []
}
```

`content/steps/sb10/meta.json`:

```json
{
  "title": "Tính năng nghiệp vụ hay gặp",
  "id": "sb10",
  "code": "SB10",
  "short": "Tính năng nghiệp vụ",
  "track": "spring",
  "prerequisites": ["j16"],
  "topics": [
    { "id": "sb10.luu-file", "title": "Upload và lưu file (S3, MinIO)" },
    { "id": "sb10.email-thong-bao", "title": "Email và thông báo" },
    { "id": "sb10.xuat-bao-cao", "title": "Xuất Excel và PDF" },
    { "id": "sb10.i18n", "title": "Đa ngôn ngữ với MessageSource" },
    { "id": "sb10.full-text", "title": "Tìm kiếm full-text" },
    { "id": "sb10.da-tenant", "title": "Đa tenant" },
    { "id": "sb10.lich-su-thay-doi", "title": "Lịch sử thay đổi" }
  ],
  "links": [],
  "pages": []
}
```

`content/steps/sb12/meta.json`:

```json
{
  "title": "Hiệu năng ứng dụng Spring",
  "id": "sb12",
  "code": "SB12",
  "short": "Hiệu năng Spring",
  "track": "spring",
  "prerequisites": ["j17"],
  "topics": [
    { "id": "sb12.thread-pool", "title": "Thread pool Tomcat và virtual thread" },
    { "id": "sb12.khoi-dong-nhanh", "title": "Khởi động nhanh: CDS, AOT cache, khởi động JPA bất đồng bộ" },
    { "id": "sb12.pool-timeout", "title": "Pool kết nối và timeout" },
    { "id": "sb12.do-tai", "title": "Đo tải với k6 hoặc Gatling" },
    { "id": "sb12.diem-nghen", "title": "Tìm điểm nghẽn bằng metric và profiler" }
  ],
  "links": [{ "step": "j18" }],
  "pages": []
}
```

`content/steps/sb13/meta.json`:

```json
{
  "title": "Bảo mật nâng cao",
  "id": "sb13",
  "code": "SB13",
  "short": "Bảo mật nâng cao",
  "track": "spring",
  "prerequisites": ["sb12"],
  "topics": [
    { "id": "sb13.phan-quyen-du-lieu", "title": "Phân quyền theo dữ liệu với method security" },
    { "id": "sb13.co-lap-tenant", "title": "Cô lập dữ liệu giữa các tenant" },
    { "id": "sb13.authorization-server", "title": "Keycloak hoặc Spring Authorization Server" },
    { "id": "sb13.bff", "title": "BFF cho SPA" },
    { "id": "sb13.audit-trail", "title": "Audit trail" },
    { "id": "sb13.rate-limit", "title": "Rate limiting" }
  ],
  "links": [{ "step": "m10" }],
  "pages": []
}
```

`content/steps/sb14/meta.json`:

```json
{
  "title": "Starter, thư viện nội bộ và nâng cấp",
  "id": "sb14",
  "code": "SB14",
  "short": "Starter và nâng cấp",
  "track": "spring",
  "prerequisites": ["sb13"],
  "topics": [
    { "id": "sb14.starter", "title": "Auto-configuration và starter tự viết" },
    { "id": "sb14.conditional", "title": "@Conditional và thứ tự cấu hình" },
    { "id": "sb14.bom-noi-bo", "title": "BOM nội bộ" },
    { "id": "sb14.nang-cap", "title": "Nâng cấp Spring Boot giữa bản lớn với OpenRewrite" },
    { "id": "sb14.deprecation", "title": "Deprecation và tương thích ngược" }
  ],
  "links": [{ "step": "j20" }],
  "pages": []
}
```

Schema của `links`: mảng `{ step, note? }` (`src/lib/content/schema.ts:97`), nên dạng `{ "step": "m9" }` hợp lệ.

- [ ] **Step 6: Hai roadmap**

`content/roadmaps/spring-boot.json`:

```json
{
  "id": "spring-boot",
  "area": "backend",
  "track": "spring",
  "title": { "vi": "Spring Boot, từ service đầu tiên tới hệ thống lớn" },
  "description": {
    "vi": "Dựng, kiểm thử và vận hành service Spring Boot trên production, rồi đi sâu vào dữ liệu, tích hợp và hiệu năng cho hệ thống lớn."
  },
  "recommended": ["j10"],
  "levels": [
    {
      "id": "foundation",
      "title": { "vi": "Nền tảng" },
      "goal": { "vi": "Dựng và kiểm thử một service Spring Boot." },
      "steps": ["j11", "sb2", "j12"]
    },
    {
      "id": "middle",
      "title": { "vi": "Middle" },
      "goal": { "vi": "Vận hành service trên production." },
      "steps": ["sb4", "sb5", "j13", "sb7", "j15", "j16", "sb10", "j17"]
    },
    {
      "id": "senior",
      "title": { "vi": "Senior" },
      "goal": { "vi": "Hiệu năng, bảo mật nâng cao và nền tảng nội bộ." },
      "steps": ["sb12", "sb13", "sb14"]
    }
  ]
}
```

`content/roadmaps/java.json`: đổi `description.vi` thành "Viết Java đúng, hiểu JVM và concurrency, rồi tới thiết kế và quyết định kiến trúc."; cấp `middle`: `goal.vi` "Viết code đồng thời đúng và đọc được JVM khi có sự cố.", `steps` `["j14", "j18"]`; cấp `senior`: `steps` `["j19", "j20"]` (giữ `goal`). Cấp `foundation` không đổi.

- [ ] **Step 7: Khoá mã chủ đề mới và kiểm tra**

Run: `pnpm content:lock`
Expected: `✓ Nội dung hợp lệ`, thêm 53 chủ đề vào `ids.lock.json`, 0 mục. Nếu báo lỗi mã chặng hoặc mã bài (Task 1), sửa văn bản theo đúng bảng ánh xạ. `git diff content/ids.lock.json` chỉ có dòng thêm.

- [ ] **Step 8: Kiểm tra**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: không lỗi; `out/vi/roadmaps/spring-boot.html` tồn tại.

---

### Task 5: Kiểm thử E2E

**Files:**
- Modify: `tests/e2e/learning.spec.ts`

- [ ] **Step 1: Sửa test cũ**

- `trang chủ không có link Roadmap trên nav`: `toHaveCount(3)` thành `toHaveCount(4)`.
- `trang chủ: tìm kafka ra chủ đề J16…`: đổi tên test thành `trang chủ: tìm kafka ra chủ đề SB9 và mở đúng khung chi tiết`; tên link `/Kafka hoặc RabbitMQ.*Spring Boot · Cache/`; `href` và `toHaveURL` dùng `/vi/roadmaps/spring-boot#j16.kafka-rabbitmq`.
- `"Tôi đã biết cấp này" thu gọn cấp…`: hai chỗ `toHaveAttribute('href', '/vi/learn/j11/j11-1')` thành `'/vi/learn/j14/j14-1'`.
- `"Tôi đã biết" ở Middle…`: regex `/^\/vi\/learn\/j18\//` thành `/^\/vi\/learn\/j19\//`; dòng cuối `'/vi/learn/j11/j11-1'` thành `'/vi/learn/j14/j14-1'`.
- `thanh cấp dính khi cuộn…`: `#step-j12` thành `#step-j18`.

- [ ] **Step 2: Thêm test mới** — cuối `tests/e2e/learning.spec.ts`:

```ts
test('roadmap Spring Boot có 14 chặng, SB1 có bài; Java còn 14 chặng', async ({ page }) => {
  await page.goto('/vi/roadmaps/spring-boot');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Spring Boot');
  await expect(page.locator('.rm-step')).toHaveCount(14);
  await expect(page.locator('#step-j11')).toContainText('SB1');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', '/vi/learn/j11/j11-1');
  await expect(page.locator('.rm-next')).toContainText('bài SB1.1');
  await page.goto('/vi/roadmaps/java');
  await expect(page.locator('.rm-step')).toHaveCount(14);
  await expect(page.locator('#step-j14')).toContainText('J11');
});

test('bài của chặng chuyển sang có thanh bên Spring Boot', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Thanh bên desktop');
  await page.goto('/vi/learn/j12/j12-1');
  const sidebar = page.locator('#nd-sidebar');
  await expect(sidebar.locator('.ms-step-code').first()).toHaveText('SB1');
  await expect(sidebar.locator('.ms-step-code', { hasText: /^J/ })).toHaveCount(0);
});
```

`t.roadmap.lessonRef` là `"bài {code}"`, nên dòng meta của khối Học tiếp chứa đúng "bài SB1.1".

- [ ] **Step 3: Chạy E2E**

Run: `pnpm e2e`
Expected: mọi test xanh (test thanh bên bỏ qua ở mobile).

---

### Task 6: Tài liệu và kiểm tra toàn bộ

**Files:**
- Modify: `docs/status.md`, `docs/architecture.md`, `docs/java-content-review.md`, `README.md` (nếu nhắc số roadmap)

- [ ] **Step 1: Tài liệu**

- `docs/status.md`: thêm mốc "Tách roadmap Spring Boot (đợt 1)" vào bảng "Đã xong" (số chặng 14 + 14, 8 chặng khung, 53 chủ đề mới, kiểm tra mã mới); ghi bảng ánh xạ mã ở mục 4 của spec; ở "Vấn đề đã biết" ghi: người đã đặt "đã biết cấp Middle" ở Java giờ hiểu là Concurrency và JVM. Bước tiếp theo: đợt 2 (bài SB4 Transaction, SB5 JPA chuyên sâu, SB2 Kiểm thử, SB7 Gọi service khác).
- `docs/architecture.md` mục 5.1: định danh roadmap thêm `spring-boot`; mã hiển thị khai báo trong `meta.json` và được `content:check` kiểm (spec 2026-10-09 §5).
- `docs/java-content-review.md`: trạng thái "đợt 1 đã làm (09/10/2026)".
- `README.md`: chạy `grep -n "roadmap" README.md`; chỗ nào nói "3 roadmap" đổi thành 4 và thêm Spring Boot.

- [ ] **Step 2: Kiểm tra toàn bộ**

Run: `pnpm verify`
Expected: xanh.

- [ ] **Step 3: Xem bằng mắt** — dev server (`preview_start` cấu hình `dev`): trang chủ (4 thẻ, thẻ Spring Boot màu xanh lá), `/vi/roadmaps/spring-boot` (3 cấp, 14 chặng, 8 chặng mới hiện trạng thái chưa có bài), `/vi/roadmaps/java` (14 chặng, J11 Concurrency), `/vi/learn/j12/j12-1` (ô chọn roadmap "Spring Boot", chip SB1…SB14), ở cả theme sáng và tối.
