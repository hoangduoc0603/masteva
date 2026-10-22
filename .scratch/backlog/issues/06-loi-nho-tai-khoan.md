# 06: Các lỗi nhỏ còn lại của tài khoản (review 07/10/2026)

**What to build:** Dọn các lỗi nhỏ của đăng nhập và đồng bộ; chi tiết ở mục "Vấn đề đã biết" của `docs/archive/status-den-2026-10-22.md`.

**Blocked by:** None (can start immediately)

**Status:** needs-triage

- [ ] Hai máy gộp hai cấp bắt đầu khác nhau (cùng thời điểm 0) có thể lệch nhau
- [ ] Nút Đăng xuất thiếu `try/finally`; `signOut()` chờ `syncNow()` không giới hạn thời gian
- [ ] `start()` ném lỗi (hết quota) thì menu hiện khách dù kho đang ở bản sao tài khoản
- [ ] URL có `?code=` ở bất kỳ trang nào cũng tải `supabase-js`; chỉ nên ở `/auth/callback`
- [ ] Menu tài khoản: Esc trong panel làm mất focus; lỗi đồng bộ chỉ có chấm `aria-hidden`; ô giữ chỗ 92 px đổi sang avatar 36 px làm xô header
- [ ] `safeReturnPath` so origin bằng `new URL` thay vì kiểm tiền tố
- [ ] Thiếu test: hỏi lại khi đăng xuất còn thay đổi chưa đồng bộ; unit test cho `controller.ts`; E2E tài khoản trên mobile
- [ ] `pnpm verify` để lại trong `out/` bản có URL Supabase local (không `wrangler deploy` từ máy ngay sau `verify`)
