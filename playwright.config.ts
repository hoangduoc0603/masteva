import { defineConfig, devices } from '@playwright/test';

const PORT = 4174;

/**
 * E2E chạy trên bản static export trong `out/`, build với MASTEVA_LOCALES=vi,en
 * (lệnh `pnpm e2e`) để kiểm tra cả trang chưa dịch.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm exec serve out -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}/vi`,
    reuseExistingServer: !process.env.CI,
  },
});
