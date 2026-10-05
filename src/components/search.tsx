'use client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch, type SearchClient } from 'fumadocs-core/search/client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useEffect } from 'react';
import { createLessonSearchClient } from '@/lib/search/lesson-client';
import type { SearchFile } from '@/lib/search/lesson-index';
import { takeHandOff } from '@/lib/search/handoff';

// Mỗi ngôn ngữ một client: file `/<lang>/search.json` chỉ tải một lần trong phiên (ADR-009).
const clients = new Map<string, SearchClient>();

function clientFor(locale: string): SearchClient {
  let client = clients.get(locale);
  if (!client) {
    client = createLessonSearchClient(() =>
      fetch(`/${locale}/search.json`).then((r) => (r.ok ? (r.json() as Promise<SearchFile>) : Promise.reject(new Error(String(r.status))))),
    );
    clients.set(locale, client);
  }
  return client;
}

export default function MastevaSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const { search, setSearch, query } = useDocsSearch({
    client: clientFor(locale ?? 'vi'),
  });

  // Mở từ dòng "Tìm … trong nội dung bài học" ở trang chủ: điền sẵn từ khoá.
  useEffect(() => {
    if (!props.open) return;
    const query = takeHandOff();
    if (query) setSearch(query);
  }, [props.open, setSearch]);

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
