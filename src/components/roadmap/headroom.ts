'use client';
import { useEffect, type RefObject } from 'react';

/** Bỏ qua chuyển động nhỏ hơn mức này (px) để header không nháy khi cuộn chậm hoặc lực quán tính. */
const JITTER = 4;

/**
 * Header của site có ẩn không: luôn hiện khi chưa cuộn qua `start` (đầu bản đồ), ẩn khi cuộn xuống,
 * hiện lại ngay khi cuộn lên.
 */
export function headerHidden(prev: boolean, y: number, lastY: number, start: number): boolean {
  if (y <= start) return false;
  if (y - lastY > JITTER) return true;
  if (lastY - y > JITTER) return false;
  return prev;
}

const ATTR = 'data-header-hidden';

/**
 * Ẩn header khi cuộn xuống trên trang roadmap để bản đồ có thêm chỗ; thanh cấp dính lên sát mép trên
 * (CSS theo `html[data-header-hidden]`). Tab vào header thì hiện lại.
 */
export function useHideHeaderOnScroll(bar: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = document.documentElement;
    const header = document.getElementById('nd-nav');
    let hidden = false;
    let lastY = window.scrollY;
    let focused = false;
    let frame = 0;

    const apply = (next: boolean) => {
      if (next === hidden) return;
      hidden = next;
      root.toggleAttribute(ATTR, hidden);
    };
    // Bắt đầu ẩn khi đã cuộn qua phần đầu trang, tức lúc thanh cấp bắt đầu dính.
    const start = () => {
      const top = bar.current?.previousElementSibling?.getBoundingClientRect().bottom;
      return top === undefined ? 0 : top + window.scrollY;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        apply(!focused && headerHidden(hidden, y, lastY, start()));
        lastY = y;
      });
    };
    const onFocusIn = () => {
      focused = true;
      apply(false);
    };
    const onFocusOut = () => {
      focused = false;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    header?.addEventListener('focusin', onFocusIn);
    header?.addEventListener('focusout', onFocusOut);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      header?.removeEventListener('focusin', onFocusIn);
      header?.removeEventListener('focusout', onFocusOut);
      root.removeAttribute(ATTR);
    };
  }, [bar]);
}
