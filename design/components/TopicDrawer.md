# TopicDrawer

Khung chi tiết của một chủ đề trên sơ đồ: mô tả, trạng thái, bài học, nên học trước, dự án, đọc thêm.

- **Mở:** bấm chip, hoặc vào URL có `#<mã chủ đề>` (link chia sẻ được). Hash dạng `#step-…` chỉ cuộn tới chặng, không mở khung.
- **Phần tử:** `<dialog>` mở bằng `showModal()`, nên có sẵn bẫy focus, Esc để đóng và nền mờ. Bấm vào nền mờ hoặc nút "Đóng" cũng đóng. Khi đóng: bỏ hash khỏi URL, trả focus về chip đã mở.
- **Vị trí:**
  - Desktop: panel bên phải rộng 420px.
  - Dưới 768px: bottom sheet cao theo nội dung (tối đa 92% màn hình), bo góc 16px, có thanh kéo.
  - Trượt vào trong 200ms bằng `transform`. Không animate `opacity`, để panel không bị kẹt ở trạng thái trong suốt khi animation chưa chạy. Tắt khi `prefers-reduced-motion`.
- **Nội dung** (bản mẫu `design/topic-drawer.html`):
  - tiêu đề; dưới tiêu đề là mã và tên chặng, cấp, "chủ đề k/n", loại chủ đề (không đặt nhãn phía trên tiêu đề);
  - `summary`;
  - bốn nút trạng thái có chữ (Chưa học, Đang học, Đã xong, Bỏ qua); nút đang chọn có nền `accent`;
  - "Học trên Masteva": mỗi bài là một hàng bấm được kèm "k/n mục". Chưa có bài thì một khối viền nét đứt nói thật là đang soạn và chỉ việc làm tiếp (đọc tài liệu bên dưới, hoặc đánh dấu rồi sang chủ đề tiếp);
  - "Tài liệu chính thức": thẻ gồm tên trang, tên miền (mono) và một câu ghi chú;
  - "Nên học trước", "Dùng ở dự án";
  - nút "Trước" / "Tiếp" dính ở đáy, đi theo thứ tự roadmap xuyên chặng và cấp. Bấm thì đổi panel tại chỗ, focus ở lại nút cùng hướng để bấm liên tiếp; đóng khung thì focus về chip của chủ đề đang xem.
- **"Chưa học"** xoá trạng thái tự đặt nếu trạng thái suy ra từ bài đã là chưa học, ngược lại lưu "chưa học" tự đặt (`markFor`).
- **Chip có bài:** nhãn "Bài" (kèm số khi nhiều hơn một bài), trình đọc màn hình đọc ", có bài". Nút "Học tiếp" đi thẳng vào bài nếu chủ đề kế tiếp đã có bài.
- Mọi panel render sẵn và ẩn bằng `hidden`; script chỉ đổi panel nào được hiện.

Code ở `src/components/roadmap/topic-drawer.tsx`, phần điều khiển ở `roadmap-client.tsx`.
