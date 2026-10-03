import type { LessonStatus } from '@/lib/content/constants';
import { format, type Messages } from '@/lib/messages';

interface Verified {
  date: string;
  os: string;
  tools: Record<string, string>;
}

/** Nhãn trạng thái bài học (FR-LESSON-009). */
export function LessonStatusBadge({
  t,
  status,
  verified,
  outdatedNote,
}: {
  t: Messages;
  status: LessonStatus;
  verified?: Verified;
  outdatedNote?: string;
}) {
  const label =
    status === 'verified' && verified
      ? format(t.lesson.status.verified, { date: verified.date })
      : t.lesson.status[status];
  const tools = verified
    ? Object.entries(verified.tools)
        .map(([name, version]) => `${name} ${version}`)
        .join(', ')
    : '';

  return (
    <div className="not-prose flex flex-wrap items-center gap-2 text-xs">
      <span className="lesson-status" data-status={status}>
        {label}
      </span>
      {verified ? (
        <span className="text-fd-muted-foreground">{format(t.lesson.verifiedEnv, { os: verified.os, tools })}</span>
      ) : null}
      {status === 'outdated' && outdatedNote ? <span className="text-fd-muted-foreground">{outdatedNote}</span> : null}
    </div>
  );
}
