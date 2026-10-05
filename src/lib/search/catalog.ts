import { normalizeVietnamese } from './vi-tokenizer';

/**
 * Tìm roadmap và chủ đề trên trang chủ (spec 2026-10-05 §4). Chạy trên trình duyệt với chỉ mục
 * dựng lúc build; so khớp chuỗi con không phân biệt dấu và hoa thường.
 */
export interface CatalogRoadmap {
  id: string;
  track: string;
  title: string;
  description: string;
}

export interface CatalogTopic {
  roadmapId: string;
  code: string;
  stepTitle: string;
  id: string;
  title: string;
  hasLesson: boolean;
}

export interface CatalogIndex {
  roadmaps: CatalogRoadmap[];
  topics: CatalogTopic[];
}

/** `mark` là đoạn `[start, end)` cần tô trong `topic.title`; `null` khi chỉ khớp tên chặng. */
export interface TopicHit {
  topic: CatalogTopic;
  mark: [number, number] | null;
}

export interface CatalogResult {
  roadmaps: CatalogRoadmap[];
  topics: TopicHit[];
  totalTopics: number;
}

const squash = (s: string) => normalizeVietnamese(s).replace(/\s+/g, ' ');

/** Chuẩn hoá từng ký tự để biết vị trí khớp trong chuỗi gốc. */
function fold(text: string): { out: string; map: number[] } {
  let out = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    for (const ch of squash(text[i])) {
      out += ch;
      map.push(i);
    }
  }
  return { out, map };
}

function markOf(text: string, q: string): [number, number] | null {
  const { out, map } = fold(text);
  const at = out.indexOf(q);
  return at < 0 ? null : [map[at], map[at + q.length - 1] + 1];
}

export function searchCatalog(index: CatalogIndex, query: string, limit = 8): CatalogResult {
  const q = squash(query.trim());
  if (!q) return { roadmaps: [], topics: [], totalTopics: 0 };
  const has = (s: string) => squash(s).includes(q);
  const roadmaps = index.roadmaps.filter((r) => has(r.title) || has(r.description));
  const byTitle: TopicHit[] = [];
  const byStep: TopicHit[] = [];
  for (const topic of index.topics) {
    const mark = markOf(topic.title, q);
    if (mark) byTitle.push({ topic, mark });
    else if (has(topic.stepTitle)) byStep.push({ topic, mark: null });
  }
  const all = [...byTitle, ...byStep];
  return { roadmaps, topics: all.slice(0, limit), totalTopics: all.length };
}
