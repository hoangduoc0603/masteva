# Đánh giá nội dung roadmap Java và Spring Boot

Ngày: 09/10/2026. Trạng thái: **đợt 1 đã làm (09/10/2026)**: tách roadmap Spring Boot, xem [spec](superpowers/specs/2026-10-09-tach-roadmap-spring-boot-design.md). Đợt 2 (bài cho SB4, SB5, SB2, SB7) chưa làm. Mã chặng trong file này là mã cũ, trước khi tách (J11–J20). Trả lời hai câu hỏi: (1) phần Spring Boot đã đủ để làm dự án thật và hệ thống lớn chưa, có nên tách thành roadmap riêng; (2) các phần Java khác đã đủ chưa, nên bổ sung gì.

## 1. Hiện trạng

| | Số liệu |
|---|---|
| Roadmap Java | 20 chặng, 134 chủ đề chính, 63 bài (mỗi bài 380–1.050 dòng, lab chạy thật) |
| Cấp Nền tảng (J1–J10) | Công cụ, ngôn ngữ, OOP, exception, collections, lập trình hàm, build, test, I/O, HTTP/REST |
| Cấp Middle (J11–J17) | Spring Boot, dữ liệu, bảo mật, concurrency, observability, cache và messaging, đóng gói |
| Cấp Senior (J18–J20) | JVM và hiệu năng, thiết kế và kiến trúc, nghề Senior |
| Spring trong roadmap | Chặng J11 "Spring Boot" có 4 bài; J12, J13, J15, J16, J17 đều viết trên Spring Boot (thực chất 6/7 chặng Middle là Spring) |
| Roadmap liên quan | Microservices (M1–M18) đã có saga, outbox, gateway, resilience, Spring Cloud, contract test; DevOps (D0–D19) có container, Kubernetes, CI/CD. Hai roadmap này mới có khung chủ đề, chưa có bài (trừ D1.1) |

**So với roadmap.sh:** Masteva đã phủ gần hết 88 chủ đề Java và 44 chủ đề Spring Boot của roadmap.sh, và sâu hơn ở phần production (observability, bảo mật, messaging, đóng gói, JVM). Các mục của roadmap.sh mà Masteva chưa có bài riêng: Spring AOP, quan hệ và vòng đời entity, Spring Data JDBC, test slice (`@WebMvcTest`, `@DataJpaTest`), Spring Cloud (Config, Gateway, OpenFeign, circuit breaker; nằm ở roadmap Microservices).

## 2. Câu hỏi 1: Spring Boot đã đủ chưa

### Kết luận

**Đủ để một người tự dựng và vận hành đúng chuẩn production một service Spring Boot cỡ vừa** (REST, PostgreSQL, bảo mật OAuth2, log, metric, trace, Kafka, Redis, container). **Chưa đủ sâu cho hệ thống lớn và dự án nhiều người**, ở ba mảng: (a) JPA và transaction, nơi phát sinh nhiều bug nhất trong dự án Spring thật; (b) tích hợp và kiểm thử ở quy mô nhiều service; (c) các tính năng nghiệp vụ hay gặp. Nội dung đang nén: chặng J11 gói toàn bộ container, cấu hình, Web MVC, validation, lỗi và cả WebFlux vào 4 bài; JDBC, JPA, Spring Data, Flyway và N+1 nằm chung trong một bài (J12.2).

### Chỗ thiếu cụ thể

| Mảng | Hiện có | Thiếu cho dự án thật |
|---|---|---|
| Spring core | IoC, bean, auto-configuration (J11.1) | Proxy và AOP (vì sao `@Transactional`, `@Cacheable`, `@Async` "không chạy" khi tự gọi), `BeanPostProcessor`, `@Conditional`, viết starter nội bộ, sự kiện ứng dụng |
| Transaction | Nhắc trong J12.3 và vài bài khác | Bài riêng: propagation, `readOnly`, quy tắc rollback, transaction dài, `@TransactionalEventListener`, transaction với messaging |
| JPA và Hibernate | 1 bài chung với JDBC, Spring Data, Flyway | Quan hệ (`@OneToMany`, `@ManyToOne`), cascade và `orphanRemoval`, persistence context, dirty checking, flush; projection, Specification; auditing, soft delete; batch insert; phân trang keyset; khoá và version; Hibernate 7 |
| Kiểm thử với Spring | MockMvc trong J11.3, Testcontainers trong J8.3 | Test slice, `@ServiceConnection`, Docker Compose support, cache context để test nhanh, `RestTestClient` (Boot 4), chiến lược test cho dự án lớn |
| Gọi service khác | Nhắc `RestClient` | `RestClient`, HTTP Service Client (`@HttpExchange`, Boot 4 tự cấu hình), timeout, `@Retryable` và `@ConcurrencyLimit` (Spring 7), xử lý lỗi từ service khác; gRPC (Boot 4.1 hỗ trợ chính thức) |
| Tính năng mới Boot 4.x | Lab đã chạy Boot 4.1.1 | API versioning có sẵn (Spring 7), null safety với JSpecify, Jackson 3, starter OpenTelemetry, chống SSRF ở HTTP client (4.1) |
| Bảo mật nâng cao | Filter chain, JWT, OAuth2 resource server, OWASP | Method security theo dữ liệu (ai sửa được bản ghi nào), đa tenant, Keycloak hoặc Spring Authorization Server, BFF cho SPA, audit trail |
| Tính năng nghiệp vụ hay gặp | Gần như chưa có | Upload và lưu file (S3, MinIO), email và thông báo, xuất Excel/PDF, đa ngôn ngữ (`MessageSource`), tìm kiếm full-text (PostgreSQL hoặc OpenSearch), đa tenant, lịch sử thay đổi |
| Hiệu năng ứng dụng Spring | JVM ở J18, pool ở J12.3 | Thread pool Tomcat và virtual thread trong Spring Boot, thời gian khởi động (CDS, AOT cache của JDK 25), đo tải bằng k6 hoặc Gatling |

### Có nên tách Spring Boot thành roadmap riêng

| Phương án | Mô tả | Được | Mất |
|---|---|---|---|
| A. Giữ nguyên, bổ sung vào Java | Chèn 5–6 chặng mới vào cấp Middle của Java | Một lộ trình liền mạch; ít việc nhất | Roadmap Java lên khoảng 26 chặng, cấp Middle quá dài; người tìm "Spring Boot" khó thấy |
| **B. Tách roadmap "Spring Boot" (đề xuất)** | Java giữ ngôn ngữ, JVM, build, test, concurrency, HTTP/REST, thiết kế, nghề Senior; Spring Boot nhận các chặng Spring hiện có (J11–J13, J15–J17) và các chặng mới, từ cơ bản tới Senior; hai roadmap nối nhau bằng `recommended` | Khớp cách người học tìm và cách thị trường gọi tên (roadmap.sh, tin tuyển dụng đều tách Spring Boot); đủ chỗ đi sâu; Java dùng lại được cho Quarkus và các framework khác; roadmap Microservices trỏ thẳng tới Spring Boot | Việc chuyển chặng; mã hiển thị đổi (ví dụ J11 thành S1) nhưng **mã chặng, mã chủ đề, mã mục và URL bài giữ nguyên nên không mất tiến độ** |
| C. Tạo "Spring Boot chuyên sâu" chồng lên Java | Java giữ J11–J17; roadmap mới chỉ chứa phần nâng cao | Không phải chuyển gì | Ranh giới mơ hồ, trùng chủ đề, người học không biết học bên nào trước |

**Đề xuất phương án B.** Lý do: sau khi bổ sung, phần Spring có khoảng 12–14 chặng, đủ là một roadmap; người học Java backend ở Việt Nam gần như chắc chắn dùng Spring Boot, nên một roadmap Spring Boot đầy đủ là thứ họ tìm. Kiến trúc nội dung đã hỗ trợ: chặng thuộc đúng một roadmap, mã hiển thị (`code`) khai báo trong `meta.json`, tiến độ gắn với mã ổn định trong `ids.lock.json`.

Khung đề xuất cho roadmap Spring Boot (mã mới gán khi làm):

| Cấp | Chặng |
|---|---|
| Nền tảng | Container, bean, AOP và proxy · Cấu hình và profile · REST với Spring MVC, validation, lỗi, API versioning · Kiểm thử với Spring (slice, Testcontainers, `@ServiceConnection`) |
| Middle | Transaction · Spring Data JPA chuyên sâu (quan hệ, persistence context, truy vấn, hiệu năng) · Migration và dữ liệu (Flyway, zero-downtime) · Bảo mật · Gọi service khác (RestClient, HTTP Service Client, gRPC, resilience) · Cache và messaging · Observability · Tính năng nghiệp vụ hay gặp (file, email, xuất báo cáo, i18n, tìm kiếm) · Đóng gói và phát hành |
| Senior | Hiệu năng ứng dụng Spring · Bảo mật nâng cao (đa tenant, Authorization Server, audit) · Viết starter và thư viện nội bộ · Nâng cấp Spring Boot giữa các bản lớn |

## 3. Câu hỏi 2: các phần Java khác

### Kết luận

Phần ngôn ngữ, collections, concurrency, JVM và hiệu năng **đủ và sâu hơn mặt bằng** tài liệu phổ biến. Thiếu một vài chủ đề nền mà framework dựa vào, vài tính năng Java mới, và quan trọng nhất là **thực hành tổng hợp trên một dự án lớn**.

| Mảng | Đánh giá | Đề xuất |
|---|---|---|
| Ngôn ngữ (J2–J6) | Đủ | Thêm bài **annotation và reflection** (tự viết annotation, đọc bằng reflection, annotation processor): nền để hiểu Spring, JPA, Jackson. Thêm tính năng Java 21–25 chưa dạy rõ: record pattern, sequenced collections, biến vô danh `_`, scoped value, stream gatherer |
| Build và test (J7–J8) | Đủ | Gradle hiện chỉ là lựa chọn: nên có lab Gradle tương đương Maven; ArchUnit cho quy tắc kiến trúc |
| I/O, HTTP (J9–J10) | Đủ | Không cần thêm |
| Concurrency (J14) | Tốt | Không cần thêm |
| JVM và hiệu năng (J18) | Tốt | Thêm AOT cache và CDS của JDK 25, compact object headers; một bài **load test** (k6 hoặc Gatling) gắn với đọc kết quả JFR |
| Dữ liệu | Thiếu nhiều nhất | PostgreSQL nâng cao: đọc execution plan sâu, partitioning, read replica, migration không downtime (expand/contract), vòng đời dữ liệu; Redis ngoài cache (rate limit, lock, stream). Đặt ở Spring Boot hoặc một chặng "Dữ liệu cho backend" |
| Thiết kế, kiến trúc (J19–J20) | Tốt nhưng mỏng ở system design (1 bài) | Thêm 2–3 case study system design có số liệu (ví dụ ví điện tử, đặt chỗ, chat); phần hệ phân tán đã nằm ở Microservices |
| **Thực hành tổng hợp** | **Chưa có** | Hai dự án xuyên suốt (Neobank mini, Hub hội thoại) mới có trang và mốc, chưa có đề cương chi tiết. Đây là đòn bẩy lớn nhất để biến kiến thức rời thành khả năng làm dự án thật: mỗi mốc là một phần hệ thống, có yêu cầu, tiêu chí nghiệm thu, và gắn với chặng đã học |

## 4. Thứ tự đề xuất

| Đợt | Việc | Ước lượng |
|---|---|---|
| 1 | Chốt cấu trúc: tách roadmap Spring Boot (phương án B), chuyển chặng, cập nhật trang roadmap và liên kết; không đổi nội dung bài | 1 kế hoạch + 1 đợt code |
| 2 | Bài mới có tác động lớn nhất: Transaction, Spring Data JPA chuyên sâu (2–3 bài), Kiểm thử với Spring, Gọi service khác | 7–8 bài |
| 3 | Đề cương dự án Neobank (mốc, yêu cầu, tiêu chí nghiệm thu), dùng ngay nội dung đợt 2 | 1 tài liệu + trang dự án |
| 4 | Tính năng nghiệp vụ hay gặp, bảo mật nâng cao, hiệu năng Spring, dữ liệu nâng cao | 8–10 bài |
| 5 | Bổ sung Java: annotation và reflection, Java 21–25, load test, case study system design | 5–6 bài |

Trước đợt 1 nên để người học dùng thử nội dung hiện có (bước tiếp theo số 1 trong `status.md`): phản hồi thật sẽ cho biết bài nào cần tách hay viết lại trước.

## 5. Nguồn

- roadmap.sh, danh sách chủ đề Java và Spring Boot lấy từ repo [nilbuild/developer-roadmap](https://github.com/nilbuild/developer-roadmap) (thư mục `roadmaps/java/content`, `roadmaps/spring-boot/content`), truy cập 09/10/2026.
- [Spring Boot 4.0 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Release-Notes); [InfoQ: Spring Framework 7 và Spring Boot 4](https://www.infoq.com/news/2025/11/spring-7-spring-boot-4) (API versioning, HTTP Service Client, `@Retryable`/`@ConcurrencyLimit`, JSpecify, Jackson 3).
- [Spring Boot 4.1.0 available now](https://spring.io/blog/2026/06/10/spring-boot-4/); [InfoQ: Spring Boot 4.1](https://infoq.com/news/2026/06/spring-boot-4-1) (gRPC, chống SSRF, khởi động JPA bất đồng bộ).
- Nội dung hiện có: `content/roadmaps/*.json`, `content/steps/*/meta.json`, bài `content/steps/j*/`.
