# Issue tracker: Local Markdown

Issue và spec của repo này là file markdown trong `.scratch/`. Đây là tracker duy nhất và là nơi ghi trạng thái dự án, nên `.scratch/` được commit vào Git như code.

## Quy ước

- Mỗi tính năng một thư mục: `.scratch/<feature-slug>/`
- Spec là `.scratch/<feature-slug>/spec.md`
- Mỗi ticket một file `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, đánh số từ `01`; không gộp nhiều ticket vào một file
- Trạng thái ghi ở dòng `**Status:** <giá trị>` gần đầu mỗi file issue: một vai trò triage (xem `triage-labels.md`) hoặc `done`
- Trao đổi và lịch sử nối vào cuối file, dưới mục `## Comments`
- Việc lặt vặt không thuộc tính năng nào nằm trong `.scratch/backlog/issues/`

## Ticket còn mở

`grep -rL "^\*\*Status:\*\* done" .scratch/*/issues/*.md`. Ticket hết bị chặn khi mọi ticket trong dòng `**Blocked by:**` đã `done`; trong các ticket không bị chặn, số nhỏ nhất làm trước.

## Đóng ticket

Đặt `**Status:** done`, tích các tiêu chí nghiệm thu đã đạt, rồi thêm vào `## Comments` một dòng: ngày, SHA commit, ghi chú nếu có tiêu chí bị bỏ hoặc đổi. Ticket bị bỏ thì đặt `**Status:** wontfix` kèm lý do.

## Khi skill nói "publish to the issue tracker"

Tạo file mới trong `.scratch/<feature-slug>/` (tạo thư mục nếu chưa có).

## Khi skill nói "fetch the relevant ticket"

Đọc file theo đường dẫn được nhắc tới. Thường người dùng đưa thẳng đường dẫn hoặc số issue.

## Wayfinding

Dùng cho `/wayfinder`. **Map** là một file, mỗi **ticket con** là một file.

- **Map**: `.scratch/<effort>/map.md` (phần Notes / Decisions-so-far / Fog).
- **Ticket con**: `.scratch/<effort>/issues/NN-<slug>.md`, đánh số từ `01`, câu hỏi nằm trong thân file. Dòng `Type:` ghi loại ticket (`research`/`prototype`/`grilling`/`task`); dòng `Status:` ghi `claimed`/`resolved`.
- **Chặn**: dòng `Blocked by: NN, NN` gần đầu file. Ticket hết bị chặn khi mọi file trong danh sách đều `resolved`.
- **Frontier**: quét `.scratch/<effort>/issues/` tìm file đang mở, không bị chặn, chưa có người nhận; số nhỏ nhất được làm trước.
- **Nhận việc**: đặt `Status: claimed` và lưu file trước khi làm.
- **Giải quyết**: viết câu trả lời dưới mục `## Answer`, đặt `Status: resolved`, rồi thêm một dòng dẫn (tóm tắt + link) vào Decisions-so-far trong `map.md`.
