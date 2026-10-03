import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  env: {
    // Đưa danh sách ngôn ngữ vào bundle phía trình duyệt (xem src/lib/i18n.ts).
    MASTEVA_LOCALES: process.env.MASTEVA_LOCALES ?? 'vi',
  },
};

export default withMDX(config);
