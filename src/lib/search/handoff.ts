/**
 * Chuyển từ khoá từ ô tìm trang chủ sang hộp tìm nội dung bài (⌘K): hộp đọc một lần khi mở.
 * Không có React state chung giữa hai component nên dùng biến module.
 */
let pending: string | null = null;

export function handOffQuery(query: string): void {
  pending = query;
}

export function takeHandOff(): string | null {
  const query = pending;
  pending = null;
  return query;
}
