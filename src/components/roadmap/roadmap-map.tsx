import { format, type Messages } from '@/lib/messages';
import type { RoadmapView, StepView, TopicView } from '@/lib/content/views';

/**
 * Sơ đồ "trục giữa" (spec §6.1). Render lúc build thành danh sách có thứ tự lồng nhau;
 * CSS vẽ thành trục trên màn rộng và một cột trên mobile. Trạng thái do RoadmapClient gắn sau.
 */
export function RoadmapMap({ view, lang, t }: { view: RoadmapView; lang: string; t: Messages }) {
  return (
    <div className="rm-map">
      {view.levels.map((level) => (
        <section key={level.id} className="rm-level" data-level={level.id} aria-labelledby={`level-${level.id}`}>
          <header className="rm-level-head">
            <p className="rm-level-k">{format(t.roadmap.levelLabel, { n: level.index })}</p>
            <h2 id={`level-${level.id}`} className="rm-level-t">
              {level.title}
            </h2>
            <p className="rm-level-goal">{level.goal}</p>
            <div className="rm-level-progress">
              <span className="rm-bar" aria-hidden="true">
                <i data-bar={`level:${level.id}`} />
              </span>
              <span data-count={`level:${level.id}`} />
            </div>
            <p className="rm-level-known">
              {t.roadmap.levelKnown}{' '}
              <button type="button" data-show-level={level.id}>
                {t.roadmap.showLevel}
              </button>
            </p>
          </header>
          <ol className="rm-rail">
            {level.steps.map((step) => (
              <StepCard key={step.id} step={step} lang={lang} t={t} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function StepCard({ step, lang, t }: { step: StepView; lang: string; t: Messages }) {
  const refs = step.links.length + step.projects.length > 0;
  return (
    <li className="rm-step" id={`step-${step.id}`} data-step={step.id} data-side={step.number % 2 === 1 ? 'l' : 'r'} data-optional={step.optional || undefined}>
      <span className="rm-station" aria-hidden="true">
        {(step.code.replace(/\D/g, '') || String(step.number)).padStart(2, '0')}
      </span>
      <div className="rm-card">
        <p className="rm-here" data-here={step.id} hidden>
          {t.roadmap.here}
        </p>
        <h3 className="rm-step-t">
          <span className="rm-code">{step.code}</span> {step.title}
        </h3>
        <p className="rm-step-meta">
          {step.optional ? <span className="rm-tag">{t.roadmap.optionalStep}</span> : null}
          <span data-count={`step:${step.id}`} />
        </p>
        <ul className="rm-topics">
          {step.topics.map((topic) => (
            <TopicChip key={topic.id} topic={topic} t={t} />
          ))}
        </ul>
        {refs ? (
          <ul className="rm-refs">
            {step.links.map((link) => (
              <li key={link.id}>
                <a href={`/${lang}/roadmaps/${link.roadmapId}#step-${link.id}`}>{format(t.roadmap.seeAlso, { code: link.code, title: link.title })}</a>
              </li>
            ))}
            {step.projects.map((use) => (
              <li key={`${use.projectId}-${use.milestoneIndex}`}>
                <a href={`/${lang}/projects/${use.projectId}`}>{format(t.roadmap.usedIn, { project: use.projectTitle, n: use.milestoneIndex })}</a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function TopicChip({ topic, t }: { topic: TopicView; t: Messages }) {
  const tag = topic.kind === 'pick' ? t.roadmap.kindPick : topic.kind === 'opt' ? t.roadmap.kindOpt : null;
  return (
    <li>
      <a className="rm-chip" href={`#${topic.id}`} data-topic={topic.id} data-kind={topic.kind} data-st="todo">
        <span className="rm-dot" aria-hidden="true" />
        <span className="rm-chip-t">{topic.title}</span>
        {tag ? <span className="rm-tag">{tag}</span> : null}
        {topic.lessons.length > 0 ? (
          <>
            <span className="rm-chip-b" aria-hidden="true">
              {topic.lessons.length > 1 ? `${t.roadmap.hasLesson} ${topic.lessons.length}` : t.roadmap.hasLesson}
            </span>
            <span className="sr-only">{t.roadmap.hasLessonSr}</span>
          </>
        ) : null}
        <span className="sr-only" data-st-label>
          {`, ${t.roadmap.state.todo}`}
        </span>
      </a>
    </li>
  );
}
