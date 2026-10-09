# Tách roadmap Spring Boot khỏi roadmap Java (đợt 1)

Ngày: 09/10/2026. Trạng thái: **chờ người dùng duyệt spec**. Thực hiện phương án B trong [java-content-review.md](../../java-content-review.md), đợt 1: đổi cấu trúc, không viết bài mới.

## 1. Mục tiêu và phạm vi

- Roadmap Java tập trung vào ngôn ngữ, JVM, concurrency, thiết kế và nghề Senior; roadmap Spring Boot mới chứa toàn bộ phần Spring, từ cơ bản tới Senior.
- Người học **không mất tiến độ**: mã nội bộ của chặng, chủ đề, mục và URL bài giữ nguyên.
- Roadmap Spring Boot hiện đủ khung ngay từ đầu: các chặng mới có tên, chủ đề, tiền điều kiện, chưa có bài (giống DevOps và Microservices hiện nay).

Ngoài phạm vi: viết bài mới (đợt 2), tóm tắt và tài liệu cho chủ đề của chặng mới, đổi nội dung bài hiện có ngoài việc thay mã.

## 2. Quyết định đã chốt với người dùng

| Câu hỏi | Lựa chọn |
|---|---|
| Phương án | B: tách roadmap Spring Boot |
| Mã hiển thị | Đánh số lại cả hai roadmap: Spring Boot dùng `SB1`…`SB14`; Java liền mạch `J1`…`J14` |
| Tiền tố Spring | `SB` (tránh trùng "Amazon S3") |
| Chặng mới | Dựng sẵn khung trong đợt 1 |

## 3. Cấu trúc sau khi tách

### 3.1 Roadmap Spring Boot

`content/roadmaps/spring-boot.json`: id `spring-boot`, area `backend`, track `spring`, tiêu đề "Spring Boot, từ service đầu tiên tới hệ thống lớn", mô tả "Dựng, kiểm thử và vận hành service Spring Boot trên production, rồi đi sâu vào dữ liệu, tích hợp và hiệu năng cho hệ thống lớn.", `recommended`: `["j10"]` (học xong Java nền tảng trước).

| Cấp (mục tiêu) | Mã | id | Chặng | Ghi chú |
|---|---|---|---|---|
| Nền tảng: dựng và kiểm thử một service Spring Boot | SB1 | j11 | Spring Boot | Chuyển từ Java, 4 bài |
| | SB2 | sb2 | Kiểm thử với Spring | Mới |
| | SB3 | j12 | Lưu trữ dữ liệu | Chuyển, 4 bài |
| Middle: vận hành service trên production | SB4 | sb4 | Transaction | Mới |
| | SB5 | sb5 | Spring Data JPA chuyên sâu | Mới |
| | SB6 | j13 | Bảo mật | Chuyển, 3 bài |
| | SB7 | sb7 | Gọi service khác | Mới |
| | SB8 | j15 | Observability | Chuyển, 3 bài |
| | SB9 | j16 | Cache và messaging | Chuyển, 4 bài |
| | SB10 | sb10 | Tính năng nghiệp vụ hay gặp | Mới |
| | SB11 | j17 | Đóng gói và phát hành | Chuyển, 4 bài |
| Senior: hiệu năng, bảo mật nâng cao, nền tảng nội bộ | SB12 | sb12 | Hiệu năng ứng dụng Spring | Mới |
| | SB13 | sb13 | Bảo mật nâng cao | Mới |
| | SB14 | sb14 | Starter, thư viện nội bộ và nâng cấp | Mới |

id của chặng mới đặt theo mã lúc tạo (`sb2` cho SB2); chặng chuyển sang giữ id cũ. Thư mục: `content/steps/<id>/meta.json`.

Tiền điều kiện nối theo thứ tự trong bảng: SB1 cần `j10`, mỗi chặng sau cần chặng liền trước (`sb2` cần `j11`, `j12` cần `sb2`, `sb4` cần `j12`…).

### 3.2 Chủ đề của chặng mới

Mã chủ đề dạng `<id chặng>.<slug>`; mặc định `kind` là core, `[opt]` là tuỳ chọn. Chưa có `summary` và `resources`.

| Chặng | Chủ đề |
|---|---|
| SB2 Kiểm thử với Spring | Test slice: `@WebMvcTest`, `@DataJpaTest`; `@SpringBootTest` và cache context; Testcontainers với `@ServiceConnection`; Docker Compose khi phát triển; MockMvc và `RestTestClient`; Chiến lược test cho service Spring |
| SB4 Transaction | `@Transactional` và proxy; Propagation; `readOnly` và isolation; Quy tắc rollback; Tự gọi và cách tránh; Sự kiện sau commit với `@TransactionalEventListener`; Transaction dài và khoá |
| SB5 Spring Data JPA chuyên sâu | Quan hệ entity và cascade; Persistence context, dirty checking, flush; Fetch plan và `@EntityGraph`; Projection và DTO; Specification và truy vấn động; Auditing và soft delete; Batch insert và update; Phân trang keyset; Migration không downtime; Spring Data JDBC [opt] |
| SB7 Gọi service khác | `RestClient`; HTTP Service Client với `@HttpExchange`; Timeout và lỗi từ service khác; `@Retryable` và `@ConcurrencyLimit`; Circuit breaker với Resilience4j; gRPC với Spring gRPC [opt]; Chống SSRF |
| SB10 Tính năng nghiệp vụ hay gặp | Upload và lưu file (S3, MinIO); Email và thông báo; Xuất Excel và PDF; Đa ngôn ngữ với `MessageSource`; Tìm kiếm full-text; Đa tenant; Lịch sử thay đổi |
| SB12 Hiệu năng ứng dụng Spring | Thread pool Tomcat và virtual thread; Khởi động nhanh: CDS, AOT cache, khởi động JPA bất đồng bộ; Pool kết nối và timeout; Đo tải với k6 hoặc Gatling; Tìm điểm nghẽn bằng metric và profiler |
| SB13 Bảo mật nâng cao | Phân quyền theo dữ liệu với method security; Cô lập dữ liệu giữa các tenant; Keycloak hoặc Spring Authorization Server; BFF cho SPA; Audit trail; Rate limiting |
| SB14 Starter, thư viện nội bộ và nâng cấp | Auto-configuration và starter tự viết; `@Conditional` và thứ tự cấu hình; BOM nội bộ; Nâng cấp Spring Boot giữa bản lớn với OpenRewrite; Deprecation và tương thích ngược |

### 3.3 Roadmap Java

Mô tả mới: "Viết Java đúng, hiểu JVM và concurrency, rồi tới thiết kế và quyết định kiến trúc." Mục tiêu cấp Middle: "Viết code đồng thời đúng và đọc được JVM khi có sự cố."

| Cấp | Mã mới | id | Chặng | Tiền điều kiện mới |
|---|---|---|---|---|
| Nền tảng | J1–J10 | j1–j10 | Như cũ | Không đổi |
| Middle | J11 | j14 | Concurrency | `j10` (trước là `j13`) |
| | J12 | j18 | JVM và hiệu năng | `j14` (trước là `j17`) |
| Senior | J13 | j19 | Thiết kế và kiến trúc | `j18` |
| | J14 | j20 | Nghề Senior | `j19` |

### 3.4 Không đổi

- Mã nội bộ chặng (`j11`…`j20`), mã chủ đề (`j12.*`), mã mục (`j12.2.*`), id bài (`j12.2`), URL bài (`/vi/learn/j12/j12-2`), `content/ids.lock.json` (chỉ được thêm mã chủ đề mới).
- `recommended` của Microservices (`j11`, `j12`, `d6`, `d7`) và `needs` của hai dự án: vẫn đúng vì trỏ theo id.
- Liên kết chéo trong `links` của chặng.

## 4. Đổi mã hiển thị trong nội dung

Bảng ánh xạ mã cũ sang mã mới:

| Cũ | J11 | J12 | J13 | J14 | J15 | J16 | J17 | J18 | J19 | J20 |
|---|---|---|---|---|---|---|---|---|---|---|
| Mới | SB1 | SB3 | SB6 | J11 | SB8 | SB9 | SB11 | J12 | J13 | J14 |

- Áp cho `code` trong `meta.json` và mọi chỗ nhắc mã trong `content/` (MDX, `meta.json`, roadmap, dự án): khoảng 900 chỗ trong khoảng 70 file.
- Thay **một lượt duy nhất** bằng một biểu thức chính quy khớp nguyên từ, kể cả dạng có số bài (`J12.2` thành `SB3.2`). Không thay tuần tự, vì J14 → J11 rồi J11 → SB1 sẽ sai.
- Script chạy một lần, đặt ở thư mục tạm, không commit. Kết quả kiểm bằng `git diff --stat`, đọc lướt diff, và kiểm tra ở mục 5.
- Không sửa tài liệu lịch sử trong `docs/` (status, spec cũ); chỉ ghi chú bảng ánh xạ vào `status.md`.

## 5. Kiểm tra nội dung mới: mã chặng và mã bài phải tồn tại

`pnpm content:check` báo lỗi khi bài hoặc `meta.json` nhắc mã chặng (`J7`, `SB3`, `D12`, `M5`) không có trong roadmap nào, hoặc mã bài (`SB3.2`) có số bài lớn hơn số bài của chặng đó. Viết theo TDD trong `src/lib/content` (quy ước project).

- Mẫu khớp: `\b(J|SB|D|M)(\d{1,2})(?:\.(\d+))?\b`, bỏ qua khối code (fenced và inline) để không bắt nhầm tên trong lệnh.
- Mã bài chỉ kiểm khi chặng đã có bài; chặng chưa có bài thì chỉ kiểm mã chặng.

## 6. Thay đổi code

| Chỗ | Thay đổi |
|---|---|
| `src/lib/content/constants.ts` | Thêm `spring` vào `TRACKS` |
| `src/lib/content/manifest.ts` | `ROADMAP_ORDER`: `java`, `spring-boot`, `devops`, `microservices` |
| Màu track | `--track-spring`: sáng `#2e7031`, tối `#6fd27a` trong `src/app/tokens.css` và `design/tokens.css`; `--color-track-spring` trong `global.css`; quy tắc `data-track='spring'` ở `roadmap.css` (cả bản `design/`), `lesson.css` (ô chọn roadmap, chip mã chặng) |
| `messages/vi.json`, `en.json` | `tracks.spring`: "Spring Boot" |
| Mã bài hiển thị | `lessonCode` trong `roadmap-client.tsx` đang suy ra từ đường dẫn (`j12-2` thành `J12.2`); đổi sang mã chặng + số thứ tự bài (`SB3.2`). Rà các chỗ khác đang hiện mã bài |
| Tự có, không cần code | Trang `/<lang>/roadmaps/spring-boot`, thẻ trang chủ, tìm roadmap và chủ đề, ô chọn roadmap ở thanh bên bài học |

Màu đã tính: chữ màu track trên chip (nền 16% màu track) đạt 4,8 : 1 ở theme sáng, 6,8 : 1 ở theme tối; `#2f7d32` chỉ đạt 4,13 : 1 nên không dùng.

## 7. Kiểm thử

- Unit (TDD): kiểm tra mã ở mục 5; `lessonCode` mới.
- Cập nhật test đang giả định ba roadmap hoặc mã cũ: E2E đếm thẻ trang chủ (3 thành 4), test nhắc "J16", "J1.1"…; unit `catalog`, `content-views` nếu cần.
- E2E mới: `/vi/roadmaps/spring-boot` hiện 3 cấp, 14 chặng, chặng SB1 có bài; trang Java còn 14 chặng; bài `/vi/learn/j12/j12-1` có thanh bên Spring Boot.
- `pnpm verify`; xem bằng mắt trang chủ, hai trang roadmap, thanh bên ở hai theme.

## 8. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Thay mã sai ngữ cảnh (ví dụ chuỗi trùng mẫu trong lệnh, tên file) | Khớp nguyên từ, chỉ chữ hoa, đọc lướt diff; kiểm tra ở mục 5 bắt mã không tồn tại |
| Người học đã đặt "Tôi đã biết cấp Middle" ở Java | Chấp nhận: cấp Middle giờ là Concurrency và JVM; ghi trong status |
| Tham chiếu "xem J12" trong bài giờ trỏ sang roadmap khác | Văn bản vẫn đúng mã mới (SB3); không thêm liên kết trong đợt này |
| Link ngoài hoặc bookmark tới `#step-j12` trên trang Java | Hash trên trang Java không còn chặng đó; trang vẫn mở bình thường (đã có xử lý hash lạ). Chấp nhận |
