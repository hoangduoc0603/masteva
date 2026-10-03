import type { Tokenizer } from 'zbsearch';

/**
 * Tokenizer tìm kiếm cho tiếng Việt (ADR-005).
 *
 * Bộ tách từ mặc định chỉ bỏ được một phần dấu (ví dụ "tiến" vẫn giữ "ế"),
 * nên gõ không dấu sẽ không ra kết quả. Ở đây mọi từ được đưa về dạng không dấu:
 * chữ thường → NFD → bỏ dấu → `đ` thành `d`, rồi tách theo chữ và số Unicode.
 * Nội dung và từ khoá đi qua cùng tokenizer, nên "tien trinh" và "tiến trình" cho cùng kết quả.
 */
export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/đ/g, 'd');
}

const WORD = /[\p{L}\p{N}]+/gu;

export function tokenizeVietnamese(text: string): string[] {
  return [...new Set(normalizeVietnamese(text).match(WORD) ?? [])];
}

export function createVietnameseTokenizer(): Tokenizer {
  return {
    language: 'vietnamese',
    normalizationCache: new Map(),
    tokenize: (raw: string) => tokenizeVietnamese(raw),
  };
}
