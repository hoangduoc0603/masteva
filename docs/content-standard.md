# Chuẩn nội dung bài học

Nội dung là sản phẩm chính của Masteva. Tài liệu này định nghĩa một bài học "đạt chuẩn" trông như thế nào, để mọi bài đều **đầy đủ, thực chiến, trực quan và đáng tin**.

## 1. Cấu trúc nội dung

```text
Roadmap        DevOps, từ Linux tới vận hành ở quy mô
└── Cấp        Nền tảng · Middle · Senior
    └── Chặng  D1 · Linux
        ├── Chủ đề  d1.tien-trinh-signal-exit-code (nút trên sơ đồ)
        └── Bài     D1.1 · Tiến trình, signal, systemd, journald
            └── Mục   các ý kiến thức, lab, tiêu chí có thể đánh dấu
```

- **Roadmap:** một nhánh (Java, DevOps hoặc Microservices) từ nền tảng tới Senior, chia ba cấp.
- **Chặng (bước):** một giai đoạn kiến thức trọn vẹn, ví dụ D1, J5, M3. Một chặng có danh sách chủ đề và nhiều bài.
- **Chủ đề:** một nút trên sơ đồ roadmap, có mã ổn định dạng `<chặng>.<slug>`. Người học có thể tự đánh dấu chủ đề kể cả khi chưa có bài.
- **Bài:** một đơn vị học trọn vẹn, đủ để nắm một nhóm khái niệm và làm được lab của nó.
- **Mục:** đơn vị nhỏ nhất để đánh dấu tiến độ, có mã ổn định.

### 1.1 Chủ đề trên sơ đồ

- Chủ đề khai báo trong `topics` của `meta.json` chặng: `id`, `title`, `kind` (`core` mặc định, `pick` kèm `options`, `opt`), `summary` 1–2 câu, `requires`, tối đa 3 `resources`.
- `summary` hiện ở khung chi tiết khi chủ đề chưa có bài, nên phải tự đứng được: 1–2 câu, 25–55 từ, nói chủ đề là gì và ở cấp này người học cần làm được gì. Thuật ngữ giữ tiếng Anh; không quảng cáo, không câu hỏi tu từ. Chỉ ghi phiên bản khi nó quan trọng (ví dụ "từ Java 21").
- `resources`: tài liệu chính thức hoặc chuẩn (docs.oracle.com, dev.java, openjdk.org, RFC, trang tài liệu của công cụ), không blog hay video. `title` là tên thật của trang, `note` một câu tiếng Việt nói nên đọc gì ở đó. Mọi link phải kiểm trả về 200 trước khi thêm. Chủ đề `pick` có tài liệu cho mỗi lựa chọn.
- Mã chủ đề được khoá trong `content/ids.lock.json`; đổi hay gộp thì thêm cặp vào `replacements`.
- Mỗi bài khai báo chủ đề mình bao phủ trong frontmatter `topics` (bắt buộc, ít nhất một). Chủ đề phải thuộc chặng của bài, hoặc chặng có trong `links`.
- Chủ đề chung giữa các roadmap chỉ dạy đầy đủ ở một nơi; nơi khác dùng `links` trỏ sang.

## 2. Khung 6 phần của một bài

Mọi bài đều có đủ 6 phần theo đúng thứ tự.

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

## 3. Quy tắc viết

| Quy tắc | Đúng | Sai |
|---|---|---|
| Tự chứa | Giải thích đủ để làm lab mà không cần mở link | "Xem tài liệu chính thức để biết cách cấu hình" |
| Cụ thể | "Exit code 137 = 128 + 9, tức chết vì SIGKILL" | "Exit code cho biết lý do tiến trình dừng" |
| Có lý do | "Dùng `--context` để lệnh không chạy nhầm sang cụm công ty" | "Thêm `--context kind-lab`" |
| Thực chiến | Tình huống từ hệ thống thật: Dockerfile, sự cố, số đo | Ví dụ đồ chơi không gắn với thực tế |
| Ngắn gọn | Câu ngắn, một ý một câu, bảng khi so sánh từ ba thứ trở lên | Đoạn văn dài nhiều ý |
| Trung thực | Ghi "chưa chắc chắn" hoặc dẫn nguồn khi có thể sai | Khẳng định không có căn cứ |

**Giọng văn (bản tiếng Việt):** tiếng Việt tự nhiên, xưng "bạn", không dùng từ ngữ quảng cáo, không phóng đại.

## 4. Kiểm chứng nội dung

Một bài đi qua ba trạng thái:

| Trạng thái | Điều kiện | Hiển thị cho người học |
|---|---|---|
| **Nháp** | Đã viết đủ 6 phần | Có nhãn "Nháp, chưa kiểm chứng" |
| **Đã kiểm chứng** | Mọi lệnh và code đã chạy thành công trên môi trường ghi trong metadata; kiến thức đã được rà lại với nguồn chính thức | Nhãn "Đã kiểm chứng ngày …, với phiên bản …" |
| **Cần cập nhật** | Công cụ ra phiên bản mới làm thay đổi kết quả, hoặc có lỗi được báo | Nhãn cảnh báo và mô tả phần có thể đã cũ |

**Ngoại lệ khi kiểm chứng** (người dùng chấp nhận ngày 03/10/2026): lệnh cài đặt làm thay đổi hệ thống (`brew install`, trình cài gói) và lệnh dọn dẹp cuối bài (`rm -rf` thư mục lab) không bắt buộc chạy thật, miễn là lệnh cài đã được kiểm bằng chế độ thử (ví dụ `--dry-run`) và lệnh dọn dẹp chỉ xoá thứ bài vừa tạo. Bước chỉ làm được trên giao diện (IDE) không thuộc ngoại lệ này.

**Metadata bắt buộc của mỗi bài:**
- Mã bài (ví dụ `d1.1`), roadmap, bước.
- Bài tiên quyết.
- Môi trường kiểm chứng (hệ điều hành, phiên bản công cụ).
- Ngày kiểm chứng.
- Trạng thái.

## 5. Quy trình sản xuất một bài

1. **Dàn ý:** mục tiêu, danh sách khái niệm, lab dự kiến, sơ đồ cần vẽ.
2. **Viết nháp** theo khung 6 phần. AI được dùng để hỗ trợ viết nháp, người viết chịu trách nhiệm về độ chính xác.
3. **Chạy lab** trên môi trường sạch, ghi lại output thật để làm "kết quả mong đợi".
4. **Rà kiến thức** với nguồn chính thức; sửa chỗ sai hoặc chưa rõ.
5. **Học thử:** một người chưa biết chủ đề học theo bài và ghi lại chỗ vướng. Ở giai đoạn đầu, người học thử là người sáng lập.
6. **Kiểm tra tự động** khi build: đủ 6 phần, link không hỏng, mã mục không trùng.
7. **Đánh dấu "đã kiểm chứng"** và phát hành.

## 6. Bản quyền và nguồn

- Không chép nguyên văn sách, khoá học hay tài liệu có bản quyền. Diễn giải bằng lời của mình và dẫn nguồn.
- Trích dẫn ngắn khi thật cần, có ghi tác giả.
- Sơ đồ tự vẽ; không dùng lại hình của người khác nếu không có giấy phép.
- Code mẫu tự viết; nếu dựa trên code mã nguồn mở thì tuân thủ giấy phép của nó.

## 7. Đa ngôn ngữ

- Bản gốc viết bằng tiếng Việt; các ngôn ngữ khác là bản dịch.
- Bản dịch giữ nguyên mã bài và mã mục, code, lệnh, output và sơ đồ (chỉ dịch chữ trong sơ đồ).
- Mỗi bản dịch ghi lại phiên bản bản gốc mà nó dựa vào, để biết khi nào bản dịch đã cũ.
- Lab không cần kiểm chứng lại khi dịch, trừ khi bản dịch thay đổi lệnh.

## 8. Ví dụ dàn ý: D1.1

| Phần | Nội dung |
|---|---|
| Mục tiêu | Hiểu tiến trình sống và chết thế nào trên Linux; giải thích được `docker stop` mất 10 giây, exit code 137 và 143, khi nào shutdown hook của JVM chạy |
| Kiến thức | PID, PPID, fork/exec, cây tiến trình, trạng thái R/S/D/Z/T; bảng signal; công thức exit code 128+N; PID 1 trong container và vai trò của `exec` trong ENTRYPOINT; systemd unit và journald. Sơ đồ: luồng `docker stop` → SIGTERM → shutdown hook → SIGKILL khi quá hạn |
| Tài liệu | *The Linux Command Line* chương 10; `man 7 signal` phần Standard signals; Arch Wiki systemd |
| Thực hành | Trong VM Lima: xem cây tiến trình; script bắt SIGTERM và so sánh exit code 0, 137, 143; tạo zombie; viết unit systemd, xem log, thử `Restart=on-failure`; dọn dẹp |
| Đào sâu | Vì sao không bắt được SIGKILL; tiến trình ở trạng thái D; container không dùng `exec`; `docker run --init`; Kafka consumer khi nhận SIGTERM. Khi làm cùng AI: AI hay quên `exec` trong ENTRYPOINT và hay bỏ graceful shutdown |
| Dấu hiệu nắm chắc | Kể được chuỗi `docker stop`; nhìn exit code biết lý do; tự viết unit systemd và đọc log |

Nội dung chi tiết của bài này đã được soạn trong quá trình học và sẽ là bài mẫu đầu tiên chuyển vào Masteva.
