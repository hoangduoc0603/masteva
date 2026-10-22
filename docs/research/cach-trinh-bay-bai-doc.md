# Cách trình bày bài đọc kỹ thuật cho Masteva

Ngày nghiên cứu: 22/10/2026. Đầu vào cho ticket 03 (chuẩn bài đọc trong `docs/content-standard.md`), thuộc spec `.scratch/bai-doc-java-spring-boot/`.

**Câu hỏi:** bài giải thích kiến thức kỹ thuật nên trình bày và hành văn thế nào để người đọc hiểu sâu và nhớ lâu khi không có lab đi kèm?

**Phạm vi:** phần Kiến thức của bài đọc (Mục tiêu → Kiến thức → Tài liệu) cho Java và Spring Boot. Không bàn giao diện, mô hình tiến độ hay bài lab DevOps.

**Quy ước độ tin cậy:**

| Nhãn | Nghĩa |
|---|---|
| **[nghiên cứu]** | Bằng chứng thực nghiệm (thí nghiệm, meta-analysis, khảo sát lập trình viên) |
| **[hướng dẫn]** | Khuyến nghị của style guide hoặc khung tài liệu có tiếng; là kinh nghiệm nghề, không phải thí nghiệm |
| **[suy luận]** | Suy ra cho Masteva từ hai loại trên; chưa có bằng chứng trực tiếp |
| **[đo]** | Chạy thật trên máy của chủ dự án ngày nghiên cứu, ghi kèm phiên bản |

**Mức đọc nguồn:** mỗi nguồn ở mục 5 ghi rõ đã đọc toàn văn, một phần hay chỉ abstract. Phần lớn bài báo đứng sau paywall nên chỉ đọc được abstract; khẳng định dựa trên abstract chỉ dùng đúng những gì abstract nói. Hệ số hiệu ứng (d, g) chép đúng như nguồn công bố.

**Giới hạn chung:** phần lớn nghiên cứu học tập làm với học sinh, sinh viên, chủ đề toán và khoa học, thường là bài multimedia ngắn. Áp sang lập trình viên đọc bài tiếng Việt dài là **[suy luận]**. Hiệu ứng *expertise reversal* cũng cho thấy kỹ thuật giúp người mới có thể vô ích với người đã biết ([Kalyuga 2003][kalyuga2003]; [Sweller 2019][sweller2019]).

---

## 0. Kết luận ngắn

1. **Khung "cái gì → vì sao → cơ chế → khi nào dùng → sai ở đâu" đúng hướng, nên giữ.** Diátaxis coi "vì sao" là trọng tâm của explanation, và nghiên cứu về API cho thấy hiểu ý đồ thiết kế giải thích được các hành vi "bí ẩn" của API ([Diátaxis][diataxis-exp]; [Robillard 2009][robillard2009]). Chỉ cần đổi hai điểm: mở mỗi khái niệm bằng một tình huống cụ thể, và đặt "sai ở đâu" ngay cạnh khái niệm nó thuộc về.
2. **Ví dụ cụ thể trước, quy tắc sau.** Concreteness fading, học qua ví dụ mẫu (*worked example*) và so sánh tình huống đều ủng hộ thứ tự này ([Fyfe 2014][fyfe2014]; [Sweller 2019][sweller2019]; [Alfieri 2013][alfieri2013]).
3. **Trước một cơ chế nhiều bước, giới thiệu riêng từng thành phần.** Biết tên và đặc điểm của các thành phần trước giúp người học hiểu cơ chế tốt hơn (pre-training d = 0,78) ([Mayer 2024][mayer2024]; [Mayer 2002][mayer2002]).
4. **Output đặt ngay sau code; nhãn đặt ngay trên sơ đồ; chữ không kể lại những gì hình đã nói.** Đây là ba hiệu ứng split-attention, spatial contiguity và redundancy ([Sweller 2019][sweller2019]; [Mayer 2024][mayer2024]).
5. **Nêu sai lầm thường gặp theo kiểu refutation**: nêu quan niệm sai, nói rõ là sai, rồi giải thích cơ chế. Phần mang hiệu quả là giải thích cơ chế: trong Kendeou 2014, chỉ giải thích đã hiệu quả ngang bác bỏ kèm giải thích. Nêu quan niệm sai vẫn đáng giữ vì nó cho người đọc biết đoạn này sửa đúng điều họ đang nghĩ **[suy luận]** ([Tippett 2010][tippett2010]; [Kendeou 2014][kendeou2014]).
6. **Không có lab thì phải có truy xuất (retrieval).** Tự kiểm tra là kỹ thuật có bằng chứng mạnh nhất. Đọc lại và tô đậm có hiệu quả thấp ([Roediger 2006][roediger2006]; [Dunlosky 2013][dunlosky2013]; [IES 2007][ies]). Đề xuất ban đầu: vài chỗ "Đoán trước" trong bài và 3–5 "câu hỏi ôn" có đáp án ẩn ở cuối phần Kiến thức. **Chủ dự án đã quyết (22/10/2026): không thêm câu hỏi ôn**; bài đọc giữ đúng ba phần như spec, chỉ dùng các chỗ "Đoán trước" trong bài.
7. **Đoạn văn 2–5 câu, câu mở nêu ý chính, một ý một câu.** Các style guide gần như thống nhất điểm này ([Google][g-para]; [Kubernetes][k8s]; [Microsoft][ms-scan]).
8. **Callout dùng ít.** Thông tin người đọc cần để hiểu không đặt trong callout. Không để hai callout liền nhau ([Google notices][gs-notice]).
9. **Giọng trò chuyện, xưng "bạn"** giúp người học vận dụng tốt hơn (personalization d = 1,00), nhưng hiệu ứng nhỏ dần ở bài học dài ([Mayer 2024][mayer2024]; [Ginns 2013][ginns2013]). Tránh "dễ dàng", "đơn giản", "chỉ cần" ([Kubernetes][k8s] cấm "just", "simply", "easy"; danh sách tiếng Việt là **[suy luận]**).
10. **Bài đọc vẫn phải là explanation.** Không biến phần Kiến thức thành hướng dẫn từng bước hay bảng tra cứu đầy đủ; tra cứu thì trỏ sang Javadoc ở phần Tài liệu ([Diátaxis][diataxis-exp]).

---

## 1. Khuyến nghị cụ thể

Mỗi dòng gồm khuyến nghị (làm được ngay), lý do và nguồn. Mã khuyến nghị `n.m` là dòng m của nhóm n; mục 2 và 3 dẫn lại khuyến nghị bằng mã này.

### Nhóm 1. Thứ tự trình bày một khái niệm

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 1.1 | Mở mỗi khái niệm bằng một tình huống cụ thể dài 1–3 câu: một output lạ, một lỗi quen, một câu hỏi phỏng vấn. Sau đó mới định nghĩa. | Concreteness fading: bắt đầu từ cái cụ thể rồi chuyển dần sang trừu tượng giúp người học hiểu ký hiệu trừu tượng qua thứ đã hiểu **[nghiên cứu, abstract]**. Google khuyên so sánh ý mới với thứ người đọc đã biết **[hướng dẫn]**. Câu hỏi đặt trước có thể giúp học phần trả lời sau đó **[nghiên cứu, abstract; IES xếp bằng chứng "minimal"]**. | [Fyfe 2014][fyfe2014]; [Google documents][g-docs]; [Pan & Carpenter 2023][pan2023]; [IES 2007][ies] |
| 1.2 | Định nghĩa thuật ngữ bằng một câu ở lần xuất hiện đầu tiên, trước khi dùng nó trong phần cơ chế. Dùng một tên cho một khái niệm suốt bài. | Biết tên và đặc điểm của khái niệm chính trước khi vào bài giúp học tốt hơn (pre-training d = 0,78, 10 phép thử) **[nghiên cứu]**. Đổi tên giữa chừng khiến người đọc tưởng là hai thứ khác nhau **[hướng dẫn]**. | [Mayer 2024][mayer2024]; [Mayer 2002][mayer2002]; [Google words][g-words] |
| 1.3 | Đưa ví dụ (code kèm output) trước, rồi mới phát biểu quy tắc tổng quát và gọi tên nó (ví dụ "fail-fast"). | Ví dụ mẫu giúp người mới xây dựng kiến thức tốt hơn tự mò **[nghiên cứu]**. Trong meta-analysis về so sánh tình huống, đưa nguyên tắc *sau* khi so sánh gắn với kết quả học tốt hơn **[nghiên cứu, abstract]**. | [Sweller 2019][sweller2019]; [Alfieri 2013][alfieri2013]; [Atkinson 2000][atkinson2000] |
| 1.4 | Cơ chế có nhiều thành phần thì trình bày hai lượt: lượt 1 là bảng ngắn "thành phần – vai trò"; lượt 2 là luồng tương tác kèm sơ đồ. | Thông tin có nhiều phần tử tương tác vượt quá trí nhớ làm việc của người mới. Học từng phần tử riêng trước rồi mới học tương tác thì tốt hơn đưa toàn bộ hai lần (*isolated elements effect*) **[nghiên cứu]**. | [Sweller 2019][sweller2019]; [Mayer 2002][mayer2002] |
| 1.5 | Đi từ đơn giản tới phức tạp: ví dụ tối thiểu → ví dụ gần thực tế → trường hợp biên. | Sắp xếp từ đơn giản tới phức tạp giảm tải nhận thức **[nghiên cứu]**. Google và Microsoft đều khuyên bắt đầu bằng ví dụ đơn giản rồi mới tăng độ phức tạp **[hướng dẫn]**. | [Sweller 2019][sweller2019]; [Google sample code][g-code]; [Microsoft code examples][ms-code] |
| 1.6 | Mỗi khái niệm phải trả lời "vì sao nó được thiết kế như vậy": quyết định thiết kế, ràng buộc, lịch sử, lựa chọn thay thế. | Diátaxis coi lý do, bối cảnh, lựa chọn thay thế là nội dung cốt lõi của explanation **[hướng dẫn]**. Khảo sát lập trình viên Microsoft: thiếu hiểu biết về thiết kế cấp cao cản việc học API, và hành vi khó hiểu của API thường được giải thích bằng thiết kế cấp cao mà tài liệu cấp thấp không nhắc tới **[nghiên cứu, toàn văn]**. "Documentation of intent" là một trong năm yếu tố của tài liệu API tốt **[nghiên cứu, abstract]**. | [Diátaxis explanation][diataxis-exp]; [Robillard 2009][robillard2009]; [Robillard & DeLine 2011][robillard2011] |
| 1.7 | Phần Kiến thức không chứa thủ tục từng bước và không chép bảng API đầy đủ. Bảng method chỉ giữ những method cần cho lập luận; phần còn lại trỏ Javadoc ở phần Tài liệu. | Diátaxis cảnh báo rủi ro lớn nhất của explanation là "nuốt" hướng dẫn và mô tả tra cứu, làm hỏng cả hai loại **[hướng dẫn]**. | [Diátaxis explanation][diataxis-exp]; [Diátaxis compass][diataxis-compass] |

### Nhóm 2. Đoạn văn, câu, mật độ ý

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 2.1 | Câu đầu của mỗi đoạn nêu ý chính của đoạn. | Người đọc bận thường chỉ đọc câu mở đoạn **[hướng dẫn]**. Write the Docs: viết như báo, không như tiểu thuyết **[hướng dẫn]**. | [Google paragraphs][g-para]; [Write the Docs][wtd]; [Microsoft top 10][ms-top10] |
| 2.2 | Mỗi đoạn có 2–5 câu và không quá 6 câu. Thỉnh thoảng có đoạn một câu thì được; nhiều đoạn một câu liền nhau thì gộp lại hoặc chuyển thành danh sách. | Google: 3–5 câu, tránh quá khoảng 7 câu. Kubernetes: dưới 6 câu. Microsoft: 3–7 dòng **[hướng dẫn]**. | [Google paragraphs][g-para]; [Kubernetes][k8s]; [Microsoft scannable][ms-scan] |
| 2.3 | Mỗi câu một ý. Câu có "hoặc", hoặc liệt kê từ ba thứ trở lên, thì chuyển thành danh sách. | Câu ngắn đọc nhanh hơn và ít chỗ hỏng hơn **[hướng dẫn]**. | [Google short sentences][g-sent] |
| 2.4 | Mỗi đoạn trả lời được ba câu: bạn đang nói gì, vì sao người đọc cần biết, dùng hay kiểm chứng điều đó thế nào. | Đây là phép thử đoạn văn tốt của Google **[hướng dẫn]**. | [Google paragraphs][g-para] |
| 2.5 | Cắt chi tiết "hay nhưng không phục vụ mục tiêu": giai thoại, lịch sử không giải thích được hành vi hiện tại, hình trang trí. | Coherence: người học học tốt hơn khi bỏ bớt tài liệu thừa (d = 0,86, 19 phép thử) **[nghiên cứu]**. | [Mayer 2024][mayer2024]; [Mayer & Moreno 2003][mayer2003] |
| 2.6 | Nếu một bài cần hơn khoảng 30–40 phút đọc tập trung thì cân nhắc tách thành hai bài. | Meta-analysis về giọng trò chuyện thấy hiệu ứng nhỏ, không có ý nghĩa thống kê ở các nghiên cứu dài hơn 35 phút **[nghiên cứu, abstract]**. Áp con số này cho độ dài bài là **[suy luận]**: ngưỡng 35 phút là giới hạn của hiệu ứng giọng trò chuyện, không phải độ dài bài, và chưa có nghiên cứu nào đo độ dài tối ưu của bài đọc kỹ thuật. Chỉ nên ghi thành gợi ý, không thành quy định. | [Ginns 2013][ginns2013] |

### Nhóm 3. Ví dụ code và output

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 3.1 | Mỗi khối code minh hoạ **một** điểm, ngắn nhất có thể, nhưng vẫn biên dịch và chạy được, và không dùng cách viết sai để cho ngắn. Mục tiêu khoảng 5–20 dòng; dài hơn thì tách khối. | Google: chỉ giữ phần thiết yếu, nhưng không bao giờ rút gọn bằng cách làm sai; code mẫu phải được kiểm thử thường xuyên. Microsoft: luôn biên dịch và chạy thử **[hướng dẫn]**. Con số 5–20 dòng là **[suy luận]**; Robillard ghi một snippet MSDN điển hình dài khoảng 30 dòng. | [Google sample code][g-code]; [Microsoft code examples][ms-code]; [Robillard 2009][robillard2009] |
| 3.2 | Phần lược bỏ ghi bằng comment hợp lệ của ngôn ngữ (`// các field khác`), không dùng `...` hay `(...)`. | Google style guide quy định như vậy, và khối có phần lược bỏ không được làm nút copy **[hướng dẫn]**. J5.3 hiện có `record Product(...)`, cách viết này không biên dịch được. | [Google code samples][gs-codes] |
| 3.3 | Trước khối code có lời dẫn nói đoạn code làm gì và cần để ý chỗ nào. Sau output có 1–3 câu nói cách đọc output và điều nó chứng minh. | MDN yêu cầu mô tả trước code và giải thích kết quả sau code **[hướng dẫn]**. Nghiên cứu câu trả lời được bình chọn cao trên StackOverflow: lời giải thích đi kèm quan trọng ngang ví dụ **[nghiên cứu, abstract]**. | [MDN][mdn]; [Google code samples][gs-codes]; [Nasehi 2012][nasehi2012] |
| 3.4 | Output đặt **ngay dưới** code, trong khối riêng, có câu dẫn "Kết quả:". Output 1–2 dòng có thể ghi bằng comment ngay cạnh dòng in (`// in ra: 3`). | Phải ghép hai nguồn thông tin đặt xa nhau thì tốn tải nhận thức (split-attention); để chữ và hình gần nhau thì học tốt hơn (spatial contiguity d = 0,82) **[nghiên cứu]**. Microsoft: output đặt sau code hoặc trong comment. Kubernetes: tách lệnh và output, dẫn bằng câu "The output is similar to this:" **[hướng dẫn]**. | [Sweller 2019][sweller2019]; [Mayer 2024][mayer2024]; [Microsoft code examples][ms-code]; [Kubernetes][k8s] |
| 3.5 | Comment trong code chỉ dành cho chỗ không hiển nhiên và nói "vì sao", không nói "cái gì". Khái niệm dài viết ở văn bản trước code. Văn quanh code không kể lại điều comment đã nói. | Google: comment tập trung vào phần phản trực giác; khái niệm dài đặt trong văn bản trước mẫu **[hướng dẫn]**. Cùng một thông tin trình bày hai lần buộc người học tốn công đối chiếu (redundancy effect) **[nghiên cứu]**. | [Google sample code][g-code]; [Sweller 2019][sweller2019] |
| 3.6 | Với bẫy quan trọng, đặt cặp sai/đúng cạnh nhau (hai khối liền nhau hoặc bảng hai cột), chỉ ra điểm khác nhau, rồi mới phát biểu nguyên tắc. | So sánh các cách giải giúp tăng kiến thức thủ tục và độ linh hoạt **[nghiên cứu, abstract]**. Meta-analysis 57 thí nghiệm: hoạt động so sánh tình huống cho kết quả tốt hơn các dạng khác (d = 0,50) **[nghiên cứu, abstract]**. Google khuyên đưa ví dụ phản mẫu khi ngôn ngữ có bẫy **[hướng dẫn]**. | [Rittle-Johnson & Star 2007][rittle2007]; [Alfieri 2013][alfieri2013]; [Google sample code][g-code] |
| 3.7 | Ví dụ gắn với tình huống người học sẽ gặp thật, không trình diễn tính năng cho có. Khi ví dụ chỉ bao phủ một phần cách dùng, ghi rõ phần nó không bao phủ. | Microsoft: không dùng ví dụ để minh hoạ điều hiển nhiên hay tình huống gượng ép **[hướng dẫn]**. Robillard: ví dụ thành vật cản khi mục đích của ví dụ lệch với mục tiêu người dùng; nên nói rõ phạm vi cách dùng mà ví dụ minh hoạ **[nghiên cứu, toàn văn]**. | [Microsoft code examples][ms-code]; [Robillard 2009][robillard2009] |
| 3.8 | Phân biệt ví dụ **tối thiểu** (cô lập một cơ chế, được phép nhỏ) với ví dụ **đồ chơi** (vô nghĩa, không gắn thực tế). Dùng một bối cảnh xuyên suốt chặng (ví dụ `Product`, giỏ hàng ở J5); khi cần cho thấy quy tắc là chung thì thêm một ví dụ có bề mặt khác. | Nhiều ví dụ cho một loại vấn đề, có bề mặt khác nhau, giúp người học thấy cấu trúc sâu **[nghiên cứu, abstract]**. Bối cảnh xuyên suốt giảm phần phải xử lý mới mỗi lần **[suy luận]**. | [Atkinson 2000][atkinson2000]; [Renkl 2014][renkl2014] |
| 3.9 | Output là output thật, chạy với phiên bản ghi trong `verified`. Phần thay đổi giữa các lần chạy (hash, thời gian, thứ tự của `Set.of`) phải ghi rõ là sẽ khác. | Khảo sát 323 lập trình viên: ba lỗi tài liệu nặng nhất là mơ hồ, thiếu và sai **[nghiên cứu, abstract]**. Diátaxis: hiển thị output thật hoặc chính xác và báo trước dấu hiệu sai **[hướng dẫn]**. | [Uddin & Robillard 2015][uddin2015]; [Diátaxis tutorials][diataxis-tut] |
| 3.10 | Mỗi mục khái niệm phải đọc hiểu được theo hai cách: chỉ đọc văn, hoặc chỉ lướt code và output. Câu dẫn và câu đọc output là cầu nối giữa hai cách. | Lập trình viên đầu tiên tìm hiểu mục đích tổng thể, rồi đi theo một trong hai chiến lược: thiên về khái niệm hoặc thiên về code; tài liệu phải phục vụ cả hai **[nghiên cứu, abstract]**. | [Meng 2018][meng2018]; [Meng 2019][meng2019] |

### Nhóm 4. Sơ đồ

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 4.1 | Bắt buộc có sơ đồ khi có từ ba thành phần tương tác trở lên, hoặc khi thứ tự theo thời gian quyết định kết quả (proxy, vòng đời persistence context, luồng request). | Học từ chữ kèm hình tốt hơn chỉ có chữ (multimedia d = 1,35) **[nghiên cứu]**. IES khuyên kết hợp hình với lời mô tả (bằng chứng "moderate") **[nghiên cứu, tổng quan; đọc trang tóm tắt]**. | [Mayer 2024][mayer2024]; [IES 2007][ies] |
| 4.2 | Viết trước một câu chú thích (caption) nêu điều người đọc phải nhớ, rồi mới vẽ. Một sơ đồ không nên cần quá một đoạn hay khoảng 5 gạch đầu dòng để giải thích. Hệ phức tạp thì vẽ một sơ đồ tổng quan và các sơ đồ chi tiết. | Đây là khuyến nghị của khoá Technical Writing của Google **[hướng dẫn]**. | [Google illustrations][g-ill] |
| 4.3 | Nhãn đặt ngay trên hoặc cạnh phần tử (như sơ đồ ASCII của J5.3), không dùng số chú thích tra ở chỗ khác. | Spatial contiguity và split-attention: tích hợp chữ vào hình loại bỏ việc người học phải tự ghép trong đầu **[nghiên cứu]**. | [Sweller 2019][sweller2019]; [Mayer 2024][mayer2024] |
| 4.4 | Văn quanh sơ đồ không kể lại từng mũi tên. Văn chỉ nêu điểm cần chú ý và vì sao. | Khi hình đã tự đủ nghĩa, thêm chữ mô tả lại đúng nội dung đó làm học kém hơn chỉ có hình (thí nghiệm Chandler & Sweller 1991) **[nghiên cứu, trích lại qua tổng quan]**. | [Sweller 2019][sweller2019] |
| 4.5 | Dùng tín hiệu thị giác (`◄`, chữ đậm, khung) cho đúng một hai điểm then chốt của sơ đồ. | Signaling: thêm dấu hiệu làm nổi cấu trúc của phần thiết yếu giúp học tốt hơn (d = 0,69) **[nghiên cứu]**. Google khuyên dùng callout và mũi tên để dẫn mắt **[hướng dẫn]**. | [Mayer 2024][mayer2024]; [Google illustrations][g-ill] |
| 4.6 | Không thêm hình minh hoạ trang trí. Không phân biệt thông tin chỉ bằng màu. | Coherence (d = 0,86) **[nghiên cứu]**. Google dẫn Sung & Mayer (2012): hình nào cũng làm người đọc thích tài liệu hơn, nhưng chỉ hình có tính hướng dẫn mới giúp học (**chưa kiểm được** bài gốc, chỉ đọc qua trang Google) **[hướng dẫn]**. | [Mayer 2024][mayer2024]; [Google illustrations][g-ill] |

### Nhóm 5. Bảng hay văn xuôi

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 5.1 | Dùng bảng khi người đọc cần quét hoặc so sánh: từ ba thứ trở lên, hoặc hai thứ nhưng so theo từ ba thuộc tính. | Google: bảng cho dữ liệu cần quét hoặc so sánh **[hướng dẫn]**. | [Google lists and tables][g-lists] |
| 5.2 | Ô bảng không quá hai câu. Mỗi cột cùng một kiểu dữ liệu. Có một câu dẫn trước bảng. | Đây là quy tắc của Google **[hướng dẫn]**. MDN cũng yêu cầu câu dẫn trước danh sách **[hướng dẫn]**. | [Google lists and tables][g-lists]; [MDN][mdn] |
| 5.3 | Chuỗi nhân quả ("vì A nên B, nên C") viết bằng văn xuôi, không chặt ra thành ô bảng. | Explanation là lối viết bàn luận, nối các ý với nhau **[hướng dẫn]**. Bảng cắt mất các chữ "vì", "nên" nối các ý **[suy luận]**. | [Diátaxis explanation][diataxis-exp] |
| 5.4 | Danh sách có thứ tự chỉ dùng khi thứ tự có nghĩa; các mục song song về ngữ pháp. | Google lists **[hướng dẫn]**. | [Google lists and tables][g-lists] |

### Nhóm 6. Trường hợp biên và sai lầm thường gặp

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 6.1 | Viết sai lầm theo cấu trúc refutation: (1) nêu quan niệm sai bằng lời người học hay nghĩ; (2) nói rõ là sai; (3) giải thích cơ chế khiến nó sai; (4) output chứng minh; (5) cách đúng. | Tổng quan 20 năm: đọc văn bản refutation dễ dẫn tới thay đổi quan niệm hơn văn giải thích thường **[nghiên cứu, abstract]**. Thí nghiệm của Kendeou và cộng sự: bác bỏ kèm giải thích có hiệu quả, bác bỏ không có giải thích chỉ giảm được một phần, còn chỉ giải thích thì hiệu quả ngang bác bỏ kèm giải thích **[nghiên cứu, abstract]**. Nghĩa là bước (3) là bắt buộc; bước (1)–(2) không phải nguồn hiệu quả chính, giữ để người đọc nhận ra quan niệm của mình **[suy luận]**. | [Tippett 2010][tippett2010]; [Kendeou 2014][kendeou2014] |
| 6.2 | Đặt sai lầm và trường hợp biên ngay sau cơ chế mà nó thuộc về, không dồn thành một mục "Lỗi thường gặp" ở cuối bài. | Hiểu sai trong lập trình nhập môn thường bắt nguồn từ mô hình tư duy (mental model) không chính xác **[nghiên cứu, abstract]**. Sửa ngay cạnh mô hình đang được xây là áp dụng contiguity **[suy luận]**. | [Qian & Lehman 2017][qian2017]; [Sweller 2019][sweller2019] |
| 6.3 | Ưu tiên những hành vi "khó đoán" mà tài liệu chính thức không nói rõ, và giải thích chúng bằng quyết định thiết kế. | Hành vi API khó hiểu là một trở ngại lớn; nguyên nhân thường nằm ở thiết kế cấp cao không được nhắc ở tài liệu cấp thấp **[nghiên cứu, toàn văn]**. | [Robillard 2009][robillard2009] |
| 6.4 | Phát biểu quan niệm sai một lần, ngắn, không in đậm. Phần lớn dung lượng dành cho giải thích. | Kendeou 2014: phần giải thích mang hiệu quả chính **[nghiên cứu, abstract]**. Tổng quan phê bình 2021 lưu ý hiệu quả của refutation cần được giới hạn lại: nhiều nghiên cứu chỉ dùng một chủ đề và chỉ đo ngay sau khi đọc **[nghiên cứu, abstract]**. Không in đậm câu sai là **[suy luận]**. | [Kendeou 2014][kendeou2014]; [Zengilowski 2021][zengilowski2021] |
| 6.5 | Callout `pitfall` chỉ dùng cho bẫy ngắn, đứng riêng được. Sai lầm cần giải thích cơ chế thì viết trong thân bài. | Google: thông tin người đọc cần để thành công không đặt trong note **[hướng dẫn]**. | [Google notices][gs-notice] |
| 6.6 | Trường hợp biên không gắn với quan niệm sai (`null`, collection rỗng, phần tử trùng, giá trị tràn số) thì viết thẳng: điều kiện → hành vi → output, ngay sau ví dụ chính. Nhiều trường hợp biên cùng loại thì gom thành bảng "đầu vào \| hành vi". Chỉ đưa trường hợp biên làm đổi cách dùng hoặc hay gây lỗi; liệt kê đủ thì trỏ Javadoc. | Microsoft: chỉ đưa xử lý exception vào ví dụ khi nó là phần cốt lõi của ví dụ, tức trường hợp biên không chen vào ví dụ chính **[hướng dẫn]**. Robillard: hành vi API khó đoán là một trở ngại lớn khi học API **[nghiên cứu, toàn văn]**. Explanation không thay reference ([Diátaxis][diataxis-exp]) **[hướng dẫn]**. | [Microsoft code examples][ms-code]; [Robillard 2009][robillard2009]; [Diátaxis explanation][diataxis-exp] |

### Nhóm 7. Đề mục, tín hiệu, chia đoạn trong bài dài

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 7.1 | Trong trang tối đa ba cấp đề mục. Trong `<Knowledge>`, mỗi khái niệm là một `###`; `####` chỉ dùng khi thật cần. | MDN khuyên không quá ba cấp; Kubernetes chỉ dùng cấp 4–6 khi cần, chi tiết sâu hơn nên là bài riêng **[hướng dẫn]**. | [MDN][mdn]; [Kubernetes][k8s] |
| 7.2 | Đề mục khái niệm là cụm danh từ hoặc một câu nêu điều rút ra (ví dụ "TreeSet tin vào compare, không tin equals"). Không đặt link hay chỉ một tên method trần làm đề mục. | Google: đề mục khái niệm dùng cụm danh từ; không đặt link; tránh để riêng code trong đề mục mà không có danh từ mô tả **[hướng dẫn]**. Đề mục dạng câu kết luận còn là một tín hiệu ghi nhớ **[suy luận]**. | [Google headings][gs-head] |
| 7.3 | Sau mỗi đề mục có lời dẫn; không đặt hai đề mục liền nhau; không có mục con đơn lẻ. | MDN và Google đều quy định như vậy **[hướng dẫn]**. | [MDN][mdn]; [Google headings][gs-head] |
| 7.4 | Dùng tín hiệu nhất quán: Mục tiêu liệt kê các câu hỏi bài trả lời; đề mục; chữ đậm cho thuật ngữ ở lần đầu; 1–2 câu chốt ở cuối mục dài. | Tổng quan về tín hiệu trong văn bản: gần như mọi loại tín hiệu (tiêu đề, đề mục, xem trước, tóm tắt, dấu chữ) giúp nhớ thông tin được nhấn, còn thông tin không được nhấn thì thường không đổi **[nghiên cứu, abstract]**. | [Lorch 1989][lorch1989]; [Mayer 2024][mayer2024] |
| 7.5 | Mỗi `###` là một khúc đọc trọn vẹn, kết thúc ở một điểm dừng tự nhiên. Khúc sau được dựa vào khúc trước, nhưng không cắt ngang một ý giữa hai khúc. | Segmenting: chia bài thành các đoạn người học tự điều nhịp thì học tốt hơn một khối liền (d = 0,67) **[nghiên cứu]**. Nghiên cứu đo trên bài multimedia; văn bản vốn đã do người đọc tự điều nhịp và không trôi qua như lời nói, nên áp vào bài đọc là **[suy luận]**. | [Mayer 2024][mayer2024]; [Sweller 2019][sweller2019] |
| 7.6 | Bài dài cần mục lục tới cấp đề mục khái niệm (`###` trong Kiến thức). | Microsoft: tài liệu dài đọc trên mạng phải có mục lục link tới đề mục con **[hướng dẫn]**. Chủ dự án đã duyệt (22/10/2026); user story 19 của spec đã sửa theo, xem mục 2. | [Microsoft scannable][ms-scan]; [Write the Docs][wtd] |

### Nhóm 8. Giúp nhớ lâu khi không có lab

Kết luận của tổng quan lớn nhất ([Dunlosky 2013][dunlosky2013], đọc abstract):

| Kỹ thuật | Mức hữu ích theo Dunlosky 2013 | Áp vào bài đọc |
|---|---|---|
| Tự kiểm tra (practice testing) | Cao | Đoán trước (câu hỏi ôn đã bỏ, xem 8.2) |
| Học giãn cách (distributed practice) | Cao | Bài sau gọi lại bài trước; ngân hàng câu hỏi phỏng vấn |
| Elaborative interrogation, self-explanation | Trung bình | Câu nhắc "vì sao" tại chỗ khó |
| Interleaved practice | Trung bình | Không áp trong một bài đọc |
| Tóm tắt, tô đậm, đọc lại, keyword mnemonic, hình dung | Thấp | Không dựa vào |

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 8.1 | **Đoán trước:** trước 1–3 output gây bất ngờ trong bài, hỏi người học đoán kết quả ("Trước khi xem kết quả, bạn đoán vòng lặp in gì?"). Đáp án và giải thích đặt ngay sau. | Bắt người học đoán trước làm họ ngạc nhiên hơn khi đáp án khác dự đoán, từ đó chú ý và ghi nhớ đáp án đúng tốt hơn. Hiệu quả gắn với việc xử lý phản hồi ngay sau dự đoán **[nghiên cứu, abstract]**. Chuẩn hiện có đã có "Đoán trước" cho lab. | [Brod 2021][brod2021] |
| 8.2 | ~~**Câu hỏi ôn**~~ (không áp dụng: chủ dự án đã quyết không thêm, 22/10/2026; giữ dòng này để lưu bằng chứng): cuối phần Kiến thức có 3–5 câu hỏi dạng "vì sao" hoặc "điều gì xảy ra nếu", người học tự trả lời rồi mở đáp án. Không có ô đánh dấu, không trắc nghiệm. Không đặt tên "Tự kiểm tra" vì trùng nhãn ô đánh dấu của bài lab. | Kiểm tra làm nhớ lâu hơn đọc lại: sau 2 ngày và 1 tuần, nhóm tự kiểm tra nhớ nhiều hơn hẳn, dù nhóm đọc lại tự tin hơn **[nghiên cứu, abstract]**. Tự kiểm tra cũng hơn lập concept map, kể cả với câu hỏi suy luận **[nghiên cứu, abstract]**. Kiểm tra dạng nhớ lại (recall) cho lợi ích lớn hơn dạng nhận diện **[nghiên cứu, abstract]**. IES xếp "dùng quiz để ôn lại nội dung chính" và "hỏi câu hỏi giải thích sâu" ở mức bằng chứng "strong" **[nghiên cứu]**. | [Roediger 2006][roediger2006]; [Karpicke & Blunt 2011][karpicke2011]; [Rowland 2014][rowland2014]; [Adesope 2017][adesope2017]; [IES 2007][ies] |
| 8.3 | **Tự giải thích:** ở 1–2 chỗ khó nhất bài, thêm một câu nhắc người học tự giải thích trước khi đọc tiếp ("Thử tự trả lời: vì sao `hasNext()` trả `false` ở đây?"). Không nhắc ở mọi mục. | Meta-analysis 69 hệ số: câu nhắc tự giải thích có hiệu quả g = 0,55 **[nghiên cứu, abstract]**. Người học giỏi tự tạo nhiều lời giải thích khi đọc ví dụ mẫu **[nghiên cứu, abstract]**. Câu nhắc chỉ có lợi khi tổng tải còn trong khả năng xử lý **[nghiên cứu]**, vì vậy chỉ dùng ít **[suy luận]**. | [Bisra 2018][bisra2018]; [Chi 1989][chi1989]; [Sweller 2019][sweller2019] |
| 8.4 | Một hai câu chốt ở cuối mục dài giúp người đọc thấy ý chính, nhưng không thay được việc tự nhớ lại. Không khuyên người học đọc lại hay tự tóm tắt như cách ôn chính. | Tóm tắt là tín hiệu giúp nhớ phần được nhấn **[nghiên cứu, abstract]**. Đọc lại và tóm tắt có mức hữu ích thấp **[nghiên cứu, abstract]**. | [Lorch 1989][lorch1989]; [Dunlosky 2013][dunlosky2013] |
| 8.5 | **Giãn cách giữa các bài:** callout "Liên hệ bài khác" nói rõ bài sau dùng lại điều gì; khi viết bài sau, nhắc lại ngắn kiến thức cũ thay vì giả định người học còn nhớ. | Meta-analysis 839 phép đo: khoảng cách ôn tốt nhất tăng theo khoảng thời gian cần nhớ **[nghiên cứu, abstract]**. IES: giãn cách việc học (bằng chứng "moderate") **[nghiên cứu]**. Một bài đọc đơn lẻ không giãn cách được nên phải làm ở cấp roadmap **[suy luận]**. | [Cepeda 2006][cepeda2006]; [IES 2007][ies] |
| 8.6 | Giữ cách viết Mục tiêu dạng "Học xong bài này, bạn giải thích được: vì sao…" như J5.3. Đây vừa là xem trước (preview), vừa là câu hỏi đặt trước. | Tín hiệu xem trước giúp nhớ **[nghiên cứu, abstract]**. Prequestion có lợi khi người học được học đáp án sau đó **[nghiên cứu, abstract]**; IES chỉ xếp mức bằng chứng "minimal". | [Lorch 1989][lorch1989]; [Pan & Carpenter 2023][pan2023]; [Richland 2009][richland2009]; [IES 2007][ies] |

**Mức nào hợp với một bài đọc chỉ có nút "Đã học xong bài"** **[suy luận]**:

| Mức | Nội dung | Ghi chú |
|---|---|---|
| Tối thiểu (không đổi khung) | Mục tiêu dạng câu hỏi; 1–3 chỗ "Đoán trước"; câu chốt cuối mục dài | Viết bằng văn và khối có sẵn, không cần component mới |
| Đã bỏ | Thêm 3–5 "câu hỏi ôn" có đáp án ẩn ở cuối `<Knowledge>` | Chủ dự án quyết không thêm (22/10/2026). Bài đọc áp dụng mức tối thiểu |
| Không nên | Ô đánh dấu từng ý; trắc nghiệm nhiều lựa chọn | Spec đã bỏ ô đánh dấu; recall hơn recognition |

### Nhóm 9. Callout

Quy tắc chung **[hướng dẫn]**: viết thông tin thành văn thường trước, chỉ đưa vào callout khi thật cần; không đặt hai callout liền nhau; không lồng callout; thông tin cần để hiểu bài không đặt trong callout ([Google notices][gs-notice]). Kubernetes không lặp lại tiêu đề callout trong thân callout ([Kubernetes][k8s]).

| Callout (`kind`) | Dùng cho | Số lượng đề xuất **[suy luận]** |
|---|---|---|
| `production` | Một tình huống thật có hậu quả quan sát được (sự cố, số đo, câu hỏi khách hàng), nối thẳng với khái niệm vừa học | 1–2 mỗi bài, tối đa 1 mỗi `###`. Phải là chi tiết có tính hướng dẫn, không phải giai thoại (coherence, [Mayer 2024][mayer2024]) |
| `pitfall` | Bẫy ngắn, đứng riêng được | 0–2 mỗi bài. Bẫy cần giải thích cơ chế thì viết trong thân bài (khuyến nghị 6.5) |
| `danger` | Lệnh phá huỷ dữ liệu | Hiếm trong bài đọc; giữ quy định hiện có |
| `ai` | "Khi làm cùng AI", cuối `<Knowledge>` theo spec | Đúng 1 |
| `link` | "Liên hệ bài khác", ngay sau `ai` | Đúng 1. Đây là phần "make connections" của explanation ([Diátaxis][diataxis-exp]) |

Hai callout `ai` và `link` đứng liền nhau ở cuối bài là ngoại lệ có chủ đích, do spec quy định chỗ đặt: chúng là khối khép bài, không chen giữa luồng đọc, nên lý do Google tránh hai callout liền nhau (làm đứt mạch đọc) không áp vào đây **[suy luận]** ([Google notices][gs-notice]).

### Nhóm 10. Giọng văn

| # | Khuyến nghị | Lý do | Nguồn |
|---|---|---|---|
| 10.1 | Xưng "bạn"; khi bảo người đọc làm gì thì dùng câu mệnh lệnh; không dùng "chúng ta" cho người viết và người đọc. | Google và Kubernetes đều yêu cầu ngôi thứ hai, tránh "we" **[hướng dẫn]**. | [Google person][gs-person]; [Kubernetes][k8s] |
| 10.2 | Giọng trò chuyện, lịch sự, như một người đồng nghiệp hiểu biết; không đùa cợt, không quảng cáo, không dấu chấm than. | Ba thí nghiệm: đổi "the" thành "your" ở 12 chỗ làm điểm vận dụng (transfer) cao hơn, điểm ghi nhớ thì không đổi **[nghiên cứu, abstract]**. Meta-analysis: giọng trò chuyện cải thiện ghi nhớ (d = 0,30) và vận dụng (d = 0,54); hiệu ứng nhỏ, không có ý nghĩa thống kê ở nghiên cứu dài hơn 35 phút **[nghiên cứu, abstract]**. Google: thân thiện nhưng không cố gây cười **[hướng dẫn]**. | [Mayer 2004][mayer2004]; [Ginns 2013][ginns2013]; [Mayer 2024][mayer2024]; [Google tone][gs-tone] |
| 10.3 | Câu chủ động, thì hiện tại ("`TreeSet` bỏ qua phần tử", không viết "phần tử sẽ bị bỏ qua bởi `TreeSet`"). Bị động chỉ dùng khi chủ thể không quan trọng. | Câu chủ động cho biết ai làm gì **[hướng dẫn]**. | [Google voice][gs-voice]; [Kubernetes][k8s] |
| 10.4 | Tránh "dễ dàng", "đơn giản", "chỉ cần", "đơn thuần", "hiển nhiên", "rõ ràng là". | Kubernetes cấm "just", "simply", "easy", "easily", "simple" vì không thêm giá trị; Google tránh "simply", "easy", "quickly" trong thủ tục **[hướng dẫn]**. Danh sách tiếng Việt tương đương là **[suy luận]**. | [Kubernetes][k8s]; [Google tone][gs-tone] |
| 10.5 | Tránh thành ngữ, ẩn dụ văn hoá, chơi chữ: bài sẽ được dịch. | Google khuyên tránh vì gây khó hiểu và khó dịch **[hướng dẫn]**. | [Google audience][g-aud]; [Google tone][gs-tone] |
| 10.6 | Duyệt bài bằng một lượt đọc với vai người mới để bắt chỗ người viết quên mất người mới chưa biết. | "Curse of knowledge": chuyên gia quên người mới không biết gì, nên lời giải thích nhảy bước **[hướng dẫn]**. | [Google audience][g-aud] |

---

## 2. Đối chiếu với chuẩn hiện có của Masteva

Chuẩn hiện có: `docs/content-standard.md` §2.2, §3, §3.1 (đọc ngày 22/10/2026). Sau ticket 03, §3 và §3.1 của bản đó thành §4 và §4.1; chuẩn bài đọc rút từ bảng này nằm ở §3 mới.

| Quy định hiện tại | Bằng chứng nói gì | Giữ / Đổi / Bổ sung | Đề xuất cụ thể |
|---|---|---|---|
| §2.2 Thứ tự: cái gì → vì sao tồn tại → bên dưới chạy thế nào → dùng khi nào → sai ở đâu | Lõi khớp với Diátaxis (vì sao, bối cảnh, lựa chọn thay thế) và Robillard (ý đồ thiết kế) (1.6). Nhưng định nghĩa đứng đầu mâu thuẫn với "ví dụ cụ thể trước" của chính §3.1 và với concreteness fading (1.1, 1.3) | **Đổi nhẹ** | Thêm bước 0 "tình huống" trước "cái gì": *tình huống → cái gì → vì sao → cơ chế → dùng khi nào → sai ở đâu*. Ghi rõ đây là thứ tự **trong mỗi khái niệm**, không phải năm mục lớn của cả bài |
| §2.2 "sai ở đâu" đứng cuối | Refutation hiệu quả khi có giải thích cơ chế (6.1); đặt cạnh mô hình đang xây (6.2) | **Đổi** | "Sai ở đâu" nằm cuối **từng** `###`, viết theo cấu trúc refutation 5 bước. Không gom một mục lỗi cuối bài |
| §2.2 Mỗi khái niệm có ví dụ, bảng hoặc sơ đồ | Ví dụ mẫu, multimedia, so sánh đều có bằng chứng (1.3, 1.4) | **Giữ, bổ sung** | Với bài đọc Java: mỗi khái niệm có ít nhất một ví dụ code chạy được **kèm output**, trừ khái niệm thuần thiết kế. Bảng chỉ khi so sánh (5.1) |
| §2.2 Cơ chế nhiều bước bắt buộc có sơ đồ | Multimedia d = 1,35; pre-training; isolated elements (1.4, 4.1) | **Giữ, bổ sung** | Thêm: bảng thành phần trước sơ đồ; caption một câu; nhãn trên sơ đồ; văn không kể lại từng mũi tên (4.2–4.4) |
| §2.2 Ít nhất một callout Trên production | Google: callout ít, không liền nhau; coherence: chi tiết phải có tính hướng dẫn (1.9) | **Giữ, bổ sung** | 1–2 mỗi bài, tối đa 1 mỗi `###`, gắn với khái niệm vừa học |
| §2.2 Thuật ngữ tiếng Anh, giải nghĩa ở lần đầu | Pre-training; Google words (1.2) | **Giữ, bổ sung** | Thêm: một tên cho một khái niệm suốt bài |
| §3 Tự chứa | [Diátaxis][diataxis-exp]: explanation đọc "khi rời sản phẩm", phải tự đứng được | **Giữ** | Câu ví dụ "đủ để làm lab" đổi thành "đủ để hiểu mà không cần mở link" cho bài đọc |
| §3 Cụ thể | Khớp concreteness fading và Uddin & Robillard (mơ hồ là lỗi nặng) | **Giữ** | — |
| §3 Có lý do | Khớp Diátaxis và Robillard | **Giữ** | — |
| §3 Thực chiến; "Sai: ví dụ đồ chơi" | Đi từ đơn giản tới phức tạp; ví dụ tối thiểu để cô lập cơ chế có bằng chứng (1.5, 3.8) | **Đổi nhẹ** | Phân biệt ví dụ **tối thiểu** (được phép, cô lập một cơ chế) với ví dụ **đồ chơi** (vô nghĩa). Thứ tự: tối thiểu → gần thực tế → trường hợp biên |
| §3 Ngắn gọn: câu ngắn, một ý một câu | Khớp mọi style guide (2.2, 2.3) | **Giữ, bổ sung** | Thêm con số: đoạn 2–5 câu, không quá 6; câu mở đoạn nêu ý chính |
| §3 Bảng khi so sánh từ ba thứ trở lên | Google: bảng cho dữ liệu cần quét/so sánh; ô ≤ 2 câu (5.1, 5.2) | **Giữ, bổ sung** | Thêm: hai thứ × từ ba thuộc tính cũng dùng bảng; ô ≤ 2 câu; chuỗi nhân quả viết văn xuôi |
| §3 Trung thực | Uddin & Robillard: sai là lỗi nặng nhất | **Giữ** | Spec đã thêm: khẳng định về hành vi API phải có tài liệu chính thức hoặc output làm dẫn chứng |
| §3 Giọng văn: xưng "bạn", không quảng cáo | Personalization d = 1,00; Ginns 2013 (10.1, 10.2) | **Giữ, bổ sung** | Thêm danh sách từ tránh ("dễ dàng", "đơn giản", "chỉ cần"…), câu chủ động, thì hiện tại, tránh thành ngữ (10.3–10.5) |
| §3.1 Không kể chuyện người viết | Không có nghiên cứu trực tiếp; khớp Google (ngôi thứ hai, người đọc là người làm) | **Giữ, bổ sung** | Áp cho "phát hiện từ lab cũ": viết lại thành kiến thức + ví dụ + "Kết quả sẽ giống thế này", không viết "khi chạy lab ta thấy" |
| §3.1 Giải thích thuật ngữ trước khi dùng | Pre-training d = 0,78 | **Giữ** | — |
| §3.1 Ví dụ cụ thể đi trước khái quát | Concreteness fading; Alfieri (nguyên tắc sau so sánh) | **Giữ, lan sang §2.2** | Đây là lý do của dòng đầu bảng này |
| §3.1 Lời dẫn trước khối lệnh, cách đọc output sau | MDN, Google, Nasehi 2012 (3.3) | **Giữ, bổ sung** | Output ngay dưới code với câu "Kết quả:"; output 1–2 dòng ghi bằng comment; phần lược bỏ dùng comment, không dùng `...` (3.2, 3.4) |
| §3.1 Lượt đọc như người học | Curse of knowledge (10.6) | **Giữ** | Thêm vào checklist duyệt: kiểm từng khối code có output và câu đọc output chưa |
| §2.4 "Đoán trước" (chỉ ở lab) | Prediction (Brod 2021) | **Bổ sung vào bài đọc** | 1–3 chỗ mỗi bài, ở output gây bất ngờ |
| §2.5 Đào sâu (hỏi–đáp ẩn), §2.6 Dấu hiệu nắm chắc: bị bỏ ở bài đọc | Bỏ là mất kênh truy xuất, kỹ thuật có bằng chứng mạnh nhất (8.2) | **Giữ spec (đã quyết)** | Đề xuất 3–5 câu hỏi ôn có đáp án ẩn đã bị bỏ: chủ dự án quyết bài đọc giữ đúng ba phần (22/10/2026). Truy xuất trong bài chỉ còn 1–3 chỗ "Đoán trước" (8.1) |
| Spec user story 19: mục lục chỉ liệt kê ba phần | Microsoft: tài liệu dài cần mục lục tới đề mục con (7.6) | **Đổi (đã quyết)** | Chủ dự án duyệt (22/10/2026): mục lục hiện ba phần, các `###` của Kiến thức lồng dưới mục "Kiến thức". User story 19 và E2E trang bài đọc của spec đã sửa theo |
| Chưa có quy định độ dài bài | Ginns 2013: ranh giới 35 phút (2.6) | **Bổ sung** | Ghi thành gợi ý, không thành quy định: bài cần hơn khoảng 30–40 phút đọc thì cân nhắc tách **[suy luận]** (xem 2.6) |
| Chưa có ranh giới với tra cứu | Diátaxis: explanation không nuốt reference (1.7) | **Bổ sung** | Bảng method chỉ giữ cái cần cho lập luận; tra cứu đầy đủ trỏ Javadoc ở Tài liệu |

---

## 3. Phác thảo khung phần Kiến thức cho một bài đọc

### 3.1 Khung chung

```text
<Knowledge>

### <Khái niệm 1: cụm danh từ, hoặc câu nêu điều rút ra>
  a. Tình huống (1–3 câu): triệu chứng, output lạ hoặc câu hỏi người học hay gặp.
  b. Định nghĩa (1 câu): thuật ngữ in đậm, tiếng Anh giữ nguyên, giải nghĩa tiếng Việt.
  c. [Cơ chế nhiều thành phần] Bảng "thành phần | vai trò", 3–5 dòng.
  d. Ví dụ tối thiểu: lời dẫn → code (5–20 dòng, chạy được) → "Kết quả:" output → 1–3 câu đọc output.
     [Output gây bất ngờ] Câu "Đoán trước" đặt trước code.
  e. Vì sao như vậy và bên dưới chạy thế nào: văn xuôi; sơ đồ có caption, nhãn trên hình.
  f. Dùng khi nào: so sánh với lựa chọn khác (bảng nếu từ ba lựa chọn).
  g. Sai ở đâu: refutation (quan niệm sai → sai → vì sao → output → cách đúng),
     kèm cặp code sai/đúng nếu là bẫy code.
  h. [Tuỳ] Một callout production.
  i. [Mục dài] 1–2 câu chốt.

### <Khái niệm 2> ... (cùng khung; khái niệm sau được dựa vào khái niệm trước)

<Callout kind="ai">   Khi làm cùng AI: nhờ AI làm gì, AI hay sai ở đâu, cách kiểm lại.
<Callout kind="link"> Liên hệ bài khác: bài nào dùng lại kiến thức này, dùng thế nào.

</Knowledge>
```

Không phải khái niệm nào cũng cần đủ chín bước. Bước bắt buộc: a, b, d, e. Bước c chỉ cho cơ chế nhiều thành phần. Bước g chỉ khi có quan niệm sai thật sự phổ biến **[suy luận]**: các bước bắt buộc là phần tối thiểu để có tình huống cụ thể (1.1), định nghĩa trước khi dùng (1.2), ví dụ kèm output (1.3, 3.4) và lý do thiết kế (1.6).

### 3.2 Ví dụ dàn ý: J5.3 (Iterator, Comparator, Optional, collection bất biến)

Đây là phác thảo tham khảo để minh hoạ khung, không thay cho ticket viết bài mẫu J5.3. Dàn ý dựa trên J5.3 hiện tại. Mọi output phải chạy thật khi viết; dàn ý chỉ nêu cần có gì.

| `###` | a. Tình huống | d. Ví dụ + output | e. Cơ chế / sơ đồ | g. Sai ở đâu |
|---|---|---|---|---|
| Xoá trong lúc duyệt và fail-fast | Xoá sản phẩm hết hàng trong for-each thì ném `ConcurrentModificationException`, dù chỉ có một thread. **Đoán trước:** đoạn code in gì? | Vòng for-each khoảng 8 dòng; output: dòng đầu của stack trace | Bảng thành phần: iterator, `modCount`, giá trị iterator đã nhớ. Giữ sơ đồ ASCII hiện có, thêm caption "Iterator so số đếm của nó với `modCount` ở mỗi lần `next()`" | Quan niệm sai: "chữ *concurrent* nghĩa là chỉ xảy ra khi đa luồng". Trường hợp biên: xoá phần tử **kế cuối** không ném exception mà lặng lẽ bỏ qua phần tử cuối (**[đo]** Java 25.0.3: xoá `"B"` khỏi `[A, B, C]` trong for-each không ném gì, in `[A, C]`; khi viết bài cần in thêm phần tử được duyệt để thấy `C` bị bỏ qua). Cặp sai/đúng: `cart.remove(p)` và `cart.removeIf(...)` kèm output |
| Comparable: thứ tự tự nhiên | Cần sắp danh mục theo SKU | `Collections.sort` trên ba `Product`; output thứ tự. Thay `record Product(...)` bằng record đầy đủ hoặc comment `// các field khác` | Hợp đồng `compareTo`: âm, 0, dương | Quan niệm sai: "`(int) (a - b)` là cách so số gọn". Output cho thấy tràn số đổi dấu |
| Comparator: thứ tự bên ngoài | Trang danh mục cần sắp theo nhóm, cùng nhóm thì giá giảm dần | Chuỗi `comparing(...).thenComparing(...)`; output | Bảng method hiện có, chỉ giữ method dùng trong bài | `reversed()` đảo **toàn bộ** comparator đứng trước nó: cặp code và output khác nhau |
| TreeSet tin vào compare, không tin equals | Callout production hiện có ("Hàng bán chạy" mất sản phẩm) dời lên làm tình huống mở | `TreeSet` với comparator theo doanh số; `add` trả `false`; `size()` in 2 thay vì 3 | Vì sao: cây chỉ có phép so sánh, không có `equals` | Cách sửa: tiêu chí phân định cuối là khoá duy nhất, kèm output |
| Optional: kết quả có thể vắng mặt | `Map.get` trả `null`, bên gọi quên kiểm thì có NPE (nối với J5.1) | `findBySku` trả `Optional`; output của `orElseThrow` | Bảng method hiện có | Quan niệm sai: "`orElse(x)` chỉ tính `x` khi rỗng". Output cho thấy `x` luôn được tính, so với `orElseGet`. Javadoc ghi `Optional` chủ yếu dùng làm kiểu trả về của method; dùng cho field hay tham số là quy ước phổ biến nên tránh, không phải điều Javadoc cấm |
| Collection bất biến: view khác bản sao | Đưa list ra ngoài bằng `unmodifiableList` mà dữ liệu vẫn đổi | Sửa `source` rồi in `view` và `copy`; output cho thấy `view` đổi, `copy` giữ nguyên | Giữ sơ đồ source/view/copy hiện có, thêm caption | Quan niệm sai: "`unmodifiableList` làm dữ liệu không đổi". Thêm: bất biến là nông (shallow); thứ tự của `Set.of` đổi giữa các lần chạy |

Cuối bài giữ callout `ai` và `link` theo spec.

---

## 4. Những điểm chưa kiểm được

| Điểm | Tình trạng |
|---|---|
| Con số độ dài khối code (5–20 dòng), độ dài bài (30–40 phút), số callout mỗi bài | **[suy luận]**, không có nghiên cứu đo trực tiếp |
| Tốc độ đọc tiếng Việt để đổi phút thành số từ | Chưa kiểm được; không đưa con số |
| Áp segmenting và personalization (đo trên bài multimedia có lời nói) sang văn bản kỹ thuật dài | **[suy luận]** |
| Sung & Mayer 2012 (hình làm người đọc thích hơn nhưng không giúp học) | Chỉ đọc qua trang Google; chưa đọc được abstract (ScienceDirect chặn) |
| Meta-analysis về signaling (Schneider và cộng sự 2018), về contiguity (Ginns 2006), về seductive details (Rey 2012) | Có DOI nhưng không đọc được abstract (ScienceDirect chặn, Semantic Scholar ẩn abstract); không dùng làm căn cứ. Thay bằng bảng hệ số trong [Mayer 2024][mayer2024] |
| Schwartz & Bransford 1998 "A Time for Telling" | Không đọc được abstract; không dùng |
| Danh sách 10 nguyên tắc trong Mayer 2008 | Abstract không liệt kê; dùng bảng 15 nguyên tắc trong Mayer 2024 (toàn văn) |
| Kết quả subgoal label trong lập trình | Có lợi trong một nghiên cứu App Inventor ([Margulieux 2012][margulieux2012]) nhưng không lặp lại được trong một bài lập trình nhập môn ([Morrison 2015][morrison2015]); chưa đủ căn cứ để đưa vào chuẩn |

---

## 5. Nguồn

Ngày đọc: 22/10/2026. Bài báo có paywall: abstract đọc qua trang nhà xuất bản, Europe PMC hoặc OpenAlex; mọi DOI dưới đây đã kiểm là phân giải được qua doi.org.

### 5.1 Khung tài liệu và style guide

| Nguồn | Tác giả / tổ chức | Năm | Đã đọc |
|---|---|---|---|
| [Diátaxis: Explanation][diataxis-exp] | Daniele Procida | trang hiện hành | Toàn trang |
| [Diátaxis: Tutorials][diataxis-tut] | Daniele Procida | trang hiện hành | Toàn trang |
| [Diátaxis: The compass][diataxis-compass] | Daniele Procida | trang hiện hành | Toàn trang |
| [Technical Writing One: Paragraphs][g-para] | Google | trang hiện hành | Toàn trang |
| [Technical Writing One: Short sentences][g-sent] | Google | trang hiện hành | Toàn trang |
| [Technical Writing One: Lists and tables][g-lists] | Google | trang hiện hành | Toàn trang |
| [Technical Writing One: Words][g-words] | Google | trang hiện hành | Toàn trang |
| [Technical Writing One: Audience][g-aud] | Google | trang hiện hành | Toàn trang |
| [Technical Writing One: Documents][g-docs] | Google | trang hiện hành | Toàn trang |
| [Technical Writing Two: Illustrations][g-ill] | Google | trang hiện hành | Toàn trang |
| [Technical Writing Two: Sample code][g-code] | Google | trang hiện hành | Toàn trang |
| [Google developer documentation style guide: Voice and tone][gs-tone] | Google | trang hiện hành | Toàn trang |
| [Google style guide: Second person][gs-person] | Google | trang hiện hành | Toàn trang |
| [Google style guide: Active voice][gs-voice] | Google | trang hiện hành | Toàn trang |
| [Google style guide: Headings and titles][gs-head] | Google | trang hiện hành | Toàn trang |
| [Google style guide: Notes, cautions, warnings][gs-notice] | Google | trang hiện hành | Toàn trang |
| [Google style guide: Code samples][gs-codes] | Google | trang hiện hành | Toàn trang |
| [Microsoft Writing Style Guide: Top 10 tips][ms-top10] | Microsoft | cập nhật 2026 | Toàn trang |
| [Microsoft Writing Style Guide: Scannable content][ms-scan] | Microsoft | cập nhật 2023 | Toàn trang |
| [Microsoft Writing Style Guide: Code examples][ms-code] | Microsoft | cập nhật 2019 | Toàn trang |
| [Kubernetes Documentation Style Guide][k8s] | Kubernetes SIG Docs | trang hiện hành | Toàn trang (đọc hai lượt) |
| [MDN Writing style guide][mdn] | Mozilla | trang hiện hành | Toàn trang |
| [Write the Docs: Documentation principles][wtd] | Write the Docs | trang hiện hành | Toàn trang |
| [Organizing Instruction and Study to Improve Student Learning (IES practice guide)][ies] | Pashler, Bain, Bottge, Graesser, Koedinger, McDaniel, Metcalfe; IES/NCEE | 2007 | Trang tóm tắt khuyến nghị và mức bằng chứng; không đọc PDF |

### 5.2 Khoa học học tập

| Nguồn | Tác giả | Năm, nơi xuất bản | Đã đọc |
|---|---|---|---|
| [Cognitive Architecture and Instructional Design: 20 Years Later][sweller2019] | Sweller, van Merriënboer, Paas | 2019, *Educational Psychology Review* 31(2), 261–292 | Toàn văn (open access): các mục loại tải, worked example, split-attention, redundancy, element interactivity, expertise reversal, guidance fading, transient information, self-explanation, isolated elements |
| [Cognitive Architecture and Instructional Design][sweller1998] | Sweller, van Merriënboer, Paas | 1998, *Educational Psychology Review* 10(3), 251–296 | Chỉ metadata; nội dung dùng qua bản 2019 |
| [The Past, Present, and Future of the Cognitive Theory of Multimedia Learning][mayer2024] | Mayer | 2024, *Educational Psychology Review* 36 | Toàn văn (open access): mục ba loại xử lý; Bảng 6 (15 nguyên tắc, hệ số, số phép thử) |
| [Using multimedia for e-learning][mayer2017] | Mayer | 2017, *Journal of Computer Assisted Learning* 33(5), 403–423 | Abstract (OpenAlex) |
| [Applying the science of learning: Evidence-based principles for the design of multimedia instruction][mayer2008] | Mayer | 2008, *American Psychologist* 63(8), 760–769 | Abstract |
| [Nine Ways to Reduce Cognitive Load in Multimedia Learning][mayer2003] | Mayer, Moreno | 2003, *Educational Psychologist* 38(1), 43–52 | Abstract |
| [Fostering understanding of multimedia messages through pre-training][mayer2002] | Mayer, Mathias, Wetzell | 2002, *J. Experimental Psychology: Applied* 8(3), 147–154 | Abstract |
| [A Personalization Effect in Multimedia Learning][mayer2004] | Mayer, Fennell, Farmer, Campbell | 2004, *Journal of Educational Psychology* 96(2), 389–395 | Abstract |
| [Designing Instructional Text in a Conversational Style: A Meta-analysis][ginns2013] | Ginns, Martin, Marsh | 2013, *Educational Psychology Review* 25(4), 445–472 | Abstract (trang Springer) |
| [The Expertise Reversal Effect][kalyuga2003] | Kalyuga, Ayres, Chandler, Sweller | 2003, *Educational Psychologist* 38(1), 23–31 | Abstract |
| [Learning from Examples: Instructional Principles from the Worked Examples Research][atkinson2000] | Atkinson, Derry, Renkl, Wortham | 2000, *Review of Educational Research* 70(2), 181–214 | Abstract |
| [Toward an Instructionally Oriented Theory of Example-Based Learning][renkl2014] | Renkl | 2014, *Cognitive Science* 38(1), 1–37 | Abstract |
| [Concreteness Fading in Mathematics and Science Instruction: a Systematic Review][fyfe2014] | Fyfe, McNeil, Son, Goldstone | 2014, *Educational Psychology Review* 26(1), 9–25 | Abstract (trang Springer) |
| [Does comparing solution methods facilitate conceptual and procedural knowledge?][rittle2007] | Rittle-Johnson, Star | 2007, *Journal of Educational Psychology* 99(3), 561–574 | Abstract |
| [Learning Through Case Comparisons: A Meta-Analytic Review][alfieri2013] | Alfieri, Nokes-Malach, Schunn | 2013, *Educational Psychologist* 48(2), 87–113 | Abstract |
| [Refutation Text in Science Education: A Review of Two Decades of Research][tippett2010] | Tippett | 2010, *Int. J. of Science and Mathematics Education* 8(6), 951–970 | Abstract (trang Springer) |
| [Knowledge Revision Processes in Refutation Texts][kendeou2014] | Kendeou, Walsh, Smith, O'Brien | 2014, *Discourse Processes* 51(5–6), 374–397 | Abstract |
| [A critical review of the refutation text literature][zengilowski2021] | Zengilowski, Schuetze, Nash, Schallert | 2021, *Educational Psychologist* 56(3), 175–195 | Abstract |
| [Text-signaling devices and their effects on reading and memory processes][lorch1989] | Lorch | 1989, *Educational Psychology Review* 1(3), 209–234 | Abstract (trang Springer) |
| [Test-enhanced learning: taking memory tests improves long-term retention][roediger2006] | Roediger, Karpicke | 2006, *Psychological Science* 17(3), 249–255 | Abstract (Europe PMC, PMID 16507066) |
| [Retrieval Practice Produces More Learning than Elaborative Studying with Concept Mapping][karpicke2011] | Karpicke, Blunt | 2011, *Science* 331(6018), 772–775 | Abstract |
| [The effect of testing versus restudy on retention: A meta-analytic review][rowland2014] | Rowland | 2014, *Psychological Bulletin* 140(6), 1432–1463 | Abstract |
| [Rethinking the Use of Tests: A Meta-Analysis of Practice Testing][adesope2017] | Adesope, Trevisan, Sundararajan | 2017, *Review of Educational Research* 87(3), 659–701 | Abstract |
| [Improving Students' Learning With Effective Learning Techniques][dunlosky2013] | Dunlosky, Rawson, Marsh, Nathan, Willingham | 2013, *Psychological Science in the Public Interest* 14(1), 4–58 | Abstract đầy đủ (Europe PMC, PMID 26173288); trang SAGE chặn bot nên không đọc thân bài |
| [Distributed practice in verbal recall tasks: A review and quantitative synthesis][cepeda2006] | Cepeda, Pashler, Vul, Wixted, Rohrer | 2006, *Psychological Bulletin* 132(3), 354–380 | Abstract (Europe PMC) |
| [Inducing Self-Explanation: a Meta-Analysis][bisra2018] | Bisra, Liu, Nesbit, Salimi, Winne | 2018, *Educational Psychology Review* 30(3), 703–725 | Abstract (trang Springer) |
| [Self-Explanations: How Students Study and Use Examples in Learning to Solve Problems][chi1989] | Chi, Bassok, Lewis, Reimann, Glaser | 1989, *Cognitive Science* 13(2), 145–182 | Abstract |
| [Predicting as a learning strategy][brod2021] | Brod | 2021, *Psychonomic Bulletin & Review* 28(6), 1839–1847 | Abstract (Europe PMC) |
| [Prequestioning and Pretesting Effects: a Review][pan2023] | Pan, Carpenter | 2023, *Educational Psychology Review* 35(4) | Abstract |
| [The pretesting effect: Do unsuccessful retrieval attempts enhance learning?][richland2009] | Richland, Kornell, Kao | 2009, *J. Experimental Psychology: Applied* 15(3), 243–257 | Abstract |

### 5.3 Nghiên cứu về tài liệu lập trình

| Nguồn | Tác giả | Năm, nơi xuất bản | Đã đọc |
|---|---|---|---|
| [What Makes APIs Hard to Learn? Answers from Developers][robillard2009] | Robillard | 2009, *IEEE Software* 26(6), 27–34 | Toàn văn (bản tác giả, [PDF tại McGill][robillard2009-pdf]): khảo sát 1.000 người được mời, 83 trả lời (80 dùng được), 12 phỏng vấn; Bảng 1; các mục về thiết kế, ví dụ code, "magic" |
| [A field study of API learning obstacles][robillard2011] | Robillard, DeLine | 2011, *Empirical Software Engineering* 16(6), 703–732 | Abstract (trang Springer) |
| [Application Programming Interface Documentation: What Do Software Developers Want?][meng2018] | Meng, Steinhardt, Schubert | 2018, *J. of Technical Writing and Communication* 48(3), 295–330 | Abstract |
| [How developers use API documentation: an observation study][meng2019] | Meng, Steinhardt, Schubert | 2019, *Communication Design Quarterly* 7(2), 40–49 | Abstract |
| [How API Documentation Fails][uddin2015] | Uddin, Robillard | 2015, *IEEE Software* 32(4), 68–75 | Abstract |
| [What makes a good code example? A study of programming Q&A in StackOverflow][nasehi2012] | Nasehi, Sillito, Maurer, Burns | 2012, ICSM, 25–34 | Abstract |
| [Students' Misconceptions and Other Difficulties in Introductory Programming][qian2017] | Qian, Lehman | 2017, *ACM Transactions on Computing Education* 18(1) | Abstract |
| [Subgoal-labeled instructional material improves performance and transfer in learning to develop mobile applications][margulieux2012] | Margulieux, Guzdial, Catrambone | 2012, ICER, 71–78 | Abstract |
| [Subgoals, Context, and Worked Examples in Learning Computing Problem Solving][morrison2015] | Morrison, Margulieux, Guzdial | 2015, ICER, 21–29 | Abstract |

[diataxis-exp]: https://diataxis.fr/explanation/
[diataxis-tut]: https://diataxis.fr/tutorials/
[diataxis-compass]: https://diataxis.fr/compass/
[g-para]: https://developers.google.com/tech-writing/one/paragraphs
[g-sent]: https://developers.google.com/tech-writing/one/short-sentences
[g-lists]: https://developers.google.com/tech-writing/one/lists-and-tables
[g-words]: https://developers.google.com/tech-writing/one/words
[g-aud]: https://developers.google.com/tech-writing/one/audience
[g-docs]: https://developers.google.com/tech-writing/one/documents
[g-ill]: https://developers.google.com/tech-writing/two/illustrations
[g-code]: https://developers.google.com/tech-writing/two/sample-code
[gs-tone]: https://developers.google.com/style/tone
[gs-person]: https://developers.google.com/style/person
[gs-voice]: https://developers.google.com/style/voice
[gs-head]: https://developers.google.com/style/headings
[gs-notice]: https://developers.google.com/style/notices
[gs-codes]: https://developers.google.com/style/code-samples
[ms-top10]: https://learn.microsoft.com/en-us/style-guide/top-10-tips-style-voice
[ms-scan]: https://learn.microsoft.com/en-us/style-guide/scannable-content/
[ms-code]: https://learn.microsoft.com/en-us/style-guide/developer-content/code-examples
[k8s]: https://kubernetes.io/docs/contribute/style/style-guide/
[mdn]: https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide
[wtd]: https://www.writethedocs.org/guide/writing/docs-principles/
[ies]: https://ies.ed.gov/ncee/wwc/PracticeGuide/1
[sweller2019]: https://doi.org/10.1007/s10648-019-09465-5
[sweller1998]: https://doi.org/10.1023/A:1022193728205
[mayer2024]: https://doi.org/10.1007/s10648-023-09842-1
[mayer2017]: https://doi.org/10.1111/jcal.12197
[mayer2008]: https://doi.org/10.1037/0003-066X.63.8.760
[mayer2003]: https://doi.org/10.1207/S15326985EP3801_6
[mayer2002]: https://doi.org/10.1037/1076-898X.8.3.147
[mayer2004]: https://doi.org/10.1037/0022-0663.96.2.389
[ginns2013]: https://doi.org/10.1007/s10648-013-9228-0
[kalyuga2003]: https://doi.org/10.1207/S15326985EP3801_4
[atkinson2000]: https://doi.org/10.3102/00346543070002181
[renkl2014]: https://doi.org/10.1111/cogs.12086
[fyfe2014]: https://doi.org/10.1007/s10648-014-9249-3
[rittle2007]: https://doi.org/10.1037/0022-0663.99.3.561
[alfieri2013]: https://doi.org/10.1080/00461520.2013.775712
[tippett2010]: https://doi.org/10.1007/s10763-010-9203-x
[kendeou2014]: https://doi.org/10.1080/0163853X.2014.913961
[zengilowski2021]: https://doi.org/10.1080/00461520.2020.1861948
[lorch1989]: https://doi.org/10.1007/BF01320135
[roediger2006]: https://doi.org/10.1111/j.1467-9280.2006.01693.x
[karpicke2011]: https://doi.org/10.1126/science.1199327
[rowland2014]: https://doi.org/10.1037/a0037559
[adesope2017]: https://doi.org/10.3102/0034654316689306
[dunlosky2013]: https://doi.org/10.1177/1529100612453266
[cepeda2006]: https://doi.org/10.1037/0033-2909.132.3.354
[bisra2018]: https://doi.org/10.1007/s10648-018-9434-x
[chi1989]: https://doi.org/10.1207/s15516709cog1302_1
[brod2021]: https://doi.org/10.3758/s13423-021-01904-1
[pan2023]: https://doi.org/10.1007/s10648-023-09814-5
[richland2009]: https://doi.org/10.1037/a0016496
[robillard2009]: https://doi.org/10.1109/MS.2009.193
[robillard2009-pdf]: https://www.cs.mcgill.ca/~martin/papers/software2009a.pdf
[robillard2011]: https://doi.org/10.1007/s10664-010-9150-8
[meng2018]: https://doi.org/10.1177/0047281617721853
[meng2019]: https://doi.org/10.1145/3358931.3358937
[uddin2015]: https://doi.org/10.1109/MS.2014.80
[nasehi2012]: https://doi.org/10.1109/ICSM.2012.6405249
[qian2017]: https://doi.org/10.1145/3077618
[margulieux2012]: https://doi.org/10.1145/2361276.2361291
[morrison2015]: https://doi.org/10.1145/2787622.2787733
