'use client';
import type { RoadmapCardData } from '@/lib/content/views';
import { format } from '@/lib/format';
import { useProgress } from '@/lib/progress/use-progress';
import { currentTopic, roadmapTally, topicState } from '@/lib/progress/roadmap';
import { useMessages } from '@/components/messages-provider';
import { Icon } from '@/components/icons';

function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div className="rm-meter">
      <span className="rm-bar" aria-hidden="true">
        <i style={{ transform: `scaleX(${value})` }} />
      </span>
      <span>{label}</span>
    </div>
  );
}

const allTopics = (roadmap: RoadmapCardData['lite']) => roadmap.levels.flatMap((l) => l.steps.flatMap((s) => s.topics));

/** Khối "Đang học" của trang chủ: chỉ hiện khi đã có chủ đề đang học ở một roadmap nào đó. */
export function LearningNow({ roadmaps, lang }: { roadmaps: RoadmapCardData[]; lang: string }) {
  const { progress } = useProgress();
  const t = useMessages();
  const current = currentTopic(
    progress,
    roadmaps.map((r) => r.lite),
  );
  if (!current) return null;
  const card = roadmaps.find((r) => r.id === current.roadmap.id);
  // Như trang roadmap: chủ đề ở cấp đã biết không tính vào tiến độ.
  const tally = roadmapTally(progress, current.roadmap);
  const href = current.topic.lesson ? `/${lang}${current.topic.lesson}` : `/${lang}/roadmaps/${current.roadmap.id}#${current.topic.id}`;
  return (
    <section className="hm-section" aria-labelledby="learning-now">
      <h2 id="learning-now" className="hm-h">
        {t.home.learningNow}
      </h2>
      <div className="hm-now" data-track={card?.track}>
        <p className="hm-now-meta">
          <b>{current.step.code}</b> {current.step.title} · {card ? t.tracks[card.track] : current.roadmap.title}
        </p>
        <p className="hm-now-t">{current.topic.title}</p>
        <Meter value={tally.total ? tally.done / tally.total : 0} label={format(t.roadmap.doneCount, { done: tally.done, total: tally.total })} />
        <a className="rm-btn" href={href}>
          {t.roadmaps.continue} <Icon name="arrow" />
        </a>
      </div>
    </section>
  );
}

/** Lưới thẻ roadmap; cả thẻ là một link tới trang roadmap. */
export function RoadmapGrid({ roadmaps, lang }: { roadmaps: RoadmapCardData[]; lang: string }) {
  const { progress } = useProgress();
  const t = useMessages();
  return (
    <ul className="hm-grid">
      {roadmaps.map((roadmap) => {
        const topics = allTopics(roadmap.lite);
        const core = topics.filter((tp) => tp.kind !== 'opt').length;
        const tally = roadmapTally(progress, roadmap.lite);
        // Giống trang roadmap: đã bắt đầu khi có chủ đề nào khác "chưa học", kể cả do tích mục trong bài.
        const started = topics.some((tp) => topicState(progress, tp) !== 'todo');
        const letter = roadmap.lite.levels[0]?.steps[0]?.code.charAt(0) ?? '';
        return (
          <li key={roadmap.id}>
            <a className="hm-card" href={`/${lang}/roadmaps/${roadmap.id}`} data-track={roadmap.track}>
              <div className="hm-card-top">
                <span className="hm-mark" aria-hidden="true">
                  {letter}
                </span>
                {/* Tên ngắn theo track ("Java"); tên đầy đủ vẫn là tiêu đề trang roadmap. */}
                <h3 className="hm-card-t">{t.tracks[roadmap.track]}</h3>
              </div>
              <p className="hm-card-d">{roadmap.description}</p>
              <p className="hm-card-facts">
                {format(t.roadmap.levels, { count: roadmap.levels.length })} · {format(t.roadmap.steps, { count: roadmap.stepCount })} ·{' '}
                {format(t.roadmap.topics, { count: core })}
              </p>
              <div className="hm-card-foot">
                <Meter value={tally.total ? tally.done / tally.total : 0} label={`${tally.done}/${tally.total}`} />
                <span className="hm-card-go">{started ? t.roadmaps.continue : t.roadmaps.open}</span>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
