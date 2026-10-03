'use client';
import type { RoadmapCardData } from '@/lib/content/views';
import { format } from '@/lib/format';
import { useProgress } from '@/lib/progress/use-progress';
import { currentTopic, nextTopic, tallyTopics, topicState } from '@/lib/progress/roadmap';
import { useMessages } from '@/components/messages-provider';

/** Danh sách thẻ roadmap kèm tiến độ theo cấp; trang chủ bật thêm khối "Bạn đang học". */
export function RoadmapCardList({ roadmaps, lang, showContinue = false }: { roadmaps: RoadmapCardData[]; lang: string; showContinue?: boolean }) {
  const { progress } = useProgress();
  const t = useMessages();
  const current = showContinue ? currentTopic(progress, roadmaps.map((r) => r.lite)) : undefined;

  return (
    <div className="flex flex-col gap-8">
      {showContinue ? (
        <section className="rc-continue" aria-labelledby="learning-now">
          <h2 id="learning-now" className="rc-continue-k">
            {t.home.learningNow}
          </h2>
          {current ? (
            <a className="rc-continue-link" href={`/${lang}/roadmaps/${current.roadmap.id}#${current.topic.id}`}>
              <span className="rc-continue-code">
                {current.roadmap.title}, {current.step.code}
              </span>
              <span className="rc-continue-t">{current.topic.title}</span>
            </a>
          ) : (
            <p className="rc-muted">{t.home.pickRoadmap}</p>
          )}
        </section>
      ) : null}
      <ul className="rc-list">
        {roadmaps.map((roadmap) => {
          const next = nextTopic(progress, roadmap.lite);
          const core = roadmap.lite.levels.flatMap((l) => l.steps.flatMap((st) => st.topics)).filter((tp) => tp.kind !== 'opt').length;
          // Giống trang roadmap: đã bắt đầu khi có chủ đề nào khác "chưa học", kể cả do tích mục trong bài.
          const started = roadmap.lite.levels.some((l) => l.steps.some((st) => st.topics.some((tp) => topicState(progress, tp) !== 'todo')));
          return (
            <li key={roadmap.id} className="rc-card" data-track={roadmap.track}>
              <p className="rm-kicker">{format(t.roadmap.kicker, { track: t.tracks[roadmap.track] })}</p>
              <h3 className="rc-title">
                <a href={`/${lang}/roadmaps/${roadmap.id}`}>{roadmap.title}</a>
              </h3>
              <p className="rc-desc">{roadmap.description}</p>
              <ul className="rc-levels">
                {roadmap.levels.map((level) => {
                  const lite = roadmap.lite.levels.find((l) => l.id === level.id);
                  const tally = tallyTopics(progress, lite?.steps.flatMap((s) => s.topics) ?? []);
                  return (
                    <li key={level.id}>
                      <span>{level.title}</span>
                      <span className="rm-bar">
                        <i style={{ transform: `scaleX(${tally.total ? tally.done / tally.total : 0})` }} />
                      </span>
                      <span className="rc-count">
                        {tally.done}/{tally.total}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="rc-facts">
                {format(t.roadmap.steps, { count: roadmap.stepCount })}, {format(t.roadmap.topics, { count: core })}
              </p>
              <a
                className="rm-cta"
                href={
                  started && next?.topic.lesson ? `/${lang}${next.topic.lesson}` : `/${lang}/roadmaps/${roadmap.id}${started && next ? `#${next.topic.id}` : ''}`
                }
              >
                {started ? t.roadmaps.continue : t.roadmaps.open}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
