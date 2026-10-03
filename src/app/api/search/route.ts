import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createVietnameseTokenizer } from '@/lib/search/vi-tokenizer';

export const revalidate = false;

// Chỉ mục tĩnh sinh lúc build; tokenizer riêng cho tiếng Việt (ADR-005).
// Trình duyệt dùng cùng tokenizer khi tìm, xem src/components/search.tsx.
export const { staticGET: GET } = createFromSource(source, {
  tokenizer: createVietnameseTokenizer(),
});
