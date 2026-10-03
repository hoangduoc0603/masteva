import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const appDir = path.resolve('src/app');
const srcDir = path.resolve('src');

describe('global styles', () => {
  it('only import local CSS from inside src, so the build does not depend on design mockups', () => {
    const css = readFileSync(path.join(appDir, 'global.css'), 'utf8');
    const local = [...css.matchAll(/@import\s+'(\.[^']+)'/g)].map((m) => path.resolve(appDir, m[1]));
    expect(local.length).toBeGreaterThan(0);
    for (const file of local) expect(file.startsWith(srcDir + path.sep)).toBe(true);
  });
});
