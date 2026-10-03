# Tính năng sản phẩm

Tài liệu này liệt kê các tính năng theo module, gắn với giai đoạn phát triển trong [product-vision.md](product-vision.md#8-lộ-trình-phát-triển-sản-phẩm). Đây là danh mục yêu cầu ở mức sản phẩm, chưa phải đặc tả kỹ thuật (SRS) hay thiết kế hệ thống.

Bản đầu tập trung vào các roadmap backend, nhưng mọi tính năng phải dùng được cho roadmap của bất kỳ mảng nào (frontend, mobile, data…) và cho nhiều ngôn ngữ.

Ký hiệu giai đoạn:

| Ký hiệu | Giai đoạn |
|---|---|
| **G0–G1** | Bản đầu: nền móng và hoàn thiện 3 roadmap |
| **G2** | Beta công khai |
| **G3** | Cộng đồng và kiểm chứng tự động |
| **G4** | Mở rộng |

## 1. Luồng chính của người học

1. Vào trang chủ, xem danh sách roadmap, chọn một roadmap (ví dụ "Java backend, từ nền tảng tới Senior").
2. Xem các bước theo thứ tự, biết bước nào đã xong và bước nào tiếp theo.
3. Mở một bước, học bài theo khung 6 phần: mục tiêu, kiến thức, tài liệu, thực hành, đào sâu, dấu hiệu nắm chắc.
4. Làm lab trên máy mình theo hướng dẫn, so kết quả với kết quả mong đợi.
5. Trả lời câu hỏi tự kiểm tra, đánh dấu hoàn thành từng mục.
6. Tới mốc dự án thì làm phần dự án tương ứng.
7. Quay lại lần sau, tiếp tục đúng chỗ đang học.

## 2. Module ROADMAP

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-ROADMAP-001 | Trang danh mục hiển thị mọi roadmap, mỗi roadmap có mô tả ngắn, đối tượng phù hợp, số bước và tiến độ của người học | G0–G1 |
| FR-ROADMAP-002 | Trang roadmap hiển thị cấp, chặng theo thứ tự và chủ đề của từng chặng; mỗi chặng có mã (ví dụ D1), tên và tiến độ | G0–G1 |
| FR-ROADMAP-003 | Mỗi bước khai báo các bước tiên quyết; giao diện cảnh báo khi người học mở bước chưa đủ điều kiện, nhưng không chặn | G0–G1 |
| FR-ROADMAP-004 | Mỗi roadmap là một nhánh riêng (Java, DevOps, Microservices); chủ đề chung được liên kết sang roadmap dạy đầy đủ thay vì viết lại | G0–G1 |
| FR-ROADMAP-005 | Thẻ chặng hiện dự án và mốc dùng kiến thức của chặng | G0–G1 |
| FR-ROADMAP-006 | Sơ đồ "trục giữa" là view mặc định, kèm view danh sách từ cùng HTML | G0–G1 |
| FR-ROADMAP-007 | Nút "Học tiếp" đưa người học tới chủ đề đang học, hoặc chủ đề chính chưa học đầu tiên | G0–G1 |
| FR-ROADMAP-010 | Khung chi tiết chủ đề (mô tả, trạng thái, bài học, nên học trước, dự án, đọc thêm), mở bằng click hoặc hash `#<mã chủ đề>` | G0–G1 |
| FR-ROADMAP-011 | "Tôi đã biết": chọn cấp bắt đầu, thu gọn các cấp trước đó | G0–G1 |
| FR-ROADMAP-008 | Một bước có thể dùng chung giữa nhiều roadmap, ví dụ "Linux và mạng" thuộc cả DevOps lẫn Backend | G2 |
| FR-ROADMAP-009 | Danh mục roadmap phân loại theo mảng (Backend, Frontend, Mobile, DevOps, Data, AI…) và theo cấp độ | G2 |

## 3. Module LESSON (bài học)

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-LESSON-001 | Mỗi bài theo khung 6 phần cố định trong [content-standard.md](content-standard.md) | G0–G1 |
| FR-LESSON-002 | Một bước lớn được chia thành nhiều bài con (ví dụ D1.1 → D1.9), có mục lục và điều hướng trước/sau | G0–G1 |
| FR-LESSON-003 | Khối lệnh có nút copy, nhãn nơi chạy (Mac, VM, container, pod), kết quả mong đợi và giải thích có thể mở ra | G0–G1 |
| FR-LESSON-004 | Khối "Đoán trước": ẩn kết quả, người học bấm để xem sau khi đã tự đoán | G0–G1 |
| FR-LESSON-005 | Callout chuẩn: *Trên production*, *Lỗi hay gặp*, *Khi làm cùng AI*, *Liên hệ bài khác* | G0–G1 |
| FR-LESSON-006 | Sơ đồ cơ chế vẽ bằng code (SVG hoặc diagram-as-code), hiển thị tốt ở chế độ sáng và tối | G0–G1 |
| FR-LESSON-007 | Sơ đồ tương tác hoặc hoạt hình cho các cơ chế khó (bắt tay TCP, rebalance Kafka, saga) | G2 |
| FR-LESSON-008 | Thuật ngữ có tooltip giải nghĩa và liên kết tới trang thuật ngữ | G2 |
| FR-LESSON-009 | Mỗi bài ghi phiên bản công cụ, ngày kiểm chứng gần nhất và trạng thái (nháp, đã kiểm chứng, cần cập nhật) | G0–G1 |
| FR-LESSON-010 | Phần "Đọc thêm" liệt kê nguồn chính thức, mỗi nguồn có ghi chú nên đọc phần nào | G0–G1 |
| FR-LESSON-011 | Bản ghi terminal (asciinema hoặc tương đương) cho các lab dài | G2 |
| FR-LESSON-012 | Chạy đoạn code Java ngắn ngay trên trang qua máy chủ thực thi có sandbox | G4 |
| FR-LESSON-013 | Người học báo lỗi nội dung ngay tại đoạn bị lỗi | G2 |

## 4. Module LAB (thực hành)

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-LAB-001 | Trang "Chuẩn bị môi trường" theo hệ điều hành (macOS, Linux; Windows qua WSL2 ở giai đoạn sau), liệt kê công cụ và phiên bản tối thiểu | G0–G1 |
| FR-LAB-002 | Mỗi lab có điều kiện đầu vào, các bước, kết quả mong đợi và cách dọn dẹp | G0–G1 |
| FR-LAB-003 | Repo mẫu công khai chứa file cấu hình, script và code khởi đầu cho các lab | G0–G1 |
| FR-LAB-004 | Hướng dẫn gỡ lỗi cho các lỗi thường gặp của từng lab | G0–G1 |
| FR-LAB-005 | CLI `masteva check <bài>` chạy trên máy người học, kiểm tra trạng thái (cụm, file, service, cổng) và báo đạt hay chưa | G3 |
| FR-LAB-006 | Kết quả CLI tự đánh dấu hoàn thành khi người học đã đăng nhập | G3 |
| FR-LAB-007 | Môi trường lab chạy trong trình duyệt | Ngoài phạm vi, xem lại ở G4 |

## 5. Module PROJECT (dự án xuyên suốt)

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-PROJECT-001 | Mỗi dự án có trang tổng quan: bài toán, kiến trúc mục tiêu, các mốc và bước học liên quan | G0–G1 |
| FR-PROJECT-002 | Mỗi mốc có yêu cầu, tiêu chí nghiệm thu đo được và gợi ý cách làm | G0–G1 |
| FR-PROJECT-003 | Mỗi mốc liên kết hai chiều với các bước học cung cấp kiến thức cho nó | G0–G1 |
| FR-PROJECT-004 | Lời giải tham khảo dạng nhánh Git cho từng mốc, kèm ADR giải thích quyết định | G2 |
| FR-PROJECT-005 | Bộ test nghiệm thu chạy được cho từng mốc | G3 |
| FR-PROJECT-006 | Dự án ban đầu: Hub hội thoại đa kênh (6 mốc) và Neobank mini (5 mốc); mỗi mốc tham chiếu chặng hoặc chủ đề của cả ba roadmap | G0–G1 (đề cương), G2 (đầy đủ) |

## 6. Module PROGRESS (theo dõi tiến độ)

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-PROGRESS-001 | Đánh dấu hoàn thành từng mục kiến thức, thực hành và tiêu chí; tiến độ cộng dồn lên bài, bước và roadmap | G0–G1 |
| FR-PROGRESS-002 | Người chưa đăng nhập vẫn lưu được tiến độ trên trình duyệt | G0–G1 |
| FR-PROGRESS-003 | Xuất và nhập tiến độ dạng file để chuyển giữa các máy khi chưa có tài khoản | G0–G1 |
| FR-PROGRESS-004 | Trang "Tiến độ của tôi": roadmap đang học, bước gần nhất, mục còn lại | G2 |
| FR-PROGRESS-005 | Đồng bộ tiến độ theo tài khoản; gộp tiến độ trên trình duyệt vào tài khoản khi đăng nhập lần đầu | G3 |
| FR-PROGRESS-006 | Trang tiến độ công khai (tuỳ chọn) để chia sẻ như một phần hồ sơ | G3 |
| FR-PROGRESS-007 | Giữ nguyên tiến độ khi nội dung được sửa (mã mục ổn định, không phụ thuộc vị trí) | G0–G1 |
| FR-PROGRESS-008 | Trạng thái người học tự đặt cho chủ đề: đang học, đã xong, bỏ qua; nếu không đặt thì suy ra từ mục đã tích trong bài | G0–G1 |

## 7. Module REVIEW (tự kiểm tra và ôn tập)

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-REVIEW-001 | Cuối mỗi bài có câu hỏi tự kiểm tra kèm đáp án ẩn | G0–G1 |
| FR-REVIEW-002 | Câu hỏi trắc nghiệm hoặc điền ngắn có chấm tự động | G2 |
| FR-REVIEW-003 | Ôn tập giãn cách: nhắc lại câu hỏi của các bài đã học theo lịch tăng dần | G4 |

## 8. Module SEARCH

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-SEARCH-001 | Tìm kiếm toàn văn trên mọi bài học của ngôn ngữ đang xem, hỗ trợ tiếng Việt có dấu và không dấu | G0–G1 |
| FR-SEARCH-002 | Trang thuật ngữ (glossary) tra cứu được | G2 |

## 9. Module I18N (đa ngôn ngữ)

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-I18N-001 | Đường dẫn và cấu trúc nội dung có phần ngôn ngữ (ví dụ `/vi/...`, `/en/...`); tiếng Việt là mặc định | G0–G1 |
| FR-I18N-002 | Chuỗi giao diện tách khỏi code để dịch được | G0–G1 |
| FR-I18N-003 | Mã roadmap, bước, bài và mục không phụ thuộc ngôn ngữ, nên tiến độ dùng chung giữa các bản dịch | G0–G1 |
| FR-I18N-004 | Bài chưa có bản dịch thì hiển thị bản gốc kèm thông báo; bản dịch cũ hơn bản gốc thì có nhãn cảnh báo | G4 |
| FR-I18N-005 | Chọn ngôn ngữ trên giao diện và ghi nhớ lựa chọn | G4 |

## 10. Module ACCOUNT

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-ACCOUNT-001 | Đăng nhập bằng GitHub hoặc Google | G3 |
| FR-ACCOUNT-002 | Người học xoá được tài khoản và toàn bộ dữ liệu của mình | G3 |

Lý do để tài khoản ở G3: theo dõi tiến độ trên trình duyệt đã đủ cho bản đầu; thêm đăng nhập khi có người học thật cần học trên nhiều máy.

## 11. Module COMMUNITY

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-COMMUNITY-001 | Thảo luận theo từng bài | G3 |
| FR-COMMUNITY-002 | Đóng góp nội dung qua pull request trên repo nội dung công khai | G3 |

## 12. Module AI

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-AI-001 | Hỏi đáp dựa trên nội dung bài đang học, trả lời có trích dẫn đoạn trong bài | G4 |
| FR-AI-002 | Giải thích lỗi khi người học dán output lab | G4 |

## 13. Module CONTENT-OPS (vận hành nội dung)

| Mã | Yêu cầu | GĐ |
|---|---|---|
| FR-CONTENT-001 | Nội dung lưu dạng file (Markdown/MDX) trong Git, review được như code | G0–G1 |
| FR-CONTENT-002 | Mỗi bài có metadata: mã, roadmap, bước, bài tiên quyết, phiên bản công cụ, ngày kiểm chứng, trạng thái | G0–G1 |
| FR-CONTENT-003 | Kiểm tra tự động khi build: link hỏng, mã mục trùng, thiếu phần bắt buộc của khung 6 phần | G0–G1 |
| FR-CONTENT-004 | Chạy lại lab tự động trong CI để phát hiện bài lỗi thời | G3 |
| FR-CONTENT-005 | Nhật ký thay đổi nội dung theo bài | G2 |

## 14. Yêu cầu phi chức năng

| Mã | Yêu cầu |
|---|---|
| NFR-001 | Trang bài học tải nhanh trên mạng di động, nội dung đọc được trước khi JavaScript chạy |
| NFR-002 | Responsive từ màn hình điện thoại tới desktop; khối lệnh dài cuộn ngang được, không vỡ bố cục |
| NFR-003 | Hỗ trợ chế độ sáng và tối, tương phản đạt WCAG AA |
| NFR-004 | Điều hướng được hoàn toàn bằng bàn phím; sơ đồ có mô tả thay thế |
| NFR-005 | SEO: mỗi bài có URL ổn định, tiêu đề, mô tả và dữ liệu cấu trúc |
| NFR-006 | Chi phí vận hành ở G0–G2 gần bằng 0: hosting tĩnh, không có máy chủ lab |
| NFR-007 | Không gửi dữ liệu cá nhân vào công cụ phân tích; tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025 khi có tài khoản |

## 15. Quy tắc nghiệp vụ

| Mã | Quy tắc |
|---|---|
| BR-001 | Một bài chỉ được đánh dấu "đã kiểm chứng" khi mọi lệnh và code trong bài đã chạy thành công trên môi trường ghi trong metadata |
| BR-002 | Không sao chép nội dung từ sách hay tài liệu có bản quyền; chỉ diễn giải và dẫn nguồn |
| BR-003 | Mã mục học không được đổi sau khi phát hành để không làm mất tiến độ người học |
| BR-004 | Mọi lab chỉ thao tác trên môi trường local của người học; không bài nào hướng dẫn chạy lệnh vào hệ thống thật của công ty |
| BR-005 | Bài có lệnh phá huỷ dữ liệu phải có cảnh báo rõ trước khối lệnh |

## 16. Ngoài phạm vi bản đầu

| Hạng mục | Lý do |
|---|---|
| Lab trong trình duyệt | Chi phí hạ tầng và vận hành cao; lab trên máy người học đã đủ để học |
| Thanh toán | Chưa có người dùng để kiểm chứng nhu cầu trả tiền |
| Video bài giảng | Tốn công sản xuất; bài viết tương tác cập nhật dễ hơn |
| XP, bảng xếp hạng, huy hiệu | Chưa cần để chứng minh giả thuyết cốt lõi |
| Ứng dụng di động | Web responsive đủ cho việc đọc; lab cần máy tính |
| Bản dịch nội dung sang ngôn ngữ khác | Cấu trúc đã sẵn sàng (FR-I18N-001 đến 003); dịch khi nội dung tiếng Việt đã ổn định |
| Roadmap cho các mảng ngoài backend | Tập trung hoàn thiện nhóm backend trước để chốt chuẩn nội dung |
| CMS cho nhiều tác giả | Hiện chỉ có một người viết; Git đủ dùng |

## 17. Tiêu chí nghiệm thu bản đầu (hết G1)

1. Trang web có danh mục roadmap, trang roadmap, trang bài học, tìm kiếm và theo dõi tiến độ trên trình duyệt; đường dẫn và giao diện đã có cấu trúc đa ngôn ngữ.
2. Ba roadmap Java, DevOps, Microservices có đủ 58 chặng, mỗi chặng có ít nhất một bài theo đúng khung 6 phần.
3. Hai dự án có trang tổng quan và đủ các mốc với tiêu chí nghiệm thu.
4. Build tự động kiểm tra được link hỏng, mã trùng và bài thiếu phần bắt buộc.
5. Ít nhất các bài của D0, D1 và J1 đạt trạng thái "đã kiểm chứng".

## 18. Quyết định đã chốt về kỹ thuật

| Ngày | Quyết định | Chi tiết |
|---|---|---|
| 03/10/2026 | Framework web: **Fumadocs trên Next.js** | [framework-comparison.md](framework-comparison.md) |
| 03/10/2026 | Static export, host trên **Cloudflare Pages** | [architecture.md](architecture.md#14-quyết-định-kiến-trúc-adr) (ADR-002) |
| 03/10/2026 | Nội dung chung repo với code, trong `content/` | ADR-006 |
| 03/10/2026 | Giấy phép: CC BY-NC-SA 4.0 cho nội dung, MIT cho code mẫu | ADR-007 |
| 03/10/2026 | Tiến độ lưu trên trình duyệt ở G0–G2; Supabase cùng RLS ở G3 | ADR-004 |

## 19. Quyết định còn mở

| Chủ đề | Lựa chọn | Cần chốt trước |
|---|---|---|
| Giấy phép cho code của trang web | MIT hoặc giữ bản quyền | Khi công khai repo |
| Tên miền và nhãn hiệu | Đăng ký `masteva.com`, kiểm tra nhãn hiệu | Trước khi công khai |
| Ngôn ngữ thứ hai và cách dịch | Tiếng Anh là ứng viên mặc định; dịch thủ công, dịch bằng AI rồi rà lại, hay cộng đồng đóng góp | G4 |
| Mảng roadmap tiếp theo sau backend | Frontend, mobile, data hay AI engineering | Sau G2 |
