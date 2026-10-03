import { describe, expect, it } from 'vitest';
import type { Topic } from '@/lib/content/schema';
import { buildLessonContext, buildProjectView, buildRoadmapView, toLite, topicDetails, type ViewInput } from '@/lib/content/views';

const topic = (id: string, extra: Partial<Topic> = {}): Topic => ({ id, title: id.toUpperCase(), kind: 'core', requires: [], resources: [], ...extra });

const input: ViewInput = {
  lang: 'vi',
  roadmaps: [
    {
      id: 'java',
      area: 'backend',
      track: 'java',
      title: { vi: 'Java', en: 'Java EN' },
      description: { vi: 'Mô tả' },
      recommended: [],
      levels: [
        { id: 'foundation', title: { vi: 'Nền tảng' }, goal: { vi: 'Mục tiêu 1' }, steps: ['j1'] },
        { id: 'middle', title: { vi: 'Middle' }, goal: { vi: 'Mục tiêu 2' }, steps: ['j2'] },
      ],
    },
    {
      id: 'devops',
      area: 'devops',
      track: 'devops',
      title: { vi: 'DevOps' },
      description: { vi: 'Mô tả' },
      recommended: ['j1'],
      levels: [{ id: 'foundation', title: { vi: 'Nền tảng' }, goal: { vi: 'G' }, steps: ['d1', 'd2'] }],
    },
  ],
  steps: new Map([
    ['j1', { id: 'j1', code: 'J1', title: 'Một', optional: false, topics: [topic('j1.a')], links: [], pages: [] }],
    ['j2', { id: 'j2', code: 'J2', title: 'Hai', optional: false, topics: [topic('j2.b', { requires: ['j1.a'] })], links: [{ step: 'd1', note: 'Container' }], pages: [] }],
    ['d1', { id: 'd1', code: 'D1', title: 'Linux', optional: false, topics: [topic('d1.x'), topic('d1.y', { kind: 'opt' })], links: [], pages: ['d1-1'] }],
    ['d2', { id: 'd2', code: 'D2', title: 'Mesh', optional: true, topics: [topic('d2.z')], links: [], pages: [] }],
  ]),
  lessons: [{ id: 'd1.1', stepId: 'd1', slug: 'd1-1', path: '/learn/d1/d1-1', title: 'Tiến trình', checkIds: ['d1.1.a', 'd1.1.b'], topics: ['d1.x'] }],
  projects: [
    {
      id: 'neobank',
      title: { vi: 'Neobank mini' },
      summary: { vi: 'Tóm tắt' },
      milestones: [
        { id: 'neobank.one', title: { vi: 'Mốc một' }, needs: ['j2'] },
        { id: 'neobank.two', title: { vi: 'Mốc hai' }, needs: ['d1.x'] },
      ],
    },
  ],
};

describe('buildRoadmapView', () => {
  it('numbers steps across levels and localizes titles', () => {
    const view = buildRoadmapView({ ...input, lang: 'en' }, 'java')!;
    expect(view.title).toBe('Java EN');
    expect(view.levels.map((l) => [l.index, l.steps.map((s) => s.number)])).toEqual([
      [1, [1]],
      [2, [2]],
    ]);
    expect(view.stepCount).toBe(2);
    expect(view.topicCount).toBe(2);
  });

  it('attaches lessons, items, requires, links and project uses', () => {
    const devops = buildRoadmapView(input, 'devops')!;
    const d1 = devops.levels[0].steps[0];
    expect(d1.lessons.map((l) => l.id)).toEqual(['d1.1']);
    expect(d1.topics[0]).toMatchObject({ id: 'd1.x', items: ['d1.1.a', 'd1.1.b'], projects: [{ projectId: 'neobank', milestoneIndex: 2 }] });
    expect(devops.recommended).toEqual([{ id: 'j1', code: 'J1', title: 'Một', roadmapId: 'java' }]);

    const j2 = buildRoadmapView(input, 'java')!.levels[1].steps[0];
    expect(j2.links).toEqual([{ id: 'd1', code: 'D1', title: 'Linux', roadmapId: 'devops', note: 'Container' }]);
    expect(j2.topics[0].requires).toEqual([{ id: 'j1.a', title: 'J1.A', stepId: 'j1', roadmapId: 'java' }]);
    expect(j2.projects).toEqual([{ projectId: 'neobank', projectTitle: 'Neobank mini', milestoneTitle: 'Mốc một', milestoneIndex: 1 }]);
  });

  it('treats every topic of an optional step as optional', () => {
    expect(buildRoadmapView(input, 'devops')!.levels[0].steps[1].topics[0].kind).toBe('opt');
  });

  it('gives each topic its position in the step and its neighbours in roadmap order', () => {
    const java = buildRoadmapView(input, 'java')!;
    const [a] = java.levels[0].steps[0].topics;
    const [b] = java.levels[1].steps[0].topics;
    expect(a).toMatchObject({ position: { index: 1, count: 1 }, next: { id: 'j2.b', title: 'J2.B' } });
    expect(a.prev).toBeUndefined();
    expect(b).toMatchObject({ prev: { id: 'j1.a', title: 'J1.A' } });
    expect(b.next).toBeUndefined();

    const devops = buildRoadmapView(input, 'devops')!.levels[0].steps;
    expect(devops[0].topics[1]).toMatchObject({ position: { index: 2, count: 2 }, prev: { id: 'd1.x' }, next: { id: 'd2.z' } });
  });

  it("orders a topic's lessons by the step's pages, not by file name", () => {
    const d1 = input.steps.get('d1')!;
    const ordered: ViewInput = {
      ...input,
      steps: new Map([...input.steps, ['d1', { ...d1, pages: ['d1-10', 'd1-1'] }]]),
      lessons: [
        ...input.lessons,
        { id: 'd1.10', stepId: 'd1', slug: 'd1-10', path: '/learn/d1/d1-10', title: 'Mười', checkIds: ['d1.10.a'], topics: ['d1.x'] },
      ],
    };
    const view = buildRoadmapView(ordered, 'devops')!;
    expect(view.levels[0].steps[0].topics[0].lessons.map((l) => l.id)).toEqual(['d1.10', 'd1.1']);
    expect(toLite(view).levels[0].steps[0].topics[0].lesson).toBe('/learn/d1/d1-10');
  });

  it('returns undefined for an unknown roadmap', () => {
    expect(buildRoadmapView(input, 'nope')).toBeUndefined();
  });
});

describe('toLite', () => {
  it('keeps only what the browser needs', () => {
    expect(toLite(buildRoadmapView(input, 'devops')!)).toEqual({
      id: 'devops',
      title: 'DevOps',
      levels: [
        {
          id: 'foundation',
          steps: [
            {
              id: 'd1',
              code: 'D1',
              topics: [
                { id: 'd1.x', title: 'D1.X', kind: 'core', items: ['d1.1.a', 'd1.1.b'], lesson: '/learn/d1/d1-1' },
                { id: 'd1.y', title: 'D1.Y', kind: 'opt', items: [] },
              ],
            },
            { id: 'd2', code: 'D2', topics: [{ id: 'd2.z', title: 'D2.Z', kind: 'opt', items: [] }] },
          ],
        },
      ],
    });
  });
});

describe('buildProjectView', () => {
  it('resolves step and topic needs with their counted topics', () => {
    const view = buildProjectView(input, 'neobank')!;
    expect(view.milestones[0].needs[0]).toMatchObject({ kind: 'step', id: 'j2', code: 'J2', roadmapId: 'java', topics: [{ id: 'j2.b' }] });
    expect(view.milestones[1].needs[0]).toMatchObject({ kind: 'topic', id: 'd1.x', code: 'D1', roadmapId: 'devops', topics: [{ id: 'd1.x' }] });
  });
});

describe('buildLessonContext', () => {
  it('returns the roadmap, step and topics of a lesson', () => {
    expect(buildLessonContext(input, 'd1.1')).toEqual({
      roadmap: { id: 'devops', title: 'DevOps', track: 'devops' },
      step: { id: 'd1', code: 'D1', title: 'Linux', roadmapId: 'devops' },
      topics: [{ id: 'd1.x', title: 'D1.X', stepId: 'd1', roadmapId: 'devops' }],
    });
  });
});

describe('topicDetails', () => {
  it('keys every topic by id with its step and level, for the drawer JSON', () => {
    const details = topicDetails(buildRoadmapView(input, 'java')!);
    expect(Object.keys(details)).toEqual(['j1.a', 'j2.b']);
    expect(details['j2.b']).toMatchObject({
      id: 'j2.b',
      step: { code: 'J2', title: 'Hai' },
      level: 'Middle',
      position: { index: 1, count: 1 },
      prev: { id: 'j1.a' },
      requires: [{ id: 'j1.a', roadmapId: 'java' }],
    });
  });
});
