# Định hướng thiết kế: Night Lab

Chốt ngày 03/10/2026. Tài liệu này là nguồn sự thật cho giao diện Masteva. Chi tiết token và component nằm trong thư mục `design/`:

| File | Nội dung |
|---|---|
| `design/index.html` | Mọi trang mẫu, mỗi trang có bản desktop và mobile đặt cạnh nhau. Chạy `pnpm exec serve design -l 4400`; thêm `?light` vào địa chỉ để xem theme sáng |
| `design/README.md` | Brand book: giọng văn, nguyên tắc, màu, chữ, góc, chuyển động, điều không làm |
| `design/system.html` | Design system: bảng token hai theme, kiểu chữ, component bài học và roadmap, mỗi component có bản sáng và tối |
| `design/tokens.css` | Token (nguồn sự thật); chép nguyên văn sang `src/app/tokens.css` để bản build không phụ thuộc `design/` |
| `design/roadmap.css` | CSS cho sơ đồ roadmap, thẻ roadmap, trang dự án, trang chủ, breadcrumb và chip chủ đề; chép nguyên văn sang `src/app/roadmap.css` |
| `design/components.css`, `design/components/*.md` | CSS mẫu và ghi chú của component bài học |

## 1. Quá trình chọn hướng

| Ngày | Bước | Kết quả |
|---|---|---|
| 03/10/2026 | Critique giao diện giai đoạn 0 (`/impeccable critique`) | 24/40. Theme `neutral` và Inter mặc định; các khối học cùng một hộp xám; thanh tiến độ vô hình (1.00:1); cuối bài không có bước tiếp; dòng chữ quá dài |
| 03/10/2026 | Ba hướng A/B/C bằng frontend-design | Chọn A "Sổ tay kỹ sư" (Literata, IBM Plex, cột lề ghi chú) |
| 03/10/2026 | Người dùng thấy A chưa đẹp | Cài skill **ui-ux-pro-max**, sinh design system cho "nền tảng code / tài liệu kỹ thuật", dựng ba phương án trên trang roadmap: V1 Swiss Precision (IBM Plex, trắng, cột cấp dính bên trái), V2 Night Lab, V3 Bento Progress (Lexend, ô lưới có vòng tiến độ) |
| 03/10/2026 | Người dùng chọn **V2 · Night Lab** | Áp dụng cho mọi trang mẫu và design system; xoá file của V1, V3 và trang so sánh |

Gợi ý gốc của ui-ux-pro-max là "Dark Mode cho nền tảng code". Masteva đã chỉnh lại như sau:
- bỏ Inter;
- tránh kiểu nền đen tuyền với một màu neon;
- mọi font có bộ chữ `vietnamese`;
- mọi cặp màu đã kiểm tra tương phản ở cả hai theme.

## 2. Tính cách

**Phòng lab ban đêm của một kỹ sư.**
- Nền navy đậm.
- Một trục phát sáng dẫn qua từng chặng.
- Màu hổ phách cho những gì bấm được.
- Chữ không chân hiện đại, rõ ở mọi kích thước.

Hợp với persona chính: dev đi làm, học sau giờ làm, ngồi lâu với một bài và chạy lệnh trên máy thật. Giọng văn điềm tĩnh, cụ thể, không hô hào, không game hoá.

Điểm nhớ là **trục roadmap phát sáng**, với trạm đang học có quầng hổ phách.

## 3. Nền tảng thị giác

### Màu

Theme tối là mặc định (Fumadocs `defaultTheme: 'dark'`). Theme sáng đầy đủ cho người học ban ngày.

| Token | Tối (mặc định) | Sáng | Dùng cho |
|---|---|---|---|
| `ground` | `#0a0f1c` | `#f6f7fb` | Nền trang, thanh bên |
| `surface` | `#111827` | `#ffffff` | Thẻ, cột nội dung, khung chi tiết |
| `sunk` | `#0d1424` | `#eef1f7` | Terminal, nền chip |
| `ink` / `muted` | `#e5e7eb` / `#9ca3af` | `#0f172a` / `#4b5563` | Chữ chính / chữ phụ |
| `rule` / `field` | `#1f2937` / `#6b7280` | `#e2e6ef` / `#80889c` | Đường kẻ trang trí / viền control (≥ 3:1) |
| `accent` | `#fbbf24` | `#b45309` | Màu tương tác duy nhất: nút chính, link, mục đang học, focus |
| `green` | `#34d399` | `#047857` | Chỉ có nghĩa "đã xong" |
| `amber` / `red` / `violet` | | | Lỗi hay gặp và nháp / nguy hiểm / AI |
| `track-java` / `-devops` / `-microservices` | `#ff7a59` / `#a78bfa` / `#22d3ee` | `#be2f45` / `#7c3aed` / `#0e7490` | Màu nhận diện roadmap, luôn kèm chữ J/D/M. Java lệch accent ≥ 30° để quầng "Bạn đang ở đây" không chìm |
| `track-neobank` | `#a3e635` | `#4d7c0f` | Trục mốc trên trang dự án |

Đã kiểm tra:
- chữ chính và chữ phụ ≥ 4.5:1;
- viền control ≥ 3:1;
- `accent` trên `surface` ≥ 5:1.

Cả ba điều đúng ở hai theme.

### Chữ

| Vai trò | Font | Cỡ |
|---|---|---|
| Tiêu đề | Bricolage Grotesque 700–800 | H1 trang 54px (mobile 36px), H1 bài 42px, tiêu đề cấp 30px, tên chặng 19px |
| Thân bài, giao diện | Be Vietnam Pro 400–600 | Đọc 17px/1.75, giao diện 15px, nhãn 12.5px |
| Lệnh, mã, số đếm | JetBrains Mono 400–600 | Code 14px (mobile 13px) |

- Cả ba font tự host bằng `next/font/google` với bộ `latin` và `vietnamese`.
- Cột chữ tối đa 40rem.
- Không viết hoa toàn bộ.

### Góc, bóng, chuyển động

- **Góc:**
  - 6px: ô tích;
  - 12px: Terminal, callout, ô nhập;
  - 16px: thẻ chặng, khung cấp, thẻ roadmap;
  - tròn hẳn: nút chính, chip, bộ chọn, nhãn "Bạn đang ở đây".
- **Bóng mềm:** hai lớp cho thẻ. Khung chi tiết có bóng sâu. Không gradient trang trí, không glassmorphism.
- **Chuyển động:** chỉ khi người dùng thao tác, tắt khi `prefers-reduced-motion`.
  - Tick Check: 160ms.
  - Mũi tên Predict/Reveal: 180ms.
  - Thanh tiến độ: 240ms, chạy bằng `transform: scaleX`.
  - Khung chi tiết trượt vào: 200ms, chỉ `transform`, không animate `opacity`.

## 4. Trang roadmap

Mẫu: `design/roadmap.html`. Đặc tả đầy đủ ở spec `docs/superpowers/specs/2026-10-03-tach-roadmap-design.md` §6.

- **Header:**
  - kicker màu roadmap, H1 Bricolage;
  - số cấp, chặng, chủ đề;
  - nút "Học tiếp: <chủ đề>" dạng viên hổ phách;
  - bộ chọn "Tôi đã biết".
- **Thanh công cụ dính khi cuộn:** Sơ đồ/Danh sách, "Ẩn mục đã bỏ qua", "Cách đọc sơ đồ".
- **Sơ đồ:**
  - Mỗi cấp mở đầu bằng khung bo 16px có tiến độ.
  - Trục giữa 4px màu roadmap, có quầng sáng.
  - Trạm tròn 46px.
  - Thẻ chặng xếp so le hai bên.
  - Chip chủ đề dạng viên, trạng thái phân biệt bằng hình chấm và chữ.
- **Khung chi tiết:** `<dialog>`. Desktop là panel phải 420px; mobile là trang trượt từ dưới lên, cao 92% màn hình.
- **Mobile:** trục sang trái; thanh "Học tiếp" dính ở đáy.

## 5. Component bài học

Ghi chú và bản xem trước ở `design/components/*.md` và `design/system.html`. Tóm tắt:

| Component | Night Lab |
|---|---|
| Terminal | Nền `sunk`, góc 12px, thanh tiêu đề có hình dấu và nhãn nơi chạy viết đủ, nút "Sao chép" dạng viên; dấu nhắc `$` màu `accent` |
| Expected | Viền nét đứt `field`, chữ `muted`, không có nút sao chép |
| Check | Hàng có viền, nhãn "Tự kiểm tra", ô tích 22px; khi xong thì ô `green` có tick và cả hàng nền xanh nhạt |
| Predict | Khung nét đứt `accent`, câu hỏi Bricolage, ô ghi dự đoán, `<details>` "Xem đáp án" |
| Reveal | Khối viền `rule` có mũi tên |
| Callout | Nhãn có chấm màu ở trên, nền nhạt theo loại; không viền trái màu, không icon |
| StatusBadge | Viên có chấm màu và chữ |

Đã áp dụng vào code ngày 03/10/2026: `src/components/lesson/*`, CSS ở `src/app/lesson.css` (chuyển thể từ `design/components.css`). Predict không lưu dự đoán.

## 6. Việc còn mở

| Câu hỏi | Đề xuất |
|---|---|
| Dự đoán trong Predict có lưu không | Lưu trong localStorage theo mã Predict. Cần thêm mã ổn định cho `<Predict>`, nên đụng tới `content-standard.md` và file khoá mã |
| Ngân sách font | Ba họ font, chỉ nạp các độ đậm đã liệt kê. Đo trọng lượng trang trước và sau khi áp dụng |

## 7. Thứ tự áp dụng

1. Kế hoạch `docs/superpowers/plans/2026-10-03-tach-roadmap.md`:
   - token, font và theme mặc định tối (Task 7);
   - các trang roadmap, danh mục, dự án, trang chủ, breadcrumb bài học (Task 9–13).
2. Kế hoạch sau: component bài học theo §5.
3. Chạy lại `/impeccable critique` và `/impeccable polish` cho các trang đã áp dụng.
