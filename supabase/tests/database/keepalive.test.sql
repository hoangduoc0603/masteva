-- Hàm giữ project gói Free không bị tạm dừng (migration keepalive).
begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select function_privs_are('public', 'keepalive', array[]::text[], 'anon', array['EXECUTE'], 'Khách gọi được keepalive');
select is(prosecdef, false, 'keepalive chạy với quyền người gọi')
  from pg_proc where oid = 'public.keepalive()'::regprocedure;

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select is(public.keepalive(), 1, 'keepalive trả về 1');
-- Khách vẫn không đọc được bảng tiến độ.
select throws_ok('select count(*) from public.progress_items', '42501', null, 'Khách vẫn không đọc được progress_items');

select * from finish();
rollback;
