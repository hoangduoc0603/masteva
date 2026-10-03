'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { emptyProgress } from './model';
import { getProgressStore, type ProgressSnapshot } from './store';

/** Snapshot dùng khi render phía máy chủ: chưa có tiến độ, chưa có cảnh báo. */
const SERVER_SNAPSHOT: ProgressSnapshot = { progress: emptyProgress(), persistent: true };

const subscribe = (listener: () => void) => getProgressStore().subscribe(listener);
const getSnapshot = () => getProgressStore().getSnapshot();
const getServerSnapshot = () => SERVER_SNAPSHOT;

export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Đặt bảng mã thay thế từ manifest của trang, để tiến độ cũ được ánh xạ đúng. */
export function useReplacements(replacements: Readonly<Record<string, string>>): void {
  useEffect(() => {
    if (Object.keys(replacements).length > 0) getProgressStore().setReplacements(replacements);
  }, [replacements]);
}
