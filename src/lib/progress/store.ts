import type { Level } from '@/lib/content/constants';
import {
  emptyProgress,
  LEGACY_PROGRESS_STORAGE_KEY,
  mergeProgress,
  parseProgress,
  PROGRESS_STORAGE_KEY,
  setStart,
  setTopicMark,
  toggleItem,
  type Progress,
  type TopicMark,
} from './model';

/**
 * Kho tiến độ trên trình duyệt (architecture §7.1).
 * Ghi `localStorage`; nếu bị chặn thì giữ trong bộ nhớ và báo `persistent = false`.
 * Các tab đồng bộ với nhau qua sự kiện `storage`.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ProgressSnapshot {
  progress: Progress;
  persistent: boolean;
}

type Listener = () => void;

export class ProgressStore {
  private snapshot: ProgressSnapshot;
  private readonly listeners = new Set<Listener>();

  constructor(
    private readonly storage: StorageLike | null,
    private replacements: Readonly<Record<string, string>> = {},
  ) {
    this.snapshot = this.read();
  }

  getSnapshot = (): ProgressSnapshot => this.snapshot;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Cập nhật bảng mã thay thế khi trang có manifest mới. */
  setReplacements(replacements: Readonly<Record<string, string>>): void {
    this.replacements = replacements;
    this.reload();
  }

  toggle(id: string): void {
    this.write(toggleItem(this.snapshot.progress, id));
  }

  setTopic(id: string, mark: TopicMark | null): void {
    this.write(setTopicMark(this.snapshot.progress, id, mark));
  }

  setStart(roadmapId: string, level: Level | null): void {
    this.write(setStart(this.snapshot.progress, roadmapId, level));
  }

  /** Gộp tiến độ từ file nhập. Trả về số mục và chủ đề có trong file, hoặc `null` nếu file sai. */
  importData(raw: unknown): number | null {
    const incoming = parseProgress(raw, this.replacements);
    if (!incoming) return null;
    this.write(mergeProgress(this.snapshot.progress, incoming));
    return Object.keys(incoming.items).length + Object.keys(incoming.topics).length;
  }

  exportData(): Progress {
    return this.snapshot.progress;
  }

  /** Đọc lại từ storage, dùng khi tab khác vừa ghi. */
  reload(): void {
    this.snapshot = this.read();
    this.emit();
  }

  private read(): ProgressSnapshot {
    if (!this.storage) return { progress: this.snapshot?.progress ?? emptyProgress(), persistent: false };
    try {
      const raw = this.storage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) return { progress: parseProgress(JSON.parse(raw), this.replacements) ?? emptyProgress(), persistent: true };
      const legacy = this.storage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
      const migrated = legacy ? parseProgress(JSON.parse(legacy), this.replacements) : null;
      if (!migrated) return { progress: emptyProgress(), persistent: true };
      // Chuyển dữ liệu v1 sang khoá v2 một lần; giữ khoá v1 để có thể quay lui (spec §5).
      // Ghi lỗi (hết quota) thì vẫn dùng bản đã đọc, chỉ báo là không lưu được.
      try {
        this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(migrated));
        return { progress: migrated, persistent: true };
      } catch {
        return { progress: migrated, persistent: false };
      }
    } catch {
      return { progress: this.snapshot?.progress ?? emptyProgress(), persistent: false };
    }
  }

  private write(progress: Progress): void {
    let persistent = this.storage !== null;
    if (this.storage) {
      try {
        this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      } catch {
        persistent = false;
      }
    }
    this.snapshot = { progress, persistent };
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

function browserStorage(): StorageLike | null {
  try {
    const storage = window.localStorage;
    const probe = '__masteva_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

let shared: ProgressStore | undefined;

/** Kho dùng chung cho cả trang. Chỉ gọi ở trình duyệt. */
export function getProgressStore(): ProgressStore {
  if (!shared) {
    const store = new ProgressStore(browserStorage());
    window.addEventListener('storage', (event) => {
      if (event.key === PROGRESS_STORAGE_KEY) store.reload();
    });
    shared = store;
  }
  return shared;
}
