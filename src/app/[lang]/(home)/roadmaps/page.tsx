import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

export async function generateMetadata(props: PageProps<'/[lang]/roadmaps'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return { title: getMessages(lang).home.allRoadmaps, robots: { index: false } };
}

/**
 * Danh mục roadmap đã chuyển về trang chủ (spec 2026-10-05 §3). Static export không có redirect
 * phía máy chủ, nên chuyển ngay trên trình duyệt; thẻ meta refresh là đường dự phòng khi tắt JavaScript.
 */
export default async function RoadmapsRedirectPage(props: PageProps<'/[lang]/roadmaps'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  // Không có dấu `/` cuối: Workers phục vụ `vi.html` ở `/vi`, còn `/vi/` lại chuyển hướng thêm một bước.
  const target = `/${lang}`;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(target)}+location.hash)` }} />
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <main className="hm">
        <p className="hm-wrap">
          <a href={target}>{getMessages(lang).home.allRoadmaps}</a>
        </p>
      </main>
    </>
  );
}
