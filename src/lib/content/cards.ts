import 'server-only';
import { listRoadmapViews } from './manifest';
import type { CatalogIndex } from '@/lib/search/catalog';
import { catalogIndex, toLite, type RoadmapCardData } from './views';

/** Dữ liệu thẻ roadmap cho trang danh mục và trang chủ. */
export function roadmapCards(lang: string): RoadmapCardData[] {
  return listRoadmapViews(lang).map((view) => ({
    id: view.id,
    track: view.track,
    title: view.title,
    description: view.description,
    stepCount: view.stepCount,
    topicCount: view.topicCount,
    levels: view.levels.map((l) => ({ id: l.id, title: l.title })),
    lite: toLite(view),
  }));
}

/** Chỉ mục tìm kiếm roadmap và chủ đề cho trang chủ. */
export function catalog(lang: string): CatalogIndex {
  return catalogIndex(listRoadmapViews(lang));
}
