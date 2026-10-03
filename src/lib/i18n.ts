import { defineI18n } from 'fumadocs-core/i18n';

/** Mọi ngôn ngữ Masteva có thể bật. */
export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'vi';

/**
 * Ngôn ngữ được bật lúc build, đọc từ `MASTEVA_LOCALES` (ví dụ `vi,en`).
 * Production mặc định chỉ có `vi`; build cho E2E bật thêm `en` để kiểm tra trang chưa dịch.
 */
function enabledLanguages(): Language[] {
  const raw = (process.env.MASTEVA_LOCALES ?? DEFAULT_LANGUAGE).split(',').map((s) => s.trim());
  const enabled = SUPPORTED_LANGUAGES.filter((lang) => raw.includes(lang));
  return enabled.includes(DEFAULT_LANGUAGE) ? enabled : [DEFAULT_LANGUAGE, ...enabled];
}

export const i18n = defineI18n({
  defaultLanguage: DEFAULT_LANGUAGE,
  languages: enabledLanguages(),
  parser: 'dot',
  fallbackLanguage: DEFAULT_LANGUAGE,
});

export function isLanguage(value: string): value is Language {
  return (i18n.languages as string[]).includes(value);
}

/** Khoá localStorage lưu ngôn ngữ người dùng đã chọn; trang `/` đọc khoá này để chuyển hướng. */
export const LANGUAGE_STORAGE_KEY = 'masteva:lang';
