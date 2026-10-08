import { describe, expect, it } from 'vitest';
import { safeReturnPath } from '@/lib/account/return-path';

describe('safeReturnPath', () => {
  it('keeps same-site paths with query and hash', () => {
    expect(safeReturnPath('/vi/roadmaps/java#j5.generics', 'vi')).toBe('/vi/roadmaps/java#j5.generics');
    expect(safeReturnPath('/vi/learn/d1/d1-1?x=1', 'vi')).toBe('/vi/learn/d1/d1-1?x=1');
  });

  it('falls back to the home page for missing, external or looping targets', () => {
    for (const raw of [null, '', 'https://evil.test/', '//evil.test/x', '/\\evil.test', 'javascript:alert(1)', '/vi/auth/callback?code=1']) {
      expect(safeReturnPath(raw, 'vi')).toBe('/vi');
    }
  });
});
