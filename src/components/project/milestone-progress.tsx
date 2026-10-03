'use client';
import { format } from '@/lib/format';
import { useProgress } from '@/lib/progress/use-progress';
import { tallyTopics, type LiteTopic } from '@/lib/progress/roadmap';
import { useMessages } from '@/components/messages-provider';

/** "k/n chủ đề chính" của một mốc dự án, tính từ chủ đề của các chặng cần học. */
export function MilestoneProgress({ topics }: { topics: LiteTopic[] }) {
  const { progress } = useProgress();
  const t = useMessages();
  const tally = tallyTopics(progress, topics);
  return <span className="pj-count">{format(t.projects.progress, { done: tally.done, total: tally.total })}</span>;
}
