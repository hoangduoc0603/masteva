# Masteva

Phần bổ sung cho `../CLAUDE.md`. Masteva là web học cho lập trình viên nói chung, không chỉ backend; tiếng Việt là ngôn ngữ mặc định, sẽ đa ngôn ngữ. Kiến trúc nằm ở `docs/architecture.md`, đọc trước khi sửa code.

**Bắt đầu mỗi session bằng việc đọc `docs/status.md`** để biết dự án đang ở đâu và bước tiếp theo là gì. Cập nhật file đó khi xong một mốc.

## Stack riêng của project

Fumadocs trên Next.js, static export (không có máy chủ), host tĩnh trên Cloudflare Workers (static assets, `wrangler.jsonc`, ADR-010). Không dùng Vercel; Supabase chỉ dùng cho tài khoản và đồng bộ tiến độ, gọi thẳng từ trình duyệt (ADR-002, ADR-004).

- Không thêm tính năng cần máy chủ (route động, middleware, server action). Mọi thứ phải chạy lúc build hoặc trên trình duyệt.
- Component phía trình duyệt không được import Zod hay các module chỉ dùng lúc build (`src/lib/content/repo.ts`, `manifest.ts`), để giữ ngân sách JavaScript.

## Supabase

Tài khoản và đồng bộ tiến độ, thiết kế ở `docs/superpowers/specs/2026-10-07-tai-khoan-dong-bo-tien-do-design.md`.

- Project: local (`supabase start`) để phát triển; production là `jnmwvzognbveagudeizr` (Singapore, đã `supabase link`). Chưa có project dev riêng.
- Đưa lên production chỉ khi người dùng đồng ý: `supabase db push` cho migration; `supabase config diff` rồi `supabase config push` cho Auth (giá trị riêng của production nằm ở `[remotes.production]` trong `config.toml`, Google secret đọc từ `supabase/.env`).
- URL và khoá publishable của production nằm trong `.env.production` (commit được, là giá trị công khai); `.env.local` trỏ Supabase local.
- Nguồn sự thật của schema là `supabase/migrations/` (tạo bằng `supabase migration new`). Không dùng Drizzle.
- Đổi schema thì kèm test pgTAP trong `supabase/tests/database/`, chạy `pnpm test:db` (pgTAP và test adapter với database local) và `supabase db advisors --local`.
- Hàm `security definer` đặt trong schema `private` (không lộ ra Data API), gọi qua hàm `security invoker` ở `public`.
- Đăng nhập chỉ bằng Google. Trình duyệt chỉ dùng khoá `sb_publishable_…`; `supabase-js` chỉ tải khi đăng nhập hoặc đã có phiên.

## Kiểm thử

TDD bắt buộc chỉ cho logic lõi: tiến độ (`src/lib/progress`), kiểm tra nội dung (`src/lib/content`), tokenizer tìm kiếm. Không áp TDD cho giao diện hay nội dung bài học.

## Viết và sửa bài học

Theo `docs/content-standard.md`. Những điểm hay sai:

- Bài nằm ở `content/steps/<bước>/<mã-bài>.mdx`, ví dụ `d1/d1-1.mdx` với `id: d1.1`. Thêm slug vào `pages` trong `meta.json` của bước.
- Đủ 6 component theo đúng thứ tự: `<Goal>`, `<Knowledge>`, `<Resources>`, `<Practice>`, `<DeepDive>`, `<Mastery>`. Không tự viết tiêu đề cho 6 phần.
- Mỗi `<Check id="…">` có mã cố định dạng `<mã bài>.<slug>`. **Không đổi hoặc xoá mã đã có trong `content/ids.lock.json`**; nếu phải gộp hay đổi tên, thêm cặp `mã cũ → mã mới` vào `replacements`.
- Lệnh trong bài đặt trong `<Terminal where="mac|vm|container|pod|linux">`. Lệnh phá huỷ dữ liệu phải có `<Callout kind="danger">` đứng trước.
- Chỉ đặt `status: verified` khi mọi lệnh đã chạy thật, kèm `verified` (ngày, hệ điều hành, phiên bản công cụ).

## Kiểm tra trước khi báo xong

```bash
pnpm verify
```

Với thay đổi chỉ ở nội dung, tối thiểu chạy `pnpm content:check` và `pnpm build`.

## Agent skills

### Issue tracker

Issue là file markdown trong `.scratch/<feature>/` của repo. Xem `docs/agents/issue-tracker.md`.

### Triage labels

Dùng 5 vai trò mặc định (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), ghi ở dòng `Status:`. Xem `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` ở gốc (tạo khi cần), ADR mới trong `docs/adr/` đánh số từ 0011 (ADR-001…010 ở `docs/architecture.md` §14). Xem `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
