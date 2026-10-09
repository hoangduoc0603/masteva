import { describe, expect, it } from 'vitest';
import { headerHidden } from '@/components/roadmap/headroom';

describe('headerHidden', () => {
  const START = 300;

  it('always shows the header above the start of the map', () => {
    expect(headerHidden(true, 250, 200, START)).toBe(false);
    expect(headerHidden(false, 300, 100, START)).toBe(false);
  });

  it('hides when scrolling down past the start, shows when scrolling up', () => {
    expect(headerHidden(false, 400, 380, START)).toBe(true);
    expect(headerHidden(true, 380, 400, START)).toBe(false);
  });

  it('keeps the current state for tiny movements', () => {
    expect(headerHidden(true, 402, 400, START)).toBe(true);
    expect(headerHidden(false, 398, 400, START)).toBe(false);
  });
});
