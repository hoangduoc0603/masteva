-- Phân quyền và đồng bộ của tiến độ theo tài khoản (migration learning_progress).
begin;
create extension if not exists pgtap with schema extensions;
select plan(30);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.local');

-- ---------- Người A ghi tiến độ của mình qua sync_progress ----------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ select public.sync_progress(
       '[{"item_id": "j1.1.jdk-tools", "completed_at": "2026-10-01T10:00:00Z", "changed_at": "2026-10-01T10:00:00Z"},
         {"item_id": "j1.1.lab-jshell", "completed_at": "2026-10-01T10:05:00Z", "changed_at": "2026-10-01T10:05:00Z"}]',
       '[{"topic_id": "j5.generics", "mark": "learning", "changed_at": "2026-10-01T10:00:00Z"}]',
       '[{"roadmap_id": "java", "level": "middle", "changed_at": "2026-10-01T10:00:00Z"}]'
     ) $$,
  'A đẩy được tiến độ của mình'
);
select results_eq('select count(*) from public.progress_items', array[2::bigint], 'A thấy 2 mục của mình');
select results_eq('select count(*) from public.topic_marks', array[1::bigint], 'A thấy trạng thái chủ đề của mình');
select results_eq('select count(*) from public.roadmap_starts', array[1::bigint], 'A thấy cấp bắt đầu của mình');
select results_eq(
  $$ select user_id from public.progress_items limit 1 $$,
  array['11111111-1111-1111-1111-111111111111'::uuid],
  'user_id lấy từ auth.uid()'
);

-- Bản mới nhất thắng.
select public.sync_progress(
  '[{"item_id": "j1.1.jdk-tools", "completed_at": null, "changed_at": "2026-10-02T09:00:00Z"}]'
);
select results_eq(
  $$ select completed_at is null from public.progress_items where item_id = 'j1.1.jdk-tools' $$,
  array[true],
  'Bỏ tích mới hơn đè được lần tích cũ (tombstone)'
);
select public.sync_progress(
  '[{"item_id": "j1.1.jdk-tools", "completed_at": "2026-10-01T08:00:00Z", "changed_at": "2026-10-01T08:00:00Z"}]'
);
select results_eq(
  $$ select completed_at is null from public.progress_items where item_id = 'j1.1.jdk-tools' $$,
  array[true],
  'Thao tác cũ hơn không đè được bản mới'
);
select public.sync_progress(
  '[]', '[{"topic_id": "j5.generics", "mark": "done", "changed_at": "2026-10-03T09:00:00Z"}]'
);
select results_eq(
  $$ select mark from public.topic_marks where topic_id = 'j5.generics' $$,
  array['done'],
  'Trạng thái chủ đề mới hơn được ghi'
);
select public.sync_progress(
  '[{"item_id": "j1.1.class-version", "completed_at": "2026-10-04T09:00:00Z", "changed_at": "2026-10-04T09:00:00Z"},
    {"item_id": "j1.1.class-version", "completed_at": null, "changed_at": "2026-10-04T09:30:00Z"}]'
);
select results_eq(
  $$ select completed_at is null from public.progress_items where item_id = 'j1.1.class-version' $$,
  array[true],
  'Trùng mã trong một lần gọi thì giữ bản mới nhất'
);

-- changed_at ở tương lai bị kéo về giờ server; synced_at do server đặt.
select public.sync_progress(
  '[{"item_id": "j1.1.lts-choice", "completed_at": "2026-10-04T09:00:00Z", "changed_at": "2999-01-01T00:00:00Z"}]'
);
select results_eq(
  $$ select changed_at <= now() from public.progress_items where item_id = 'j1.1.lts-choice' $$,
  array[true],
  'changed_at không vượt giờ server'
);
select results_eq(
  $$ with r as (
       insert into public.progress_items (item_id, completed_at, changed_at, synced_at)
       values ('j1.1.mastery-pipeline', now(), now(), '2000-01-01T00:00:00Z')
       returning synced_at
     ) select synced_at = now() from r $$,
  array[true],
  'synced_at do server đặt, không theo giá trị gửi lên'
);

-- Dữ liệu sai bị từ chối.
select throws_ok(
  $$ select public.sync_progress('[{"item_id": "Bad ID!", "completed_at": null, "changed_at": "2026-10-01T10:00:00Z"}]') $$,
  '23514', null, 'Mã mục sai định dạng bị từ chối'
);
select throws_ok(
  $$ select public.sync_progress('[]', '[{"topic_id": "j5.generics", "mark": "mastered", "changed_at": "2026-10-05T10:00:00Z"}]') $$,
  '23514', null, 'Trạng thái chủ đề lạ bị từ chối'
);
select throws_ok(
  $$ select public.sync_progress('[]', '[]', '[{"roadmap_id": "java", "level": "expert", "changed_at": "2026-10-05T10:00:00Z"}]') $$,
  '23514', null, 'Cấp bắt đầu lạ bị từ chối'
);
select throws_ok(
  $$ select public.sync_progress('[{"item_id": "j1.1.jdk-tools", "completed_at": null}]') $$,
  '23502', null, 'Thiếu changed_at bị từ chối'
);
select throws_ok(
  $$ select public.sync_progress('{"item_id": "j1.1.jdk-tools"}') $$,
  '22023', null, 'Tham số không phải mảng bị từ chối'
);
select throws_ok(
  $$ select public.sync_progress(
       (select jsonb_agg(jsonb_build_object('item_id', 'x.' || i, 'completed_at', null, 'changed_at', now()))
        from generate_series(1, 2001) as i)
     ) $$,
  '22023', null, 'Quá 2.000 dòng một lần gọi bị từ chối'
);

-- A không chuyển được dòng sang B, không chèn được dòng mang user_id của B.
select throws_ok(
  $$ update public.progress_items set user_id = '22222222-2222-2222-2222-222222222222' $$,
  '42501', null, 'A không chuyển được dòng sang user_id của B'
);
select throws_ok(
  $$ insert into public.topic_marks (user_id, topic_id, mark, changed_at)
     values ('22222222-2222-2222-2222-222222222222', 'j5.generics', 'done', now()) $$,
  '42501', null, 'A không ghi được dòng mang user_id của B'
);

-- ---------- Người B ----------
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select results_eq(
  $$ select (select count(*) from public.progress_items) + (select count(*) from public.topic_marks)
          + (select count(*) from public.roadmap_starts) $$,
  array[0::bigint],
  'B không thấy dòng nào của A'
);
select results_eq(
  $$ with c as (update public.progress_items set completed_at = null returning 1) select count(*) from c $$,
  array[0::bigint],
  'B không sửa được mục của A'
);
select results_eq(
  $$ with c as (delete from public.topic_marks returning 1) select count(*) from c $$,
  array[0::bigint],
  'B không xoá được trạng thái chủ đề của A'
);
-- Cùng mã với A nhưng là dòng riêng của B, không đụng tới dòng của A.
select public.sync_progress(
  '[{"item_id": "j1.1.lab-jshell", "completed_at": null, "changed_at": "2026-10-06T10:00:00Z"}]'
);
select results_eq('select count(*) from public.progress_items', array[1::bigint], 'B có dòng riêng cùng mã với A');

-- ---------- Khách chưa đăng nhập ----------
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select throws_ok('select count(*) from public.progress_items', '42501', null, 'Khách không đọc được progress_items');
select throws_ok('select count(*) from public.topic_marks', '42501', null, 'Khách không đọc được topic_marks');
select throws_ok('select count(*) from public.roadmap_starts', '42501', null, 'Khách không đọc được roadmap_starts');
select throws_ok($$ select public.sync_progress('[]') $$, '42501', null, 'Khách không gọi được sync_progress');
select throws_ok('select public.delete_my_account()', '42501', null, 'Khách không gọi được delete_my_account');

-- ---------- A xoá tài khoản ----------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select public.delete_my_account();

reset role;
select results_eq(
  $$ select count(*) from auth.users where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222') $$,
  array[1::bigint],
  'Xoá tài khoản chỉ xoá chính người gọi'
);
-- Chỉ đếm dòng của A và B: database local có thể còn dữ liệu khác.
select results_eq(
  $$ select user_id::text, count(*) from (
       select user_id from public.progress_items union all
       select user_id from public.topic_marks union all
       select user_id from public.roadmap_starts
     ) as r
     where user_id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')
     group by user_id $$,
  $$ values ('22222222-2222-2222-2222-222222222222', 1::bigint) $$,
  'Tiến độ của A bị xoá theo, của B còn nguyên'
);

select * from finish();
rollback;
