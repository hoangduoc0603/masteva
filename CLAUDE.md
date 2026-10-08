# Masteva

Phần bổ sung cho `../CLAUDE.md`. Masteva là web học cho lập trình viên nói chung, không chỉ backend; tiếng Việt là ngôn ngữ mặc định, sẽ đa ngôn ngữ. Kiến trúc nằm ở `docs/architecture.md`, đọc trước khi sửa code.

**Bắt đầu mỗi session bằng việc đọc `docs/status.md`** để biết dự án đang ở đâu và bước tiếp theo là gì. Cập nhật file đó khi xong một mốc.

## Stack riêng của project

Fumadocs trên Next.js, static export (không có máy chủ), host tĩnh trên Cloudflare Workers (static assets, `wrangler.jsonc`, ADR-010). Không dùng Vercel; Supabase chỉ dùng cho tài khoản và đồng bộ tiến độ, gọi thẳng từ trình duyệt (ADR-002, ADR-004).

- Không thêm tính năng cần máy chủ (route động, middleware, server action). Mọi thứ phải chạy lúc build hoặc trên trình duyệt.
- Component phía trình duyệt không được import Zod hay các module chỉ dùng lúc build (`src/lib/content/repo.ts`, `manifest.ts`), để giữ ngân sách JavaScript.

## Supabase

Tài khoản và đồng bộ tiến độ, thiết kế ở `docs/superpowers/specs/2026-10-07-tai-khoan-dong-bo-tien-do-design.md`.

- Project: chỉ có local (`supabase db start`). Chưa có `project_ref` dev hay prod.
- Nguồn sự thật của schema là `supabase/migrations/` (tạo bằng `supabase migration new`). Không dùng Drizzle.
- Đổi schema thì kèm test pgTAP trong `supabase/tests/database/`, chạy `pnpm test:db` (pgTAP và test adapter với database local) và `supabase db advisors --local`.
- Hàm `security definer` đặt trong schema `private` (không lộ ra Data API), gọi qua hàm `security invoker` ở `public`.
- Đăng nhập chỉ bằng Google. Trình duyệt chỉ dùng khoá `sb_publishable_…`; `supabase-js` chỉ tải khi đăng nhập hoặc đã có phiên.

## Dùng Superpowers có chọn lọc

Quy tắc này ghi đè yêu cầu "luôn dùng skill" của `using-superpowers`, theo đúng thứ tự ưu tiên mà chính skill đó nêu.

**Dùng khi:**

- Tính năng mới, thay đổi nhiều file hoặc thay đổi kiến trúc: `brainstorming` để làm rõ yêu cầu, rồi `writing-plans` (kết hợp Plan mode) trước khi code.
- Bug khó, chưa rõ nguyên nhân sau một lần thử: `systematic-debugging`.
- Trước khi báo xong một việc lớn: `verification-before-completion`.

**Không dùng, làm trực tiếp:**

- Câu hỏi, giải thích, tra cứu, đọc code.
- Sửa nhỏ và rõ ràng (khoảng 1–3 file), sửa nội dung bài học, cập nhật tài liệu, chạy lệnh.
- Việc người dùng đã mô tả cụ thể từng bước.

**Giới hạn:**

- TDD bắt buộc chỉ cho logic lõi: tiến độ (`src/lib/progress`), kiểm tra nội dung (`src/lib/content`), tokenizer tìm kiếm. Không áp TDD cho giao diện hay nội dung bài học.
- Không dùng `subagent-driven-development`, `dispatching-parallel-agents` hay `using-git-worktrees` trừ khi người dùng yêu cầu.
- Người dùng nói "dùng superpowers" thì chạy đủ quy trình; nói "làm nhanh" thì bỏ qua.

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
