import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { notFound } from 'next/navigation';
import { baseOptions } from '@/lib/layout.shared';
import { isLanguage } from '@/lib/i18n';

export default async function Layout(props: LayoutProps<'/[lang]'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return (
    <HomeLayout {...baseOptions(lang)}>
      {props.children}
    </HomeLayout>
  );
}
