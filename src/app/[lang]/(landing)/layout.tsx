import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { notFound } from 'next/navigation';
import { baseOptions } from '@/lib/layout.shared';
import { isLanguage } from '@/lib/i18n';

/**
 * Bố cục riêng của trang chủ: tắt nút tìm trên header vì trang đã có ô tìm lớn, mỗi trang
 * chỉ một ô tìm (spec 2026-10-05 §4). ⌘K ở trang chủ đưa vào ô đó, xem `RoadmapSearch`.
 */
export default async function LandingLayout(props: LayoutProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return (
    <HomeLayout {...baseOptions(lang)} searchToggle={{ enabled: false }}>
      {props.children}
    </HomeLayout>
  );
}
