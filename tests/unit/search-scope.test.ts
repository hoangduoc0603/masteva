import { describe, expect, it } from 'vitest';
import { roadmapOfPath } from '@/lib/search/scope';

const scope = {
  files: ['java-1', 'devops-1', 'devops-2'],
  steps: { j1: 'java', d1: 'devops' },
  roadmaps: { java: ['java-1'], devops: ['devops-1', 'devops-2'] },
};

describe('roadmapOfPath', () => {
  it('reads the roadmap from a roadmap page or from the step of a lesson', () => {
    expect(roadmapOfPath('/vi/roadmaps/devops', scope)).toBe('devops');
    expect(roadmapOfPath('/en/learn/j1/j1-1', scope)).toBe('java');
  });

  it('returns nothing on other pages, unknown roadmaps and unknown steps', () => {
    expect(roadmapOfPath('/vi', scope)).toBeUndefined();
    expect(roadmapOfPath('/vi/roadmaps/microservices', scope)).toBeUndefined();
    expect(roadmapOfPath('/vi/roadmaps/__proto__', scope)).toBeUndefined();
    expect(roadmapOfPath('/vi/learn/__proto__/x', scope)).toBeUndefined();
    expect(roadmapOfPath('/vi/projects/neobank', scope)).toBeUndefined();
  });
});
