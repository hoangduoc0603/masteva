import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { catalog, roadmapCards } from '@/lib/content/cards';
import { RoadmapSearch } from '@/components/home/roadmap-search';

export async function generateMetadata(props: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return { alternates: alternatesFor(lang, '') };
}

/** Trang chủ kiêm danh mục roadmap, có tìm roadmap và chủ đề (spec 2026-10-05 §4). */
export default async function HomePage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return (
    <main className="hm">
      <div className="hm-wrap">
        <h1 className="hm-title">{t.home.title}</h1>
        <p className="hm-lead">{t.home.lead}</p>
        <RoadmapSearch index={catalog(lang)} cards={roadmapCards(lang)} lang={lang} />
      </div>
    </main>
  );
}
