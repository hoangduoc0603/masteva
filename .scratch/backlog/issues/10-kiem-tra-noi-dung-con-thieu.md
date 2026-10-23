# 10: Lỗ hổng của `content:check`

**What to build:** `content:check` bắt được các lỗi nội dung đang lọt qua.

**Blocked by:** None (can start immediately)

**Status:** needs-triage

- [ ] `prerequisites` trong frontmatter bài đầu chặng (j12-1, j13-1, j14-1, j15-1, j17-1, j18-1) lệch `meta.json` mà không bị kiểm
- [ ] `validateCodeRefs` chưa kiểm `content/roadmaps/*.json` và bản dịch; chưa bỏ fence `~~~`
- [ ] Tên như "Apple M1" chỉ qua được vì M1 là chặng có thật; nên đặt trong backtick
- [ ] Thư mục rỗng `content/steps/d19/16/` do agent tạo nhầm

## Comments

23/10/2026 (retro sau ticket 39): `content:check` thêm các quy tắc cơ học của bài đọc (`src/lib/content/reading-style.ts`): ### chỉ trong Knowledge, cặp callout ai/link khép Knowledge, tối đa 2 callout production, không `title=` và không `...` trong code, từ cấm trong văn. Bốn mục ở trên vẫn mở.
