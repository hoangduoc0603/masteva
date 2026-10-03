import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { RoadmapCards } from '@/components/roadmap/roadmap-cards';

export async function generateMetadata(props: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return { alternates: alternatesFor(lang, '') };
}

export default async function HomePage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-16">
      <section className="flex flex-col gap-4">
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">{t.app.tagline}</h1>
        <p className="max-w-2xl text-pretty text-lg text-fd-muted-foreground">{t.app.intro}</p>
        <div>
          <Link href={`/${lang}/roadmaps`} className="roadmap-cta">
            {t.app.browseRoadmaps} →
          </Link>
        </div>
      </section>
      <RoadmapCards lang={lang} />
    </main>
  );
}
