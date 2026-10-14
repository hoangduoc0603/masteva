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
import { useDocsSearch } from 'fumadocs-core/search/client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { createLessonSearchClient, type LessonSearchClient } from '@/lib/search/lesson-client';
import type { SearchFile } from '@/lib/search/lesson-index';
import { takeHandOff } from '@/lib/search/handoff';
import { roadmapOfPath, useSearchScope } from '@/lib/search/scope';

// Mỗi ngôn ngữ một client: mỗi file `/<lang>/search/<roadmap>-<n>.json` chỉ tải một lần trong phiên (ADR-009).
const clients = new Map<string, LessonSearchClient>();

function clientFor(locale: string, ids: readonly string[]): LessonSearchClient {
  let client = clients.get(locale);
  if (!client) {
    client = createLessonSearchClient({
      ids,
      load: (id) =>
        fetch(`/${locale}/search/${id}.json`).then((r) => (r.ok ? (r.json() as Promise<SearchFile>) : Promise.reject(new Error(String(r.status))))),
    });
    clients.set(locale, client);
  }
  return client;
}

export default function MastevaSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const scope = useSearchScope();
  const pathname = usePathname();
  const client = clientFor(locale ?? 'vi', scope.files);
  // Các file của roadmap đang xem được tìm trước; khi file của roadmap khác vào chỉ mục thì tìm lại để bổ sung kết quả.
  const roadmap = roadmapOfPath(pathname, scope);
  client.setFirst(roadmap ? scope.roadmaps[roadmap] : []);
  const loaded = useSyncExternalStore(client.subscribe, client.loadedCount, () => 0);
  const { search, setSearch, query } = useDocsSearch({ client }, [client, loaded]);

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
