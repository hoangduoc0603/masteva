# Tiến độ Masteva

Cập nhật lần cuối: 05/10/2026. File này giúp một session mới biết dự án đang ở đâu; cập nhật mỗi khi xong một mốc.

## Đã xong

| Mốc | Kết quả | Tài liệu |
|---|---|---|
| Khám phá sản phẩm | Nghiên cứu 15 đối thủ, giá trị cốt lõi, persona, tính năng theo module | [market-research.md](market-research.md), [product-vision.md](product-vision.md), [features.md](features.md) |
| Chuẩn nội dung | Khung bài 6 phần, quy tắc viết, quy trình kiểm chứng, quy tắc dịch | [content-standard.md](content-standard.md) |
| Kiến trúc | Fumadocs trên Next.js, static export lên Cloudflare Pages, ADR-001…007 | [framework-comparison.md](framework-comparison.md), [architecture.md](architecture.md) |
| **Giai đoạn 0 (nền móng)** | Trang chủ, danh mục roadmap, roadmap 29 bước, trang bài học, tiến độ trên trình duyệt, xuất/nhập, tìm kiếm không dấu, kiểm tra nội dung và file khoá mã. Bài mẫu D1.1 (nháp). `pnpm verify` xanh: 30 unit test, 16 E2E | [README.md](../README.md) |
| **Định hướng thiết kế** | Critique G0 (24/40); chọn hướng Night Lab sau vòng thiết kế lại bằng ui-ux-pro-max; thiết kế local trong `design/` (token, design system, trang mẫu) | [design-direction.md](design-direction.md), `design/index.html` |
| **Tách roadmap** | 3 roadmap Java, DevOps, Microservices (58 chặng, 379 chủ đề, 3 cấp); sơ đồ trục giữa, view danh sách, khung chi tiết chủ đề (hash), "Tôi đã biết"; tiến độ v2 (trạng thái chủ đề, tự chuyển từ v1); 2 trang dự án; trang chủ, danh mục, breadcrumb và chip chủ đề trong bài; theme tối mặc định. Review toàn nhánh: sửa 3 lỗi (hash hỏng làm sập trang, nút "Chưa học", token import ra ngoài `src/`). Critique trang roadmap 23/40 (G0: 24/40); đã sửa hai lỗi P1 (thanh công cụ dính, vòng focus) và đổi màu Java (`#ff7a59` tối, `#be2f45` sáng). `pnpm verify` xanh: 68 unit test, 35 E2E | [spec](superpowers/specs/2026-10-03-tach-roadmap-design.md), [plan](superpowers/plans/2026-10-03-tach-roadmap.md) |
| **Khung chi tiết chủ đề** | Sửa P0 của critique: tóm tắt, tài liệu chính thức, trạng thái trống có hướng đi, nút Trước/Tiếp, chip "Bài", "Học tiếp" vào thẳng bài khi có. Nội dung 67 chủ đề cấp Nền tảng Java (J1–J10), link kiểm 200 ngày 03/10/2026. `pnpm verify` xanh: 69 unit, 39 E2E | `design/topic-drawer.html`, `design/components/TopicDrawer.md` |
| **Luồng Java dùng thử được** | Nội dung 145 chủ đề Java (J1–J20: tóm tắt và tài liệu chính thức, link kiểm 200 ngày 03/10/2026); 3 bài J1 (J1.1 JDK/javac/jshell và J1.3 Git, Javadoc đã kiểm chứng trên macOS 14.4.1, Java 25.0.3, Git 2.39.3; J1.2 IDE và debugger còn nháp vì có bước chỉ làm trên IDE); giao diện bài học theo Night Lab (`src/app/lesson.css`); hoàn thiện trang roadmap sau critique (một màu "đã xong", thanh Học tiếp mobile chỉ hiện khi cần, vùng chạm 44px, khung chi tiết đọc được bằng trình đọc màn hình, mở cấp thu gọn khi link trỏ vào); sửa lỗi tiến độ (nhập file, quota, `__proto__`); `format()` tách khỏi `messages.ts` (JS giảm ~11 KB gzip mỗi trang). `pnpm verify` xanh: 75 unit, 47 E2E | `content/steps/j1/`, `design/components/` |
| **Cấp Nền tảng Java đủ bài** | 25 bài cho J2–J10 (mỗi chặng 2–3 bài, lab chạy thật bằng JDK 25.0.3, Maven 3.9.9, Docker 29.8 cho Testcontainers; tất cả đã kiểm chứng); ba reviewer độc lập soát kiến thức, đã sửa mọi lỗi (JEP 513, `strip`, HashMap treeify, quy tắc version plugin Maven, Testcontainers với Docker 29, bản nháp Idempotency-Key đã hết hạn…). D1.1 kiểm chứng trong VM Lima. Khung chi tiết tải nội dung từ `topics.json` (ADR-008): HTML trang Java 147 → 30 KB gzip. `pnpm verify` xanh: 76 unit, 47 E2E | `content/steps/j2…j10/`, `docs/architecture.md` ADR-008 |
| **Roadmap Java hoàn chỉnh** | 63 bài cho J1–J20, phủ mọi chủ đề chính và cả 7 chủ đề tuỳ chọn (JPMS, WebFlux/Quarkus, jOOQ/MongoDB, Spring Batch, GraalVM native image); tất cả đã kiểm chứng bằng lab chạy thật (Spring Boot 4.1.1, PostgreSQL 18, Keycloak, Jaeger, Redis, Kafka, Testcontainers, Jib, Buildpacks, GraalVM). Mỗi chặng qua một reviewer độc lập và một vòng sửa. Chuẩn nội dung thêm quy tắc cho bước làm trên giao diện (kiểm bằng công cụ dòng lệnh tương đương). `pnpm verify` xanh: 76 unit, 47 E2E | `content/steps/j1…j20/` |
| **Trang chủ và phần đầu roadmap v2** | Bỏ mục nav "Roadmap"; trang chủ kiêm danh mục, tìm roadmap và chủ đề không dấu ngay trên trình duyệt (`searchCatalog`), khối "Đang học"; `/vi/roadmaps` chuyển về trang chủ. Trang roadmap: link "Tất cả roadmap", khối tiếp tục cấu trúc cố định (nút "Vào học" không dời chỗ), "Tôi đã biết cấp này" trên đầu mỗi cấp kèm Hoàn tác, thanh cấp dính có tiến độ từng cấp và cấp đang xem, Sơ đồ/Danh sách và "Ẩn mục đã bỏ qua" (mobile gộp vào bảng nổi); bỏ "Cách đọc sơ đồ". Sau dùng thử: mỗi trang một ô tìm (trang chủ tắt nút tìm trên header, có dòng chuyển sang tìm trong bài học), tên roadmap ngắn ("Java"), bỏ chân trang giấy phép. `pnpm verify` xanh: 82 unit, 76 E2E. Chưa commit | [spec](superpowers/specs/2026-10-05-trang-chu-roadmap-ux-design.md), [plan](superpowers/plans/2026-10-05-trang-chu-roadmap-ux.md), `design/home-v2.html`, `design/roadmap-v2.html` |
| Công cụ cho Claude Code | Đã cài cho project: plugin Impeccable, frontend-design, Superpowers; skill web-design-guidelines, vercel-react-best-practices | `.claude/settings.json`, `.claude/skills/` |

## Quyết định đã chốt

- Tên **Masteva** (master + -va). `masteva.com` chưa đăng ký, chưa kiểm tra nhãn hiệu.
- Đối tượng là lập trình viên nói chung; nhóm roadmap đầu tiên là backend: ba roadmap Java, DevOps, Microservices, mỗi roadmap từ nền tảng tới Senior, kèm hai dự án (Neobank mini, Hub hội thoại) có trang riêng.
- Tiếng Việt là ngôn ngữ mặc định; thiết kế sẵn đa ngôn ngữ, tiếng Anh dự kiến là ngôn ngữ thứ hai.
- Thứ tự công việc: xây web và hoàn thiện nội dung 3 roadmap trước, sau đó người sáng lập mới vừa học vừa tối ưu.
- Giấy phép: CC BY-NC-SA 4.0 cho nội dung, MIT cho code mẫu trong `labs/`. Giấy phép cho code web còn mở.
- Thiết kế theo hướng **Night Lab** (Bricolage Grotesque, Be Vietnam Pro, JetBrains Mono; nền navy, nhấn hổ phách; theme tối mặc định), chọn sau vòng thiết kế lại bằng skill ui-ux-pro-max. Thay cho hướng "Sổ tay kỹ sư" chọn trước đó. Thiết kế lưu local trong `design/`, không dùng artifact. Xem [design-direction.md](design-direction.md).
- Đã cài skill ui-ux-pro-max (CLI `uipro`, cùng 6 skill đi kèm: design, design-system, ui-styling, brand, banner-design, slides) vào `.claude/skills/`.

## Git

Repo local, nhánh mặc định `master`. Ngày 03/10/2026 có 3 commit; commit mới nhất gồm tách roadmap, Night Lab, nội dung Java và bài J1. Chưa có remote. Cache của Impeccable (`hook.cache.json`, `live/`) nằm trong `.gitignore`; bản critique trong `.impeccable/critique/` được commit.

## Chưa làm, chờ quyết định của người dùng

- Tạo repo GitHub, kết nối Cloudflare Pages, đăng ký tên miền.

## Bước tiếp theo

1. **Người dùng học thử roadmap Java** (63 bài) và ghi lại chỗ vướng; ưu tiên sửa nội dung theo phản hồi thật.
2. **Roadmap DevOps** theo đúng quy trình Java: tóm tắt và tài liệu cho chủ đề, bài cho từng chặng (lab trên VM Lima, Docker, Kubernetes local), review và sửa. Sau đó Microservices.
3. **Đề cương hai dự án** (Neobank, Hub hội thoại) và trang `/setup` chuẩn bị môi trường.
4. Kết nối GitHub và Cloudflare Pages khi người dùng sẵn sàng.

## Vấn đề đã biết

- HTML trang chủ 34 KB gzip (05/10/2026), phần lớn là chỉ mục tìm kiếm khoảng 380 chủ đề.
- Tìm nội dung bài (⌘K) dùng `/<lang>/search.json`: 1,34 MB, 387 KB gzip cho 64 bài (ADR-009, thay bản xuất Orama 16 MB). Ngân sách 2 MB; gần chạm thì chia theo roadmap.
- HTML trang roadmap Java 30 KB gzip sau khi tách nội dung khung chi tiết ra `topics.json` (43 KB gzip, tải khi mở khung; ADR-008).
- JavaScript (gzip, đo 03/10/2026 sau khi tách `format()`): roadmap 268 KB, bài học 287 KB, trang chủ 266 KB; vẫn trên ngân sách ~260 KB, phần lớn là nền React/Next.js/Fumadocs. Cần đo bằng Lighthouse.
- Giao diện bài học dựa vào cấu trúc nội bộ của Fumadocs/Shiki (nút sao chép, màu token); có E2E bảo vệ vị trí nút "Sao chép". Không dùng `title=` cho khối code bên trong `<Terminal>`.
- Lỗi nhỏ còn để lại: view danh sách nháy view sơ đồ lúc tải; ô tích ẩn của Check nằm lệch so với ô vẽ (ảnh hưởng điều khiển bằng giọng nói); trong Terminal chỉ dòng đầu có dấu `$`; khoá `lesson.reveal` và khối `@theme --color-track-*` trong `global.css` có thể không còn dùng.
- `CLAUDE.md` có khối `nextjs-agent-rules` do `pnpm dev` của Next 16 tự chèn, đã commit theo yêu cầu "commit toàn bộ". Muốn bỏ thì xoá khối và đặt `agentRules: false` trong `next.config.mjs`, nếu không `next dev` sẽ chèn lại.
- Critique trang roadmap 23/40 (03/10/2026): đã sửa P0, P1 và P2; nên chạy lại `/impeccable critique` để chấm điểm mới.
- Tên chặng, tên chủ đề và mô tả roadmap chỉ có tiếng Việt (`meta.json`, `content/roadmaps/*.json`); cần đọc `meta.en.json` khi có bản tiếng Anh.
- Chủ đề DevOps, Microservices chưa có `summary` và `resources`; khung chi tiết hiện trạng thái trống kèm nút Trước/Tiếp.
- `src/app/tokens.css` và `src/app/roadmap.css` là bản chép của `design/`; `src/app/lesson.css` chuyển thể từ `design/components.css`. Sửa `design/` thì cập nhật lại.
- Bài Java dài 450–1050 dòng (lab đầy đủ trong heredoc); HTML bài nặng nhất khoảng 67 KB gzip, trong ngân sách. Một số mốc phiên bản (Spring Boot 4.1.1, JDK 25, Jackson 3.2, Kafka 4.3…) sẽ cũ dần; `verified` ghi ngày và phiên bản để biết khi nào cần rà lại.
- Lab J12.4 cần biến `GLIBC_TUNABLES` vì kernel VM của Docker Desktop (7.0.12) xung đột với MongoDB 8/9; bỏ được khi Docker Desktop lên kernel 7.0.14.
- Header CSP trong `public/_headers` chưa được kiểm thử trên Cloudflare Pages.
- Lighthouse CI chưa cài.

## Cách làm việc với người dùng

- Trả lời bằng tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.
- Chỉ commit, push, tạo PR hoặc deploy khi được yêu cầu rõ ràng.
- Thay đổi lớn thì lập kế hoạch (Plan mode) và chờ duyệt trước khi code.
- Người dùng thích tài liệu gọn, có bảng; không thích bị giao bài hay phải gửi lại output.
