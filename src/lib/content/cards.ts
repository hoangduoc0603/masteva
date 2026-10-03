import 'server-only';
import { listRoadmapViews } from './manifest';
import { toLite, type RoadmapCardData } from './views';

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
