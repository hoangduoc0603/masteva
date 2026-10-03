'use client';
import type { ReactNode } from 'react';
import { useProgress } from '@/lib/progress/use-progress';
import { getProgressStore } from '@/lib/progress/store';

/** Một mục đánh dấu tiến độ. `id` là mã ổn định, xem architecture §5.4. */
export function Check({ id, children }: { id: string; children?: ReactNode }) {
  const { progress } = useProgress();
  const done = Boolean(progress.items[id]);
  const inputId = `check-${id}`;

  return (
    <div className="lesson-check not-prose" data-done={done || undefined}>
      <input
        id={inputId}
        type="checkbox"
        checked={done}
        onChange={() => getProgressStore().toggle(id)}
        data-check-id={id}
      />
      <label htmlFor={inputId}>{children}</label>
    </div>
  );
}
