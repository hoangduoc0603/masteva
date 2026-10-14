'use client';
import { createContext, useContext } from 'react';

/**
 * Phạm vi tìm nội dung bài, tính lúc build (`getSearchScope`): mã mọi file tìm kiếm, chặng thuộc roadmap nào,
 * và các file của từng roadmap (một roadmap nhiều bài được chia thành nhiều file).
 */
export interface SearchScope {
  files: string[];
  steps: Record<string, string>;
  roadmaps: Record<string, string[]>;
}

const SearchScopeContext = createContext<SearchScope>({ files: [], steps: {}, roadmaps: {} });

export const SearchScopeProvider = SearchScopeContext.Provider;

export function useSearchScope(): SearchScope {
  return useContext(SearchScopeContext);
}

/** Roadmap của trang đang xem, suy từ đường dẫn: `/<lang>/roadmaps/<id>` hoặc `/<lang>/learn/<chặng>/…`. */
export function roadmapOfPath(pathname: string, scope: SearchScope): string | undefined {
  const [, , section, id] = pathname.split('/');
  if (section === 'roadmaps') return id && Object.hasOwn(scope.roadmaps, id) ? id : undefined;
  if (section === 'learn' && id && Object.hasOwn(scope.steps, id)) return scope.steps[id];
  return undefined;
}
