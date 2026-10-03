# So sánh framework web: Astro Starlight và Fumadocs

Ngày khảo cứu: 03/10/2026. Trạng thái: **đã chốt Fumadocs (Next.js)** ngày 03/10/2026. Các điểm cần tự làm và các điểm cần kiểm chứng ở mục 4 và 5 vẫn áp dụng khi dựng giai đoạn 0.

## 1. Hai lựa chọn

| | Astro Starlight | Fumadocs |
|---|---|---|
| Bản chất | Theme tài liệu chạy trên Astro | Bộ công cụ tài liệu chạy trên Next.js (App Router, React) |
| Phiên bản hiện tại | 0.39 (05/2026), vẫn ở mức 0.x | 16.x |
| Người duy trì | Đội lõi Astro | Chủ yếu một tác giả chính (fuma-nama) cùng cộng đồng |
| Triết lý | Có sẵn bố cục tài liệu hoàn chỉnh, tuỳ biến bằng cách thay component | Headless: cung cấp phần lõi, giao diện tự ghép theo ý mình |

## 2. So sánh theo yêu cầu của Masteva

| Tiêu chí (liên quan tới yêu cầu) | Starlight | Fumadocs | Lợi thế |
|---|---|---|---|
| **Tốc độ trang bài học** (NFR-001) | Mặc định là HTML tĩnh, rất ít JavaScript; component tương tác chạy dạng "island" | Có app shell của Next.js và React runtime, nặng hơn nhưng vẫn nhanh với React Server Components | Starlight |
| **Đa ngôn ngữ** (FR-I18N) | Có sẵn: định tuyến theo locale, chuỗi giao diện tiếng Việt có sẵn, hỗ trợ RTL, **tự hiển thị bản gốc kèm thông báo khi trang chưa được dịch** | Có sẵn định tuyến `/[lang]/` và tìm kiếm theo locale; tự nhận là "không phải thư viện i18n đầy đủ", phần còn lại của app cần thêm thư viện như next-intl | Starlight |
| **Tìm kiếm tiếng Việt** (FR-SEARCH-001) | Pagefind, tìm kiếm tĩnh không cần máy chủ. Tiếng Việt chỉ có giao diện, **không có stemming**; cách xử lý dấu chưa được tài liệu nêu | Orama, tìm kiếm trong trình duyệt, **cho truyền tokenizer tuỳ chỉnh** nên có thể tự viết bước bỏ dấu để tìm được cả có dấu lẫn không dấu (suy ra, cần thử) | Fumadocs |
| **Trang tuỳ biến**: danh sách bước, tiến độ, trang dự án (FR-ROADMAP, FR-PROGRESS, FR-PROJECT) | Làm được: thay component, dùng `StarlightPage` cho trang riêng, thêm trang Astro tuỳ ý, nhúng React. Nhưng luôn phải làm việc trong khuôn bố cục tài liệu | Headless, toàn quyền thiết kế bố cục bài học và các trang ứng dụng | Fumadocs |
| **Tính năng ứng dụng về sau**: tài khoản, đồng bộ tiến độ, AI, thanh toán (G3–G4) | Astro có SSR, API route, Actions; làm được nhưng ít tài liệu và mẫu cho ứng dụng lớn | Next.js là framework ứng dụng đầy đủ; Supabase có sẵn helper cho Next.js | Fumadocs |
| **Khối lệnh**: nhãn nơi chạy, copy, đánh dấu dòng (FR-LESSON-003) | Expressive Code có sẵn: khung terminal hoặc editor có tiêu đề, copy, đánh dấu dòng, diff | Shiki với tiêu đề, copy, đánh dấu dòng, tab; khung kiểu terminal phải tự làm thêm | Starlight |
| **Kiểm tra metadata bài học** (FR-CONTENT-002) | Content Collections với schema Zod | Schema Zod qua fumadocs-mdx | Ngang nhau |
| **Kiểm tra link hỏng** (FR-CONTENT-003) | Plugin cộng đồng `starlight-links-validator` | Thư viện `next-validate-link` của cùng tác giả | Ngang nhau |
| **Hosting tĩnh, chi phí gần 0** (NFR-006) | Ưu tiên tĩnh ngay từ thiết kế | Hỗ trợ static export, tìm kiếm tĩnh qua `staticGET`; tài liệu lưu ý file chỉ mục tải về sẽ lớn khi site nhiều nội dung | Starlight |
| **Khớp stack mặc định của workspace** (Next.js + Supabase) | Không | Có | Fumadocs |
| **Rủi ro dài hạn** | Vẫn 0.x, có thể đổi API giữa các bản; người dùng Next.js phải học thêm Astro | Phụ thuộc nhiều vào một người duy trì; cộng đồng nhỏ hơn | Mỗi bên một kiểu |

## 3. Cách nhìn tổng thể

- **Starlight thắng ở phần nội dung:** trang bài học nhanh hơn, đa ngôn ngữ đầy đủ hơn (kể cả thông báo trang chưa dịch, đúng yêu cầu FR-I18N-004), khối lệnh đẹp sẵn. Đường nhanh nhất để có một site bài học tốt.
- **Fumadocs thắng ở phần ứng dụng:** Masteva không chỉ là site tài liệu mà là nền tảng học, với danh sách bước, theo dõi tiến độ, trang dự án, sau này có tài khoản, AI và có thể cả thanh toán. Càng về sau, phần "ứng dụng" càng nặng, và Next.js hợp hơn. Tìm kiếm không dấu cho tiếng Việt cũng dễ làm hơn nhờ tokenizer tuỳ chỉnh.

## 4. Đề xuất

**Chọn Fumadocs (Next.js).** Đã chốt.

Lý do:

1. Masteva sẽ có giao diện riêng ở mức sâu: bố cục bài học 6 phần, ô đánh dấu tiến độ, "đoán trước", trang dự án. Bản chất headless của Fumadocs giúp không phải chống lại khuôn có sẵn.
2. Giai đoạn 3–4 cần tài khoản, đồng bộ tiến độ và AI. Làm trên Next.js cùng Supabase thì theo đúng stack mặc định của workspace, có nhiều tài liệu và mẫu.
3. Tìm kiếm có dấu và không dấu là nhu cầu thật của người Việt, và Orama cho phép tự xử lý điều đó.

Cái giá phải trả:

- Phải tự làm thông báo "trang chưa được dịch" và khung terminal cho khối lệnh.
- Trang nặng JavaScript hơn Starlight.
- Phụ thuộc vào một người duy trì chính. Rủi ro này giảm được vì nội dung là file MDX chuẩn: nếu cần đổi framework thì chuyển nội dung khá dễ.

**Khi nào nên chọn Starlight thay thế:** nếu ưu tiên số một là có site nội dung nhanh nhất, chấp nhận phần ứng dụng (tài khoản, đồng bộ) làm đơn giản hoặc tách thành dịch vụ riêng về sau.

## 5. Kiểm chứng khi dựng giai đoạn 0

Khi dựng bài D1.1 đầu tiên trên Fumadocs, kiểm tra 4 điều:

1. Bố cục bài học 6 phần, có ô đánh dấu và khối "đoán trước".
2. Tìm kiếm tiếng Việt gõ không dấu vẫn ra kết quả có dấu.
3. Định tuyến `/vi/...`, kèm một trang chỉ có bản tiếng Việt hiển thị đúng khi xem ở `/en/...`.
4. Static export build thành công; ghi lại kích thước file chỉ mục tìm kiếm.

Nếu điểm 2 hoặc điểm 4 không đạt, tìm cách xử lý trong Fumadocs trước (tokenizer riêng, chia nhỏ chỉ mục, hoặc tìm kiếm phía máy chủ); chỉ xem lại Starlight nếu không có cách khả thi.

## Nguồn

- [Starlight 0.39 (Astro blog)](https://astro.build/blog/starlight-039/)
- [Starlight: Internationalization](https://starlight.astro.build/guides/i18n/)
- [Starlight: Overriding components](https://starlight.astro.build/guides/overriding-components/)
- [Pagefind: Multilingual search](https://pagefind.app/docs/multilingual)
- [Fumadocs releases](https://github.com/fuma-nama/fumadocs/releases)
- [Fumadocs: Internationalization](https://fumadocs.dev/docs/internationalization)
- [Fumadocs: Orama search](https://fumadocs.dev/docs/headless/search/orama)
- [PkgPulse: Fumadocs vs Nextra v4 vs Starlight 2026](https://www.pkgpulse.com/guides/fumadocs-vs-nextra-v4-vs-starlight-documentation-sites-2026). Bài này ghi Fumadocs "cần Next.js server", nhưng tài liệu chính thức có hướng dẫn static export, nên tài liệu này theo tài liệu chính thức.
