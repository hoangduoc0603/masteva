# 03: Chuẩn bài đọc, tầm nhìn sản phẩm và danh sách cố ý không dạy

**What to build:** Tác giả (agent viết bài) có một chuẩn rõ để viết bài đọc; tài liệu sản phẩm không còn mâu thuẫn với ADR-0011; người học thấy trên trang roadmap những công nghệ nào cố ý không dạy và vì sao.

**Blocked by:** 01

**Status:** done

- [x] Chuẩn nội dung có phần bài đọc: khung ba phần, cách viết phần kiến thức theo kết quả nghiên cứu ở 01, quy tắc ví dụ code và output, chỗ đặt callout "Trên production", "Khi làm cùng AI", "Liên hệ bài khác"
- [x] Chuẩn nội dung có cách chuyển một bài lab cũ thành bài đọc: nhập kiến thức phần đào sâu, nhập phát hiện từ lab kèm output tiêu biểu, chép câu hỏi–lời giải vào nguồn câu hỏi phỏng vấn (định dạng nguồn mô tả ở đây), xoá mã mục cũ khỏi file khoá
- [x] Định nghĩa `verified` của bài đọc: mọi đoạn code và output đã chạy thật với phiên bản ghi kèm; khẳng định về hành vi API có tài liệu chính thức hoặc output làm dẫn chứng
- [x] Tầm nhìn sản phẩm ghi giá trị cốt lõi mới: bài đọc đầy đủ và sâu; thực hành ở dự án; ôn phỏng vấn ở bộ câu hỏi phỏng vấn; bài lab giữ cho DevOps và Kubernetes
- [x] Mô tả roadmap Java và Spring Boot ghi danh sách cố ý không dạy kèm lý do: Bazel, Javalin, Play, EBean, TestNG, Cucumber, Log4j2/TinyLog, JSP
- [x] `pnpm content:check` xanh

**Quyết định từ ticket 01 (22/10/2026):** không thêm phần câu hỏi ôn; bài đọc giữ đúng ba phần như spec, việc truy xuất trong bài chỉ dùng 1–3 chỗ "Đoán trước" ở output gây bất ngờ. Mục lục bài đọc lồng các đề mục `###` của phần kiến thức dưới mục Kiến thức (đã làm trong code); chuẩn bài đọc cần ghi: đề mục `###` chỉ đặt trong phần kiến thức, mỗi khái niệm một `###`, đề mục dạng cụm danh từ hoặc câu nêu điều rút ra (nghiên cứu, khuyến nghị 7.1–7.2).

**Kết quả:** chuẩn bài đọc ở `docs/content-standard.md` §1.2 (dạng bài), §1.3 (cố ý không dạy), §3 (bài đọc: khung, phần kiến thức, code và output, sơ đồ, callout, chuyển bài lab, nguồn câu hỏi phỏng vấn `content/interview/<roadmap>.md`), §5 (`verified` của bài đọc); §3–§8 cũ dời thành §4–§9. Tầm nhìn sửa §2, §4.1, §4.2, §4.4, §9. Danh sách cố ý không dạy là trường `notTaught` của `content/roadmaps/*.json`, hiện trên trang roadmap dưới phần mô tả: Bazel, TestNG, Cucumber ở Java; Javalin, Play, EBean, Log4j2/TinyLog, JSP ở Spring Boot.
