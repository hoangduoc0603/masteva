import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { roadmapCards } from '@/lib/content/cards';
import { RoadmapCardList } from '@/components/roadmap/roadmap-cards';

export async function generateMetadata(props: PageProps<'/[lang]/roadmaps'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return { title: t.roadmaps.title, description: t.roadmaps.subtitle, alternates: alternatesFor(lang, '/roadmaps') };
}

export default async function RoadmapsPage(props: PageProps<'/[lang]/roadmaps'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">{t.roadmaps.title}</h1>
        <p className="max-w-2xl text-fd-muted-foreground">{t.roadmaps.subtitle}</p>
      </header>
      <RoadmapCardList roadmaps={roadmapCards(lang)} lang={lang} />
    </main>
  );
}
