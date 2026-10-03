'use client';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tuỳ chọn hiển thị của người xem (view sơ đồ/danh sách, ẩn mục bỏ qua).
 * Lưu localStorage; nếu bị chặn thì giữ trong bộ nhớ của tab.
 */
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export function usePref(key: string, fallback: string): [string, (value: string) => void] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const set = useCallback(
    (value: string) => {
      memory.set(key, value);
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Bộ nhớ trình duyệt bị chặn: giữ trong bộ nhớ tab.
      }
      listeners.forEach((l) => l());
    },
    [key],
  );
  return [raw ?? fallback, set];
}
