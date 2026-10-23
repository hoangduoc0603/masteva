# 11: Viết lại chặng J7 Build tool thành bài đọc

**What to build:** Người học đọc 3 bài của chặng J7 dưới dạng bài đọc theo chuẩn nội dung (như bài mẫu J5.3): kiến thức đầy đủ, chi tiết, không còn lab, đào sâu và "Dấu hiệu đã nắm chắc"; đánh dấu học xong mỗi bài bằng một nút.

**Blocked by:** 04

**Status:** ready-for-agent

- [x] Mỗi bài khai báo là bài đọc; kiến thức của phần đào sâu và phát hiện từ lab (kèm output tiêu biểu) nhập vào phần kiến thức; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu chép vào nguồn câu hỏi phỏng vấn của roadmap, ghi mã bài gốc
- [x] Mã mục cũ của các bài xoá thẳng khỏi danh sách `ids` của file khoá mã (ADR-0011)
- [x] Mở rộng Gradle khỏi mức bảng đối chiếu: build script, task, dependency configuration, wrapper, so với Maven
- [x] Liên kết từ bài khác tới phần đã bỏ của chặng này (lab, đào sâu) được sửa hoặc ghi lại cho ticket 38
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật

**Kết quả (23/10/2026):** ba bài J7 viết lại thành bài đọc theo `docs/content-standard.md` §3, `status: verified` với Java 25.0.3, Maven 3.9.9 (wrapper 3.3.4 tải Maven 3.9.16), Gradle 9.8.2 (qua wrapper) trên macOS 14.4.1. Mọi lệnh `mvn`, `./mvnw`, `./gradlew` trong bài đã chạy thật trên project dựng lại; output chép từ lần chạy, chỉ thay tiền tố đường dẫn bằng `/Users/<bạn>/` và lược dòng bằng `...` trong khối `text`.

| Bài | Khái niệm (`###`) | Khối lệnh chạy thật | Đoán trước | Callout production |
|---|---|---|---|---|
| J7.1 | 12 | 16 | 2 | 1 |
| J7.2 | 10 | 14 | 2 | 1 |
| J7.3 | 10 | 14 | 2 | 1 |

- **Gradle (mục bắt buộc):** J7.1 có build script (`settings.gradle.kts`, `build.gradle.kts`, bảng khối ↔ `pom.xml`), task, đồ thị task (`--dry-run`), `UP-TO-DATE`, daemon, build cache, tự viết task và ba pha initialization/configuration/execution, bảng "Maven hay Gradle". J7.2 có dependency configuration (`api`, `implementation`, `compileOnly`, `runtimeOnly`, `testImplementation`) với lỗi thật `cannot access JsonProcessingException`, `platform(...)`, multi-project `include` và `project(":invoice")`, `installDist`, quy tắc chọn bản cao nhất (`2.12.7 -> 2.22.3`, `dependencyInsight`). J7.3 có Gradle Wrapper kèm `distributionSha256Sum`, archive tái lập sẵn từ Gradle 9 (cùng hash, ngày 1980), toolchain (Gradle chạy trên JDK 21 vẫn biên dịch bằng JDK 25; lỗi khi thiếu JDK 24), bảng so sánh cách hai công cụ chốt từng nguồn khác biệt.
- **Phát hiện mới khi chạy thật, đã đưa vào bài:** Gradle vẫn tạo `.jar` khi test hỏng (`jar` không phụ thuộc `test`); plugin `application` không ghi `Main-Class` (`no main manifest attribute`); `-DskipTests` đóng gói `.jar` tính thuế sai (`total=324000`); `-Dmaven.test.skip=true` in `Not compiling test sources`; `dependency:analyze` báo thêm `junit-jupiter-api` là used undeclared; mục khai báo trực tiếp trong `<dependencyManagement>` thắng BOM dù đứng sau dòng import (kiểm bằng `jackson-databind` 2.22.4); wrapper chỉ kiểm checksum lúc tải, bản đã có trong `~/.m2/wrapper/dists` không bị kiểm lại.
- **Nhập từ lab và Đào sâu cũ:** `JAVA_HOME` và Maven của Homebrew (giữ lại vì nhiều chặng sau nhắc "như J7.1"), phase và goal, `surefire:test` không chạy test, test hỏng thì không có jar, manifest, `help:describe`; nearest wins với `NoClassDefFoundError`, `dependency:tree -Dverbose`, BOM, `-pl`/`-am`, `copy-dependencies`; wrapper, plugin drift giữa 3.9.9 và 3.9.16, hai hash rồi một hash, Enforcer (thiếu `maven-site-plugin`, chặn Maven 3.9.9 và JDK 21), `check-buildplan`. Mười hai câu Đào sâu chép nguyên văn ở `content/interview/java/j7-1.md`, `j7-2.md`, `j7-3.md`; ý của chúng đã vào phần Kiến thức.
- **Lấp hứa hẹn cũ:** J4.2 viết "Ở J7, bạn đưa cờ này vào cấu hình build"; J7.1 giờ có ví dụ `-Xdoclint:all,-missing` trong `maven-compiler-plugin` (và `tasks.compileJava` của Gradle) kèm lỗi thật `exception not thrown`.
- **Cố ý bỏ:** phần tạo file bằng heredoc, chuẩn bị môi trường và dọn dẹp của lab; bước khởi tạo repo Git ở cuối J7.3 cũ (bảng file cần commit và `.gitignore` thay cho nó); nhận xét "nhánh Maven 3.10 đã có" (không cần cho lập luận); convention plugin trong `buildSrc`, configuration cache, kho tải toolchain (chỉ nhắc tên, ngoài phạm vi).
- **Khối `norun`:** 6 khối `java norun`, đều là file của project Maven/Gradle (`Invoice`, `Main`, `InvoiceTest`, Javadoc của `Invoice.add`, `InvoiceJson`, `Main` của `invoice-app`): có `package`, không có `main` hoặc cần JUnit/Jackson trên classpath. Đã kiểm bằng `mvn package` và `./gradlew build` thật: test qua, `java -jar` và `installDist` in đúng output trong bài.
- **Lượt đọc với vai người học:** một agent riêng đọc ba bài; đã sửa: đổi thứ tự mục JDK (tái hiện JDK 23 trước), nói rõ `gradlew` sinh ra thế nào ngay ở J7.1, ghi rõ cấu hình `maven-compiler-plugin` chỉ là ví dụ (J7.3 dựa vào việc project không có nó), thêm code `Main`, khối `<pluginManagement>` của POM cha, lệnh cho các output trước đó chỉ có kết quả, câu đọc output cho `--dry-run` và `./gradlew --version`, phân biệt module Maven với module JPMS, tách `###` toolchain, thêm câu nhắc tự giải thích ở J7.3, tải zip Maven vào thư mục tạm.
- **Cần chủ dự án xem:** J7.1 dài khoảng 920 dòng (nhiều log), có thể vượt ngưỡng gợi ý 30–40 phút đọc; nếu cần, tách phần Gradle (từ mục "Gradle: build script và task") thành bài riêng.
- **Nghiệm thu:** `pnpm content:check`, `pnpm content:run-code j7` (0 khối chạy, 6 `norun`), `pnpm build` xanh.

**Ghi cho ticket 38:** không có liên kết nào từ chặng khác trỏ tới phần lab hay Đào sâu đã bỏ của J7 (đã tìm `masteva-j7`, `#thuc-hanh`, `#dao-sau`, "bước N" trong `content/`). Các câu "trỏ `JAVA_HOME` về JDK 25 như J7.1" (j11-1:176, j12-4:133, j13-1:151, j15-1:170, j16-1:151, j16-4:160, j17-1:130, j17-4:112, j18-2:127, j19-1:108) vẫn đúng vì J7.1 giữ mục "Maven chạy trên JDK nào". `content/steps/j4/j4-2.mdx:586` ("Ở J7, bạn đưa cờ này vào cấu hình build") nay đã đúng, không cần sửa.
