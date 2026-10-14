/**
 * Số bài tối đa trong một file tìm kiếm (ADR-009). Mỗi bài chiếm khoảng 20 đến 35 KB trong file,
 * nên 30 bài giữ một file quanh 1 MB, cách xa ngân sách 2 MB kể cả khi bài dài.
 */
export const MAX_LESSONS_PER_SEARCH_FILE = 30;

export interface SearchFilePlan {
  /** Mã file, cũng là tên trong đường dẫn `/<lang>/search/<id>.json`. */
  id: string;
  roadmap: string;
  /** Các chặng có bài nằm trong file, theo thứ tự lộ trình. */
  steps: string[];
}

interface RoadmapLessons {
  id: string;
  /** Mọi chặng của roadmap theo thứ tự lộ trình, kèm số bài. */
  steps: readonly { id: string; lessons: number }[];
}

/**
 * Chia nội dung tìm kiếm của mỗi roadmap thành các file `<roadmap>-<n>`: gom chặng theo thứ tự lộ trình,
 * sang file mới khi thêm chặng kế tiếp sẽ vượt `max` bài. Chặng không bị cắt đôi, nên một chặng nhiều hơn
 * `max` bài nằm riêng một file. Chặng chưa có bài và roadmap chưa có bài không sinh file.
 */
export function planSearchFiles(roadmaps: readonly RoadmapLessons[], max: number = MAX_LESSONS_PER_SEARCH_FILE): SearchFilePlan[] {
  const files: SearchFilePlan[] = [];
  for (const roadmap of roadmaps) {
    let current: SearchFilePlan | undefined;
    let count = 0;
    let index = 0;
    for (const step of roadmap.steps) {
      if (step.lessons === 0) continue;
      if (!current || count + step.lessons > max) {
        index += 1;
        current = { id: `${roadmap.id}-${index}`, roadmap: roadmap.id, steps: [] };
        files.push(current);
        count = 0;
      }
      current.steps.push(step.id);
      count += step.lessons;
    }
  }
  return files;
}
