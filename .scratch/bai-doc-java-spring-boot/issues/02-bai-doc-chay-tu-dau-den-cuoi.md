# 02: Bài đọc chạy được từ đầu đến cuối

**What to build:** Một bài có thể khai báo là bài đọc và hiển thị đúng dạng bài đọc: ba phần Mục tiêu → Kiến thức → Tài liệu, mục lục ba mục, nút "Đã học xong bài" ở cuối bài, trạng thái "Đã học xong"/"Chưa học xong" ở đầu bài. Bấm nút thì chủ đề của bài trên sơ đồ roadmap chuyển trạng thái như khi tích hết mục của một bài lab. Bài lab giữ nguyên hành vi. Để có bài thật mà xem, J5.3 được cắt tạm thành bài đọc bằng cách bỏ ba phần cuối (viết lại đúng chuẩn ở ticket 04).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Frontmatter mỗi bài có trường dạng bài bắt buộc (bài đọc hoặc bài lab); mọi bài DevOps và Kubernetes khai báo là bài lab
- [ ] Kiểm tra cấu trúc theo dạng bài, viết test trước (TDD): bài đọc đúng ba phần theo thứ tự và không có `<Check>`; bài lab đủ 6 phần như cũ; bài thiếu dạng bài thì lỗi
- [ ] Bài đọc có đúng một mã mục `<mã bài>.done` do hệ thống sinh; mã này được khoá, kiểm bản dịch và đưa vào manifest như mọi mã mục khác
- [ ] Trang bài đọc: ba phần đánh số, mục lục ba mục, nút "Đã học xong bài" bật tắt mục `.done` qua kho tiến độ hiện có, trạng thái ở thanh tiến độ đầu bài
- [ ] J5.3 cắt tạm thành bài đọc; mã mục cũ của J5.3 xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [ ] E2E mới: trang bài đọc có ba phần và mục lục ba mục; bấm "Đã học xong bài", tải lại vẫn giữ; chủ đề thành "đã xong" trên trang roadmap; bấm lại thì bỏ
- [ ] Các E2E đang tích mục trong bài Java chuyển sang bài lab hoặc sang nút "Đã học xong bài"
- [ ] `pnpm verify` xanh
