# 09: Viết lại chặng J5 Collections và generics thành bài đọc

**What to build:** Người học đọc 2 bài của chặng J5 dưới dạng bài đọc theo chuẩn nội dung (như bài mẫu J5.3): kiến thức đầy đủ, chi tiết, không còn lab, đào sâu và "Dấu hiệu đã nắm chắc"; đánh dấu học xong mỗi bài bằng một nút.

**Blocked by:** 04

**Status:** done

- [x] Mỗi bài khai báo là bài đọc; kiến thức của phần đào sâu và phát hiện từ lab (kèm output tiêu biểu) nhập vào phần kiến thức; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu chép vào nguồn câu hỏi phỏng vấn của roadmap, ghi mã bài gốc
- [x] Mã mục cũ của các bài xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [x] Chỉ J5.1 và J5.2; J5.3 đã viết ở ticket 04
- [x] Liên kết từ bài khác tới phần đã bỏ của chặng này (lab, đào sâu) được sửa hoặc ghi lại cho ticket 38
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật

**Kết quả (23/10/2026):** J5.1 và J5.2 viết lại theo `docs/content-standard.md` §3, cùng bối cảnh `Product`/giỏ hàng/hoá đơn với J5.3. Mọi ví dụ chạy với Java 25.0.3 trên macOS 14.4.1, `pnpm content:run-code j5` xanh (48 ví dụ cả chặng, 0 lỗi).

- **J5.1:** 7 khái niệm (`###`), 15 ví dụ (3 khối `varies`: hai phép đo `get`/`contains` và phép đo khoá trùng `hashCode`), 3 chỗ Đoán trước, 1 câu nhắc tự giải thích (khoá bị sửa sau khi `put`), 1 callout production. Nhập từ lab cũ: ba thứ tự của `HashSet`/`LinkedHashSet`/`TreeSet` (khớp với số ô băm tính ra), `getOrDefault` để đếm, hàng đợi và stack bằng `ArrayDeque`, bẫy `remove(int)`, `putIfAbsent` phát hiện SKU trùng, `NullPointerException` khi `Map.get` trả `null` (J5.3 dẫn lại), `ArrayDeque` không nhận `null`, phép đo tách thành `get` và `contains` kèm giới hạn của phép đo (từ pitfall cũ). Nhập từ Đào sâu: khoá trùng `hashCode` (kèm phép đo `Comparable` và không `Comparable`, dẫn Javadoc `HashMap`), `newHashMap`, `LinkedList` hiếm khi thắng, không đồng bộ hoá. Thêm: khoá `List` bị sửa sau khi `put` (dẫn Javadoc `Map`), `PriorityQueue.toString` không theo thứ tự ưu tiên, `TreeMap.subMap`/`floorKey`, cặp method ném exception/trả giá trị đặc biệt của `Queue`.
- **J5.2:** 7 khái niệm, 15 ví dụ, 2 chỗ Đoán trước, 1 câu nhắc tự giải thích (vì sao exception nổ ở `tags.get(0)`), 1 callout production. Nhập từ lab cũ: raw type rồi bản có kiểu, `Page<T>` và method generic, bỏ wildcard ở `total`, lỗi `CAP#1`, `copyInto` với `? super`, ép kiểu JSON và heap pollution, `LocalDate` với bound `Comparable<T>` và cách sửa. Nhập từ Đào sâu: mảng hiệp biến và `ArrayStoreException` (có output), `List<?>`/`List<Object>`/raw `List`, khi nào dùng method generic hay wildcard. Thêm: lỗi biên dịch khi thiếu bound, giải thích `Object &` trong `Collections.max` bằng quy tắc xoá về bound đầu tiên.
- **Cố ý bỏ:** ngưỡng chuyển ô sang cây (8 khoá, 64 ô) của Đào sâu cũ, vì chỉ có trong mã nguồn OpenJDK, không có trong Javadoc; bài chỉ nói "trong OpenJDK, ô quá đông được đổi sang cây" và dẫn Javadoc về `Comparable`. `javap -s`/`javap -c` của lab cũ thay bằng reflection (chạy được bằng `content:run-code`) và số dòng trong stack trace, vì `javap` cần hướng dẫn lưu và biên dịch file, trái §3.3. `Page.of` nhận `List<T>` thay vì `List<? extends T>` để mục generic chưa phải dùng wildcard. Phần chuẩn bị, dọn dẹp, "Khi gặp lỗi" về môi trường của lab.
- **Nguồn câu hỏi phỏng vấn:** `content/interview/java/j5-1.md` (4 câu) và `j5-2.md` (3 câu), chép nguyên văn.
- **Mã khoá:** xoá 15 mã `j5.1.*`, `j5.2.*`; `pnpm content:lock` thêm `j5.1.done`, `j5.2.done`.
- Không có khối `norun`, không có lệnh shell.

**Ghi cho ticket 38:** không có liên kết nào từ chặng khác trỏ tới lab hay Đào sâu của J5.1, J5.2 (`grep -rnE "j5-1|j5-2|J5\.1|J5\.2|masteva-j5" content`). J5.3 nhắc J5.1 ở dòng 30 và 416, vẫn đúng với bài mới (J5.1 giữ ví dụ `Map.get` trả `null` dẫn tới `NullPointerException`).
