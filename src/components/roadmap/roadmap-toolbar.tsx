'use client';
import { usePref } from '@/lib/prefs';
import { useMessages } from '@/components/messages-provider';
import { HIDE_KEY, VIEW_KEY } from './roadmap-prefs';

/**
 * Thanh công cụ dính của trang roadmap (spec §6.1.2). Nằm ngoài `<header>` để
 * `position: sticky` có tác dụng suốt chiều dài sơ đồ.
 */
export function RoadmapToolbar() {
  const t = useMessages();
  const [view, setView] = usePref(VIEW_KEY, 'map');
  const [hideSkipped, setHideSkipped] = usePref(HIDE_KEY, 'false');
  return (
    <div className="rm-toolbar">
      <div className="rm-seg" role="group" aria-label={t.roadmap.view}>
        <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
          {t.roadmap.viewMap}
        </button>
        <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
          {t.roadmap.viewList}
        </button>
      </div>
      <label>
        <input type="checkbox" checked={hideSkipped === 'true'} onChange={(e) => setHideSkipped(String(e.target.checked))} />
        {t.roadmap.hideSkipped}
      </label>
      <details className="rm-legend">
        <summary>{t.roadmap.howToRead}</summary>
        <p>{t.roadmap.howToReadBody}</p>
      </details>
    </div>
  );
}
