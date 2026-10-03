'use client';
import type { ReactNode } from 'react';
import { useProgress } from '@/lib/progress/use-progress';
import { getProgressStore } from '@/lib/progress/store';

/**
 * Một mục đánh dấu tiến độ. `id` là mã ổn định, xem architecture §5.4.
 * `label` là nhãn nhỏ "Tự kiểm tra", truyền từ server (mdx.tsx) để không đưa file ngôn ngữ vào bundle.
 * Nền xanh khi đã xong do CSS (`:has(input:checked)`) lo, xem src/app/lesson.css.
 */
export function Check({ id, label, children }: { id: string; label?: string; children?: ReactNode }) {
  const { progress } = useProgress();
  const done = Boolean(progress.items[id]);
  const inputId = `check-${id}`;

  return (
    <div className="ms-check not-prose" data-done={done || undefined}>
      {label ? (
        <span className="ms-mlabel" aria-hidden="true">
          {label}
        </span>
      ) : null}
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
