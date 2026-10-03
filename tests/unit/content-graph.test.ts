import { describe, expect, it } from 'vitest';
import { projectSchema, roadmapSchema, topicSchema } from '@/lib/content/schema';
import { mergeKeys, validateGraph, type ContentGraph } from '@/lib/content/validate';

const graph = (over: Partial<ContentGraph> = {}): ContentGraph => ({
  roadmaps: [
    { id: 'java', recommended: [], levels: [{ steps: ['j1', 'j2'] }] },
    { id: 'devops', recommended: ['j1'], levels: [{ steps: ['d1'] }] },
  ],
  steps: [
    { id: 'j1', topics: [{ id: 'j1.a', requires: [] }], links: [] },
    { id: 'j2', topics: [{ id: 'j2.b', requires: ['j1.a'] }], links: [{ step: 'd1' }] },
    { id: 'd1', topics: [{ id: 'd1.c', requires: [] }], links: [] },
  ],
  projects: [{ id: 'neobank', milestones: [{ id: 'neobank.one', needs: ['j2', 'd1.c'] }] }],
  lessons: [{ id: 'j2.1', stepId: 'j2', topics: ['j2.b', 'd1.c'] }],
  ...over,
});

describe('validateGraph', () => {
  it('accepts a consistent graph', () => {
    expect(validateGraph(graph())).toEqual([]);
  });

  it('requires every step to belong to exactly one roadmap', () => {
    const errors = validateGraph(
      graph({
        roadmaps: [
          { id: 'java', recommended: [], levels: [{ steps: ['j1', 'j2', 'x9'] }] },
          { id: 'devops', recommended: [], levels: [{ steps: ['j1'] }] },
        ],
      }),
    ).join('\n');
    expect(errors).toMatch(/bước "x9" không tồn tại/);
    expect(errors).toMatch(/"j1" thuộc cả "java" và "devops"/);
    expect(errors).toMatch(/bước "d1" không thuộc roadmap nào/);
  });

  it('checks topic ids', () => {
    const steps = [
      { id: 'j1', topics: [{ id: 'j1.a', requires: [] }, { id: 'j9.wrong', requires: [] }], links: [] },
      { id: 'j2', topics: [{ id: 'j1.a', requires: [] }], links: [] },
      { id: 'd1', topics: [], links: [] },
    ];
    const errors = validateGraph(graph({ steps, projects: [], lessons: [] })).join('\n');
    expect(errors).toMatch(/"j9\.wrong" phải bắt đầu bằng "j1\."/);
    expect(errors).toMatch(/mã chủ đề bị trùng: j1\.a/);
  });

  it('reports dangling references', () => {
    const steps = [
      { id: 'j1', topics: [{ id: 'j1.a', requires: ['j1.none'] }], links: [{ step: 'zz' }] },
      { id: 'j2', topics: [{ id: 'j2.b', requires: [] }], links: [] },
      { id: 'd1', topics: [{ id: 'd1.c', requires: [] }], links: [] },
    ];
    const errors = validateGraph(
      graph({
        steps,
        roadmaps: [
          { id: 'java', recommended: ['nope'], levels: [{ steps: ['j1', 'j2'] }] },
          { id: 'devops', recommended: [], levels: [{ steps: ['d1'] }] },
        ],
        projects: [{ id: 'neobank', milestones: [{ id: 'neobank.one', needs: ['ghost'] }] }],
        lessons: [],
      }),
    ).join('\n');
    expect(errors).toMatch(/"requires" trỏ tới "j1\.none"/);
    expect(errors).toMatch(/"links" trỏ tới bước "zz"/);
    expect(errors).toMatch(/"recommended" trỏ tới bước "nope"/);
    expect(errors).toMatch(/"needs" trỏ tới "ghost"/);
  });

  it('checks milestone ids', () => {
    const projects = [{ id: 'neobank', milestones: [{ id: 'other.one', needs: ['j1'] }, { id: 'other.one', needs: ['j1'] }] }];
    const errors = validateGraph(graph({ projects })).join('\n');
    expect(errors).toMatch(/"other\.one" phải bắt đầu bằng "neobank\."/);
    expect(errors).toMatch(/mã mốc bị trùng: other\.one/);
  });

  it('checks lesson topics', () => {
    const errors = validateGraph(graph({ lessons: [{ id: 'j2.1', stepId: 'j2', topics: ['j1.a', 'j2.none'] }] })).join('\n');
    expect(errors).toMatch(/chủ đề "j1\.a" thuộc bước "j1"/);
    expect(errors).toMatch(/chủ đề "j2\.none" không tồn tại/);
  });
});

describe('schemas', () => {
  it('requires options for pick topics and defaults kind to core', () => {
    expect(topicSchema.safeParse({ id: 'j7.build-tool', title: 'Maven hoặc Gradle', kind: 'pick' }).success).toBe(false);
    expect(topicSchema.parse({ id: 'j5.generics', title: 'Generics' })).toMatchObject({ kind: 'core', requires: [], resources: [] });
    expect(topicSchema.safeParse({ id: 'J5.Generics', title: 'x' }).success).toBe(false);
  });

  it('parses a roadmap with levels', () => {
    const roadmap = roadmapSchema.parse({
      id: 'java',
      area: 'backend',
      track: 'java',
      title: { vi: 'Java' },
      description: { vi: 'Mô tả' },
      levels: [{ id: 'foundation', title: { vi: 'Nền tảng' }, goal: { vi: 'Mục tiêu' }, steps: ['j1'] }],
    });
    expect(roadmap.recommended).toEqual([]);
    expect(roadmapSchema.safeParse({ ...roadmap, levels: [] }).success).toBe(false);
  });

  it('parses a project', () => {
    expect(
      projectSchema.safeParse({
        id: 'neobank',
        title: { vi: 'Neobank mini' },
        summary: { vi: 'Tóm tắt' },
        milestones: [{ id: 'neobank.discovery', title: { vi: 'Khám phá' }, needs: ['m3'] }],
      }).success,
    ).toBe(true);
  });
});

describe('mergeKeys', () => {
  it('appends new keys sorted, keeping existing order', () => {
    expect(mergeKeys(['z', 'a'], new Set(['a', 'c', 'b']))).toEqual(['z', 'a', 'b', 'c']);
  });
});
