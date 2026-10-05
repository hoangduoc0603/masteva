import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { i18n, isLanguage } from '@/lib/i18n';
import { format, getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { loadProjects } from '@/lib/content/repo';
import { getProjectView } from '@/lib/content/manifest';
import { MilestoneProgress } from '@/components/project/milestone-progress';

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => loadProjects().map((p) => ({ lang, project: p.id })));
}

async function resolve(props: PageProps<'/[lang]/projects/[project]'>) {
  const { lang, project } = await props.params;
  if (!isLanguage(lang)) notFound();
  const view = getProjectView(project, lang);
  if (!view) notFound();
  return { lang, view };
}

export async function generateMetadata(props: PageProps<'/[lang]/projects/[project]'>): Promise<Metadata> {
  const { lang, view } = await resolve(props);
  return { title: view.title, description: view.summary, alternates: alternatesFor(lang, `/projects/${view.id}`) };
}

export default async function ProjectPage(props: PageProps<'/[lang]/projects/[project]'>) {
  const { lang, view } = await resolve(props);
  const t = getMessages(lang);
  return (
    <main className="pj-page">
      <p className="pj-kicker">{t.projects.title}</p>
      <h1 className="pj-title">{view.title}</h1>
      <p className="pj-desc">{view.summary}</p>
      <ol className="pj-milestones">
        {view.milestones.map((m) => (
          <li key={m.id} className="pj-milestone">
            <p className="pj-k">{format(t.projects.milestone, { n: m.index })}</p>
            <h2 className="pj-t">{m.title}</h2>
            <MilestoneProgress topics={m.needs.flatMap((n) => n.topics)} />
            <p className="pj-needs-h">{t.projects.needs}</p>
            <ul className="pj-needs">
              {m.needs.map((need) => (
                <li key={need.id}>
                  <a href={`/${lang}/roadmaps/${need.roadmapId}#${need.kind === 'step' ? `step-${need.id}` : need.id}`}>
                    <span className="rm-code">{need.code}</span> {need.title}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}
