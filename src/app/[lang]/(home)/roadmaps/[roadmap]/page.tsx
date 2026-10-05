import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage, i18n, type Language } from '@/lib/i18n';
import { format, getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { loadRoadmaps } from '@/lib/content/repo';
import { getReplacements, getRoadmapView } from '@/lib/content/manifest';
import { toLite } from '@/lib/content/views';
import { RoadmapMap } from '@/components/roadmap/roadmap-map';
import { RoadmapToolbar } from '@/components/roadmap/roadmap-toolbar';
import { RoadmapClient } from '@/components/roadmap/roadmap-client';
import { ProgressTransfer } from '@/components/progress/progress-transfer';
import { Icon } from '@/components/icons';

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => loadRoadmaps().map((r) => ({ lang, roadmap: r.id })));
}

async function resolve(props: PageProps<'/[lang]/roadmaps/[roadmap]'>) {
  const { lang, roadmap } = await props.params;
  if (!isLanguage(lang)) notFound();
  const view = getRoadmapView(roadmap, lang);
  if (!view) notFound();
  return { lang: lang as Language, view };
}

export async function generateMetadata(props: PageProps<'/[lang]/roadmaps/[roadmap]'>): Promise<Metadata> {
  const { lang, view } = await resolve(props);
  return { title: view.title, description: view.description, alternates: alternatesFor(lang, `/roadmaps/${view.id}`) };
}

export default async function RoadmapPage(props: PageProps<'/[lang]/roadmaps/[roadmap]'>) {
  const { lang, view } = await resolve(props);
  const t = getMessages(lang);
  const lite = toLite(view);
  return (
    <main className="rm-page" id={`roadmap-${view.id}`} data-track={view.track} data-view="map">
      <header>
        <a className="rm-back" href={`/${lang}`}>
          <Icon name="back" />
          {t.roadmap.allRoadmaps}
        </a>
        {/* Tên ngắn như ở trang chủ; tên đầy đủ nằm ở tiêu đề tab (metadata). */}
        <h1 className="rm-title">{t.tracks[view.track]}</h1>
        <p className="rm-desc">{view.description}</p>
        <ul className="rm-facts">
          <li>{format(t.roadmap.levels, { count: view.levels.length })}</li>
          <li>{format(t.roadmap.steps, { count: view.stepCount })}</li>
          <li>{format(t.roadmap.topics, { count: view.levels.flatMap((l) => l.steps.flatMap((s) => s.topics)).filter((tp) => tp.kind !== 'opt').length })}</li>
          <li>{format(t.roadmap.lessonFacts, { count: view.levels.flatMap((l) => l.steps).reduce((n, s) => n + s.lessons.length, 0) })}</li>
        </ul>
        {view.recommended.length > 0 ? (
          <p className="rm-recommended">
            {t.roadmap.recommended}:{' '}
            {view.recommended.map((step, i) => (
              <span key={step.id}>
                {i > 0 ? ', ' : null}
                <a href={`/${lang}/roadmaps/${step.roadmapId}#step-${step.id}`}>
                  {step.code} {step.title}
                </a>
              </span>
            ))}
          </p>
        ) : null}
        <RoadmapClient lang={lang} lite={lite} replacements={getReplacements()} />
      </header>
      <RoadmapToolbar lite={lite} levels={view.levels.map((l) => ({ id: l.id, title: l.title }))} />
      <RoadmapMap view={view} lang={lang} t={t} />
      <section className="rm-xfer" aria-labelledby="progress-transfer">
        <h2 id="progress-transfer" className="rm-xfer-t">
          {t.progress.title}
        </h2>
        <p className="rm-xfer-d">{t.progress.desc}</p>
        <ProgressTransfer />
      </section>
    </main>
  );
}
