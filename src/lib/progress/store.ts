import type { Level } from '@/lib/content/constants';
import { AUTH_STORAGE_KEY } from '@/lib/account/config';
import { initialProgressKey, queueEarlyChanges } from './account-sync';
import {
  applyReplacements,
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
  removeItem(key: string): void;
}

export interface ProgressSnapshot {
  progress: Progress;
  persistent: boolean;
}

type Listener = () => void;
type ChangeListener = (before: Progress, after: Progress) => void;

export class ProgressStore {
  private snapshot: ProgressSnapshot;
  private readonly listeners = new Set<Listener>();
  private readonly changeListeners = new Set<ChangeListener>();
  private readonly replacementListeners = new Set<Listener>();

  constructor(
    private readonly storage: StorageLike | null,
    private replacements: Readonly<Record<string, string>> = {},
    private key: string = PROGRESS_STORAGE_KEY,
  ) {
    this.snapshot = this.read();
  }

  /** Khoá đang lưu: tiến độ khách, hoặc bản sao của tài khoản khi đã đăng nhập. */
  get storageKey(): string {
    return this.key;
  }

  /** Chuyển sang khoá khác (đăng nhập, đăng xuất) và đọc lại. */
  switchKey(key: string): void {
    this.key = key;
    this.reload();
  }

  /** Báo thay đổi do người học làm, để đồng bộ tài khoản xếp vào hàng đợi. */
  onChange = (listener: ChangeListener): (() => void) => {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  };

  getSnapshot = (): ProgressSnapshot => this.snapshot;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getReplacements = (): Readonly<Record<string, string>> => this.replacements;

  /** Báo khi bảng mã thay thế đổi, để đồng bộ tài khoản kéo lại theo mã mới. */
  onReplacements = (listener: Listener): (() => void) => {
    this.replacementListeners.add(listener);
    return () => this.replacementListeners.delete(listener);
  };

  /**
   * Cập nhật bảng mã thay thế khi trang có manifest mới; bỏ qua nếu bảng không đổi.
   * Chỉ báo giao diện vẽ lại khi bảng mới làm đổi tiến độ đang lưu: mọi trang đều gọi hàm này lúc tải,
   * nên không vẽ lại thừa khi tiến độ không có mã cũ nào.
   */
  setReplacements(replacements: Readonly<Record<string, string>>): void {
    if (sameReplacements(this.replacements, replacements)) return;
    this.replacements = replacements;
    const next = this.read();
    if (next.persistent !== this.snapshot.persistent || JSON.stringify(next.progress) !== JSON.stringify(this.snapshot.progress)) {
      this.snapshot = next;
      this.emit();
    }
    for (const listener of this.replacementListeners) listener();
  }

  toggle(id: string): void {
    this.update(toggleItem(this.snapshot.progress, id));
  }

  setTopic(id: string, mark: TopicMark | null): void {
    this.update(setTopicMark(this.snapshot.progress, id, mark));
  }

  setStart(roadmapId: string, level: Level | null): void {
    this.update(setStart(this.snapshot.progress, roadmapId, level));
  }

  /** Gộp tiến độ từ file nhập. Trả về số mục và chủ đề có trong file, hoặc `null` nếu file sai. */
  importData(raw: unknown): number | null {
    const incoming = parseProgress(raw, this.replacements);
    if (!incoming) return null;
    this.update(mergeProgress(this.snapshot.progress, incoming));
    return Object.keys(incoming.items).length + Object.keys(incoming.topics).length;
  }

  /** Ghi bản tiến độ từ server, không coi là thao tác của người học. */
  replaceProgress(progress: Progress): void {
    this.write(applyReplacements(progress, this.replacements));
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
      const raw = this.storage.getItem(this.key);
      if (raw) return { progress: parseProgress(JSON.parse(raw), this.replacements) ?? emptyProgress(), persistent: true };
      // Khoá v1 chỉ là tiến độ khách; bản sao của tài khoản không nhận nó.
      if (this.key !== PROGRESS_STORAGE_KEY) return { progress: emptyProgress(), persistent: true };
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

  private update(next: Progress): void {
    const before = this.snapshot.progress;
    this.write(next);
    for (const listener of this.changeListeners) listener(before, next);
  }

  private write(progress: Progress): void {
    let persistent = this.storage !== null;
    if (this.storage) {
      try {
        this.storage.setItem(this.key, JSON.stringify(progress));
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

export function browserStorage(): StorageLike | null {
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

/** Storage trong bộ nhớ, dùng khi trình duyệt chặn localStorage. */
export function memoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

let shared: ProgressStore | undefined;
let releaseEarlyQueue: (() => void) | undefined;

/** Kho dùng chung cho cả trang. Chỉ gọi ở trình duyệt. */
export function getProgressStore(): ProgressStore {
  if (!shared) {
    const storage = browserStorage();
    // Đã đăng nhập trên máy này thì mở ngay bản sao của tài khoản, không chờ supabase-js (spec 2026-10-07 §6).
    const store = new ProgressStore(storage, {}, storage ? initialProgressKey(storage, AUTH_STORAGE_KEY) : undefined);
    if (storage) releaseEarlyQueue = queueEarlyChanges(store, storage);
    window.addEventListener('storage', (event) => {
      if (event.key === store.storageKey) store.reload();
    });
    shared = store;
  }
  return shared;
}

/** Ngừng xếp hàng tạm; gọi ngay trước khi `AccountSync` nhận việc, hoặc khi phiên không còn. */
export function stopEarlyQueue(): void {
  releaseEarlyQueue?.();
  releaseEarlyQueue = undefined;
}

function sameReplacements(a: Readonly<Record<string, string>>, b: Readonly<Record<string, string>>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && b[key] === a[key]);
}
