import { format } from '@/lib/format';
import type { Progress, Tally } from '@/lib/progress/model';
import { skippedLevels, tallyTopics, topicState, type RoadmapLite, type TopicState } from '@/lib/progress/roadmap';

/**
 * Gắn trạng thái tiến độ lên sơ đồ đã render sẵn (hợp đồng DOM của RoadmapMap).
 * Sơ đồ do Server Component tạo, nên cập nhật bằng thuộc tính thay vì render lại phía trình duyệt.
 */
export interface DomLabels {
  state: Record<TopicState, string>;
  stepCount: string;
}

const byAttr = (root: ParentNode, attr: string, value: string) =>
  root.querySelectorAll<HTMLElement>(`[${attr}="${CSS.escape(value)}"]`);

function setTally(root: ParentNode, key: string, tally: Tally, template: string) {
  byAttr(root, 'data-count', key).forEach((el) => {
    el.textContent = format(template, { done: tally.done, total: tally.total });
  });
  byAttr(root, 'data-bar', key).forEach((el) => {
    el.style.transform = `scaleX(${tally.total === 0 ? 0 : tally.done / tally.total})`;
  });
}

export function applyProgress(root: HTMLElement, lite: RoadmapLite, progress: Progress, hereStepId: string | undefined, labels: DomLabels) {
  const skipped = skippedLevels(progress, lite);
  for (const level of lite.levels) {
    byAttr(root, 'data-level', level.id).forEach((el) => el.toggleAttribute('data-known', skipped.has(level.id)));
    setTally(root, `level:${level.id}`, tallyTopics(progress, level.steps.flatMap((s) => s.topics)), labels.stepCount);
    for (const step of level.steps) {
      const stepTally = tallyTopics(progress, step.topics);
      setTally(root, `step:${step.id}`, stepTally, labels.stepCount);
      byAttr(root, 'data-step', step.id).forEach((el) => {
        el.toggleAttribute('data-current', step.id === hereStepId);
        el.toggleAttribute('data-done', stepTally.total > 0 && stepTally.done === stepTally.total);
      });
      byAttr(root, 'data-here', step.id).forEach((el) => {
        el.hidden = step.id !== hereStepId;
      });
      for (const topic of step.topics) {
        const state = topicState(progress, topic);
        byAttr(root, 'data-topic', topic.id).forEach((chip) => {
          chip.dataset.st = state;
          const label = chip.querySelector('[data-st-label]');
          if (label) label.textContent = `, ${labels.state[state]}`;
        });
      }
    }
  }
}
