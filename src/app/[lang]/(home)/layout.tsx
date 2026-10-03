import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { notFound } from 'next/navigation';
import { baseOptions } from '@/lib/layout.shared';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

export default async function Layout(props: LayoutProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang);

  return (
    <HomeLayout {...baseOptions(lang)}>
      {props.children}
      <footer className="mt-auto border-t px-4 py-8 text-center text-xs text-fd-muted-foreground">{t.app.footer}</footer>
    </HomeLayout>
  );
}
