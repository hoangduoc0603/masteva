# Spec: tách ba roadmap và sơ đồ roadmap mới

Ngày: 03/10/2026. Trạng thái: **chờ người dùng duyệt**. Sau khi duyệt mới lập kế hoạch triển khai.

## 1. Bối cảnh và mục tiêu

**Người dùng yêu cầu:**

1. Tách roadmap chung "Senior Java · DevOps · Microservices" thành ba roadmap độc lập: Java, DevOps, Microservices. Mỗi roadmap chi tiết và đầy đủ nhất có thể.
2. Thiết kế lại sơ đồ roadmap cho trực quan, hiện đại, bắt mắt hơn. Tham khảo roadmap.sh và các nguồn khác, nhưng là thiết kế của riêng Masteva.
3. File thiết kế lưu ở máy (thư mục `design/`), không lưu thành artifact trên claude.ai.

**Đã chốt qua trao đổi:**

| Câu hỏi | Quyết định |
|---|---|
| Mỗi roadmap bắt đầu từ đâu | Từ nền tảng tới Senior, chia ba cấp: Nền tảng, Middle, Senior |
| Dự án Neobank, hub hội thoại và 6 điểm hội tụ | Thành trang dự án riêng; mốc dự án tham chiếu bước của cả ba roadmap |
| Kiểu sơ đồ | Phương án A "Trục giữa" (`design/roadmap-options.html`) |
| Mô hình nội dung | Như mục 4 |
| Giao diện | Như mục 6 |
| Dàn ý | Như mục 7, đầy đủ cả 58 chặng |
| Hai artifact trên claude.ai | Xoá sau khi bản thiết kế local đã đủ |

**Thành công khi:**

- Người học mở một roadmap là thấy ngay: sẽ học gì (cấp, chặng, chủ đề), theo thứ tự nào, đang ở đâu, học tiếp gì.
- Sơ đồ dùng tốt trên điện thoại 390px mà không phải phóng to, và dùng được hoàn toàn bằng bàn phím.
- Theo dõi tiến độ được ngay cả khi chủ đề chưa có bài.
- Tiến độ đã lưu (bài D1.1) không mất.
- `pnpm verify` xanh. Ngân sách JavaScript của trang roadmap không vượt mức của trang bài học (~260 KB gzip).

## 2. Nghiên cứu tóm tắt

Nguồn đã xem trực tiếp ngày 03/10/2026; ảnh chụp lưu ngoài repo.

**roadmap.sh** ([java](https://roadmap.sh/java), [devops](https://roadmap.sh/devops), [backend](https://roadmap.sh/backend), [repo](https://github.com/nilbuild/developer-roadmap)):

- **Cách vẽ:** một SVG lớn, trục dọc nối các chủ đề chính, chủ đề con treo hai bên bằng đường chấm, nhóm chủ đề trong khung có tiêu đề.
- **Quy mô:** Java khoảng 90 nút, DevOps khoảng 140.
- **Khung chi tiết** gồm mô tả, tài liệu và nút Đang học / Xong / Bỏ qua.
- **Hạn chế:**
  - Trên mobile chỉ thu nhỏ SVG, chữ còn 5–6px (issue #9724).
  - Không bấm được bằng bàn phím, nút chỉ là `<g>` (#8191).
  - Ý nghĩa chỉ phân biệt bằng màu.
  - Theo dõi tiến độ phải đăng nhập.
  - Người mới thấy "quá ngợp" (#7750, #8731).
- **Giấy phép** cấm dùng lại nội dung và hình ảnh, nên Masteva chỉ học cách làm, không chép dàn ý hay giao diện.

**Nguồn khác:**

| Nguồn | Học được |
|---|---|
| [Exercism](https://exercism.org/tracks/java/concepts) | Nút là link thật; mobile thành một cột |
| [KodeKloud](https://kodekloud.com/learning-path/devops) | Trục dọc với mốc và thẻ so le; nhãn "Recommended/Optional"; chọn "tôi đã biết…" để đổi điểm bắt đầu |
| [Duolingo](https://blog.duolingo.com/new-duolingo-home-screen-design/) | Luôn có "bạn đang ở đây" và nút nhảy tới vị trí hiện tại |
| Frontend Masters | Tách rõ phần cốt lõi theo thứ tự và phần tự chọn |
| [Khan Academy](https://support.khanacademy.org/hc/en-us/articles/5548760867853) | Tiến độ theo từng đơn vị |
| [Hyperskill](https://hyperskill.org/knowledge-map/426?track=2) | Quan hệ "học trước / dẫn tới" nằm ở trang chi tiết thay vì vẽ chằng chịt trên sơ đồ |

**Áp dụng cho Masteva:**

- Một HTML là danh sách có thứ tự lồng nhau (cấp → chặng → chủ đề); CSS vẽ thành sơ đồ trên màn rộng và thành một cột trên mobile.
- Loại chủ đề ghi bằng chữ.
- Có "bạn đang ở đây" và "học tiếp".
- Lựa chọn công cụ gộp thành một nút "chọn một", để sơ đồ không phình.
- Tiến độ lưu trên trình duyệt, không cần đăng nhập.

Nguồn cho dàn ý (mục 7):

| Roadmap | Nguồn |
|---|---|
| Java | [dev.java/learn](https://dev.java/learn/), [Spring guides](https://spring.io/guides) |
| DevOps | [CKA](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/) và [CKAD](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/), [Google SRE book](https://sre.google/sre-book/table-of-contents/), [DORA capabilities](https://dora.dev/capabilities/) |
| Microservices | [microservices.io](https://microservices.io/patterns/index.html), [Building Microservices, bản 2](https://samnewman.io/books/building_microservices_2nd_edition/), [Fowler và Lewis: Microservices](https://martinfowler.com/articles/microservices.html) |

## 3. Phạm vi

**Trong phạm vi:**

- Mô hình nội dung mới.
- Ba file roadmap và 58 `meta.json` có danh sách chủ đề.
- Hai file dự án (đề cương).
- Tiến độ phiên bản 2.
- Trang danh mục roadmap, trang roadmap (sơ đồ và danh sách, khung chi tiết).
- Cập nhật trang chủ và trang bài học.
- Thiết kế local hoàn chỉnh cho các trang này.
- Cập nhật tài liệu.

**Ngoài phạm vi:**

- Viết bài học mới; việc này thuộc giai đoạn 1.
- Mô tả và tài liệu đọc thêm cho từng chủ đề: trường có sẵn, nội dung điền dần.
- Trang riêng cho từng chủ đề.
- Phím tắt đánh dấu.
- Ước lượng thời gian học.
- Đồng bộ tiến độ qua tài khoản (G3).

## 4. Mô hình nội dung

### 4.1 Roadmap

`content/roadmaps/java.json`, `devops.json`, `microservices.json` thay cho `senior-backend.json`.

```json
{
  "id": "java",
  "area": "backend",
  "track": "java",
  "title": { "vi": "Java backend, từ nền tảng tới Senior" },
  "description": { "vi": "…" },
  "recommended": ["j11", "j12", "d6", "d7"],
  "levels": [
    { "id": "foundation", "title": { "vi": "Nền tảng" }, "goal": { "vi": "Viết Java đúng, có test, build được." }, "steps": ["j1", "j2", "…", "j10"] },
    { "id": "middle", "title": { "vi": "Middle" }, "goal": { "vi": "…" }, "steps": ["j11", "…"] },
    { "id": "senior", "title": { "vi": "Senior" }, "goal": { "vi": "…" }, "steps": ["j18", "j19", "j20"] }
  ]
}
```

- `track` quyết định màu roadmap: `java`, `devops` hoặc `microservices`.
- `recommended` là các bước của roadmap khác nên học trước. Chỉ Microservices dùng.
- Thứ tự bước là thứ tự trong `levels`. Mỗi bước thuộc đúng một roadmap.
- Bỏ `steps`, `optional` và `hubs` cũ.

### 4.2 Bước (chặng) và chủ đề

`content/steps/<bước>/meta.json` giữ các trường hiện có, thêm `topics` và `links`.

```json
{
  "id": "j12", "code": "J12", "title": "Lưu trữ dữ liệu", "short": "Dữ liệu",
  "track": "java", "prerequisites": ["j11"],
  "topics": [
    { "id": "j12.transactions", "title": "Transaction và mức isolation", "summary": "…" },
    { "id": "j12.n-plus-one", "title": "Fetch, N+1, lazy loading", "requires": ["j12.jpa"] },
    { "id": "j12.migrations", "title": "Flyway hoặc Liquibase", "kind": "pick", "options": ["Flyway", "Liquibase"] },
    { "id": "j12.jooq", "title": "jOOQ", "kind": "opt" }
  ],
  "links": [],
  "pages": []
}
```

Ví dụ `links` (ở J17): `[{ "step": "d6", "note": "Đóng gói container" }]`. `note` là chuỗi; bản dịch nằm ở `meta.<lang>.json` như tên chặng.

**Trường của chủ đề:**

| Trường | Bắt buộc | Ý nghĩa |
|---|---|---|
| `id` | Có | `<mã bước>.<slug>`, không đổi sau khi phát hành |
| `title` | Có | Tên hiển thị (tiếng Việt; bản dịch ở `meta.<lang>.json`) |
| `kind` | Không | `core` (mặc định), `pick` (chọn một, kèm `options`), `opt` (tuỳ chọn) |
| `options` | Khi `kind = pick` | Các lựa chọn, hiển thị "A hoặc B" |
| `summary` | Không | Một hai câu mô tả cho khung chi tiết |
| `requires` | Không | Mã chủ đề nên học trước |
| `resources` | Không | Tối đa 3 nguồn đọc thêm `{ title, url, note }` |

**Quy tắc:**

- **Mã chủ đề được khoá** như mã mục. `content/ids.lock.json` thêm danh sách `topics`, dùng chung `replacements`.
- **`links`** trỏ tới bước của roadmap khác. Dùng khi chủ đề đã được dạy đầy đủ ở roadmap kia, để không viết lại.
- **Giữ mã cũ khi nghĩa không đổi:**
  - `d0` vẫn là Dựng phòng lab.
  - `d1` vẫn là Linux. Tên đổi từ "Linux, mạng và scripting" thành "Linux"; mạng và scripting tách ra D2, D3. Bài `d1.1` và 12 mã mục giữ nguyên.
  - Các bước J, M khác chưa có bài nên đánh lại tự do theo mục 7.
  - `b0`–`b4`, `bx`, `j0`, `jx` bị xoá khỏi `content/steps/`. Chúng chưa có bài, chưa có mã mục nên không cần mục thay thế.

### 4.3 Bài học

Frontmatter thêm `topics: [mã chủ đề]`, bắt buộc có ít nhất một. Bài `d1.1` gắn `d1.processes`, `d1.signals`, `d1.systemd`.

Kiểm tra lúc build:
- mã chủ đề phải tồn tại;
- mã chủ đề phải thuộc bước của bài, hoặc bước đó có trong `links`.

### 4.4 Dự án

`content/projects/neobank.json` và `hub-chat.json`:

```json
{
  "id": "neobank",
  "title": { "vi": "Neobank mini" },
  "summary": { "vi": "…" },
  "milestones": [
    { "id": "neobank.discovery", "title": { "vi": "Khám phá miền ngân hàng" }, "needs": ["m3", "j19"] }
  ]
}
```

- `needs` nhận mã bước hoặc mã chủ đề, thuộc roadmap nào cũng được.
- Lúc build sinh ngược lại "Dùng ở dự án" cho từng bước.
- Mã mốc cũng được khoá.

### 4.5 Kiểm tra lúc build (`pnpm content:check`)

- Schema Zod cho roadmap, bước (cả `topics`, `links`), dự án và frontmatter bài.
- Mỗi bước thuộc đúng một roadmap. Mỗi mã chủ đề và mã mốc là duy nhất.
- `requires`, `links`, `needs`, `recommended` trỏ tới mã có thật.
- File khoá: không mất mã chủ đề hay mã mốc nếu không có mục thay thế.

## 5. Tiến độ phiên bản 2

```ts
interface ProgressV2 {
  v: 2;
  items: Record<string, string>;                        // mã mục → thời điểm xong (như v1)
  topics: Record<string, { s: 'learning' | 'done' | 'skipped'; at: string }>; // trạng thái người học tự đặt
  start: Record<string, 'foundation' | 'middle' | 'senior'>; // "Tôi đã biết", theo roadmap
}
```

- **Khoá lưu mới:** `masteva:progress:v2`. Lần đầu mở trang, nếu thấy khoá v1 thì chuyển `items` sang v2. Khoá v1 giữ lại một bản phát hành để có thể quay lui.
- **Trạng thái hiển thị của chủ đề:**
  1. Trạng thái tự đặt, nếu có.
  2. Nếu không: "đã xong" khi mọi mục trong các bài gắn với chủ đề đã tích; "đang học" khi đã tích một phần.
  3. Còn lại là "chưa học".
- **"Học tiếp":**
  - Là chủ đề `core` hoặc `pick` đầu tiên theo thứ tự, chưa "đã xong" và chưa "bỏ qua", thuộc cấp không bị bỏ qua bởi `start`.
  - Ưu tiên chủ đề "đang học" nếu có.
  - "Bạn đang ở đây" đặt ở chặng chứa chủ đề đó.
- **Đếm tiến độ:** chỉ tính `core` và `pick`; `opt` không tính vào tổng. Chủ đề "bỏ qua" bị loại khỏi cả tử và mẫu.
- **Xuất/nhập file** dùng định dạng v2. Nhập file v1 thì tự chuyển. Gộp `topics`: cùng mã thì giữ bản có `at` mới hơn.
- **Ràng buộc:** module này không import Zod (ràng buộc hiện có) và phải viết theo TDD (CLAUDE.md).

## 6. Giao diện

Theo `docs/design-direction.md` (hướng "Sổ tay kỹ sư") và token ở `design/tokens.css`. Màu roadmap: Java `track-java`, DevOps `track-devops`, Microservices `track-microservices`.

### 6.1 Trang roadmap `/[lang]/roadmaps/[roadmap]`

1. **Header:**
   - "Roadmap · Java" ghi bằng màu roadmap, tên và mô tả.
   - Số cấp, chặng, chủ đề, "Đã xong k/n chủ đề chính".
   - Nút chính "Học tiếp: <chủ đề>".
   - Bộ chọn "Tôi đã biết: Chưa gì / Nền tảng / Middle".
   - Riêng Microservices có dòng "Nên học trước" liệt kê các bước J11, J12, D6, D7, kèm link.
2. **Thanh công cụ dính khi cuộn:**
   - "Sơ đồ / Danh sách";
   - "Ẩn mục đã bỏ qua";
   - "Cách đọc sơ đồ" (chú giải mở ra được);
   - nút "Học tiếp" thu nhỏ.
3. **Sơ đồ:**
   - Mỗi cấp mở đầu bằng một khung có mục tiêu và tiến độ riêng. Cấp bị bỏ qua bởi "Tôi đã biết" thì thu gọn, còn nút mở lại.
   - Trục dọc màu roadmap. Mỗi chặng là một trạm đánh số; thẻ chặng xếp so le hai bên.
   - Thẻ có tên chặng, "k/n chủ đề chính", các chip chủ đề, chip "Dùng ở: <dự án> · <mốc>" và link sang roadmap khác.
   - Chặng chứa "Học tiếp" có nhãn "Bạn đang ở đây".
   - Nền có lưới chấm nhẹ.
4. **Chip chủ đề** là link `href="#<mã chủ đề>"`, cao tối thiểu 34px trên desktop và 44px trên mobile.

| Trạng thái | Hình | Chữ cho trình đọc màn hình |
|---|---|---|
| Chưa học | Vòng rỗng | "chưa học" |
| Đang học | Vòng `accent` dày, nền `selection`, chữ đậm | "đang học" |
| Đã xong | Tròn đặc màu roadmap có dấu tick, chữ `muted` | "đã xong" |
| Bỏ qua | Vòng nét đứt, chữ gạch ngang | "đã bỏ qua" |
| `opt` | Viền nét đứt và nhãn "Tuỳ chọn" | "tuỳ chọn" |
| `pick` | "A hoặc B" kèm nhãn "Chọn một" | "chọn một" |

5. **Khung chi tiết:**
   - Mở khi bấm chip hoặc khi URL có `#<mã chủ đề>`. Desktop là panel phải rộng 400px; mobile trượt từ dưới lên, cao toàn màn hình.
   - Là `role="dialog"` có tiêu đề. Esc hoặc nút đóng thì đóng và trả focus về chip; URL bỏ hash.
   - Nội dung:
     - chặng và loại chủ đề;
     - bốn nút trạng thái có chữ: Chưa học, Đang học, Đã xong, Bỏ qua;
     - `summary`;
     - "Bài học trên Masteva" (bài, tiến độ, hoặc "đang soạn");
     - "Nên học trước" (`requires`);
     - "Dùng ở dự án";
     - "Đọc thêm" (`resources`).
6. **View danh sách:** cùng HTML, đổi CSS sang dàn ý dày (một chủ đề một dòng). Lựa chọn view lưu trong localStorage.
7. **Mobile:**
   - Trục bên trái, thẻ rộng hết màn hình, khung cấp căn trái.
   - Thanh "Học tiếp" dính ở đáy màn hình.

### 6.2 Các trang khác

| Trang | Thay đổi |
|---|---|
| `/[lang]/roadmaps` | Ba thẻ roadmap: màu riêng, ba vạch tiến độ theo cấp, số chặng và chủ đề, nút "Mở" hoặc "Học tiếp" |
| `/[lang]` (trang chủ) | Khối "Bạn đang học" (chủ đề đang học gần nhất trên cả ba roadmap); ba roadmap; hai dự án; 6 phần của một bài |
| `/[lang]/projects/[project]` | Trang dự án mới: tóm tắt, các mốc, bước cần học theo từng mốc kèm tiến độ |
| Trang bài học | Breadcrumb có tên roadmap; thanh bên liệt kê chặng của roadmap chứa bài; dưới tiêu đề có chip chủ đề bài bao phủ, link về `#<mã chủ đề>` trên sơ đồ |
| `/[lang]/roadmaps/senior-backend` | Giữ một trang tĩnh báo roadmap đã tách, kèm link tới ba roadmap mới, để link cũ không hỏng |

### 6.3 Kỹ thuật và hiệu năng

- Sơ đồ là Server Component render lúc build. Trang dùng được cả khi tắt JavaScript: chip là link, sơ đồ là danh sách.
- Một client component nhỏ đọc tiến độ, gắn `data-st` lên chip, cập nhật số đếm và điều khiển khung chi tiết. Không import Zod hay `repo.ts`, `manifest.ts`.
- Nội dung khung chi tiết render sẵn trong trang, ẩn bằng `hidden`. Với khoảng 100 chủ đề mỗi roadmap, HTML tăng vừa phải. Đo lúc triển khai, ngân sách HTML gzip ≤ 150 KB mỗi trang roadmap.
- Thanh tiến độ dùng `transform: scaleX`. Chuyển động chỉ ở khung chi tiết (200ms) và dấu tick; tắt khi `prefers-reduced-motion`.

## 7. Dàn ý ba roadmap

Ký hiệu: *(chọn một)* = `pick`, *(tuỳ chọn)* = `opt`, → = `links` sang roadmap khác. Chủ đề không ghi gì là `core`. Tên chủ đề viết bằng lời của Masteva; slug mã chủ đề đặt khi viết `meta.json`.

### 7.1 Java backend (20 chặng)

**Cấp Nền tảng:** viết Java đúng, có test, build được.

| Mã | Chặng | Chủ đề |
|---|---|---|
| J1 | Công cụ và môi trường | JDK, bản phân phối và phiên bản LTS; java, javac, jshell; IntelliJ IDEA hoặc VS Code *(chọn một)*; Debugger; Git cơ bản; Đọc tài liệu API và Javadoc |
| J2 | Ngôn ngữ Java | Kiểu nguyên thuỷ và kiểu tham chiếu; Biến, phạm vi, var; Toán tử và ép kiểu; Điều khiển luồng và vòng lặp; Chuỗi và StringBuilder; Mảng; Record; Enum; Switch expression và pattern matching; Text block *(tuỳ chọn)* |
| J3 | Hướng đối tượng | Lớp, đối tượng, constructor; Đóng gói và access modifier; static và final; Kế thừa, override, overload; Kết hợp thay vì kế thừa; Interface, default method, sealed; Lớp lồng và lớp vô danh; equals, hashCode, toString; Đối tượng bất biến; Module system (JPMS) *(tuỳ chọn)* |
| J4 | Exception | Checked và unchecked; try-catch-finally và try-with-resources; Exception tự định nghĩa; Thiết kế lỗi cho API |
| J5 | Collections và generics | List, Set, Map, Queue, Deque; Chọn collection theo độ phức tạp; Generics; Wildcard và PECS; Iterator, Comparable, Comparator; Optional; Collection bất biến |
| J6 | Lập trình hàm | Lambda và method reference; Functional interface có sẵn; Stream API; Collector và gom nhóm; Khi nào không nên dùng stream |
| J7 | Build tool | Maven hoặc Gradle *(chọn một)*; Vòng đời build và plugin; Dependency, scope, xung đột phiên bản; Multi-module và BOM; Wrapper và build tái lập |
| J8 | Kiểm thử | JUnit 5; AssertJ; Mockito và test double; Kim tự tháp test; Test tham số hoá; Testcontainers; Độ phủ và mutation testing *(tuỳ chọn)* |
| J9 | I/O, thời gian, JSON | java.io và NIO.2; Charset và mã hoá ký tự; JSON với Jackson; java.time và múi giờ; Regex; HTTP client của JDK |
| J10 | HTTP và REST | Phương thức, status code, header; Thiết kế resource và URL; Idempotency; Phân trang, lọc, sắp xếp; Versioning; OpenAPI; Lỗi theo Problem Details (RFC 9457) |

**Cấp Middle:** làm chủ một service Spring Boot trên production.

| Mã | Chặng | Chủ đề |
|---|---|---|
| J11 | Spring Boot | IoC và dependency injection; Bean, scope, vòng đời; Auto-configuration và starter; Cấu hình, profile, @ConfigurationProperties; REST với Spring MVC; Validation; Xử lý lỗi tập trung; Spring WebFlux *(tuỳ chọn)*; Quarkus hoặc Micronaut *(tuỳ chọn)* |
| J12 | Lưu trữ dữ liệu | SQL và thiết kế bảng; Index và execution plan; Transaction và mức isolation; JDBC; JPA và Hibernate; Fetch, N+1, lazy loading; Spring Data JPA; Flyway hoặc Liquibase *(chọn một)*; Connection pool; Khoá lạc quan và bi quan; jOOQ *(tuỳ chọn)*; MongoDB *(tuỳ chọn)* |
| J13 | Bảo mật | Xác thực và phân quyền; Spring Security filter chain; Session và JWT; OAuth2 và OIDC resource server; Băm mật khẩu; CORS và CSRF; OWASP Top 10; Quản lý secret |
| J14 | Concurrency | Thread và vòng đời; Executor và thread pool; CompletableFuture; synchronized, lock, atomic; Collection đồng thời; Java Memory Model và volatile; Virtual thread; Structured concurrency *(tuỳ chọn)*; Deadlock và cách tìm |
| J15 | Observability | SLF4J và Logback; Log có cấu trúc và MDC; Micrometer và metric; OpenTelemetry tracing; Actuator, health, readiness; Graceful shutdown; → D12 |
| J16 | Cache và messaging | Cache-aside và TTL; Spring Cache với Redis; Kafka hoặc RabbitMQ *(chọn một)*; Producer, consumer, retry, DLQ; Scheduling; Spring Batch *(tuỳ chọn)*; → M5 |
| J17 | Đóng gói và phát hành | Fat JAR và layered JAR; Container image cho Java (Dockerfile, Jib, Buildpacks); Cấu hình theo 12-factor; JVM trong container: bộ nhớ và CPU; GraalVM native image *(tuỳ chọn)*; → D6; → D7 |

**Cấp Senior:** quyết định kiến trúc, tối ưu, dẫn dắt.

| Mã | Chặng | Chủ đề |
|---|---|---|
| J18 | JVM và hiệu năng | Class loading; Heap, stack, metaspace; GC: G1, ZGC và cách chọn; JIT và warm-up; JFR và JDK Mission Control; Profiling với async-profiler; Heap dump và rò rỉ bộ nhớ; Benchmark với JMH |
| J19 | Thiết kế và kiến trúc | SOLID; Design pattern thường dùng; Layered và hexagonal; DDD chiến thuật: entity, value object, aggregate; Modular monolith; Spring Modulith *(tuỳ chọn)*; Hợp đồng giữa các module; → M1 |
| J20 | Nghề Senior | System design và trade-off; Ước lượng tải và dung lượng; Review code; Mentoring; ADR; Nâng cấp phiên bản Java và Spring; Dùng AI có kiểm chứng; Làm việc với nợ kỹ thuật |

### 7.2 DevOps (20 chặng)

**Cấp Nền tảng:** tự vận hành và tự động hoá một máy Linux.

| Mã | Chặng | Chủ đề |
|---|---|---|
| D0 | Dựng phòng lab | VM Linux bằng Lima; Docker trên máy; kind hoặc k3d *(chọn một)*; Bộ công cụ dòng lệnh; Dọn dẹp và tiết kiệm tài nguyên |
| D1 | Linux | Hệ thống file và FHS; Người dùng, nhóm, quyền; Tiến trình, signal, exit code; systemd và journald; Quản lý gói; Đĩa, mount, dung lượng; Theo dõi tài nguyên; Chẩn đoán sự cố cơ bản |
| D2 | Mạng | Mô hình TCP/IP; IP, subnet, route; DNS; TCP, UDP, bắt tay; HTTP và TLS; Firewall và NAT; Nginx hoặc Caddy *(chọn một)*; Load balancer và reverse proxy; SSH và tunnel; curl, dig, ss, tcpdump |
| D3 | Scripting | Bash: biến, điều kiện, vòng lặp, hàm; Pipe, redirect, exit code; grep, sed, awk; jq; Script an toàn với set -euo pipefail; Python hoặc Go cho tự động hoá *(chọn một)* |
| D4 | Git và cộng tác | Branch, merge, rebase; Trunk-based development; Pull request và review; Lịch sử commit sạch; GitHub hoặc GitLab *(chọn một)* |
| D5 | Văn hoá DevOps và đo lường | DevOps là gì và không là gì; Bốn chỉ số DORA; Batch nhỏ và luồng giá trị; Toil và tự động hoá; SLI và SLO cơ bản |

**Cấp Middle:** đưa ứng dụng lên production.

| Mã | Chặng | Chủ đề |
|---|---|---|
| D6 | Container | Image, layer, container; Dockerfile tốt: multi-stage, không chạy root, cache; Registry và tag; Volume và network; Docker Compose; Quét lỗ hổng image; Podman *(tuỳ chọn)* |
| D7 | CI/CD | Pipeline và stage; Artifact và đánh phiên bản; Môi trường và thăng cấp; Rolling, blue-green, canary; GitHub Actions, GitLab CI hoặc Jenkins *(chọn một)*; Migration database trong pipeline; Feature flag *(tuỳ chọn)* |
| D8 | Chuỗi cung ứng phần mềm | Kho artifact; Ký artifact và image; SBOM; Quét phụ thuộc; SLSA *(tuỳ chọn)* |
| D9 | Cloud | AWS, GCP hoặc Azure *(chọn một)*; IAM và quyền tối thiểu; VPC, subnet, security group; VM và dịch vụ container; Lưu trữ và database được quản lý; Theo dõi chi phí; Serverless *(tuỳ chọn)* |
| D10 | Infrastructure as Code | Khai báo và mệnh lệnh; Terraform hoặc OpenTofu *(chọn một)*; Provider, resource, state; Module và môi trường; Drift và import; Pulumi hoặc CloudFormation *(tuỳ chọn)*; Ansible *(tuỳ chọn)* |
| D11 | Kubernetes cốt lõi | Kiến trúc cụm; Pod, Deployment, ReplicaSet; Service và DNS trong cụm; Ingress và Gateway API; ConfigMap và Secret; Request, limit, QoS; Probe và vòng đời pod; Volume và PersistentVolume; Job, CronJob, StatefulSet, DaemonSet; RBAC và ServiceAccount; NetworkPolicy |
| D12 | Observability | Log, metric, trace; Prometheus và PromQL; Grafana; Loki hoặc ELK *(chọn một)*; OpenTelemetry Collector; Phương pháp RED và USE; Alert theo triệu chứng |

**Cấp Senior:** vận hành ở quy mô, an toàn, đáng tin cậy.

| Mã | Chặng | Chủ đề |
|---|---|---|
| D13 | Vận hành Kubernetes | kubeadm hoặc dịch vụ quản lý *(chọn một)*; Nâng cấp cụm; Sao lưu etcd; Affinity, taint, toleration; Helm hoặc Kustomize *(chọn một)*; HPA, VPA, cluster autoscaler; CRD và Operator; Chẩn đoán sự cố trong cụm |
| D14 | GitOps | Nguyên tắc GitOps; Argo CD hoặc Flux *(chọn một)*; Cấu trúc repo môi trường; Argo Rollouts *(tuỳ chọn)* |
| D15 | DevSecOps | Vault, KMS hoặc External Secrets *(chọn một)*; Quyền tối thiểu trong cloud và cụm; Quét image và IaC trong pipeline; Pod Security Standards; Audit log; OPA Gatekeeper hoặc Kyverno *(tuỳ chọn)* |
| D16 | Độ tin cậy | SLO và error budget; Alert và on-call; Xử lý sự cố; Postmortem không đổ lỗi; Kế hoạch dung lượng; Quá tải và lỗi dây chuyền; Chaos engineering *(tuỳ chọn)* |
| D17 | Sao lưu và khôi phục thảm hoạ | RPO và RTO; Sao lưu và khôi phục database; Diễn tập khôi phục; Sao lưu tài nguyên cụm *(tuỳ chọn)*; Đa vùng *(tuỳ chọn)* |
| D18 | Service mesh *(chặng tuỳ chọn)* | Sidecar và ambient; mTLS tự động; Điều phối lưu lượng; Istio hoặc Linkerd *(chọn một)*; eBPF và Cilium *(tuỳ chọn)* |
| D19 | Platform engineering và FinOps *(chặng tuỳ chọn)* | Internal developer platform; Golden path và template; Gắn tag và phân bổ chi phí; Rightsizing và spot instance; Backstage *(tuỳ chọn)* |

Chặng tuỳ chọn: mọi chủ đề trong đó tính là `opt`; trạm trên trục vẽ nét đứt.

### 7.3 Microservices (18 chặng)

Nên học trước: J11, J12, D6, D7.

**Cấp Nền tảng:** biết khi nào nên tách và tách ở đâu.

| Mã | Chặng | Chủ đề |
|---|---|---|
| M1 | Khi nào nên dùng microservices | Monolith, modular monolith, microservices; Lợi ích và cái giá; Điều kiện tiên quyết; Monolith trước; Định luật Conway |
| M2 | Nền tảng hệ phân tán | Tám ngộ nhận về mạng; Lỗi cục bộ và timeout; CAP và PACELC; Mô hình nhất quán; Thứ tự và đồng hồ; Idempotency; At-least-once và exactly-once |
| M3 | Ranh giới service và DDD | Subdomain; Bounded context; Context map; Ngôn ngữ chung; Kích thước service; Sở hữu theo đội; Event storming *(tuỳ chọn)* |
| M4 | API đồng bộ | REST giữa các service; Versioning và tương thích ngược; Tiến hoá schema; API-first và hợp đồng; gRPC và Protocol Buffers *(tuỳ chọn)*; GraphQL *(tuỳ chọn)* |

**Cấp Middle:** xây hệ thống nhiều service chạy được.

| Mã | Chặng | Chủ đề |
|---|---|---|
| M5 | Messaging và sự kiện | Sự kiện, lệnh, truy vấn; Kafka hoặc RabbitMQ *(chọn một)*; Partition, consumer group, thứ tự; Retry và dead letter queue; Consumer idempotent; Schema registry *(tuỳ chọn)* |
| M6 | Quản lý dữ liệu | Database per service; API composition; CQRS; Domain event; Materialized view; Event sourcing *(tuỳ chọn)* |
| M7 | Saga, outbox và workflow | Vì sao tránh 2PC; Saga choreography; Saga orchestration; Giao dịch bù; Transactional outbox; CDC với Debezium *(tuỳ chọn)*; Temporal hoặc Camunda *(tuỳ chọn)* |
| M8 | API gateway và BFF | Vai trò của gateway; Backend for Frontend; Định tuyến và tổng hợp; Rate limiting; Spring Cloud Gateway hoặc gateway của nền tảng *(chọn một)*; Micro-frontend *(tuỳ chọn)* |
| M9 | Resilience | Timeout; Retry với backoff và jitter; Circuit breaker; Bulkhead; Load shedding và backpressure; Fallback; Resilience4j |
| M10 | Bảo mật giữa các service | OAuth2 và OIDC ở biên; Truyền token giữa service; mTLS; Zero trust; Quyền tối thiểu cho service; Audit |
| M11 | Kiểm thử | Kiểm thử trong một service; Component test; Pact hoặc Spring Cloud Contract *(chọn một)*; Testcontainers cho phụ thuộc; Giữ E2E tối thiểu; Kiểm thử trên production *(tuỳ chọn)* |
| M12 | Discovery và cấu hình | Discovery phía client và phía server; DNS của Kubernetes; Cấu hình tách khỏi code; Secret cho service; Feature flag *(tuỳ chọn)* |
| M13 | Observability phân tán | Correlation ID; Distributed tracing với OpenTelemetry; Gom log; Metric RED cho từng service; Health check; SLO cho từng service; → D12 |

**Cấp Senior:** vận hành, mở rộng và tiến hoá.

| Mã | Chặng | Chủ đề |
|---|---|---|
| M14 | Triển khai độc lập | Một service một pipeline; Canary và blue-green; Tương thích khi lệch phiên bản; Service mesh *(tuỳ chọn)*; Serverless *(tuỳ chọn)*; → D7; → D11 |
| M15 | Tách từ monolith | Strangler fig; Branch by abstraction; Anti-corruption layer; Tách database; Chạy song song và so sánh |
| M16 | Mở rộng | Mở rộng ngang; Cache nhiều tầng; Phân vùng dữ liệu; Backpressure; Autoscaling |
| M17 | Chassis và template *(chặng tuỳ chọn)* | Thư viện dùng chung và cái giá; Sidecar thay cho thư viện; Template tạo service mới; Spring Cloud, Quarkus hoặc Micronaut *(chọn một)* |
| M18 | Tổ chức và tiến hoá kiến trúc | Team Topologies; Quản trị API; Ngừng hỗ trợ API; Kiến trúc tiến hoá và fitness function; ADR |

**Chủ đề giao nhau giữa các roadmap.** Mỗi roadmap dạy theo góc của nó và trỏ sang chỗ dạy đầy đủ:

| Chủ đề | Java | DevOps | Microservices |
|---|---|---|---|
| Observability | J15: gắn instrumentation vào ứng dụng | D12: nền tảng thu thập | M13: lần theo request qua nhiều service |
| Messaging | J16: dùng client trong Spring | | M5: thiết kế luồng sự kiện |

## 8. Dự án

| Dự án | Mốc | Cần học (`needs`) |
|---|---|---|
| Neobank mini | 1 Khám phá miền ngân hàng | M3, J19 |
| | 2 Sổ cái kép và tài khoản | J12, J14, M5 |
| | 3 Chuyển tiền liên ngân hàng và saga | M6, M7, M9 |
| | 4 Thẻ, rủi ro thời gian thực, xử lý cuối ngày | J16, M13, D12 |
| | 5 Bảo mật, tuân thủ, đối soát, khôi phục | J13, M10, D15, D17 |
| Hub hội thoại | 1 Hợp đồng trước, chạy bằng Compose | J11, M4, D6 |
| | 2 Modular monolith lên Kubernetes | J19, D11 |
| | 3 Hướng sự kiện và tự động hoá | M5, D7 |
| | 4 Tách service thật | M3, M15 |
| | 5 Production giả lập | D12, D16, M9 |
| | 6 Quản trị và tổng kết | M18, J20 |

Tên mốc lấy từ dữ liệu hiện có. Phân công `needs` là bản nháp, sẽ chốt khi viết đề cương dự án ở giai đoạn 1.

## 9. Chuyển đổi

| Việc | Chi tiết |
|---|---|
| Nội dung | Xoá `content/roadmaps/senior-backend.json`, thêm ba roadmap. Viết 58 `meta.json` theo mục 7 (đổi tên hoặc tạo thư mục bước). Xoá `b0`–`b4`, `bx`, `j0`, `jx`. Thêm `content/projects/`. Thêm `topics` vào `d1/d1-1.mdx`. Cập nhật `ids.lock.json` (thêm `topics`, `milestones`) |
| Code | `src/lib/content` (schema, repo, manifest, validate), `src/lib/progress` (v2, chuyển đổi, trạng thái suy ra, "học tiếp"), `src/components/roadmap` (sơ đồ, khung chi tiết, danh sách, thẻ danh mục), trang dự án, trang chủ, trang bài học (breadcrumb, thanh bên, chip chủ đề), trang tĩnh cho đường dẫn cũ |
| Tiến độ đã lưu | Tự chuyển v1 → v2; bài D1.1 giữ mã nên không mất gì |
| Tài liệu | `product-vision.md` (bỏ mô tả roadmap chung), `features.md` (FR-ROADMAP, FR-PROJECT, FR-PROGRESS), `architecture.md` (§5 mô hình nội dung, §7 tiến độ), `content-standard.md` (frontmatter `topics`, cách viết chủ đề), `design-direction.md` (link sang file local, sơ đồ mới), `status.md`, `README.md` |
| Thiết kế local | Hoàn thiện trước khi code: `design/roadmap.html` (Java đầy đủ, khung chi tiết chạy được, view danh sách, sáng/tối, desktop/mobile), `design/roadmaps.html`, `design/home.html`, `design/project.html`; cập nhật thanh bên của `lesson-*.html`; `design/index.html` liệt kê mọi trang |
| Artifact cũ | Xoá Design canvas và Design System trên claude.ai sau khi thiết kế local đủ (người dùng đã đồng ý; xác nhận lại lúc xoá) |

## 10. Kiểm thử

**Unit**, viết test trước theo CLAUDE.md:

- **`src/lib/progress`:**
  - chuyển v1 → v2;
  - trạng thái suy ra (tự đặt, đủ mục, một phần, chưa học);
  - "học tiếp" khi có `start`, khi có chủ đề bỏ qua, khi có chủ đề đang học;
  - đếm tiến độ bỏ qua `opt` và chủ đề bị bỏ qua;
  - gộp `topics` khi nhập file.
- **`src/lib/content`:**
  - schema roadmap, bước, dự án;
  - mỗi bước thuộc một roadmap;
  - mã chủ đề duy nhất;
  - tham chiếu `requires`, `links`, `needs`, `recommended` hợp lệ;
  - khoá mã chủ đề và mã mốc;
  - frontmatter `topics` của bài.

**E2E** (Playwright, có axe):

- Trang roadmap hiển thị đủ cấp, chặng, chủ đề.
- Bấm chip mở khung chi tiết, URL đổi; Esc đóng và trả focus.
- Mở thẳng `#mã` thì khung mở sẵn.
- Đặt trạng thái thì số đếm đổi và còn sau khi tải lại trang.
- "Tôi đã biết" thu gọn cấp và đổi "Học tiếp".
- Chuyển view danh sách.
- Mobile 390px: không cuộn ngang, có thanh "Học tiếp" ở đáy.
- Tiến độ v1 có sẵn được giữ sau khi chuyển.
- Đường dẫn cũ `senior-backend` có link tới ba roadmap.
- Axe không có lỗi ở trang roadmap, danh mục, dự án, cả sáng và tối.

**Kiểm tra cuối:** `pnpm verify`, đo JS và HTML gzip của trang roadmap, chạy lại `/impeccable critique` cho trang roadmap.

## 11. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Khoảng 300 chủ đề làm sơ đồ dài, dễ ngợp | Chia cấp, thu gọn cấp đã biết, gộp lựa chọn công cụ thành "chọn một", "Học tiếp" luôn hiện |
| Trùng nội dung giữa các roadmap | `links` và quy tắc "mỗi roadmap dạy theo góc của nó" (mục 7.3) |
| HTML trang roadmap nặng do render sẵn khung chi tiết | Ngân sách 150 KB gzip; nếu vượt, chuyển nội dung khung sang một file JSON tĩnh nhỏ cho mỗi roadmap |
| Mã chủ đề đặt vội rồi phải đổi | Khoá mã ngay từ đầu, đổi tên qua `replacements` |

## 12. Câu hỏi còn mở (không chặn spec này)

- Dự đoán trong `<Predict>` có lưu không (`design-direction.md` §8).
- Phân công `needs` của hai dự án chốt ở giai đoạn 1.
