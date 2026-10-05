import { i18n, isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { source, type LessonPage } from '@/lib/source';
import { getLessonContext } from '@/lib/content/manifest';
import { buildSearchFile, type SearchSourcePage } from '@/lib/search/lesson-index';

/**
 * Nội dung bài cho hộp tìm ⌘K, sinh thành file tĩnh lúc build (`/<lang>/search.json`, ADR-009).
 * Trình duyệt chỉ tải khi mở hộp tìm lần đầu và tự dựng chỉ mục.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
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

export async function GET(_request: Request, context: RouteContext<'/[lang]/search.json'>) {
  const { lang } = await context.params;
  if (!isLanguage(lang)) return new Response('Not found', { status: 404 });
  const t = getMessages(lang);
  const pages = await Promise.all(
    source.getPages(lang).map(async (page): Promise<SearchSourcePage> => {
      const ctx = getLessonContext(page.data.id, lang);
      return {
        url: page.url,
        title: page.data.title,
        description: page.data.description,
        crumbs: ctx ? [t.tracks[ctx.roadmap.track], `${ctx.step.code} ${ctx.step.title}`] : [],
        structuredData: await structuredDataOf(page),
      };
    }),
  );
  return Response.json(buildSearchFile(pages));
}
