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
import { staticClient } from 'fumadocs-core/search/client/orama-static';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { create } from 'zbsearch';
import { createVietnameseTokenizer } from '@/lib/search/vi-tokenizer';

// Phải dùng cùng tokenizer với lúc build chỉ mục (src/app/api/search/route.ts),
// nếu không từ khoá không dấu sẽ không khớp.
const initDB = () => create({ schema: { _: 'string' }, components: { tokenizer: createVietnameseTokenizer() } });

export default function MastevaSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const { search, setSearch, query } = useDocsSearch({
    client: staticClient({ locale, initDB }),
  });

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
