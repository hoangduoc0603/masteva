import { describe, expect, it } from 'vitest';
import { isProgress, setTopicMark, type Progress } from '@/lib/progress/model';
import {
  currentTopic,
  markFor,
  nextTopic,
  roadmapTally,
  skippedLevels,
  tallyTopics,
  topicState,
  type RoadmapLite,
} from '@/lib/progress/roadmap';

const T1 = '2026-10-01T00:00:00.000Z';
const T2 = '2026-10-02T00:00:00.000Z';
const T3 = '2026-10-03T00:00:00.000Z';
const p = (over: Partial<Progress> = {}): Progress => ({ v: 2, items: {}, topics: {}, start: {}, ...over });

const java: RoadmapLite = {
  id: 'java',
  title: 'Java',
  levels: [
    {
      id: 'foundation',
      steps: [
        {
          id: 'j1',
          code: 'J1',
          topics: [
            { id: 'j1.a', title: 'A', kind: 'core', items: ['j1.1.x', 'j1.1.y'] },
            { id: 'j1.opt', title: 'Opt', kind: 'opt', items: [] },
          ],
        },
      ],
    },
    {
      id: 'middle',
      steps: [
        {
          id: 'j11',
          code: 'J11',
          topics: [
            { id: 'j11.b', title: 'B', kind: 'pick', items: [] },
            { id: 'j11.c', title: 'C', kind: 'core', items: [] },
          ],
        },
      ],
    },
  ],
};
const a = java.levels[0].steps[0].topics[0];

describe('topicState', () => {
  it('derives state from lesson items', () => {
    expect(topicState(p(), a)).toBe('todo');
    expect(topicState(p({ items: { 'j1.1.x': T1 } }), a)).toBe('learning');
    expect(topicState(p({ items: { 'j1.1.x': T1, 'j1.1.y': T1 } }), a)).toBe('done');
  });

  it('explicit mark wins over lesson items', () => {
    expect(topicState(p({ topics: { 'j1.a': { s: 'done', at: T1 } } }), a)).toBe('done');
    expect(topicState(p({ items: { 'j1.1.x': T1, 'j1.1.y': T1 }, topics: { 'j1.a': { s: 'skipped', at: T1 } } }), a)).toBe('skipped');
    expect(topicState(p({ items: { 'j1.1.x': T1, 'j1.1.y': T1 }, topics: { 'j1.a': { s: 'learning', at: T1 } } }), a)).toBe('learning');
  });

  it('treats a topic without lessons as todo until marked', () => {
    expect(topicState(p(), java.levels[1].steps[0].topics[1])).toBe('todo');
  });
});

describe('tallies', () => {
  it('counts core and pick topics, ignoring optional and skipped ones', () => {
    const topics = java.levels.flatMap((l) => l.steps.flatMap((s) => s.topics));
    const progress = p({ topics: { 'j1.a': { s: 'done', at: T1 }, 'j11.c': { s: 'skipped', at: T1 }, 'j1.opt': { s: 'done', at: T1 } } });
    expect(tallyTopics(progress, topics)).toEqual({ done: 1, total: 2 });
  });

  it('excludes skipped levels from the roadmap tally', () => {
    expect(roadmapTally(p(), java)).toEqual({ done: 0, total: 3 });
    expect(roadmapTally(p({ start: { java: 'middle' } }), java)).toEqual({ done: 0, total: 2 });
  });
});

describe('skippedLevels', () => {
  it('returns the levels before the starting level', () => {
    expect([...skippedLevels(p(), java)]).toEqual([]);
    expect([...skippedLevels(p({ start: { java: 'middle' } }), java)]).toEqual(['foundation']);
  });
});

describe('nextTopic', () => {
  it('returns the first todo counted topic', () => {
    expect(nextTopic(p(), java)?.topic.id).toBe('j1.a');
  });

  it('prefers a topic in progress', () => {
    expect(nextTopic(p({ topics: { 'j11.c': { s: 'learning', at: T1 } } }), java)?.topic.id).toBe('j11.c');
  });

  it('starts from the chosen level', () => {
    const result = nextTopic(p({ start: { java: 'middle' } }), java);
    expect(result?.topic.id).toBe('j11.b');
    expect(result?.step.id).toBe('j11');
  });

  it('returns undefined when everything is done', () => {
    const done = { s: 'done' as const, at: T1 };
    expect(nextTopic(p({ topics: { 'j1.a': done, 'j11.b': done, 'j11.c': done } }), java)).toBeUndefined();
  });
});

describe('currentTopic', () => {
  const devops: RoadmapLite = {
    id: 'devops',
    title: 'DevOps',
    levels: [{ id: 'foundation', steps: [{ id: 'd1', code: 'D1', topics: [{ id: 'd1.x', title: 'X', kind: 'core', items: ['d1.1.a', 'd1.1.b'] }] }] }],
  };

  it('picks the most recent topic in progress across roadmaps', () => {
    const progress = p({ items: { 'd1.1.a': T3 }, topics: { 'j11.c': { s: 'learning', at: T2 } } });
    expect(currentTopic(progress, [java, devops])).toMatchObject({ roadmap: { id: 'devops' }, topic: { id: 'd1.x' }, at: T3 });
  });

  it('returns undefined when nothing is in progress', () => {
    expect(currentTopic(p(), [java, devops])).toBeUndefined();
  });
});

describe('markFor', () => {
  const topic = { id: 'j1.a', items: ['j1.1.x', 'j1.1.y'] };

  it('stores an explicit "todo" when lesson items make the topic look started', () => {
    const progress = p({ items: { 'j1.1.x': T1 } });
    const mark = markFor(progress, topic, 'todo');
    expect(mark).toBe('todo');
    const next = setTopicMark(progress, topic.id, mark);
    expect(topicState(next, topic)).toBe('todo');
    expect(isProgress(next)).toBe(true);
  });

  it('clears the mark when the choice matches the state derived from lessons', () => {
    expect(markFor(p({ topics: { 'j1.a': { s: 'done', at: T1 } } }), topic, 'todo')).toBeNull();
    expect(markFor(p({ items: { 'j1.1.x': T1, 'j1.1.y': T2 } }), topic, 'done')).toBeNull();
  });

  it('stores the choice when it differs from the derived state', () => {
    expect(markFor(p(), topic, 'done')).toBe('done');
    expect(markFor(p({ items: { 'j1.1.x': T1 } }), topic, 'skipped')).toBe('skipped');
  });
});
