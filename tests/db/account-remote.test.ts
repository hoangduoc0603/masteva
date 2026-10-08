import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, expect, it } from 'vitest';
import type { Database } from '@/lib/account/database.types';
import { supabaseRemote } from '@/lib/account/remote';
import type { MastevaClient } from '@/lib/account/supabase';
import { emptyPending, type PendingChanges } from '@/lib/progress/sync';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu ${name}: chạy bằng \`pnpm test:db\``);
  return value;
}

const url = env('SUPABASE_TEST_URL');
const admin = createClient<Database>(url, env('SUPABASE_TEST_SECRET_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const suffix = `-${Date.now()}@test.local`;

/**
 * Đăng nhập bằng email bị tắt (chỉ Google), nên test ký access token bằng JWT_SECRET của bản local,
 * cùng các claim mà Supabase Auth cấp cho người đã đăng nhập.
 */
function accessToken(userId: string): string {
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${part({ alg: 'HS256', typ: 'JWT' })}.${part({ sub: userId, role: 'authenticated', aud: 'authenticated', iat: now, exp: now + 3600 })}`;
  return `${unsigned}.${createHmac('sha256', env('SUPABASE_TEST_JWT_SECRET')).update(unsigned).digest('base64url')}`;
}

async function signedIn(name: string): Promise<MastevaClient> {
  const created = await admin.auth.admin.createUser({ email: `${name}${suffix}`, email_confirm: true });
  if (created.error) throw created.error;
  const token = accessToken(created.data.user.id);
  return createClient<Database>(url, env('SUPABASE_TEST_PUBLISHABLE_KEY'), { accessToken: async () => token });
}

function items(count: number, prefix: string, at: string): PendingChanges {
  const p = emptyPending();
  for (let i = 0; i < count; i++) p.items[`${prefix}.${i}`] = { item_id: `${prefix}.${i}`, completed_at: at, changed_at: at };
  return p;
}

let a: MastevaClient;
let b: MastevaClient;

beforeAll(async () => {
  a = await signedIn('a');
  b = await signedIn('b');
});

afterAll(async () => {
  const { data } = await admin.auth.admin.listUsers();
  for (const user of data.users.filter((u) => u.email?.endsWith(suffix))) await admin.auth.admin.deleteUser(user.id);
});

it('đẩy lên và kéo về hơn một trang (1.000 dòng)', async () => {
  const remote = supabaseRemote(a);
  await remote.push(items(1500, 'page', '2026-10-01T10:00:00.000Z'));
  const rows = await remote.pull(null);
  expect(rows.items).toHaveLength(1500);
  expect(new Set(rows.items.map((r) => r.item_id)).size).toBe(1500);
});

it('người khác không thấy dòng của A', async () => {
  expect((await supabaseRemote(b).pull(null)).items).toHaveLength(0);
});

it('since chỉ trả dòng ghi sau con trỏ', async () => {
  const remote = supabaseRemote(a);
  const all = await remote.pull(null);
  const cursor = all.items.map((r) => r.synced_at).sort().at(-1) ?? null;
  await remote.push(items(1, 'later', '2026-10-02T10:00:00.000Z'));
  expect((await remote.pull(cursor)).items.map((r) => r.item_id)).toEqual(['later.0']);
});

it('trạng thái chủ đề và cấp bắt đầu đi khứ hồi, kể cả tombstone', async () => {
  const remote = supabaseRemote(a);
  await remote.push({
    items: {},
    topics: { 'j5.generics': { topic_id: 'j5.generics', mark: 'done', changed_at: '2026-10-03T10:00:00.000Z' } },
    starts: { java: { roadmap_id: 'java', level: null, changed_at: '2026-10-03T10:00:00.000Z' } },
  });
  const rows = await remote.pull(null);
  expect(rows.topics.map((r) => [r.topic_id, r.mark])).toEqual([['j5.generics', 'done']]);
  expect(rows.starts.map((r) => [r.roadmap_id, r.level])).toEqual([['java', null]]);
});
