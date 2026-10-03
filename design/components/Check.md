# Check

Một mục tự kiểm tra có mã cố định; tích vào là cộng vào tiến độ.

- Một hàng có viền `rule`, góc `radius-md`, nhãn nhỏ "Tự kiểm tra" màu `muted` ở trên, câu Be Vietnam Pro 500 16px.
- Ô tích 22px, viền 2px `field` (≥ 3:1), góc `radius-sm`. Vùng bấm là cả câu.
- Đã tích: ô nền `green` có dấu tick trắng hiện ra trong 160ms, cả hàng nền xanh nhạt. Chữ giữ nguyên độ đậm để không bị hiểu là "vô hiệu hoá".
- Focus bàn phím: viền `focus` 2px quanh ô.

Code: `src/components/lesson/check.tsx`.
