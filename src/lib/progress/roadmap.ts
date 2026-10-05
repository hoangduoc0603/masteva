import type { Level, TopicKind } from '@/lib/content/constants';
import type { Progress, Tally, TopicMark } from './model';

/**
 * Tiến độ theo roadmap (spec §5). Dữ liệu "lite" chỉ gồm những gì trình duyệt cần
 * để tính trạng thái, được tạo lúc build và truyền xuống qua props.
 */
export interface LiteTopic {
  id: string;
  title: string;
  kind: TopicKind;
  /** Mã mục của mọi bài gắn với chủ đề này. */
  items: string[];
  /** Đường dẫn bài đầu tiên (không có tiền tố ngôn ngữ), nếu chủ đề đã có bài. */
  lesson?: string;
}

export interface LiteStep {
  id: string;
  code: string;
  title: string;
  topics: LiteTopic[];
}

export interface LiteLevel {
  id: Level;
  steps: LiteStep[];
}

export interface RoadmapLite {
  id: string;
  title: string;
  levels: LiteLevel[];
}

export type TopicState = 'todo' | 'learning' | 'done' | 'skipped';

/** Trạng thái tự đặt thắng; nếu không có thì suy ra từ mục đã tích trong các bài gắn với chủ đề. */
export function topicState(progress: Progress, topic: Pick<LiteTopic, 'id' | 'items'>): TopicState {
  const mark = progress.topics[topic.id]?.s;
  if (mark) return mark;
  const done = topic.items.filter((id) => progress.items[id]).length;
  if (topic.items.length > 0 && done === topic.items.length) return 'done';
  return done > 0 ? 'learning' : 'todo';
}

/**
 * Mark cần lưu để chủ đề có trạng thái `choice`: `null` khi trạng thái suy ra từ bài học
 * đã đúng như vậy, ngược lại chính `choice` (trạng thái tự đặt luôn thắng).
 */
export function markFor(progress: Progress, topic: Pick<LiteTopic, 'id' | 'items'>, choice: TopicState): TopicMark | null {
  const topics = { ...progress.topics };
  delete topics[topic.id];
  return topicState({ ...progress, topics }, topic) === choice ? null : choice;
}

/** Chủ đề tuỳ chọn không tính vào tiến độ. */
export const isCounted = (topic: Pick<LiteTopic, 'kind'>) => topic.kind !== 'opt';

/** Đếm chủ đề chính đã xong; chủ đề bị bỏ qua bị loại khỏi cả tử và mẫu. */
export function tallyTopics(progress: Progress, topics: readonly LiteTopic[]): Tally {
  let done = 0;
  let total = 0;
  for (const topic of topics) {
    if (!isCounted(topic)) continue;
    const state = topicState(progress, topic);
    if (state === 'skipped') continue;
    total += 1;
    if (state === 'done') done += 1;
  }
  return { done, total };
}

/** Các cấp đứng trước cấp bắt đầu mà người học đã chọn ("Tôi đã biết"). */
export function skippedLevels(progress: Progress, roadmap: RoadmapLite): Set<Level> {
  const start = progress.start[roadmap.id];
  const index = start ? roadmap.levels.findIndex((l) => l.id === start) : 0;
  return new Set(roadmap.levels.slice(0, Math.max(index, 0)).map((l) => l.id));
}

function activeTopics(progress: Progress, roadmap: RoadmapLite) {
  const skipped = skippedLevels(progress, roadmap);
  return roadmap.levels
    .filter((level) => !skipped.has(level.id))
    .flatMap((level) => level.steps.flatMap((step) => step.topics.filter(isCounted).map((topic) => ({ step, topic }))));
}

/** Chủ đề cho nút "Học tiếp": ưu tiên chủ đề đang học, rồi tới chủ đề chưa học đầu tiên. */
export function nextTopic(progress: Progress, roadmap: RoadmapLite): { step: LiteStep; topic: LiteTopic } | undefined {
  const candidates = activeTopics(progress, roadmap);
  return (
    candidates.find((c) => topicState(progress, c.topic) === 'learning') ??
    candidates.find((c) => topicState(progress, c.topic) === 'todo')
  );
}

/** Tiến độ của cả roadmap, không tính các cấp người học đã đánh "đã biết". */
export function roadmapTally(progress: Progress, roadmap: RoadmapLite): Tally {
  return tallyTopics(progress, activeTopics(progress, roadmap).map((c) => c.topic));
}

/** Chủ đề đang học có hoạt động gần nhất trên mọi roadmap, dùng cho khối "Bạn đang học". */
export function currentTopic(
  progress: Progress,
  roadmaps: readonly RoadmapLite[],
): { roadmap: RoadmapLite; step: LiteStep; topic: LiteTopic; at: string } | undefined {
  let best: { roadmap: RoadmapLite; step: LiteStep; topic: LiteTopic; at: string } | undefined;
  for (const roadmap of roadmaps) {
    for (const step of roadmap.levels.flatMap((l) => l.steps)) {
      for (const topic of step.topics) {
        if (topicState(progress, topic) !== 'learning') continue;
        const times = topic.items.map((id) => progress.items[id]).filter((at): at is string => Boolean(at));
        const at = progress.topics[topic.id]?.at ?? times.sort().at(-1) ?? '';
        if (!best || at > best.at) best = { roadmap, step, topic, at };
      }
    }
  }
  return best;
}
