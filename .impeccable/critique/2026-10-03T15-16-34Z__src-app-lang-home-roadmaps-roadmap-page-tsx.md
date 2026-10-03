---
target: trang roadmap src/app/[lang]/(home)/roadmaps/[roadmap]
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/hoangduoc/Desktop/indie-hacker/masteva/src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx"
target_fingerprint: "sha256:72320245c72dfc939113bf8eb48c81712fe5072934bbf3702b7e024c819cca1e"
target_path: /Users/hoangduoc/Desktop/indie-hacker/masteva/src/app/[lang]/(home)/roadmaps/[roadmap]/page.tsx
timestamp: 2026-10-03T15-16-34Z
slug: src-app-lang-home-roadmaps-roadmap-page-tsx
---
# Critique: trang roadmap (/vi/roadmaps/[roadmap])

Method: dual-agent (A: design review · B: detector + overlay)

| # | Heuristic | Điểm | Vấn đề chính |
|---|---|---|---|
| 1 | Trạng thái hệ thống | 3 | Chip/chặng/cấp rõ; đánh dấu xong chỉ có nút nhấn, bộ đếm đã cuộn khuất |
| 2 | Khớp thế giới thật | 2 | 145 chủ đề / 2/134 chủ đề chính / 2/64 lệch nhau; trạm "01" cạnh mã "D0"; "Chưa gì", "Middle" |
| 3 | Kiểm soát | 3 | Esc, trả focus, deep link tốt |
| 4 | Nhất quán | 2 | Focus ring không đồng nhất; "Đã xong" được chọn màu hổ phách thay vì xanh; blur trái brand book |
| 5 | Phòng lỗi | 2 | Tiến độ chỉ ở localStorage, cảnh báo giấu trong legend thu gọn |
| 6 | Nhận ra hơn nhớ | 2 | Chú giải chỉ là chữ, không có mẫu hình; thanh công cụ cuộn mất |
| 7 | Linh hoạt | 2 | 145 điểm Tab, không có "chủ đề tiếp" trong khung |
| 8 | Thẩm mỹ tối giản | 3 | Mạnh, bình tĩnh; thẻ tới 12 chip; mobile hai CTA trùng |
| 9 | Phục hồi lỗi | 2 | "Đang được soạn" không dẫn đi đâu; 404 không theo Night Lab |
| 10 | Trợ giúp | 2 | Legend một đoạn văn trong details |
| **Tổng** | | **23/40** | Acceptable |

## Specificity
Riêng của Masteva (trục phát sáng màu roadmap, trạm 46px mã J/D/M, quầng "Bạn đang ở đây"), nhưng khung là mẫu roadmap.sh. Java cam (#fb923c) quá gần accent hổ phách (#fbbf24) nên quầng "đang ở đây" chìm ở roadmap chủ lực.

Detector: CLI 0 lỗi. Overlay: dark-glow ×3 (rm-cta, rm-dock, rm-station — chủ ý của Night Lab, nhưng glow trên CTA/dock nên xem lại), text-occlusion (false positive: <details> đóng), mobile thêm cramped-padding trên rm-cta/rm-dock và thin-border-wide-shadow trên rm-drawer (độ tin thấp).

## Priority issues
- [P0] Nút "Học tiếp" mở khung chi tiết trống: 273/275 chủ đề Java+DevOps chưa có bài, tóm tắt, tài nguyên. Sửa: trạng thái trống hữu ích (chủ đề gồm gì, tài nguyên ngoài, "Chủ đề tiếp →"), chip có bài nổi bật hơn, CTA ưu tiên chủ đề có bài.
- [P1] Thanh công cụ "dính" không dính: .rm-toolbar nằm trong <header>, sticky chỉ trong phần tử cha. Sửa: đưa thanh ra làm anh em của header trong main.rm-page.
- [P1] Focus ring bị cắt/không đồng nhất: .rm-seg, .rm-status overflow:hidden cắt outline mặc định; chỉ .rm-chip có vòng --focus. Sửa: :focus-visible toàn cục 2px --focus offset 2px, vòng inset cho nút phân đoạn.
- [P2] Ngữ nghĩa màu va nhau: Java gần accent; "Đã xong" được chọn dùng accent; trạm xong màu roadmap nhưng chấm chip xong màu xanh.
- [P2] Nhịp mobile: hai CTA trùng ở màn đầu, dock che tiến độ cấp, khung 92dvh trống 80%, nút Đóng ở trên cùng, summary 20px, nút phân đoạn 38px, checkbox 13px.

## Persona
- Jordan: ba con số lệch; "Tôi đã biết: Chưa gì | Nền tảng | Middle" mơ hồ; "Chọn một" trên một chip; không có mẫu chú giải; khung nào cũng "đang được soạn".
- Sam: không thấy focus ở .rm-seg, .rm-status; 145 điểm Tab không có skip giữa các cấp; "2/64" không nhãn, .rm-bar không role progressbar.
- Casey: hai "Học tiếp"; dock che nội dung; không đổi view giữa trang; khung trống, nút Đóng xa ngón cái; trang dài 11.058px.

## Minor
backdrop-filter trên toolbar; góc 4px còn sót ở drawer mobile; cấp đã biết vẫn hiện thanh 0/22; đánh số DevOps lệch (01 vs D0); số đếm trống trước hydrate; không khoá cuộn nền khi mở modal; chip gần như cùng nền thẻ (1.04:1); viền .rm-seg sáng 2.87:1; xuất/nhập tiến độ không tiêu đề; "0/12" trong khung không có đơn vị.

## Câu hỏi
1. Có nên làm sơ đồ thể hiện cái đang có (chủ đề có bài sáng, còn lại mờ "đang soạn")?
2. "Học tiếp" nên luôn vào thẳng bài, khung chi tiết chỉ để duyệt?
3. Nếu quầng hổ phách là chữ ký, sao roadmap chủ lực lại dùng màu gần như trùng?
