import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { notFound } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { isLanguage } from '@/lib/i18n';

/** Bỏ các bước chưa có bài khỏi thanh bên, để người học không gặp thư mục rỗng. */
function withoutEmptyFolders(nodes: PageTree.Node[]): PageTree.Node[] {
  return nodes.flatMap((node): PageTree.Node[] => {
    if (node.type !== 'folder') return [node];
    const children = withoutEmptyFolders(node.children);
    return children.length > 0 || node.index ? [{ ...node, children }] : [];
  });
}

export default async function Layout(props: LayoutProps<'/[lang]/learn'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const tree = source.getPageTree(lang);

  return (
    <DocsLayout tree={{ ...tree, children: withoutEmptyFolders(tree.children) }} {...baseOptions(lang)}>
      {props.children}
    </DocsLayout>
  );
}
