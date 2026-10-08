# Kiến trúc Masteva

Trạng thái: **đã duyệt** ngày 03/10/2026. Đây là tài liệu kiến trúc chính; các tài liệu khác liên kết về đây.

Đầu vào: [product-vision.md](product-vision.md), [features.md](features.md), [content-standard.md](content-standard.md), [framework-comparison.md](framework-comparison.md). Chưa có SRS riêng; `features.md` đóng vai trò nguồn yêu cầu (mã FR/NFR/BR và tiêu chí nghiệm thu).

Phạm vi: giai đoạn G0–G2 được thiết kế chi tiết. G3 (tài khoản, đồng bộ) chỉ ở mức định hướng để không chặn đường về sau.

## 1. Yếu tố quyết định kiến trúc

| Yếu tố | Giá trị | Nguồn yêu cầu |
|---|---|---|
| Thao tác chính | Đọc bài học, tích tiến độ, tìm kiếm | Luồng chính trong features.md |
| Thiết bị | Điện thoại để đọc, máy tính để làm lab | NFR-002 |
| Hiệu năng | Trên 4G: LCP ≤ 2,5 giây, CLS < 0,1; JavaScript của trang bài học ≤ khoảng 260 KB gzip (đo được 257 KB ở G0, phần lớn là phần nền của React, Next.js và Fumadocs; mục tiêu ban đầu 150 KB không đạt được với stack này); tích một mục phản hồi < 100 ms | NFR-001 |
| Dữ liệu | Nội dung công khai; tiến độ G0–G2 chỉ nằm trên trình duyệt, không có dữ liệu cá nhân | NFR-007 |
| Đa ngôn ngữ | `vi` mặc định, sẵn sàng thêm `en` | FR-I18N-001…005 |
| Chi phí | Gần bằng 0 tới hết G2 | NFR-006 |
| Người vận hành | Một người, chủ yếu sửa nội dung | product-vision |

## 2. Tổng quan hệ thống

```text
 Tác giả                     GitHub                         Cloudflare Workers          Người học
 (MDX trong content/) ──push──▶ repo masteva ──build CI──▶ HTML/JS/JSON tĩnh ──CDN──▶ trình duyệt
                               │ kiểm tra nội dung        │ chỉ mục tìm kiếm          │ localStorage (tiến độ)
                               │ typecheck, test, build   │ manifest tiến độ          │
                                                                                     └──(G3)──▶ Supabase
                                                                                               Auth + Postgres + RLS
```

- **Không có máy chủ ứng dụng ở G0–G2.** Next.js chạy ở chế độ static export (`output: 'export'`), mọi trang được render thành file tĩnh lúc build.
- **Nguồn sự thật của nội dung là Git.** Trang web chỉ là bản build từ repo.
- **Nguồn sự thật của tiến độ là trình duyệt của người học** ở G0–G2, và Supabase ở G3.
- **Hệ thống bên ngoài được tin cậy:** GitHub (lưu mã nguồn, chạy CI), Cloudflare Workers với static assets (Workers Builds build và phát file tĩnh, ADR-010), và từ G3 là Supabase.

## 3. Công nghệ

| Lớp | Lựa chọn | Ghi chú |
|---|---|---|
| Framework | Next.js (App Router) + Fumadocs (`fumadocs-core`, `fumadocs-mdx`, `fumadocs-ui`) | Quyết định ở [framework-comparison.md](framework-comparison.md) |
| Ngôn ngữ | TypeScript `strict` | Theo quy ước workspace |
| Nội dung | MDX, schema bằng Zod | |
| Giao diện | Tailwind CSS (đi kèm fumadocs-ui) | |
| Tô màu code | Shiki, chạy lúc build | |
| Tìm kiếm | zbsearch (bản kế thừa Orama), chỉ mục dựng trên trình duyệt từ file nội dung tĩnh (ADR-009) | |
| Kiểm thử | Vitest (unit), Playwright (E2E), Lighthouse CI | |
| Hosting | Cloudflare Workers, static assets (gói miễn phí) | Giới hạn 20.000 file mỗi bản, 25 MiB mỗi file; Workers Builds 3.000 phút build mỗi tháng, 1 build cùng lúc |
| Tài khoản (G3) | Supabase Auth + Postgres + RLS | Định hướng |

Phiên bản cụ thể của từng thư viện được ghi trong `package.json` khi khởi tạo project, không ghi cứng ở đây.

## 4. Cấu trúc repo

```text
masteva/
├── content/
│   ├── roadmaps/              # roadmap: cấp và thứ tự chặng (java, devops, microservices)
│   ├── steps/                 # mỗi bước một thư mục, chứa các bài học
│   │   └── d1/
│   │       ├── meta.json      # thông tin chặng, chủ đề trên sơ đồ, liên kết, thứ tự bài
│   │       ├── d1-1.mdx       # bản gốc tiếng Việt
│   │       └── d1-1.en.mdx    # bản dịch (khi có)
│   ├── projects/              # dự án xuyên suốt và các mốc (neobank, hub-chat)
│   ├── pages/                 # trang nội dung chung: chuẩn bị môi trường, giới thiệu
│   ├── ids.lock.json          # file khoá mã mục, mã chủ đề, mã mốc (mục 5.4), cập nhật bằng `pnpm content:lock`
│   └── LICENSE                # CC BY-NC-SA 4.0
├── messages/                  # chữ giao diện: vi.json, en.json
├── src/
│   ├── app/[lang]/            # các trang theo ngôn ngữ
│   ├── components/            # component bài học, roadmap, tiến độ
│   └── lib/                   # nạp nội dung, manifest, tiến độ, tìm kiếm, i18n
├── labs/                      # code mẫu cho lab, giấy phép MIT
├── scripts/                   # content.ts: kiểm tra nội dung, cập nhật file khoá
├── tests/                     # unit và E2E
├── public/_headers            # header bảo mật, Workers static assets đọc file này
└── docs/
```

Quy tắc phụ thuộc:

- `content/` không chứa code, chỉ MDX, JSON, YAML và ảnh.
- `src/lib` không phụ thuộc vào `src/components`.
- Component bài học chỉ nhận dữ liệu đã được kiểm tra schema.

## 5. Mô hình nội dung

### 5.1 Các thực thể

| Thực thể | Định danh | Chứa gì | Ghi chú |
|---|---|---|---|
| Roadmap | `java`, `devops`, `microservices` | Tên, mô tả, màu (`track`), ba cấp (Nền tảng, Middle, Senior) mỗi cấp có mục tiêu và danh sách chặng; bước nên học trước từ roadmap khác (`recommended`) | Chỉ tham chiếu tới chặng, không chứa bài |
| Bước (chặng) | `d1` | Tên, nhánh, bước tiên quyết, chủ đề trên sơ đồ, liên kết sang chặng của roadmap khác, danh sách bài; `optional` cho chặng tuỳ chọn | Mỗi chặng thuộc đúng một roadmap |
| Chủ đề | `j5.generics` | Tên, loại (`core`, `pick` kèm `options`, `opt`), mô tả ngắn, chủ đề nên học trước, đọc thêm | Nút trên sơ đồ; bài khai báo chủ đề mình bao phủ bằng frontmatter `topics` |
| Bài học | `d1.1` | Metadata (mục 5.2) và nội dung 6 phần | File MDX |
| Mục đánh dấu | `d1.1.exit-code` | Một ý kiến thức, một bước thực hành hoặc một tiêu chí | Khai báo bằng component trong MDX |
| Dự án | `neobank` | Bài toán, kiến trúc mục tiêu, các mốc | |
| Mốc dự án | `neobank.ledger` | Tên, các chặng hoặc chủ đề cần học (`needs`) từ cả ba roadmap | Trang roadmap hiện "Dùng ở dự án" từ dữ liệu này |

Mọi định danh đều độc lập với ngôn ngữ (FR-I18N-003).

### 5.2 Metadata bài học

Kiểm tra bằng schema Zod mở rộng từ `pageSchema` của Fumadocs. Build thất bại nếu sai schema.

| Trường | Bắt buộc | Ý nghĩa |
|---|---|---|
| `id` | Có | Mã bài, ví dụ `d1.1` |
| `step` | Có | Mã bước chứa bài |
| `title`, `description` | Có | Dùng cho trang, SEO, tìm kiếm |
| `prerequisites` | Không | Danh sách mã bài hoặc mã bước tiên quyết |
| `status` | Có | `draft`, `verified` hoặc `outdated` |
| `verified` | Khi `status = verified` | Ngày kiểm chứng; hệ điều hành; phiên bản các công cụ |
| `outdatedNote` | Khi `status = outdated` | Phần nào có thể đã cũ |
| `source` | Chỉ ở bản dịch | Phiên bản bản gốc mà bản dịch dựa vào (hash nội dung bản gốc) |

### 5.3 Khung 6 phần là component

Mỗi bài dùng đúng 6 component theo thứ tự: `<Goal>`, `<Knowledge>`, `<Resources>`, `<Practice>`, `<DeepDive>`, `<Mastery>`.

Các component phụ trong bài:

| Component | Dùng cho |
|---|---|
| `<Check id="…">` | Một mục đánh dấu tiến độ |
| `<Terminal where="vm\|mac\|container\|pod">` | Khối lệnh có nhãn nơi chạy, kết quả mong đợi, giải thích |
| `<Predict>` | Ẩn kết quả cho tới khi người học bấm xem |
| `<Callout kind="production\|pitfall\|ai\|link">` | Các loại callout chuẩn |
| `<Reveal>` | Lời giải ẩn cho câu hỏi đào sâu |

Lý do dùng component thay cho tiêu đề Markdown: vừa kiểm soát được cách trình bày, vừa kiểm tra tự động được bài có đủ phần hay không (FR-LESSON-001, FR-CONTENT-003).

### 5.4 Mã mục ổn định và file khoá

Đáp ứng BR-003 (không làm mất tiến độ người học) và FR-PROGRESS-007.

- Mã mục được **viết tường minh** trong MDX, không suy ra từ vị trí.
- Mã chủ đề (`topics`) và mã mốc dự án (`milestones`) cũng được khoá trong cùng file, dùng chung `replacements`.
- `content/ids.lock.json` liệt kê mọi mã đã từng phát hành, kèm mã thay thế nếu mục đã bị gộp hoặc đổi tên.
- **Khi build:**
  - Mã mới chưa có trong file khoá: được phép; script cập nhật file khoá thêm vào.
  - Mã có trong file khoá nhưng không còn trong nội dung và không có mã thay thế: **build thất bại**.
  - Mã trùng trong cùng một ngôn ngữ, hoặc bản dịch có mã không tồn tại ở bản gốc: **build thất bại**.
- Trên trình duyệt, khi nạp tiến độ, mã cũ được ánh xạ sang mã thay thế.

### 5.5 Manifest

Lúc build, `src/lib/content/manifest.ts` đọc thẳng thư mục `content/` và dựng cây roadmap → bước → bài → danh sách mã mục, cùng bảng mã thay thế. Server component truyền phần cần thiết xuống trình duyệt qua props; trình duyệt dùng dữ liệu này để tính tiến độ mà không phải tải nội dung bài. Ngoại lệ duy nhất là nội dung khung chi tiết chủ đề (ADR-008): route handler tĩnh `src/app/[lang]/(home)/roadmaps/[roadmap]/topics.json/route.ts` sinh `/<lang>/roadmaps/<roadmap>/topics.json` lúc build, trang roadmap chỉ tải file này khi người học mở khung lần đầu.

## 6. Định tuyến và đa ngôn ngữ

**Nhóm trang** (đường dẫn chi tiết chốt khi dựng):

| Nhóm | Ví dụ |
|---|---|
| Trang chủ | `/vi/` kiêm danh mục roadmap (nhóm route `(landing)`, không có nút tìm trên header), có ô tìm roadmap và chủ đề chạy trên trình duyệt (chỉ mục dựng lúc build, truyền qua props) và lối sang tìm nội dung bài (⌘K) |
| Chi tiết roadmap | `/vi/roadmaps/java` (sơ đồ, `#<mã chủ đề>` mở khung chi tiết); `/vi/roadmaps` là trang tĩnh chuyển về `/vi/`; `/vi/roadmaps/senior-backend` là trang tĩnh trỏ tới ba roadmap mới |
| Bài học | `/vi/learn/d1/d1-1` |
| Dự án | `/vi/projects/neobank` |
| Tiến độ của tôi | `/vi/progress` |
| Trang chung | `/vi/setup` (chuẩn bị môi trường) |

**Quy tắc:**

- Mọi trang nằm dưới `/[lang]/`, sinh tĩnh bằng `generateStaticParams`.
- **Trang `/`:** static export không có middleware, nên `/` là một trang tĩnh nhỏ. Nó đọc ngôn ngữ người dùng đã chọn trong `localStorage` rồi chuyển hướng; nếu chưa chọn thì chuyển sang `/vi/`. Có thẻ `<meta http-equiv="refresh">` dự phòng khi JavaScript tắt.
- **Trang chưa dịch:** lúc build, trang `/en/...` được tạo từ bản tiếng Việt, kèm thông báo "chưa có bản dịch" (FR-I18N-004). `fallbackLanguage` của Fumadocs trả về trang tiếng Việt mà không cho biết đó là bản thay thế, nên trang kiểm tra sự tồn tại của file `<bài>.<lang>.mdx` để quyết định hiện thông báo. Bản dịch có `source` khác hash hiện tại của bản gốc thì hiện nhãn "bản dịch có thể đã cũ".
- **SEO:** mỗi trang có `hreflang` cho các bản ngôn ngữ và `x-default` trỏ về `vi`. Trang dùng bản gốc vì chưa dịch thì đặt canonical trỏ về bản tiếng Việt, tránh nội dung trùng lặp (NFR-005).
- **Chữ giao diện:** nằm trong `messages/{lang}.json`, kết hợp với phần dịch có sẵn của fumadocs-ui (FR-I18N-002).
- **Ngôn ngữ ban đầu:** chỉ bật `vi`. Danh sách ngôn ngữ đọc từ biến `MASTEVA_LOCALES` lúc build (mặc định `vi`); build cho E2E dùng `vi,en` để kiểm tra trang chưa dịch. Thêm `en` cho production chỉ cần đổi biến và thêm file dịch.
- **Giới hạn ở G0:** tên bước trên trang roadmap lấy từ `meta.json` tiếng Việt; khi có bản tiếng Anh, cần đọc thêm `meta.en.json`.

## 7. Tiến độ học

### 7.1 G0–G2: lưu trên trình duyệt

- **Nơi lưu:** `localStorage`, khoá `masteva:progress:v2`. Dữ liệu ở khoá v1 được chuyển sang v2 một lần, khoá v1 giữ lại.
- **Dữ liệu:** phiên bản schema; `items` (mã mục → thời điểm hoàn thành); `topics` (mã chủ đề → trạng thái tự đặt `learning`/`done`/`skipped` và thời điểm); `start` (roadmap → cấp bắt đầu). Không lưu theo ngôn ngữ.
- **Trạng thái chủ đề:** trạng thái tự đặt thắng; nếu không có thì suy ra từ mục đã tích trong các bài gắn với chủ đề. Chủ đề `opt` và chủ đề bỏ qua không tính vào tổng.
- **Tính tổng:** tiến độ của bài, bước và roadmap được tính trên trình duyệt từ manifest. Không lưu số tổng, nên không bao giờ bị lệch.
- **Nhiều tab:** lắng nghe sự kiện `storage` để các tab đồng bộ với nhau.
- **Nâng cấp schema:** khi phiên bản trong máy cũ hơn, chạy hàm chuyển đổi rồi ghi lại.
- **Lỗi lưu trữ** (chế độ ẩn danh, bị chặn, đầy): vẫn cho tích trong phiên hiện tại và hiện cảnh báo "tiến độ sẽ không được lưu".
- **Xuất và nhập:** file JSON v2 (nhận cả v1). Khi nhập thì **gộp**: mục lấy hợp và giữ thời điểm sớm hơn, chủ đề giữ trạng thái đặt sau cùng, cấp bắt đầu giữ bản hiện có (FR-PROGRESS-003).
- **Hiệu năng:** tích một mục chỉ ghi `localStorage` và cập nhật giao diện ngay, không có I/O mạng.

### 7.2 Đồng bộ theo tài khoản

Đã thiết kế chi tiết (07/10/2026): [spec](superpowers/specs/2026-10-07-tai-khoan-dong-bo-tien-do-design.md), migration `supabase/migrations/*_learning_progress.sql`. Phần dưới là định hướng ban đầu, vẫn đúng.


- **Nguồn sự thật chuyển sang Supabase.** Trình duyệt giữ bản sao để dùng khi không có mạng.
- **Dữ liệu logic:** mỗi bản ghi gồm người dùng, mã mục và thời điểm hoàn thành. Thao tác bỏ tích được ghi lại để đồng bộ đúng giữa các máy. Cột và bảng cụ thể sẽ thiết kế ở G3.
- **Phân quyền:** RLS chỉ cho người dùng đọc và ghi bản ghi của chính mình.
- **Lần đăng nhập đầu:** gộp tiến độ trên máy vào tài khoản (FR-PROGRESS-005). Mục và chủ đề của khách giữ thời điểm gốc nên thao tác mới hơn trên tài khoản vẫn thắng; cấp bắt đầu của tài khoản được giữ. Xem spec 2026-10-07 §6.
- **Xung đột:** cùng một mục thì giữ trạng thái có thời điểm mới nhất.
- **Xoá tài khoản:** xoá toàn bộ bản ghi của người dùng (FR-ACCOUNT-002).
- Không cần máy chủ riêng; site vẫn là static export.

## 8. Tìm kiếm

- **Công cụ:** zbsearch. Lúc build, route tĩnh `src/app/[lang]/search.json/route.ts` xuất nội dung các bài (tiêu đề, đề mục, đoạn văn, đường dẫn) thành `/<lang>/search.json`; trình duyệt dựng chỉ mục từ file này (`src/lib/search/lesson-index.ts`, `lesson-client.ts`), xem ADR-009.
- **Tải chậm:** file chỉ được tải khi người học mở hộp tìm kiếm và gõ lần đầu, mỗi ngôn ngữ một lần trong phiên, nên trang bài học không bị nặng thêm.
- **Tokenizer tiếng Việt** (FR-SEARCH-001):
  1. Chuyển về chữ thường.
  2. Chuẩn hoá Unicode NFD rồi bỏ dấu thanh và dấu phụ.
  3. Đổi `đ` thành `d`, vì NFD không tách được chữ này.
  4. Tách từ theo ký tự chữ và số của Unicode.

  Nội dung và từ khoá tìm kiếm đi qua cùng tokenizer, nên "tien trinh" và "tiến trình" cho cùng kết quả.
- **Đã kiểm chứng ở G0:** bộ tách từ mặc định (zbsearch, bản kế thừa Orama mà Fumadocs 16 dùng) chỉ bỏ được một phần dấu: "Tiến trình đồng bộ" thành `tiến`, `trinh`, `dồng`, `bộ`, nên gõ không dấu không ra kết quả. Tokenizer riêng giải quyết được và có unit test.
- **Phía trình duyệt:** `createLessonSearchClient` tạo cơ sở dữ liệu zbsearch với cùng tokenizer, nạp tài liệu rồi gom kết quả theo trang như Fumadocs. Hộp tìm kiếm được tải chậm (`next/dynamic`), nên zbsearch và bộ dựng kết quả không nằm trong JavaScript ban đầu của trang.
- **Ngân sách kích thước:** `/vi/search.json` dưới 2 MB (E2E kiểm). Ngày 05/10/2026, với 64 bài: 1,34 MB, 387 KB gzip (bản xuất Orama cũ: 16 MB cho `vi,en`). Khi gần chạm ngân sách thì chia file theo roadmap.

## 9. Trang bài học

- **Render:** nội dung MDX được render thành HTML lúc build (React Server Components). Trang đọc được đầy đủ trước khi JavaScript chạy.
- **Phần chạy JavaScript** chỉ gồm: ô tích, `<Predict>`, `<Reveal>`, nút copy, hộp tìm kiếm, widget tiến độ.
- **Khối lệnh:** Shiki tô màu lúc build; `<Terminal>` thêm khung, nhãn nơi chạy và kết quả mong đợi (FR-LESSON-003).
- **Sơ đồ:** SVG tĩnh hoặc component SVG viết tay, có mô tả thay thế, đổi màu theo chế độ sáng/tối (FR-LESSON-006, NFR-003, NFR-004). Không tải thư viện vẽ sơ đồ ở trình duyệt. Sơ đồ tương tác (FR-LESSON-007, G2) là component riêng, chỉ tải trên trang dùng nó.
- **Nhãn trạng thái:** trang hiển thị nhãn "Nháp", "Đã kiểm chứng ngày… với phiên bản…" hoặc "Cần cập nhật" từ metadata (FR-LESSON-009).

## 10. Kiểm tra nội dung và CI

Chạy trên mọi pull request và trước mỗi lần deploy.

| Bước | Kiểm tra | Chặn build? |
|---|---|---|
| Schema | Metadata đúng schema; bài `verified` có ngày và môi trường | Có |
| Khung bài | Đủ 6 component theo đúng thứ tự | Có |
| Mã mục | Không trùng; khớp file khoá; bản dịch không có mã lạ | Có |
| Liên kết nội bộ | Không trỏ tới trang hoặc mục không tồn tại | Có |
| Code | Typecheck, lint, unit test | Có |
| Build | Static export thành công; số file dưới giới hạn của Cloudflare Workers static assets | Có |
| E2E | Các kịch bản ở mục 13 | Có |
| Hiệu năng | Lighthouse CI trên trang chủ, một trang roadmap và một trang bài học | Cảnh báo khi vượt ngân sách |
| Link ngoài | Chạy định kỳ hằng tuần, tạo issue khi có link hỏng | Không |

Việc chạy lại lab tự động (FR-CONTENT-004) để sang G3.

## 11. Bảo mật

- **G0–G2:**
  - Không có secret, không có máy chủ, không có dữ liệu cá nhân.
  - Header bảo mật đặt qua `public/_headers`: Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Static export của Next.js chèn script nội tuyến để nạp dữ liệu trang, nên CSP phải cho `script-src 'unsafe-inline'`; không dùng được nonce khi không có máy chủ.
  - Không gắn công cụ theo dõi của bên thứ ba. Nếu cần thống kê truy cập thì dùng loại không cookie (ví dụ Cloudflare Web Analytics), không gửi dữ liệu cá nhân.
- **G3:**
  - Trình duyệt chỉ dùng khoá publishable (`sb_publishable_…`) của Supabase; mọi quyền truy cập dựa vào RLS. Khoá secret không bao giờ xuất hiện ở trình duyệt hay trong repo.
  - CSP `connect-src` cho phép `https://*.supabase.co`. `supabase-js` chỉ được tải khi bấm đăng nhập hoặc khi máy đã có phiên.
  - Đăng nhập bằng GitHub hoặc Google qua Supabase Auth.
  - Tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025: có chính sách quyền riêng tư, cho phép xoá tài khoản.
- **Nội dung:** quy tắc BR-004 và BR-005 được kiểm tra khi review. Bài không hướng dẫn chạy lệnh vào hệ thống thật, và lệnh phá huỷ dữ liệu phải có cảnh báo.

## 12. Triển khai và vận hành

- **Luồng:** repo GitHub `hoangduoc0603/masteva` kết nối Workers Builds. Push lên `master` thì Cloudflare chạy `pnpm content:check && pnpm build` rồi `npx wrangler deploy`; nhánh khác tạo bản xem trước. Cấu hình ở `wrangler.jsonc` (thư mục `out/`, trang 404 là `404.html`, `html_handling: auto-trailing-slash`).
- **Rollback:** chọn lại một phiên bản cũ của Worker trên Cloudflare, hoặc `git revert`.
- **Sao lưu:** Git là nguồn sự thật, không có dữ liệu nào cần sao lưu riêng ở G0–G2. Từ G3, dùng cơ chế sao lưu của Supabase.
- **Tên miền:** `masteva.com` khi đã đăng ký. Trước đó dùng tên miền `*.workers.dev` mặc định.
- **Theo dõi giới hạn:** số file mỗi lần build và số lần build mỗi tháng. Nếu tiến gần 3.000 phút build mỗi tháng, gộp thay đổi nội dung trước khi push.
- **Chuyển sang có máy chủ khi cần:** nếu sau này cần middleware hoặc tính năng chạy phía máy chủ, bỏ `output: 'export'` và deploy cùng code lên nền tảng chạy Next.js. Không phải viết lại ứng dụng.

## 13. Kiểm thử

| Loại | Nội dung |
|---|---|
| Unit | Lưu và nạp tiến độ, nâng cấp schema, gộp khi nhập file, ánh xạ mã thay thế, tính tổng từ manifest, tokenizer tiếng Việt (có dấu, không dấu, chữ `đ`); đồng bộ tài khoản (hàng đợi, bản mới nhất thắng, gộp lần đầu, chia lô) |
| Database (`pnpm test:db`) | pgTAP cho RLS và hàm; adapter Supabase với database local (phân trang quá 1.000 dòng, con trỏ, người khác không thấy dữ liệu) |
| Script nội dung | File khoá: thêm mã mới, xoá mã không có thay thế (phải lỗi), mã trùng (phải lỗi) |
| E2E (Playwright) | Mở bài, tích mục, tải lại trang vẫn còn; hai tab đồng bộ; tìm "tien trinh" ra bài D1.1; mở `/en/...` của bài chưa dịch thấy thông báo; trang `/` chuyển sang `/vi/`; xuất rồi nhập tiến độ; tài khoản với Supabase giả lập (khách không tải supabase-js, kéo và đẩy tiến độ, đăng xuất, callback lỗi) |
| Hiệu năng | Lighthouse CI theo ngân sách ở mục 1 |
| Khả năng truy cập | Kiểm tra tự động bằng axe trong E2E; điều hướng bàn phím trên trang bài học |

## 14. Quyết định kiến trúc (ADR)

| Mã | Quyết định | Lý do | Đánh đổi | Trạng thái |
|---|---|---|---|---|
| ADR-001 | Fumadocs trên Next.js | Cần giao diện tuỳ biến sâu và tính năng ứng dụng ở G3–G4; tìm kiếm tiếng Việt tuỳ chỉnh được | Nặng hơn Starlight; phải tự làm thông báo chưa dịch và khung terminal | Đã chấp nhận (03/10/2026) |
| ADR-002 | Static export, host trên Cloudflare (ban đầu là Pages, nay là Workers, xem ADR-010) | Chi phí 0 kể cả khi thương mại; không có máy chủ phải vận hành | Không có middleware; mọi tính năng phải chạy được ở trình duyệt hoặc lúc build | Đã chấp nhận (03/10/2026) |
| ADR-003 | Mã mục tường minh, kèm file khoá | Sửa nội dung không làm mất tiến độ (BR-003); tiến độ dùng chung giữa các ngôn ngữ | Tác giả phải đặt mã cho từng mục; thêm một bước kiểm tra khi build | Đã chấp nhận (03/10/2026) |
| ADR-004 | Tiến độ lưu trên trình duyệt khi chưa đăng nhập; đăng nhập (Google) thì đồng bộ qua Supabase cùng RLS, đưa lên sớm hơn G3 theo yêu cầu ngày 07/10/2026 | Chưa cần tài khoản để có giá trị; vẫn giữ được static export | Thêm phụ thuộc Supabase và JS khi đăng nhập; khách vẫn chỉ lưu trên một máy trừ khi xuất/nhập file | Đã chấp nhận (03/10/2026), sửa 07/10/2026 |
| ADR-005 | Tokenizer tìm kiếm riêng cho tiếng Việt | Người Việt hay gõ không dấu; bộ tách từ mặc định có thể cắt nhầm chữ có dấu | Phải tự viết và kiểm thử | Đã chấp nhận (03/10/2026), đã kiểm chứng ở G0 |
| ADR-006 | Nội dung chung repo với code, nằm trong `content/` | Đơn giản cho một người vận hành; tách repo sau vẫn dễ | Người đóng góp nội dung phải làm việc trong repo có code | Đã chấp nhận (03/10/2026) |
| ADR-008 | Nội dung khung chi tiết chủ đề nằm trong file JSON tĩnh theo roadmap, tải khi mở khung | Render sẵn mọi panel làm HTML trang Java lên 147 KB gzip (ngân sách 150 KB), vì Next lặp nội dung server component trong payload RSC; tách ra còn 30 KB HTML và 43 KB JSON tải sau | Tóm tắt chủ đề không còn trong HTML (SEO kém hơn một chút); lần mở khung đầu tiên chờ một request; panel render phía trình duyệt (+1,5 KB JS) | Đã chấp nhận (04/10/2026) |
| ADR-009 | Tìm nội dung bài: xuất file nội dung gọn theo ngôn ngữ, dựng chỉ mục zbsearch trên trình duyệt | Bản xuất Orama của Fumadocs nặng 16 MB (3,3 MB gzip) với 64 bài, sẽ vượt giới hạn 25 MiB mỗi file của Cloudflare Pages khi đủ ba roadmap; phần chữ thật chỉ khoảng 0,84 MB | Lần tìm đầu tiên tốn thêm thời gian dựng chỉ mục; tự viết phần gom kết quả (theo `searchAdvanced` của Fumadocs) | Đã chấp nhận (05/10/2026) |
| ADR-010 | Host trên Cloudflare Workers (static assets) thay cho Pages | Giao diện Cloudflare đã ghi Pages là "legacy"; Workers có cùng chi phí 0 cho file tĩnh, đọc `_headers`/`_redirects`, Workers Builds có 3.000 phút build mỗi tháng | Thêm file `wrangler.jsonc`; tên Worker phải trùng tên project trên Cloudflare | Đã chấp nhận (06/10/2026) |
| ADR-007 | Giấy phép: CC BY-NC-SA 4.0 cho nội dung, MIT cho code mẫu trong `labs/` | Cho chia sẻ nội dung nhưng không cho dùng thương mại; code mẫu dùng tự do | CC BY-NC-SA hạn chế cả đối tác thương mại muốn dùng lại | Đã chấp nhận (03/10/2026) |

## 15. Truy vết yêu cầu tới thiết kế (G0–G1)

| Yêu cầu | Mục thiết kế |
|---|---|
| FR-ROADMAP-001…005, 007 | 5.1, 5.5, 6, 7.1 |
| FR-LESSON-001…006, 009, 010 | 5.2, 5.3, 9 |
| FR-LAB-001…004 | 4 (`labs/`, `content/pages/`), 5.3 |
| FR-PROJECT-001…003, 006 | 5.1 |
| FR-PROGRESS-001…003, 007 | 5.4, 5.5, 7.1 |
| FR-REVIEW-001 | 5.3 (`<Reveal>`) |
| FR-SEARCH-001 | 8 |
| FR-I18N-001…003 | 5.1, 6 |
| FR-CONTENT-001…003 | 4, 5.2, 10 |
| NFR-001…007 | 1, 8, 9, 10, 11 |
| BR-001…005 | 5.2, 5.4, 10, 11 |

## 16. Giả định và câu hỏi còn mở

| Chủ đề | Trạng thái | Cần chốt trước |
|---|---|---|
| Giấy phép cho code của chính trang web (MIT hay giữ bản quyền) | Chưa chốt | Khi công khai repo |
| Repo công khai hay riêng tư trong G0–G1 | Giả định: riêng tư cho tới beta | G2 |
| Tokenizer tiếng Việt hoạt động đúng trong Fumadocs | Đã kiểm chứng ở G0 (unit test và E2E) | |
| Kích thước chỉ mục tìm kiếm khi đủ 29 bước | Đo được 19 KB gzip cho 1 bài; cần đo lại | Cuối G1 |
| Ngân sách JavaScript trang bài học | Đã điều chỉnh lên khoảng 260 KB gzip; theo dõi bằng Lighthouse khi có CI | G2 |
| Công cụ thống kê truy cập | Chưa chọn; ưu tiên loại không cookie | G2 |
| Thiết kế chi tiết dữ liệu và luồng đồng bộ ở G3 | Chỉ có định hướng | Trước G3 |
