'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Level } from '@/lib/content/constants';
import { usePref } from '@/lib/prefs';
import { useProgress } from '@/lib/progress/use-progress';
import { skippedLevels, tallyTopics, type RoadmapLite } from '@/lib/progress/roadmap';
import { useMessages } from '@/components/messages-provider';
import { Icon } from '@/components/icons';
import { HIDE_KEY, VIEW_KEY } from './roadmap-prefs';

/**
 * Thanh cấp dính của trang roadmap (spec 2026-10-05 §5.2): tab từng cấp kèm tiến độ, cấp đang xem
 * có `aria-current`; bên phải là kiểu xem và "Ẩn mục đã bỏ qua", trên mobile gộp vào một bảng nổi.
 * Nằm ngoài `<header>` để `position: sticky` có tác dụng suốt chiều dài sơ đồ.
 */
export function RoadmapToolbar({ lite, levels }: { lite: RoadmapLite; levels: { id: Level; title: string }[] }) {
  const t = useMessages();
  const { progress } = useProgress();
  const [view, setView] = usePref(VIEW_KEY, 'map');
  const [hideSkipped, setHideSkipped] = usePref(HIDE_KEY, 'false');
  const [active, setActive] = useState<string>(levels[0]?.id ?? '');
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const known = skippedLevels(progress, lite);
  const toolsId = `rm-tools-${lite.id}`;

  // Cấp đang xem: cấp đầu tiên (theo thứ tự trang) có phần nằm trong dải ngay dưới thanh dính.
  useEffect(() => {
    const sections = levels.map((l) => document.getElementById(`level-${l.id}`)).filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.level ?? '';
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const first = levels.find((l) => visible.has(l.id));
        if (first) setActive(first.id);
      },
      { rootMargin: '-140px 0px -60% 0px' },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [levels]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!nav.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Cuộn tới cấp mà không đổi hash: hash là kênh mở khung chủ đề của RoadmapClient.
  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(`level-${id}`);
    if (!section) return;
    event.preventDefault();
    setOpen(false);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const heading = section.querySelector<HTMLElement>('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  };

  return (
    <nav ref={nav} className="rm-levelbar" aria-label={t.roadmap.levelsNav} data-tools-open={open || undefined}>
      <ol className="rm-lvtabs">
        {levels.map((level) => {
          const tally = tallyTopics(
            progress,
            lite.levels.find((l) => l.id === level.id)?.steps.flatMap((s) => s.topics) ?? [],
          );
          return (
            <li key={level.id}>
              <a href={`#level-${level.id}`} aria-current={active === level.id ? 'true' : undefined} onClick={(e) => goTo(e, level.id)}>
                <span className="lv-t">{level.title}</span>
                <span className="lv-n">
                  {tally.done}/{tally.total}
                  {known.has(level.id) ? t.roadmap.knownSuffix : null}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <button
        ref={toggle}
        type="button"
        className="rm-tools-btn"
        aria-label={t.roadmap.displayOptions}
        aria-expanded={open}
        aria-controls={toolsId}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="sliders" />
      </button>
      <div id={toolsId} className="rm-tools">
        <div className="rm-seg" role="group" aria-label={t.roadmap.view}>
          <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>
            <Icon name="map" />
            {t.roadmap.viewMap}
          </button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <Icon name="list" />
            {t.roadmap.viewList}
          </button>
        </div>
        <label className="rm-switch">
          <input type="checkbox" role="switch" checked={hideSkipped === 'true'} onChange={(e) => setHideSkipped(String(e.target.checked))} />
          {t.roadmap.hideSkipped}
        </label>
      </div>
    </nav>
  );
}
