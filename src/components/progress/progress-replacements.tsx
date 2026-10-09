'use client';
import { useReplacements } from '@/lib/progress/use-progress';

/**
 * Đặt bảng mã thay thế ngay khi trang tải, ở mọi trang (trang chủ, trang callback đăng nhập…),
 * để tiến độ có mã cũ được đọc, gộp và đồng bộ theo mã mới trước khi tài khoản bắt đầu đồng bộ.
 */
export function ProgressReplacements({ replacements }: { replacements: Record<string, string> }) {
  useReplacements(replacements);
  return null;
}
