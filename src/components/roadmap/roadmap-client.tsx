'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Icon } from '@/components/icons';

/** Mở hoặc thu các chặng của một cấp đã biết, đồng bộ chữ và `aria-expanded` của nút "Xem lại các chặng". */
function setExpanded(level: Element, on: boolean) {
  level.toggleAttribute('data-expanded', on);
  const button = level.querySelector<HTMLElement>('[data-expand]');
  if (!button) return;
  button.setAttribute('aria-expanded', String(on));
  button.textContent = (on ? button.dataset.labelClose : button.dataset.labelOpen) ?? button.textContent;
}

/** Cấp đã đánh "đã biết" bị thu gọn; mở cấp chứa phần tử ra. Trả về `true` nếu vừa mở. */
function revealLevel(el: Element | null): boolean {
  const level = el?.closest('[data-level][data-known]:not([data-expanded])');
  if (level) setExpanded(level, true);
  return Boolean(level);
}

/**
 * Phần tương tác của trang roadmap: khối tiếp tục, "Tôi đã biết" theo cấp, view đang chọn,
 * gắn trạng thái lên sơ đồ và điều khiển khung chi tiết (spec 2026-10-05 §5).
 */
export function RoadmapClient({
  lang,
  lite,
  replacements,
}: {
  lang: string;
  lite: RoadmapLite;
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
  const rootId = `roadmap-${lite.id}`;
  const hashChecked = useRef(false);
  const topicIds = useMemo(() => new Set(lite.levels.flatMap((l) => l.steps.flatMap((s) => s.topics.map((tp) => tp.id)))), [lite]);
  // Khung chi tiết: chủ đề đang mở và nội dung tải từ `topics.json` khi mở lần đầu.
  const [active, setActive] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, TopicDetail> | null>(null);
  const [failed, setFailed] = useState(false);
  // Việc làm sau khi panel mới render xong: focus (nút cùng hướng hoặc tiêu đề) và đọc tên chủ đề.
  const afterRender = useRef<{ rel: string | null } | null>(null);
  // Nút vừa bấm ("Tôi đã biết", "Hoàn tác") bị ẩn khi đổi cấp bắt đầu: focus chuyển sang nút này sau khi sơ đồ cập nhật.
  const focusAfterApply = useRef<string | null>(null);

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
    const cta = root?.querySelector('.rm-next');
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
    if (focusAfterApply.current) {
      root.querySelector<HTMLElement>(focusAfterApply.current)?.focus();
      focusAfterApply.current = null;
    }
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
      root.querySelector<HTMLElement>('.rm-lvtabs a')?.focus();
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
      const expand = target.closest<HTMLElement>('[data-expand]');
      const expandLevel = expand?.closest('[data-level]');
      if (expandLevel) {
        setExpanded(expandLevel, !expandLevel.hasAttribute('data-expanded'));
        return;
      }
      // Cấp bắt đầu là cấp sau cấp đã biết; hoàn tác ở cấp i đưa cấp bắt đầu về đúng cấp i (spec §5.3).
      const knownSet = target.closest<HTMLElement>('[data-known-set]')?.dataset.knownSet;
      const knownUndo = target.closest<HTMLElement>('[data-known-undo]')?.dataset.knownUndo;
      const index = lite.levels.findIndex((l) => l.id === (knownSet ?? knownUndo));
      if (index < 0) return;
      const level = lite.levels[index].id;
      root.querySelectorAll('[data-level][data-expanded]').forEach((el) => setExpanded(el, false));
      if (knownSet) {
        const known = lite.levels[index - 1]?.id;
        focusAfterApply.current = known ? `[data-known-undo="${CSS.escape(known)}"]` : null;
        getProgressStore().setStart(lite.id, level);
      } else {
        focusAfterApply.current = `[data-known-set="${CSS.escape(lite.levels[index + 1]?.id ?? level)}"]`;
        getProgressStore().setStart(lite.id, index === 0 ? null : level);
      }
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

  const ctaLabel = next ? format(started ? t.roadmap.continueTo : t.roadmap.startAt, { title: next.topic.title }) : '';
  // Chủ đề kế tiếp đã có bài thì vào thẳng bài; chưa có thì mở khung chi tiết.
  const ctaHref = next ? (next.topic.lesson ? `/${lang}${next.topic.lesson}` : `#${next.topic.id}`) : '';
  const state = !next ? 'done' : started ? 'learning' : 'new';

  return (
    <>
      {/* Cấu trúc cố định: đổi trạng thái chỉ đổi chữ, nút "Vào học" giữ nguyên chỗ (spec §5.1). */}
      <section className="rm-next" aria-labelledby={`${rootId}-next`} data-state={state}>
        <div className="rm-next-body">
          <p id={`${rootId}-next`} className="rm-next-k">
            {t.roadmap.next[state]}
          </p>
          <p className="rm-next-t">{next ? next.topic.title : t.roadmap.finished}</p>
          <p className="rm-next-m">
            {next ? (
              <>
                <b>{next.step.code}</b> {next.step.title}
                {next.topic.lessonCode ? ` · ${format(t.roadmap.lessonRef, { code: next.topic.lessonCode })}` : null}
              </>
            ) : (
              t.roadmap.finishedHint
            )}
          </p>
        </div>
        {next ? (
          <a className="rm-btn" href={ctaHref} data-testid="continue">
            {t.roadmap.enter} <Icon name="arrow" />
          </a>
        ) : null}
        <div className="rm-meter">
          <span className="rm-bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${total.total ? total.done / total.total : 0})` }} />
          </span>
          <span>{format(t.roadmap.doneCount, { done: total.done, total: total.total })}</span>
        </div>
      </section>
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
