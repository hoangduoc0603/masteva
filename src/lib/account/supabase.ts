import type { SupabaseClient } from '@supabase/supabase-js';
import { AUTH_STORAGE_KEY, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';
import type { Database } from './database.types';

export type MastevaClient = SupabaseClient<Database>;

let client: Promise<MastevaClient> | undefined;

/**
 * Tải supabase-js khi cần (bấm đăng nhập, hoặc máy đã có phiên), không nằm trong JavaScript ban đầu.
 * PKCE: trang callback nhận `?code=` và supabase-js tự đổi lấy phiên khi khởi tạo (`detectSessionInUrl`).
 */
export function loadSupabase(): Promise<MastevaClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        flowType: 'pkce',
        storageKey: AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }),
  );
  return client;
}
