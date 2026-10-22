# Spec: Bài đọc cho Java và Spring Boot

**Status:** ready-for-agent

Quyết định nền: ADR-0011 (bài đọc thay bài lab ở Java, Spring Boot, Microservices). Thuật ngữ theo `GLOSSARY.md`.

## Problem Statement

Chủ dự án dùng Masteva trước hết để tự ôn và nắm chắc Java, Spring Boot. 88 bài hiện tại có lab chiếm khoảng 77% độ dài, phần kiến thức chỉ khoảng 15% (trung vị khoảng 100 dòng mỗi bài). Đọc để ôn thì phải lội qua lab dài; kiến thức sâu lại nằm rải trong phần đào sâu dạng hỏi–đáp ẩn và trong các phát hiện chỉ xuất hiện giữa các bước lab. Mỗi bài còn có hàng chục ô đánh dấu từng ý và từng bước, trong khi người học chỉ cần biết mình đã học xong bài hay chưa.

So với roadmap.sh và các roadmap Java Spring Boot phổ biến, nội dung đã phủ gần hết nhưng còn khoảng trống: tự xây xác thực bằng JWT, Swagger/springdoc (J10.3 còn hứa sai rằng SB1 có springdoc), Spring AOP tự viết, tự viết annotation và reflection, RabbitMQ, CI/CD cho chính service Spring Boot, và vài chỗ sơ sài (pass-by-value, Cryptography/JCA, nén response, Spring Data JDBC, Gradle).

## Solution

Bài của roadmap Java và Spring Boot chuyển sang **bài đọc**: ba phần Mục tiêu → Kiến thức → Tài liệu, viết đầy đủ, chi tiết, dễ hiểu theo chuẩn trình bày mới (nghiên cứu trước khi viết). Kiến thức của phần đào sâu và các phát hiện từ lab (kèm output thật) nhập vào phần kiến thức; các bước lab bị gỡ. Câu hỏi–lời giải của phần đào sâu được chép riêng làm nguồn cho bộ câu hỏi phỏng vấn sau này. Mỗi bài đọc có một nút "Đã học xong bài" thay cho mọi ô đánh dấu; tiến độ chủ đề và roadmap tính từ nút này. Bài của DevOps và Kubernetes giữ dạng **bài lab** 6 phần như cũ.

Trong lúc viết lại từng chặng, các khoảng trống của chặng đó được lấp luôn. Các mục cố ý không dạy được ghi rõ trong mô tả roadmap.

## User Stories

1. As a người học ôn Java, I want mỗi bài chỉ gồm mục tiêu, kiến thức và tài liệu, so that tôi đọc liền một mạch mà không phải lướt qua lab dài.
2. As a người học, I want phần kiến thức đi từ cái gì → vì sao → cơ chế → khi nào dùng → sai ở đâu, so that tôi hiểu tận gốc chứ không chỉ nhớ cách dùng.
3. As a người học, I want các trường hợp biên, quyết định thiết kế và cơ chế bên trong (trước đây ẩn trong phần đào sâu) nằm ngay trong phần kiến thức, so that tôi không bỏ lỡ phần sâu nhất của bài.
4. As a người học, I want các hành vi khó đoán mà tài liệu chính thức không ghi (ví dụ `InetAddressFilter` không lọc lại sau redirect) được giải thích kèm output thật, so that tôi tin được điều bài khẳng định.
5. As a người học, I want ví dụ code ngắn, chạy được, kèm output mẫu, so that tôi thấy khái niệm vận hành thế nào mà không phải dựng cả một lab.
6. As a người học, I want sơ đồ cho các cơ chế nhiều bước (proxy của Spring, vòng đời persistence context…), so that tôi hình dung được luồng chạy.
7. As a người học, I want callout "Trên production" với tình huống thật, so that tôi biết kiến thức này quan trọng ở đâu khi đi làm.
8. As a người học, I want callout "Khi làm cùng AI" và "Liên hệ bài khác" ở cuối phần kiến thức, so that tôi vẫn có gợi ý dùng AI và đường sang bài liên quan sau khi phần đào sâu bị bỏ.
9. As a người học, I want phần tài liệu trỏ tới tài liệu chính thức và ghi rõ nên đọc phần nào, so that tôi biết đi sâu thêm ở đâu.
10. As a người học, I want bài viết theo giọng hướng dẫn người đọc ("bạn"), không kể chuyện người viết đã chạy thử, so that bài dễ theo.
11. As a người học, I want một nút "Đã học xong bài" ở cuối bài, so that tôi đánh dấu xong cả bài bằng một lần bấm.
12. As a người học, I want thấy ngay đầu bài là tôi đã học xong bài này hay chưa, so that tôi biết khi quay lại ôn.
13. As a người học, I want bấm lại nút để bỏ đánh dấu, so that tôi sửa được khi bấm nhầm hoặc muốn học lại.
14. As a người học, I want trạng thái "đã học xong" còn nguyên sau khi tải lại trang và đồng bộ giữa các tab, so that tiến độ không mất.
15. As a người học đã đăng nhập, I want trạng thái học xong bài đồng bộ qua tài khoản sang máy khác, so that tôi học tiếp ở đâu cũng được.
16. As a người học, I want chủ đề trên sơ đồ roadmap thành "đã xong" khi mọi bài của chủ đề đã học xong và "đang học" khi mới xong một phần, so that sơ đồ phản ánh đúng tiến độ.
17. As a người học, I want nút "Học tiếp" dẫn tới bài đọc kế tiếp chưa học xong, so that tôi không phải tự tìm.
18. As a người học, I want trạng thái tôi tự đặt cho chủ đề (đã biết, bỏ qua, chưa học) vẫn thắng trạng thái tính từ bài, so that hành vi quen thuộc không đổi.
19. As a người học, I want mục lục bài đọc liệt kê ba phần của bài, với các đề mục con của phần kiến thức lồng ngay dưới mục Kiến thức, so that mục lục khớp với nội dung và tôi nhảy thẳng tới khái niệm cần ôn trong một bài dài.
20. As a người học DevOps hoặc Kubernetes, I want bài lab giữ nguyên 6 phần và các ô đánh dấu từng bước, so that việc làm lab theo từng bước không bị ảnh hưởng.
21. As a người học Spring Boot, I want một bài về tự xây xác thực (đăng ký, đăng nhập, tự phát JWT, refresh token rotation và phát hiện token bị dùng lại) kèm giải thích khi nào nên chuyển sang IdP, so that tôi hiểu cách nhiều dự án thực tế đang làm và vì sao Masteva khuyên dùng Keycloak.
22. As a người học Spring Boot, I want học Swagger/springdoc ở bài REST của SB1, so that tôi tài liệu hoá API như hằng ngày đi làm; và J10.3 không còn hứa một nội dung không tồn tại.
23. As a người học Spring Boot, I want một bài về Spring AOP tự viết (`@Aspect`, pointcut, advice), so that tôi hiểu nền của `@Transactional`, `@Cacheable` và trả lời được câu phỏng vấn phổ biến.
24. As a người học Java, I want một bài về tự viết annotation (`@interface`, `@Retention`, `@Target`), reflection và annotation processor, so that tôi hiểu framework đọc annotation thế nào.
25. As a người học Spring Boot, I want một bài RabbitMQ ngang hàng với Kafka trong chặng cache và messaging, so that chủ đề "chọn Kafka hoặc RabbitMQ" có bài cho cả hai lựa chọn.
26. As a người học Spring Boot, I want một bài CI/CD cho chính service Spring Boot (build, test có Testcontainers trong CI, đóng image, deploy, rollback), so that tôi nối được phần đóng gói với quy trình giao hàng.
27. As a người học Java, I want pass-by-value được giải thích rõ với tham số method, so that tôi không nhầm ở câu hỏi kinh điển này.
28. As a người học, I want phần Cryptography/JCA (`Cipher`, AES-GCM, `SecureRandom`, `KeyStore`, chữ ký số) được dạy, so that tôi không chỉ biết mỗi `MessageDigest`.
29. As a người học, I want nén response, Spring Data JDBC và Gradle được mở rộng khỏi mức nhắc qua, so that các chủ đề này không còn sơ sài.
30. As a người học, I want mô tả roadmap ghi rõ các công nghệ cố ý không dạy (Bazel, Javalin, Play, EBean, TestNG, Cucumber, Log4j2/TinyLog, JSP) và lý do, so that tôi biết đó là lựa chọn có chủ đích chứ không phải thiếu sót.
31. As a chủ dự án, I want một chuẩn viết bài đọc dựa trên nghiên cứu về cách trình bày kiến thức kỹ thuật, so that mọi bài viết lại theo cùng một chuẩn chất lượng.
32. As a chủ dự án, I want duyệt một bài mẫu (J5.3) trước khi viết lại hàng loạt, so that tôi chỉnh hướng sớm khi còn rẻ.
33. As a chủ dự án, I want viết lại theo từng đợt chặng và lấp khoảng trống của chặng ngay trong đợt đó, so that mỗi chặng chỉ phải mở một lần.
34. As a chủ dự án, I want câu hỏi–lời giải của phần đào sâu được chép riêng theo bài, so that sau này dựng bộ câu hỏi phỏng vấn mà không phải soạn lại từ đầu.
35. As a chủ dự án, I want tầm nhìn sản phẩm ghi giá trị cốt lõi mới (bài đọc đầy đủ; thực hành ở dự án; ôn phỏng vấn ở bộ câu hỏi), so that tài liệu không mâu thuẫn với ADR-0011.
36. As a tác giả (agent viết bài), I want khai báo dạng bài trong frontmatter của từng bài, so that một bài DevOps thuần lý thuyết cũng có thể là bài đọc.
37. As a tác giả, I want `content:check` báo lỗi khi bài đọc sai thứ tự ba phần, có ô đánh dấu, hoặc bài thiếu khai báo dạng bài, so that lỗi cấu trúc bị chặn trước khi build.
38. As a tác giả, I want bài lab vẫn bị kiểm đủ 6 phần đúng thứ tự như cũ, so that thay đổi không làm lỏng kiểm tra của DevOps và Kubernetes.
39. As a tác giả, I want định nghĩa rõ `verified` của bài đọc, so that tôi biết phải chạy thật những gì trước khi đặt trạng thái này.
40. As a người duyệt, I want đọc mỗi bài với vai người học lần đầu gặp chủ đề, so that bài dễ hiểu với người đọc thật chứ không chỉ đúng kỹ thuật.

## Implementation Decisions

**Dạng bài**
- Frontmatter mỗi bài có trường dạng bài, bắt buộc, hai giá trị: bài đọc và bài lab. Mọi bài DevOps và Kubernetes hiện có được khai báo là bài lab trong cùng thay đổi.
- Hằng số khung bài tách thành hai khung theo dạng bài: bài đọc là Goal → Knowledge → Resources; bài lab giữ Goal → Knowledge → Resources → Practice → DeepDive → Mastery. Component phần bài và mục lục bài dùng khung theo dạng bài của bài đang hiển thị. Mục lục bài đọc lồng các đề mục `###` của bài dưới mục Kiến thức (đề mục `###` của bài đọc chỉ nằm trong phần kiến thức); mục lục bài lab giữ sáu mục.

**Kiểm tra cấu trúc**
- Phần trích xuất và kiểm tra cấu trúc bài nhận thêm dạng bài. Với bài đọc: đúng ba phần theo thứ tự, không có `<Check>` nào; mã mục duy nhất của bài là `<mã bài>.done`, do hệ thống sinh ra chứ tác giả không viết. Với bài lab: giữ nguyên quy tắc hiện tại.
- Mã `.done` đi qua các bước sẵn có như mọi mã mục khác: khoá trong file khoá mã, kiểm bản dịch, manifest lấy danh sách mã mục của bài.

**Tiến độ và giao diện**
- Không đổi mô hình tiến độ, đồng bộ tài khoản, cách tính trạng thái chủ đề hay "Tôi đã biết". Bài đọc có đúng một mục, nên tiến độ bài là 0/1 hoặc 1/1 và chủ đề tự tính đúng từ đó.
- Trang bài đọc có nút "Đã học xong bài" ở cuối phần kiến thức/tài liệu; nút bật tắt mục `<mã bài>.done` qua kho tiến độ hiện có. Thanh tiến độ đầu bài hiển thị trạng thái "Đã học xong"/"Chưa học xong" thay cho "Đã xong n/m mục".

**Mã đã khoá**
- Đây là lần đặt lại một lần (ADR-0011): khi một bài chuyển sang bài đọc, mọi mã mục cũ của bài bị xoá thẳng khỏi danh sách `ids` của file khoá mã, không qua `replacements`. Không thêm cơ chế `retired`. Quy tắc BR-003 giữ nguyên cho mọi thay đổi khác.

**Chuẩn nội dung và tầm nhìn**
- Trước khi viết lại có một vòng nghiên cứu (`/research`) về cách trình bày bài kỹ thuật dễ hiểu, nguồn sơ cấp đáng tin (ví dụ Diátaxis phần explanation, hướng dẫn viết tài liệu của các dự án có tiếng về cách giải thích, nghiên cứu về tải nhận thức). Kết quả là một file nghiên cứu có trích dẫn trong repo.
- `docs/content-standard.md` thêm phần bài đọc: khung ba phần, cách viết phần kiến thức (từ kết quả nghiên cứu), quy tắc ví dụ code và output, chỗ đặt callout, giọng văn hướng dẫn người học, và định nghĩa `verified` của bài đọc: mọi đoạn code và output trong bài đã chạy thật với phiên bản ghi trong `verified`; khẳng định về hành vi API phải có tài liệu chính thức hoặc output làm dẫn chứng.
- `docs/product-vision.md` sửa giá trị cốt lõi theo ADR-0011.

**Viết lại bài**
- Mỗi bài viết lại: nhập kiến thức của phần đào sâu vào phần kiến thức; nhập các phát hiện từ lab kèm output tiêu biểu; chuyển hai callout "Khi làm cùng AI" và "Liên hệ bài khác" xuống cuối phần kiến thức; gỡ các bước lab, phần đào sâu và phần "Dấu hiệu đã nắm chắc".
- Câu hỏi–lời giải của phần đào sâu được chép nguyên dạng hỏi–đáp vào một nguồn riêng theo roadmap (không hiển thị trên trang, không qua `content:check`), mỗi câu ghi mã bài gốc.
- Bài mẫu là J5.3; chỉ viết lại hàng loạt sau khi chủ dự án duyệt bài mẫu.
- Viết lại theo đợt chặng; mỗi đợt lấp luôn khoảng trống của chặng đó:

| Khoảng trống | Chỗ đặt |
|---|---|
| Tự xây xác thực: đăng ký/đăng nhập, tự phát JWT, refresh token rotation và phát hiện dùng lại, khi nào chuyển sang IdP | Bài mới SB6.4 |
| Swagger/springdoc; sửa câu hứa sai ở J10.3 | Mục mới trong SB1.3 |
| Spring AOP tự viết | Bài mới trong SB1 |
| Tự viết annotation, reflection, annotation processor | Bài mới trong J3 |
| RabbitMQ | Bài mới trong SB9 |
| CI/CD cho service Spring Boot | Bài mới trong SB11 |
| Pass-by-value | Mở rộng J2.1 |
| Cryptography/JCA | Mở rộng bài phù hợp (J9 hoặc SB13), chọn khi viết đợt đó |
| Nén response | Mở rộng SB12 |
| Spring Data JDBC | Mở rộng SB5.4 |
| Gradle | Mở rộng J7 |

- Bài mới thêm chủ đề vào chặng khi chặng chưa có chủ đề tương ứng (mã chủ đề mới được khoá như thường). Mô tả roadmap Java và Spring Boot thêm danh sách cố ý không dạy kèm lý do.
- Sửa kèm khi viết lại SB1.4: bỏ cách tạo `RestClient` trái lời khuyên của SB7.1.

## Testing Decisions

- Test kiểm hành vi quan sát được qua giao diện công khai, không kiểm chi tiết cài đặt. Chủ dự án đã duyệt hai chỗ kiểm thử, đều là chỗ đã có test:
  1. **Kiểm tra cấu trúc bài** (unit, cùng nhóm test kiểm tra nội dung hiện có): đầu vào là nội dung bài và dạng bài; đầu ra là lỗi và mã mục. Các trường hợp: bài đọc đúng ba phần thì hợp lệ và có đúng một mã `<mã bài>.done`; bài đọc sai thứ tự hoặc thiếu phần thì lỗi; bài đọc có `<Check>` thì lỗi; bài lab vẫn phải đủ 6 phần đúng thứ tự; bài thiếu khai báo dạng bài thì lỗi.
  2. **Trang bài đọc** (E2E, cùng bộ E2E luồng học hiện có): trang có ba phần; mục lục có ba mục của ba phần, các đề mục `###` của phần kiến thức lồng ngay sau mục Kiến thức và trỏ tới đề mục nằm trong phần đó; bấm "Đã học xong bài", tải lại vẫn giữ; chủ đề của bài thành "đã xong" trên trang roadmap; bấm lại thì bỏ đánh dấu. Các E2E hiện có dựa vào việc tích mục trong bài Java phải chuyển sang bài lab (DevOps/Kubernetes) hoặc sang nút "Đã học xong bài".
- Không viết test mới cho mô hình tiến độ (không đổi; đã có test tally và trạng thái chủ đề) và cho việc xoá mã cũ khỏi file khoá (một lần; `content:check` chạy qua là đủ).
- Theo `CLAUDE.md`, TDD bắt buộc cho phần kiểm tra nội dung: viết test ở chỗ kiểm thử 1 trước khi đổi code.
- Ticket viết lại bài không có test tự động; nghiệm thu theo quy định ticket nội dung trong `CLAUDE.md`: `pnpm content:check`, `pnpm build`, chạy thật mọi đoạn code và output trong bài, một lượt đọc với vai người học lần đầu gặp chủ đề. Thay đổi code kết thúc bằng `pnpm verify` xanh.

## Out of Scope

- Bài của roadmap Microservices (spec riêng, cũng dạng bài đọc), gồm cả Spring Cloud cổ điển (Eureka, OpenFeign, Config Server, Spring Cloud Gateway) dạy theo kiểu so sánh với cách làm hiện đại.
- Giao diện và nội dung bộ câu hỏi phỏng vấn, sổ tay sự cố, đề cương dự án (spec riêng). Spec này chỉ chép câu hỏi–lời giải của phần đào sâu làm nguồn.
- Bài của DevOps và Kubernetes: chỉ thêm khai báo dạng bài lab, không đổi nội dung. Chuyển một bài DevOps lý thuyết sang bài đọc là việc sau.
- Đổi nhãn "Tự kiểm tra" của ô đánh dấu trong bài lab.
- Bản dịch tiếng Anh.
- Chuyển tiến độ cũ của người học (chưa có người dùng thật; xem ADR-0011).

## Further Notes

- Thứ tự phụ thuộc: nghiên cứu → sửa chuẩn nội dung → bài mẫu J5.3 (chờ duyệt) → viết lại theo đợt chặng. Thay đổi code (dạng bài, kiểm tra cấu trúc, nút "Đã học xong bài") phải xong trước bài mẫu, vì bài mẫu cần hiển thị đúng dạng bài đọc để duyệt. Sửa tầm nhìn sản phẩm làm được bất cứ lúc nào.
- 88 bài thuộc 28 chặng (Java J1–J14, Spring Boot SB1–SB14; sáu chặng của Spring Boot nằm trong thư mục mang mã `j`). Đợt viết lại chạy song song được giữa các chặng vì không còn lab nặng; chỉ đoạn code và output trong bài cần chạy thật.
- Tầm nhìn sản phẩm hiện ghi "mọi khái niệm quan trọng đều đi kèm lab chạy được trên máy thật" là điểm khác biệt với roadmap.sh; sau spec này, điểm khác biệt là độ đủ và độ sâu của bài, cùng dự án và bộ câu hỏi phỏng vấn.
