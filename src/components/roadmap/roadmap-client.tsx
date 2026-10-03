'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Level } from '@/lib/content/constants';
import type { TopicDetail } from '@/lib/content/views';
import { format } from '@/lib/format';
import { getProgressStore } from '@/lib/progress/store';
import { useProgress, useReplacements } from '@/lib/progress/use-progress';
import { markFor, nextTopic, roadmapTally, topicState, type RoadmapLite } from '@/lib/progress/roadmap';
import { TOPIC_MARKS } from '@/lib/progress/model';
import { usePref } from '@/lib/prefs';
import { useMessages } from '@/components/messages-provider';
import { applyProgress } from './roadmap-dom';
import { HIDE_KEY, VIEW_KEY } from './roadmap-prefs';
import { TopicDrawer } from './topic-drawer';

/**
 * Phần tương tác của trang roadmap: nút "Học tiếp", "Tôi đã biết", view đang chọn,
 * gắn trạng thái lên sơ đồ và điều khiển khung chi tiết (spec §6.1).
 */
/** Cấp đã đánh "đã biết" bị thu gọn; mở cấp chứa phần tử ra. Trả về `true` nếu vừa mở. */
function revealLevel(el: Element | null): boolean {
  const level = el?.closest('[data-level][data-known]:not([data-expanded])');
  level?.setAttribute('data-expanded', '');
  return Boolean(level);
}

export function RoadmapClient({
  lang,
  lite,
  levels,
  replacements,
}: {
  lang: string;
  lite: RoadmapLite;
  levels: { id: Level; title: string }[];
  replacements: Record<string, string>;
}) {
  useReplacements(replacements);
  const { progress } = useProgress();
  const t = useMessages();
  const [view] = usePref(VIEW_KEY, 'map');
  const [hideSkipped] = usePref(HIDE_KEY, 'false');
  const next = nextTopic(progress, lite);
  const hasNext = next !== undefined;
  const total = roadmapTally(progress, lite);
  const started = lite.levels.some((l) => l.steps.some((s) => s.topics.some((tp) => topicState(progress, tp) !== 'todo')));
  const start = progress.start[lite.id];
  const rootId = `roadmap-${lite.id}`;
  const hashChecked = useRef(false);
  const topicIds = useMemo(() => new Set(lite.levels.flatMap((l) => l.steps.flatMap((s) => s.topics.map((tp) => tp.id)))), [lite]);
  // Khung chi tiết: chủ đề đang mở và nội dung tải từ `topics.json` khi mở lần đầu.
  const [active, setActive] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, TopicDetail> | null>(null);
  const [failed, setFailed] = useState(false);
  // Việc làm sau khi panel mới render xong: focus (nút cùng hướng hoặc tiêu đề) và đọc tên chủ đề.
  const afterRender = useRef<{ rel: string | null } | null>(null);

  useEffect(() => {
    if (!active || details || failed) return;
    let cancelled = false;
    fetch(`/${lang}/roadmaps/${lite.id}/topics.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, TopicDetail>>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!cancelled) setDetails(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [active, details, failed, lang, lite.id]);

  useEffect(() => {
    const dialog = document.getElementById(rootId)?.querySelector('dialog[data-drawer]');
    const panel = active ? dialog?.querySelector<HTMLElement>(`[data-panel="${CSS.escape(active)}"]`) : null;
    if (!dialog || !panel) return;
    dialog.scrollTop = 0;
    const pending = afterRender.current;
    if (!pending) return;
    afterRender.current = null;
    const same = pending.rel ? panel.querySelector<HTMLElement>(`.rm-panel-nav a[rel="${pending.rel}"]`) : null;
    (same ?? panel.querySelector<HTMLElement>('.rm-panel-t'))?.focus();
    const live = dialog.querySelector('[data-live]');
    if (live) live.textContent = panel.querySelector('.rm-panel-t')?.textContent ?? '';
  }, [rootId, active, details]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.dataset.view = view;
    root.dataset.hideSkipped = hideSkipped;
  }, [rootId, view, hideSkipped]);

  // Mobile: thanh "Học tiếp" ở đáy chỉ hiện khi nút chính đã cuộn khuất phía trên.
  useEffect(() => {
    const root = document.getElementById(rootId);
    const cta = root?.querySelector('.rm-cta');
    if (!root || !cta) return;
    const observer = new IntersectionObserver(([entry]) => {
      root.toggleAttribute('data-dock', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(cta);
    return () => {
      observer.disconnect();
      root.removeAttribute('data-dock');
    };
  }, [rootId, hasNext]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    applyProgress(root, lite, progress, nextTopic(progress, lite)?.step.id, { state: t.roadmap.state, stepCount: t.roadmap.stepCount });
    // Tải thẳng URL có hash trỏ vào cấp đã thu gọn: chỉ biết cấp nào thu gọn sau khi đọc tiến độ thật
    // (lần render hydrate dùng snapshot rỗng), nên mở cấp ở đây, đúng một lần.
    if (!hashChecked.current && progress === getProgressStore().getSnapshot().progress) {
      hashChecked.current = true;
      const id = window.location.hash.slice(1);
      const target = id ? (document.getElementById(id) ?? root.querySelector(`[data-topic="${CSS.escape(id)}"]`)) : null;
      if (revealLevel(target)) target?.scrollIntoView({ block: target.id === id ? 'start' : 'center' });
    }
  }, [rootId, lite, progress, t]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    const dialog = root?.querySelector('dialog[data-drawer]');
    if (!root || !(dialog instanceof HTMLDialogElement)) return;
    let opener: HTMLElement | null = null;
    let keepHash = false;

    const reveal = revealLevel;
    // Chip có thể đang ẩn (cấp thu gọn, "ẩn mục đã bỏ qua"): khi đó trả focus về tiêu đề chặng hoặc thanh công cụ.
    const focusBack = (el: HTMLElement | null) => {
      if (el?.checkVisibility()) return el.focus();
      const heading = el?.closest('.rm-step')?.querySelector<HTMLElement>('.rm-step-t');
      if (heading?.checkVisibility()) {
        heading.tabIndex = -1;
        return heading.focus();
      }
      root.querySelector<HTMLElement>('.rm-toolbar button')?.focus();
    };
    const open = (id: string): boolean => {
      if (!topicIds.has(id)) {
        const target = document.getElementById(id);
        if (target) {
          reveal(target);
          target.scrollIntoView();
        }
        // Hash không trỏ tới chủ đề (ví dụ `#step-j5`): đóng khung nhưng giữ hash để trang cuộn tới đó.
        if (dialog.open) {
          keepHash = true;
          dialog.close();
        }
        return false;
      }
      setActive(id);
      // Đóng khung thì trả focus về chip của chủ đề đang xem, kể cả sau khi bấm Trước/Tiếp.
      opener = root.querySelector<HTMLElement>(`[data-topic="${CSS.escape(id)}"]`) ?? opener;
      reveal(opener);
      opener?.scrollIntoView({ block: 'center' });
      if (!dialog.open) dialog.showModal();
      return true;
    };
    const fromHash = () => {
      // Mã chủ đề chỉ gồm ký tự ASCII (topicIdPattern) nên không cần giải mã; hash như `#%` không làm hỏng trang.
      const id = window.location.hash.slice(1);
      if (id) open(id);
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Cmd/Ctrl/Shift hoặc chuột giữa: để trình duyệt mở tab mới như link thường.
      const plain = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
      const inPanel = target.closest<HTMLAnchorElement>('.rm-panel a[href^="#"]');
      if (inPanel && plain) {
        // Trước/Tiếp và "Nên học trước" cùng roadmap: đổi panel tại chỗ.
        event.preventDefault();
        const id = inPanel.hash.slice(1);
        window.history.replaceState(null, '', `#${id}`);
        // Giữ focus trên nút cùng hướng để bấm liên tiếp; link khác thì focus tiêu đề panel mới.
        if (open(id)) afterRender.current = { rel: inPanel.getAttribute('rel') };
        return;
      }
      const chip = target.closest<HTMLElement>('a[data-topic]');
      if (chip?.dataset.topic && plain) {
        event.preventDefault();
        opener = chip;
        window.history.replaceState(null, '', `#${chip.dataset.topic}`);
        open(chip.dataset.topic);
        return;
      }
      const markButton = target.closest<HTMLElement>('[data-mark]');
      const panelId = markButton?.closest<HTMLElement>('[data-panel]')?.dataset.panel;
      if (markButton && panelId) {
        const topic = lite.levels.flatMap((l) => l.steps.flatMap((s) => s.topics)).find((tp) => tp.id === panelId);
        const store = getProgressStore();
        const mark = TOPIC_MARKS.find((m) => m === markButton.dataset.mark);
        if (topic && mark) store.setTopic(panelId, markFor(store.getSnapshot().progress, topic, mark));
        return;
      }
      if (target.closest('[data-close]')) {
        dialog.close();
        return;
      }
      if (target === dialog) {
        dialog.close();
        return;
      }
      const level = target.closest<HTMLElement>('[data-show-level]')?.dataset.showLevel;
      if (level) root.querySelector(`[data-level="${CSS.escape(level)}"]`)?.setAttribute('data-expanded', '');
    };
    const onClose = () => {
      if (keepHash) keepHash = false;
      else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        focusBack(opener);
      }
      opener = null;
      setActive(null);
    };

    root.addEventListener('click', onClick);
    dialog.addEventListener('close', onClose);
    window.addEventListener('hashchange', fromHash);
    fromHash();
    return () => {
      root.removeEventListener('click', onClick);
      dialog.removeEventListener('close', onClose);
      window.removeEventListener('hashchange', fromHash);
    };
  }, [rootId, lite, topicIds]);

  // Nhãn cộng dồn ("Nền tảng", "Nền tảng + Middle") để rõ là đã biết đến hết cấp nào.
  const knownOptions = [
    { value: null, label: t.roadmap.knownNone },
    ...levels.slice(0, -1).map((_, i) => ({
      value: levels[i + 1].id,
      label: levels
        .slice(0, i + 1)
        .map((l) => l.title)
        .join(' + '),
    })),
  ];
  const ctaLabel = next ? format(started ? t.roadmap.continueTo : t.roadmap.startAt, { title: next.topic.title }) : '';
  // Chủ đề kế tiếp đã có bài thì vào thẳng bài; chưa có thì mở khung chi tiết.
  const ctaHref = next ? (next.topic.lesson ? `/${lang}${next.topic.lesson}` : `#${next.topic.id}`) : '';

  return (
    <>
      <div className="rm-actions">
        {next ? (
          <a className="rm-cta" href={ctaHref} data-testid="continue">
            {ctaLabel}
          </a>
        ) : (
          <p className="rm-finished">{t.roadmap.finished}</p>
        )}
        <p className="rm-total">{format(t.roadmap.doneCount, { done: total.done, total: total.total })}</p>
        <div className="rm-known">
          <span id={`${rootId}-known`}>{t.roadmap.known}</span>
          <div className="rm-seg" role="group" aria-labelledby={`${rootId}-known`}>
            {knownOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={(start ?? null) === option.value}
                onClick={() => getProgressStore().setStart(lite.id, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {next ? (
        <a className="rm-dock" href={ctaHref}>
          {ctaLabel}
        </a>
      ) : null}
      <TopicDrawer
        activeId={active}
        detail={active ? details?.[active] : undefined}
        failed={failed}
        progress={progress}
        roadmapId={lite.id}
        lang={lang}
      />
    </>
  );
}
