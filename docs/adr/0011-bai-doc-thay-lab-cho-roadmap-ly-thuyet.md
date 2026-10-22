---
status: accepted
---

# Bài đọc thay cho bài lab ở Java, Spring Boot và Microservices

Tầm nhìn ban đầu gắn lab chạy trên máy thật vào mọi khái niệm, nên 88 bài Java và Spring Boot có lab chiếm khoảng 77% số dòng, phần kiến thức chỉ khoảng 15%. Với các roadmap thiên về lý thuyết, người học (trước tiên là chủ dự án) cần kiến thức đầy đủ, chi tiết để ôn và nắm chắc; thực hành lẻ trong từng bài ít giá trị hơn tự xây cả một dự án, còn ôn phỏng vấn thì cần bộ câu hỏi riêng. Vì vậy Java, Spring Boot và Microservices chuyển sang **bài đọc** (Mục tiêu → Kiến thức → Tài liệu): kiến thức của phần đào sâu và các phát hiện từ lab (kèm output thật) nhập vào phần kiến thức, câu hỏi–lời giải của phần đào sâu được chép làm nguồn cho bộ câu hỏi phỏng vấn, các bước lab bị gỡ (giữ trong lịch sử Git). Thực hành chuyển sang dự án; DevOps và Kubernetes giữ **bài lab** 6 phần vì ở đó lab chính là nội dung. Dạng bài khai báo theo từng bài.

## Consequences

- Bài đọc không có ô đánh dấu từng ý; tiến độ là một mục duy nhất `<mã bài>.done` (nút "Đã học xong bài"). Chủ đề xong khi mọi bài của nó xong; đồng bộ tài khoản và "Tôi đã biết" không đổi.
- Các mã mục cũ của bài đọc bị xoá thẳng khỏi `content/ids.lock.json`, không qua `replacements`. Đây là lần đặt lại một lần trước khi có người dùng thật (22/10/2026), không phải tiền lệ: sau đợt này BR-003 áp dụng như cũ.
- `verified` của bài đọc nghĩa là mọi đoạn code và output trong bài đã chạy thật với phiên bản ghi kèm; khẳng định về hành vi API phải có tài liệu chính thức hoặc output làm dẫn chứng.
- Đảo ngược quyết định này nghĩa là viết lại lab cho cả ba roadmap.
