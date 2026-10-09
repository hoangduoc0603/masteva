import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { notFound } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { isLanguage, type Language } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { format } from '@/lib/format';
import { listRoadmapViews } from '@/lib/content/manifest';
import { AccountMenu } from '@/components/account/account-menu';

/**
 * Thanh bên theo roadmap, chỉ hiện chặng đã có bài (spec §6.2). Mỗi roadmap là một thư mục gốc (`root`):
 * Fumadocs hiện ô chọn roadmap ở đầu thanh bên và chỉ hiện chặng của roadmap chứa bài đang mở.
 */
function sidebarTree(lang: Language): { tree: PageTree.Root; tabs: LayoutTab[] } {
  const t = getMessages(lang);
  const children: PageTree.Node[] = [];
  const tabs: LayoutTab[] = [];
  for (const roadmap of listRoadmapViews(lang)) {
    const folders = roadmap.levels
      .flatMap((level) => level.steps)
      .filter((step) => step.lessons.length > 0)
      .map(
        (step): PageTree.Folder => ({
          type: 'folder',
          name: (
            <>
              <span className="ms-step-code" data-track={roadmap.track}>
                {step.code}
              </span>
              <span>{step.title}</span>
            </>
          ),
          defaultOpen: true,
          children: step.lessons.map((lesson): PageTree.Item => {
            const [, stepId, slug] = lesson.path.split('/').filter(Boolean);
            const page = source.getPage([stepId, slug], lang);
            return { type: 'page', name: page?.data.title ?? lesson.title, url: `/${lang}${lesson.path}` };
          }),
        }),
      );
    if (folders.length === 0) continue;
    const lessons = folders.reduce((n, folder) => n + folder.children.length, 0);
    const root: PageTree.Folder = {
      $id: `roadmap-${roadmap.id}`,
      type: 'folder',
      root: true,
      name: t.tracks[roadmap.track],
      description: format(t.roadmap.lessonFacts, { count: lessons }),
      icon: (
        <span className="ms-tab-icon" data-track={roadmap.track} aria-hidden="true">
          {t.tracks[roadmap.track].charAt(0)}
        </span>
      ),
      children: folders,
    };
    children.push(root);
    // Fumadocs chỉ tự tạo lựa chọn khi thư mục gốc có trang con trực tiếp; ở đây chặng mới chứa bài,
    // nên khai báo tường minh: chọn roadmap thì mở bài đầu tiên của nó. `$id` để nhận ra roadmap đang mở.
    const first = folders[0].children[0];
    if (first?.type === 'page') {
      tabs.push({ title: root.name, description: root.description, icon: root.icon, url: first.url, $folder: root });
    }
  }
  return { tree: { name: 'Masteva', children }, tabs };
}

export default async function Layout(props: LayoutProps<'/[lang]/learn'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const { tree, tabs } = sidebarTree(lang);
  return (
    <DocsLayout
      tree={tree}
      tabs={tabs}
      {...baseOptions(lang)}
      // Thanh bên bài học: tài khoản nằm ở đáy (desktop và ngăn kéo mobile), không đặt ở đầu danh sách bài.
      links={[]}
      sidebar={{ footer: <AccountMenu key="account" lang={lang} variant="sidebar" /> }}
    >
      {props.children}
    </DocsLayout>
  );
}
