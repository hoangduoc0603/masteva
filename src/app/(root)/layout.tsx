import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masteva',
  robots: { index: false },
};

/** Layout riêng của trang `/`, trang này chỉ chuyển hướng sang ngôn ngữ phù hợp. */
export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
