import { defineConfig } from 'vitest/config';
import path from 'node:path';

/** Test chạy với Supabase local (`pnpm test:db`), không nằm trong `pnpm test`. */
export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: { include: ['tests/db/**/*.test.ts'], environment: 'node', testTimeout: 30_000 },
});
