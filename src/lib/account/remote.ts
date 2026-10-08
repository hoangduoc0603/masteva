import { TOPIC_MARKS, type TopicMark } from '@/lib/progress/model';
import { LEVELS, type Level } from '@/lib/content/constants';
import type { RemoteProgress } from '@/lib/progress/account-sync';
import { toPayload } from '@/lib/progress/sync';
import type { MastevaClient } from './supabase';

/** Bằng `max_rows` của PostgREST (supabase/config.toml); kéo về theo trang để không bị cắt. */
export const PAGE_SIZE = 1000;

type Page<T> = PromiseLike<{ data: T[] | null; error: unknown }>;

async function allPages<T>(page: (from: number, to: number) => Page<T>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

const isMark = (value: string | null): value is TopicMark | null =>
  value === null || (TOPIC_MARKS as readonly string[]).includes(value);
const isLevel = (value: string | null): value is Level | null =>
  value === null || (LEVELS as readonly string[]).includes(value);

/** Tiến độ trên Supabase: kéo ba bảng theo `synced_at` (RLS chỉ trả dòng của người đang đăng nhập), đẩy qua RPC. */
export function supabaseRemote(client: MastevaClient): RemoteProgress {
  return {
    async pull(since) {
      const items = await allPages((from, to) => {
        const query = client.from('progress_items').select('item_id, completed_at, changed_at, synced_at');
        return (since ? query.gt('synced_at', since) : query).order('synced_at').order('item_id').range(from, to);
      });
      const topics = await allPages((from, to) => {
        const query = client.from('topic_marks').select('topic_id, mark, changed_at, synced_at');
        return (since ? query.gt('synced_at', since) : query).order('synced_at').order('topic_id').range(from, to);
      });
      const starts = await allPages((from, to) => {
        const query = client.from('roadmap_starts').select('roadmap_id, level, changed_at, synced_at');
        return (since ? query.gt('synced_at', since) : query).order('synced_at').order('roadmap_id').range(from, to);
      });
      return {
        items,
        topics: topics.flatMap((row) => (isMark(row.mark) ? [{ ...row, mark: row.mark }] : [])),
        starts: starts.flatMap((row) => (isLevel(row.level) ? [{ ...row, level: row.level }] : [])),
      };
    },
    async push(changes) {
      const { error } = await client.rpc('sync_progress', toPayload(changes));
      if (error) throw error;
    },
  };
}
