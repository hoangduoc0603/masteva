'use client';
import Link from 'next/link';
import { Fragment, useMemo, useState } from 'react';
import { firstIncomplete, tally, type Progress } from '@/lib/progress/model';
import { useProgress, useReplacements } from '@/lib/progress/use-progress';
import { useMessages } from '@/components/messages-provider';
import { Bar } from '@/components/progress/progress-bar';
import { format } from '@/lib/messages';
import { TRACKS, type Track } from '@/lib/content/constants';
import { cn } from '@/lib/cn';

export interface RoadmapStepView {
  id: string;
  code: string;
  title: string;
  track: Track;
  prerequisites: string[];
  lessons: { id: string; title: string; path: string; items: string[] }[];
}

export interface RoadmapHubView {
  id: string;
  after: string;
  title: string;
}

interface Props {
  lang: string;
  steps: RoadmapStepView[];
  optional: RoadmapStepView[];
  hubs: RoadmapHubView[];
  replacements: Record<string, string>;
}

const stepItems = (step: RoadmapStepView) => step.lessons.flatMap((l) => l.items);

function isStepDone(progress: Progress, step: RoadmapStepView): boolean {
  const items = stepItems(step);
  return items.length > 0 && items.every((id) => progress.items[id]);
}

/** Danh sách bước của một roadmap (FR-ROADMAP-002…005, 007). */
export function RoadmapSteps({ lang, steps, optional, hubs, replacements }: Props) {
  useReplacements(replacements);
  const { progress } = useProgress();
  const t = useMessages();
  const [filter, setFilter] = useState<Track | 'all'>('all');

  const byId = useMemo(() => new Map([...steps, ...optional].map((s) => [s.id, s])), [steps, optional]);
  const tracks = TRACKS.filter((track) => steps.some((s) => s.track === track));
  const lessons = steps.flatMap((s) => s.lessons);
  const next = firstIncomplete(progress, lessons, (l) => l.items);
  const started = lessons.some((l) => l.items.some((id) => progress.items[id]));

  const row = (step: RoadmapStepView, index: number | null) => {
    const { done, total } = tally(progress, stepItems(step));
    const first = step.lessons[0];
    const missing = step.prerequisites
      .map((id) => byId.get(id))
      .filter((p): p is RoadmapStepView => Boolean(p) && stepItems(p!).length > 0 && !isStepDone(progress, p!));
    return (
      <li
        key={step.id}
        className={cn('roadmap-step', filter !== 'all' && step.track !== filter && 'hidden')}
        data-track={step.track}
        data-full={total > 0 && done === total ? '' : undefined}
      >
        <span className="roadmap-step-no">{index === null ? '+' : String(index).padStart(2, '0')}</span>
        <span className="roadmap-step-code" data-track={step.track}>
          {step.code}
        </span>
        <span className="roadmap-step-title">
          {first ? (
            <Link href={`/${lang}${first.path}`}>{step.title}</Link>
          ) : (
            <span className="text-fd-muted-foreground">{step.title}</span>
          )}
          <small>
            {t.tracks[step.track]}
            {' · '}
            {first ? format(t.roadmap.lessons, { count: step.lessons.length }) : t.roadmap.comingSoon}
          </small>
          {first && missing.length > 0 ? (
            <small className="text-fd-warning">
              {format(t.roadmap.prereqWarning, { steps: missing.map((m) => m.code).join(', ') })}
            </small>
          ) : null}
        </span>
        <span className="roadmap-step-progress">
          {total > 0 ? (
            <>
              <Bar done={done} total={total} label={`${step.code}: ${done}/${total}`} className="flex-1" />
              <span className="tabular-nums">
                {done}/{total}
              </span>
            </>
          ) : null}
        </span>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {next ? (
          <Link href={`/${lang}${next.path}`} className="roadmap-cta" data-testid="continue">
            {started ? t.roadmap.continue : t.roadmap.start} → {next.title}
          </Link>
        ) : null}
        <div className="ms-auto flex flex-wrap gap-1.5" role="group" aria-label={t.roadmap.stepsTitle}>
          {(['all', ...tracks] as const).map((track) => (
            <button
              key={track}
              type="button"
              className="roadmap-filter"
              aria-pressed={filter === track}
              onClick={() => setFilter(track)}
            >
              {track === 'all' ? t.roadmap.allTracks : t.tracks[track]}
            </button>
          ))}
        </div>
      </div>

      <ol className="roadmap-steps">
        {steps.map((step, i) => (
          <Fragment key={step.id}>
            {row(step, i + 1)}
            {hubs
              .filter((hub) => hub.after === step.id)
              .map((hub) => (
                <li key={hub.id} className={cn('roadmap-hub', filter !== 'all' && 'hidden')}>
                  <span aria-hidden className="roadmap-hub-mark" />
                  <span>
                    {t.roadmap.hub} {hub.id} · {hub.title}
                  </span>
                </li>
              ))}
          </Fragment>
        ))}
        {optional.length > 0 ? <li className="roadmap-section">{t.roadmap.optional}</li> : null}
        {optional.map((step) => row(step, null))}
      </ol>
    </div>
  );
}
