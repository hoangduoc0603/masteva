# Callout

Năm loại ghi chú trong bài, phân biệt bằng nhãn chữ có chấm màu ở trên, rồi tới nền.

| `kind` | Nhãn | Màu nhãn | Nền |
|---|---|---|---|
| `production` | Trên production | `track-microservices` | `tint-production` |
| `pitfall` | Lỗi hay gặp | `amber` | `tint-pitfall` |
| `danger` | Cảnh báo | `red` | `tint-danger` + viền trong đỏ nhạt |
| `ai` | Khi làm cùng AI | `violet` | `tint-ai` |
| `link` | Liên hệ bài khác | `muted` | `tint-link` |

- Góc `radius-md`, đệm 14px 18px. Không viền trái màu, không icon.
- `danger` luôn đứng ngay trước Terminal chứa lệnh phá dữ liệu.

Code: `src/components/lesson/blocks.tsx` (`Callout`).
