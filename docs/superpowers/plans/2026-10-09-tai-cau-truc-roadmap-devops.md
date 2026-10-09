# Tái cấu trúc roadmap DevOps và tách roadmap Kubernetes (đợt 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (project `CLAUDE.md` không dùng subagent-driven-development khi người dùng chưa yêu cầu). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng lại khung roadmap DevOps thành 25 chặng (D0–D24) và tách roadmap Kubernetes mới 11 chặng (K1–K11), không mất tiến độ người học kể cả khi đã đăng nhập.

**Architecture:** Nội dung là nguồn sự thật: một script Python dựng và sửa toàn bộ `meta.json` từ bảng dữ liệu trong plan, thêm `content/roadmaps/kubernetes.json`, sửa `devops.json`, ghi 18 cặp `replacements` vào `ids.lock.json`. Mã hiển thị trong văn bản đổi bằng một lượt thay. Code thêm track `kubernetes`, mã `K` cho kiểm tra mã, và áp `replacements` trong luồng đồng bộ tài khoản (lần đầu bảng thay thế khác rỗng).

**Tech Stack:** Next.js 16 static export, Fumadocs, TypeScript strict, Zod (chỉ lúc build), Vitest, Playwright.

**Spec:** [docs/superpowers/specs/2026-10-09-tai-cau-truc-roadmap-devops-design.md](../specs/2026-10-09-tai-cau-truc-roadmap-devops-design.md)

## Global Constraints

- Không đổi id chặng cũ (`d0`–`d19`), URL `/vi/learn/d1/d1-1`, mã mục `d1.1.*`, id bài. Chủ đề đổi mã chỉ là 18 cặp trong `replacements` (Task 3, bước 4).
- id chặng mới: DevOps `d20`–`d27`; Kubernetes `k2`, `k3`, `k5`–`k10`.
- Ánh xạ mã hiển thị trong văn bản: D5→D7, D6→D5, D7→D6, D8→D14, D9→D10, D10→D11, D11→K1, D13→K4, D14→D13, D17→D20, D18→K11, D19→D23. Thay một lượt, không thay tuần tự.
- Roadmap mới: id `kubernetes`, area `devops`, track `kubernetes`, tiêu đề "Kubernetes, từ pod đầu tiên tới vận hành nhiều cụm".
- Màu `--track-kubernetes`: sáng `#1f4fb3`, tối `#7aa2ff` (đã tính: chữ trên chip nền 16% đạt 5,76 : 1 trên `--surface` sáng và 4,68–5,99 : 1 trên các nền tối).
- Thứ tự roadmap: `java`, `spring-boot`, `devops`, `kubernetes`, `microservices`.
- TDD cho code trong `src/lib/content` và `src/lib/progress`; không TDD cho giao diện.
- Component trình duyệt không import Zod, `repo.ts`, `manifest.ts`.
- Không commit trong lúc làm; chỉ commit khi người dùng yêu cầu. Bước "Commit" của skill thay bằng chạy kiểm tra.
- Trước khi báo xong: `pnpm verify` xanh.

## Review Focus

- **Máy mới đăng nhập kéo về dòng mã cũ đã bị bỏ đánh dấu ở mã mới** (server có `d11.networkpolicy = done` lúc T1, `k2.networkpolicy = null` lúc T2): chủ đề phải hiện "chưa học", không sống lại. Test ở Task 2.
- **Bảng thay thế đến muộn hơn lần kéo đầu** (trang gọi `setReplacements` sau khi `AccountSync.start()` đã kéo): phải kéo lại toàn bộ một lần và cho cùng kết quả như trên. Test ở Task 2.
- **Tiến độ khách có mã cũ khi đăng nhập lần đầu** phải đẩy lên server bằng mã mới. Test ở Task 2.
- **Văn bản nhắc nội dung đã đổi chỗ** ("D11 dạy Ingress", "D16 có postmortem") vẫn qua `content:check` sau khi thay mã nhưng sai nghĩa: phải đọc lại từng chỗ (Task 3, bước 2).
- **"K8s", "K3s" trong văn bản** không được bị kiểm tra mã bắt nhầm là chặng K8, K3. Test ở Task 1.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `src/lib/content/validate.ts` (sửa) | `CODE_REF` nhận mã `K` |
| `src/lib/content/constants.ts`, `manifest.ts` (sửa) | Track `kubernetes`, thứ tự roadmap |
| `src/app/tokens.css`, `design/tokens.css`, `src/app/global.css`, `src/app/roadmap.css`, `design/roadmap.css`, `src/app/lesson.css` (sửa) | Màu track `kubernetes` |
| `messages/vi.json`, `messages/en.json` (sửa) | `tracks.kubernetes` |
| `src/lib/progress/model.ts` (sửa) | Xuất `resolveId` |
| `src/lib/progress/store.ts` (sửa) | `getReplacements`, `onReplacements`; `setReplacements` bỏ qua khi bảng không đổi |
| `src/lib/progress/sync.ts` (sửa) | `applyRemote` nhận `replacements`, lấy dòng mới nhất theo mã đích |
| `src/lib/progress/account-sync.ts` (sửa) | Tiến độ khách đọc theo bảng thay thế; kéo lại toàn bộ một lần khi bảng thay thế đổi |
| `content/steps/*/meta.json` (sửa, mới), `content/roadmaps/devops.json` (sửa), `content/roadmaps/kubernetes.json` (mới), `content/ids.lock.json` (sửa) | Cấu trúc hai roadmap |
| `content/**/*.mdx`, `content/**/*.json` (sửa qua script) | Mã hiển thị mới |
| `tests/unit/content-validate.test.ts`, `tests/unit/progress-sync.test.ts`, `tests/unit/account-sync.test.ts`, `tests/e2e/learning.spec.ts` (sửa) | Kiểm thử |
| `docs/status.md`, `docs/architecture.md`, `docs/devops-content-review.md`, `README.md` (sửa) | Tài liệu |

---

### Task 1: Mã `K` và track `kubernetes`

**Files:**
- Modify: `src/lib/content/validate.ts:164`, `src/lib/content/constants.ts`, `src/lib/content/manifest.ts`
- Modify: `src/app/tokens.css`, `design/tokens.css`, `src/app/global.css`, `src/app/roadmap.css`, `design/roadmap.css`, `src/app/lesson.css`, `messages/vi.json`, `messages/en.json`
- Test: `tests/unit/content-validate.test.ts`

**Interfaces:**
- Produces: track `'kubernetes'` hợp lệ trong schema; biến CSS `--track-kubernetes`; `validateCodeRefs` nhận mã `K1`…`K11`.

- [ ] **Step 1: Viết test (đỏ)** — trong `describe('validateCodeRefs', …)` của `tests/unit/content-validate.test.ts`, thêm `['K2', 0]` vào `steps` (sau `['M5', 0]`), rồi thêm:

```ts
  it('checks Kubernetes step codes but not K8s or K3s', () => {
    expect(validateCodeRefs('Xem K2, chạy trên K8s và K3s.', steps)).toEqual([]);
    expect(validateCodeRefs('Xem K12.', steps)).toEqual(['nhắc mã chặng "K12" không có trong roadmap nào']);
  });
```

- [ ] **Step 2: Chạy, phải đỏ**

Run: `pnpm test -- tests/unit/content-validate.test.ts`
Expected: FAIL ở test mới (dòng `K12` trả về `[]` vì regex chưa có `K`).

- [ ] **Step 3: Sửa regex** — `src/lib/content/validate.ts`:

```ts
const CODE_REF = /\b(J|SB|D|M|K)(\d{1,2})(?:\.(\d+))?\b/g;
```

- [ ] **Step 4: Chạy, phải xanh**

Run: `pnpm test -- tests/unit/content-validate.test.ts`
Expected: PASS.

- [ ] **Step 5: Hằng số**

`src/lib/content/constants.ts`:

```ts
export const TRACKS = ['java', 'spring', 'devops', 'kubernetes', 'microservices'] as const;
```

`src/lib/content/manifest.ts`:

```ts
const ROADMAP_ORDER = ['java', 'spring-boot', 'devops', 'kubernetes', 'microservices'];
```

- [ ] **Step 6: Màu**

`src/app/tokens.css` và `design/tokens.css`: sau `--track-devops: #7c3aed;` trong `:root` thêm `  --track-kubernetes: #1f4fb3;`; sau `--track-devops: #a78bfa;` trong khối theme tối thêm `  --track-kubernetes: #7aa2ff;`.

`src/app/global.css`, sau `--color-track-devops: var(--track-devops);` (nếu dòng đó không có, đặt sau `--color-track-spring: var(--track-spring);`):

```css
  --color-track-kubernetes: var(--track-kubernetes);
```

`src/app/roadmap.css` và `design/roadmap.css`, sau dòng `.rm-page[data-track='devops'] …` và sau dòng `:is(.hm-card, .hm-now, .hm-topic)[data-track='devops'] …`:

```css
.rm-page[data-track='kubernetes'] { --tc: var(--track-kubernetes); }
```

```css
:is(.hm-card, .hm-now, .hm-topic)[data-track='kubernetes'] { --tc: var(--track-kubernetes); }
```

`src/app/lesson.css`, sau quy tắc `.ms-tab-icon[data-track='devops']` và sau `.ms-step-code[data-track='devops']`:

```css
.ms-tab-icon[data-track='kubernetes'] {
  background: var(--track-kubernetes);
}
```

```css
.ms-step-code[data-track='kubernetes'] {
  background: color-mix(in oklab, var(--track-kubernetes) 16%, transparent);
  color: var(--track-kubernetes);
}
```

- [ ] **Step 7: Chữ giao diện** — trong `tracks` của `messages/vi.json` và `messages/en.json`, thêm `"kubernetes": "Kubernetes"` sau `"devops"`.

- [ ] **Step 8: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test && diff src/app/roadmap.css design/roadmap.css && grep -c "track-kubernetes" src/app/tokens.css design/tokens.css`
Expected: không lỗi; `diff` không in gì; mỗi file tokens đếm 2.

---

### Task 2: Áp bảng thay thế trong đồng bộ tài khoản

**Files:**
- Modify: `src/lib/progress/model.ts`, `src/lib/progress/store.ts`, `src/lib/progress/sync.ts`, `src/lib/progress/account-sync.ts`
- Test: `tests/unit/progress-sync.test.ts`, `tests/unit/account-sync.test.ts`

**Interfaces:**
- Produces: `resolveId(id: string, replacements: Readonly<Record<string, string>>): string` (model); `ProgressStore.getReplacements(): Readonly<Record<string, string>>`, `ProgressStore.onReplacements(listener: () => void): () => void`; `applyRemote(progress, pending, rows, replacements?: Readonly<Record<string, string>>)`.

- [ ] **Step 1: Viết test `applyRemote` (đỏ)** — cuối `describe('applyRemote', …)` trong `tests/unit/progress-sync.test.ts`:

```ts
  it('resolves replaced ids and keeps the newest row for each target', () => {
    const map = { 'old.t': 'new.t' };
    const untickedLater = applyRemote(progress(), emptyPending(), rows({
      topics: [
        { topic_id: 'old.t', mark: 'done', changed_at: T1, synced_at: T3 },
        { topic_id: 'new.t', mark: null, changed_at: T2, synced_at: T3 },
      ],
    }), map);
    expect(untickedLater.progress.topics).toEqual({});

    const markedLater = applyRemote(progress(), emptyPending(), rows({
      topics: [
        { topic_id: 'new.t', mark: null, changed_at: T2, synced_at: T3 },
        { topic_id: 'old.t', mark: 'done', changed_at: T3, synced_at: T3 },
      ],
    }), map);
    expect(markedLater.progress.topics).toEqual({ 'new.t': { s: 'done', at: T3 } });
  });

  it('keeps a newer pending change on the new id against rows for the old id', () => {
    const pending: PendingChanges = {
      ...emptyPending(),
      topics: { 'new.t': { topic_id: 'new.t', mark: 'learning', changed_at: T3 } },
    };
    const result = applyRemote(progress({ topics: { 'new.t': { s: 'learning', at: T3 } } }), pending, rows({
      topics: [{ topic_id: 'old.t', mark: 'done', changed_at: T2, synced_at: T3 }],
    }), { 'old.t': 'new.t' });
    expect(result.progress.topics).toEqual({ 'new.t': { s: 'learning', at: T3 } });
    expect(Object.keys(result.pending.topics)).toEqual(['new.t']);
  });
```

- [ ] **Step 2: Chạy, phải đỏ**

Run: `pnpm test -- tests/unit/progress-sync.test.ts`
Expected: FAIL (lỗi kiểu: `applyRemote` chỉ nhận 3 tham số, hoặc kết quả còn khoá `old.t`).

- [ ] **Step 3: Xuất `resolveId`** — `src/lib/progress/model.ts`: đổi `function resolve(` thành `export function resolveId(` và sửa hai lời gọi `resolve(id, replacements)` trong `applyReplacements` thành `resolveId(id, replacements)`.

- [ ] **Step 4: Sửa `applyRemote`** — `src/lib/progress/sync.ts`: thêm `import { resolveId, type Progress, type TopicMark } from './model';` (thay import kiểu hiện có), thêm hàm trước `applyRemote`, rồi thay thân `applyRemote`:

```ts
/** Gom dòng theo mã đích sau khi thay mã cũ; mỗi mã đích giữ dòng có `changed_at` muộn nhất. */
function latestByTarget<R extends { changed_at: string }>(
  list: readonly R[],
  idOf: (row: R) => string,
  replacements: Readonly<Record<string, string>>,
): Map<string, R> {
  const out = new Map<string, R>();
  for (const row of list) {
    const target = resolveId(idOf(row), replacements);
    const prev = out.get(target);
    const newer = !prev || time(row.changed_at) > time(prev.changed_at);
    const sameTimeOnTarget = prev !== undefined && time(row.changed_at) === time(prev.changed_at) && idOf(row) === target;
    if (newer || sameTimeOnTarget) out.set(target, row);
  }
  return out;
}

export function applyRemote(
  progress: Progress,
  pending: PendingChanges,
  rows: RemoteRows,
  replacements: Readonly<Record<string, string>> = {},
): { progress: Progress; pending: PendingChanges } {
  const items = { ...progress.items };
  const topics = { ...progress.topics };
  const start = { ...progress.start };
  const next: PendingChanges = { items: { ...pending.items }, topics: { ...pending.topics }, starts: { ...pending.starts } };
  const localWins = (queue: Record<string, { changed_at: string }>, id: string, changedAt: string): boolean => {
    const local = own(queue, id);
    if (local && time(local.changed_at) >= time(changedAt)) return true;
    delete queue[id];
    return false;
  };

  for (const [id, row] of latestByTarget(rows.items, (r) => r.item_id, replacements)) {
    if (localWins(next.items, id, row.changed_at)) continue;
    if (row.completed_at) items[id] = normalize(row.completed_at);
    else delete items[id];
  }
  for (const [id, row] of latestByTarget(rows.topics, (r) => r.topic_id, replacements)) {
    if (localWins(next.topics, id, row.changed_at)) continue;
    if (row.mark) topics[id] = { s: row.mark, at: normalize(row.changed_at) };
    else delete topics[id];
  }
  for (const [id, row] of latestByTarget(rows.starts, (r) => r.roadmap_id, {})) {
    if (localWins(next.starts, id, row.changed_at)) continue;
    if (row.level) start[id] = row.level;
    else delete start[id];
  }
  return { progress: { ...progress, items, topics, start }, pending: next };
}
```

Nếu `TopicMark` không còn được dùng trong file sau khi đổi import thì bỏ khỏi import (lint sẽ báo).

- [ ] **Step 5: Chạy, phải xanh**

Run: `pnpm test -- tests/unit/progress-sync.test.ts`
Expected: PASS, kể cả các test `applyRemote` cũ.

- [ ] **Step 6: Viết test `AccountSync` (đỏ)** — cuối `tests/unit/account-sync.test.ts`:

```ts
describe('replacements during account sync', () => {
  const MAP = { 'old.t': 'new.t' };
  const T2 = '2026-10-02T10:00:00.000Z';
  const S = '2026-10-07T00:00:00.000Z';

  it('pulls everything again once when replacements become known, so an old mark does not come back', async () => {
    const { storage, store, remote, sync } = setup();
    remote.rows = {
      items: [],
      topics: [
        { topic_id: 'old.t', mark: 'done', changed_at: T1, synced_at: S },
        { topic_id: 'new.t', mark: null, changed_at: T2, synced_at: S },
      ],
      starts: [],
    };
    await sync.start();
    expect(remote.pulls).toEqual([null]);

    store.setReplacements(MAP);
    await vi.advanceTimersByTimeAsync(0);
    expect(remote.pulls).toEqual([null, null]);
    expect(store.getSnapshot().progress.topics).toEqual({});
    expect(meta(storage).replacements).toBe(JSON.stringify([['old.t', 'new.t']]));

    store.setReplacements({ ...MAP });
    await vi.advanceTimersByTimeAsync(0);
    expect(remote.pulls).toHaveLength(2);
    await sync.syncNow();
    expect(remote.pulls[2]).not.toBeNull();
  });

  it('pushes guest progress under the new ids on first sign-in', async () => {
    const { store, remote, sync } = setup(progress({ topics: { 'old.t': { s: 'done', at: T1 } } }));
    store.setReplacements(MAP);
    await sync.start();
    expect(Object.keys(remote.pushes[0].topics)).toEqual(['new.t']);
    expect(store.getSnapshot().progress.topics).toEqual({ 'new.t': { s: 'done', at: T1 } });
  });

  it('does not reload or notify when the same replacements are set again', () => {
    const store = new ProgressStore(memoryStorage());
    let notified = 0;
    store.onReplacements(() => (notified += 1));
    store.setReplacements(MAP);
    store.setReplacements({ ...MAP });
    expect(notified).toBe(1);
    expect(store.getReplacements()).toEqual(MAP);
  });
});
```

- [ ] **Step 7: Chạy, phải đỏ**

Run: `pnpm test -- tests/unit/account-sync.test.ts`
Expected: FAIL (`onReplacements`, `getReplacements` không tồn tại; lần kéo thứ hai không xảy ra).

- [ ] **Step 8: Sửa `ProgressStore`** — `src/lib/progress/store.ts`: thêm field và method, thay `setReplacements`:

```ts
  private readonly replacementListeners = new Set<Listener>();

  getReplacements = (): Readonly<Record<string, string>> => this.replacements;

  /** Báo khi bảng mã thay thế đổi, để đồng bộ tài khoản kéo lại theo mã mới. */
  onReplacements = (listener: Listener): (() => void) => {
    this.replacementListeners.add(listener);
    return () => this.replacementListeners.delete(listener);
  };

  /** Cập nhật bảng mã thay thế khi trang có manifest mới; bỏ qua nếu bảng không đổi. */
  setReplacements(replacements: Readonly<Record<string, string>>): void {
    if (sameReplacements(this.replacements, replacements)) return;
    this.replacements = replacements;
    this.reload();
    for (const listener of this.replacementListeners) listener();
  }
```

Và hàm ở cuối file (ngoài class):

```ts
function sameReplacements(a: Readonly<Record<string, string>>, b: Readonly<Record<string, string>>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && b[key] === a[key]);
}
```

- [ ] **Step 9: Sửa `AccountSync`** — `src/lib/progress/account-sync.ts`:

1. `type Meta = { v: 1; cursor: string | null; pending: PendingChanges; replacements?: string };`
2. Trong `readMeta`, giữ khoá này khi hợp lệ: thay `return { v: 1, cursor: meta.cursor, pending: meta.pending };` bằng

```ts
      const replacements = 'replacements' in meta && typeof meta.replacements === 'string' ? meta.replacements : undefined;
      return { v: 1, cursor: meta.cursor, pending: meta.pending, ...(replacements ? { replacements } : {}) };
```

3. Thêm hàm sau `saveMeta`:

```ts
/** Khoá ổn định của bảng thay thế; rỗng khi chưa có bảng. */
function replacementsKey(replacements: Readonly<Record<string, string>>): string {
  const entries = Object.entries(replacements).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return entries.length === 0 ? '' : JSON.stringify(entries);
}
```

4. `readGuest(storage: StorageLike, replacements: Readonly<Record<string, string>>)`: đổi `parseProgress(JSON.parse(raw))` thành `parseProgress(JSON.parse(raw), replacements)`.
5. Trong class: thêm field `private offReplacements: (() => void) | undefined;`. Trong `start()`: đổi `readGuest(storage)` thành `readGuest(storage, store.getReplacements())`; ngay sau dòng `this.unsubscribe = store.onChange(…)` thêm `this.offReplacements = store.onReplacements(() => void this.syncNow());`. Trong `stop()` thêm `this.offReplacements?.();`.
6. Thay `pull()`:

```ts
  private async pull(): Promise<void> {
    const before = this.readMeta();
    const replacements = this.options.store.getReplacements();
    const key = replacementsKey(replacements);
    // Bảng thay thế mới: kéo lại toàn bộ một lần để dòng mã cũ được gộp đúng vào mã mới.
    const full = key !== '' && key !== before?.replacements;
    const since = !full && before?.cursor ? new Date(Date.parse(before.cursor) - PULL_OVERLAP_MS).toISOString() : null;
    const rows = await this.options.remote.pull(since);
    if (this.stopped) return;
    // Đọc lại: trong lúc chờ mạng người học có thể đã tích thêm.
    const meta = this.readMeta() ?? { v: 1, cursor: null, pending: emptyPending() };
    const { progress, pending } = applyRemote(this.options.store.getSnapshot().progress, meta.pending, rows, replacements);
    this.options.store.replaceProgress(progress);
    this.saveMeta({ ...meta, cursor: nextCursor(meta.cursor, rows), pending, ...(key ? { replacements: key } : {}) });
  }
```

Giữ nguyên các phần khác (`this.readMeta`, `this.saveMeta` là wrapper đã có trong class).

- [ ] **Step 10: Chạy, phải xanh**

Run: `pnpm test -- tests/unit/account-sync.test.ts tests/unit/progress-sync.test.ts tests/unit/progress.test.ts`
Expected: PASS, kể cả test cũ (test cũ không đặt bảng thay thế nên `key` rỗng, hành vi kéo không đổi).

- [ ] **Step 11: Kiểm tra**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: không lỗi.

---

### Task 3: Tái cấu trúc nội dung

**Files:**
- Create: `content/roadmaps/kubernetes.json`; `content/steps/{d20,d21,d22,d23,d24,d25,d26,d27,k2,k3,k5,k6,k7,k8,k9,k10}/meta.json`
- Modify: `content/roadmaps/devops.json`; `meta.json` của `d0`–`d19`; `content/ids.lock.json`; mọi file `content/**/*.mdx`, `content/**/*.json` có mã hiển thị (qua script)

**Interfaces:**
- Consumes: track `kubernetes` và mã `K` (Task 1).

- [ ] **Step 1: Đổi mã hiển thị bằng một lượt thay** — lưu script vào thư mục scratchpad của session (không commit), chạy từ gốc repo:

```python
# remap_devops_codes.py — chạy một lần: python3 remap_devops_codes.py
import pathlib, re

MAP = {'5': 'D7', '6': 'D5', '7': 'D6', '8': 'D14', '9': 'D10', '10': 'D11', '11': 'K1',
       '13': 'K4', '14': 'D13', '17': 'D20', '18': 'K11', '19': 'D23'}
PATTERN = re.compile(r'\bD(5|6|7|8|9|10|11|13|14|17|18|19)(\.\d+)?\b')

files = changes = 0
for path in pathlib.Path('content').rglob('*'):
    if path.suffix not in ('.mdx', '.json') or path.name == 'ids.lock.json':
        continue
    text = path.read_text(encoding='utf-8')
    count = len(PATTERN.findall(text))
    if count:
        path.write_text(PATTERN.sub(lambda m: MAP[m.group(1)] + (m.group(2) or ''), text), encoding='utf-8')
        files += 1
        changes += count
print(f'{files} file, {changes} chỗ')
```

Expected: khoảng 20–30 file, khoảng 49 chỗ. Kiểm: `grep -rnE '\bD(1[89]|17)\b' content` không in gì.

- [ ] **Step 2: Đọc lại từng chỗ nhắc mã ngoài `meta.json` của chặng DevOps**

Run: `grep -rnE '\b(D(5|6|7|10|11|13|14|20|23)|K(1|4|11))(\.[0-9]+)?\b' content --include=*.mdx` và `grep -rnE '\b(D[0-9]{1,2}|K[0-9]{1,2})\b' content/steps/{j,sb,m}*/meta.json content/projects content/roadmaps`
Expected: đọc từng dòng theo bảng chủ đề ở spec §3–4. Câu nhắc nội dung nay nằm ở chặng khác thì sửa tay mã cho đúng, ví dụ: Ingress, Service, NetworkPolicy, RBAC, PersistentVolume → K2; Helm chart → K3; HPA, affinity → K5; Cilium → K6; CRD, operator → K9; postmortem, xử lý sự cố, chaos → D17; dung lượng, quá tải → D18; Ansible → D8. Câu chỉ nhắc chặng chung ("Kubernetes ở K1") giữ nguyên.

- [ ] **Step 3: Dựng và sửa `meta.json`** — lưu script vào scratchpad, chạy từ gốc repo:

```python
# restructure_devops.py — chạy một lần sau remap: python3 restructure_devops.py
import json, pathlib

S = pathlib.Path('content/steps')

def load(step):
    return json.loads((S / step / 'meta.json').read_text(encoding='utf-8'))

def save(meta):
    (S / meta['id']).mkdir(exist_ok=True)
    (S / meta['id'] / 'meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def topic(step, slug, title, kind=None):
    t = {'id': f'{step}.{slug}', 'title': title}
    if kind:
        t['kind'] = kind
    return t

# Chặng hiện có: mã, tên, track, tiền điều kiện; bỏ chủ đề (đã chuyển đi hoặc đổi mã);
# đổi kind (None = core); đổi tên chủ đề; đổi mã tại chỗ; thêm chủ đề cuối chặng.
EDIT = {
    'd0': dict(code='D0', prereq=[]),
    'd1': dict(code='D1', prereq=['d0'], add=[
        ('kernel-sysctl-cgroups', 'Kernel, sysctl, namespace và cgroup'),
        ('lvm-raid', 'LVM và RAID'),
        ('apparmor-selinux', 'AppArmor và SELinux cơ bản')]),
    'd2': dict(code='D2', prereq=['d1'], add=[
        ('dns-van-hanh', 'DNS khi vận hành: TTL, cache, split-horizon'),
        ('vlan-bonding', 'VLAN, bonding và mạng máy chủ')]),
    'd3': dict(code='D3', prereq=['d1']),
    'd4': dict(code='D4', prereq=['d0']),
    'd6': dict(code='D5', prereq=['d1'], add=[
        ('namespace-cgroup-oci', 'Container dưới lớp vỏ: namespace, cgroup, OCI')]),
    'd7': dict(code='D6', prereq=['d4', 'd6'], kinds={'feature-flag': None}, add=[
        ('oidc-vao-cloud', 'OIDC từ pipeline vào cloud thay khoá tĩnh'),
        ('bao-ve-pipeline', 'Bảo vệ pipeline: ghim action theo SHA, quyền token tối thiểu'),
        ('runner-tu-host', 'Runner tự host'),
        ('moi-truong-preview', 'Môi trường preview', 'opt')]),
    'd5': dict(code='D7', title='Đo lường delivery', short='Đo lường delivery', prereq=['d7'],
               reid={'bon-chi-so-dora': ('chi-so-dora', 'Năm chỉ số DORA')}),
    'd9': dict(code='D10', title='Cloud: AWS', short='Cloud AWS', prereq=['d2'],
               kinds={'aws-gcp-azure': None}, rename={'aws-gcp-azure': 'AWS, đối chiếu GCP và Azure'}, add=[
        ('region-az-failure-domain', 'Region, AZ và failure domain'),
        ('load-balancer-cloud', 'Load balancer trên cloud (ALB, NLB)'),
        ('hybrid-vpn', 'Kết nối hybrid: VPN và Direct Connect'),
        ('du-lieu-trong-nuoc', 'Dữ liệu trong nước: Local Zone Hà Nội và cloud nội địa'),
        ('openstack-khai-niem', 'Private cloud: OpenStack ở mức khái niệm', 'opt')]),
    'd10': dict(code='D11', prereq=['d3', 'd6'], drop=['ansible'], add=[
        ('remote-state-locking', 'Remote state và locking'),
        ('kiem-thu-iac', 'Kiểm thử và review IaC')]),
    'd12': dict(code='D12', prereq=['d6'], add=[
        ('alertmanager-routing', 'Alertmanager: route, nhóm, silence'),
        ('log-tap-trung-luu-tru', 'Log tập trung và thời gian lưu')]),
    'd14': dict(code='D13', title='GitOps và thay đổi an toàn', short='GitOps', prereq=['d7', 'd11'],
                kinds={'argo-rollouts': None}, add=[
        ('thang-cap-moi-truong', 'Thăng cấp giữa môi trường'),
        ('wave-bake-time', 'Triển khai theo wave và bake time'),
        ('config-la-thay-doi', 'Config và dữ liệu điều khiển cũng là thay đổi'),
        ('kill-switch-rollback', 'Kill switch và rollback hai chiều')]),
    'd8': dict(code='D14', prereq=['d7'], kinds={'slsa': None}, add=[
        ('vu-tan-cong-that', 'Các vụ tấn công chuỗi cung ứng thật')]),
    'd15': dict(code='D15', title='DevSecOps và identity', short='DevSecOps', prereq=['d9', 'd11'],
                kinds={'opa-gatekeeper-kyverno': None}, add=[
        ('workload-identity', 'Workload identity'),
        ('truy-cap-nguoi', 'Truy cập của người: SSO, JIT, break-glass, bastion'),
        ('phan-vung-mang', 'Phân vùng mạng và tách môi trường'),
        ('spiffe-spire', 'SPIFFE và SPIRE', 'opt')]),
    'd16': dict(code='D16', title='SLO, alerting và observability ở quy mô', short='SLO và alerting', prereq=['d12'],
                drop=['xu-ly-su-co', 'postmortem-khong-do-loi', 'chaos-engineering', 'ke-hoach-dung-luong', 'qua-tai-loi-day-chuyen'],
                reid={'alert-on-call': ('alert-burn-rate', 'Alert theo burn rate')}, add=[
        ('metric-dai-han', 'Metric dài hạn và nhiều cụm'),
        ('cardinality', 'Cardinality'),
        ('tail-sampling', 'Tail sampling và Collector nhiều tầng'),
        ('chi-phi-log', 'Chi phí và vòng đời log'),
        ('meta-monitoring', 'Giám sát hệ thống giám sát'),
        ('profiling-lien-tuc', 'Continuous profiling', 'opt')]),
    'd17': dict(code='D20', title='Sao lưu và DR', short='Sao lưu và DR', prereq=['d24'],
                kinds={'sao-luu-tai-nguyen-cum': None, 'da-vung': None}, add=[
        ('chien-luoc-dr', 'Chiến lược DR: từ backup tới active-active'),
        ('hai-site', 'Hai site và yêu cầu DR của ngân hàng'),
        ('failover-failback', 'Failover và failback')]),
    'd19': dict(code='D23', prereq=['d14'], optional=False,
                kinds={'internal-developer-platform': None, 'golden-path-template': None,
                       'phan-bo-chi-phi': None, 'rightsizing-spot-instance': None}, add=[
        ('nen-tang-la-san-pham', 'Nền tảng là sản phẩm và maturity model'),
        ('crossplane', 'API nền tảng với Crossplane'),
        ('unit-economics', 'Unit economics và FOCUS')]),
    'd11': dict(code='K1', title='Kiến trúc và workload', short='Workload', track='kubernetes', prereq=['d6'],
                drop=['service-dns-cum', 'ingress-gateway-api', 'volume-persistentvolume', 'rbac-serviceaccount', 'networkpolicy'],
                add=[('multi-container', 'Pod nhiều container và sidecar')]),
    'd13': dict(code='K4', title='Dựng và vận hành cụm', short='Vận hành cụm', track='kubernetes', prereq=['k3'],
                drop=['helm-kustomize', 'affinity-taint-toleration', 'hpa-vpa-cluster-autoscaler', 'crd-operator'], add=[
        ('ha-control-plane', 'Control plane HA với HAProxy và Keepalived'),
        ('metallb', 'LoadBalancer trên bare metal với MetalLB'),
        ('chung-chi-cum', 'Chứng chỉ của cụm'),
        ('vong-doi-node', 'Vòng đời node: drain, vá, image bất biến'),
        ('rancher', 'Quản lý cụm bằng Rancher', 'opt')]),
    'd18': dict(code='K11', track='kubernetes', prereq=['k6'], drop=['ebpf-cilium']),
}

for step, e in EDIT.items():
    m = load(step)
    m['code'] = e['code']
    m['track'] = e.get('track', 'devops')
    m['prerequisites'] = e['prereq']
    if 'title' in e:
        m['title'] = e['title']
    if 'short' in e:
        m['short'] = e['short']
    if e.get('optional') is False:
        m.pop('optional', None)
    drop = {f'{step}.{s}' for s in e.get('drop', [])}
    topics = []
    for t in m['topics']:
        slug = t['id'].split('.', 1)[1]
        if t['id'] in drop:
            continue
        if slug in e.get('reid', {}):
            new_slug, title = e['reid'][slug]
            t = {**t, 'id': f'{step}.{new_slug}', 'title': title}
        if slug in e.get('kinds', {}):
            kind = e['kinds'][slug]
            t = {k: v for k, v in t.items() if k != 'kind'}
            if kind:
                t['kind'] = kind
        if slug in e.get('rename', {}):
            t = {**t, 'title': e['rename'][slug]}
        topics.append(t)
    for a in e.get('add', []):
        topics.append(topic(step, *a))
    m['topics'] = topics
    save(m)

NEW = [
    ('d20', 'D8', 'Quản lý cấu hình máy', 'Cấu hình máy', 'devops', ['d2', 'd3'], [
        ('ansible-co-ban', 'Ansible: inventory, module, playbook'),
        ('ansible-role-collection', 'Role và collection'),
        ('idempotent-kiem-thu', 'Idempotent, check mode và kiểm thử với Molecule'),
        ('ansible-vault', 'Bí mật trong Ansible'),
        ('packer-golden-image', 'Golden image với Packer'),
        ('va-os-theo-dot', 'Vá hệ điều hành theo đợt'),
        ('awx-semaphore', 'AWX hoặc Semaphore', 'opt')]),
    ('d21', 'D9', 'Proxy, load balancer và TLS ở production', 'Proxy và TLS', 'devops', ['d2'], [
        ('nginx-production', 'Nginx trên production: worker, keepalive, buffer, giới hạn tốc độ'),
        ('haproxy', 'HAProxy: L4, L7 và health check'),
        ('keepalived-vip', 'Keepalived và VIP'),
        ('tls-production', 'TLS trên production: ACME, OCSP, cipher, xoay chứng chỉ'),
        ('pki-noi-bo', 'PKI và CA nội bộ'),
        ('cdn-waf', 'CDN và WAF'),
        ('envoy', 'Envoy', 'opt')]),
    ('d22', 'D17', 'Sự cố và on-call', 'Sự cố', 'devops', ['d16'], [
        ('quy-trinh-su-co', 'Quy trình xử lý sự cố'),
        ('vai-tro-giao-tiep', 'Vai trò và giao tiếp trong sự cố'),
        ('on-call-ben-vung', 'On-call bền vững'),
        ('runbook-tu-dong-hoa', 'Runbook và tự động hoá'),
        ('postmortem-khong-do-loi', 'Postmortem không đổ lỗi'),
        ('game-day', 'Game day và chaos engineering')]),
    ('d23', 'D18', 'Dung lượng, hiệu năng và quá tải', 'Dung lượng', 'devops', ['d12'], [
        ('ke-hoach-dung-luong', 'Kế hoạch dung lượng'),
        ('qua-tai-loi-day-chuyen', 'Quá tải và lỗi dây chuyền'),
        ('load-test-ca-he', 'Load test cả hệ thống'),
        ('load-shedding-bien', 'Load shedding ở biên'),
        ('hieu-nang-os-mang', 'Hiệu năng ở tầng hệ điều hành và mạng')]),
    ('d24', 'D19', 'Vận hành dữ liệu stateful', 'Dữ liệu stateful', 'devops', ['d12', 'k7'], [
        ('postgres-ha', 'PostgreSQL HA với operator'),
        ('pooling-replication-lag', 'Connection pooling và replication lag'),
        ('pitr-kiem-tra-khoi-phuc', 'PITR và kiểm tra khôi phục tự động'),
        ('migration-lon', 'Backfill và migration lớn'),
        ('kafka-ops', 'Vận hành Kafka'),
        ('cache-ops', 'Vận hành cache'),
        ('database-dat-o-dau', 'Database trên Kubernetes, VM hay dịch vụ quản lý')]),
    ('d25', 'D21', 'Giới hạn blast radius', 'Blast radius', 'devops', ['d17'], [
        ('failure-domain', 'Failure domain'),
        ('kien-truc-cell', 'Kiến trúc cell'),
        ('shuffle-sharding', 'Shuffle sharding'),
        ('static-stability', 'Static stability'),
        ('rut-traffic', 'Rút traffic khỏi AZ hoặc cell'),
        ('phu-thuoc-toan-cau', 'Phụ thuộc ẩn vào dịch vụ toàn cầu')]),
    ('d26', 'D22', 'Cloud ở quy mô tổ chức', 'Cloud tổ chức', 'devops', ['d9', 'd10', 'd15'], [
        ('landing-zone', 'Landing zone'),
        ('organizations-scp', 'AWS Organizations và SCP'),
        ('identity-center', 'IAM Identity Center và SSO'),
        ('mang-hub-spoke', 'Mạng hub-and-spoke và DNS hybrid'),
        ('iac-o-quy-mo', 'IaC ở quy mô: tách state, Terragrunt, Atlantis'),
        ('policy-as-code', 'Policy as code'),
        ('egress-chi-phi-mang', 'Egress và chi phí mạng')]),
    ('d27', 'D24', 'Tuân thủ cho kỹ sư', 'Tuân thủ', 'devops', ['d15', 'd17'], [
        ('quy-dinh-viet-nam', 'Luật An ninh mạng 2025, Nghị định 333/2026, Luật BVDLCN 2025'),
        ('cap-do-an-toan', 'Cấp độ an toàn hệ thống thông tin'),
        ('ngan-hang-tt09', 'An toàn hệ thống ngân hàng theo TT 09/2020'),
        ('soc2-iso27001', 'SOC 2 và ISO 27001 cho kỹ sư'),
        ('pci-dss', 'PCI DSS'),
        ('bang-chung-tu-dong', 'Bằng chứng tuân thủ tự động'),
        ('quan-ly-thay-doi', 'Quản lý thay đổi và tách quyền')]),
    ('k2', 'K2', 'Mạng, lưu trữ và quyền', 'Mạng và quyền', 'kubernetes', ['d11', 'd2'], [
        ('service-dns', 'Service và DNS trong cụm'),
        ('gateway-api', 'Gateway API và Ingress cũ'),
        ('persistent-volume', 'Volume và PersistentVolume'),
        ('rbac-serviceaccount', 'RBAC và ServiceAccount'),
        ('networkpolicy', 'NetworkPolicy'),
        ('security-context', 'SecurityContext')]),
    ('k3', 'K3', 'Đóng gói: Helm và Kustomize', 'Helm và Kustomize', 'kubernetes', ['k2'], [
        ('helm-dung-chart', 'Dùng chart có sẵn'),
        ('helm-viet-chart', 'Tự viết Helm chart'),
        ('kustomize-overlay', 'Kustomize và overlay'),
        ('chart-oci', 'Phát hành chart qua OCI registry')]),
    ('k5', 'K5', 'Scheduling, autoscaling và multi-tenancy', 'Scheduling', 'kubernetes', ['d13'], [
        ('affinity-taint', 'Affinity, taint, toleration'),
        ('topology-spread-pdb', 'Topology spread và PodDisruptionBudget'),
        ('priority-preemption', 'Priority và preemption'),
        ('quota-limitrange', 'ResourceQuota và LimitRange'),
        ('hpa-vpa-autoscaler', 'HPA, VPA và cluster autoscaler'),
        ('keda', 'Scale theo sự kiện với KEDA'),
        ('multi-tenancy', 'Multi-tenancy: namespace, Capsule, vCluster'),
        ('karpenter', 'Karpenter', 'opt')]),
    ('k6', 'K6', 'Mạng cụm chuyên sâu', 'Mạng cụm', 'kubernetes', ['d13'], [
        ('cni-cilium', 'CNI, eBPF và Cilium'),
        ('kube-proxy-dataplane', 'kube-proxy và data plane'),
        ('gateway-api-nang-cao', 'Gateway API nâng cao'),
        ('cert-manager', 'cert-manager'),
        ('external-dns', 'external-dns'),
        ('egress', 'Kiểm soát egress'),
        ('coredns-quy-mo', 'CoreDNS ở quy mô')]),
    ('k7', 'K7', 'Lưu trữ và workload stateful', 'Lưu trữ', 'kubernetes', ['d13'], [
        ('csi-storageclass', 'CSI và StorageClass'),
        ('longhorn', 'Longhorn'),
        ('rook-ceph', 'Rook và Ceph'),
        ('snapshot', 'Snapshot và clone'),
        ('operator-database', 'Operator quản lý database thế nào')]),
    ('k8', 'K8', 'Bảo mật cụm', 'Bảo mật cụm', 'kubernetes', ['d13'], [
        ('pod-security-admission', 'Pod Security Admission'),
        ('admission-policy', 'Admission policy: ValidatingAdmissionPolicy và Kyverno'),
        ('seccomp-apparmor', 'seccomp và AppArmor'),
        ('runtime-falco', 'Phát hiện tấn công lúc chạy với Falco'),
        ('xac-minh-image', 'Xác minh chữ ký image khi triển khai'),
        ('audit-log', 'Audit log của cụm'),
        ('cis-benchmark', 'CIS benchmark')]),
    ('k9', 'K9', 'Mở rộng Kubernetes', 'Mở rộng API', 'kubernetes', ['k3'], [
        ('crd', 'CRD'),
        ('controller', 'Controller và vòng reconcile'),
        ('viet-operator', 'Tự viết operator'),
        ('dung-operator', 'Chọn và vận hành operator có sẵn')]),
    ('k10', 'K10', 'Nhiều cụm và fleet', 'Nhiều cụm', 'kubernetes', ['d13', 'd14'], [
        ('vi-sao-nhieu-cum', 'Khi nào cần nhiều cụm'),
        ('cluster-api', 'Cluster API'),
        ('gitops-nhieu-cum', 'GitOps cho nhiều cụm'),
        ('failover-giua-cum', 'Failover giữa các cụm'),
        ('chinh-sach-fleet', 'Chính sách chung cho fleet')]),
]

for step, code, title, short, track, prereq, topics in NEW:
    save({'title': title, 'id': step, 'code': code, 'short': short, 'track': track,
          'prerequisites': prereq, 'topics': [topic(step, *t) for t in topics], 'links': [], 'pages': []})
print('ok')
```

Expected: in `ok`. Kiểm: `ls content/steps | grep -cE '^(d2[0-7]|k([2-9]|10))$'` in `16`.

- [ ] **Step 4: Bảng thay thế** — chạy từ gốc repo:

```python
# add_replacements.py
import json, pathlib
p = pathlib.Path('content/ids.lock.json')
lock = json.loads(p.read_text(encoding='utf-8'))
lock['replacements'].update({
    'd5.bon-chi-so-dora': 'd5.chi-so-dora',
    'd10.ansible': 'd20.ansible-co-ban',
    'd16.alert-on-call': 'd16.alert-burn-rate',
    'd16.xu-ly-su-co': 'd22.quy-trinh-su-co',
    'd16.postmortem-khong-do-loi': 'd22.postmortem-khong-do-loi',
    'd16.chaos-engineering': 'd22.game-day',
    'd16.ke-hoach-dung-luong': 'd23.ke-hoach-dung-luong',
    'd16.qua-tai-loi-day-chuyen': 'd23.qua-tai-loi-day-chuyen',
    'd11.service-dns-cum': 'k2.service-dns',
    'd11.ingress-gateway-api': 'k2.gateway-api',
    'd11.volume-persistentvolume': 'k2.persistent-volume',
    'd11.rbac-serviceaccount': 'k2.rbac-serviceaccount',
    'd11.networkpolicy': 'k2.networkpolicy',
    'd13.helm-kustomize': 'k3.helm-viet-chart',
    'd13.affinity-taint-toleration': 'k5.affinity-taint',
    'd13.hpa-vpa-cluster-autoscaler': 'k5.hpa-vpa-autoscaler',
    'd13.crd-operator': 'k9.crd',
    'd18.ebpf-cilium': 'k6.cni-cilium',
})
p.write_text(json.dumps(lock, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(lock['replacements']))
```

Expected: in `18`. Trước khi chạy, kiểm định dạng thụt lề của `ids.lock.json` hiện tại (`head -3 content/ids.lock.json`); nếu không phải 2 dấu cách thì đổi `indent` cho khớp để diff chỉ có phần thêm.

- [ ] **Step 5: Hai roadmap**

`content/roadmaps/devops.json` (giữ `id`, `area`, `track`, `recommended: []`), đổi:

```json
  "title": { "vi": "DevOps, từ một máy Linux tới hạ tầng cho hệ thống lớn" },
  "description": {
    "vi": "Tự vận hành máy chủ và mạng, đưa ứng dụng lên production trên máy chủ riêng và AWS, rồi vận hành hệ thống lớn: thay đổi an toàn, dữ liệu, sự cố, DR và nền tảng nội bộ."
  },
```

và `levels`:

```json
  "levels": [
    {
      "id": "foundation",
      "title": { "vi": "Nền tảng" },
      "goal": { "vi": "Tự vận hành máy Linux, mạng và đóng gói ứng dụng bằng container." },
      "steps": ["d0", "d1", "d2", "d3", "d4", "d6"]
    },
    {
      "id": "middle",
      "title": { "vi": "Middle" },
      "goal": { "vi": "Đưa ứng dụng lên production trên máy chủ riêng và AWS. Học song song Kubernetes K1–K3." },
      "steps": ["d7", "d5", "d20", "d21", "d9", "d10", "d12"]
    },
    {
      "id": "senior",
      "title": { "vi": "Senior" },
      "goal": { "vi": "Vận hành hệ thống lớn: an toàn, đáng tin cậy, ở quy mô." },
      "steps": ["d14", "d8", "d15", "d16", "d22", "d23", "d24", "d17", "d25", "d26", "d19", "d27"]
    }
  ]
```

`content/roadmaps/kubernetes.json`:

```json
{
  "id": "kubernetes",
  "area": "devops",
  "track": "kubernetes",
  "title": { "vi": "Kubernetes, từ pod đầu tiên tới vận hành nhiều cụm" },
  "description": {
    "vi": "Chạy ứng dụng trên Kubernetes, tự dựng và vận hành cụm on-prem hoặc trên cloud, rồi bảo mật, mở rộng và quản lý nhiều cụm."
  },
  "recommended": ["d6"],
  "levels": [
    {
      "id": "foundation",
      "title": { "vi": "Nền tảng" },
      "goal": { "vi": "Chạy và cấu hình ứng dụng trên Kubernetes." },
      "steps": ["d11", "k2", "k3"]
    },
    {
      "id": "middle",
      "title": { "vi": "Middle" },
      "goal": { "vi": "Tự dựng, vận hành và mở rộng một cụm." },
      "steps": ["d13", "k5", "k6", "k7"]
    },
    {
      "id": "senior",
      "title": { "vi": "Senior" },
      "goal": { "vi": "Bảo mật, mở rộng API và vận hành nhiều cụm." },
      "steps": ["k8", "k9", "k10", "d18"]
    }
  ]
}
```

Nếu `devops.json` có trường khác (ví dụ `short`) thì giữ nguyên và thêm trường tương ứng cho `kubernetes.json` (giá trị "Kubernetes").

- [ ] **Step 6: Khoá mã chủ đề mới và kiểm tra**

Run: `pnpm content:lock`
Expected: `✓ Nội dung hợp lệ`, thêm khoảng 120 chủ đề, 0 mục. Nếu báo lỗi mã chặng (`D25`, `K12`…), sửa văn bản theo bảng ánh xạ. Nếu báo chủ đề đã khoá bị mất, kiểm bảng thay thế ở bước 4. `git diff content/ids.lock.json` chỉ có dòng thêm (cộng dấu phẩy ở dòng cuối danh sách cũ).

- [ ] **Step 7: Kiểm tra số liệu**

Run:
```bash
python3 -c "
import json
for r in ['devops','kubernetes']:
    m=json.load(open(f'content/roadmaps/{r}.json'))
    steps=[s for l in m['levels'] for s in l['steps']]
    codes=[json.load(open(f'content/steps/{s}/meta.json'))['code'] for s in steps]
    topics=sum(len(json.load(open(f'content/steps/{s}/meta.json'))['topics']) for s in steps)
    print(r,len(steps),codes,topics)
"
```
Expected: `devops 25 ['D0', 'D1', …, 'D24']` đúng thứ tự; `kubernetes 11 ['K1', …, 'K11']`.

- [ ] **Step 8: Kiểm tra build**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: không lỗi; `out/vi/roadmaps/kubernetes.html` tồn tại.

---

### Task 4: Kiểm thử E2E

**Files:**
- Modify: `tests/e2e/learning.spec.ts`

- [ ] **Step 1: Sửa test cũ**

- `trang chủ không có link Roadmap trên nav` (hoặc test đang có `toHaveCount(4)` cho `.hm-card`): `toHaveCount(4)` thành `toHaveCount(5)`.
- Chạy `grep -n "devops#\|#step-d\|'D[0-9]" tests/e2e/*.ts`; với mỗi chỗ nhắc chặng hoặc chủ đề đã chuyển sang Kubernetes hay đổi mã (bảng ở Global Constraints), sửa theo id và mã mới. `d1`, `d2`, `d3` không đổi.

- [ ] **Step 2: Thêm test mới** — cuối `tests/e2e/learning.spec.ts`:

```ts
test('roadmap Kubernetes có 11 chặng; DevOps có 25 chặng', async ({ page }) => {
  await page.goto('/vi/roadmaps/kubernetes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kubernetes');
  await expect(page.locator('.rm-step')).toHaveCount(11);
  await expect(page.locator('#step-d11')).toContainText('K1');
  await expect(page.locator('#step-k2')).toContainText('K2');
  await page.goto('/vi/roadmaps/devops');
  await expect(page.locator('.rm-step')).toHaveCount(25);
  await expect(page.locator('#step-d6')).toContainText('D5');
  await expect(page.locator('#step-d27')).toContainText('D24');
});

test('chủ đề đã đánh dấu theo mã cũ hiện ở mã mới', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('masteva:progress:v2:seeded')) {
      localStorage.setItem('masteva:progress:v2', JSON.stringify({
        v: 2, items: {}, topics: { 'd11.networkpolicy': { s: 'done', at: '2026-10-01T00:00:00.000Z' } }, start: {},
      }));
      localStorage.setItem('masteva:progress:v2:seeded', '1');
    }
  });
  await page.goto('/vi/roadmaps/kubernetes');
  await expect(page.locator('[data-topic="k2.networkpolicy"]')).toHaveAttribute('data-st', 'done');
});
```

Nếu `h1` của trang roadmap không lấy từ `tracks` (kiểm `/vi/roadmaps/spring-boot` hiện "Spring Boot"), đổi kỳ vọng `h1` theo cách trang đó đặt tên.

- [ ] **Step 3: Chạy E2E**

Run: `pnpm e2e`
Expected: mọi test xanh (test chỉ cho desktop vẫn bỏ qua ở mobile như trước).

---

### Task 5: Tài liệu và kiểm tra toàn bộ

**Files:**
- Modify: `docs/status.md`, `docs/architecture.md`, `docs/devops-content-review.md`, `README.md`

- [ ] **Step 1: Tài liệu**

- `docs/status.md`: thêm mốc "Tái cấu trúc DevOps, tách roadmap Kubernetes (đợt 1)" vào bảng "Đã xong" (DevOps 25 chặng, Kubernetes 11 chặng, 16 chặng khung mới, khoảng 120 chủ đề mới, 18 mã thay thế, sửa đồng bộ tài khoản áp mã thay thế); thêm bảng ánh xạ mã DevOps (Global Constraints). Ở "Vấn đề đã biết": bỏ dòng "`replacements` chưa áp vào tiến độ khách khi gộp và trước bước so thời điểm trong `applyRemote`"; thêm "người đã đặt 'đã biết cấp Middle/Senior' ở DevOps giờ hiểu theo cấu trúc mới". Bước tiếp theo: đợt 2 DevOps (bài cho D0–D5 và K1–K3, kèm tóm tắt và tài liệu chủ đề). Xoá dòng "thư mục lab còn trên máy" của đợt 2 và 3 Spring Boot (người dùng đã xoá).
- `docs/architecture.md` mục 5.1: định danh roadmap thêm `kubernetes`; mã hiển thị thêm tiền tố `K`.
- `docs/devops-content-review.md`: trạng thái "phương án B đã chọn; đợt 1 đã làm (09/10/2026), xem spec".
- `README.md`: chạy `grep -n "roadmap" README.md`; chỗ nào nói số roadmap đổi thành 5 và thêm Kubernetes.

- [ ] **Step 2: Kiểm tra toàn bộ**

Run: `pnpm verify`
Expected: xanh.

- [ ] **Step 3: Xem bằng mắt** — dev server (`preview_start` cấu hình `dev`): trang chủ (5 thẻ, thẻ Kubernetes màu xanh dương), `/vi/roadmaps/kubernetes` (3 cấp, 11 chặng, K11 tuỳ chọn), `/vi/roadmaps/devops` (25 chặng, D0–D24), khung chi tiết một chủ đề Kubernetes, `/vi/learn/d1/d1-1` (thanh bên DevOps, chip D0…D24), ở cả theme sáng và tối.
