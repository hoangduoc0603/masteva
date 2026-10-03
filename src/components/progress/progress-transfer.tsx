'use client';
import { useRef, useState } from 'react';
import { getProgressStore } from '@/lib/progress/store';
import { useProgress } from '@/lib/progress/use-progress';
import { useMessages } from '@/components/messages-provider';
import { format } from '@/lib/messages';
import { PersistWarning } from './progress-bar';

/** Xuất và nhập tiến độ dạng file JSON (FR-PROGRESS-003). Khi nhập thì gộp, không ghi đè. */
export function ProgressTransfer() {
  const t = useMessages();
  const { persistent } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  function exportProgress() {
    const data = JSON.stringify(getProgressStore().exportData(), null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `masteva-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importProgress(file: File) {
    try {
      const count = getProgressStore().importData(JSON.parse(await file.text()));
      setStatus(count === null ? t.progress.importError : format(t.progress.imported, { count }));
    } catch {
      setStatus(t.progress.importError);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <button type="button" className="roadmap-filter" onClick={exportProgress}>
        {t.progress.export}
      </button>
      <button type="button" className="roadmap-filter" onClick={() => fileRef.current?.click()}>
        {t.progress.import}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="sr-only"
        aria-label={t.progress.import}
        data-testid="progress-import"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importProgress(file);
          e.target.value = '';
        }}
      />
      {status ? (
        <span role="status" className="text-fd-muted-foreground">
          {status}
        </span>
      ) : null}
      {!persistent ? <PersistWarning /> : null}
    </div>
  );
}
