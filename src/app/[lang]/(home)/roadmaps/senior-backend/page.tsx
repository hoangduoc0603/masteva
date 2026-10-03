import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { i18n, isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { listRoadmapViews } from '@/lib/content/manifest';

/** Đường dẫn của roadmap chung cũ: giữ lại để link cũ không hỏng (spec §6.2). */
export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export const metadata: Metadata = { robots: { index: false } };

export default async function MovedRoadmapPage(props: PageProps<'/[lang]/roadmaps/senior-backend'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-16">
      <h1 className="text-3xl font-semibold">{t.roadmap.movedTitle}</h1>
      <p className="text-fd-muted-foreground">{t.roadmap.movedBody}</p>
      <ul className="flex flex-col gap-2">
        {listRoadmapViews(lang).map((view) => (
          <li key={view.id}>
            <a className="text-[var(--accent)] underline" href={`/${lang}/roadmaps/${view.id}`}>
              {view.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
