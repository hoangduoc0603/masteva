# 06: Viết lại chặng J2 Ngôn ngữ Java thành bài đọc

**What to build:** Người học đọc 3 bài của chặng J2 dưới dạng bài đọc theo chuẩn nội dung (như bài mẫu J5.3): kiến thức đầy đủ, chi tiết, không còn lab, đào sâu và "Dấu hiệu đã nắm chắc"; đánh dấu học xong mỗi bài bằng một nút.

**Blocked by:** 04

**Status:** done

- [x] Mỗi bài khai báo là bài đọc; kiến thức của phần đào sâu và phát hiện từ lab (kèm output tiêu biểu) nhập vào phần kiến thức; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu chép vào nguồn câu hỏi phỏng vấn của roadmap, ghi mã bài gốc
- [x] Mã mục cũ của các bài xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [x] Mở rộng pass-by-value: tham số method nhận bản sao giá trị, với tham chiếu là bản sao của tham chiếu; ví dụ đổi field và gán lại tham số
- [x] Liên kết từ bài khác tới phần đã bỏ của chặng này (lab, đào sâu) được sửa hoặc ghi lại cho ticket 38
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật

**Kết quả (23/10/2026):** ba bài J2 viết lại theo `docs/content-standard.md` §3, `kind: reading`, `status: verified` (Java 25.0.3, macOS 14.4.1). 49 ví dụ, mọi khối `java` chạy bằng `pnpm content:run-code j2` và khớp output (2 khối `varies`: thời gian đo `+=` và mã băm khi in mảng); không có khối `norun`.

| Bài | Khái niệm (`###`) | Ví dụ | Đoán trước | Production |
|---|---|---|---|---|
| J2.1 | 10 | 22 | 3 | 1 |
| J2.2 | 9 | 14 | 2 | 1 |
| J2.3 | 6 | 13 | 2 | 1 |

- **Pass-by-value (mục bắt buộc):** `###` mới "Truyền tham số: Java luôn truyền bản sao giá trị" ở J2.1, dẫn JLS §8.4.1. Ba ví dụ có output: tăng `int` và field qua tham số (`failures = 0`, `attempts = 1`), gán lại tham số trong `reset` (bên gọi vẫn thấy `3`, đặt Đoán trước), `Integer counter++` trong method không đổi biến của bên gọi. Hai sơ đồ frame và heap, câu nhắc tự giải thích, refutation "đối tượng truyền theo tham chiếu", cách đúng (`return`, `final` cho tham số).
- **Nhập từ lab cũ:** J2.1: tràn số, `Math.addExact`, ép `(int) 3_000_000_000L`, `level += 300`, lỗi `level = level + 1`, definite assignment, `Integer` 127/128 (chuyển sang `Long` cho khớp callout), NPE khi unbox, `var` cố định kiểu, backoff `int` âm ở `attempt=24` và bản sửa có cap, budget, `break`; pitfall `ArrayIndexOutOfBoundsException` của `args[0]`, `NumberFormatException` của `parseInt`, `lossy conversion from long to int`. J2.2: `split(" ")` với hai dấu cách, `trim` khác `strip` (em space, NBSP), NFD/NFC, mảng chia sẻ tham chiếu, `ArrayIndexOutOfBoundsException`, hai lỗi của `LogReport` (`split(" ")`, `p / 100`) và báo cáo p50/p95 sau khi sửa. J2.3: `toString`/`equals` của record, compact constructor chặn đầu vào, enum thêm hằng làm switch không biên dịch, text block giữ 2 dấu cách ở `FROM`, `Analyzer` rút gọn với sealed interface, record pattern, guard, dòng `get` bị từ chối.
- **Nhập từ Đào sâu:** int tràn không báo lỗi (JLS §4.2.2), `var` không chậm và bẫy `new ArrayList<>()`, CME không xảy ra mọi lần (Javadoc `ArrayList`, trỏ J5.3), vì sao `String` bất biến, `split(regex, -1)`, compact strings (JEP 254), mảng hiệp biến và `ArrayStoreException`, record khác Lombok, khi nào giữ `default` và `MatchException` (JEP 441), text block không thay template (output JSON hỏng khi đường dẫn có dấu nháy).
- **Thêm mới để tự đủ:** `0.1 + 0.2` và `BigDecimal`, `Long.equals(128)` và `Map<Long,…>.get(42)` trả `null`, `"total=" + 1 + 2`, `&` không ngắt mạch gây NPE, `break` có nhãn, `ordinal` đổi nghĩa khi thêm hằng (mô phỏng V1/V2), `Locale` Thổ Nhĩ Kỳ, `Arrays.asList` là view, `binarySearch` trên mảng chưa sắp, record bất biến nông.
- **Cố ý bỏ:** jshell (bài đọc dùng chương trình chạy được), phần chuẩn bị và dọn dẹp `~/masteva-j2`, `perl`/`grep` sửa file, pitfall `public` của compact constructor trong jshell và pitfall JDK 17 (không còn áp dụng). Không minh hoạ `MatchException` bằng output vì cần biên dịch riêng hai file; khẳng định dẫn JEP 441.
- **Nguồn câu hỏi phỏng vấn:** `content/interview/java/j2-1.md` (3 câu), `j2-2.md` (4 câu), `j2-3.md` (3 câu), chép nguyên văn.
- **Mã mục:** xoá 20 mã `j2.1.*`, `j2.2.*`, `j2.3.*` cũ khỏi `ids`; `pnpm content:lock` thêm `j2.1.done`, `j2.2.done`, `j2.3.done`.
- **Nghiệm thu:** `pnpm content:check`, `pnpm content:run-code j2`, `pnpm build` xanh. Một lượt đọc với vai người học; đã sửa: giải thích field của file nguồn gọn, `Math.random()`, ví dụ `return` cho pass-by-value, generics `<Long>` khi nói `var`, câu mở tình huống cho mục điều khiển luồng, thêm output cho `deepToString`, `equals` của mảng, record bất biến nông và lỗi field trong record.
- **Cần chủ dự án quyết:** J2.1 dài khoảng 800 dòng (lớn hơn J5.3 khoảng 726 dòng) vì thêm mục pass-by-value; có thể vượt ngưỡng 30–40 phút đọc. Nếu muốn, tách "Toán tử, ép kiểu, điều khiển luồng" sang bài riêng. Chương trình cuối J2.2 (khoảng 45 dòng) và J2.3 (khoảng 50 dòng) dài hơn mức 5–20 dòng của §3.3; giữ nguyên vì là ví dụ ghép lại gần thực tế và tách ra thì không chạy riêng được.

**Ghi cho ticket 38:**

- `content/steps/j1/j1-1.mdx:462` (callout `link`): "J2 dùng jshell để thử từng kiểu dữ liệu và toán tử, gồm phép chia nguyên." J2 không còn dùng jshell. Đề xuất: "J2 dạy từng kiểu dữ liệu và toán tử, gồm phép chia nguyên, bằng các chương trình ngắn chạy được." (J1 đang được viết lại ở ticket 05; kiểm lại câu này sau khi merge.)
- Không có liên kết nào từ chặng khác trỏ tới anchor `#thuc-hanh`, `#dao-sau` hay bước lab của J2 (`grep -rnE 'j2/j2-|J2\.[123]|masteva-j2|LogReport|Analyzer' content/`).

