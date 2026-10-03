import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { Provider } from '@/components/provider';
import { i18n, isLanguage } from '@/lib/i18n';
import { translations } from '@/lib/layout.shared';
import { getMessages } from '@/lib/messages';
import { siteUrl } from '@/lib/site';
import '../global.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export async function generateMetadata(props: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.app.name, template: `%s · ${t.app.name}` },
    description: t.app.tagline,
  };
}

export default async function LangLayout(props: LayoutProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();

  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider lang={lang} i18n={i18nProvider(translations, lang)} messages={getMessages(lang)}>
          {props.children}
        </Provider>
      </body>
    </html>
  );
}
