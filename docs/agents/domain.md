# Domain Docs

Cách các skill engineering đọc tài liệu domain của repo khi khám phá code. Repo là single-context.

## Đọc trước khi khám phá

- **`GLOSSARY.md`** ở gốc repo. Khi file chưa có, dùng §5.1 "Các thực thể" trong `docs/architecture.md` (roadmap, chặng, chủ đề, bài, mã mục) làm từ vựng.
- **ADR**, đọc những quyết định liên quan tới vùng sắp sửa:
  - ADR-001…010 nằm trong bảng §14 "Quyết định kiến trúc (ADR)" của `docs/architecture.md`.
  - ADR mới nằm trong `docs/adr/`.
- Với nội dung bài học: `docs/content-standard.md`.

Nếu file nào chưa có, **cứ tiếp tục, không báo**. Đừng nhắc việc thiếu file, đừng đề xuất tạo trước. Skill `/domain-modeling` (qua `/grill-with-docs` và `/improve-codebase-architecture`) tạo chúng khi một thuật ngữ hay quyết định thật sự được chốt.

## Cấu trúc file

```
/
├── GLOSSARY.md
├── docs/
│   ├── architecture.md      ← §14: ADR-001…010 (không thêm dòng mới)
│   └── adr/
│       ├── 0011-<slug>.md   ← ADR mới bắt đầu từ 0011
│       └── 0012-<slug>.md
└── src/
```

## Đánh số ADR mới

ADR mới là file riêng trong `docs/adr/`, theo dạng `NNNN-slug.md`. Số tiếp theo là số lớn nhất trong cả `docs/adr/` lẫn bảng §14, cộng một; vì vậy file đầu tiên là `0011-<slug>.md`, không phải `0001`. Bảng §14 giữ nguyên cho ADR cũ, không thêm dòng mới vào đó. Khi một ADR mới thay thế ADR cũ, ghi rõ trong file mới (ví dụ "Thay ADR-002") và sửa cột Trạng thái của dòng cũ trong §14.

## Dùng đúng từ vựng của glossary

Khi kết quả nhắc tới một khái niệm domain (tiêu đề issue, đề xuất refactor, giả thuyết, tên test), dùng đúng thuật ngữ trong `GLOSSARY.md`. Không đổi sang từ đồng nghĩa mà glossary đã tránh.

Nếu khái niệm cần dùng chưa có trong glossary, đó là tín hiệu: hoặc đang đặt ra từ mà dự án không dùng (cân nhắc lại), hoặc có khoảng trống thật (ghi lại cho `/domain-modeling`).

## Nêu rõ khi mâu thuẫn ADR

Nếu kết quả trái với một ADR đã có, nói rõ thay vì lặng lẽ làm khác:

> _Mâu thuẫn ADR-002 (static export), nhưng nên xem lại vì…_
