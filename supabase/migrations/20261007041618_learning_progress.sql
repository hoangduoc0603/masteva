-- Tiến độ học theo tài khoản (docs/superpowers/specs/2026-10-07-tai-khoan-dong-bo-tien-do-design.md).
-- Mỗi khoá của `Progress` (src/lib/progress/model.ts) là một dòng. Giá trị null là tombstone
-- (bỏ tích, xoá trạng thái) để thao tác trên máy này đè được thao tác cũ hơn trên máy khác.
-- `changed_at`: lúc người học thao tác (trình duyệt gửi), bản mới nhất thắng.
-- `synced_at`: server đặt mỗi lần ghi, làm con trỏ khi kéo thay đổi về.

-- Schema không lộ ra Data API, chứa hàm nội bộ.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- Server đặt `synced_at`; `changed_at` không được vượt giờ server, để máy có đồng hồ chạy nhanh
-- không khoá được một dòng khỏi các lần sửa sau.
create function private.touch_progress_row() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.synced_at := now();
  -- Không dùng least(): nó bỏ qua null, làm dòng thiếu changed_at thành "mới nhất".
  if new.changed_at > now() then
    new.changed_at := now();
  end if;
  return new;
end;
$$;

revoke all on function private.touch_progress_row() from public;

-- Mục đánh dấu trong bài (`items`).
create table public.progress_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_id text not null check (item_id ~ '^[a-z0-9][a-z0-9._-]{0,127}$'),
  completed_at timestamptz,
  changed_at timestamptz not null,
  synced_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Trạng thái người học tự đặt cho chủ đề (`topics`).
create table public.topic_marks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic_id text not null check (topic_id ~ '^[a-z0-9][a-z0-9._-]{0,127}$'),
  mark text check (mark in ('todo', 'learning', 'done', 'skipped')),
  changed_at timestamptz not null,
  synced_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- Cấp bắt đầu của từng roadmap (`start`).
create table public.roadmap_starts (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  roadmap_id text not null check (roadmap_id ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  level text check (level in ('foundation', 'middle', 'senior')),
  changed_at timestamptz not null,
  synced_at timestamptz not null default now(),
  primary key (user_id, roadmap_id)
);

-- Khoá chính bắt đầu bằng user_id nên đủ cho policy; index này cho truy vấn kéo về theo con trỏ.
create index progress_items_user_synced_idx on public.progress_items (user_id, synced_at);
create index topic_marks_user_synced_idx on public.topic_marks (user_id, synced_at);
create index roadmap_starts_user_synced_idx on public.roadmap_starts (user_id, synced_at);

create trigger progress_items_touch before insert or update on public.progress_items
  for each row execute function private.touch_progress_row();
create trigger topic_marks_touch before insert or update on public.topic_marks
  for each row execute function private.touch_progress_row();
create trigger roadmap_starts_touch before insert or update on public.roadmap_starts
  for each row execute function private.touch_progress_row();

-- RLS: mỗi người chỉ đọc và ghi dòng của mình; khách không có quyền gì.
alter table public.progress_items enable row level security;
alter table public.topic_marks enable row level security;
alter table public.roadmap_starts enable row level security;

revoke all on table public.progress_items, public.topic_marks, public.roadmap_starts from anon, public;
grant select, insert, update, delete on table public.progress_items, public.topic_marks, public.roadmap_starts
  to authenticated;

create policy "progress_items_select_own" on public.progress_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress_items_insert_own" on public.progress_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress_items_update_own" on public.progress_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "progress_items_delete_own" on public.progress_items
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "topic_marks_select_own" on public.topic_marks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "topic_marks_insert_own" on public.topic_marks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "topic_marks_update_own" on public.topic_marks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "topic_marks_delete_own" on public.topic_marks
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "roadmap_starts_select_own" on public.roadmap_starts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "roadmap_starts_insert_own" on public.roadmap_starts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "roadmap_starts_update_own" on public.roadmap_starts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "roadmap_starts_delete_own" on public.roadmap_starts
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Đẩy thay đổi lên. Chạy với quyền người gọi nên vẫn qua RLS; user_id lấy từ auth.uid() (giá trị mặc định).
-- Mỗi mảng là danh sách {<mã>, <giá trị>, changed_at}; trùng mã thì giữ bản mới nhất.
-- Chỉ ghi đè khi changed_at mới hơn bản đang có. Trả về giờ server.
create function public.sync_progress(
  p_items jsonb default '[]'::jsonb,
  p_topics jsonb default '[]'::jsonb,
  p_starts jsonb default '[]'::jsonb
) returns timestamptz
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_typeof(p_topics) <> 'array' or jsonb_typeof(p_starts) <> 'array' then
    raise exception 'p_items, p_topics, p_starts must be JSON arrays' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) + jsonb_array_length(p_topics) + jsonb_array_length(p_starts) > 2000 then
    raise exception 'too many rows in one call (max 2000)' using errcode = '22023';
  end if;

  insert into public.progress_items as t (item_id, completed_at, changed_at)
  select distinct on (x.item_id) x.item_id, x.completed_at, x.changed_at
  from jsonb_to_recordset(p_items) as x (item_id text, completed_at timestamptz, changed_at timestamptz)
  order by x.item_id, x.changed_at desc
  on conflict (user_id, item_id) do update
    set completed_at = excluded.completed_at, changed_at = excluded.changed_at
    where t.changed_at < excluded.changed_at;

  insert into public.topic_marks as t (topic_id, mark, changed_at)
  select distinct on (x.topic_id) x.topic_id, x.mark, x.changed_at
  from jsonb_to_recordset(p_topics) as x (topic_id text, mark text, changed_at timestamptz)
  order by x.topic_id, x.changed_at desc
  on conflict (user_id, topic_id) do update
    set mark = excluded.mark, changed_at = excluded.changed_at
    where t.changed_at < excluded.changed_at;

  insert into public.roadmap_starts as t (roadmap_id, level, changed_at)
  select distinct on (x.roadmap_id) x.roadmap_id, x.level, x.changed_at
  from jsonb_to_recordset(p_starts) as x (roadmap_id text, level text, changed_at timestamptz)
  order by x.roadmap_id, x.changed_at desc
  on conflict (user_id, roadmap_id) do update
    set level = excluded.level, changed_at = excluded.changed_at
    where t.changed_at < excluded.changed_at;

  return now();
end;
$$;

revoke all on function public.sync_progress(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.sync_progress(jsonb, jsonb, jsonb) to authenticated;

-- Xoá tài khoản (FR-ACCOUNT-002). Xoá auth.users cần quyền cao hơn authenticated, nên phần xoá
-- là security definer nằm trong schema không lộ ra API và chỉ xoá chính auth.uid().
-- Tiến độ bị xoá theo nhờ on delete cascade.
create function private.delete_current_user() returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function private.delete_current_user() from public, anon;
grant execute on function private.delete_current_user() to authenticated;

create function public.delete_my_account() returns void
language sql
security invoker
set search_path = ''
as $$
  select private.delete_current_user();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
