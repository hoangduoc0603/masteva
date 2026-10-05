# Thiết kế lại trang chủ và phần đầu trang roadmap

Ngày: 05/10/2026. Trạng thái: đã duyệt bản mẫu `design/home-v2.html`, `design/roadmap-v2.html`.

## 1. Vấn đề và mục tiêu

Người dùng nêu ba vấn đề sau khi dùng thử:

1. Thanh nav có hai mục "Masteva" và "Roadmap" dẫn tới hai trang gần như trùng nhau (trang chủ và `/roadmaps` cùng liệt kê roadmap).
2. Bộ chọn "Tôi đã biết" ở đầu trang roadmap trông rời rạc, và nằm cùng hàng với nút "Bắt đầu/Học tiếp: <tên chủ đề>" nên đổi chữ là cả hàng xô đi.
3. Thanh công cụ (Sơ đồ/Danh sách, Ẩn mục đã bỏ qua, Cách đọc sơ đồ) chưa hợp lý và cuộn mất.

Mục tiêu: một chỗ duy nhất để chọn roadmap (trang chủ, có tìm kiếm), phần đầu trang roadmap ổn định khi trạng thái đổi, và thanh dính có thông tin hữu ích.

## 2. Quyết định đã chốt với người dùng

| Câu hỏi | Lựa chọn |
|---|---|
| Trang chủ gồm gì | Ô tìm kiếm, khối "Đang học", lưới roadmap. Bỏ hero dài, khối "6 phần của bài", khối dự án |
| "Tôi đã biết" đặt ở đâu | Nút "Tôi đã biết cấp này" trên đầu mỗi cấp (trừ cấp cuối) |
| Thanh công cụ giữ gì | Chuyển Sơ đồ/Danh sách và Ẩn mục đã bỏ qua; bỏ chú giải |
| Ô tìm kiếm tìm gì | Roadmap (tên, mô tả) và chủ đề (tên chủ đề, tên chặng); ⌘K vẫn tìm trong nội dung bài |

## 3. Kiến trúc thông tin

- Thanh nav (Fumadocs `baseOptions`): bỏ `links`. Còn logo Masteva (về `/<lang>`), nút tìm kiếm ⌘K và đổi giao diện có sẵn của Fumadocs.
- `/<lang>` là trang chọn roadmap.
- `/<lang>/roadmaps` không còn là trang danh mục: thành trang tĩnh chuyển hướng về `/<lang>` (thẻ `meta refresh` kèm link, `noindex`), để link cũ không chết. Static export không có redirect phía máy chủ.
- `/<lang>/roadmaps/<id>` giữ nguyên đường dẫn. `/<lang>/roadmaps/senior-backend` giữ nguyên.
- Breadcrumb trong bài học giữ nguyên (đã trỏ vào trang roadmap cụ thể).
- Trang dự án không có lối vào từ trang chủ nữa; vẫn vào được từ chặng, chủ đề và mốc liên quan.

## 4. Trang chủ

Từ trên xuống:

1. Tiêu đề `h1` ngắn và một câu mô tả (chữ mới trong `messages`).
2. Ô tìm kiếm có nhãn hiện "Tìm roadmap hoặc chủ đề", placeholder ví dụ, gợi ý "gõ không dấu cũng được; nội dung bài học thì dùng ⌘K". Phím `/` đưa focus vào ô (trừ khi đang gõ trong ô nhập khác).
3. Khi ô trống: khối "Đang học" (chỉ hiện khi có chủ đề đang học, dùng `currentTopic` như hiện nay) rồi lưới roadmap.
4. Khi có từ khoá: ẩn khối "Đang học" và lưới, hiện kết quả (vùng `aria-live="polite"`):
   - nhóm "Roadmap (n)": thẻ roadmap khớp tên hoặc mô tả;
   - nhóm "Chủ đề (n)": tối đa 8 dòng, mỗi dòng có mã chặng, tên chủ đề (phần khớp được tô), tên roadmap và chặng, nhãn "Bài" nếu chủ đề có bài; link tới `/<lang>/roadmaps/<id>#<mã chủ đề>`. Nhiều hơn 8 thì thêm dòng "Và n chủ đề khác. Gõ cụ thể hơn để thu hẹp.";
   - không khớp gì: câu báo có nhắc lại từ khoá, gợi ý thử từ khoá ngắn hơn hoặc tiếng Anh, và 5 nút gợi ý từ khoá (bấm là điền vào ô).
5. Thẻ roadmap: chữ cái của track (J/D/M) trong ô màu track, tên, mô tả, "n cấp · n chặng · n chủ đề chính", thanh tiến độ, nhãn hành động "Học tiếp" (đã bắt đầu) hoặc "Xem lộ trình". Cả thẻ là một link tới trang roadmap. Khi đã bắt đầu, link vẫn tới trang roadmap (người học bấm "Vào học" ở đó).

Tìm kiếm chạy hoàn toàn trên trình duyệt:

- Chỉ mục dựng lúc build (server component) và truyền xuống qua props: mỗi roadmap `{id, track, title, description}`, mỗi chủ đề `{roadmapId, code, stepTitle, id, title, hasLesson}`. Khoảng 380 chủ đề, ước khoảng 8 KB gzip trong payload trang chủ.
- So khớp không phân biệt dấu và hoa thường, dùng `normalizeVietnamese` có sẵn (`src/lib/search/vi-tokenizer.ts`). Khớp chuỗi con trên dạng đã chuẩn hoá. Chủ đề khớp theo tên chủ đề hoặc tên chặng.
- Hàm thuần `searchCatalog(index, query, limit)` trả `{roadmaps, topics, totalTopics}` và vị trí khớp để tô; có unit test (logic tìm kiếm thuộc phần bắt buộc TDD).

## 5. Trang roadmap

### 5.1 Phần đầu

- Link "← Tất cả roadmap" về `/<lang>` thay cho nhãn "Roadmap · Java" phía trên tiêu đề.
- Tiêu đề, mô tả, dòng số liệu: "3 cấp · 20 chặng · 134 chủ đề chính · 63 bài học" (thêm số bài).
- Khối tiếp tục có cấu trúc cố định, chữ đổi không làm xô layout:
  - nhãn nhỏ: "Bắt đầu từ" (chưa bắt đầu), "Học tiếp" (đã bắt đầu), "Hoàn thành" (hết chủ đề chính);
  - tên chủ đề (tối đa 2 dòng);
  - dòng phụ: mã và tên chặng, kèm "bài <mã bài>" nếu có bài;
  - nút "Vào học" chữ cố định, `min-width` cố định; trỏ vào bài nếu chủ đề có bài, ngược lại mở khung chi tiết chủ đề. Trạng thái hoàn thành thì ẩn nút, dòng phụ nói còn chủ đề tuỳ chọn;
  - thanh tiến độ "Đã xong n/m chủ đề chính".
- Bỏ hàng "Tôi đã biết" và tổng đếm rời ở đầu trang.

### 5.2 Thanh dính

Thay `RoadmapToolbar`. Dính ngay dưới nav khi cuộn.

- Trái: danh sách cấp, mỗi mục là link `#level-<id>` gồm tên cấp và "done/total"; cấp đã đánh đã biết có thêm "· đã biết". Mục của cấp đang nằm trong vùng nhìn có `aria-current="true"` và gạch chân màu track (theo dõi bằng `IntersectionObserver`).
- Phải: nhóm nút "Sơ đồ" / "Danh sách" (biểu tượng kèm chữ, `aria-pressed`) và công tắc "Ẩn mục đã bỏ qua" (`input type=checkbox role=switch`). Lưu lựa chọn như hiện nay (`usePref`).
- Mobile (< 768px): hai điều khiển gộp vào nút biểu tượng "Tuỳ chọn hiển thị" (`aria-expanded`, `aria-controls`) mở bảng nổi; bấm ra ngoài hoặc Esc thì đóng. Thanh dính chỉ một hàng.
- Bỏ "Cách đọc sơ đồ". Câu "tiến độ chỉ lưu trong trình duyệt này" đã có ở khu xuất/nhập tiến độ.

### 5.3 Đầu mỗi cấp

- Thẻ đầu cấp: ô số thứ tự cấp (màu track), tên cấp (`h2`), mục tiêu, thanh tiến độ "n/m chủ đề chính", nút "Tôi đã biết cấp này" (trừ cấp cuối).
- Mô hình tiến độ giữ nguyên `progress.start[roadmap]` (cấp bắt đầu): bấm "Tôi đã biết" ở cấp i đặt cấp bắt đầu là cấp i+1, nên mọi cấp trước cũng tính là đã biết.
- Cấp đã biết: thẻ đầu cấp ẩn thanh tiến độ và nút, hiện một dòng: "Bạn đã biết cấp này" (cấp sau cấp đầu thì thêm "gồm cả <các cấp trước>"), số chủ đề chính không tính vào tiến độ, nút "Xem lại các chặng" (mở/thu, giữ trạng thái đã biết) và "Hoàn tác". Hoàn tác ở cấp i đặt cấp bắt đầu là cấp i (cấp đầu thì xoá cấp bắt đầu).
- Các chặng của cấp đã biết thu gọn như hiện nay; link `#step-…`/chủ đề trỏ vào trong vẫn mở cấp ra (đã có).

## 6. Giữ nguyên

Sơ đồ chặng và chip, khung chi tiết chủ đề (`topics.json`), thanh "Học tiếp" ở đáy trên mobile (dùng cùng `ctaHref`), tiến độ v2, xuất/nhập tiến độ, trang bài học, trang dự án.

## 7. Ngoài phạm vi

Tìm kiếm trong nội dung bài từ ô trang chủ; lọc theo nhóm roadmap; tab "Dự án" trong trang roadmap; đổi tên đường dẫn `/roadmaps/<id>`.

## 7b. Điều chỉnh sau khi dùng thử (05/10/2026)

- Mỗi trang chỉ một ô tìm: trang chủ (nhóm route `(landing)`) tắt nút tìm trên header; ⌘K và `/` đưa vào ô lớn. Khi có từ khoá, cuối kết quả có dòng "Tìm "…" trong nội dung bài học" mở hộp ⌘K với sẵn từ khoá (`src/lib/search/handoff.ts`). Trang khác giữ nút tìm trên header.
- Tên roadmap ngắn theo track ("Java", "DevOps", "Microservices") trên thẻ, kết quả tìm, khối "Đang học" và `h1` trang roadmap; tiêu đề tab giữ tên đầy đủ.
- Ô chữ cái của thẻ roadmap là hình tròn. Bỏ dòng giấy phép ở chân trang.

## 8. Chữ giao diện

Thêm khoá cho tiêu đề và mô tả trang chủ, nhãn và gợi ý ô tìm kiếm, nhóm kết quả, câu không khớp, "Tất cả roadmap", nhãn khối tiếp tục, "Vào học", "Tôi đã biết cấp này", dòng đã biết, "Xem lại các chặng", "Thu gọn", "Hoàn tác", "Tuỳ chọn hiển thị", "n bài học". Bỏ khoá không còn dùng (`known`, `knownNone`, `howToRead`, `howToReadBody`, `kicker`, `roadmaps.title/subtitle` nếu hết chỗ dùng). Có đủ `vi` và `en`.

## 9. Kiểm thử

- Unit (TDD): `searchCatalog` khớp không dấu, khớp theo tên chặng, giới hạn và tổng số, vị trí tô, từ khoá rỗng.
- E2E:
  - trang chủ không còn link "Roadmap" trên nav; gõ "kafka" ra chủ đề J16 và bấm vào mở đúng khung chi tiết; gõ chuỗi không khớp ra câu báo và nút gợi ý điền từ khoá;
  - `/vi/roadmaps` chuyển về `/vi/`;
  - trang roadmap: bấm "Tôi đã biết cấp này" ở Nền tảng thì cấp thu gọn, tab ghi "đã biết", nút "Vào học" trỏ vào bài J11.1; "Hoàn tác" khôi phục;
  - đổi trạng thái khối tiếp tục không đổi vị trí của nút "Vào học" (đo `boundingBox` trước và sau khi tích một mục);
  - thanh dính còn ở đầu màn hình khi cuộn; tab cấp đổi `aria-current` khi cuộn tới Middle;
  - mobile: không cuộn ngang; nút "Tuỳ chọn hiển thị" mở bảng có hai điều khiển;
  - kiểm tra truy cập (axe) sáng và tối như hiện có.
- Sửa các E2E đang dùng nhóm nút "Tôi đã biết", trang `/roadmaps` và link "Roadmap" trên nav.

## 10. Thiết kế nguồn

`design/v2.css` gộp vào `design/roadmap.css` (đổi tiền tố `hm2-`/`rm2-`/`v2-` sang tên chính thức) và chép sang `src/app/roadmap.css`. `design/home-v2.html`, `design/roadmap-v2.html` là bản mẫu chuẩn; `design/home.html`, `design/roadmaps.html` ghi là đã thay thế trong `design/README.md`.
