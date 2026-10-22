# Chuẩn nội dung bài học

Nội dung là sản phẩm chính của Masteva. Tài liệu này định nghĩa một bài học "đạt chuẩn" trông như thế nào, để mọi bài đều **đầy đủ, thực chiến, trực quan và đáng tin**.

## 1. Cấu trúc nội dung

```text
Roadmap        DevOps, từ Linux tới vận hành ở quy mô
└── Cấp        Nền tảng · Middle · Senior
    └── Chặng  D1 · Linux
        ├── Chủ đề  d1.tien-trinh-signal-exit-code (nút trên sơ đồ)
        └── Bài     D1.1 · Tiến trình, signal, systemd, journald
            └── Mục   bài lab: các ý, bước lab, tiêu chí đánh dấu được; bài đọc: một mục `.done`
```

- **Roadmap:** một nhánh (Java, Spring Boot, DevOps, Kubernetes, Microservices) từ nền tảng tới Senior, chia ba cấp.
- **Chặng (bước):** một giai đoạn kiến thức trọn vẹn, ví dụ D1, J5, M3. Một chặng có danh sách chủ đề và nhiều bài.
- **Chủ đề:** một nút trên sơ đồ roadmap, có mã ổn định dạng `<chặng>.<slug>`. Người học có thể tự đánh dấu chủ đề kể cả khi chưa có bài.
- **Bài:** một đơn vị học trọn vẹn, đủ để nắm một nhóm khái niệm. Mỗi bài là bài đọc hoặc bài lab (§1.2).
- **Mục:** đơn vị nhỏ nhất để đánh dấu tiến độ, có mã ổn định. Bài lab có nhiều mục (`<Check>`); bài đọc có đúng một mục `<mã bài>.done` do hệ thống sinh, gắn với nút "Đã học xong bài".

### 1.1 Chủ đề trên sơ đồ

- Chủ đề khai báo trong `topics` của `meta.json` chặng: `id`, `title`, `kind` (`core` mặc định, `pick` kèm `options`, `opt`), `summary` 1–2 câu, `requires`, tối đa 3 `resources`.
- `summary` hiện ở khung chi tiết khi chủ đề chưa có bài, nên phải tự đứng được: 1–2 câu, 25–55 từ, nói chủ đề là gì và ở cấp này người học cần làm được gì. Thuật ngữ giữ tiếng Anh; không quảng cáo, không câu hỏi tu từ. Chỉ ghi phiên bản khi nó quan trọng (ví dụ "từ Java 21").
- `resources`: tài liệu chính thức hoặc chuẩn (docs.oracle.com, dev.java, openjdk.org, RFC, trang tài liệu của công cụ), không blog hay video. `title` là tên thật của trang, `note` một câu tiếng Việt nói nên đọc gì ở đó. Mọi link phải kiểm trả về 200 trước khi thêm. Chủ đề `pick` có tài liệu cho mỗi lựa chọn.
- Mã chủ đề được khoá trong `content/ids.lock.json`; đổi hay gộp thì thêm cặp vào `replacements`.
- Mỗi bài khai báo chủ đề mình bao phủ trong frontmatter `topics` (bắt buộc, ít nhất một). Chủ đề phải thuộc chặng của bài, hoặc chặng có trong `links`.
- Chủ đề chung giữa các roadmap chỉ dạy đầy đủ ở một nơi; nơi khác dùng `links` trỏ sang.

### 1.2 Dạng bài

Frontmatter mỗi bài có `kind` bắt buộc. Quyết định ở ADR-0011.

| | Bài đọc (`kind: reading`) | Bài lab (`kind: lab`) |
|---|---|---|
| Khung | Mục tiêu → Kiến thức → Tài liệu (§3) | 6 phần (§2) |
| Đánh dấu tiến độ | Một nút "Đã học xong bài", trang tự thêm | `<Check>` cho từng ý, từng bước |
| Thực hành | Ở dự án; ôn phỏng vấn ở bộ câu hỏi phỏng vấn | Lab trong bài |
| Dùng cho | Java, Spring Boot, Microservices; bài DevOps thuần lý thuyết | DevOps, Kubernetes |

`pnpm content:check` báo lỗi khi bài thiếu `kind`, khi bài đọc sai thứ tự ba phần hoặc có `<Check>`, và khi bài lab thiếu một trong 6 phần.

### 1.3 Công nghệ cố ý không dạy

- Roadmap ghi trong `notTaught` của `content/roadmaps/<roadmap>.json` những công nghệ phổ biến (thường có trên roadmap.sh) mà roadmap cố ý không dạy. Trang roadmap hiện danh sách này dưới phần mô tả.
- Mỗi mục có `name` và `reason`. `reason` 1–2 câu: vì sao không dạy, và thứ được dạy thay nằm ở chặng nào.
- Gom vào một mục những công nghệ cùng vai trò và cùng lý do (ví dụ "Log4j2, TinyLog").

## 2. Khung 6 phần của bài lab

Mọi bài lab có đủ 6 phần theo đúng thứ tự. Bài đọc dùng khung ba phần ở §3.

### 2.1 Mục tiêu

- 1–3 câu: học xong người học **hiểu được gì và làm được gì**.
- Nêu rõ bài này giải thích những tình huống thực tế nào.
  - Ví dụ: "Vì sao `docker stop` mất 10 giây, vì sao pod báo exit code 137."

### 2.2 Kiến thức

- Giải thích **từ nền lên**, theo thứ tự: cái gì → vì sao tồn tại → bên dưới chạy thế nào → dùng khi nào → sai ở đâu.
- Mỗi khái niệm có ít nhất một trong ba thứ: **ví dụ cụ thể**, **bảng so sánh**, **sơ đồ**.
- Cơ chế có nhiều bước hoặc nhiều thành phần tương tác **bắt buộc có sơ đồ**.
- Có ít nhất một callout **Trên production**, nối kiến thức với một tình huống có thật.
- Thuật ngữ giữ tiếng Anh, có giải nghĩa tiếng Việt ở lần xuất hiện đầu tiên.

### 2.3 Tài liệu

- Chỉ đưa nguồn **chính thức hoặc kinh điển**, kèm ghi chú **đọc phần nào, vì sao**.
- Không bắt buộc đọc: bài học phải tự đủ để học. Phần này là "đọc thêm để đi sâu".
- Tối đa 3–5 nguồn mỗi bài.

### 2.4 Thực hành

- Lab chạy được trên máy người học, đi theo cấu trúc:
  1. **Chuẩn bị:** điều kiện đầu vào, ví dụ "VM Lima đang chạy".
  2. **Các bước:** mỗi bước gồm mục đích, lệnh, **nơi chạy** (Mac, VM, container, pod), kết quả mong đợi, giải thích.
  3. **Đoán trước** ở những chỗ kết quả đáng ngạc nhiên.
  4. **Gỡ lỗi:** các lỗi hay gặp và cách sửa.
  5. **Dọn dẹp:** trả lại tài nguyên, xoá thứ đã tạo.
- Code dài đặt trong repo mẫu, bài học chỉ trích phần quan trọng.
- Trong khối `<Terminal where="mac">` không viết chú thích `#` ngoài thân heredoc: zsh tương tác của macOS không coi `#` là chú thích, nên `sleep 5   # chờ…` thành lỗi và không chờ gì. Lời giải thích đặt ở văn bản quanh khối lệnh. `pnpm content:check` chặn lỗi này.

### 2.5 Đào sâu

- 3–5 câu hỏi mở dẫn người học tới hiểu biết sâu hơn, mỗi câu có **lời giải thích ẩn** bấm để xem.
- Callout **Khi làm cùng AI**:
  - Nên nhờ AI làm gì ở chủ đề này.
  - AI hay sai ở đâu.
  - Cách kiểm tra lại kết quả AI đưa ra.
- Callout **Liên hệ bài khác**: kiến thức này được dùng lại ở bước nào.

### 2.6 Dấu hiệu đã nắm chắc

- 2–4 câu bắt đầu bằng động từ quan sát được: "Kể được…", "Giải thích được…", "Tự viết được…".
- Mỗi câu là một mục đánh dấu được.

## 3. Bài đọc

Bài đọc dạy kiến thức mà không có lab đi kèm, nên phần Kiến thức phải tự làm được việc của lab: cho người học thấy khái niệm vận hành qua ví dụ code và output thật. Các quy tắc dưới đây rút từ nghiên cứu `docs/research/cach-trinh-bay-bai-doc.md`; mã trong ngoặc (ví dụ 1.3) là mã khuyến nghị trong file đó.

### 3.1 Khung ba phần

- Đúng ba component theo thứ tự: `<Goal>`, `<Knowledge>`, `<Resources>`. Không có `<Practice>`, `<DeepDive>`, `<Mastery>`, không có `<Check>`. Không tự viết tiêu đề cho ba phần.
- **Mục tiêu:** một câu nói học xong làm được gì, rồi "Học xong bài này, bạn giải thích được:" kèm 2–4 gạch đầu dòng, mỗi dòng là một tình huống bài trả lời (8.6). Ví dụ: "Vì sao xoá phần tử trong vòng for-each ném `ConcurrentModificationException`, dù chỉ có một thread."
- **Kiến thức:** theo §3.2–§3.5. Kết thúc bằng hai callout `ai` và `link`.
- **Tài liệu:** như §2.3. Phần tra cứu bài không chép (danh sách method đầy đủ, mọi tuỳ chọn cấu hình) trỏ sang Javadoc hoặc reference ở đây, ghi rõ đọc mục nào.
- Nút "Đã học xong bài" do trang tự thêm; tác giả không viết gì cho nó.
- Không có phần câu hỏi ôn cuối bài (chủ dự án quyết ngày 22/10/2026). Truy xuất trong bài dùng "Đoán trước" và câu nhắc tự giải thích (§3.2).
- Gợi ý, không phải quy định: bài cần hơn khoảng 30–40 phút đọc tập trung thì cân nhắc tách thành hai bài (2.6).

### 3.2 Phần Kiến thức

**Đề mục:**

- Mỗi khái niệm là một `###`. Đề mục `###` chỉ đặt trong `<Knowledge>`: mục lục của bài đọc lồng chúng dưới mục Kiến thức. `####` chỉ dùng khi thật cần (7.1).
- Đề mục là cụm danh từ hoặc một câu nêu điều rút ra, ví dụ "`TreeSet` tin vào `compare`, không tin `equals`". Không đặt link, không để một tên method trần làm đề mục (7.2).
- Sau mỗi đề mục có lời dẫn. Không đặt hai đề mục liền nhau, không có mục con đơn lẻ (7.3).
- Mỗi `###` là một khúc đọc trọn vẹn: khúc sau được dựa vào khúc trước, nhưng không cắt một ý ra hai khúc (7.5).

**Thứ tự trong mỗi khái niệm.** Khung "cái gì → vì sao → cơ chế → dùng khi nào → sai ở đâu" của §2.2 vẫn là lõi, với hai thay đổi: mở bằng một tình huống cụ thể, và "sai ở đâu" nằm ngay trong khái niệm nó thuộc về. Thứ tự này áp cho **từng** `###`, không phải năm mục lớn của cả bài.

| Bước | Viết gì | Khi nào |
|---|---|---|
| a. Tình huống | 1–3 câu: một output lạ, một lỗi quen, một câu hỏi phỏng vấn (1.1) | Bắt buộc |
| b. Định nghĩa | Một câu. Thuật ngữ in đậm ở lần đầu, giữ tiếng Anh, giải nghĩa tiếng Việt. Một tên cho một khái niệm suốt bài (1.2) | Bắt buộc |
| c. Thành phần | Bảng "thành phần \| vai trò" 3–5 dòng, đặt trước luồng tương tác và sơ đồ (1.4) | Cơ chế có nhiều thành phần |
| d. Ví dụ | Code kèm output theo §3.3. Ví dụ đi trước, quy tắc và tên của nó (ví dụ "fail-fast") đi sau (1.3) | Bắt buộc, trừ khái niệm thuần thiết kế |
| e. Vì sao và cơ chế | Quyết định thiết kế, ràng buộc, lựa chọn thay thế; bên dưới chạy thế nào; sơ đồ theo §3.4 (1.6) | Bắt buộc |
| f. Dùng khi nào | So sánh với lựa chọn khác; bảng khi từ ba lựa chọn | Khi có lựa chọn khác |
| g. Sai ở đâu | Refutation, xem dưới | Khi có quan niệm sai phổ biến |
| h. Trên production | Callout theo §3.5 | Tuỳ |
| i. Câu chốt | 1–2 câu nêu ý chính ở cuối mục (7.4, 8.4) | Mục dài |

**Sai lầm thường gặp** viết theo cấu trúc refutation (6.1, 6.4):

1. Nêu quan niệm sai bằng lời người học hay nghĩ, một lần, ngắn, không in đậm.
2. Nói rõ là sai.
3. Giải thích cơ chế khiến nó sai. Đây là phần mang hiệu quả, chiếm phần lớn dung lượng.
4. Output chứng minh.
5. Cách đúng.

- Đặt sai lầm ngay sau cơ chế nó thuộc về. Không gom thành mục "Lỗi thường gặp" ở cuối bài (6.2).
- Bẫy code quan trọng: đặt cặp sai/đúng cạnh nhau (hai khối liền nhau hoặc bảng hai cột), chỉ ra điểm khác, rồi mới phát biểu nguyên tắc (3.6).
- Trường hợp biên không gắn với quan niệm sai (`null`, collection rỗng, phần tử trùng, tràn số): viết thẳng điều kiện → hành vi → output, ngay sau ví dụ chính. Nhiều trường hợp cùng loại thì gom thành bảng "đầu vào \| hành vi". Chỉ đưa trường hợp làm đổi cách dùng hoặc hay gây lỗi; liệt kê đủ thì trỏ Javadoc (6.6).
- Ưu tiên những hành vi khó đoán mà tài liệu chính thức không nói rõ, giải thích bằng quyết định thiết kế và có output làm dẫn chứng (6.3).

**Truy xuất trong bài:**

- **Đoán trước:** 1–3 chỗ mỗi bài, đặt ở output gây bất ngờ. Dùng `<Predict question="…">` bọc khối output; đáp án và giải thích nằm ngay sau (8.1).
- **Tự giải thích:** ở 1–2 chỗ khó nhất bài, một câu nhắc người học tự trả lời trước khi đọc tiếp, ví dụ "Thử tự trả lời: vì sao `hasNext()` trả `false` ở đây?". Không nhắc ở mọi mục (8.3).

**Ranh giới với hướng dẫn và tra cứu:** phần Kiến thức không chứa thủ tục từng bước và không chép bảng API đầy đủ. Bảng method chỉ giữ những method cần cho lập luận của bài (1.7).

**Đoạn, câu, bảng:**

- Câu đầu của đoạn nêu ý chính. Đoạn 2–5 câu, không quá 6; nhiều đoạn một câu liền nhau thì gộp lại hoặc chuyển thành danh sách (2.1, 2.2).
- Một ý một câu. Câu có "hoặc", hoặc liệt kê từ ba thứ trở lên, thì chuyển thành danh sách (2.3). Danh sách có thứ tự chỉ dùng khi thứ tự có nghĩa; các mục song song về ngữ pháp (5.4).
- Mỗi đoạn trả lời được ba câu: đang nói gì, vì sao người học cần biết, dùng hay kiểm chứng điều đó thế nào (2.4).
- Cắt chi tiết không phục vụ mục tiêu bài: giai thoại, lịch sử không giải thích được hành vi hiện tại (2.5).
- Bảng khi so sánh từ ba thứ, hoặc hai thứ theo từ ba thuộc tính. Ô bảng không quá hai câu, có câu dẫn trước bảng. Chuỗi nhân quả ("vì A nên B, nên C") viết bằng văn xuôi, không chặt vào ô bảng (5.1–5.3).

### 3.3 Ví dụ code và output

- Mỗi khối code minh hoạ **một** điểm, khoảng 5–20 dòng, biên dịch và chạy được. Không viết sai để cho ngắn. Dài hơn thì tách khối (3.1).
- Phần lược bỏ ghi bằng comment hợp lệ của ngôn ngữ (`// các field khác`), không dùng `...` hay `(...)` (3.2).
- Trước code có lời dẫn: đoạn code làm gì, cần để ý chỗ nào. Ngay dưới code là câu "Kết quả:" và khối ` ```text ` chứa output. Output 1–2 dòng có thể ghi bằng comment ngay cạnh dòng in (`// in ra: 3`). Sau output có 1–3 câu nói cách đọc output và điều nó chứng minh (3.3, 3.4).
- Comment trong code chỉ dành cho chỗ không hiển nhiên và nói "vì sao". Văn quanh code không kể lại điều comment đã nói (3.5).
- Đi từ ví dụ tối thiểu → ví dụ gần thực tế → trường hợp biên. Ví dụ **tối thiểu** (nhỏ, cô lập một cơ chế) được phép; ví dụ **đồ chơi** (vô nghĩa, không gắn thực tế) thì không (1.5, 3.8).
- Dùng một bối cảnh xuyên suốt chặng, ví dụ `Product` và giỏ hàng ở J5. Khi cần cho thấy quy tắc là chung, thêm một ví dụ có bề mặt khác. Khi ví dụ chỉ bao phủ một phần cách dùng, ghi rõ phần nó không bao phủ (3.7, 3.8).
- Output là output thật, chạy với phiên bản ghi trong `verified`. Phần thay đổi giữa các lần chạy (hash, thời gian, thứ tự phần tử của `Set.of`) ghi rõ là sẽ khác (3.9).
- Mỗi `###` đọc hiểu được theo hai cách: chỉ đọc văn, hoặc chỉ lướt code và output. Lời dẫn và câu đọc output là cầu nối giữa hai cách (3.10).
- Lệnh shell (ví dụ `java Main.java`) đặt trong `<Terminal where="…">`, theo cùng quy định với bài lab (§2.4).

### 3.4 Sơ đồ

- Bắt buộc có sơ đồ khi có từ ba thành phần tương tác trở lên, hoặc khi thứ tự theo thời gian quyết định kết quả: proxy của Spring, vòng đời persistence context, luồng một request (4.1).
- Viết trước một câu chú thích nêu điều người đọc phải nhớ, rồi mới vẽ. Một sơ đồ không nên cần quá một đoạn hay khoảng 5 gạch đầu dòng để giải thích. Hệ phức tạp thì vẽ một sơ đồ tổng quan và các sơ đồ chi tiết (4.2).
- Nhãn đặt ngay trên hoặc cạnh phần tử, không dùng số chú thích tra ở chỗ khác (4.3).
- Văn quanh sơ đồ không kể lại từng mũi tên, chỉ nêu điểm cần chú ý và vì sao (4.4).
- Dùng tín hiệu (`◄`, chữ đậm, khung) cho đúng một hai điểm then chốt. Không thêm hình trang trí, không phân biệt thông tin chỉ bằng màu (4.5, 4.6).

### 3.5 Callout

Viết thông tin thành văn thường trước, chỉ đưa vào callout khi thật cần. Thông tin người học cần để hiểu bài không đặt trong callout. Không đặt hai callout liền nhau, không lồng callout, không lặp lại tiêu đề callout trong thân.

| `kind` | Tiêu đề hiển thị | Dùng cho | Số lượng | Chỗ đặt |
|---|---|---|---|---|
| `production` | Trên production | Một tình huống thật có hậu quả quan sát được (sự cố, số đo, câu hỏi khách hàng), nối thẳng với khái niệm vừa học; không phải giai thoại | 1–2 mỗi bài, tối đa 1 mỗi `###` | Trong `###` của khái niệm đó, sau phần cơ chế |
| `pitfall` | Lỗi hay gặp | Bẫy ngắn, đứng riêng được. Bẫy cần giải thích cơ chế thì viết trong thân bài | 0–2 mỗi bài | Cạnh chỗ dễ sai |
| `danger` | Cảnh báo | Lệnh phá huỷ dữ liệu, đứng trước lệnh | Hiếm | Ngay trước lệnh |
| `ai` | Khi làm cùng AI | Nên nhờ AI làm gì ở chủ đề này, AI hay sai ở đâu, cách kiểm tra lại | Đúng 1 | Cuối `<Knowledge>` |
| `link` | Liên hệ bài khác | Bài nào dùng lại kiến thức này và dùng thế nào. Khi viết bài sau, nhắc lại ngắn kiến thức cũ thay vì giả định người học còn nhớ (8.5) | Đúng 1 | Ngay sau `ai`, khép `<Knowledge>` |

Cặp `ai` và `link` liền nhau ở cuối `<Knowledge>` là ngoại lệ có chủ đích của quy tắc "không hai callout liền nhau": chúng khép bài, không chen giữa luồng đọc.

### 3.6 Chuyển một bài lab cũ thành bài đọc

1. **Chép câu hỏi–lời giải** của phần Đào sâu vào nguồn câu hỏi phỏng vấn của roadmap (§3.7), trước khi sửa gì khác. Bài đã bị cắt phần Đào sâu từ trước (J5.3, ở commit 057f45d) thì lấy bản cũ từ Git: `git show 057f45d^:content/steps/j5/j5-3.mdx`.
2. Đổi frontmatter `kind: lab` thành `kind: reading`.
3. **Nhập kiến thức của phần Đào sâu** vào phần Kiến thức. Ý của mỗi câu hỏi–lời giải đi vào `###` của khái niệm nó thuộc về (hoặc thành một `###` mới), viết lại theo §3.2, không giữ dạng hỏi–đáp.
4. **Nhập phát hiện từ lab:** mỗi hiện tượng lab cho người học thấy (output lạ, lỗi, số đo) thành kiến thức kèm một ví dụ tối thiểu và output tiêu biểu, chạy lại thật. Viết như kiến thức ("Kết quả sẽ giống thế này"), không viết "khi chạy lab, bạn thấy". Bỏ phần chuẩn bị môi trường, dọn dẹp và gỡ lỗi môi trường. Giữ 1–3 chỗ "Đoán trước" đáng giá nhất của lab.
5. Chuyển hai callout `ai` và `link` xuống cuối `<Knowledge>`; sửa câu nào còn nói về lab.
6. Gỡ `<Practice>`, `<DeepDive>`, `<Mastery>` và mọi `<Check>`. Lab cũ vẫn còn trong lịch sử Git.
7. **Xoá mã mục cũ:** xoá mọi mã mục cũ của bài (`<mã bài>.<slug>`) khỏi danh sách `ids` của `content/ids.lock.json`, không thêm vào `replacements`. Đây là lần đặt lại một lần theo ADR-0011, chỉ áp cho lần chuyển bài lab sang bài đọc; mọi thay đổi khác vẫn theo BR-003. Sau đó chạy `pnpm content:lock` để khoá mã `<mã bài>.done`. Bài đã đặt lại từ trước (J5.3) thì bỏ qua bước này.
8. Chạy lại mọi đoạn code và lệnh, cập nhật `verified` theo §5.

### 3.7 Nguồn câu hỏi phỏng vấn

Câu hỏi–lời giải của phần Đào sâu được giữ lại làm nguồn cho bộ câu hỏi phỏng vấn sau này. Nguồn không hiển thị trên trang và `content:check` không đọc nó.

- Mỗi roadmap một file Markdown thường (không phải MDX): `content/interview/<roadmap>.md`, ví dụ `java.md`, `spring-boot.md`. Roadmap của bài xác định theo `content/roadmaps/*.json`, không theo tên thư mục (chặng `j11` thuộc Spring Boot).
- Câu hỏi nhóm theo bài gốc. Mỗi bài là một đề mục `##` ghi mã bài (`id` trong frontmatter) và tên bài; nhóm xếp theo thứ tự bài trên roadmap.
- Mỗi câu là một đề mục `###` chép nguyên `title` của `<Reveal>`, thân là lời giải chép nguyên văn. Không sửa, không rút gọn; biên tập là việc của spec bộ câu hỏi phỏng vấn.
- Callout `ai` và `link` của phần Đào sâu không chép vào đây, vì chúng đã chuyển sang bài đọc.

```markdown
# Câu hỏi phỏng vấn: Java

Nguồn cho bộ câu hỏi phỏng vấn, chép từ phần Đào sâu khi chuyển bài lab sang bài đọc. Chưa hiển thị trên trang.

## j5.2 · Generics, wildcard và PECS

### Mảng thì List[] được gán cho Object[], sao generics lại cấm?

Mảng trong Java là **hiệp biến** (covariant): …(lời giải chép nguyên văn)
```

## 4. Quy tắc viết

| Quy tắc | Đúng | Sai |
|---|---|---|
| Tự chứa | Giải thích đủ để hiểu (bài đọc) hoặc làm lab (bài lab) mà không cần mở link | "Xem tài liệu chính thức để biết cách cấu hình" |
| Cụ thể | "Exit code 137 = 128 + 9, tức chết vì SIGKILL" | "Exit code cho biết lý do tiến trình dừng" |
| Có lý do | "Dùng `--context` để lệnh không chạy nhầm sang cụm công ty" | "Thêm `--context kind-lab`" |
| Thực chiến | Tình huống từ hệ thống thật: Dockerfile, sự cố, số đo | Ví dụ đồ chơi không gắn với thực tế |
| Ngắn gọn | Câu ngắn, một ý một câu, bảng khi so sánh từ ba thứ trở lên | Đoạn văn dài nhiều ý |
| Trung thực | Ghi "chưa chắc chắn" hoặc dẫn nguồn khi có thể sai | Khẳng định không có căn cứ |

**Giọng văn (bản tiếng Việt):** tiếng Việt tự nhiên, giọng một đồng nghiệp hiểu biết, không dùng từ ngữ quảng cáo, không phóng đại.

- Xưng "bạn"; khi bảo người học làm gì thì dùng câu mệnh lệnh. Không dùng "chúng ta" cho người viết và người đọc (10.1).
- Câu chủ động, thì hiện tại: "`TreeSet` bỏ qua phần tử", không viết "phần tử sẽ bị bỏ qua bởi `TreeSet`" (10.3).
- Tránh "dễ dàng", "đơn giản", "chỉ cần", "đơn thuần", "hiển nhiên", "rõ ràng là" (10.4). Không đùa cợt, không dấu chấm than (10.2).
- Tránh thành ngữ, ẩn dụ văn hoá, chơi chữ: bài sẽ được dịch (10.5).

### 4.1 Dạy người học, không kể chuyện người viết

Bài viết cho người đang học, theo thứ tự họ làm: sắp làm gì, vì sao, gõ gì, sẽ thấy gì, điều đó nghĩa là gì. Người học chỉ thấy bài; họ không thấy các lần chạy của người viết, nên bài không được dựa vào những lần chạy đó.

| Đúng | Sai |
|---|---|
| "Kết quả sẽ giống thế này. Số giây trên máy bạn sẽ khác, thường trong khoảng 20–60 giây tuỳ máy bận hay rảnh." | "Trên máy kiểm chứng, ba lượt chạy cho 24, 41 và 58 giây." |
| Thêm một bước để người học tự thấy hiện tượng, hoặc nêu nó như kiến thức có nguồn | "Khi soạn bài đã thử X và thấy Y" (người học không làm X) |
| "Nếu lệnh dừng ở `Pending` quá 2 phút, xem mục Gỡ lỗi." | "Lượt chạy thứ hai của bài từng kẹt ở `Pending`." |
| Thông tin kiểm chứng (ngày, hệ điều hành, phiên bản) nằm ở frontmatter `verified` | Lặp lại trong thân bài "bài được kiểm chứng trên máy … ngày …" |

- **Giải thích trước khi dùng:** thuật ngữ mới có một câu định nghĩa ở lần đầu xuất hiện; ví dụ cụ thể đi trước khái quát.
- **Lời dẫn quanh khối lệnh:** trước khối lệnh nói người học sắp làm gì và cần để ý gì; sau output nói cách đọc output.
- **Giới hạn của bài** (chưa chạy trên Linux, cần máy nhiều RAM…) viết ngắn ở một chỗ (profile máy ở phần Chuẩn bị hoặc mục Gỡ lỗi) và hướng tới việc người học cần làm.
- **Duyệt bài có một lượt đọc như người học:** đọc từ đầu tới cuối như người lần đầu học chủ đề, chưa làm lab, chỉ biết những gì bài này và các bài trước đã dạy; đánh dấu chỗ khó hiểu, chỗ nhảy bước, thuật ngữ chưa giải thích, câu kể chuyện người viết. Với bài đọc, kiểm thêm từng khối code đã có output và câu đọc output chưa.

## 5. Kiểm chứng nội dung

Một bài đi qua ba trạng thái:

| Trạng thái | Điều kiện | Hiển thị cho người học |
|---|---|---|
| **Nháp** | Đã viết đủ các phần theo dạng bài | Có nhãn "Nháp, chưa kiểm chứng" |
| **Đã kiểm chứng** | Mọi lệnh và code đã chạy thành công trên môi trường ghi trong metadata; kiến thức đã được rà lại với nguồn chính thức | Nhãn "Đã kiểm chứng ngày …, với phiên bản …" |
| **Cần cập nhật** | Công cụ ra phiên bản mới làm thay đổi kết quả, hoặc có lỗi được báo | Nhãn cảnh báo và mô tả phần có thể đã cũ |

**`verified` của bài đọc:** mọi đoạn code và output trong bài đã chạy thật với phiên bản ghi trong `verified` (ngày, hệ điều hành, phiên bản công cụ), và mọi khẳng định về hành vi API có tài liệu chính thức hoặc output trong bài làm dẫn chứng. Khẳng định chỉ dựa vào tài liệu chính thức thì trỏ tới tài liệu đó, ở phần Tài liệu hoặc ngay trong câu. Thiếu một trong hai thì bài để `status: draft`.

**Ngoại lệ khi kiểm chứng** (người dùng chấp nhận ngày 03/10/2026): lệnh cài đặt làm thay đổi hệ thống (`brew install`, trình cài gói) và lệnh dọn dẹp cuối bài (`rm -rf` thư mục lab) không bắt buộc chạy thật, miễn là lệnh cài đã được kiểm bằng chế độ thử (ví dụ `--dry-run`) và lệnh dọn dẹp chỉ xoá thứ bài vừa tạo. Bước chỉ làm được trên giao diện (IDE, JDK Mission Control) được chấp nhận khi điều nó khẳng định đã được kiểm bằng công cụ dòng lệnh tương đương, ví dụ `jdb` thay cho debugger của IDE, `jfr print` thay cho JMC (người dùng chấp nhận ngày 04/10/2026).

**Metadata bắt buộc của mỗi bài:**
- Mã bài (ví dụ `d1.1`), roadmap, bước.
- Bài tiên quyết.
- Môi trường kiểm chứng (hệ điều hành, phiên bản công cụ).
- Ngày kiểm chứng.
- Trạng thái.

## 6. Quy trình sản xuất một bài

1. **Dàn ý:** mục tiêu, danh sách khái niệm, lab dự kiến (bài lab), sơ đồ cần vẽ.
2. **Viết nháp** theo khung của dạng bài (§2 hoặc §3). AI được dùng để hỗ trợ viết nháp, người viết chịu trách nhiệm về độ chính xác.
3. **Chạy lab** (bài lab) hoặc mọi đoạn code (bài đọc) trên môi trường sạch, ghi lại output thật để làm "kết quả mong đợi".
4. **Rà kiến thức** với nguồn chính thức; sửa chỗ sai hoặc chưa rõ.
5. **Học thử:** một người chưa biết chủ đề học theo bài và ghi lại chỗ vướng. Ở giai đoạn đầu, người học thử là người sáng lập.
6. **Kiểm tra tự động** khi build: đủ các phần theo dạng bài, link không hỏng, mã mục không trùng.
7. **Đánh dấu "đã kiểm chứng"** và phát hành.

## 7. Bản quyền và nguồn

- Không chép nguyên văn sách, khoá học hay tài liệu có bản quyền. Diễn giải bằng lời của mình và dẫn nguồn.
- Trích dẫn ngắn khi thật cần, có ghi tác giả.
- Sơ đồ tự vẽ; không dùng lại hình của người khác nếu không có giấy phép.
- Code mẫu tự viết; nếu dựa trên code mã nguồn mở thì tuân thủ giấy phép của nó.

## 8. Đa ngôn ngữ

- Bản gốc viết bằng tiếng Việt; các ngôn ngữ khác là bản dịch.
- Bản dịch giữ nguyên mã bài và mã mục, code, lệnh, output và sơ đồ (chỉ dịch chữ trong sơ đồ).
- Mỗi bản dịch ghi lại phiên bản bản gốc mà nó dựa vào, để biết khi nào bản dịch đã cũ.
- Lab không cần kiểm chứng lại khi dịch, trừ khi bản dịch thay đổi lệnh.

## 9. Ví dụ dàn ý bài lab: D1.1

| Phần | Nội dung |
|---|---|
| Mục tiêu | Hiểu tiến trình sống và chết thế nào trên Linux; giải thích được `docker stop` mất 10 giây, exit code 137 và 143, khi nào shutdown hook của JVM chạy |
| Kiến thức | PID, PPID, fork/exec, cây tiến trình, trạng thái R/S/D/Z/T; bảng signal; công thức exit code 128+N; PID 1 trong container và vai trò của `exec` trong ENTRYPOINT; systemd unit và journald. Sơ đồ: luồng `docker stop` → SIGTERM → shutdown hook → SIGKILL khi quá hạn |
| Tài liệu | *The Linux Command Line* chương 10; `man 7 signal` phần Standard signals; Arch Wiki systemd |
| Thực hành | Trong VM Lima: xem cây tiến trình; script bắt SIGTERM và so sánh exit code 0, 137, 143; tạo zombie; viết unit systemd, xem log, thử `Restart=on-failure`; dọn dẹp |
| Đào sâu | Vì sao không bắt được SIGKILL; tiến trình ở trạng thái D; container không dùng `exec`; `docker run --init`; Kafka consumer khi nhận SIGTERM. Khi làm cùng AI: AI hay quên `exec` trong ENTRYPOINT và hay bỏ graceful shutdown |
| Dấu hiệu nắm chắc | Kể được chuỗi `docker stop`; nhìn exit code biết lý do; tự viết unit systemd và đọc log |

Nội dung chi tiết của bài này đã được soạn trong quá trình học và sẽ là bài mẫu đầu tiên chuyển vào Masteva.
