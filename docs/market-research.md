# Nghiên cứu thị trường và đối thủ

Ngày khảo cứu: 03/10/2026. Giá và tính năng thay đổi thường xuyên; kiểm tra lại trước khi dùng cho quyết định thương mại.

Quy ước trong tài liệu:

- **Evidence**: dữ kiện có nguồn trực tiếp.
- **Suy ra**: kết luận rút từ evidence, chưa được kiểm chứng riêng.
- **Chưa xác nhận công khai**: không tìm thấy nguồn, không có nghĩa là không tồn tại.

## 1. Bối cảnh

| Dữ kiện | Nguồn |
|---|---|
| 68% lập trình viên học từ tài liệu kỹ thuật, 59% từ tài nguyên online; 44% dùng AI để học (2024: 37%). Người học dùng ít công cụ hơn, gom về một số nguồn chính | [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/) |
| "Vibe coding" (viết phần mềm bằng cách mô tả cho AI) là Từ của năm 2025 của Collins | [i-programmer](https://www.i-programmer.info/news/85-humour-/18446-vibe-coding-is-collins-word-of-the-year-2025.html) |
| Code do AI sinh ra có lỗ hổng bảo mật ở 45% tác vụ; Java có tỷ lệ thất bại về bảo mật trên 70% | [Veracode 2025 GenAI Code Security Report](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/) |
| Khoảng 560.000 người làm CNTT ở Việt Nam; giai đoạn 2023–2025 thiếu 150.000–200.000 lập trình viên mỗi năm (TopDev) | [Đại biểu Nhân dân](https://daibieunhandan.vn/thieu-hut-so-luong-lon-nhan-su-nganh-it-10319493.html), [Kyanon Digital](https://kyanon.digital/labour-of-vietnam-it-industry-in-2023-and-prediction-for-2024/) |
| Trong 10 kỹ thuật học được đánh giá, **tự kiểm tra (practice testing)** và **ôn tập giãn cách (distributed practice)** hiệu quả nhất; đọc lại và tô đậm hiệu quả thấp | [Dunlosky et al. 2013, APS](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html) |

**Suy ra:**

- AI giúp viết code nhanh hơn nhưng không thay được hiểu biết nền tảng; người dùng AI vẫn cần đủ kiến thức để đọc, kiểm tra và vận hành code AI sinh ra. Đây là nhu cầu học mới, đặc biệt ở nhóm vibe coder.
- Người học muốn ít nguồn hơn: một nơi đủ sâu có lợi thế so với danh sách đường link.
- Thiết kế bài học nên dựa vào tự kiểm tra và ôn tập, không chỉ cho đọc.

## 2. Đối thủ và sản phẩm tham chiếu

### 2.1 Bản đồ "học gì"

**roadmap.sh**

- Evidence:
  - 2,8 triệu người đăng ký; repo GitHub đứng thứ 6 về số sao ([roadmap.sh/about](https://roadmap.sh/about)).
  - Roadmap tương tác, bấm vào mục để đọc mô tả và tài nguyên; do cộng đồng biên soạn ([GitHub](https://github.com/nilbuild/developer-roadmap)).
  - Gói miễn phí có ô đánh dấu tiến độ và streak, không có XP hay bảng xếp hạng.
  - Premium $10/tháng: AI tutor, khoá học do AI sinh, AI chỉnh roadmap ([roadmap.sh/premium](https://roadmap.sh/premium), [craftcourse](https://craftcourse.app/blog/roadmap-sh-alternative)).
- Suy ra:
  - Mạnh nhất ở việc trả lời "cần học những gì".
  - Phần dạy chủ yếu trỏ ra nguồn ngoài hoặc do AI sinh; chưa xác nhận công khai có lab được kiểm chứng hay dự án xuyên suốt.

### 2.2 Lab thực hành hạ tầng

**iximiuz Labs**

- Evidence:
  - Playground Linux, Docker, Kubernetes, networking chạy trong trình duyệt; có challenge, tutorial, course, roadmap thực hành.
  - Miễn phí 1 playground, 1 giờ/ngày; Premium $10/tháng, đang giảm còn $5 ([pricing](https://labs.iximiuz.com/pricing)).
  - Năm 2025: 21.000 học viên mới, 160.000 VM, 31.000 lượt nộp challenge, 3.000 thành viên trả phí (2.000 mua trọn đời), doanh thu $185K, năm đầu tiên có lãi ([wrap-up 2025](https://newsletter.iximiuz.com/posts/iximiuz-labs-year-wrap-up-major-milestones-usage-and-revenue-numbers-and-plans-for-2026)).
  - Định dạng thành công nhất: roadmap thực hành (Docker), challenge có lời giải, skill path.
  - Bài học họ rút ra: giá rẻ quan trọng; playground chia sẻ được như một mục trong CV; tính năng tạm dừng/tiếp tục playground là thứ được yêu cầu nhiều nhất.
- Suy ra:
  - Có người trả tiền cho học hạ tầng bằng thực hành.
  - Chi phí và vận hành VM là gánh nặng lớn (họ phải chuyển sang máy chủ bare-metal).

**Killercoda**

- Evidence:
  - Môi trường Linux và Kubernetes trong trình duyệt; ai cũng tạo được kịch bản; tương thích định dạng Katacoda.
  - Miễn phí: phiên 4 giờ, 3 kịch bản cùng lúc; gói khoá CKA/CKAD $19,99/tháng ([freetier.co](https://freetier.co/directory/products/killercoda)).
- Suy ra: nội dung rời rạc theo kịch bản; không thay được một lộ trình.

**KodeKloud**

- Evidence: Standard $15/tháng, Pro $30, AI $46, Business $330/người/năm; khoá học kèm lab, playground DevOps ([Capterra](https://www.capterra.com/p/239528/Kodekloud/pricing/)).
- Suy ra: hướng tới chứng chỉ, giá cao so với người học Việt Nam.

**LabEx**

- Evidence: lab Linux, DevOps, lập trình theo skill tree, không có video, có trợ lý AI; có gói Free và Pro ([G2](https://ai.g2.com/marketplace/tools/labex)).
- Giá cụ thể: chưa xác nhận công khai trong lần khảo cứu này.

### 2.3 Học lập trình bằng thực hành

**Boot.dev**

- Evidence:
  - Lộ trình Backend, DevOps có tính game; người học viết code thật trong trình duyệt và trên máy mình.
  - $59/tháng hoặc $399/năm; chương đầu mỗi khoá miễn phí ([boot.dev](https://www.boot.dev/gifts), [Scrimba review](https://scrimba.com/articles/best-boot-dev-alternatives-2026/)).
  - Có CLI `bootdev run <lesson> -s` chạy lệnh trên máy người học để chấm bài ([lesson](https://www.boot.dev/lessons/b7439eef-e733-4a11-9cd9-68d7526c071a)).
- Suy ra: chấm bài thực hành trên máy local là khả thi, không cần thuê VM.

**CodeCrafters**

- Evidence:
  - Tự xây Redis, Git, Docker, Kafka…; mỗi chặng có bộ test chạy trên code của người học, nhiều ngôn ngữ kể cả Java.
  - Khoảng $40/tháng; gọi vốn hạt giống $1,8 triệu ([TechCrunch](https://techcrunch.com/2024/11/19/codecrafters-wants-to-challenge-seasoned-developers-with-hard-to-build-projects), [GitHub](https://github.com/codecrafters-io/build-your-own-redis)).
- Suy ra: lập trình viên có kinh nghiệm sẵn sàng trả tiền cho dự án khó có kiểm chứng tự động.

**Hyperskill (JetBrains Academy)**

- Evidence:
  - Học theo dự án, tích hợp IntelliJ; có khoá Java Backend Developer (Spring Boot).
  - Từ €49,90/tháng; Premium mở 300+ dự án và gợi ý bằng AI ([Hyperskill blog](https://hyperskill.org/blog/post/best-platforms-to-learn-java-for-working-professionals-in-2026), [FitGap](https://us.fitgap.com/products/hyperskill)).
- Suy ra: tích hợp với IDE thật là điểm cộng lớn cho người học Java.

**Exercism**

- Evidence: track Java 149 bài, 26 khái niệm, phân tích code tự động, mentor là người thật, miễn phí 100% ([exercism.org](https://exercism.org/docs/tracks/java/learning)).
- Suy ra: mentor và phản hồi trên code là giá trị cao nhưng khó mở rộng nếu không có cộng đồng.

**Educative**

- Evidence: 1.600+ khoá học dạng chữ, chạy code trong trình duyệt, cloud lab, skill path; năm 2026 thêm AI mock interview. Giá từ khoảng $13 tới $59/tháng tuỳ gói ([substack review](https://reactjava.substack.com/p/does-educative-text-based-courses), [PricingSaaS](https://pricingsaas.com/companies/educative)).
- Suy ra: dạng bài chữ kèm chạy code được người đi làm ưa chuộng vì đọc nhanh hơn xem video.

**Codecademy**

- Evidence: Basic miễn phí; Plus $34,99/tháng; Pro $59,99/tháng gồm career path, chứng chỉ, luyện phỏng vấn ([SkillScouter](https://skillscouter.com/codecademy-review/)).

**Scrimba**

- Evidence: "scrim" ghi lại thao tác gõ phím thay vì video, người học dừng lại và sửa code ngay trong bài; Pro $24,50/tháng theo năm hoặc $49/tháng, có giá theo khu vực ([Scrimba](https://scrimba.com/articles/scrimba-vs-coursera)).
- Suy ra: tính tương tác của bài học là yếu tố cạnh tranh, không chỉ nội dung.

### 2.4 Việt Nam

**F8 (fullstack.edu.vn)**

- Evidence: miễn phí, lộ trình rõ, mạnh về web frontend (HTML, CSS, JavaScript, React), cộng đồng Facebook/Discord sôi nổi; nguồn bên thứ ba ghi hơn 36.000 học viên ([Phong Vũ](https://phongvu.vn/cong-nghe/tong-hop-cac-website-hoc-lap-trinh/)).

**CodeLearn (FPT)**

- Evidence: hơn 20 khoá (C, C++, Java, Python, thuật toán), hơn 1.000 bài tập; giải Gold Stevie 2025 về đổi mới công nghệ giáo dục ([FPT IS](https://fpt-is.com/en/codelearn-empowering-a-generation-of-vietnamese-with-programming-mindsets/)).

**Viblo (Sun\*)**

- Evidence: nền tảng chia sẻ bài viết kỹ thuật cho lập trình viên Việt ([Viblo](https://viblo.asia/p/nhung-website-tu-hoc-lap-trinh-hieu-qua-924lJGAX5PM)).

**Suy ra:** chưa thấy nền tảng tiếng Việt công bố lộ trình sâu, có lab thực hành và dự án xuyên suốt cho backend Java, DevOps, Microservices. Đây là kết luận từ phạm vi khảo cứu hiện tại, cần kiểm tra thêm (TechMaster, Cybersoft, 200Lab, các khoá trên Udemy tiếng Việt).

## 3. So sánh theo năng lực

| Năng lực | Ai làm tốt | Vấn đề giải quyết | Hàm ý cho Masteva | Phân loại |
|---|---|---|---|---|
| Lộ trình có thứ tự | roadmap.sh, iximiuz (roadmap thực hành) | Không biết học gì, theo thứ tự nào | Roadmap dạng bước có điều kiện tiên quyết | Lõi |
| Nội dung tự chứa, đủ sâu | Educative, Boot.dev | Phải nhảy qua nhiều nguồn | Mỗi bài đủ để học mà không cần rời trang | Lõi |
| Thực hành có kiểm chứng | Boot.dev CLI, CodeCrafters, iximiuz | Học xong không làm được | Lab chạy trên máy người học, có CLI kiểm tra | Lõi (CLI ở giai đoạn sau) |
| Môi trường trong trình duyệt | iximiuz, Killercoda, KodeKloud | Không phải cài đặt | Chi phí cao; dùng lab local trước, cân nhắc sau | Ngoài phạm vi bản đầu |
| Dự án lớn xuyên suốt | Hyperskill, CodeCrafters | Kiến thức rời rạc | Dự án hub hội thoại và Neobank | Lõi |
| Tương tác trong bài | Scrimba, Educative | Đọc thụ động | Sơ đồ tương tác, "đoán output", chạy snippet | Lõi (một phần), mở rộng sau |
| Tự kiểm tra và ôn tập | Exercism (phản hồi), Codecademy (quiz) | Quên nhanh | Câu hỏi tự kiểm tra cuối bài, ôn tập giãn cách | Lõi (câu hỏi), sau (ôn tập) |
| Theo dõi tiến độ | Tất cả | Mất động lực, không biết đang ở đâu | Đánh dấu, đồng bộ theo tài khoản | Lõi |
| Mentor, cộng đồng | Exercism, F8 | Bí không có người hỏi | Thảo luận theo bài | Mở rộng |
| AI tutor | roadmap.sh, LabEx, Educative | Hỏi đáp tức thì | Hỏi đáp dựa trên nội dung bài | Mở rộng |
| Hồ sơ chia sẻ được | iximiuz (playground như CV) | Chứng minh năng lực | Trang tiến độ công khai | Mở rộng |

## 4. Mặt bằng giá

| Nền tảng | Giá/tháng (USD) |
|---|---|
| iximiuz Labs | 5–10 |
| roadmap.sh Premium | 10 |
| Educative | khoảng 13–59 |
| KodeKloud | 15–46 |
| Killercoda (gói khoá) | 19,99 |
| Scrimba Pro | 24,50–49 |
| Codecademy | 34,99–59,99 |
| CodeCrafters | khoảng 40 |
| Hyperskill | từ €49,90 |
| Boot.dev | 59 (hoặc $399/năm) |

**Suy ra:** mặt bằng quốc tế từ $5 đến $60 mỗi tháng. Với người học Việt Nam, phần lõi nên miễn phí để có người dùng; nếu thu tiền sau này, mức giá phải theo khu vực, như Scrimba đang làm.

## 5. Bài học rút ra

1. **Roadmap thực hành là định dạng ăn khách** (iximiuz). Lộ trình là bộ khung, giá trị nằm ở phần thực hành bên trong.
2. **Kiểm chứng tự động tạo niềm tin.** Bộ test của CodeCrafters và CLI của Boot.dev cho người học biết chắc mình đã làm đúng.
3. **Hạ tầng VM đắt.** Bắt đầu bằng lab trên máy người học (Docker, kind, Lima) để chi phí gần bằng 0.
4. **Giá thấp và phần miễn phí rộng giúp tăng trưởng** (iximiuz tăng gấp đôi số bài nộp nhờ mở rộng gói miễn phí).
5. **Khả năng chia sẻ kéo người dùng mới** (playground như CV).
6. **Nội dung tự chứa thắng danh sách link**, vì người học đang gom về ít nguồn hơn.

## 6. Khoảng trống Masteva nhắm tới

> Lộ trình **tiếng Việt**, **đầy đủ và tự chứa**, **trực quan**, có **lab chạy trên máy thật** và **dự án xuyên suốt**, cho backend Java, DevOps và Microservices. Mỗi bài dạy cả cách dùng AI cho đúng.

Đây là điểm bắt đầu: Masteva hướng tới lập trình viên nói chung và đa ngôn ngữ, nhưng chọn mở đầu ở thị trường Việt Nam và nhóm roadmap backend, nơi khoảng trống rõ nhất.

Không đối thủ nào trong phạm vi khảo cứu kết hợp đủ cả năm yếu tố cho thị trường Việt Nam. roadmap.sh có lộ trình nhưng thiếu chiều sâu thực hành; iximiuz có lab nhưng chỉ có tiếng Anh và tập trung hạ tầng; F8 và CodeLearn có tiếng Việt nhưng chưa đi sâu vào backend production.

## 7. Rủi ro thị trường

- **AI làm thay vai trò giải thích.** Người học có thể hỏi AI thay vì đọc bài. Giảm rủi ro: giá trị nằm ở lộ trình đã được chọn lọc, lab đã kiểm chứng, dự án lớn và tiến độ, những thứ AI không cho sẵn.
- **roadmap.sh miễn phí và có thương hiệu toàn cầu.** Không cạnh tranh trực diện ở chiều rộng; cạnh tranh ở chiều sâu, thực hành và ngôn ngữ địa phương.
- **Thị trường trả phí ở Việt Nam nhỏ.** Đa ngôn ngữ đã nằm trong kế hoạch; bán cho doanh nghiệp (đào tạo nội bộ) là hướng bổ sung.
- **Sản xuất nội dung chất lượng tốn công.** Đây là rủi ro lớn nhất, xem cách giảm ở [content-standard.md](content-standard.md).
