'use client';
import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import dynamic from 'next/dynamic';
import { MessagesProvider } from '@/components/messages-provider';
import { LANGUAGE_STORAGE_KEY } from '@/lib/i18n';
import type { Messages } from '@/lib/messages';

// Hộp tìm kiếm (kèm chỉ mục và bộ dựng kết quả) chỉ được tải khi người học mở nó.
const SearchDialog = dynamic(() => import('@/components/search'), { ssr: false });

type I18nProps = ComponentProps<typeof RootProvider>['i18n'];

export function Provider({
  lang,
  i18n,
  messages,
  children,
}: {
  lang: string;
  i18n: I18nProps;
  messages: Messages;
  children: ReactNode;
}) {
  // Ghi nhớ ngôn ngữ đang xem để trang `/` chuyển hướng đúng lần sau.
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Trình duyệt chặn lưu trữ: bỏ qua, trang `/` sẽ dùng ngôn ngữ mặc định.
    }
  }, [lang]);

  return (
    <RootProvider i18n={i18n} search={{ SearchDialog }} theme={{ defaultTheme: 'dark' }}>
      <MessagesProvider messages={messages}>{children}</MessagesProvider>
    </RootProvider>
  );
}
