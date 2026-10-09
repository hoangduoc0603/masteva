import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const LESSON = '/vi/learn/d1/d1-1';
const CHECK = '[data-check-id="d1.1.exit-code"]';

async function seriousViolations(page: Page) {
  // Chờ các hiệu ứng chuyển cảnh (mục lục thu gọn) chạy xong, tránh đo màu giữa chừng.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  const result = await new AxeBuilder({ page }).analyze();
  return result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

/** Trên mobile, kiểu xem và "Ẩn mục đã bỏ qua" nằm trong bảng "Tuỳ chọn hiển thị". */
async function openTools(page: Page) {
  const toggle = page.getByRole('button', { name: 'Tuỳ chọn hiển thị' });
  if (await toggle.isVisible()) await toggle.click();
}

test('trang / chuyển sang /vi', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/vi$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('trang chủ không có link Roadmap trên nav', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Roadmap', exact: true })).toHaveCount(0);
  await expect(page.locator('.hm-card')).toHaveCount(5);
});

test('trang chủ: tìm kafka ra chủ đề SB9 và mở đúng khung chi tiết', async ({ page }) => {
  await page.goto('/vi/');
  await page.getByLabel('Tìm roadmap hoặc chủ đề').fill('kafka');
  const hit = page.getByRole('link', { name: /Kafka hoặc RabbitMQ.*Spring Boot · Cache/ });
  await expect(hit).toHaveAttribute('href', '/vi/roadmaps/spring-boot#j16.kafka-rabbitmq');
  await expect(hit.locator('mark')).toHaveText('Kafka');
  await hit.click();
  await expect(page).toHaveURL(/\/vi\/roadmaps\/spring-boot#j16\.kafka-rabbitmq$/);
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Kafka hoặc RabbitMQ', level: 2 })).toBeVisible();
});

test('trang chủ: gõ không dấu vẫn ra chủ đề có dấu, phím / đưa vào ô tìm', async ({ page }) => {
  await page.goto('/vi/');
  // Phím tắt gắn sau khi hydrate; nhấn sớm hơn thì trình duyệt chỉ gõ "/" vào trang.
  await page.waitForLoadState('networkidle');
  await page.keyboard.press('/');
  const input = page.getByLabel('Tìm roadmap hoặc chủ đề');
  await expect(input).toBeFocused();
  await page.keyboard.type('giao dich');
  await expect(page.locator('.hm-topic').first()).toContainText('Giao dịch');
  await expect(page.locator('.hm-browse')).toBeHidden();
});

test('trang chủ: không khớp thì có câu báo và gợi ý điền vào ô', async ({ page }) => {
  await page.goto('/vi/');
  const input = page.getByLabel('Tìm roadmap hoặc chủ đề');
  await input.fill('zzzz');
  await expect(page.locator('.hm-empty-t')).toHaveText('Không có roadmap hay chủ đề nào khớp "zzzz".');
  await page.locator('.hm-suggest').getByRole('button', { name: 'Docker' }).click();
  await expect(input).toHaveValue('Docker');
  await expect(page.locator('.hm-topic').first()).toBeVisible();
});

test('trang chủ chỉ có một ô tìm; trang roadmap vẫn có nút tìm trên header', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('[data-search], [data-search-full]')).toHaveCount(0);
  await page.goto('/vi/roadmaps/java');
  await expect(page.locator('[data-search], [data-search-full]').first()).toBeAttached();
});

test('trang chủ: ⌘K đưa vào ô tìm; dòng cuối mở tìm trong bài học với sẵn từ khoá', async ({ page }) => {
  await page.goto('/vi/');
  await page.waitForLoadState('networkidle');
  await page.keyboard.press('ControlOrMeta+k');
  const input = page.getByLabel('Tìm roadmap hoặc chủ đề');
  await expect(input).toBeFocused();
  await expect(page.getByRole('dialog')).toBeHidden();
  await input.fill('kafka');
  await page.getByRole('button', { name: 'Tìm "kafka" trong nội dung bài học' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('combobox').or(dialog.locator('input')).first()).toHaveValue('kafka');
});

test('trang roadmap dùng tên ngắn làm tiêu đề', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Java');
  await expect(page).toHaveTitle(/Java backend, từ nền tảng tới Senior/);
});

test('/vi/roadmaps chuyển về trang chủ', async ({ page }) => {
  await page.goto('/vi/roadmaps');
  await expect(page).toHaveURL(/\/vi\/?$/);
  await expect(page.getByLabel('Tìm roadmap hoặc chủ đề')).toBeVisible();
});

test('tích một mục, tải lại trang vẫn còn', async ({ page }) => {
  await page.goto(LESSON);
  const progress = page.getByTestId('lesson-progress');
  await expect(progress).toContainText('0/12');
  await page.locator(CHECK).check();
  await expect(progress).toContainText('1/12');
  await page.reload();
  await expect(page.locator(CHECK)).toBeChecked();
  await expect(progress).toContainText('1/12');
});

test('hai tab đồng bộ tiến độ', async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto(LESSON);
  await second.goto(LESSON);
  await first.locator(CHECK).check();
  await expect(second.locator(CHECK)).toBeChecked();
});

test('tìm kiếm không dấu ra bài có dấu', async ({ page }) => {
  await page.goto(LESSON);
  await page.waitForLoadState('networkidle');
  const trigger = page.getByRole('button', { name: 'Mở tìm kiếm' }).or(page.getByRole('button', { name: /^Tìm kiếm/ }));
  // Hộp tìm kiếm được tải chậm; bấm lại nếu lần đầu trang chưa sẵn sàng.
  await expect(async () => {
    await trigger.filter({ visible: true }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2000 });
  }).toPass();
  await page.getByRole('dialog').locator('input').first().fill('tien trinh');
  await expect(page.getByRole('dialog')).toContainText('Tiến trình, signal, systemd và journald');
});

test('hộp ⌘K chỉ tải search.json khi mở và chỉ một lần', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('search.json')) requests.push(new URL(r.url()).pathname);
  });
  await page.goto('/vi/roadmaps/java');
  await page.waitForLoadState('networkidle');
  expect(requests).toEqual([]);
  const trigger = page.getByRole('button', { name: 'Mở tìm kiếm' }).or(page.getByRole('button', { name: /^Tìm kiếm/ }));
  await expect(async () => {
    await trigger.filter({ visible: true }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2000 });
  }).toPass();
  const input = page.getByRole('dialog').locator('input').first();
  await input.fill('tien trinh');
  await expect(page.getByRole('dialog')).toContainText('Tiến trình, signal, systemd và journald');
  await input.fill('jshell');
  await expect(page.getByRole('dialog')).toContainText('Java');
  expect(requests).toEqual(['/vi/search.json']);
});

test('file search.json gọn, /api/search không còn', async ({ request }) => {
  const vi = await request.get('/vi/search.json');
  expect(vi.ok()).toBe(true);
  expect((await vi.body()).length).toBeLessThan(2 * 1024 * 1024);
  expect((await request.get('/en/search.json')).ok()).toBe(true);
  expect((await request.get('/api/search')).status()).toBe(404);
});

test('bài chưa dịch hiển thị bản tiếng Việt kèm thông báo', async ({ page }) => {
  await page.goto('/en/learn/d1/d1-1');
  await expect(page.getByTestId('untranslated-notice')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/vi\/learn\/d1\/d1-1$/);
});

const DEVOPS = '/vi/roadmaps/devops';
const PROCESS_TOPIC = 'd1.tien-trinh-signal-exit-code';
const chip = (page: Page, id: string) => page.locator(`[data-topic="${id}"]`);

test('tích mục trong bài làm chủ đề thành "đang học" và nút Học tiếp trỏ tới nó', async ({ page }) => {
  await page.goto(LESSON);
  await page.locator(CHECK).check();
  await page.goto(DEVOPS);
  await expect(chip(page, PROCESS_TOPIC)).toHaveAttribute('data-st', 'learning');
  // Chủ đề đã có bài: "Học tiếp" vào thẳng bài.
  await expect(page.getByTestId('continue')).toHaveAttribute('href', LESSON);
  await expect(chip(page, PROCESS_TOPIC).locator('.rm-chip-b')).toHaveText('Bài');
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

test('khung chi tiết: nút Tiếp, Trước chuyển chủ đề và giữ focus', async ({ page }) => {
  await page.goto('/vi/roadmaps/java#j5.generics');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Generics', level: 2 })).toBeVisible();
  await dialog.locator('[data-panel="j5.generics"] a[rel="next"]').click();
  await expect(page).toHaveURL(/#j5\.wildcard-pecs$/);
  await expect(dialog.getByRole('heading', { name: 'Wildcard và PECS', level: 2 })).toBeVisible();
  await expect(dialog.locator('[data-panel="j5.wildcard-pecs"] a[rel="next"]')).toBeFocused();
  // Trình đọc màn hình nghe tên chủ đề mới qua vùng live.
  await expect(dialog.locator('[data-live]')).toHaveText('Wildcard và PECS');
  await dialog.locator('[data-panel="j5.wildcard-pecs"] a[rel="prev"]').click();
  await expect(dialog.getByRole('heading', { name: 'Generics', level: 2 })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(chip(page, 'j5.generics')).toBeFocused();
});

test('khung chi tiết chưa có bài vẫn có hướng đi tiếp', async ({ page }) => {
  await page.goto('/vi/roadmaps/devops#d2.mo-hinh-tcp-ip');
  const panel = page.locator('[data-panel="d2.mo-hinh-tcp-ip"]');
  await expect(panel.locator('.rm-empty')).toBeVisible();
  await expect(panel.locator('a[rel="next"]')).toBeVisible();

  await page.goto('/vi/roadmaps/java#j1.jdk-lts');
  const jdk = page.locator('[data-panel="j1.jdk-lts"]');
  await expect(jdk.locator('.rm-panel-p')).toBeVisible();
  await expect(jdk.locator('.rm-res a')).toHaveCount(3);
});

test('luồng Java: Học tiếp vào bài J1.1, tích mục làm chủ đề thành đang học', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  const cta = page.getByTestId('continue');
  await expect(cta).toHaveAttribute('href', '/vi/learn/j1/j1-1');
  await cta.click();
  await expect(page).toHaveURL(/\/vi\/learn\/j1\/j1-1/);
  // Sau chuyển trang phía trình duyệt, ô tích có thể đã hiện nhưng React chưa gắn handler: chờ rồi mới bấm.
  await page.waitForFunction(() => {
    const box = document.querySelector('[data-check-id="j1.1.lab-compile-run"]');
    return box !== null && Object.keys(box).some((key) => key.startsWith('__reactProps'));
  });
  await page.locator('[data-check-id="j1.1.lab-compile-run"]').check();
  await page.goto('/vi/roadmaps/java');
  await expect(chip(page, 'j1.jdk-lts')).toHaveAttribute('data-st', 'learning');
  await expect(chip(page, 'j1.jdk-lts').locator('.rm-chip-b')).toHaveText('Bài');
});

test('nút Vào học không dời chỗ khi bắt đầu học', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  const card = page.locator('.rm-next');
  await expect(card).toHaveAttribute('data-state', 'new');
  const before = await page.getByTestId('continue').boundingBox();
  await page.goto('/vi/learn/j1/j1-1');
  await page.locator('[data-check-id="j1.1.lab-compile-run"]').check();
  await page.goto('/vi/roadmaps/java');
  await expect(card).toHaveAttribute('data-state', 'learning');
  const after = await page.getByTestId('continue').boundingBox();
  if (!before || !after) throw new Error('Không đo được nút Vào học');
  for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(after[key] - before[key])).toBeLessThan(1);
});

test('tải thẳng #step nằm trong cấp đã đánh "đã biết" vẫn mở cấp đó', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('masteva:progress:v2', JSON.stringify({ v: 2, items: {}, topics: {}, start: { java: 'middle' } }));
  });
  await page.goto('/vi/roadmaps/java#step-j5');
  await expect(page.locator('[data-level="foundation"]')).toHaveAttribute('data-known', '');
  await expect(page.locator('#step-j5')).toBeVisible();
  await expect(page.locator('#step-j5')).toBeInViewport();
});

test('đóng khung khi chủ đề bị ẩn (ẩn mục bỏ qua) không làm mất focus', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await openTools(page);
  await page.getByRole('switch', { name: 'Ẩn mục đã bỏ qua' }).check();
  await page.keyboard.press('Escape');
  await chip(page, 'j5.generics').click();
  await page.locator('[data-panel="j5.generics"]').getByRole('button', { name: 'Bỏ qua' }).click();
  await page.keyboard.press('Escape');
  // Focus rời chip vừa bị ẩn sang tiêu đề chặng sau một nhịp, nên chờ thay vì kiểm một lần.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const el = document.activeElement;
        return el !== null && el !== document.body && (el as HTMLElement).checkVisibility();
      }),
    )
    .toBe(true);
});

test('nút Sao chép nằm trong thanh tiêu đề Terminal', async ({ page }) => {
  await page.goto('/vi/learn/j1/j1-1');
  const head = page.locator('.ms-term-head').first();
  const button = page.locator('.ms-term').first().getByRole('button', { name: 'Sao chép' });
  const [h, b] = [await head.boundingBox(), await button.boundingBox()];
  expect(h && b && b.y >= h.y && b.y + b.height <= h.y + h.height + 1 && b.x + b.width <= h.x + h.width + 1).toBe(true);
});

test('mở thẳng chủ đề bằng hash, hash lạ không làm hỏng trang', async ({ page }) => {
  await page.goto('/vi/roadmaps/java#j5.generics');
  await expect(page.getByRole('heading', { name: 'Generics', level: 2 })).toBeVisible();
  await page.goto('/vi/roadmaps/java#khong-co');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.goto('/vi/roadmaps/java#step-j5');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#step-j5')).toBeInViewport();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/vi/roadmaps/java#%');
  await expect(page.getByTestId('continue')).toBeVisible();
  expect(errors).toEqual([]);
});

test('"Chưa học" thắng mục đã tích trong bài', async ({ page }) => {
  await page.goto(LESSON);
  await page.locator(CHECK).check();
  await page.goto(`${DEVOPS}#${PROCESS_TOPIC}`);
  const todo = page.locator(`[data-panel="${PROCESS_TOPIC}"]`).getByRole('button', { name: 'Chưa học' });
  await todo.click();
  await expect(chip(page, PROCESS_TOPIC)).toHaveAttribute('data-st', 'todo');
  await expect(todo).toHaveAttribute('aria-pressed', 'true');
});

test('"Tôi đã biết cấp này" thu gọn cấp, đổi nút Vào học, Hoàn tác khôi phục', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  const foundation = page.locator('section#level-foundation');
  await foundation.getByRole('button', { name: 'Tôi đã biết cấp này' }).click();
  await expect(foundation).toHaveAttribute('data-known', '');
  await expect(foundation.locator('#step-j5')).toBeHidden();
  await expect(page.locator('.rm-lvtabs a', { hasText: 'Nền tảng' })).toContainText('đã biết');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', '/vi/learn/j14/j14-1');
  await expect(foundation.getByRole('button', { name: 'Hoàn tác' })).toBeFocused();
  await foundation.getByRole('button', { name: 'Xem lại các chặng' }).click();
  await expect(foundation.locator('#step-j5')).toBeVisible();
  await expect(foundation).toHaveAttribute('data-known', '');
  await foundation.getByRole('button', { name: 'Hoàn tác' }).click();
  await expect(foundation).not.toHaveAttribute('data-known', '');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', '/vi/learn/j1/j1-1');
  // Link trỏ vào cấp đã thu gọn mở cấp đó ra.
  await page.locator('section#level-foundation').getByRole('button', { name: 'Tôi đã biết cấp này' }).click();
  await page.goto('/vi/roadmaps/java#step-j5');
  await expect(page.locator('#step-j5')).toBeInViewport();
});

test('"Tôi đã biết" ở Middle tính cả Nền tảng; Hoàn tác ở Middle chỉ mở lại Middle', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await page.locator('section#level-middle').getByRole('button', { name: 'Tôi đã biết cấp này' }).click();
  await expect(page.locator('section#level-foundation')).toHaveAttribute('data-known', '');
  await expect(page.locator('section#level-middle')).toHaveAttribute('data-known', '');
  await expect(page.locator('section#level-middle .rm-known-row')).toContainText('gồm cả Nền tảng');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', /^\/vi\/learn\/j19\//);
  await page.locator('section#level-middle').getByRole('button', { name: 'Hoàn tác' }).click();
  await expect(page.locator('section#level-foundation')).toHaveAttribute('data-known', '');
  await expect(page.locator('section#level-middle')).not.toHaveAttribute('data-known', '');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', '/vi/learn/j14/j14-1');
});

test('thanh cấp dính khi cuộn, tab cấp theo vị trí đọc, nút chọn view có vòng focus', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await page.locator('#step-j10').scrollIntoViewIfNeeded();
  const box = await page.locator('.rm-levelbar').boundingBox();
  expect(box && box.y >= 0 && box.y < 120).toBe(true);
  const tabs = page.getByRole('navigation', { name: 'Các cấp của roadmap' });
  await page.locator('#step-j18').scrollIntoViewIfNeeded();
  await expect(tabs.getByRole('link', { name: /Middle/ })).toHaveAttribute('aria-current', 'true');
  await expect(tabs.getByRole('link', { name: /Nền tảng/ })).not.toHaveAttribute('aria-current', 'true');
  await openTools(page);
  const map = page.locator('.rm-seg button').first();
  await map.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(map).toBeFocused();
  expect(await map.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('chuyển sang view danh sách và nhớ lựa chọn', async ({ page }) => {
  await page.goto('/vi/roadmaps/microservices');
  await openTools(page);
  await page.getByRole('group', { name: 'Cách xem' }).getByRole('button', { name: 'Danh sách' }).click();
  await expect(page.locator('#roadmap-microservices')).toHaveAttribute('data-view', 'list');
  await page.reload();
  await expect(page.locator('#roadmap-microservices')).toHaveAttribute('data-view', 'list');
});

test('mobile: bảng Tuỳ chọn hiển thị mở, đóng bằng Esc và khi bấm ra ngoài', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'chỉ kiểm tra trên mobile');
  await page.goto('/vi/roadmaps/java');
  const toggle = page.getByRole('button', { name: 'Tuỳ chọn hiển thị' });
  const list = page.getByRole('button', { name: 'Danh sách' });
  await expect(list).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(list).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Ẩn mục đã bỏ qua' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(list).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('.rm-next').click({ position: { x: 10, y: 10 } });
  await expect(list).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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

test('trang dự án giữ kiểu tiêu đề riêng', async ({ page }) => {
  await page.goto('/vi/projects/neobank');
  const kicker = page.getByText('Dự án xuyên suốt', { exact: true });
  expect(await kicker.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Mono');
  const h1 = page.getByRole('heading', { level: 1 });
  expect(await h1.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('800');
});

test('trang chủ: tiến độ thẻ roadmap khớp trang roadmap sau "Tôi đã biết"', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await page.locator('section#level-foundation').getByRole('button', { name: 'Tôi đã biết cấp này' }).click();
  const total = (await page.locator('.rm-next .rm-meter').innerText()).match(/\/(\d+)/)?.[1];
  await page.goto('/vi/');
  await expect(page.locator('.hm-card[href="/vi/roadmaps/java"] .rm-meter')).toContainText(`/${total}`);
});

test('trang chủ: vùng trạng thái đọc tóm tắt kết quả tìm', async ({ page }) => {
  await page.goto('/vi/');
  const status = page.getByRole('status');
  await page.getByLabel('Tìm roadmap hoặc chủ đề').fill('kafka');
  await expect(status).toHaveText(/3 chủ đề/);
  await page.getByLabel('Tìm roadmap hoặc chủ đề').fill('zzzz');
  await expect(status).toHaveText('Không có roadmap hay chủ đề nào khớp "zzzz".');
  await expect(page.locator('[aria-live="polite"]').filter({ has: page.locator('.hm-topic-list, .hm-grid') })).toHaveCount(0);
});

test('mobile: nút trên trang chủ và đầu trang roadmap cao ít nhất 44px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'chỉ kiểm tra trên mobile');
  const tooSmall = (selector: string) =>
    page.locator(selector).evaluateAll((els) => els.filter((el) => el.checkVisibility() && el.getBoundingClientRect().height < 44).map((el) => el.outerHTML.slice(0, 60)));
  await page.goto('/vi/');
  await page.getByLabel('Tìm roadmap hoặc chủ đề').fill('zzzz');
  expect(await tooSmall('.hm-suggest button')).toEqual([]);
  await page.goto('/vi/roadmaps/java');
  expect(await tooSmall('.rm-back, .rm-known-btn')).toEqual([]);
  await page.locator('section#level-foundation').getByRole('button', { name: 'Tôi đã biết cấp này' }).click();
  expect(await tooSmall('.rm-linkbtn')).toEqual([]);
  await page.getByRole('button', { name: 'Tuỳ chọn hiển thị' }).click();
  expect(await tooSmall('.rm-tools .rm-seg button, .rm-switch')).toEqual([]);
  // Bấm tab cấp thì đóng bảng tuỳ chọn.
  await page.locator('.rm-lvtabs a', { hasText: 'Middle' }).click();
  await expect(page.getByRole('button', { name: 'Danh sách' })).toBeHidden();
});

test('mobile: dòng phụ của khối tiếp tục chỉ một dòng nên nút Vào học không dời', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'chỉ kiểm tra trên mobile');
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/vi/roadmaps/microservices');
  const meta = page.locator('.rm-next-m');
  // Tên chặng dài kèm mã bài: phải giữ một dòng thay vì xuống dòng đẩy nút đi.
  await meta.evaluate((el) => {
    el.lastChild!.textContent = ' Khi nào nên dùng microservices và khi nào không · bài M1.1';
  });
  const lineHeight = await meta.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.6);
  const box = await meta.boundingBox();
  expect(box && box.height <= lineHeight * 1.2).toBe(true);
});

test('mobile: không cuộn ngang, có thanh Học tiếp ở đáy', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'chỉ kiểm tra trên mobile');
  await page.goto('/vi/roadmaps/devops');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  // Thanh ở đáy chỉ hiện khi nút "Học tiếp" chính đã cuộn khuất.
  await expect(page.locator('.rm-dock')).toBeHidden();
  await page.locator('#step-d3').scrollIntoViewIfNeeded();
  await expect(page.locator('.rm-dock')).toBeVisible();
});

test('không có lỗi truy cập nghiêm trọng, sáng và tối', async ({ page }) => {
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const url of [LESSON, '/vi', '/vi/roadmaps/java', '/vi/projects/neobank']) {
      await page.goto(url);
      expect(await seriousViolations(page), `${url} (${scheme})`).toEqual([]);
    }
  }
});

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

test('cấp Senior của Java dẫn sang Spring Boot vì lab dùng Spring', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await expect(page.locator('section#level-senior .rm-lhead')).toContainText('Spring Boot');
  await expect(page.locator('#step-j19 .rm-refs a[href="/vi/roadmaps/spring-boot#step-j11"]')).toHaveCount(1);
  await expect(page.locator('#step-j20 .rm-refs a[href="/vi/roadmaps/spring-boot#step-j12"]')).toHaveCount(1);
});

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
  // Trang chủ không có roadmap riêng nhưng vẫn phải đọc mã cũ theo bảng thay thế.
  await page.goto('/vi/');
  await expect(page.locator('.hm-card[href="/vi/roadmaps/kubernetes"] .rm-meter')).toContainText('1/');
});
