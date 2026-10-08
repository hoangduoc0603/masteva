# Masteva

Nền tảng học dành cho lập trình viên nói chung: lộ trình đầy đủ, bài học trực quan, lab chạy trên máy thật và dự án xuyên suốt. Bắt đầu với các roadmap backend (Java, DevOps, Microservices). Tiếng Việt là ngôn ngữ mặc định, sẽ hỗ trợ đa ngôn ngữ.

> Học ở một nơi, từ hiểu khái niệm tới làm được trong dự án thật.

## Trạng thái

Giai đoạn 0 (nền móng) và tách roadmap: ba roadmap Java, DevOps, Microservices (58 chặng, 379 chủ đề) có sơ đồ "trục giữa", khung chi tiết chủ đề, tiến độ theo chủ đề trên trình duyệt; hai trang dự án; tìm kiếm không dấu. Có một bài mẫu (D1.1); các chặng còn lại đang soạn bài. Giao diện theo hướng Night Lab, theme tối mặc định. Chưa deploy.

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
| `pnpm content:check` | Kiểm tra nội dung: khung 6 phần, mã mục, chủ đề, quan hệ roadmap/chặng/dự án, file khoá, link nội bộ |
| `pnpm content:lock` | Như trên và thêm mã mục, mã chủ đề, mã mốc mới vào file khoá |
| `pnpm exec serve design -l 4400` | Xem thiết kế local (`design/index.html`) |
| `pnpm e2e` | Build với `vi,en` rồi chạy E2E (Playwright). Lần đầu chạy `pnpm exec playwright install chromium` |
| `pnpm verify` | Chạy tất cả các bước trên |

Database tài khoản (Supabase, chỉ chạy local cho tới khi có project cloud). Cần Supabase CLI và Docker:

| Lệnh | Việc |
|---|---|
| `supabase db start` | Chạy Postgres local (chỉ database, nhẹ hơn `supabase start`) |
| `supabase db reset --local` | Dựng lại database từ `supabase/migrations/` |
| `supabase test db` | Test phân quyền pgTAP trong `supabase/tests/database/` |
| `pnpm test:db` | pgTAP rồi test adapter Supabase (`tests/db/`) với database local; cần `supabase start` |
| `supabase db advisors --local` | Rà lỗi bảo mật và hiệu năng |

Biến môi trường (đều không bắt buộc):

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `MASTEVA_LOCALES` | `vi` | Ngôn ngữ bật lúc build, ví dụ `vi,en` |
| `SITE_URL` | `http://localhost:3000` | URL gốc cho metadata tuyệt đối |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | trống | Bật đăng nhập Google và đồng bộ tiến độ; trống thì không có đăng nhập. Local lấy từ `supabase status -o env` vào `.env.local` (xem `.env.example`). Chỉ dùng khoá `sb_publishable_…` |

## Cấu trúc

```text
content/        roadmaps/ (java, devops, microservices), steps/ (chặng: meta.json có topics, bài MDX), projects/, ids.lock.json — CC BY-NC-SA 4.0
design/         thiết kế Night Lab: tokens.css (nguồn token), roadmap.css (chép sang src/app/), trang mẫu, design system
messages/       chữ giao diện theo ngôn ngữ
src/app/        các trang theo /[lang]/, trang / chuyển hướng, chỉ mục tìm kiếm
src/components/ khung bài học, roadmap, tiến độ, tìm kiếm
src/lib/        nạp và kiểm tra nội dung, tiến độ, tokenizer tiếng Việt, i18n
scripts/        script kiểm tra nội dung
labs/           code mẫu cho lab — MIT
supabase/       migrations/ (nguồn sự thật của schema), tests/database/ (pgTAP), config.toml
tests/          unit và E2E
docs/           tài liệu sản phẩm và kiến trúc
```

Kiến trúc chi tiết: [docs/architecture.md](docs/architecture.md). Cách viết bài: [docs/content-standard.md](docs/content-standard.md). Giao diện: [docs/design-direction.md](docs/design-direction.md).

## Deploy

Host tĩnh trên Cloudflare Workers (static assets, ADR-010), cấu hình ở `wrangler.jsonc`: Workers Builds kết nối repo GitHub, mỗi lần push lên `master` chạy `pnpm content:check && pnpm build` rồi `npx wrangler deploy` (đưa thư mục `out/` lên). Biến môi trường trên Cloudflare: `NODE_VERSION=22`, `PNPM_VERSION=11.9.0`, `MASTEVA_LOCALES=vi`. URL và khoá publishable của Supabase production nằm trong `.env.production` (Next nhúng lúc build), không cần đặt trên Cloudflare. Supabase production: project `jnmwvzognbveagudeizr` (Singapore); migration đưa lên bằng `supabase db push`, cấu hình Auth bằng `supabase config push` (phần `[remotes.production]` trong `supabase/config.toml`). Header bảo mật nằm ở `public/_headers`. Chạy thử trên máy: `pnpm build && npx wrangler dev`.

## Liên quan

- `../senior-lab/`: phòng lab và roadmap cá nhân của người sáng lập; nội dung đã soạn ở đó sẽ được chuyển dần vào Masteva.
