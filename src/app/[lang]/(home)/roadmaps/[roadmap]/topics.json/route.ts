import { i18n, isLanguage } from '@/lib/i18n';
import { loadRoadmaps } from '@/lib/content/repo';
import { getRoadmapView } from '@/lib/content/manifest';
import { topicDetails } from '@/lib/content/views';

/**
 * Nội dung khung chi tiết của một roadmap, sinh thành file tĩnh lúc build
 * (`/<lang>/roadmaps/<roadmap>/topics.json`). Trang roadmap chỉ tải khi mở khung lần đầu.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => loadRoadmaps().map((r) => ({ lang, roadmap: r.id })));
}

export async function GET(_request: Request, context: RouteContext<'/[lang]/roadmaps/[roadmap]/topics.json'>) {
  const { lang, roadmap } = await context.params;
  const view = isLanguage(lang) ? getRoadmapView(roadmap, lang) : undefined;
  if (!view) return new Response('Not found', { status: 404 });
  return Response.json(topicDetails(view));
}
