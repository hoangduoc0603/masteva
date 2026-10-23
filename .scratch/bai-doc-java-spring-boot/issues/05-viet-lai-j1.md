# 05: Viết lại chặng J1 Công cụ và môi trường thành bài đọc

**What to build:** Người học đọc 3 bài của chặng J1 dưới dạng bài đọc theo chuẩn nội dung (như bài mẫu J5.3): kiến thức đầy đủ, chi tiết, không còn lab, đào sâu và "Dấu hiệu đã nắm chắc"; đánh dấu học xong mỗi bài bằng một nút.

**Blocked by:** 04

**Status:** ready-for-agent

- [x] Mỗi bài khai báo là bài đọc; kiến thức của phần đào sâu và phát hiện từ lab (kèm output tiêu biểu) nhập vào phần kiến thức; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu chép vào nguồn câu hỏi phỏng vấn của roadmap, ghi mã bài gốc
- [x] Mã mục cũ của các bài xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [x] Liên kết từ bài khác tới phần đã bỏ của chặng này (lab, đào sâu) được sửa hoặc ghi lại cho ticket 38
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật

**Kết quả (23/10/2026):** ba bài J1 viết lại thành bài đọc theo `docs/content-standard.md` §3, theo mẫu J5.3. Mọi code và lệnh chạy thật trên macOS 14.4.1 với Java 25.0.3 (thêm JDK 21.0.3 cho các ví dụ sai phiên bản), Git 2.39.3, Homebrew 7.0.9.

- **J1.1:** 7 khái niệm (`###`), 3 ví dụ Java chạy bằng `pnpm content:run-code`, 12 khối lệnh `<Terminal>` kèm output thật, 3 chỗ Đoán trước, 1 câu nhắc tự giải thích, 1 callout production, 1 pitfall. Nhập từ lab: biên dịch và chạy hai file, chạy từ mã nguồn (JDK 25 chạy được, JDK 21 báo `cannot find symbol`), major version 69/65 và `UnsupportedClassVersionError` thật trên JVM 21, nhiều JDK và `JAVA_HOME`, phép chia nguyên trong jshell, `/open`. Nhập từ Đào sâu: vì sao dự án vẫn cần build tool; `--release` so với `-source`/`-target` (thêm ví dụ thật: `IO.println` biên dịch qua với `-source 21 -target 21` rồi `NoClassDefFoundError` trên JVM 21, còn `--release 21` báo lỗi lúc biên dịch); `void main()`/`IO.println` của Java 25 thành mục riêng vì mọi bài sau dùng nó. Thêm mới: lỗi `java Main.class` và quên `-cp`; bảng hỗ trợ lấy từ Oracle Support Roadmap (kiểm ngày 23/10/2026).
- **J1.2:** 8 khái niệm, 1 ví dụ Java chạy được (chương trình có lỗi, gộp `Invoice` và `Main` vào một file), các phiên `jdb` thật thay cho thao tác IDE (§5 cho phép kiểm IDE bằng `jdb`), 2 chỗ Đoán trước, 1 câu nhắc tự giải thích, 1 callout production, 1 pitfall. Nhập từ lab: Evaluate `discountPercent / 100` = 0, breakpoint dừng 3 lần với 3 chuỗi gọi, breakpoint có điều kiện dừng 9 lần (đã kiểm bằng bộ đếm: `subtotal()` chạy đúng 9 lần), Step Into/Out, `locals` khi thiếu `-g`, bản sửa cho `discount=55000`. Nhập từ Đào sâu: debug từ xa (`-agentlib:jdwp`, `jdb -attach`, chạy thật), Suspend All/Thread, khi nào log tốt hơn debugger. Thêm mới: Evaluate chạy được code tuỳ ý (`System.getProperty`; đã kiểm `System.exit` làm JVM tắt).
- **J1.3:** 8 khái niệm, 2 ví dụ Java chạy được (`List.of` với `add` và với `null`), 15 khối lệnh kèm output thật trong một repo thử có remote là repo bare, 1 chỗ Đoán trước, 1 callout production. Nhập từ lab: commit đầu, `.gitignore`, fast-forward, xung đột và gỡ, push/pull, `fetch first`, Javadoc và doclint. Nhập từ Đào sâu: merge hay rebase (thêm ví dụ thật: mã commit đổi sau rebase), `pull` báo divergent branches (output thật của Git 2.39), lộ secret (thêm ví dụ thật: `git show HEAD~1:.env` vẫn in mật khẩu), Javadoc nói không thread-safe. Thêm mới: Git gộp tự động phần chỉ một bên sửa (dòng Javadoc "VAT 8%") còn dòng cả hai cùng sửa thì xung đột; doclint báo thiếu `@param` nhưng không kiểm `@throws` có đúng không.
- **Sửa sai của bài cũ:** J1.3 cũ nói Git "sẽ từ chối commit" khi chưa khai báo tên, email. Trên macOS, Git 2.39.3 tự đoán danh tính từ tên tài khoản và tên máy rồi vẫn commit (đã chạy thật); bài mới viết đúng hành vi này.
- **Cố ý bỏ:** các bước tạo file bằng heredoc và sửa file bằng `perl -pi` (thủ tục, không phải kiến thức của chặng); dọn dẹp `rm -rf`; câu "Author identity unknown" (không tái hiện được trên macOS, không có dẫn chứng).
- **Khối `norun`:** 3 khối, đều vì không chạy riêng được bằng `java <file>`: `Invoice.java` và `Main.java` ở J1.1 (chương trình hai file, chính là điều mục đó dạy; đã kiểm bằng `javac -d out src/*.java`, `java -cp out Main`, `java src/Main.java` với output ghi trong bài), và đoạn Javadoc của `Invoice` ở J1.3 (class không có `main`, có lược bỏ bằng comment; bản đầy đủ đã chạy `javadoc -quiet` không còn cảnh báo).
- **Transcript tương tác:** output của `jshell` và `jdb` lấy bằng cách đưa lệnh qua stdin; bài ghi lại dạng phiên tương tác (lệnh gõ sau dấu nhắc, output thật giữ nguyên). Đường dẫn tuyệt đối trong output của `git init` thay bằng `/Users/<bạn>/...`.
- **Nguồn câu hỏi phỏng vấn:** 10 câu Đào sâu chép nguyên văn ở `content/interview/java/j1-1.md`, `j1-2.md`, `j1-3.md`.
- **Nghiệm thu:** `pnpm content:check`, `pnpm content:run-code j1` (6 ví dụ, 0 lỗi), `pnpm build` xanh; một lượt đọc với vai người học, đã sửa các chỗ nhảy bước (cú pháp chưa học ở J1.1, lập luận đổi tên ở J1.2, phiên `jdb` bị lược). Câu liên hệ J2 sửa theo J2 mới (không còn dùng jshell).

**Ghi cho ticket 38:**

- `content/steps/j13/j13-1.mdx:521`: "Thêm nó vào `pom.xml` bằng `perl` (như J1.3)". J1.3 không còn dạy `perl -pi`. Đề xuất: giải thích `perl -0pi -e` ngay tại chỗ (một câu: lệnh tìm và thay trong file tại chỗ), bỏ "(như J1.3)".
- `content/steps/d4/d4-1.mdx:352`: "J1.3 đã làm fast-forward và một conflict cơ bản trên project Java". J1.3 giờ là bài đọc. Đề xuất: "J1.3 đã giải thích fast-forward và một conflict cơ bản trên project Java."
- Hai chỗ ở J2.1 cũ ("`perl` sửa file tại chỗ như ở J1.3", "đã làm chặng J1") đã mất khi J2 viết lại (kiểm sau khi gộp `bai-doc-dot-1`), không cần sửa.
- Các chỗ "JDK 25 như bài J1.1", "đặt lại `JAVA_HOME` như J1.1", "cấu hình Git như J1.3", "`@throws` (J1.3)", "Frames (J1.2)", "`-cp` ở J1.1", "JIT (J1.1)", "`List.of(...).add` (J1.3)" vẫn đúng: bài mới giữ các kiến thức này.
