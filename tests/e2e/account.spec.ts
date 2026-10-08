import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

/** Khớp NEXT_PUBLIC_SUPABASE_URL của `pnpm e2e:build`. Mọi request tới đây bị chặn và trả dữ liệu giả. */
const SUPABASE = 'http://127.0.0.1:54321';
const LESSON = '/vi/learn/d1/d1-1';
const USER = { id: '11111111-1111-1111-1111-111111111111', email: 'hoc@vien.test' };

function fakeJwt(): string {
  const part = (v: object) => Buffer.from(JSON.stringify(v)).toString('base64url');
  return `${part({ alg: 'HS256', typ: 'JWT' })}.${part({ sub: USER.id, email: USER.email, role: 'authenticated', exp: 4102444800 })}.sig`;
}

const SESSION = {
  access_token: fakeJwt(),
  refresh_token: 'refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 4102444800,
  user: { id: USER.id, aud: 'authenticated', role: 'authenticated', email: USER.email, app_metadata: { provider: 'google' }, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' },
};

async function mockSupabase(page: Page, items: object[]): Promise<void> {
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' };
  await page.route(`${SUPABASE}/**`, async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (pathname === '/rest/v1/progress_items') return json(items);
    if (pathname === '/rest/v1/topic_marks' || pathname === '/rest/v1/roadmap_starts') return json([]);
    if (pathname === '/rest/v1/rpc/sync_progress') return json('2026-10-07T00:00:00+00:00');
    if (pathname === '/auth/v1/user') return json(SESSION.user);
    if (pathname === '/auth/v1/logout') return route.fulfill({ status: 204, headers: cors });
    return json({ message: `chưa giả lập ${pathname}` }, 404);
  });
}

/** Đặt phiên đã đăng nhập một lần cho cả tab (không đặt lại sau khi đăng xuất). */
async function signedIn(page: Page) {
  await page.addInitScript((session) => {
    if (sessionStorage.getItem('e2e-seeded')) return;
    localStorage.setItem('masteva:auth', JSON.stringify(session));
    sessionStorage.setItem('e2e-seeded', '1');
  }, SESSION);
}

/** Tên file chunk chứa supabase-js trong bản build (chuỗi lỗi của auth-js không bị đổi tên khi nén). */
async function supabaseChunks(): Promise<string[]> {
  const dir = 'out/_next/static/chunks';
  const names = (await fs.readdir(dir, { recursive: true })).filter((n) => n.endsWith('.js'));
  const hits: string[] = [];
  for (const name of names) {
    if ((await fs.readFile(path.join(dir, name), 'utf8')).includes('AuthSessionMissingError')) hits.push(path.basename(name));
  }
  return hits;
}

test.describe('tài khoản', () => {
  // Trên mobile nút tài khoản nằm trong menu header; luồng giống hệt, chỉ kiểm trên desktop.
  test.skip(({ isMobile }) => isMobile);

  test('khách: có nút Đăng nhập, không tải supabase-js, không gọi Supabase', async ({ page }) => {
    const chunks = await supabaseChunks();
    expect(chunks.length).toBeGreaterThan(0);
    const supabaseCalls: string[] = [];
    const scripts: string[] = [];
    page.on('request', (r) => {
      if (r.url().startsWith(SUPABASE)) supabaseCalls.push(r.url());
      if (r.resourceType() === 'script') scripts.push(path.basename(new URL(r.url()).pathname));
    });
    await page.goto('/vi/roadmaps/java');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Đăng nhập' }).filter({ visible: true })).toBeVisible();
    expect(supabaseCalls).toEqual([]);
    expect(scripts.filter((s) => chunks.includes(s))).toEqual([]);
  });

  test('đã đăng nhập: kéo tiến độ từ tài khoản, tích mục thì đẩy lên', async ({ page }) => {
    await mockSupabase(page, [
      { item_id: 'd1.1.exit-code', completed_at: '2026-10-01T10:00:00+00:00', changed_at: '2026-10-01T10:00:00+00:00', synced_at: '2026-10-01T10:00:00.123456+00:00' },
    ]);
    await signedIn(page);
    await page.goto(LESSON);
    await expect(page.locator('[data-check-id="d1.1.exit-code"]')).toBeChecked();
    const pushed = page.waitForRequest((r) => r.url() === `${SUPABASE}/rest/v1/rpc/sync_progress` && r.method() === 'POST');
    await page.locator('[data-check-id="d1.1.process-tree"]').check();
    const body = (await pushed).postDataJSON();
    expect(body.p_items).toEqual([expect.objectContaining({ item_id: 'd1.1.process-tree', completed_at: expect.any(String) })]);
  });

  test('đăng xuất: về tiến độ khách, xoá bản sao tài khoản và phiên', async ({ page }) => {
    await mockSupabase(page, [
      { item_id: 'd1.1.exit-code', completed_at: '2026-10-01T10:00:00+00:00', changed_at: '2026-10-01T10:00:00+00:00', synced_at: '2026-10-01T10:00:00+00:00' },
    ]);
    await signedIn(page);
    await page.goto('/vi/roadmaps/java');
    await page.getByRole('button', { name: `Tài khoản ${USER.email}` }).filter({ visible: true }).click();
    await page.getByRole('button', { name: 'Đăng xuất' }).click();
    await expect(page.getByRole('button', { name: 'Đăng nhập' }).filter({ visible: true })).toBeVisible();
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('masteva:account:') || k === 'masteva:auth'));
    expect(left).toEqual([]);
    await page.goto(LESSON);
    await expect(page.locator('[data-check-id="d1.1.exit-code"]')).not.toBeChecked();
  });

  test('đã đăng nhập: hiện tiến độ của tài khoản ngay, không chờ Supabase', async ({ page }) => {
    // Chunk supabase-js và Supabase đều không trả lời (mạng chậm): trang vẫn phải mở bản sao của tài khoản trên máy.
    const chunks = await supabaseChunks();
    await page.route((url) => chunks.some((c) => url.pathname.endsWith(`/${c}`)), () => {});
    await page.route(`${SUPABASE}/**`, () => {});
    await page.addInitScript(
      ({ session, userId }) => {
        if (sessionStorage.getItem('e2e-seeded')) return;
        localStorage.setItem('masteva:auth', JSON.stringify(session));
        localStorage.setItem(`masteva:account:${userId}:sync`, JSON.stringify({ v: 1, cursor: null, pending: { items: {}, topics: {}, starts: {} } }));
        localStorage.setItem(
          `masteva:account:${userId}:progress`,
          JSON.stringify({ v: 2, items: { 'd1.1.exit-code': '2026-10-01T10:00:00.000Z' }, topics: {}, start: {} }),
        );
        sessionStorage.setItem('e2e-seeded', '1');
      },
      { session: SESSION, userId: USER.id },
    );
    await page.goto(LESSON);
    await expect(page.locator('[data-check-id="d1.1.exit-code"]')).toBeChecked();
  });

  test('tab khách tải lại khi tab khác đăng nhập', async ({ context }) => {
    const guestTab = await context.newPage();
    const otherTab = await context.newPage();
    await mockSupabase(guestTab, []);
    await mockSupabase(otherTab, []);
    await guestTab.goto(LESSON);
    await otherTab.goto(LESSON);
    await expect(guestTab.getByRole('button', { name: 'Đăng nhập' }).filter({ visible: true })).toBeVisible();
    await otherTab.evaluate((session) => localStorage.setItem('masteva:auth', JSON.stringify(session)), SESSION);
    await expect(guestTab.getByRole('button', { name: `Tài khoản ${USER.email}` }).filter({ visible: true })).toBeVisible();
  });

  test('callback có lỗi thì báo và có đường về trang chủ', async ({ page }) => {
    await page.goto('/vi/auth/callback?error=access_denied');
    // Next có sẵn một vùng role=alert (route announcer), nên tìm trong <main>.
    await expect(page.getByRole('main').getByRole('alert')).toContainText('Đăng nhập không thành công');
    await expect(page.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/vi');
  });
});
