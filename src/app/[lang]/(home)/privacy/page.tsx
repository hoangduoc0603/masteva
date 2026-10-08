import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLanguage } from '@/lib/i18n';
import { format, getMessages } from '@/lib/messages';

export async function generateMetadata(props: PageProps<'/[lang]/privacy'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  return { title: getMessages(lang).privacy.title };
}

/** Chính sách quyền riêng tư cho tài khoản (Luật Bảo vệ dữ liệu cá nhân 2025; architecture §11). */
export default async function PrivacyPage(props: PageProps<'/[lang]/privacy'>) {
  const { lang } = await props.params;
  if (!isLanguage(lang)) notFound();
  const t = getMessages(lang).privacy;
  return (
    <main className="hm">
      <article className="hm-wrap prose">
        <h1>{t.title}</h1>
        <p>{t.updated}</p>
        {t.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{format(s.p, { contact: t.contact })}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
