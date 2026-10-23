# Masteva

Phần bổ sung cho `../CLAUDE.md`. Masteva là web học cho lập trình viên nói chung, không chỉ backend; tiếng Việt là ngôn ngữ mặc định, sẽ đa ngôn ngữ. Kiến trúc nằm ở `docs/architecture.md`, đọc trước khi sửa code.

## Cách làm việc

Dự án theo luồng của bộ skill engineering (mattpocock-skills). Trạng thái dự án nằm ở tracker: các ticket trong `.scratch/` và dòng `**Status:**` của từng ticket. Không còn file tiến độ tổng; `docs/archive/status-den-2026-10-22.md` là bản lưu trữ, không cập nhật.

- **Đầu session:** liệt kê ticket còn mở (`grep -rL "^\*\*Status:\*\* done" .scratch/*/issues/*.md`); ticket không bị chặn, số nhỏ nhất làm trước.
- **Ý tưởng mới:** `/grill-with-docs` → `/to-spec` → `/to-tickets` trong cùng một cửa sổ hội thoại, rồi `/clear` và `/implement` từng ticket (hoặc `/implement-spec` cho cả spec).
- **Việc phát sinh, lỗi, góp ý:** ghi thành ticket `needs-triage` trong `.scratch/`, xử lý bằng `/triage`. Lỗi khó tái hiện: `/diagnosing-bugs`.
- **Ticket nội dung** (viết hoặc sửa bài): không áp TDD. Nghiệm thu bằng `pnpm content:check`, `pnpm build`, chạy thật mọi đoạn code và lệnh trong bài (bài đọc: `pnpm content:run-code <mã chặng>`), và một lượt đọc với vai người học (lần đầu học chủ đề). `/code-review` chấm trục Standards theo `docs/content-standard.md`.
- Chỉ commit, push, deploy khi được yêu cầu rõ. Người dùng thích tài liệu gọn, có bảng; không thích bị giao bài hay phải gửi lại output.

## Git và deploy

Nhánh mặc định `master`, remote `origin` là GitHub `hoangduoc0603/masteva` (alias SSH `github.com-personal`). **Push lên `master` là tự deploy** bằng Workers Builds (ADR-010). Hook `pre-push` chạy `pnpm verify` (bật sẵn khi `pnpm install`); chỉ dùng `git push --no-verify` khi người dùng đồng ý. Cache của Impeccable (`hook.cache.json`, `live/`) nằm trong `.gitignore`; bản critique trong `.impeccable/critique/` được commit.

## Stack riêng của project

Fumadocs trên Next.js, static export (không có máy chủ), host tĩnh trên Cloudflare Workers (static assets, `wrangler.jsonc`, ADR-010). Không dùng Vercel; Supabase chỉ dùng cho tài khoản và đồng bộ tiến độ, gọi thẳng từ trình duyệt (ADR-002, ADR-004).

- Không thêm tính năng cần máy chủ (route động, middleware, server action). Mọi thứ phải chạy lúc build hoặc trên trình duyệt.
- Component phía trình duyệt không được import Zod hay các module chỉ dùng lúc build (`src/lib/content/repo.ts`, `manifest.ts`), để giữ ngân sách JavaScript.

## Supabase

Tài khoản và đồng bộ tiến độ. Đọc `docs/architecture.md` §7.3 (project, migration, test pgTAP, quy ước bảo mật) trước khi đụng `supabase/` hay code tài khoản. Đưa migration hay cấu hình Auth lên production (`jnmwvzognbveagudeizr`) chỉ khi người dùng đồng ý.

## Kiểm thử

TDD bắt buộc chỉ cho logic lõi: tiến độ (`src/lib/progress`), kiểm tra nội dung (`src/lib/content`), tokenizer tìm kiếm. Không áp TDD cho giao diện hay nội dung bài học.

## Viết và sửa bài học

Theo `docs/content-standard.md`. Những điểm hay sai:

- Bài nằm ở `content/steps/<bước>/<mã-bài>.mdx`, ví dụ `d1/d1-1.mdx` với `id: d1.1`. Thêm slug vào `pages` trong `meta.json` của bước.
- Frontmatter `kind` bắt buộc: `reading` (bài đọc: Java, Spring Boot, Microservices) hoặc `lab` (bài lab: DevOps, Kubernetes).
- Bài đọc: đúng 3 component `<Goal>`, `<Knowledge>`, `<Resources>`, không có `<Check>`; viết theo §3 của chuẩn. Bài lab: đủ 6 component theo đúng thứ tự `<Goal>`, `<Knowledge>`, `<Resources>`, `<Practice>`, `<DeepDive>`, `<Mastery>`. Không tự viết tiêu đề cho các phần.
- Mỗi `<Check id="…">` có mã cố định dạng `<mã bài>.<slug>`. **Không đổi hoặc xoá mã đã có trong `content/ids.lock.json`**; nếu phải gộp hay đổi tên, thêm cặp `mã cũ → mã mới` vào `replacements`. Ngoại lệ một lần: khi chuyển bài lab sang bài đọc, mã mục cũ của bài xoá thẳng khỏi `ids` (ADR-0011, chuẩn §3.6).
- Lệnh trong bài đặt trong `<Terminal where="mac|vm|container|pod|linux">`. Lệnh phá huỷ dữ liệu phải có `<Callout kind="danger">` đứng trước.
- Chỉ đặt `status: verified` khi mọi lệnh đã chạy thật, kèm `verified` (ngày, hệ điều hành, phiên bản công cụ).

## Kiểm tra trước khi báo xong

```bash
pnpm verify
```

Với thay đổi chỉ ở nội dung, tối thiểu chạy `pnpm content:check` và `pnpm build`; bài đọc thêm `pnpm content:run-code <mã chặng>` (cần `java`, nên không nằm trong `pnpm verify`).

## Agent skills

### Issue tracker

Issue là file markdown trong `.scratch/<feature>/` của repo, đóng bằng `**Status:** done`. Xem `docs/agents/issue-tracker.md`.

### Triage labels

Dùng 5 vai trò mặc định (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), ghi ở dòng `**Status:**`. Xem `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` ở gốc (tạo khi cần), ADR mới trong `docs/adr/` đánh số từ 0011 (ADR-001…010 ở `docs/architecture.md` §14). Xem `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
