import { Be_Vietnam_Pro, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { Provider } from '@/components/provider';
import { i18n, isLanguage } from '@/lib/i18n';
import { translations } from '@/lib/layout.shared';
import { getMessages } from '@/lib/messages';
import { siteUrl } from '@/lib/site';
import '../global.css';

const bricolage = Bricolage_Grotesque({ subsets: ['latin', 'vietnamese'], weight: ['500', '700', '800'], variable: '--font-bricolage-src' });
const beVietnam = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600'], variable: '--font-bevn-src' });
const jetbrains = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600'], variable: '--font-jbmono-src' });

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
    <html lang={lang} className={`${bricolage.variable} ${beVietnam.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider lang={lang} i18n={i18nProvider(translations, lang)} messages={getMessages(lang)}>
          {props.children}
        </Provider>
      </body>
    </html>
  );
}
