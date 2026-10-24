# 10: Viết lại chặng J6 Lập trình hàm thành bài đọc

**What to build:** Người học đọc 2 bài của chặng J6 dưới dạng bài đọc theo chuẩn nội dung (như bài mẫu J5.3): kiến thức đầy đủ, chi tiết, không còn lab, đào sâu và "Dấu hiệu đã nắm chắc"; đánh dấu học xong mỗi bài bằng một nút.

**Blocked by:** 04

**Status:** done

- [x] Mỗi bài khai báo là bài đọc; kiến thức của phần đào sâu và phát hiện từ lab (kèm output tiêu biểu) nhập vào phần kiến thức; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu chép vào nguồn câu hỏi phỏng vấn của roadmap, ghi mã bài gốc
- [x] Mã mục cũ của các bài xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [x] Liên kết từ bài khác tới phần đã bỏ của chặng này (lab, đào sâu) được sửa hoặc ghi lại cho ticket 38
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật

**Kết quả (23/10/2026):** J6.1 và J6.2 viết lại theo `docs/content-standard.md` §3, `status: verified` với Java 25.0.3 trên macOS 14.4.1. Bối cảnh xuyên chặng là danh sách đơn hàng (`Order`), dữ liệu nằm sẵn trong code thay cho file CSV của lab.

| Bài | Khái niệm (`###`) | Ví dụ Java chạy được | Đoán trước | Tự giải thích | Callout production / pitfall |
|---|---|---|---|---|---|
| J6.1 | 9 | 22 (1 khối `varies`) | 3 | 1 | 1 / 0 |
| J6.2 | 10 | 21 (2 khối `varies`) | 2 | 1 | 1 / 1 |

- **Nhập từ Đào sâu J6.1:** lambda dùng lại hay tạo mới đối tượng (output `==`, dẫn JLS §15.27.4); `this` và trùng tên biến trong lambda (mục riêng, output `getClass()` và lỗi biên dịch); khi nào tự định nghĩa functional interface (cặp lỗi `incompatible thrown types` và `LineReader` có `throws`).
- **Nhập từ lab J6.1:** lỗi `effectively final`, lỗi `var` không có target type, tên class `Main$1` so với hidden class `Main$$Lambda/...` và method `lambda$main$0` (thay `javap` bằng reflection để không cần lệnh shell), stack trace có `lambda$main$0`, bốn dạng method reference, `strip.andThen(parse)` với lỗi enum, `andThen` so với `compose` (đổi sang phép tính giảm giá và phí ship), sắp tên thành phố và `Collator`.
- **Thêm mới J6.1:** method reference dạng bound tính đối tượng lúc tạo (NPE ngay khi tạo `missing::length`, `prefix` gán lại vẫn biên dịch; JLS §15.13.3); log trì hoãn bằng `Supplier` có output đếm số lần gọi; `computeIfAbsent` và `merge` làm cầu sang `groupingBy`.
- **Nhập từ Đào sâu J6.2:** bốn hàm của `Collector` (bảng + `Collector.of`), `reduce` so với `collect` (thêm ví dụ `collect` ba tham số), `sorted` trước `limit` không ngắt sớm (output `peek` + `max`), Stream Gatherers (`windowFixed`, `scan`).
- **Nhập từ lab J6.2:** bốn báo cáo đầu tiên, pipeline lười và `IllegalStateException` khi dùng lại stream, năm báo cáo `groupingBy`/`partitioningBy`/`joining`, `Duplicate key` của `toMap` và cách sửa, nhập dữ liệu bằng stream so với vòng lặp gom lỗi (dữ liệu trong bộ nhớ thay cho file), đo parallel stream và `ArrayList` dùng chung mất phần tử.
- **Thêm mới J6.2:** `count()` bỏ qua `peek` (Javadoc của `count`), sửa nguồn trong `forEach` cho `NullPointerException` thay vì `ConcurrentModificationException`, `groupingBy` không có `mapFactory` trả `HashMap`, `toMap`/`groupingBy` với `null`, `OptionalDouble` của `average()`, bọc `IOException` thành `UncheckedIOException` (J4 hứa "J6 xử lý checked exception trong lambda và stream").
- **Cố ý bỏ:** `jshell` và lệnh `javac`/`javap` của lab (thay bằng ví dụ Java chạy được); phần chuẩn bị project `~/masteva-j6`, dọn dẹp, mục "Khi gặp lỗi" (các lỗi đã nằm trong mục của khái niệm tương ứng); tỷ lệ "trừ một" của `commonPool` không gán cho Javadoc mà dẫn bằng output.
- **Khối `norun`:** không có. Ba khối `varies`: tên hidden class (J6.1), thời gian đo parallel và số phần tử mất của `ArrayList` dùng chung (J6.2).
- **Nguồn câu hỏi phỏng vấn:** `content/interview/java/j6-1.md` (3 câu), `content/interview/java/j6-2.md` (4 câu), chép nguyên văn.
- **Nghiệm thu:** `pnpm content:check`, `pnpm content:run-code j6` (43 ví dụ, 0 lỗi), `pnpm build` xanh. Một lượt đọc riêng với vai người học (agent độc lập) báo 25 điểm; đã sửa: văn mô tả output sai (đơn `1010` cũng bị bỏ qua), callout production tự mâu thuẫn, thiếu `.log()` ở SLF4J, tên method bản nguyên thuỷ nói quá rộng, Javadoc stream "yêu cầu" so với "khuyến nghị", ba callout liền nhau, đoạn quá 6 câu, mục quá tải (tách `this` thành mục riêng), thiếu ví dụ `collect`, thuật ngữ chưa giải thích (`StringJoiner`, reflection, liên kết call site, `<parameter2>`), khẳng định thiếu dẫn chứng (`toList`, `null` trong `toMap`).
- **Cần chủ dự án cân nhắc:** J6.2 dài hơn J5.3 (khoảng 7.000 từ tính cả code, 10 mục). Nếu thấy quá ngưỡng 30–40 phút, có thể tách "Khi nào không nên dùng stream" và "Parallel stream" thành bài J6.3.
  **Chủ dự án quyết (24/10/2026):** giữ nguyên độ dài, không tách bài.

**Ghi cho ticket 38:** không có liên kết nào từ chặng khác trỏ tới phần đã bỏ của J6 (`grep -rn` tìm `j6-1`, `j6-2`, `#thuc-hanh`, `#dao-sau`, `masteva-j6`). Các câu nhắc J6 ở chặng khác vẫn đúng với bài mới: `j4/j4-1.mdx:509`, `j4/j4-2.mdx:623`, `j4/j4-2.mdx:653` (J6 xử lý checked exception trong lambda và stream: có ở J6.1 mục tự định nghĩa interface và J6.2 mục không nên dùng stream); `j14/j14-1.mdx:518` (J6 cảnh báo parallel stream dùng chung `commonPool`: có ở callout pitfall J6.2).
