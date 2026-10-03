# RoadmapMap

Sơ đồ "trục giữa" của một roadmap: cấp, chặng (trạm trên trục) và chủ đề (chip), render sẵn lúc build.

- **Cấu trúc:** danh sách có thứ tự lồng nhau: cấp (`section.rm-level`) → chặng (`li.rm-step`) → chủ đề (`a.rm-chip`). Trình đọc màn hình đọc như một dàn ý; tắt JavaScript vẫn dùng được vì chip là link `#<mã chủ đề>`.
- **Màu roadmap** qua `--tc` trên `.rm-page[data-track]`: `track-java`, `track-devops`, `track-microservices`. Trục, trạm, mã chặng, thanh tiến độ dùng `--tc`; tương tác dùng `accent`.
- **Khung cấp:** bo 16px, viền `rule`, bóng mềm; tiêu đề Bricolage Grotesque; thanh tiến độ rãnh viền `field`.
- **Trục:** 4px màu roadmap, có quầng sáng. **Trạm:** tròn 46px, số thứ tự mono.
  - Chặng đã xong: trạm đặc màu roadmap, thẻ nền nhạt.
  - Chặng đang học: viền `accent`, quầng `selection`, nhãn "Bạn đang ở đây".
  - Chặng tuỳ chọn: trạm nét đứt.
- **Chip chủ đề**, phân biệt bằng hình và chữ, không chỉ màu:

| Trạng thái | Hình |
|---|---|
| Chưa học | Vòng rỗng, chip nền `sunk` dạng viên |
| Đang học | Vòng `accent` dày, nền `selection`, chữ đậm |
| Đã xong | Tròn đặc `green` có dấu tick, chữ `muted` |
| Bỏ qua | Vòng nét đứt, chữ gạch ngang |
| `pick` | Viền `ink`, nhãn "Chọn một" |
| `opt` | Viền nét đứt `field`, nhãn "Tuỳ chọn" |

- **Liên kết:** "Học ở <chặng roadmap khác>" và "Dùng ở <dự án>, mốc n" dưới các chip, màu `accent`.
- **View danh sách:** cùng HTML; `data-view="list"` trên `.rm-page` bỏ trục và thẻ, mỗi chủ đề một dòng.
- **Mobile** (container < 760px): trục sang trái, thẻ rộng hết màn hình, chip cao 44px. Dưới 768px, thanh "Học tiếp" (`.rm-dock`) dính ở đáy.
- **Chuyển động:** chỉ thanh tiến độ (`transform: scaleX`, 240ms). Tắt khi `prefers-reduced-motion`.

CSS ở `design/roadmap.css` (chép sang `src/app/roadmap.css`). Code ở `src/components/roadmap/roadmap-map.tsx`.
