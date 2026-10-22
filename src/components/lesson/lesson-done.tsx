'use client';
import { useProgress } from '@/lib/progress/use-progress';
import { getProgressStore } from '@/lib/progress/store';
import { useMessages } from '@/components/messages-provider';

/**
 * Nút "Đã học xong bài" ở cuối bài đọc (ADR-0011). Bật tắt mục duy nhất `<mã bài>.done`
 * qua kho tiến độ, nên chủ đề và roadmap tính trạng thái như với mục của bài lab.
 */
export function LessonDone({ id }: { id: string }) {
  const { progress } = useProgress();
  const t = useMessages();
  const done = Boolean(progress.items[id]);
  return (
    <div className="ms-done not-prose">
      <button type="button" aria-pressed={done} data-done-id={id} onClick={() => getProgressStore().toggle(id)}>
        <span className="ms-done-box" aria-hidden="true" />
        {t.lesson.markFinished}
      </button>
    </div>
  );
}
