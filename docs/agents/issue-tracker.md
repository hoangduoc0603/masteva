# Issue tracker: Local Markdown

Issue và spec của repo này là file markdown trong `.scratch/`. `docs/status.md` vẫn là nơi ghi mốc dự án; issue trong `.scratch/` chỉ dùng để chia việc.

## Quy ước

- Mỗi tính năng một thư mục: `.scratch/<feature-slug>/`
- Spec là `.scratch/<feature-slug>/spec.md`
- Mỗi ticket một file `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, đánh số từ `01`; không gộp nhiều ticket vào một file
- Trạng thái triage ghi ở dòng `Status:` gần đầu mỗi file issue (chuỗi vai trò xem `triage-labels.md`)
- Trao đổi và lịch sử nối vào cuối file, dưới mục `## Comments`

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
