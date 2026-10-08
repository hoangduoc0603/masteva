import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AuthCallback } from '@/components/account/auth-callback';
import { isLanguage } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

export async function generateMetadata(props: PageProps<'/[lang]/auth/callback'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return { title: getMessages(lang).account.callbackTitle, robots: { index: false } };
}

/** Trang tĩnh nhận `?code=` từ Supabase Auth (PKCE); mọi xử lý chạy trên trình duyệt. */
export default async function AuthCallbackPage(props: PageProps<'/[lang]/auth/callback'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return (
    <main className="hm">
      <AuthCallback lang={lang} />
    </main>
  );
}
