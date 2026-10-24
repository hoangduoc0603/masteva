# 08: Viết lại chặng J4 Exception thành bài đọc

**What to build:** Người học đọc 2 bài của chặng J4 dưới dạng bài đọc theo chuẩn nội dung (như bài mẫu J5.3): kiến thức đầy đủ, chi tiết, không còn lab, đào sâu và "Dấu hiệu đã nắm chắc"; đánh dấu học xong mỗi bài bằng một nút.

**Blocked by:** 04

**Status:** done

- [x] Mỗi bài khai báo là bài đọc; kiến thức của phần đào sâu và phát hiện từ lab (kèm output tiêu biểu) nhập vào phần kiến thức; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu chép vào nguồn câu hỏi phỏng vấn của roadmap, ghi mã bài gốc
- [x] Mã mục cũ của các bài xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [x] Liên kết từ bài khác tới phần đã bỏ của chặng này (lab, đào sâu) được sửa hoặc ghi lại cho ticket 38
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật

**Kết quả (23/10/2026):** J4.1 và J4.2 viết lại thành bài đọc theo `docs/content-standard.md` §3, chạy với Java 25.0.3 trên macOS 14.4.1, `status: verified`.

- **J4.1:** 8 khái niệm (`###`), 13 ví dụ Java kèm output thật, 2 lệnh `javac` trong `<Terminal>` đã chạy thật (`-Xlint:finally`, biên dịch rồi chạy bằng `java -cp` để thấy `... 1 more` và `exit=1`), 3 chỗ Đoán trước, 1 câu nhắc tự giải thích, 1 callout production.
- **J4.2:** 10 khái niệm, 14 ví dụ Java kèm output thật, 1 lệnh `javac -Xdoclint` đã chạy thật, 1 chỗ Đoán trước, 1 câu nhắc tự giải thích, 1 callout production.
- **Nhập từ Đào sâu:** checked exception chỉ tồn tại lúc biên dịch (dẫn JVMS 4.7.5, tài liệu Kotlin); `return` trong `finally` nuốt exception (ví dụ + `javac -Xlint:finally`); không bắt `Error`/`Throwable` (ví dụ `StackOverflowError` lọt qua `catch (Exception)`); checked exception và lambda (lỗi biên dịch + bọc `UncheckedIOException`); chi phí tạo exception (số frame theo độ sâu, `writableStackTrace=false`); `InterruptedException` xoá cờ interrupt (ví dụ + Javadoc `Thread.sleep`); ánh xạ exception sang HTTP status ở một chỗ (viết thành văn trong mục "Tầng ngoài cùng").
- **Nhập từ lab:** lỗi `unreported exception IOException`; trace đầy đủ của `NoSuchFileException`; bắt lỗi theo từng dòng với ba kiểu dòng sai; thứ tự đóng tài nguyên; `finally` làm mất lỗi gốc so với `Suppressed:`; `Caused by` và `... 1 more`; parser kiểm số cột, `split(",", -1)`, giá âm vừa là lỗi lập trình vừa là lỗi dữ liệu; có và không có cause (thêm `AccessDeniedException` bằng file bị gỡ quyền, đúng tình huống của callout production); `requireNonNull` so với NPE từ sâu trong `Files`; `@throws` nói dối bị `-Xdoclint` bắt; `findBySku` trả `Optional`.
- **Cố ý bỏ:** phần chuẩn bị project `~/masteva-j4`, lệnh `perl` sửa file, `grep -v`, `head`, `jshell`, mục Khi gặp lỗi về môi trường (tên file, classpath, thư mục hiện tại) và dọn dẹp; ví dụ `maxErrors` dừng importer (giữ thành văn, không cần ví dụ riêng); câu "J7 đưa cờ vào cấu hình build" (J7 hiện không dạy `-Xlint`/`-Xdoclint`); "SB6 ghi log lỗi" trong callout liên hệ đổi thành SB8 (SB6 là bảo mật).
- **Lưu ý về output:** lệnh `java File.java` (trình chạy file nguồn) cắt frame của nó khỏi trace chính nhưng để nguyên 5 frame `SourceLauncher` ở `Caused by:` và `Suppressed:`. Bài giữ output thật đó, giải thích một lần ở mục Đọc stack trace và cho thêm output của chương trình đã biên dịch.
- **Nguồn câu hỏi phỏng vấn:** `content/interview/java/j4-1.md` (3 câu), `content/interview/java/j4-2.md` (4 câu), chép nguyên văn.
- **Khối `norun`:** không có.
- **Nghiệm thu:** `pnpm content:check`, `pnpm content:run-code j4` (27 ví dụ, 0 lỗi), `pnpm build` xanh; một lượt đọc với vai người học, đã sửa: giải nghĩa stderr và exit code, bỏ khẳng định chưa kiểm (frame trên Windows, "Spring thường đi qua hàng trăm frame", J7/J11/SB6 trong callout liên hệ), nói rõ file nào lệnh `javac` biên dịch, dẫn Javadoc cho quy ước `@throws`.

**Ghi cho ticket 38:** không có liên kết nào từ chặng khác trỏ tới phần đã bỏ của J4 (`grep -rn` theo `j4-1`, `j4-2`, `J4.1`, `J4.2`, `masteva-j4`, `importer` trong `content/`). Các chỗ nhắc "J4" chung (j1-3:549, j2-2:275, j2-2:406, j2-3:459, j3-3:457, j5-3:451, j5-3:712, j8-3:374, j9-1:68, j9-1:544) vẫn đúng với nội dung mới. Ngoài phạm vi: J4 cũ hứa "J7 đưa `-Xdoclint` vào cấu hình build", nhưng J7 không nhắc `-Xlint`/`-Xdoclint`; đề xuất ticket J7 (11) cân nhắc thêm.

