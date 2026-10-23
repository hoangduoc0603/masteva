'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useProgress } from '@/lib/progress/use-progress';
import { getProgressStore } from '@/lib/progress/store';
import { useMessages } from '@/components/messages-provider';
import { Icon } from '@/components/icons';

/**
 * Thanh đầu bài đọc: breadcrumb bên trái, nút "Đã học xong bài" bên phải. Thanh dính
 * ngay dưới thanh mục lục của Fumadocs khi cuộn (`--fd-docs-row-3`), nên đang đọc ở đâu
 * cũng bấm được, giống ô "Viewed" trên thanh tiêu đề file khi review của GitHub.
 *
 * Nút bật tắt mục duy nhất `<mã bài>.done` qua kho tiến độ (ADR-0011), nên chủ đề và
 * roadmap tính trạng thái như với mục của bài lab.
 */
export function LessonBar({ doneId, children }: { doneId: string; children?: ReactNode }) {
  const { progress } = useProgress();
  const t = useMessages();
  const done = Boolean(progress.items[doneId]);
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // Thanh đã dính khi mép trên chạm vị trí `top` của nó; lúc đó mới hiện đường kẻ dưới.
  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const top = parseFloat(getComputedStyle(bar).top) || 0;
      setStuck(window.scrollY > 0 && bar.getBoundingClientRect().top <= top + 0.5);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div ref={ref} className="ms-bar not-prose" data-stuck={stuck || undefined}>
      <div className="ms-bar-crumb">{children}</div>
      <button
        type="button"
        className="ms-done-chip"
        aria-pressed={done}
        data-done-id={doneId}
        onClick={() => getProgressStore().toggle(doneId)}
      >
        <span className="ms-done-dot" aria-hidden="true">
          <Icon name="check" />
        </span>
        {t.lesson.markFinished}
      </button>
    </div>
  );
}
