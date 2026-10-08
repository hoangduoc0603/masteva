import { useSyncExternalStore } from 'react';
import type { User } from '@supabase/supabase-js';
import { AccountSync, endAccountSession, type SyncStatus } from '@/lib/progress/account-sync';
import { PROGRESS_STORAGE_KEY } from '@/lib/progress/model';
import { browserStorage, getProgressStore, memoryStorage, stopEarlyQueue, type StorageLike } from '@/lib/progress/store';
import { accountEnabled, AUTH_STORAGE_KEY, hasStoredSession } from './config';
import { supabaseRemote } from './remote';
import { loadSupabase } from './supabase';

/**
 * Trạng thái tài khoản cho giao diện (spec 2026-10-07 §6). Khách chưa có phiên thì không tải supabase-js.
 * Chỉ dùng ở trình duyệt.
 */
export type AccountState =
  | { status: 'disabled' }
  | { status: 'guest' }
  | { status: 'loading' }
  | { status: 'signed-in'; email: string; sync: SyncStatus };

export const SERVER_ACCOUNT_STATE: AccountState = { status: 'loading' };
/** Đường dẫn để quay lại sau khi đăng nhập xong, lưu trong sessionStorage. */
export const RETURN_PATH_KEY = 'masteva:auth:return';

let state: AccountState = SERVER_ACCOUNT_STATE;
const listeners = new Set<() => void>();
let initialized: Promise<void> | undefined;
let sync: AccountSync | undefined;
let userId: string | undefined;
let storage: StorageLike | undefined;

function setState(next: AccountState): void {
  state = next;
  for (const listener of listeners) listener();
}

export const getAccountState = (): AccountState => state;
export const subscribeAccount = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useAccount(): AccountState {
  return useSyncExternalStore(subscribeAccount, getAccountState, () => SERVER_ACCOUNT_STATE);
}

function localStore(): StorageLike {
  storage ??= browserStorage() ?? memoryStorage();
  return storage;
}

function isCallbackWithCode(): boolean {
  return new URLSearchParams(window.location.search).has('code');
}

export function initAccount(): Promise<void> {
  initialized ??= (async () => {
    if (!accountEnabled) return setState({ status: 'disabled' });
    // Tab khác vừa đăng nhập hoặc đăng xuất: tải lại để mở đúng tiến độ (khách hay tài khoản).
    // Làm mới token chỉ đổi giá trị, không đổi có/không, nên không tải lại.
    window.addEventListener('storage', (event) => {
      if (event.key === AUTH_STORAGE_KEY && (event.oldValue === null) !== (event.newValue === null)) window.location.reload();
    });
    if (!hasStoredSession() && !isCallbackWithCode()) return setState({ status: 'guest' });
    await connect();
  })();
  return initialized;
}

async function connect(): Promise<void> {
  try {
    const client = await loadSupabase();
    client.auth.onAuthStateChange((_event, session) => {
      // Không gọi supabase-js ngay trong callback này (có thể khoá chết); chạy ở lượt sau.
      setTimeout(() => void handleUser(session?.user ?? null), 0);
    });
    // Trên trang callback, bước này đổi `?code=` lấy phiên (PKCE).
    const { data } = await client.auth.getSession();
    await handleUser(data.session?.user ?? null);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void sync?.syncNow();
    });
    window.addEventListener('online', () => void sync?.syncNow());
  } catch {
    setState({ status: 'guest' });
  }
}

async function handleUser(user: User | null): Promise<void> {
  if (user && user.id === userId) return;
  // Phiên tự kết thúc hoặc đổi tài khoản: giữ bản sao và hàng đợi để lần đăng nhập sau đẩy lên.
  if (userId || !user) endSession('expired');
  if (!user) return setState({ status: 'guest' });
  userId = user.id;
  const client = await loadSupabase();
  const current = new AccountSync({ store: getProgressStore(), storage: localStore(), remote: supabaseRemote(client), userId: user.id });
  sync = current;
  const email = user.email ?? '';
  const publish = () => {
    if (sync === current) setState({ status: 'signed-in', email, sync: current.getStatus() });
  };
  current.subscribeStatus(publish);
  publish();
  // Nhả hàng đợi tạm ngay trước khi AccountSync nhận việc: start() đăng ký onChange trước lần await đầu tiên.
  stopEarlyQueue();
  await current.start();
}

function endSession(reason: 'signed-out' | 'expired'): void {
  stopEarlyQueue();
  sync?.stop();
  const store = getProgressStore();
  if (userId) endAccountSession(localStore(), store, userId, reason);
  else if (store.storageKey !== PROGRESS_STORAGE_KEY) store.switchKey(PROGRESS_STORAGE_KEY);
  sync = undefined;
  userId = undefined;
}

export async function signIn(lang: string): Promise<void> {
  try {
    const { pathname, search, hash } = window.location;
    sessionStorage.setItem(RETURN_PATH_KEY, pathname + search + hash);
  } catch {
    // Không lưu được thì sau khi đăng nhập về trang chủ.
  }
  const client = await loadSupabase();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/${lang}/auth/callback` },
  });
  if (error) throw error;
}

/** Đẩy nốt thay đổi rồi đăng xuất. Còn thay đổi chưa đẩy được thì trả `unsynced` để giao diện hỏi lại. */
export async function signOut(options: { force?: boolean } = {}): Promise<'done' | 'unsynced'> {
  await sync?.syncNow();
  if (!options.force && sync && sync.pendingCount() > 0) return 'unsynced';
  const client = await loadSupabase();
  endSession('signed-out');
  setState({ status: 'guest' });
  await client.auth.signOut({ scope: 'local' });
  return 'done';
}

export async function deleteAccount(): Promise<void> {
  const client = await loadSupabase();
  const { error } = await client.rpc('delete_my_account');
  if (error) throw error;
  endSession('signed-out');
  setState({ status: 'guest' });
  await client.auth.signOut({ scope: 'local' });
}
