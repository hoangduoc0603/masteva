# Masteva

Phần bổ sung cho `../CLAUDE.md`. Masteva là web học cho lập trình viên nói chung, không chỉ backend; tiếng Việt là ngôn ngữ mặc định, sẽ đa ngôn ngữ. Kiến trúc nằm ở `docs/architecture.md`, đọc trước khi sửa code.

**Bắt đầu mỗi session bằng việc đọc `docs/status.md`** để biết dự án đang ở đâu và bước tiếp theo là gì. Cập nhật file đó khi xong một mốc.

## Stack riêng của project

Fumadocs trên Next.js, static export (không có máy chủ), host trên Cloudflare Pages. Không dùng Supabase hay Vercel cho tới giai đoạn G3 (xem ADR-002, ADR-004).

- Không thêm tính năng cần máy chủ (route động, middleware, server action). Mọi thứ phải chạy lúc build hoặc trên trình duyệt.
- Component phía trình duyệt không được import Zod hay các module chỉ dùng lúc build (`src/lib/content/repo.ts`, `manifest.ts`), để giữ ngân sách JavaScript.

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
