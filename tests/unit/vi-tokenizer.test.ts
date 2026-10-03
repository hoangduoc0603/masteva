import { describe, expect, it } from 'vitest';
import { create, insert, search } from 'zbsearch';
import { createVietnameseTokenizer, normalizeVietnamese, tokenizeVietnamese } from '@/lib/search/vi-tokenizer';

describe('Vietnamese tokenizer', () => {
  it('removes every diacritic, including đ', () => {
    expect(normalizeVietnamese('Tiến trình ĐỒNG BỘ đường dẫn')).toBe('tien trinh dong bo duong dan');
    expect(normalizeVietnamese('Nghiệp vụ, ổn định, ửng hồng')).toBe('nghiep vu, on dinh, ung hong');
  });

  it('splits on non letter/number characters and dedupes', () => {
    expect(tokenizeVietnamese('exit-code 137; tiến trình, tiến trình!')).toEqual(['exit', 'code', '137', 'tien', 'trinh']);
  });

  it('matches queries with or without diacritics against the same index', async () => {
    const db = create({
      schema: { content: 'string' },
      components: { tokenizer: createVietnameseTokenizer() },
    });
    insert(db, { content: 'Tiến trình, signal và systemd' });
    insert(db, { content: 'Đồng bộ dữ liệu giữa các service' });

    for (const term of ['tien trinh', 'tiến trình', 'TIEN TRINH']) {
      const result = await search(db, { term });
      expect(result.hits.map((h) => h.document.content)).toContain('Tiến trình, signal và systemd');
    }
    const sync = await search(db, { term: 'dong bo' });
    expect(sync.hits[0]?.document.content).toBe('Đồng bộ dữ liệu giữa các service');
  });
});
