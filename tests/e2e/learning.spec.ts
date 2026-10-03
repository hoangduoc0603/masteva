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

test('tiến độ hiện trên trang roadmap và nút Học tiếp trỏ tới bài', async ({ page }) => {
  await page.goto(LESSON);
  await page.locator(CHECK).check();
  await page.goto('/vi/roadmaps/senior-backend');
  await expect(page.locator('.roadmap-step[data-track="devops"]').filter({ hasText: 'Linux' })).toContainText('1/12');
  await expect(page.getByTestId('continue')).toHaveAttribute('href', LESSON);
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
  await page.goto('/vi/roadmaps/senior-backend');
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

test('không có lỗi truy cập nghiêm trọng', async ({ page }) => {
  for (const url of [LESSON, '/vi/roadmaps/senior-backend', '/vi']) {
    await page.goto(url);
    expect(await seriousViolations(page), url).toEqual([]);
  }
});
