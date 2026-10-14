import { describe, expect, it } from 'vitest';
import { MAX_LESSONS_PER_SEARCH_FILE, planSearchFiles } from '@/lib/search/files';

const step = (id: string, lessons: number) => ({ id, lessons });

describe('planSearchFiles', () => {
  it('puts a small roadmap in one file and leaves out steps without lessons', () => {
    expect(planSearchFiles([{ id: 'java', steps: [step('j1', 3), step('j2', 0), step('j3', 4)] }])).toEqual([
      { id: 'java-1', roadmap: 'java', steps: ['j1', 'j3'] },
    ]);
  });

  it('starts a new file at a step boundary when the next step would exceed the limit', () => {
    const plan = planSearchFiles([{ id: 'devops', steps: [step('d0', 20), step('d1', 8), step('d2', 5), step('d3', 25)] }], 30);
    expect(plan).toEqual([
      { id: 'devops-1', roadmap: 'devops', steps: ['d0', 'd1'] },
      { id: 'devops-2', roadmap: 'devops', steps: ['d2', 'd3'] },
    ]);
  });

  it('fills a file up to exactly the limit', () => {
    expect(planSearchFiles([{ id: 'k', steps: [step('k1', 20), step('k2', 10), step('k3', 1)] }], 30).map((f) => f.steps)).toEqual([['k1', 'k2'], ['k3']]);
  });

  it('gives a step larger than the limit a file of its own', () => {
    expect(planSearchFiles([{ id: 'x', steps: [step('a', 10), step('b', 40), step('c', 3)] }], 30).map((f) => f.steps)).toEqual([['a'], ['b'], ['c']]);
  });

  it('numbers files per roadmap, keeps roadmap order and skips roadmaps without lessons', () => {
    const plan = planSearchFiles(
      [
        { id: 'java', steps: [step('j1', 2)] },
        { id: 'microservices', steps: [step('m1', 0)] },
        { id: 'devops', steps: [step('d0', 2), step('d1', 2)] },
      ],
      3,
    );
    expect(plan.map((f) => f.id)).toEqual(['java-1', 'devops-1', 'devops-2']);
  });

  it('defaults to a limit that keeps a file well under the 2 MB budget', () => {
    expect(MAX_LESSONS_PER_SEARCH_FILE).toBe(30);
    expect(planSearchFiles([{ id: 'r', steps: [step('a', 30), step('b', 1)] }])).toHaveLength(2);
  });
});
