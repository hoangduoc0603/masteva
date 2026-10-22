# 01: Đăng ký tên miền và gắn vào Worker

**What to build:** Masteva chạy trên tên miền riêng thay cho `masteva.kevin-itbk.workers.dev`; đăng nhập Google vẫn chạy trên tên miền mới.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

- [ ] Tên miền đã đăng ký (`masteva.com` chưa đăng ký, chưa kiểm tra nhãn hiệu)
- [ ] Worker `masteva` gắn tên miền
- [ ] Supabase Auth production có Site URL và Additional Redirect URLs `https://<tên miền>/<lang>/auth/callback`
- [ ] Header CSP trong `public/_headers` kiểm lại trên bản deploy thật
