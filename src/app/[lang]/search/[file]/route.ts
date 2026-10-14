import { i18n, isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { source, type LessonPage } from '@/lib/source';
import { getLessonContext, getSearchFileSteps, getSearchScope } from '@/lib/content/manifest';
import { buildSearchFile, type SearchSourcePage } from '@/lib/search/lesson-index';

/**
 * Nội dung bài cho hộp tìm ⌘K, sinh thành file tĩnh lúc build: mỗi roadmap một hoặc vài file
 * (`/<lang>/search/<roadmap>-<n>.json`, tối đa 30 bài mỗi file, ADR-009). Trình duyệt chỉ tải khi tìm lần đầu
 * và tự dựng chỉ mục.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => getSearchScope().files.map((id) => ({ lang, file: `${id}.json` })));
}

type StructuredData = SearchSourcePage['structuredData'];

/** Cùng cách đọc như `buildIndexDefault` của Fumadocs: giá trị, hàm, hoặc qua `load()`. */
async function structuredDataOf(page: LessonPage): Promise<StructuredData> {
  const data: unknown = page.data;
  if (typeof data === 'object' && data !== null) {
    if ('structuredData' in data) {
      const value = data.structuredData;
      return (typeof value === 'function' ? await value() : value) as StructuredData;
    }
    if ('load' in data && typeof data.load === 'function') return ((await data.load()) as { structuredData: StructuredData }).structuredData;
  }
  throw new Error(`Không đọc được nội dung để tìm của trang ${page.url}`);
}

export async function GET(_request: Request, context: RouteContext<'/[lang]/search/[file]'>) {
  const { lang, file } = await context.params;
  const steps = getSearchFileSteps(file.replace(/\.json$/, ''));
  if (!isLanguage(lang) || !steps) return new Response('Not found', { status: 404 });
  const t = getMessages(lang);
  const pages: SearchSourcePage[] = [];
  for (const page of source.getPages(lang)) {
    // Mọi chặng thuộc đúng một roadmap (`content:check` kiểm), nên bài nào cũng có ngữ cảnh.
    const ctx = getLessonContext(page.data.id, lang);
    if (!ctx || !steps.has(ctx.step.id)) continue;
    pages.push({
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      crumbs: [t.tracks[ctx.roadmap.track], `${ctx.step.code} ${ctx.step.title}`],
      structuredData: await structuredDataOf(page),
    });
  }
  return Response.json(buildSearchFile(pages));
}
