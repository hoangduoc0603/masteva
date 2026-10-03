# Tiến độ Masteva

Cập nhật lần cuối: 03/10/2026. File này giúp một session mới biết dự án đang ở đâu; cập nhật mỗi khi xong một mốc.

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

1. **Người dùng thử luồng Java** trên bản build (`pnpm build && pnpm start`, hoặc cấu hình `site` trong `.claude/launch.json`), ghi lại chỗ vướng.
2. **Bài học Java tiếp theo:** J2–J10 theo `content-standard.md`, mỗi chặng 2–3 bài như J1; J1.2 cần cách kiểm chứng cho bước làm trên IDE (người dùng tự làm theo, hoặc bổ sung quy tắc vào `content-standard.md` §4).
3. **Sau khi luồng Java chuẩn:** nội dung chủ đề và bài cho DevOps, Microservices; đề cương hai dự án; trang `/setup`.
4. **Kiểm chứng D1.1** trong VM Lima rồi đổi `status` sang `verified`.

## Vấn đề đã biết

- HTML trang roadmap Java 139 KB gzip khi đủ nội dung 145 chủ đề (ngân sách 150 KB). Khung chi tiết render sẵn mọi panel và nội dung bị lặp trong payload RSC. Trước khi điền nội dung DevOps (130 chủ đề) nên tách nội dung khung chi tiết ra file JSON tĩnh theo roadmap, tải khi mở khung.
- JavaScript (gzip, đo 03/10/2026 sau khi tách `format()`): roadmap 268 KB, bài học 287 KB, trang chủ 266 KB; vẫn trên ngân sách ~260 KB, phần lớn là nền React/Next.js/Fumadocs. Cần đo bằng Lighthouse.
- Giao diện bài học dựa vào cấu trúc nội bộ của Fumadocs/Shiki (nút sao chép, màu token); có E2E bảo vệ vị trí nút "Sao chép". Không dùng `title=` cho khối code bên trong `<Terminal>`.
- Lỗi nhỏ còn để lại: view danh sách nháy view sơ đồ lúc tải; `data-expanded` của cấp không bị gỡ khi đổi "Tôi đã biết"; ô tích ẩn của Check nằm lệch so với ô vẽ (ảnh hưởng điều khiển bằng giọng nói); trong Terminal chỉ dòng đầu có dấu `$`; khoá `lesson.reveal` và khối `@theme --color-track-*` trong `global.css` có thể không còn dùng.
- `CLAUDE.md` có khối `nextjs-agent-rules` do `pnpm dev` của Next 16 tự chèn, đã commit theo yêu cầu "commit toàn bộ". Muốn bỏ thì xoá khối và đặt `agentRules: false` trong `next.config.mjs`, nếu không `next dev` sẽ chèn lại.
- Critique trang roadmap 23/40 (03/10/2026): đã sửa P0, P1 và P2; nên chạy lại `/impeccable critique` để chấm điểm mới.
- Tên chặng, tên chủ đề và mô tả roadmap chỉ có tiếng Việt (`meta.json`, `content/roadmaps/*.json`); cần đọc `meta.en.json` khi có bản tiếng Anh.
- Chủ đề DevOps, Microservices chưa có `summary` và `resources`; khung chi tiết hiện trạng thái trống kèm nút Trước/Tiếp.
- `src/app/tokens.css` và `src/app/roadmap.css` là bản chép của `design/`; `src/app/lesson.css` chuyển thể từ `design/components.css`. Sửa `design/` thì cập nhật lại.
- Header CSP trong `public/_headers` chưa được kiểm thử trên Cloudflare Pages.
- Lighthouse CI chưa cài.

## Cách làm việc với người dùng

- Trả lời bằng tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.
- Chỉ commit, push, tạo PR hoặc deploy khi được yêu cầu rõ ràng.
- Thay đổi lớn thì lập kế hoạch (Plan mode) và chờ duyệt trước khi code.
- Người dùng thích tài liệu gọn, có bảng; không thích bị giao bài hay phải gửi lại output.
