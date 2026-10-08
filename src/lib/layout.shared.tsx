import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { i18n, type Language } from './i18n';
import { getMessages } from './messages';
import { AccountMenu } from '@/components/account/account-menu';

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    vi: getMessages('vi').ui,
    en: getMessages('en').ui,
  });

export function baseOptions(lang: Language): BaseLayoutProps {
  const t = getMessages(lang);
  return {
    i18n: i18n.languages.length > 1,
    nav: {
      title: <span className="font-semibold tracking-tight">{t.app.name}</span>,
      url: `/${lang}`,
    },
    // Không có mục nav: trang chủ là nơi chọn roadmap (spec 2026-10-05 §3). Chỉ có nút tài khoản (spec 2026-10-07 §6).
    // Header desktop đặt mục `custom` thẳng vào <ul> nên cần <li>; menu mobile và thanh bên tự bọc bằng <div>.
    links: [
      { type: 'custom', on: 'nav', secondary: true, children: <li><AccountMenu lang={lang} /></li> },
      { type: 'custom', on: 'menu', secondary: true, children: <AccountMenu lang={lang} /> },
    ],
  };
}
