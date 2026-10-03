import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const LESSON = '/vi/learn/d1/d1-1';
const CHECK = '[data-check-id="d1.1.exit-code"]';

async function seriousViolations(page: Page) {
  // Chờ các hiệu ứng chuyển cảnh (mục lục thu gọn) chạy xong, tránh đo màu giữa chừng.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  const result = await new AxeBuilder({ page }).analyze();
  return result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

test('trang / chuyển sang /vi', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/vi$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
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

test('bài chưa dịch hiển thị bản tiếng Việt kèm thông báo', async ({ page }) => {
  await page.goto('/en/learn/d1/d1-1');
  await expect(page.getByTestId('untranslated-notice')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/vi\/learn\/d1\/d1-1$/);
});

test('xuất rồi nhập tiến độ', async ({ page }, testInfo) => {
  await page.goto(LESSON);
  await page.locator(CHECK).check();
  await page.goto('/vi/roadmaps/devops');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất tiến độ' }).click();
  const file = testInfo.outputPath('progress.json');
  await (await downloadPromise).saveAs(file);
  expect(Object.keys(JSON.parse(await fs.readFile(file, 'utf8')).items)).toContain('d1.1.exit-code');

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('progress-import').setInputFiles(file);
  await expect(page.getByRole('status')).toContainText('Đã nhập 1 mục');
  await page.goto(LESSON);
  await expect(page.locator(CHECK)).toBeChecked();
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
  await page.goto('/vi/roadmaps/java#j11.ioc-dependency-injection');
  const panel = page.locator('[data-panel="j11.ioc-dependency-injection"]');
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
  await page.locator('[data-check-id="j1.1.lab-compile-run"]').check();
  await page.goto('/vi/roadmaps/java');
  await expect(chip(page, 'j1.jdk-lts')).toHaveAttribute('data-st', 'learning');
  await expect(chip(page, 'j1.jdk-lts').locator('.rm-chip-b')).toHaveText('Bài');
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
  await page.getByLabel('Ẩn mục đã bỏ qua').check();
  await chip(page, 'j5.generics').click();
  await page.locator('[data-panel="j5.generics"]').getByRole('button', { name: 'Bỏ qua' }).click();
  await page.keyboard.press('Escape');
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return el !== null && el !== document.body && (el as HTMLElement).checkVisibility();
  });
  expect(focused).toBe(true);
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

test('"Tôi đã biết" thu gọn cấp và đổi nút Học tiếp', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await page.getByRole('group', { name: 'Tôi đã biết' }).getByRole('button', { name: 'Nền tảng', exact: true }).click();
  await expect(page.locator('[data-level="foundation"]')).toHaveAttribute('data-known', '');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', '#j11.ioc-dependency-injection');
  // Link trỏ vào cấp đã thu gọn mở cấp đó ra.
  await page.goto('/vi/roadmaps/java#step-j5');
  await expect(page.locator('#step-j5')).toBeInViewport();
});

test('thanh công cụ dính khi cuộn sơ đồ và nút chọn view có vòng focus', async ({ page }) => {
  await page.goto('/vi/roadmaps/java');
  await page.locator('#step-j10').scrollIntoViewIfNeeded();
  const box = await page.locator('.rm-toolbar').boundingBox();
  expect(box && box.y >= 0 && box.y < 120).toBe(true);
  const map = page.locator('.rm-seg button').first();
  await map.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(map).toBeFocused();
  expect(await map.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
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
  // Thanh ở đáy chỉ hiện khi nút "Học tiếp" chính đã cuộn khuất.
  await expect(page.locator('.rm-dock')).toBeHidden();
  await page.locator('#step-d3').scrollIntoViewIfNeeded();
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
