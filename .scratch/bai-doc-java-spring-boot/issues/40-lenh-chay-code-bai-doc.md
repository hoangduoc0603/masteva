# 40: Lệnh chạy code của bài đọc và đối chiếu output

**What to build:** Tác giả nghiệm thu bài đọc bằng một lệnh: `pnpm content:run-code` trích mọi ví dụ Java trong bài đọc, chạy từng ví dụ và so với khối output ghi ngay sau nó, rồi báo ví dụ nào khớp, ví dụ nào lệch kèm chỗ lệch. Lệnh thay script tạm đã dùng khi nghiệm thu J5.3, để 28 ticket viết lại (05–32) nghiệm thu nhanh và đều.

**Blocked by:** None

**Status:** done

Chủ dự án yêu cầu ngày 23/10/2026 (đợt 0, trước khi viết lại hàng loạt).

- [x] Trích ví dụ: khối ` ```java ` ghép với khối ` ```text ` gần nhất ngay sau nó (kể cả khi nằm trong `<Predict>`); khối Java không có output đi kèm vẫn được chạy
- [x] Quy ước trong bài: khối Java có meta `norun` thì bỏ qua (đoạn không chạy riêng được, ví dụ code Spring cần cả project); khối output có meta `varies` thì chỉ chạy, không so (ví dụ thứ tự của `Set.of`)
- [x] Tên file khi chạy lấy từ `public class`, hoặc từ stack trace và thông báo lỗi biên dịch trong output, mặc định `Main.java`
- [x] So output bỏ qua khoảng trắng cuối dòng và dòng trống ở đầu, cuối; khác chỗ nào báo chỗ đó
- [x] Báo khi phiên bản `java` trên máy khác phiên bản ghi trong `verified` của bài
- [x] TDD cho phần trích và so output (`src/lib/content`); J5.3 chạy qua lệnh mới không lệch
- [x] Chuẩn nội dung và `CLAUDE.md` ghi lệnh này vào bước nghiệm thu bài đọc

**Kết quả (23/10/2026):** `pnpm content:run-code [mã chặng | mã bài]`. Phần trích và so output ở `src/lib/content/examples.ts` (12 test), lệnh ở `scripts/run-code.ts`. J5.3: 18 ví dụ, 0 lỗi; khối output của `Set.of` gắn `varies`. Không nằm trong `pnpm verify` vì cần `java`.
