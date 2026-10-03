'use client';
import { Fragment } from 'react';
import { format } from '@/lib/format';
import type { Progress } from '@/lib/progress/model';
import { topicState } from '@/lib/progress/roadmap';
import type { TopicDetail, TopicRef } from '@/lib/content/views';
import { useMessages } from '@/components/messages-provider';

const MARKS = ['todo', 'learning', 'done', 'skipped'] as const;

/**
 * Khung chi tiết chủ đề (spec §6.1 mục 5, thiết kế `design/topic-drawer.html`).
 * Chỉ render chủ đề đang mở, từ file JSON tĩnh `topics.json` của roadmap (tải khi mở lần đầu),
 * để HTML trang roadmap không phải chở nội dung của mọi chủ đề. RoadmapClient mở `<dialog>`
 * và xử lý click (đánh dấu, Trước/Tiếp) qua thuộc tính `data-*`.
 */
export function TopicDrawer({
  activeId,
  detail,
  failed,
  progress,
  roadmapId,
  lang,
}: {
  activeId: string | null;
  detail: TopicDetail | undefined;
  failed: boolean;
  progress: Progress;
  roadmapId: string;
  lang: string;
}) {
  const t = useMessages();
  return (
    <dialog className="rm-drawer" data-drawer aria-labelledby={activeId ? `t-${activeId}` : undefined}>
      <div className="rm-drawer-bar">
        <button type="button" className="rm-close" data-close>
          {t.roadmap.close}
        </button>
      </div>
      <p className="sr-only" aria-live="polite" data-live />
      {activeId && detail ? (
        <TopicPanel key={detail.id} topic={detail} progress={progress} roadmapId={roadmapId} lang={lang} />
      ) : activeId ? (
        <section className="rm-panel" aria-busy={!failed}>
          <p className="rm-muted" role="status">
            {failed ? t.roadmap.loadFailed : t.roadmap.loading}
          </p>
        </section>
      ) : null}
    </dialog>
  );
}

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={back ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}

function topicHref(ref: TopicRef, roadmapId: string, lang: string) {
  return ref.roadmapId === roadmapId ? `#${ref.id}` : `/${lang}/roadmaps/${ref.roadmapId}#${ref.id}`;
}

function TopicPanel({ topic, progress, roadmapId, lang }: { topic: TopicDetail; progress: Progress; roadmapId: string; lang: string }) {
  const t = useMessages();
  const kind = topic.kind === 'pick' ? t.roadmap.kindPick : topic.kind === 'opt' ? t.roadmap.kindOpt : null;
  const state = topicState(progress, topic);
  return (
    <section className="rm-panel" data-panel={topic.id} aria-labelledby={`t-${topic.id}`}>
      <h2 id={`t-${topic.id}`} className="rm-panel-t" tabIndex={-1}>
        {topic.title}
      </h2>
      <p className="rm-panel-meta">
        <b>{topic.step.code}</b> {topic.step.title} · {format(t.roadmap.topicMeta, { level: topic.level, index: topic.position.index, count: topic.position.count })}
        {kind ? ` · ${kind.toLowerCase()}` : null}
      </p>
      {topic.summary ? <p className="rm-panel-p">{topic.summary}</p> : null}
      <div className="rm-status" role="group" aria-label={t.roadmap.status}>
        {MARKS.map((mark) => (
          <button key={mark} type="button" data-mark={mark} aria-pressed={state === mark}>
            {t.roadmap.mark[mark]}
          </button>
        ))}
      </div>
      <h3 className="rm-panel-h">{t.roadmap.lessons}</h3>
      {topic.lessons.length > 0 ? (
        <ul className="rm-lessons">
          {topic.lessons.map((lesson) => (
            <li key={lesson.id}>
              <a className="rm-lesson" href={`/${lang}${lesson.path}`}>
                <span className="rm-lesson-t">{lesson.title}</span>
                <span className="rm-lesson-n">
                  {format(t.roadmap.itemCount, { done: lesson.items.filter((id) => progress.items[id]).length, total: lesson.items.length })}
                </span>
                <Chevron />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rm-empty">
          <p className="rm-empty-t">{t.roadmap.lessonSoon}</p>
          <p className="rm-empty-d">{topic.resources.length > 0 ? t.roadmap.lessonSoonWithResources : t.roadmap.lessonSoonBare}</p>
        </div>
      )}
      {topic.resources.length > 0 ? (
        <>
          <h3 className="rm-panel-h">{t.roadmap.resources}</h3>
          <ul className="rm-res">
            {topic.resources.map((r) => (
              <li key={r.url}>
                <a href={r.url} rel="noopener">
                  <span className="rm-res-t">{r.title}</span>
                  <span className="rm-res-host">{new URL(r.url).hostname}</span>
                  {r.note ? <span className="rm-res-note">{r.note}</span> : null}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {topic.requires.length > 0 ? (
        <>
          <h3 className="rm-panel-h">{t.roadmap.requires}</h3>
          <p className="rm-panel-l">
            {topic.requires.map((ref, i) => (
              <Fragment key={ref.id}>
                {i > 0 ? ', ' : null}
                <a href={topicHref(ref, roadmapId, lang)}>{ref.title}</a>
              </Fragment>
            ))}
          </p>
        </>
      ) : null}
      {topic.projects.length > 0 ? (
        <>
          <h3 className="rm-panel-h">{t.roadmap.projects}</h3>
          <ul>
            {topic.projects.map((use) => (
              <li key={`${use.projectId}-${use.milestoneIndex}`}>
                <a href={`/${lang}/projects/${use.projectId}`}>
                  {use.projectTitle}: {use.milestoneTitle}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="rm-panel-end" />
      {topic.prev || topic.next ? (
        <nav className="rm-panel-nav" aria-label={t.roadmap.topicNav}>
          {topic.prev ? (
            <a href={`#${topic.prev.id}`} rel="prev">
              <Chevron back />
              <span>
                <small>{t.roadmap.prevTopic}</small>
                <span className="rm-panel-nav-t">{topic.prev.title}</span>
              </span>
            </a>
          ) : null}
          {topic.next ? (
            <a href={`#${topic.next.id}`} rel="next">
              <span>
                <small>{t.roadmap.nextTopic}</small>
                <span className="rm-panel-nav-t">{topic.next.title}</span>
              </span>
              <Chevron />
            </a>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
