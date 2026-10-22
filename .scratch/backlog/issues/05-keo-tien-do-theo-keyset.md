# 05: Kéo tiến độ tài khoản theo keyset thay cho offset

**What to build:** Kéo tiến độ về không bỏ sót dòng khi một bảng quá 1.000 dòng và máy khác ghi giữa chừng. Hiện phân trang theo offset; đổi sang keyset (`synced_at`, mã).

**Blocked by:** None (can start immediately)

**Status:** needs-triage

- [ ] Có test tái hiện lỗi bỏ sót dòng
- [ ] Phân trang theo keyset; `PAGE_SIZE` không còn giả định `max_rows` của project cloud là 1.000
