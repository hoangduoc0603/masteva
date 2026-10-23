# 04: Bài mẫu J5.3 theo chuẩn bài đọc

**What to build:** J5.3 viết lại trọn vẹn theo chuẩn bài đọc ở ticket 03, làm mẫu cho mọi đợt viết lại sau. Đợt viết lại hàng loạt chỉ bắt đầu khi chủ dự án duyệt bài này.

**Blocked by:** 02, 03

**Status:** done

- [x] Phần kiến thức gồm kiến thức của phần đào sâu cũ và các phát hiện từ lab cũ kèm output thật; hai callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức
- [x] Câu hỏi–lời giải của phần đào sâu cũ chép vào nguồn câu hỏi phỏng vấn của roadmap Java, ghi mã bài gốc (lần đầu tạo nguồn này)
- [x] Nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`; `status: verified` chỉ khi mọi đoạn code và output đã chạy thật
- [x] Chủ dự án đọc và duyệt bài mẫu; góp ý được đưa ngược vào chuẩn nội dung trước khi đóng ticket

**Kết quả (22/10/2026):** J5.3 viết lại theo `docs/content-standard.md` §3: 7 khái niệm (`###`), 18 ví dụ chạy được với Java 25.0.3 trên macOS 14.4.1 kèm output thật, 3 chỗ Đoán trước, 1 câu nhắc tự giải thích, 1 callout production, 1 pitfall. Khẳng định về API dẫn Javadoc ngay trong câu hoặc có output.

- **Nhập từ lab cũ:** xoá phần tử áp chót bỏ sót phần tử, lỗi biên dịch khi đổi sang `Optional`, đơn hàng rỗng khi thiếu sao chép phòng thủ, `Map.of`/`Set.of` trùng khoá, `List.copyOf` với `null`, `UnsupportedOperationException` và `No value present`.
- **Cố ý bỏ:** `Optional.filter` (bài không cần cho lập luận); "`removeIf` chỉ dời phần tử một lần" (không có tài liệu chính thức làm dẫn chứng); "`Optional` không `Serializable`" (người học chưa học `Serializable`).
- **Nguồn câu hỏi phỏng vấn:** bốn câu hỏi đào sâu chép nguyên văn ở `content/interview/java.md`. Lưu ý cho spec bộ câu hỏi: câu đầu viết "đừng dựa vào nó để phát hiện lỗi", trong khi Javadoc nói fail-fast chỉ nên dùng để phát hiện lỗi; cần sửa khi biên tập.
- **Nghiệm thu:** `pnpm content:check`, `pnpm build`, E2E xanh. Mọi khối code được trích tự động từ bài, chạy và đối chiếu với khối output ngay sau. Một lượt đọc với vai người học và review hai trục, góp ý đã đưa vào bài.
- Bài dài khoảng 4.000 từ văn và 380 dòng code, ở ngưỡng gợi ý 30–40 phút đọc.

**Góp ý lần 1 (23/10/2026), đã sửa:**
- Nút "Đã học xong bài" thành chip trên thanh đầu bài đọc (breadcrumb + chip), dính khi cuộn ở mọi kích thước màn hình. Bản đặt dưới mục lục và nổi ở góc bị chủ dự án chê nên đã bỏ. E2E kiểm nút nằm trong màn hình khi đang đọc giữa bài.
- Ví dụ code chỉ hiện code và lời giải thích: bỏ đoạn hướng dẫn lưu và chạy file, bỏ tên file trên khối code. Quy tắc ghi vào `docs/content-standard.md` §3.3.

**Duyệt:** chủ dự án duyệt J5.3 ngày 23/10/2026. Góp ý đã đưa vào chuẩn nội dung (§3.3) và thiết kế (thanh đầu bài).
