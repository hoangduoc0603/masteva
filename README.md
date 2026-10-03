# Masteva

Nền tảng học dành cho lập trình viên nói chung: lộ trình đầy đủ, bài học trực quan, lab chạy trên máy thật và dự án xuyên suốt. Bắt đầu với các roadmap backend (Java, DevOps, Microservices). Tiếng Việt là ngôn ngữ mặc định, sẽ hỗ trợ đa ngôn ngữ.

> Học ở một nơi, từ hiểu khái niệm tới làm được trong dự án thật.

## Trạng thái

Giai đoạn 0 (nền móng): site đọc được bài theo roadmap, đánh dấu tiến độ trên trình duyệt, tìm kiếm không dấu. Có một bài mẫu (D1.1); 28 bước còn lại đang soạn. Chưa deploy.

## Chạy

Yêu cầu: Node 22+, pnpm 11.

```bash
pnpm install
pnpm dev            # http://localhost:3000/vi
```

| Lệnh | Việc |
|---|---|
| `pnpm build` | Kiểm tra nội dung, cập nhật `content/ids.lock.json`, static export ra `out/` |
| `pnpm start` | Phục vụ `out/` để xem bản build |
| `pnpm typecheck` / `pnpm lint` | Kiểm tra TypeScript và ESLint |
| `pnpm test` | Unit test (Vitest) |
| `pnpm content:check` | Kiểm tra nội dung: khung 6 phần, mã mục, file khoá, link nội bộ |
| `pnpm content:lock` | Như trên và thêm mã mục mới vào file khoá |
| `pnpm e2e` | Build với `vi,en` rồi chạy E2E (Playwright). Lần đầu chạy `pnpm exec playwright install chromium` |
| `pnpm verify` | Chạy tất cả các bước trên |

Biến môi trường (đều không bắt buộc):

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `MASTEVA_LOCALES` | `vi` | Ngôn ngữ bật lúc build, ví dụ `vi,en` |
| `SITE_URL` | `http://localhost:3000` | URL gốc cho metadata tuyệt đối |

## Cấu trúc

```text
content/        roadmap, bước, bài học (MDX), ids.lock.json — CC BY-NC-SA 4.0
messages/       chữ giao diện theo ngôn ngữ
src/app/        các trang theo /[lang]/, trang / chuyển hướng, chỉ mục tìm kiếm
src/components/ khung bài học, roadmap, tiến độ, tìm kiếm
src/lib/        nạp và kiểm tra nội dung, tiến độ, tokenizer tiếng Việt, i18n
scripts/        script kiểm tra nội dung
labs/           code mẫu cho lab — MIT
tests/          unit và E2E
docs/           tài liệu sản phẩm và kiến trúc
```

Kiến trúc chi tiết: [docs/architecture.md](docs/architecture.md). Cách viết bài: [docs/content-standard.md](docs/content-standard.md).

## Deploy

Thiết kế để host tĩnh trên Cloudflare Pages (build command `pnpm build`, output `out/`). Chưa kết nối; header bảo mật nằm ở `public/_headers`.

## Liên quan

- `../senior-lab/`: phòng lab và roadmap cá nhân của người sáng lập; nội dung đã soạn ở đó sẽ được chuyển dần vào Masteva.
