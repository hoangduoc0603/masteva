# 13: E2E kiểm truy cập (axe) sát giới hạn thời gian

**What to build:** Bộ E2E không đỏ ngẫu nhiên vì bài "không có lỗi truy cập nghiêm trọng, sáng và tối" chạy quá 30 giây.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Bài chạy ổn định dưới giới hạn khi cả bộ E2E chạy song song (tách theo trang hay theme, hoặc đặt timeout riêng có lý do)

## Comments

23/10/2026: lần chạy `pnpm verify` khi làm ticket 39 (bài-doc-java-spring-boot), bài này đỏ trên desktop vì quá 30 giây (`page.evaluate: Test timeout of 30000ms exceeded`). Chạy riêng thì qua, 24,9 giây trên desktop và 24,2 giây trên mobile; các lần trước khoảng 22 giây. Bài đã sát ngưỡng từ trước ticket 39; khi máy bận thì vượt.

23/10/2026: làm luôn khi implement ticket 39 vì bài này làm `pnpm verify` đỏ hai lần liên tiếp. Tách thành mỗi trang, mỗi theme một test (10 test mỗi project), chạy song song; test lâu nhất còn 7,5 giây (J5.3, dark, desktop). Cả bộ E2E: 113 qua.

