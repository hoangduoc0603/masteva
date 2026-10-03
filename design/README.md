# Masteva

Hệ thiết kế **Night Lab**: phòng lab ban đêm của một kỹ sư. Nền navy đậm, một trục phát sáng dẫn qua từng chặng, màu hổ phách cho những gì bấm được, và chữ không chân hiện đại, rõ ở mọi kích thước. Theme tối là mặc định; theme sáng đầy đủ cho người học ban ngày.

Masteva là web học cho lập trình viên, tiếng Việt trước. Người học thường học sau giờ làm, ngồi lâu với một bài, vừa đọc vừa chạy lệnh. Mọi quyết định phục vụ việc đó: dễ đọc lâu trên nền tối, biết lệnh chạy ở đâu, thấy rõ mình đang ở đâu trên lộ trình.

Gợi ý gốc từ skill ui-ux-pro-max (Dark Mode cho nền tảng code), đã chỉnh cho Masteva: tránh Inter và kiểu nền đen với xanh neon, mọi font có bộ chữ tiếng Việt, mọi cặp màu đã kiểm tra tương phản ở cả hai theme.

## Giọng văn

- Tiếng Việt tự nhiên, xưng "bạn", câu ngắn. Thuật ngữ giữ tiếng Anh, giải nghĩa ở lần đầu.
- Không từ ngữ quảng cáo, không dấu chấm than, không emoji.
- Nhãn viết hoa chữ đầu câu, không viết hoa toàn bộ. Nút nói đúng việc sẽ xảy ra.

## Nguyên tắc

1. **Một trục dẫn đường.** Roadmap là một trục dọc màu của roadmap, phát sáng nhẹ. Chặng là trạm trên trục; trạm đang học có quầng hổ phách.
2. **Một màu tương tác.** `accent` (hổ phách) chỉ dành cho nút chính, link, mục đang học và focus. `green` chỉ có nghĩa "đã xong". Màu roadmap (`track-*`) chỉ để nhận diện, luôn kèm chữ cái J/D/M.
3. **Bề mặt có chiều sâu vừa phải.** Thẻ `radius-lg` 16px, viền `rule` và bóng mềm; khung chi tiết có bóng sâu hơn. Không gradient trang trí, không glassmorphism.
4. **Mỗi khối học có hình dạng riêng.** Terminal nền chìm có nhãn nơi chạy, Kết quả mong đợi viền nét đứt không có nút sao chép, Check là hàng có ô tích, Predict khung nét đứt hổ phách, Callout nền nhạt có nhãn chấm màu.
5. **Trạng thái không chỉ bằng màu.** Chip có hình chấm riêng cho từng trạng thái, nhãn chữ "Chọn một", "Tuỳ chọn", "Bạn đang ở đây".

## Màu

- Theme tối (mặc định): nền `#0a0f1c`, mặt thẻ `#111827`, chữ `#e5e7eb`, hổ phách `#fbbf24`, xanh "đã xong" `#34d399`.
- Theme sáng: nền `#f6f7fb`, mặt thẻ trắng, chữ `#0f172a`, hổ phách đậm `#b45309`, xanh `#047857`.
- Chữ ≥ 4.5:1, viền control (`field`) ≥ 3:1 ở cả hai theme. `rule` chỉ là đường kẻ trang trí.
- Roadmap: Java cam, DevOps tím, Microservices cyan. Dự án: xanh lá mạ.

## Chữ

- **Bricolage Grotesque** (700–800) cho tiêu đề: H1 54px, tiêu đề cấp 30px, tên chặng 19px. Có cá tính, chữ hẹp vừa phải, đẹp ở cỡ lớn.
- **Be Vietnam Pro** cho thân bài và giao diện: 17px/1.75 khi đọc, 15px cho giao diện. Thiết kế bởi người Việt, dấu tiếng Việt rõ và cân.
- **JetBrains Mono** cho lệnh, mã chặng, số đếm.
- Cột chữ tối đa 40rem (khoảng 70 ký tự). Không viết hoa toàn bộ.

## Khoảng cách và góc

- Thang 4px. Góc: `radius-sm` 6px (ô tích), `radius-md` 12px (Terminal, callout, ô nhập), `radius-lg` 16px (thẻ), `radius-pill` cho nút chính, chip, bộ chọn.

## Chuyển động

Chỉ khi người dùng thao tác, tắt khi `prefers-reduced-motion`: tick Check (160ms), mũi tên Predict/Reveal (180ms), thanh tiến độ (`transform: scaleX`, 240ms), khung chi tiết trượt vào (200ms, chỉ `transform`). Không hiệu ứng khi tải trang hay khi cuộn.

## Bố cục trong Fumadocs

- Giữ khung Fumadocs (thanh bên, mục lục, tìm kiếm ⌘K); thay theme `neutral` bằng token ở đây, đặt theme mặc định là tối.
- Roadmap: sơ đồ trục giữa (mẫu `roadmap.html`), view danh sách từ cùng HTML, khung chi tiết chủ đề.

## Component

Terminal, Kết quả mong đợi, Check, Predict, Reveal, Callout, StatusBadge, RoadmapMap, TopicDrawer. Ghi chú trong `components/`, bản xem trước trong `system.html`.

- Component bài học: `components.css` (tiền tố `ms-`). `src/app/lesson.css` chuyển thể file này (không chép nguyên văn): bỏ gốc `.ms` và @import Google Fonts, bộ chọn Terminal/Expected nhắm vào code block của Fumadocs, giữ nguyên giá trị.
- Sơ đồ roadmap, thẻ roadmap, trang dự án, trang chủ, breadcrumb bài học: `roadmap.css` (tiền tố `rm-`, `rc-`, `pj-`, `hm-`, `ls-`), dùng nguyên văn cho `src/app/roadmap.css`.

Xem mọi trang mẫu ở `index.html` (chạy `pnpm exec serve design -l 4400`; thêm `?light` để xem theme sáng).

## Không làm

- Gradient trang trí, glassmorphism, emoji, icon trang trí, viền trái màu cho callout.
- Inter, Roboto, font hệ thống mặc định; nền đen tuyền với một màu neon.
- Chữ viết hoa toàn bộ làm nhãn; màu là dấu hiệu duy nhất.
- Chuyển động khi tải trang hoặc khi cuộn.
