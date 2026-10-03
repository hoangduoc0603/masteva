import { describe, expect, it } from 'vitest';
import { format } from '@/lib/format';

describe('format', () => {
  it('fills placeholders and leaves unknown ones', () => {
    expect(format('{done}/{total} {x}', { done: 1, total: 2 })).toBe('1/2 {x}');
  });

  it('does not treat prototype keys as values', () => {
    expect(format('{toString} {constructor}', {})).toBe('{toString} {constructor}');
  });
});
