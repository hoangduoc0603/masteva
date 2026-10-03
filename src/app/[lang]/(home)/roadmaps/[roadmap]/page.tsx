import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { i18n, isLanguage, type Language } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { loadRoadmaps } from '@/lib/content/repo';
import { getRoadmapManifest, type ManifestStep } from '@/lib/content/manifest';
import { localized } from '@/components/roadmap/roadmap-cards';
import { RoadmapSteps, type RoadmapStepView } from '@/components/roadmap/roadmap-steps';
import { ProgressTransfer } from '@/components/progress/progress-transfer';

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => loadRoadmaps().map((r) => ({ lang, roadmap: r.id })));
}

function toView(step: ManifestStep): RoadmapStepView {
  return {
    id: step.id,
    code: step.code,
    title: step.title,
    track: step.track,
    prerequisites: step.prerequisites,
    lessons: step.lessons,
  };
}

async function resolve(props: PageProps<'/[lang]/roadmaps/[roadmap]'>) {
  const { lang, roadmap: id } = await props.params;
  if (!isLanguage(lang)) notFound();
  const manifest = getRoadmapManifest(id);
  if (!manifest) notFound();
  return { lang: lang as Language, manifest };
}

export async function generateMetadata(props: PageProps<'/[lang]/roadmaps/[roadmap]'>): Promise<Metadata> {
  const { lang, manifest } = await resolve(props);
  return {
    title: localized(manifest.roadmap.title, lang),
    description: localized(manifest.roadmap.description, lang),
    alternates: alternatesFor(lang, `/roadmaps/${manifest.roadmap.id}`),
  };
}

export default async function RoadmapPage(props: PageProps<'/[lang]/roadmaps/[roadmap]'>) {
  const { lang, manifest } = await resolve(props);
  const t = getMessages(lang);
  const { roadmap } = manifest;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">{roadmap.area}</span>
        <h1 className="text-3xl font-bold tracking-tight">{localized(roadmap.title, lang)}</h1>
        <p className="max-w-3xl text-fd-muted-foreground">{localized(roadmap.description, lang)}</p>
        <ProgressTransfer />
      </header>
      <section className="flex flex-col gap-4" aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-xl font-semibold">
          {t.roadmap.stepsTitle}
        </h2>
        <RoadmapSteps
          lang={lang}
          steps={manifest.steps.map(toView)}
          optional={manifest.optional.map(toView)}
          hubs={roadmap.hubs.map((h) => ({ id: h.id, after: h.after, title: localized(h.title, lang) }))}
          replacements={manifest.replacements}
        />
      </section>
    </main>
  );
}
