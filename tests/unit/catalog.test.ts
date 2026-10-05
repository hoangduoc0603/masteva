import { describe, expect, it } from 'vitest';
import { searchCatalog, type CatalogIndex } from '@/lib/search/catalog';

const index: CatalogIndex = {
  roadmaps: [
    { id: 'java', track: 'java', title: 'Java backend', description: 'Làm chủ Spring Boot trên production' },
    { id: 'devops', track: 'devops', title: 'DevOps', description: 'Container và Kubernetes' },
  ],
  topics: [
    { roadmapId: 'java', code: 'J12', stepTitle: 'Lưu trữ dữ liệu', id: 'j12.tx', title: 'Transaction và mức isolation', hasLesson: true },
    { roadmapId: 'java', code: 'J16', stepTitle: 'Cache và messaging', id: 'j16.kafka', title: 'Kafka hoặc RabbitMQ', hasLesson: true },
    { roadmapId: 'java', code: 'J16', stepTitle: 'Cache và messaging', id: 'j16.cache', title: 'Cache-aside và TTL', hasLesson: false },
    { roadmapId: 'devops', code: 'D5', stepTitle: 'Kafka trên Kubernetes', id: 'd5.ops', title: 'Vận hành broker', hasLesson: false },
    { roadmapId: 'java', code: 'J2', stepTitle: 'Ngôn ngữ Java', id: 'j2.dk', title: 'Điều khiển luồng', hasLesson: true },
  ],
};

describe('searchCatalog', () => {
  it('returns nothing for a blank query', () => {
    expect(searchCatalog(index, '   ')).toEqual({ roadmaps: [], topics: [], totalTopics: 0 });
  });

  it('matches without diacritics or case and marks the original title', () => {
    const r = searchCatalog(index, '  DIEU khien ');
    expect(r.topics.map((h) => h.topic.id)).toEqual(['j2.dk']);
    expect(r.topics[0].mark).toEqual([0, 10]);
    expect('Điều khiển luồng'.slice(0, 10)).toBe('Điều khiển');
  });

  it('puts title matches before step-title matches without duplicates', () => {
    const r = searchCatalog(index, 'kafka');
    expect(r.topics.map((h) => h.topic.id)).toEqual(['j16.kafka', 'd5.ops']);
    expect(r.topics[1].mark).toBeNull();
  });

  it('matches roadmaps by title or description', () => {
    expect(searchCatalog(index, 'kubernetes').roadmaps.map((x) => x.id)).toEqual(['devops']);
    expect(searchCatalog(index, 'spring').roadmaps.map((x) => x.id)).toEqual(['java']);
  });

  it('limits topics but reports the total', () => {
    const r = searchCatalog(index, 'a', 2);
    expect(r.topics).toHaveLength(2);
    expect(r.totalTopics).toBeGreaterThan(2);
  });
});
