-- Giữ project gói Free không bị tạm dừng vì ít hoạt động: workflow
-- .github/workflows/supabase-keepalive.yml gọi hàm này mỗi ngày bằng khoá publishable.
-- Chỉ chạy `select 1`, không đọc bảng nào, nên mở cho khách gọi không lộ dữ liệu.
create function public.keepalive() returns integer
language sql
stable
security invoker
set search_path = ''
as $$
  select 1;
$$;

revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated;
