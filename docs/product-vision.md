# Tầm nhìn sản phẩm và giá trị cốt lõi

## 1. Tên sản phẩm

**Masteva** = *master* (làm chủ) + hậu tố *-va*.

- Ý nghĩa: học tới mức **làm chủ** kỹ năng, dùng được trong công việc thật, không dừng ở lý thuyết.
- 3 âm tiết, đọc được bằng cả tiếng Việt ("Mát-te-va") lẫn tiếng Anh; gốc *master* là từ tiếng Anh mà lập trình viên nào cũng hiểu.
- Cùng kiểu đặt tên với Pangova: gốc ngắn, kết thúc bằng nguyên âm.
- `masteva.com` chưa đăng ký tại thời điểm kiểm tra (03/10/2026, RDAP của Verisign trả về 404). Chưa kiểm tra nhãn hiệu.
- Tên đã cân nhắc và loại: Dojova (gốc tiếng Nhật, kén người hiểu), StepLab (chỉ còn tên miền `.dev`).

## 2. Giá trị hứa hẹn

> **Học ở một nơi, từ hiểu khái niệm tới làm được trong dự án thật.**

Định vị đầy đủ:

> Masteva là nơi lập trình viên học kỹ thuật phần mềm theo lộ trình đầy đủ, trực quan và thực chiến. Mỗi bước có giải thích đủ sâu để không phải đi tìm nơi khác, có lab chạy trên máy thật, và nối vào một dự án lớn như ngân hàng số hay hệ thống chat. Khác với danh sách đường link hay khoá video, người học ra khỏi mỗi bài là làm được việc đó.

**Phạm vi nội dung:**
- Masteva dành cho lập trình viên nói chung: backend, frontend, mobile, DevOps, data, AI engineering và kiến thức nền tảng.
- Nhóm roadmap đầu tiên là **backend**, gồm ba roadmap Java, DevOps và Microservices, mỗi roadmap đi từ nền tảng tới Senior, cùng hai dự án xuyên suốt (Neobank mini, Hub hội thoại). Đây là nơi người sáng lập có chuyên môn và đang tự học, nên nội dung được kiểm chứng tốt nhất.
- Các mảng khác được thêm dần sau khi chuẩn nội dung và trang web đã ổn định.

**Ngôn ngữ:** tiếng Việt là ngôn ngữ mặc định. Nội dung và trang web được thiết kế sẵn cho đa ngôn ngữ, bản tiếng Anh là ngôn ngữ thứ hai dự kiến.

## 3. Người học mục tiêu

| Persona | Mô tả | Vấn đề | Masteva giúp gì |
|---|---|---|---|
| **P1. Dev đi làm muốn lên Senior** (ưu tiên số 1) | 1–5 năm kinh nghiệm, biết code nhưng thiếu chiều sâu về nền tảng, hạ tầng, kiến trúc | Học rời rạc, không biết thứ tự, ít cơ hội làm hệ thống lớn ở công ty | Lộ trình Senior có thứ tự, lab và dự án mô phỏng production |
| **P2. Vibe coder / builder dùng AI** | Làm sản phẩm chủ yếu bằng AI, nền tảng còn mỏng | Không đọc hiểu được code AI viết, không tự debug, deploy hay bảo mật được | Kiến thức nền giải thích dễ hiểu, kèm phần "dùng AI thế nào cho đúng" ở mỗi bài |
| **P3. Sinh viên, fresher** | Sắp hoặc mới đi làm | Kiến thức ở trường cách xa thực tế công việc | Lộ trình từ nền tảng, thực hành giống công việc thật |
| P4. Team lead, doanh nghiệp (sau này) | Cần đào tạo nhân sự nội bộ | Tự soạn giáo trình tốn công | Lộ trình có sẵn, theo dõi tiến độ cả nhóm |

**Người dùng đầu tiên chính là người sáng lập.** Masteva được dùng để học lộ trình Senior Java, DevOps, Microservices, nên mọi bài học đều được người thật học và kiểm chứng.

## 4. Giá trị cốt lõi

### 4.1 Đầy đủ và tự chứa

- Mỗi bài giải thích đủ để học mà **không cần rời trang**. Tài liệu bên ngoài chỉ là "đọc thêm", không bắt buộc.
- Giải thích từ nền lên: *cái gì*, *vì sao*, *bên dưới chạy thế nào*, *dùng khi nào*, *sai ở đâu*.
- Khác biệt với roadmap.sh, nơi mỗi mục chủ yếu trỏ ra nguồn ngoài.

### 4.2 Thực chiến

- Mọi khái niệm quan trọng đều đi kèm **lab chạy được trên máy thật** và **tình huống production**: sự cố, số đo, quyết định thiết kế.
- **Dự án xuyên suốt** nối các bài lại: hub hội thoại đa kênh, ngân hàng số mini (Neobank).
- Ví dụ thật thay cho ví dụ đồ chơi. Ví dụ: hiểu SIGTERM thông qua việc giải thích vì sao `docker stop` mất 10 giây và pod báo exit code 137.

### 4.3 Trực quan

- Cơ chế phức tạp được **vẽ thành sơ đồ hoặc hoạt hình tương tác**: vòng đời tiến trình, bắt tay TCP, partition Kafka, luồng saga.
- Khối lệnh có **kết quả mong đợi** và giải thích từng phần.
- Trước khi xem kết quả, người học được mời **đoán output**.

### 4.4 Học có kiểm chứng

- Mỗi bài có **câu hỏi tự kiểm tra** và **dấu hiệu đã nắm chắc**. Cách làm này dựa trên nghiên cứu: tự kiểm tra là kỹ thuật học hiệu quả nhất ([Dunlosky 2013](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)).
- Lab có thể kiểm tra tự động bằng CLI chạy trên máy người học (giai đoạn sau).
- Ôn tập giãn cách cho các khái niệm đã học (giai đoạn sau).

### 4.5 Nội dung được kiểm chứng và cập nhật

- Mọi lệnh và code trong bài đều **đã được chạy thật**, ghi rõ phiên bản công cụ và ngày kiểm chứng.
- Bài có trạng thái rõ ràng: nháp, đã kiểm chứng, cần cập nhật.
- Có kế hoạch chạy lại lab tự động để phát hiện bài lỗi thời khi công cụ ra phiên bản mới.

### 4.6 Tiếng Việt trước, sẵn sàng đa ngôn ngữ

- Tiếng Việt là ngôn ngữ mặc định: giải thích bằng tiếng Việt tự nhiên, thuật ngữ kỹ thuật giữ tiếng Anh và có giải nghĩa khi xuất hiện lần đầu.
- Người học quen thuật ngữ gốc để đọc được tài liệu quốc tế và làm việc với team.
- Cấu trúc nội dung, đường dẫn và giao diện hỗ trợ nhiều ngôn ngữ ngay từ đầu, để thêm bản dịch mà không phải làm lại. Tiến độ học dùng chung giữa các ngôn ngữ.

### 4.7 Dùng AI có hiểu biết

- Mỗi bài có phần **"Khi làm cùng AI"**: nên hỏi AI thế nào, AI hay sai ở đâu, cách kiểm tra lại code AI viết.
- Lý do: code do AI sinh có lỗ hổng bảo mật ở 45% tác vụ, riêng Java trên 70% ([Veracode 2025](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/)).

## 5. Những điều Masteva không làm

- **Không là khoá video.** Nội dung chính là bài viết tương tác, video chỉ bổ trợ.
- **Không tổng hợp link.** Mỗi bài tự dạy, link ngoài chỉ để đọc thêm.
- **Không dạy kiểu luyện thi chứng chỉ.** Mục tiêu là làm được việc, chứng chỉ là hệ quả.
- **Không game hoá nặng.** Không XP hay bảng xếp hạng ở bản đầu; động lực đến từ tiến độ thật và dự án hoàn thành.

## 6. Mô hình kinh doanh (định hướng, chưa chốt)

- **Giai đoạn đầu:** toàn bộ nội dung miễn phí để xây người dùng và uy tín.
- **Khả năng thu tiền về sau**, cần kiểm chứng bằng dữ liệu:
  - Gói Pro: CLI chấm bài, dự án lớn có lời giải tham khảo, hỏi đáp AI trên nội dung bài, chứng nhận hoàn thành.
  - Giá theo khu vực, mức tham chiếu thị trường $5–10 mỗi tháng.
  - Gói doanh nghiệp: theo dõi tiến độ cả nhóm.
- Không thêm thanh toán khi chưa có người dùng thật đòi hỏi.

## 7. Metric

| Loại | Metric | Ý nghĩa |
|---|---|---|
| **North star** | Số bước được hoàn thành mỗi tuần (tổng các người học) | Người học thật sự học, không chỉ ghé xem |
| Kích hoạt | Tỷ lệ người đăng ký hoàn thành bước đầu tiên trong 7 ngày | Bài đầu có đủ hấp dẫn và dễ bắt đầu không |
| Giữ chân | Tỷ lệ còn học sau 4 tuần | Giá trị dài hạn |
| Chất lượng | Tỷ lệ lab chạy thành công; số lỗi nội dung được báo trên mỗi bài | Nội dung có đáng tin không |
| Giai đoạn tự học | Số bước người sáng lập hoàn thành và số bài đạt trạng thái "đã kiểm chứng" | Dùng trước khi mở cho người khác |

## 8. Lộ trình phát triển sản phẩm

| Giai đoạn | Mục tiêu | Kết quả |
|---|---|---|
| **0. Nền móng** | Chuẩn nội dung, khung trang web, roadmap đầu tiên chạy được | Site đọc được bài theo roadmap, có đánh dấu tiến độ |
| **1. Hoàn thiện 3 roadmap** | Viết đủ nội dung Java, DevOps, Microservices theo chuẩn, cùng đề cương hai dự án | 58 chặng có bài học; lab đã chạy thử |
| **2. Vừa học vừa tối ưu** | Người sáng lập học thật, sửa nội dung và trang web theo trải nghiệm | Bài đạt trạng thái "đã kiểm chứng"; mở beta công khai |
| **3. Cộng đồng và kiểm chứng tự động** | Tài khoản, đồng bộ tiến độ, CLI chấm bài, thảo luận theo bài | Người học bên ngoài dùng thường xuyên |
| **4. Mở rộng** | Roadmap cho các mảng khác (frontend, mobile, data…), ngôn ngữ thứ hai, AI hỏi đáp, ôn tập giãn cách, cân nhắc thu tiền | Theo dữ liệu metric |

Giai đoạn 0 và 1 làm trước khi tiếp tục học, theo quyết định ngày 03/10/2026.

## 9. Quyết định đã chốt

| Ngày | Quyết định |
|---|---|
| 03/10/2026 | Đi theo hướng B: trang công khai cho cộng đồng, không chỉ để tự học |
| 03/10/2026 | Ưu tiên xây trang web và hoàn thiện 3 roadmap Java, DevOps, Microservices trước, sau đó mới vừa học vừa tối ưu |
| 03/10/2026 | Tên sản phẩm: **Masteva**; thư mục `indie-hacker/masteva` |
| 03/10/2026 | Đối tượng là lập trình viên nói chung; các roadmap backend là nhóm nội dung xây trước |
| 03/10/2026 | Tiếng Việt là ngôn ngữ mặc định; sản phẩm sẽ đa ngôn ngữ về sau, nên thiết kế sẵn từ đầu |
| 03/10/2026 | Framework web: Fumadocs trên Next.js ([so sánh](framework-comparison.md)) |
| 03/10/2026 | Kiến trúc đã duyệt: static export trên Cloudflare Pages, nội dung chung repo, CC BY-NC-SA cho nội dung và MIT cho code mẫu ([architecture.md](architecture.md)) |
| 03/10/2026 | Tách thành ba roadmap độc lập Java, DevOps, Microservices (từ nền tảng tới Senior, 58 chặng, 379 chủ đề); dự án thành trang riêng ([spec](superpowers/specs/2026-10-03-tach-roadmap-design.md)) |
| 03/10/2026 | Giao diện theo hướng Night Lab, theme tối mặc định ([design-direction.md](design-direction.md)) |
