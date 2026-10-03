import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Callout } from 'fumadocs-ui/components/callout';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { source, learnRoute } from '@/lib/source';
import { DEFAULT_LANGUAGE, i18n, isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { alternatesFor } from '@/lib/site';
import { getLessonContext, getLessonItems, getLessonSourceHash, getReplacements, hasTranslation } from '@/lib/content/manifest';
import { getMDXComponents } from '@/components/mdx';
import { sectionToc } from '@/components/lesson/sections';
import { LessonStatusBadge } from '@/components/lesson/lesson-meta';
import { LessonProgress } from '@/components/progress/progress-bar';

export const dynamicParams = false;

/** Mọi bài ở mọi ngôn ngữ đang bật; bài chưa dịch dùng bản tiếng Việt (FR-I18N-004). */
export function generateStaticParams() {
  return i18n.languages.flatMap((lang) =>
    source.getPages(DEFAULT_LANGUAGE).map((page) => ({ lang, slug: page.slugs })),
  );
}

async function resolve(props: PageProps<'/[lang]/learn/[[...slug]]'>) {
  const { lang, slug } = await props.params;
  if (!isLanguage(lang)) notFound();
  const page = source.getPage(slug, lang) ?? source.getPage(slug, DEFAULT_LANGUAGE);
  if (!page) notFound();
  // `fallbackLanguage` của Fumadocs trả về trang tiếng Việt khi chưa có bản dịch,
  // nên phải kiểm tra file bản dịch để biết đang hiển thị bản gốc.
  const [stepId, lessonSlug] = page.slugs;
  const showingFallback = lang !== DEFAULT_LANGUAGE && !hasTranslation(stepId, lessonSlug, lang);
  return { lang, page, showingFallback };
}

export async function generateMetadata(props: PageProps<'/[lang]/learn/[[...slug]]'>): Promise<Metadata> {
  const { lang, page, showingFallback } = await resolve(props);
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: alternatesFor(lang, `${learnRoute}/${page.slugs.join('/')}`, showingFallback),
  };
}

export default async function LessonPage(props: PageProps<'/[lang]/learn/[[...slug]]'>) {
  const { lang, page, showingFallback } = await resolve(props);
  const t = getMessages(lang);
  const MDX = page.data.body;
  const [stepId, slug] = page.slugs;
  const sourceHash = getLessonSourceHash(stepId, slug);
  const context = getLessonContext(page.data.id, lang);
  const staleTranslation = !showingFallback && lang !== DEFAULT_LANGUAGE && page.data.source !== sourceHash;

  return (
    <DocsPage toc={sectionToc(t)} breadcrumb={{ enabled: false }}>
      {context ? (
        <nav className="ls-crumb" aria-label={t.lesson.breadcrumb}>
          <a href={`/${lang}/roadmaps/${context.roadmap.id}`}>{context.roadmap.title}</a>
          <span aria-hidden="true">/</span>
          <a href={`/${lang}/roadmaps/${context.roadmap.id}#step-${context.step.id}`}>
            {context.step.code} {context.step.title}
          </a>
        </nav>
      ) : null}
      <DocsTitle className="ms-title">{page.data.title}</DocsTitle>
      <DocsDescription className="ms-lede mb-0">{page.data.description}</DocsDescription>
      <div className="ms-head flex flex-col gap-3">
        <LessonStatusBadge
          t={t}
          status={page.data.status}
          verified={page.data.verified}
          outdatedNote={page.data.outdatedNote}
        />
        {context && context.topics.length > 0 ? (
          <div className="ls-topics">
            <span className="ls-topics-k">{t.lesson.topics}</span>
            <ul>
              {context.topics.map((topic) => (
                <li key={topic.id}>
                  <a href={`/${lang}/roadmaps/${topic.roadmapId}#${topic.id}`}>{topic.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {showingFallback ? (
          <Callout type="info" data-testid="untranslated-notice">
            {t.lesson.untranslated}
          </Callout>
        ) : null}
        {staleTranslation ? <Callout type="warning">{t.lesson.staleTranslation}</Callout> : null}
        <LessonProgress items={getLessonItems(page.data.id)} replacements={getReplacements()} />
      </div>
      <DocsBody className="ms-lesson">
        <MDX components={getMDXComponents(t, { a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  );
}
