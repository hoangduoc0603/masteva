# 07: Viết lại chặng J3 Hướng đối tượng thành bài đọc

**What to build:** Người học đọc 4 bài của chặng J3 dưới dạng bài đọc theo chuẩn nội dung (như bài mẫu J5.3): kiến thức đầy đủ, chi tiết, không còn lab, đào sâu và "Dấu hiệu đã nắm chắc"; đánh dấu học xong mỗi bài bằng một nút.

**Blocked by:** 04

**Status:** done

- [x] Mỗi bài khai báo là bài đọc; kiến thức của phần đào sâu và phát hiện từ lab (kèm output tiêu biểu) nhập vào phần kiến thức; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu chép vào nguồn câu hỏi phỏng vấn của roadmap, ghi mã bài gốc
- [x] Mã mục cũ của các bài xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [x] Liên kết từ bài khác tới phần đã bỏ của chặng này (lab, đào sâu) được sửa hoặc ghi lại cho ticket 38
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật

**Kết quả (23/10/2026):** bốn bài J3.1–J3.4 chuyển sang bài đọc theo `docs/content-standard.md` §3, `status: verified` (Java 25.0.3, macOS 14.4.1). Tổng 29 khái niệm (`###`: 7, 8, 7, 7), 46 ví dụ Java chạy bằng `pnpm content:run-code j3` kèm output thật, 8 chỗ Đoán trước, 4 câu nhắc tự giải thích (mỗi bài một), 4 callout production (mỗi bài một).

- **Nhập từ lab cũ:** J3.1: tham chiếu chung qua `alias`, ba lỗi truy cập (`private`, constructor package-private qua hai package, gán `final`), getter lộ list và `List.copyOf` ném `UnsupportedOperationException`, khối `static` chạy lười. J3.2: `@Override` bắt lỗi gõ tên, override chọn lúc chạy và overload chọn lúc biên dịch, `HashSet` con đếm 6, `switch` trên sealed báo `does not cover all possible input values`, field ẩn `this$0` của inner class, lớp vô danh sinh `Main$1` còn lambda là hidden class. J3.3: `equals` thiếu `hashCode`, `HashMap` mất khoá khi đổi giá, entity so theo `sku`, biên nhận dùng chung list, sao chép phòng thủ trong compact constructor. J3.4: lỗi `is not visible ... does not export it`, cùng code chạy được trên classpath, `FindException` so với `NoClassDefFoundError`, automatic module và `Automatic-Module-Name`, `InaccessibleObjectException` và `--add-opens`, `jlink` 43 MB so với 363 MB và từ chối automatic module.
- **Nhập từ Đào sâu:** getter/setter cho mọi field, hằng số lúc biên dịch không khởi tạo lớp (thêm ví dụ, dẫn JLS §12.4.1, §13.4.9), `protected`, khi nào viết `static`; khi nào kế thừa đúng (Liskov, *Effective Java* mục 19), constructor lớp cha gọi method bị override (có ví dụ Java 25 gán field trước `super(...)`), hai default method trùng tên (ví dụ lỗi và `A.super.m()`), enum hay sealed; `instanceof` hay `getClass()` (ví dụ phá đối xứng), record có mảng, hiệu năng đối tượng bất biến, `equals` của entity lưu database; Spring Boot và `module-info`, `jlink` cho ứng dụng classpath (`jdeps --print-module-deps`), `jdeps --jdk-internals` không thấy reflection.
- **Mới thêm:** truyền đối tượng vào method (pass-by-value với tham chiếu, nối J2.1); giá trị mặc định của field và `NullPointerException`; lớp trong file `void main()` là lớp lồng nên `private` không chặn (`Main$Order`); abstract class với method `final`; `equals(Product)` là overload; `toString` che dữ liệu nhạy cảm; canonical constructor của record không được hẹp hơn record; lỗi "does not read it" khi thiếu `requires`.
- **Cố ý bỏ:** chuỗi bước dựng project `~/masteva-j3` qua ba bài và phần dọn dẹp, các lệnh `perl`/`grep` sửa file; `javap` (thay bằng reflection in field `this$0`); `--compress zip-6` và số 30 MB của `jlink` (không chạy lại, không cần cho lập luận); số "khoảng 70 module" của JDK (thay bằng lệnh `java --list-modules`).
- **Khối `norun` (11):** J3.1 có 3 file của ví dụ package (`shop.order.OrderLine`, `shop.order.Order`, `shop.Peek`); J3.4 có 8 file của hai module (`module-info.java` ×2, `Product`, `Catalog`, `PriceRules`, `Main`, `Promo`, `TaxTable`). Không chạy riêng được vì cần nhiều file theo package hoặc module path. Đã kiểm bằng script trích đúng các khối này ra cây thư mục rồi chạy thật mọi lệnh trong `<Terminal>` của bài với JDK 25.0.3 (`javac`, `jar`, `java`, `jdeps`, `jlink`, `unzip`), output khớp bài; phần thay đổi giữa máy (đường dẫn, mã băm `@…`) ghi rõ trong bài.
- **Đọc với vai người học:** một lượt đọc riêng cả bốn bài; đã sửa: API không tồn tại `Clock.now()`, giải thích `private` giữa lớp lồng (JLS §6.6.1) và `X.class`, `HashSet`/`Class<?>` dùng trước khi giải thích, tách mục "Package và package-private" và "Getter làm lộ trạng thái nội bộ" ở J3.1, dẫn Javadoc `Map` cho khoá bị đổi, thêm dòng `contains(ebook)` làm dẫn chứng, tách Predict của J3.4 cho từng nhóm lệnh.

**Ghi cho ticket 38:** không tìm thấy liên kết nào từ chặng khác trỏ tới phần đã bỏ của J3 (`grep -rn` các mẫu `j3-N#`, `masteva-j3`, "lab/bước … J3.N" trong `content/`). Các chỗ nhắc J3 ở J2.3, J5.1, J5.3, J6.1, J8.1, J19 chỉ nhắc chặng, vẫn đúng.

