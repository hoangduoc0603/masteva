# 39: Nhãn tiến độ của bài đọc ở khung chi tiết chủ đề

**What to build:** Khung chi tiết chủ đề trên trang roadmap (`src/components/roadmap/topic-drawer.tsx`) hiện tiến độ từng bài bằng `roadmap.itemCount` ("0/1 mục", "1/1 mục"). Với bài đọc, nhãn này lộ chi tiết "một mục" mà người học không thấy ở đâu khác; đầu trang bài đọc đã hiện "Đã học xong"/"Chưa học xong" (ticket 02). Cần quyết định nhãn cho bài đọc ở khung chủ đề, ví dụ "Đã học xong"/"Chưa học"; khung chủ đề cần biết dạng bài của từng bài (thêm `kind` vào dữ liệu bài trong `views.ts`).

**Blocked by:** None

**Status:** needs-triage

- [ ] Chốt nhãn tiến độ của bài đọc ở khung chủ đề
- [ ] Bài lab giữ nhãn "n/m mục"
