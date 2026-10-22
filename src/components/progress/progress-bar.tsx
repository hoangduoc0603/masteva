'use client';
import { tally } from '@/lib/progress/model';
import { useProgress, useReplacements } from '@/lib/progress/use-progress';
import { useMessages } from '@/components/messages-provider';
import { format } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { LessonKind } from '@/lib/content/constants';

export function Bar({ done, total, label, className }: { done: number; total: number; label: string; className?: string }) {
  const ratio = total === 0 ? 0 : done / total;
  return (
    <div
      className={cn('relative h-2 overflow-hidden rounded-full bg-[var(--surface)] shadow-[inset_0_0_0_1px_var(--field)]', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
    >
      <div
        className="absolute inset-0 origin-left bg-[var(--accent)] transition-transform motion-reduce:transition-none"
        style={{ transform: `scaleX(${ratio})` }}
      />
    </div>
  );
}

/**
 * Tiến độ của một bài, hiện ở đầu trang bài học.
 * Bài đọc chỉ có một mục nên hiện "Đã học xong"/"Chưa học xong" thay cho "Đã xong n/m mục".
 */
export function LessonProgress({
  items,
  kind,
  replacements,
}: {
  items: string[];
  kind: LessonKind;
  replacements: Record<string, string>;
}) {
  useReplacements(replacements);
  const { progress, persistent } = useProgress();
  const t = useMessages();
  const { done, total } = tally(progress, items);
  if (total === 0) return null;
  const finished = done === total ? t.lesson.finished : t.lesson.notFinished;
  const label = kind === 'reading' ? finished : format(t.lesson.progress, { done, total });
  return (
    <div className="not-prose flex flex-col gap-1.5" data-testid="lesson-progress">
      <div className="flex items-center gap-3">
        <Bar done={done} total={total} label={label} className="flex-1" />
        <span className="text-xs tabular-nums text-fd-muted-foreground">{label}</span>
      </div>
      {!persistent ? <PersistWarning /> : null}
    </div>
  );
}

export function PersistWarning() {
  const t = useMessages();
  return (
    <p role="status" className="text-xs text-fd-warning">
      {t.progress.notPersistent}
    </p>
  );
}
