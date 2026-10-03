# Terminal

Khối lệnh có nhãn nơi chạy; mọi lệnh trong bài đều nằm trong khối này.

- Thanh tiêu đề: dấu hình và nhãn nơi chạy viết đầy đủ ("Chạy trong VM Lima", "Chạy trên máy Mac", "Chạy trong container", "Chạy trong pod"), tên file nếu có, nút "Sao chép" dạng viên (`radius-pill`, viền `field`).
- Nơi chạy phân biệt bằng **chữ và hình dấu**: VM ô vuông đặc `accent`, Mac ô vuông rỗng, container chấm tròn đặc, pod vòng tròn rỗng. Không dùng màu roadmap cho nơi chạy.
- Nền `sunk`, viền `rule`, góc `radius-md` (12px). Code JetBrains Mono 14px/1.65 (mobile 13px, khối tràn hết bề ngang).
- Dấu nhắc `$` màu `accent`, không chọn được. Tô màu tối thiểu: chuỗi `green`, cờ `track-devops`, biến `accent`; output `muted`.

**Kết quả mong đợi** là khối riêng: nhãn "Kết quả mong đợi", viền nét đứt `field`, chữ `muted`, **không có nút sao chép**.

Code: `src/components/lesson/blocks.tsx` (`Terminal`, `Expected`).
