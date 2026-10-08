/**
 * Cấu hình tài khoản, đọc lúc build từ biến NEXT_PUBLIC_* (Next.js nhúng vào bundle).
 * Thiếu một trong hai thì tính năng tài khoản ẩn hoàn toàn.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const accountEnabled = SUPABASE_URL !== '' && SUPABASE_PUBLISHABLE_KEY !== '';

/** Khoá supabase-js lưu phiên; có khoá này thì mới cần tải supabase-js khi mở trang. */
export const AUTH_STORAGE_KEY = 'masteva:auth';

export function hasStoredSession(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
