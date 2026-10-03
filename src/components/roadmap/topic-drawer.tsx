import { Fragment } from 'react';
import { format, type Messages } from '@/lib/messages';
import type { LevelView, RoadmapView, StepView, TopicRef, TopicView } from '@/lib/content/views';

const MARKS = ['todo', 'learning', 'done', 'skipped'] as const;

/**
 * Khung chi tiết chủ đề (spec §6.1 mục 5, thiết kế `design/topic-drawer.html`). Mọi panel render sẵn và ẩn;
 * RoadmapClient mở `<dialog>` và hiện đúng panel theo hash `#<mã chủ đề>`.
 */
export function TopicDrawer({ view, lang, t }: { view: RoadmapView; lang: string; t: Messages }) {
  return (
    <dialog className="rm-drawer" data-drawer>
      <div className="rm-drawer-bar">
        <button type="button" className="rm-close" data-close>
          {t.roadmap.close}
        </button>
      </div>
      <p className="sr-only" aria-live="polite" data-live />
      {view.levels.flatMap((level) =>
        level.steps.flatMap((step) =>
          step.topics.map((topic) => (
            <TopicPanel key={topic.id} topic={topic} step={step} level={level} roadmapId={view.id} lang={lang} t={t} />
          )),
        ),
      )}
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

function TopicPanel({
  topic,
  step,
  level,
  roadmapId,
  lang,
  t,
}: {
  topic: TopicView;
  step: StepView;
  level: LevelView;
  roadmapId: string;
  lang: string;
  t: Messages;
}) {
  const kind = topic.kind === 'pick' ? t.roadmap.kindPick : topic.kind === 'opt' ? t.roadmap.kindOpt : null;
  return (
    <section className="rm-panel" data-panel={topic.id} aria-labelledby={`t-${topic.id}`} hidden>
      <h2 id={`t-${topic.id}`} className="rm-panel-t" tabIndex={-1}>
        {topic.title}
      </h2>
      <p className="rm-panel-meta">
        <b>{step.code}</b> {step.title} · {format(t.roadmap.topicMeta, { level: level.title, index: topic.position.index, count: topic.position.count })}
        {kind ? ` · ${kind.toLowerCase()}` : null}
      </p>
      {topic.summary ? <p className="rm-panel-p">{topic.summary}</p> : null}
      <div className="rm-status" role="group" aria-label={t.roadmap.status}>
        {MARKS.map((mark) => (
          <button key={mark} type="button" data-mark={mark} aria-pressed="false">
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
                <span className="rm-lesson-n" data-items={lesson.items.join(' ')} />
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
