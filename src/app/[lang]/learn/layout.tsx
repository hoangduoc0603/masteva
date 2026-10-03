import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { notFound } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { isLanguage } from '@/lib/i18n';
import { listRoadmapViews } from '@/lib/content/manifest';

/** Thanh bên theo roadmap: mỗi roadmap là một nhóm, chỉ hiện chặng đã có bài (spec §6.2). */
function sidebarTree(lang: string): PageTree.Root {
  const children: PageTree.Node[] = [];
  for (const roadmap of listRoadmapViews(lang)) {
    const folders = roadmap.levels
      .flatMap((level) => level.steps)
      .filter((step) => step.lessons.length > 0)
      .map(
        (step): PageTree.Folder => ({
          type: 'folder',
          name: `${step.code} ${step.title}`,
          defaultOpen: true,
          children: step.lessons.map((lesson): PageTree.Item => {
            const [, stepId, slug] = lesson.path.split('/').filter(Boolean);
            const page = source.getPage([stepId, slug], lang);
            return { type: 'page', name: page?.data.title ?? lesson.title, url: `/${lang}${lesson.path}` };
          }),
        }),
      );
    if (folders.length > 0) children.push({ type: 'separator', name: roadmap.title }, ...folders);
  }
  return { name: 'Masteva', children };
}

export default async function Layout(props: LayoutProps<'/[lang]/learn'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return (
    <DocsLayout tree={sidebarTree(lang)} {...baseOptions(lang)}>
      {props.children}
    </DocsLayout>
  );
}
