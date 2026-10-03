import vi from '../../messages/vi.json';
import en from '../../messages/en.json';
import type { Language } from './i18n';

type ViMessages = typeof vi;
/** Chữ giao diện của ứng dụng. `ui` là chữ của fumadocs-ui, có thể thiếu ở ngôn ngữ khác. */
export type Messages = Omit<ViMessages, 'ui'> & { ui: Partial<Record<string, string>> };

const catalog: Record<Language, Messages> = { vi, en };

export function getMessages(lang: Language): Messages {
  return catalog[lang];
}

/** Thay `{tên}` trong chuỗi bằng giá trị tương ứng. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
