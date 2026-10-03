import { i18n, DEFAULT_LANGUAGE } from './i18n';

/** URL gốc của site, dùng cho metadata tuyệt đối. Đặt `SITE_URL` khi có tên miền thật. */
export const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';

/**
 * hreflang cho một đường dẫn không kèm ngôn ngữ (ví dụ `/learn/d1/d1-1`), kèm `x-default` trỏ về `vi`.
 * Trang đang hiển thị bản gốc vì chưa dịch thì canonical trỏ về bản tiếng Việt (architecture §6).
 */
export function alternatesFor(lang: string, pathWithoutLang: string, showingFallback = false) {
  const languages: Record<string, string> = {};
  for (const l of i18n.languages) languages[l] = `/${l}${pathWithoutLang}`;
  languages['x-default'] = `/${DEFAULT_LANGUAGE}${pathWithoutLang}`;
  return {
    canonical: `/${showingFallback ? DEFAULT_LANGUAGE : lang}${pathWithoutLang}`,
    languages,
  };
}
