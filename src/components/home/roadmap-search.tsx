'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import type { RoadmapCardData } from '@/lib/content/views';
import { searchCatalog, type CatalogIndex, type TopicHit } from '@/lib/search/catalog';
import { format } from '@/lib/format';
import { useMessages } from '@/components/messages-provider';
import { LearningNow, RoadmapGrid } from '@/components/roadmap/roadmap-cards';
import { Icon } from '@/components/icons';
import { handOffQuery } from '@/lib/search/handoff';

function isTyping(el: Element | null): boolean {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el instanceof HTMLElement && el.isContentEditable);
}

function Highlight({ text, mark }: { text: string; mark: TopicHit['mark'] }) {
  if (!mark) return <>{text}</>;
  const [start, end] = mark;
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}

/** Trang chủ: ô tìm roadmap và chủ đề (spec 2026-10-05 §4). Ô trống thì hiện "Đang học" và lưới roadmap. */
export function RoadmapSearch({ index, cards, lang }: { index: CatalogIndex; cards: RoadmapCardData[]; lang: string }) {
  const t = useMessages();
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const result = useMemo(() => searchCatalog(index, query), [index, query]);
  const active = query.trim().length > 0;
  const { setOpenSearch } = useSearchContext();

  useEffect(() => {
    // ⌘K/Ctrl K ở trang chủ đưa vào ô này thay vì mở hộp tìm bài (bắt ở pha capture, trước SearchProvider).
    const onCommandK = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      input.current?.focus();
      input.current?.select();
    };
    const onSlash = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement)) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener('keydown', onCommandK, { capture: true });
    document.addEventListener('keydown', onSlash);
    return () => {
      window.removeEventListener('keydown', onCommandK, { capture: true });
      document.removeEventListener('keydown', onSlash);
    };
  }, []);

  const searchLessons = () => {
    handOffQuery(query.trim());
    setOpenSearch(true);
  };
  const [lessonsBefore, lessonsAfter] = t.home.searchLessons.split('{q}');

  const titles = new Map(cards.map((c) => [c.id, t.tracks[c.track]]));
  const tracks = new Map(cards.map((c) => [c.id, c.track]));
  const matched = new Set(result.roadmaps.map((r) => r.id));
  const roadmapHits = cards.filter((c) => matched.has(c.id));
  const empty = active && roadmapHits.length === 0 && result.totalTopics === 0;

  return (
    <>
      <form className="hm-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="hm-q">{t.home.searchLabel}</label>
        <div className="hm-search-box">
          <Icon name="search" />
          <input
            ref={input}
            id="hm-q"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder={t.home.searchPlaceholder}
            aria-describedby="hm-q-hint"
            aria-controls="hm-results"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && query) {
                e.preventDefault();
                setQuery('');
              }
            }}
          />
          {query ? null : (
            <kbd className="hm-search-key" aria-hidden="true">
              ⌘K
            </kbd>
          )}
        </div>
        <p id="hm-q-hint" className="hm-search-hint">
          {t.home.searchHint}
        </p>
      </form>

      {/* Chỉ đọc tóm tắt, không đọc lại cả danh sách kết quả sau mỗi phím gõ. */}
      <p role="status" className="sr-only">
        {!active
          ? ''
          : empty
            ? format(t.home.noResult, { q: query.trim() })
            : format(t.home.resultSummary, { roadmaps: roadmapHits.length, topics: result.totalTopics })}
      </p>
      <div id="hm-results" className="hm-results" hidden={!active}>
        {active && roadmapHits.length > 0 ? (
          <section className="hm-section" aria-labelledby="hm-r-roadmaps">
            <h2 id="hm-r-roadmaps" className="hm-h">
              {t.home.resultRoadmaps} <small>{roadmapHits.length}</small>
            </h2>
            <RoadmapGrid roadmaps={roadmapHits} lang={lang} />
          </section>
        ) : null}
        {active && result.totalTopics > 0 ? (
          <section className="hm-section" aria-labelledby="hm-r-topics">
            <h2 id="hm-r-topics" className="hm-h">
              {t.home.resultTopics} <small>{result.totalTopics}</small>
            </h2>
            <ul className="hm-topic-list">
              {result.topics.map(({ topic, mark }) => (
                <li key={topic.id}>
                  <a className="hm-topic" href={`/${lang}/roadmaps/${topic.roadmapId}#${topic.id}`} data-track={tracks.get(topic.roadmapId)}>
                    <span className="hm-topic-code">{topic.code}</span>
                    <span>
                      <span className="hm-topic-t">
                        <Highlight text={topic.title} mark={mark} />
                      </span>
                      <span className="hm-topic-s">
                        {titles.get(topic.roadmapId)} · {topic.stepTitle}
                      </span>
                    </span>
                    {topic.hasLesson ? <span className="hm-topic-b">{t.roadmap.hasLesson}</span> : <span />}
                  </a>
                </li>
              ))}
            </ul>
            {result.totalTopics > result.topics.length ? (
              <p className="hm-more">{format(t.home.moreTopics, { n: result.totalTopics - result.topics.length })}</p>
            ) : null}
          </section>
        ) : null}
        {empty ? (
          <section className="hm-section">
            <div className="hm-empty">
              <p className="hm-empty-t">{format(t.home.noResult, { q: query.trim() })}</p>
              <p className="hm-empty-d">{t.home.noResultHint}</p>
              <div className="hm-suggest">
                {t.home.suggest.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => {
                      setQuery(word);
                      input.current?.focus();
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}
        {active ? (
          <button type="button" className="hm-deep" onClick={searchLessons}>
            <Icon name="search" />
            <span>
              {lessonsBefore}
              <b>{query.trim()}</b>
              {lessonsAfter}
            </span>
            <Icon name="arrow" />
          </button>
        ) : null}
      </div>

      <div className="hm-browse" hidden={active}>
        <LearningNow roadmaps={cards} lang={lang} />
        <section className="hm-section" aria-labelledby="hm-all">
          <h2 id="hm-all" className="hm-h">
            {t.home.allRoadmaps} <small>{cards.length}</small>
          </h2>
          <RoadmapGrid roadmaps={cards} lang={lang} />
        </section>
      </div>
    </>
  );
}
