# 13: Viết lại chặng J9 I/O, thời gian, JSON thành bài đọc

**What to build:** Người học đọc 3 bài của chặng J9 dưới dạng bài đọc theo chuẩn nội dung (như bài mẫu J5.3): kiến thức đầy đủ, chi tiết, không còn lab, đào sâu và "Dấu hiệu đã nắm chắc"; đánh dấu học xong mỗi bài bằng một nút.

**Blocked by:** 04

**Status:** done

- [x] Mỗi bài khai báo là bài đọc; kiến thức của phần đào sâu và phát hiện từ lab (kèm output tiêu biểu) nhập vào phần kiến thức; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu chép vào nguồn câu hỏi phỏng vấn của roadmap, ghi mã bài gốc
- [x] Mã mục cũ của các bài xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [x] Thêm Cryptography/JCA: `Cipher` với AES-GCM, `SecureRandom`, `KeyStore`, chữ ký số; phân biệt băm và mã hoá
- [x] Liên kết từ bài khác tới phần đã bỏ của chặng này (lab, đào sâu) được sửa hoặc ghi lại cho ticket 38
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật

**Kết quả (23/10/2026):** ba bài viết lại theo `docs/content-standard.md` §3. Mọi khối code chạy với Java 25.0.3 trên macOS 14.4.1, output trong bài là output thật.

| Bài | Khái niệm (`###`) | Ví dụ Java | Đoán trước | Lệnh shell | Callout production |
|---|---|---|---|---|---|
| J9.1 File, charset và mật mã với JCA | 12 | 24 | 3 | 3 (`LC_ALL=C java`, `keytool -list`, `keytool -genkeypair`) | 2 |
| J9.2 java.time, múi giờ và regex | 7 | 15 | 3 | 1 (`TZ=UTC java`) | 1 |
| J9.3 JSON với Jackson và HTTP client | 9 | 11 (6 `norun`) | 1 | 1 (`mvn dependency:tree`) | 1 |

- **Cryptography/JCA đặt ở J9.1** (bài về byte và charset, nơi chữ "mã hoá" đã xuất hiện theo nghĩa encoding): bảng phân biệt mã hoá ký tự, Base64, băm, HMAC, chữ ký số và mã hoá bảo mật; `MessageDigest` SHA-256; HMAC cho webhook, so bằng `MessageDigest.isEqual`; chữ ký Ed25519 (`Signature`); `Random` có seed so với `SecureRandom`; AES-GCM với IV ngẫu nhiên ghép trước bản mã, `AEADBadTagException` khi sửa một bit, `Cipher.getInstance("AES")` là ECB (hai khối giống nhau), dùng lại IV làm lộ bản rõ bằng XOR (có output); `KeyStore` PKCS12 lưu, đọc lại khoá và mật khẩu sai; `keytool`. Không có chủ đề JCA trong `meta.json`, nên `topics` của bài giữ nguyên.
- **Nhập từ lab cũ:** J9.1: chuỗi `java.io` ba lớp, `NoSuchFileException`, `Files.walk` vào thư mục con, mojibake windows-1252 và byte `90` không cứu được, `MalformedInputException` của `Files`, `LC_ALL=C` làm `stdout.encoding` thành US-ASCII, file windows-1258 cho chuỗi dạng tách và NFC, BOM của Excel, `jdk.charsets` (đã kiểm bằng runtime `jlink --add-modules java.base`: `UnsupportedCharsetException`). J9.2: cùng `Instant` ở ba múi giờ, doanh thu theo UTC và giờ Việt Nam, `TZ=UTC`, Berlin đổi giờ với `Period`/`Duration`, 31/1 cộng 1 tháng, 30/2, bốn bẫy regex (`\w`, `matches`, `$1`, `split(".")`), log có named group, đo backtracking. J9.3: `@JsonProperty`, `@JsonIgnore`, `Instant` dạng ISO, trường lạ với mapper mặc định và `strict`, `TypeReference`, `Content-Length` theo byte, POST, 404 không phải exception, `ConnectException` khi server dừng, `HttpTimeoutException`.
- **Nhập từ đào sâu:** cứu mojibake, khi nào còn dùng `java.io`, ghi file nguyên tử bằng `ATOMIC_MOVE`; `timestamptz`, `Clock` cố định, tzdata trong JDK, possessive quantifier và atomic group; `sendAsync` (có ví dụ chạy song song), dùng chung `HttpClient` và `JsonMapper`, DTO thay entity, tiền trong JSON (có output `double` mất chính xác). Câu hỏi đào sâu chép nguyên văn ở `content/interview/java/j9-1.md`, `j9-2.md`, `j9-3.md`, mỗi bài 4 câu.
- **Thêm mới để phần kiến thức tự đủ:** `codePointCount` và emoji, `UncheckedIOException`, `-Dstdout.encoding=UTF-8`, `sun.jnu.encoding` cho tên file trên Linux, `ZoneId` so với `ZoneOffset`, giờ không tồn tại và giờ lặp lại khi đổi giờ, `mm`/`hh`/`YYYY`, `DateTimeParseException` có index, `find`/`results()`/`No match found`, Jackson 3 biến typo `"ammount"` thành số tiền 0, `ClassCastException` với `List.class`, bảng xử lý theo nhóm status, `HttpClient` là `AutoCloseable` từ Java 21.
- **Cố ý bỏ:** các bước `mvn -v`, `exec:java` của lab J9.3 (Maven thuộc J7); ý "macOS trả tên file dạng NFD" của đào sâu J9.1, vì hành vi phụ thuộc hệ thống file và không có output ổn định, bài chỉ giữ "dữ liệu và tên file từ hệ thống khác có thể ở dạng tách"; ví dụ chạy được cho connect timeout (cần một địa chỉ không trả lời, không ổn định giữa các mạng), bài dẫn Javadoc.
- **Khối `norun` (6, đều ở J9.3):** các ví dụ Jackson cần `jackson-databind` 3.2.3, `jackson-core` 3.2.3 và `jackson-annotations` 2.22 trên classpath, còn `pnpm content:run-code` chạy `java` không có classpath. Đã kiểm bằng cách trích đúng từng khối, chạy `java --class-path <ba jar trong ~/.m2> Main.java` và so với khối output ngay sau: 6/6 khớp, gồm cả khối lỗi biên dịch khi import Jackson 2 với classpath chỉ có Jackson 3.
- **Khối `varies`:** `stdout.encoding` (theo locale), token `SecureRandom`, `ZoneId.systemDefault()`, số mili giây của regex, output `keytool -list` (có ngày tạo).
- **Nghiệm thu:** `pnpm content:check` xanh; `pnpm content:run-code j9` 3 bài, 44 ví dụ, 0 lỗi; `pnpm build` xanh; mọi lệnh shell trong bài chạy thật. Một lượt đọc với vai người học do một agent riêng làm; các góp ý đã sửa: ký tự BOM vô hình trong code, câu kể cách lấy output ở J9.3, khẳng định sai "hai regex chấp nhận cùng tập" (thêm ví dụ dấu cách cuối), XOR dùng trước khi định nghĩa, "chứng chỉ" chưa định nghĩa, câu dẫn sai số tình huống và số mẫu, "thread" chưa giới thiệu ở mục timeout, callout lặp tình huống. Ví dụ `sendAsync` ban đầu so thời gian với ngưỡng 2 giây và lệch một lần khi máy bận; đã đổi sang đếm số request server xử lý cùng lúc để output ổn định.
- **Cần chủ dự án quyết:** J9.1 dài khoảng 6.000 từ văn và 12 khái niệm (J5.3 khoảng 3.900 từ), vượt gợi ý 30–40 phút của §3.1, phần lớn do JCA (5 khái niệm). Đề xuất tách JCA thành bài J9.4 với chủ đề mới (ví dụ `j9.mat-ma-jca`); việc này sửa `meta.json` và khoá mã chủ đề, ngoài phạm vi ticket.
  **Chủ dự án quyết (24/10/2026):** giữ nguyên độ dài, không tách bài.

**Ghi cho ticket 38:** sáu bài nhắc tới ghi chú "Maven chạy trên JDK 25 in thêm `WARNING:`" của lab J9.3, mà bài đọc J9.3 không còn (không còn `mvn -v` hay `exec:java`). Đề xuất đổi "Như J9.3" thành bài Maven của J7 có cùng ghi chú, hoặc viết thẳng ghi chú tại chỗ:

- `content/steps/j11/j11-1.mdx:198`: "Như J9.3, Maven chạy trên JDK 25 in thêm vài dòng `WARNING:` về `sun.misc.Unsafe`…"
- `content/steps/j13/j13-1.mdx:173`: cùng câu.
- `content/steps/j15/j15-1.mdx:181`: "…Như J9.3, Maven chạy trên JDK 25 in thêm vài dòng `WARNING:`…"
- `content/steps/j16/j16-1.mdx:162`: cùng câu.
- `content/steps/j16/j16-4.mdx:441`: "Như J9.3, Maven chạy trên JDK 25 in thêm vài dòng `WARNING:` về native access…"
- `content/steps/j12/j12-4.mdx:133`: "Như J7.1 và J9.3, Maven phải chạy trên JDK 25…"; bỏ "và J9.3".

Các liên kết khác tới J9 vẫn đúng với bài mới: J11.4, J14.2, J14.3 (`send` và `sendAsync`), J12.1 (`TIMESTAMPTZ` ở J9.2), SB7.1 (connect timeout, request timeout), J3.4 (`jdk.charsets`), J10.2 (Jackson 3 bỏ qua trường lạ), J4.1 (try-with-resources với file và HTTP client).
