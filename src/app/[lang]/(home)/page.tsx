import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { roadmapCards } from '@/lib/content/cards';
import { listProjectViews } from '@/lib/content/manifest';
import { RoadmapCardList } from '@/components/roadmap/roadmap-cards';

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
    <main className="hm-page">
      <section className="hm-hero">
        <h1 className="hm-title">{t.app.tagline}</h1>
        <p className="rm-desc">{t.app.intro}</p>
      </section>
      <section aria-labelledby="roadmaps-title" className="hm-block">
        <h2 id="roadmaps-title" className="hm-h">
          {t.home.roadmapsTitle}
        </h2>
        <RoadmapCardList roadmaps={roadmapCards(lang)} lang={lang} showContinue />
      </section>
      <section aria-labelledby="projects-title" className="hm-block">
        <h2 id="projects-title" className="hm-h">
          {t.projects.title}
        </h2>
        <ul className="hm-projects">
          {listProjectViews(lang).map((project) => (
            <li key={project.id}>
              <a href={`/${lang}/projects/${project.id}`} className="hm-project">
                <span className="hm-project-t">{project.title}</span>
                <span className="hm-project-d">{project.summary}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="parts-title" className="hm-block">
        <h2 id="parts-title" className="hm-h">
          {t.home.partsTitle}
        </h2>
        <ol className="hm-parts">
          {t.home.parts.map((part, i) => (
            <li key={part.title}>
              <span className="hm-part-n">{i + 1}</span>
              <span className="hm-part-t">{part.title}</span>
              <span className="hm-part-d">{part.body}</span>
            </li>
          ))}
        </ol>
        <p className="hm-note">{t.home.progressNote}</p>
      </section>
    </main>
  );
}
