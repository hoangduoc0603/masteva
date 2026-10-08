# Tài khoản và đồng bộ tiến độ

Ngày: 07/10/2026. Trạng thái: **đã duyệt** (07/10/2026); migration `supabase/migrations/20261007041618_learning_progress.sql`, test `supabase/tests/database/learning_progress.test.sql`. Chi tiết hoá mục 7.2 của [architecture.md](../../architecture.md); đưa FR-ACCOUNT-001, FR-ACCOUNT-002, FR-PROGRESS-005 từ G3 lên sớm.

## 1. Mục tiêu

- Người học đăng nhập thì tiến độ lưu theo tài khoản, học trên máy nào cũng thấy.
- Không đăng nhập thì mọi thứ giữ như hiện tại (`localStorage`, khoá `masteva:progress:v2`, xuất/nhập file).
- Site vẫn là static export, không thêm máy chủ (ADR-002). Trình duyệt gọi thẳng Supabase, quyền do RLS quyết định.

Ngoài phạm vi: trang tiến độ công khai (FR-PROGRESS-006), hồ sơ người dùng, thanh toán, đăng nhập bằng email/GitHub.

## 2. Quyết định đã chốt với người dùng

| Câu hỏi | Lựa chọn |
|---|---|
| Cách đăng nhập | Chỉ Google (OAuth qua Supabase Auth). Giả định: nhận mọi tài khoản Google, không chặn riêng `@gmail.com` |
| Khi đăng xuất | Xoá bản sao tiến độ của tài khoản trên máy; máy quay về tiến độ khách |
| Lần đầu đăng nhập khi máy có tiến độ khách | Tự gộp vào tài khoản rồi xoá tiến độ khách. Gộp theo thời điểm gốc (duyệt 07/10/2026, xem §6) |
| Môi trường | Supabase local (`supabase start`, Docker) để viết migration và chạy test; tạo project cloud (region Singapore) khi sắp deploy |

## 3. Mô hình dữ liệu

Mỗi khoá trong `Progress` (`src/lib/progress/model.ts`) thành một dòng, thay vì một cục JSON mỗi người, để hai máy cùng sửa không ghi đè nhau và mỗi lần tích chỉ gửi vài dòng.

| Bảng | Khoá chính | Giá trị | Ứng với |
|---|---|---|---|
| `progress_items` | `(user_id, item_id)` | `completed_at timestamptz null`, null là đã bỏ tích | `items` |
| `topic_marks` | `(user_id, topic_id)` | `mark text null` trong `todo`, `learning`, `done`, `skipped`; null là đã xoá trạng thái | `topics` |
| `roadmap_starts` | `(user_id, roadmap_id)` | `level text null` trong `foundation`, `middle`, `senior`; null là đã xoá | `start` |

Cột chung của cả ba bảng:

| Cột | Ý nghĩa |
|---|---|
| `user_id uuid not null default auth.uid()` | Khoá ngoại `auth.users(id) on delete cascade` |
| `changed_at timestamptz not null` | Lúc người học thao tác, do trình duyệt gửi. Dùng để chọn bản thắng khi xung đột |
| `synced_at timestamptz not null` | Do trigger đặt `now()` mỗi lần ghi. Dùng làm con trỏ khi kéo thay đổi về |

- Giá trị null thay cho xoá dòng (tombstone): bỏ tích ở máy B phải đè được lần tích ở máy A.
- Không có khoá ngoại tới nội dung (nội dung nằm trong Git). Mã chỉ được kiểm tra định dạng `^[a-z0-9][a-z0-9._-]{0,127}$`; mã cũ vẫn ánh xạ sang mã mới bằng `replacements` trên trình duyệt.
- Khoá chính bắt đầu bằng `user_id` nên đủ cho policy; thêm index `(user_id, synced_at)` cho truy vấn kéo về.
- Không có bảng `profiles`: tên, email, ảnh lấy từ phiên đăng nhập.

## 4. Phân quyền (RLS)

- Bật RLS cả ba bảng; `revoke all … from anon, public`; `grant select, insert, update, delete … to authenticated`.
- Mỗi thao tác một policy `to authenticated`, điều kiện `(select auth.uid()) = user_id`; UPDATE có cả `using` và `with check`.
- Không dùng `user_metadata` cho phân quyền.

## 5. Hàm (RPC)

| Hàm | Chế độ | Làm gì |
|---|---|---|
| `sync_progress(p_items jsonb, p_topics jsonb, p_starts jsonb)` | `security invoker` (vẫn qua RLS) | Upsert từng dòng; chỉ ghi khi `changed_at` mới hơn bản đang có. Tối đa 2.000 dòng mỗi lần gọi. Trả về `now()` của server |
| `delete_my_account()` | `security definer`, `search_path = ''`, chỉ `authenticated` được gọi | Xoá `auth.users` của chính `auth.uid()`; tiến độ xoá theo `cascade` (FR-ACCOUNT-002) |

Kéo về không cần hàm: `select` ba bảng với `synced_at > con trỏ − 5 giây` (lấy trùng vài dòng không sao vì áp dụng lại cho cùng kết quả).

## 6. Luồng trên trình duyệt (để làm sau database)

| Tình huống | Hành vi |
|---|---|
| Khách | Như hiện tại. Không tải `supabase-js` |
| Bấm "Đăng nhập" | Tải `supabase-js` lúc đó, OAuth Google (PKCE), quay về trang tĩnh `/<lang>/auth/callback` |
| Đăng nhập lần đầu trên máy | Gộp tiến độ khách vào bản sao ngay trên máy (không chờ mạng), xếp hàng toàn bộ tiến độ khách với thời điểm gốc, ghi bản rỗng vào khoá khách, rồi kéo về và đẩy lên. Mục và chủ đề giữ thời điểm gốc nên bỏ tích mới hơn ở máy khác vẫn thắng; cấp bắt đầu của khách có thời điểm 0 nên tài khoản đã có thì giữ của tài khoản |
| Đã đăng nhập, mở trang | Có phiên trong `localStorage` thì tải `supabase-js`, hiện tiến độ từ bản sao ngay rồi kéo thay đổi về |
| Tích một mục | Ghi bản sao ngay (< 100 ms), gom lại và đẩy lên sau; mất mạng thì giữ hàng đợi |
| Đăng xuất | Xoá bản sao của tài khoản và hàng đợi; máy về tiến độ khách (rỗng) |
| Xoá tài khoản | Gọi `delete_my_account()`, rồi xử lý như đăng xuất |

Bản sao của tài khoản lưu dưới khoá riêng (dự kiến `masteva:account:<user_id>`: tiến độ, con trỏ, hàng đợi), tách khỏi khoá khách.

Việc kèm theo: thêm URL Supabase vào `connect-src` trong `public/_headers`; trang chính sách quyền riêng tư (Luật Bảo vệ dữ liệu cá nhân 2025); cập nhật ADR-004 và mục 7.2, 11 của architecture.

## 7. Bản phác migration

Bản phác ban đầu; bản cuối nằm trong file migration ở trên. Khác bản phác: trigger `private.touch_progress_row()` còn kéo `changed_at` ở tương lai về giờ server; `delete_my_account()` là hàm `security invoker` gọi `private.delete_current_user()` (`security definer`, schema không lộ ra API).

```sql
create table public.progress_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_id text not null check (item_id ~ '^[a-z0-9][a-z0-9._-]{0,127}$'),
  completed_at timestamptz,
  changed_at timestamptz not null,
  synced_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.progress_items enable row level security;
revoke all on table public.progress_items from anon, public;
grant select, insert, update, delete on table public.progress_items to authenticated;
create index progress_items_user_synced_idx on public.progress_items (user_id, synced_at);

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

-- synced_at do server đặt, trình duyệt không tự gửi được giá trị khác.
create function public.touch_synced_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.synced_at := now();
  return new;
end $$;

create trigger progress_items_touch before insert or update on public.progress_items
  for each row execute function public.touch_synced_at();

-- Upsert theo kiểu bản mới nhất thắng (phần items; topics, starts tương tự).
insert into public.progress_items (item_id, completed_at, changed_at)
select x.item_id, x.completed_at, x.changed_at
from jsonb_to_recordset(p_items) as x(item_id text, completed_at timestamptz, changed_at timestamptz)
on conflict (user_id, item_id) do update
  set completed_at = excluded.completed_at, changed_at = excluded.changed_at
  where public.progress_items.changed_at < excluded.changed_at;
```

## 8. Kiểm thử

Test pgTAP trong `supabase/tests/database/`, chạy `supabase test db`:

- A đọc, ghi được dòng của mình; B không đọc, sửa, xoá được dòng của A.
- A không đổi được `user_id` của dòng sang B; B không chèn được dòng mang `user_id` của A.
- Khách (`anon`) không truy cập được bảng nào và không gọi được hai hàm.
- `sync_progress`: bản có `changed_at` cũ hơn không đè bản mới; tombstone đè được lần tích cũ hơn; quá 2.000 dòng thì lỗi; mã sai định dạng thì lỗi.
- `delete_my_account()` chỉ xoá chính người gọi và dữ liệu của họ.
- Chạy `supabase db advisors` không còn cảnh báo bảo mật.

Logic gộp và hàng đợi ở trình duyệt (`src/lib/progress`) viết theo TDD như quy ước của project.

## 9. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Đồng hồ máy người học lệch làm sai bản thắng | Chấp nhận: chỉ ảnh hưởng khi cùng một mục được sửa trên hai máy gần như cùng lúc |
| Một tài khoản spam nhiều dòng | Giới hạn 2.000 dòng mỗi lần gọi, mã giới hạn 128 ký tự; theo dõi dung lượng (gói free 500 MB) |
| JavaScript tăng | `supabase-js` chỉ tải khi đăng nhập hoặc đã có phiên; khách không đổi |
| Khoá API kiểu cũ (`anon`) bị khai tử cuối 2026 | Dùng khoá `sb_publishable_…` ngay từ đầu |
