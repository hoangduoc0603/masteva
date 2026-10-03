# Tiến độ Masteva

Cập nhật lần cuối: 03/10/2026. File này giúp một session mới biết dự án đang ở đâu; cập nhật mỗi khi xong một mốc.

## Đã xong

| Mốc | Kết quả | Tài liệu |
|---|---|---|
| Khám phá sản phẩm | Nghiên cứu 15 đối thủ, giá trị cốt lõi, persona, tính năng theo module | [market-research.md](market-research.md), [product-vision.md](product-vision.md), [features.md](features.md) |
| Chuẩn nội dung | Khung bài 6 phần, quy tắc viết, quy trình kiểm chứng, quy tắc dịch | [content-standard.md](content-standard.md) |
| Kiến trúc | Fumadocs trên Next.js, static export lên Cloudflare Pages, ADR-001…007 | [framework-comparison.md](framework-comparison.md), [architecture.md](architecture.md) |
| **Giai đoạn 0 (nền móng)** | Trang chủ, danh mục roadmap, roadmap 29 bước, trang bài học, tiến độ trên trình duyệt, xuất/nhập, tìm kiếm không dấu, kiểm tra nội dung và file khoá mã. Bài mẫu D1.1 (nháp). `pnpm verify` xanh: 30 unit test, 16 E2E | [README.md](../README.md) |
| Công cụ cho Claude Code | Đã cài cho project: plugin Impeccable, frontend-design, Superpowers; skill web-design-guidelines, vercel-react-best-practices | `.claude/settings.json`, `.claude/skills/` |

## Quyết định đã chốt

- Tên **Masteva** (master + -va). `masteva.com` chưa đăng ký, chưa kiểm tra nhãn hiệu.
- Đối tượng là lập trình viên nói chung; nhóm roadmap đầu tiên là backend (Senior Java · DevOps · Microservices, kèm dự án hub hội thoại và Neobank).
- Tiếng Việt là ngôn ngữ mặc định; thiết kế sẵn đa ngôn ngữ, tiếng Anh dự kiến là ngôn ngữ thứ hai.
- Thứ tự công việc: xây web và hoàn thiện nội dung 3 roadmap trước, sau đó người sáng lập mới vừa học vừa tối ưu.
- Giấy phép: CC BY-NC-SA 4.0 cho nội dung, MIT cho code mẫu trong `labs/`. Giấy phép cho code web còn mở.

## Git

Repo local, nhánh mặc định `master`, commit đầu tiên ngày 03/10/2026. Chưa có remote.

## Chưa làm, chờ quyết định của người dùng

- Tạo repo GitHub, kết nối Cloudflare Pages, đăng ký tên miền.

## Bước tiếp theo

1. **Định hướng thiết kế:** dùng `/frontend-design` và `/impeccable` để viết `docs/design-direction.md` (tính cách thương hiệu, font, màu, trình bày code và terminal, chuyển động), rồi áp dụng lên các trang hiện có. Giao diện G0 đang dùng theme neutral mặc định của Fumadocs.
2. **Giai đoạn 1:** viết đủ bài cho 29 bước theo `content-standard.md`, trang dự án (hub hội thoại, Neobank), trang `/setup` chuẩn bị môi trường. Nguồn nội dung tham khảo: `../senior-lab/roadmap.html` (danh sách mục, tài liệu, thực hành của từng giai đoạn).
3. **Kiểm chứng D1.1:** chạy lại lab trong VM Lima (`limactl shell ubuntu`), rồi đổi `status` sang `verified`.

## Vấn đề đã biết

- JavaScript trang bài học khoảng 257 KB gzip (ngân sách đã chỉnh lên ~260 KB, xem architecture §1).
- Tên bước trên trang roadmap chỉ có tiếng Việt (`meta.json`); cần đọc `meta.en.json` khi có bản tiếng Anh.
- Header CSP trong `public/_headers` chưa được kiểm thử trên Cloudflare Pages.
- Lighthouse CI chưa cài.

## Cách làm việc với người dùng

- Trả lời bằng tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.
- Chỉ commit, push, tạo PR hoặc deploy khi được yêu cầu rõ ràng.
- Thay đổi lớn thì lập kế hoạch (Plan mode) và chờ duyệt trước khi code.
- Người dùng thích tài liệu gọn, có bảng; không thích bị giao bài hay phải gửi lại output.
