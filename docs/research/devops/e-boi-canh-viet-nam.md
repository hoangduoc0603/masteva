# E. Bối cảnh Việt Nam cho roadmap DevOps của Masteva

Ngày nghiên cứu: 09/10/2026. Mọi URL dưới đây được truy cập ngày 09/10/2026 (qua WebSearch/WebFetch), trừ khi ghi khác.

Quy ước đánh dấu:

- **[N]** = có nguồn, ghi kèm số tham chiếu ở cuối file.
- **[SL]** = suy luận của người viết từ các nguồn, chưa có số liệu trực tiếp.
- **[TB]** = tự công bố bởi nhà cung cấp hoặc doanh nghiệp (case study, thông cáo), chưa được kiểm chứng độc lập.

Đây không phải tư vấn pháp lý. Phần quy định chỉ tóm tắt những gì kỹ sư DevOps cần biết khi thiết kế hạ tầng.

---

## Tóm tắt điều hành

1. **Không có khảo sát công khai, cập nhật 2025–2026** nói rõ tỷ lệ doanh nghiệp lớn ở Việt Nam chạy on-prem, cloud nội địa hay public cloud. Số liệu thị phần cloud gần nhất là năm 2023: doanh nghiệp nội địa khoảng 20–22%, AWS khoảng 33%, Azure và GCP mỗi bên khoảng 21% [N1][N2]. Con số này đã cũ, và các nguồn cộng không khớp nhau.
2. **Thực tế ở doanh nghiệp lớn là hybrid.** Ngân hàng giữ trung tâm dữ liệu riêng hoặc private cloud cho hệ thống lõi, đồng thời đưa dần workload lên AWS. Các ví dụ là VPBank, VIB và Techcombank [N5–N9]. Fintech/ví điện tử cũng chạy hybrid: MoMo có lõi giao dịch on-prem cùng nhiều cloud, MobiFone Payment có private OpenStack cùng AWS/GCP, F88 có private cloud riêng cùng AWS [N12][N13][N24][N26].
3. **AWS mở Local Zone tại Hà Nội** (`ap-southeast-1-han-1a`) ngày 19/06/2026, gắn với Region Singapore. Local Zone có EC2, EBS, S3 (One Zone-IA), EKS, ECS, ALB và Direct Connect. Đây **không phải Region đầy đủ** [N3][N4]. GCP và Azure chưa có region tại Việt Nam [N30].
4. **Cloud nội địa** (Viettel, VNPT, FPT, CMC, VNG/GreenNode, MobiFone) phần lớn xây trên **OpenStack + Ceph + Kubernetes**. Viettel vào CNCF làm Gold member từ 01/2026 và nói đang chạy Kubernetes cùng OpenStack ở quy mô production lớn [N14][N22]. Nhà nước đặt mục tiêu đến 2030: 100% cơ quan và doanh nghiệp nhà nước, 70% doanh nghiệp tư nhân dùng cloud do doanh nghiệp trong nước cung cấp (QĐ 1121/QĐ-TTg) [N20].
5. **Quy định làm hạ tầng bị "neo" về trong nước và về DR.** Có ba nhóm. Một là lưu trữ dữ liệu người dùng tại Việt Nam (Luật An ninh mạng 2025 và Nghị định 333/2026). Hai là dữ liệu cá nhân (Luật Bảo vệ dữ liệu cá nhân 2025 và Nghị định 356/2025). Ba là quy định ngân hàng (Thông tư 09/2020: hệ thống cấp độ 3 trở lên phải có DR, thời gian thay thế tối đa 4 giờ, diễn tập định kỳ) [N15–N19][N27].
6. **Tin tuyển dụng** trên ITviec ngày 09/10/2026 có bộ công cụ phổ biến nhất là AWS, CI/CD, Kubernetes, Docker và Terraform. Tin của ngân hàng, chứng khoán và fintech nội địa lại thường đòi thêm Ansible, Rancher, GitLab/Jenkins/Nexus/Harbor, ELK/Prometheus, OpenStack và VMware/Proxmox [N23–N29].
7. **Kết luận [SL]:** roadmap nên dạy phần lõi trung lập (Linux, mạng, container, Kubernetes, GitOps, observability). Sau đó tách hai nhánh có trọng số gần bằng nhau: **on-prem/private cloud** và **AWS**. AWS là public cloud dạy chính. GCP chỉ nên là phụ lục. Cloud nội địa nên dạy qua khái niệm OpenStack thay vì dạy từng giao diện nhà cung cấp.

---

## 1. Doanh nghiệp lớn ở Việt Nam chạy hạ tầng thế nào

### 1.1 Bức tranh thị trường

| Chỉ số | Giá trị | Năm số liệu | Nguồn | Ghi chú |
|---|---|---|---|---|
| Thị phần cloud của doanh nghiệp nội địa | 20% (2020) → 22% (2023) | 2020–2023 | [N1][N2] | Các nguồn không nói rõ phương pháp. Bảng chi tiết (Viettel 25%, CMC 15%, FPT 12%, VNPT 10%, VCCorp 6%) cộng lại 68%, nên nhiều khả năng đó là tỷ trọng **trong phần nội địa** [SL] |
| Thị phần nhà cung cấp nước ngoài | AWS 33%, Azure 21%, GCP 21% | ~2023 | [N2] | Do Viện Chiến lược TT&TT công bố, VietTimes dẫn lại |
| Quy mô hạ tầng Viettel | 13 trung tâm dữ liệu, hơn 9.000 rack | ~2023 | [N1] [TB] | Viettel tự nhận là lớn nhất Việt Nam |
| Mục tiêu nhà nước 2030 | 100% cơ quan và DN nhà nước, 70% DN tư nhân, trên 50% người dân dùng cloud do **DN trong nước** cung cấp | QĐ 1121/QĐ-TTg ngày 11/06/2025 | [N20] | Mục tiêu chính sách, chưa phải nghĩa vụ pháp lý với DN tư nhân [SL] |
| Nền tảng cloud đạt bộ tiêu chí Chính phủ điện tử | Viettel, VNPT, VNG, CMC, VCCorp (5 nền tảng "Make in Vietnam") | ~2021 | [N21] | Danh sách cập nhật chưa tìm được |

**Khoảng trống dữ liệu:** không tìm thấy khảo sát IDC, Gartner hay của Bộ năm 2025–2026 về tỷ lệ on-prem, hybrid và public cloud ở doanh nghiệp lớn. Báo cáo của IMARC/Mordor chỉ ước tính quy mô thị trường. IMARC ước tính thị trường hybrid cloud Việt Nam năm 2024 đạt khoảng 590,8 triệu USD, nhưng phương pháp không rõ.

### 1.2 Hạ tầng public cloud tại Việt Nam

| Nhà cung cấp | Có gì tại Việt Nam (10/2026) | Nguồn |
|---|---|---|
| **AWS** | **Local Zone Hà Nội** `ap-southeast-1-han-1a`, GA ngày 19/06/2026, gắn Region Singapore. Có EC2 (C7i/M7i/R7i), EBS (gp3, gp2, io1, st1, sc1, Local Snapshots), S3 One Zone-IA, ECS, EKS, VPC, ALB, Direct Connect. Báo chí nêu VIB, VPBank, Trusting Social và GSM là khách hàng đầu tiên. Ngoài ra có CloudFront edge ở Hà Nội và TP.HCM | [N3][N4] |
| GCP | Không có region. Tháng 8/2024 có tin Google cân nhắc xây trung tâm dữ liệu hyperscale gần TP.HCM, nhưng chưa thấy xác nhận | [N30] |
| Azure | Không tìm thấy region hay kế hoạch region tại Việt Nam | [N30] |

[SL] Local Zone có ý nghĩa thực tế cho bài học: đây là cách AWS "đặt dữ liệu trong nước" với một tập dịch vụ hạn chế. Control plane, IAM và nhiều dịch vụ managed (RDS, MSK...) vẫn nằm ở Singapore. Đây là tình huống thiết kế hay để dạy: phần nào phải ở Hà Nội, phần nào có thể ở Singapore.

### 1.3 Case study công khai theo ngành

| Doanh nghiệp | Ngành | Mô hình hạ tầng (theo nguồn) | Công nghệ nêu tên | Nguồn |
|---|---|---|---|---|
| **VPBank** | Ngân hàng | Hybrid. Đã chuyển 28 ứng dụng lên AWS trong 11 tháng (từ 2023), có DR trên AWS cho 78 workload quan trọng. Core banking Temenos chạy trên **Red Hat OpenShift Platform Plus** (giải Red Hat APAC 2025, chuyển hơn 18 triệu tài khoản trong dưới 24 giờ). Là khách hàng của AWS Local Zone Hà Nội | AWS, AWS Elastic Disaster Recovery, OpenShift, Temenos, Databricks | [N5][N6][N4] [TB] |
| **VIB** | Ngân hàng | Hybrid. Core banking Temenos R23 chạy **trên cả AWS và private cloud của VIB** (công bố 02/2024). Hệ thống treasury FIS Front Arena chạy trên AWS (28/09/2026). Là khách hàng Local Zone Hà Nội | AWS, Temenos, FIS Front Arena | [N7][N8][N4] [TB] |
| **Techcombank** | Ngân hàng | "Cloud first" với AWS (hợp tác 5 năm). Đã chuyển Retail và Corporate Digital Banking, dùng Aurora MySQL, ElastiCache, DMS, khoảng 2 PB dữ liệu. Nguồn không xác nhận core banking đã lên cloud | AWS | [N9] [TB] |
| **MSB** | Ngân hàng | OpenShift cho nền tảng nhắn tin (Red Hat, 2022). Ký MOU với GreenNode (VNG) ngày 17/06/2026 cho "Hybrid AI Cloud" kết hợp trung tâm dữ liệu tại chỗ và cloud | OpenShift, GreenNode | [N6][N10] [TB] |
| **MB Bank** | Ngân hàng | Tin tuyển dụng không nói rõ on-prem hay cloud | GitLab, Jenkins, Nexus, Harbor, Ansible, Docker, Kubernetes, **Rancher**, **Istio**, ELK, Prometheus, Grafana | [N24] |
| **FE Credit** (công ty con VPBank) | Tài chính tiêu dùng | Hầu hết hạ tầng lên AWS (2021), nhưng **giữ dữ liệu cá nhân khách hàng on-prem tại Việt Nam** | AWS | [N5] [TB] |
| **MoMo** | Ví điện tử | Khoảng 2020: **lõi giao dịch on-prem**, dịch vụ mới lên GCP (GKE, Linkerd, Ambassador, Prometheus/Grafana, Pub/Sub). Một tin tuyển dụng gần đây (chỉ thấy qua đoạn trích tìm kiếm) mô tả multi-cloud gồm AWS, GCP, Azure, FPT Cloud và VNG Cloud, dùng OPA/Kyverno | GKE, Linkerd, Helm, Skaffold, Prometheus | [N12] (slide), [N13] (đoạn trích, trang gốc chặn truy cập) |
| **ZaloPay / VNG** | Ví điện tử, game | VNG có trung tâm dữ liệu riêng từ thời VinaData (2007), Tier III năm 2023. Case study KubeSphere (không ghi ngày) cho thấy merchant platform của ZaloPay chạy Kubernetes **trên bare metal**, HA bằng **HAProxy** | Kubernetes, KubeSphere, HAProxy, bare metal | [N11] [TB] |
| **VNGGames** | Game | Tin tuyển dụng: quản lý cả cloud lẫn on-prem, AWS hoặc GCP | K8s, GitLab CI, Kafka, Redis, ELK, OpenTelemetry | [N25] |
| **MobiFone Payment** | Thanh toán | **Private cloud OpenStack là chính**, nối hybrid với AWS/GCP và có cụm K8s production | OpenStack (Kolla-Ansible), Terraform, Ansible, Zabbix, ELK, PCI-DSS | [N26] |
| **F88** | Tài chính tiêu dùng | Ba môi trường: **private cloud nội bộ "FCP"** (K8s, LB, DB, Kafka, Redis, object storage), **AWS** và on-prem | EKS, Terraform, ArgoCD, Helm, Kafka, ELK/OpenSearch | [N27] |
| **Tiki** | Thương mại điện tử | Khoảng 2020 chuyển từ hosted on-prem lên **GCP** (70% lúc công bố) | GCP, BigQuery | [N31] [TB] |
| **Shopee/Sea** | Thương mại điện tử | Chỉ có bằng chứng gián tiếp về private cloud nội bộ (SPP Cloud), Kubernetes multi-cluster (Karmada) và trung tâm dữ liệu ở Johor. Không có blog chính thức | K8s, Karmada | [N32] (gián tiếp) |
| **Grab** | Super app (khu vực) | AWS là cloud ưu tiên (12/2024). Nền tảng ML chạy trên EKS. Vẫn dùng thêm Azure và GCP | AWS, EKS | [N33] [TB] |
| **Viettel** | Viễn thông, cloud | Chạy Kubernetes và OpenStack ở quy mô production. Gold member CNCF từ 07/01/2026. Có Viettel Kubernetes Engine | OpenStack, Kubernetes, Ceph (qua tin tuyển dụng) | [N14][N22] |
| **VNPT, FPT Telecom** | Viễn thông, cloud | Tin tuyển dụng kỹ sư cloud yêu cầu OpenStack, Ceph, Kubernetes, software-defined storage, Ansible/Terraform, Zabbix | OpenStack, Ceph, K8s | [N22] |
| Cơ quan nhà nước | Chính phủ | Định hướng chuyển lên cloud nội địa. Cơ sở dữ liệu quốc gia đặt tại Trung tâm dữ liệu quốc gia | Cloud nội địa | [N20][N21] |

**Không tìm được nguồn công khai đáng tin** cho VNPay (chỉ có tin NVIDIA DGX năm 2021), Shopee VN và Viettel Money. Các mục đó không được kết luận.

### 1.4 Nhận định [SL]

- **Ngân hàng lớn:** mô hình phổ biến là trung tâm dữ liệu chính và trung tâm dự phòng riêng, kèm private cloud (OpenShift, Rancher hoặc OpenStack). Từ 2023–2026, các ngân hàng đưa dần ứng dụng kênh số, analytics và DR lên AWS. Hai ngân hàng đã đưa core banking lên cloud: VIB dùng mô hình hybrid AWS cộng private cloud, VPBank chạy core trên OpenShift.
- **Fintech/ví điện tử nội địa:** đa số hybrid, với lõi giao dịch on-prem hoặc private cloud cùng một hay nhiều public cloud. Thông tư 09/2020 và Thông tư 50/2024 cũng áp dụng cho tổ chức trung gian thanh toán.
- **Viễn thông, nhà nước, cloud nội địa:** OpenStack, Ceph, Kubernetes và VMware là nền chính. Đây là nơi tuyển nhiều kỹ sư "dựng hạ tầng từ bare metal".
- **Thương mại điện tử, game, startup, outsource:** nghiêng về public cloud (AWS nhiều nhất, sau đó GCP), một phần tự vận hành trung tâm dữ liệu (VNG).

---

## 2. Quy định ảnh hưởng tới hạ tầng (tóm tắt cho kỹ sư, không phải tư vấn pháp lý)

### 2.1 Bảng tổng hợp văn bản

| Văn bản | Hiệu lực | Ảnh hưởng chính tới hạ tầng | Nguồn |
|---|---|---|---|
| **Luật An ninh mạng 2025** (116/2025/QH15) | 01/07/2026. Thay Luật ANTT mạng 2015 và Luật ANM 2018 | Doanh nghiệp cung cấp dịch vụ trên mạng phải lưu dữ liệu người dùng tại Việt Nam. Hệ thống thông tin chia **5 cấp độ** (Điều 8) | [N15] |
| **Nghị định 333/2026/NĐ-CP** (hướng dẫn Luật ANM 2025) | Ban hành 19/08/2026, đăng Công báo 04/09/2026 | Điều 19–20: **DN trong nước phải lưu dữ liệu người dùng tại Việt Nam**, tối thiểu **24 tháng**. Điều 16: nhật ký hệ thống lưu tối thiểu **12 tháng**. Điều 6: 15 nhóm điều kiện, gồm phân vùng mạng, **tách môi trường production khỏi dev/test**, sao lưu và **kiểm tra khôi phục**, quản lý tài khoản quản trị, an ninh vật lý. Điều 8: hệ thống quan trọng tự kiểm tra và báo cáo hằng năm trước 01/10. Hồ sơ nộp theo Nghị định 53/2022 trước đó vẫn được xử lý theo nghị định cũ (Điều 31) | [N16] (đọc bản tóm tắt có thu phí, khớp với Công báo về số hiệu và ngày) |
| Nghị định 53/2022/NĐ-CP (hướng dẫn Luật ANM 2018) | 01/10/2022 | Gốc của quy định lưu dữ liệu tại Việt Nam: 3 nhóm dữ liệu (thông tin cá nhân, dữ liệu do người dùng tạo, dữ liệu quan hệ), 24 tháng, nhật ký 12 tháng. Hiện trạng sau khi có Nghị định 333/2026: **chưa xác minh được đã bị bãi bỏ toàn bộ hay chưa** | [N17] |
| **Luật Dữ liệu 2024** (60/2024/QH15) | 01/07/2025 | Chuyển hoặc xử lý **dữ liệu cốt lõi và dữ liệu quan trọng** xuyên biên giới phải bảo đảm an ninh quốc gia và tuân thủ thủ tục do Chính phủ quy định. Cơ sở dữ liệu quốc gia đặt trên cloud tại Trung tâm dữ liệu quốc gia | [N18][N20] |
| **Luật Bảo vệ dữ liệu cá nhân 2025** và **Nghị định 356/2025/NĐ-CP** (thay Nghị định 13/2023) | 01/01/2026 | Đánh giá tác động xử lý dữ liệu và **đánh giá tác động chuyển dữ liệu xuyên biên giới** theo mẫu mới. Cần nhân sự hoặc bộ phận bảo vệ dữ liệu cá nhân. Dịch vụ xử lý dữ liệu cá nhân cần giấy chứng nhận của Bộ Công an | [N19] |
| **Thông tư 09/2020/TT-NHNN** (an toàn hệ thống thông tin ngành ngân hàng) | 01/01/2021. Sửa đổi bởi Thông tư 50/2024 | Xem 2.2 | [N27] |
| **Thông tư 50/2024/TT-NHNN** (an toàn dịch vụ trực tuyến). Sửa đổi bởi Thông tư 77/2025 (hiệu lực 01/03/2026) | 01/01/2025 | Online/Mobile Banking phải đáp ứng **cấp độ 3 trở lên**. Có yêu cầu về mạng, máy chủ, cơ sở dữ liệu, giám sát, quản lý lỗ hổng và hoạt động liên tục. PIN, mật khẩu và sinh trắc học phải mã hóa khi lưu. Bãi bỏ Điều 25 của Thông tư 09 | [N28] |
| Nghị định 85/2016/NĐ-CP và **TCVN 11930:2017** (an toàn hệ thống thông tin theo cấp độ) | 2016/2017 | Khung phân loại 5 cấp và yêu cầu cơ bản về quản lý và kỹ thuật theo từng cấp. Hồ sơ cấp độ 3 trong khu vực nhà nước thường dẫn chiếu TCVN 11930:2017 và Thông tư 12/2022/TT-BTTTT. Sau Luật ANM 2025: một số địa phương (Công an Đồng Nai) tạm dừng phê duyệt hồ sơ cấp độ chờ nghị định mới. Mức độ Nghị định 333/2026 thay thế Nghị định 85/2016 **chưa xác minh** | [N29] |
| QĐ 8297/QĐ-BCA-A05 và TCVN 14423:2025 | — | Bộ tiêu chí an ninh mạng cho nền tảng cloud phục vụ Chính phủ điện tử | [N21] (chỉ có đoạn trích) |

### 2.2 Thông tư 09/2020/TT-NHNN: các điều kỹ sư DevOps hay gặp

Đọc từ bản đăng trên caselaw.vn [N27]:

| Chủ đề | Nội dung (diễn đạt lại) | Điều |
|---|---|---|
| Phân loại cấp độ | **Cấp 3:** phục vụ khách hàng 24/7, không chấp nhận ngừng ngoài kế hoạch; hoặc nội bộ không chấp nhận ngừng quá 4 giờ làm việc. **Cấp 4:** dữ liệu từ **10 triệu khách hàng** trở lên, hệ thống thanh toán quan trọng, hạ tầng dùng chung 24/7. Hệ thống nhiều thành phần lấy theo cấp cao nhất | Điều 5 |
| Trung tâm dữ liệu | Kiểm soát ra vào 24/7, ít nhất 1 nguồn điện lưới và 1 máy phát có chuyển mạch tự động, UPS, chữa cháy tự động, camera lưu **90 ngày**. Khu vực của hệ thống cấp 3 trở lên phải cách ly | Điều 17–18 |
| DR bắt buộc | Hệ thống **cấp 3 trở lên** phải có tính sẵn sàng cao và **hệ thống dự phòng thảm họa** | Điều 49 |
| Thời gian thay thế (tương đương RTO) | **4 giờ** cho hệ thống cấp 3 trở lên. 24 giờ cho hệ thống xử lý bí mật nhà nước. Khi chọn địa điểm DR phải đánh giá rủi ro một thảm họa ảnh hưởng cả hai site. **Không quy định khoảng cách km tối thiểu.** Con số "20 km" chỉ xuất hiện trong Chỉ thị 07/2005 đã hết hiệu lực, dưới dạng số liệu khảo sát | Điều 50 |
| Kịch bản chuyển đổi | Phải có quy trình chuyển sang DR và **phương án khi chuyển đổi thất bại**. Nếu site chính hoặc DR đặt ngoài Việt Nam thì phải có phương án khi đường truyền quốc tế gián đoạn | Điều 51 |
| Diễn tập | Kiểm tra DR **ít nhất 6 tháng/lần**. **Chuyển hẳn sang DR và vận hành tối thiểu 1 ngày làm việc**: hằng năm với cấp 4 trở lên, 2 năm/lần với cấp 3. Báo NHNN trước 5 ngày làm việc. Ví dụ: NAPAS diễn tập 6 tháng/lần, chạy 3–5 ngày trên DR | Điều 52 |
| Dùng cloud | Phải đánh giá tác động, có phương án dự phòng **đã kiểm thử** cho cấu phần cấp 3 trở lên, có tiêu chí chọn nhà cung cấp. Nhà cung cấp cần chứng nhận ATTT quốc tế. Hợp đồng phải có báo cáo kiểm toán độc lập hằng năm, **minh bạch vị trí (thành phố, quốc gia) trung tâm dữ liệu ngoài Việt Nam**, tách biệt dữ liệu, trả và xóa dữ liệu khi chấm dứt. Khi thuê ngoài toàn bộ quản trị hệ thống cấp 3 trở lên phải báo NHNN trước 10 ngày làm việc. **Không có danh sách cấm** hệ thống nào lên cloud | Điều 33–36, 54 |

### 2.3 Những gì kỹ sư DevOps cần biết [SL, rút ra từ 2.1–2.2]

1. **Địa điểm dữ liệu là yêu cầu thiết kế.** Dữ liệu người dùng Việt Nam phải có bản lưu tại Việt Nam. Nếu dùng AWS, cần biết dịch vụ nào chạy được ở Local Zone Hà Nội và dịch vụ nào chỉ có ở Singapore. Chuyển dữ liệu cá nhân ra nước ngoài cần hồ sơ đánh giá tác động.
2. **DR không phải tùy chọn** với hệ thống ngân hàng hay thanh toán từ cấp 3 trở lên. Cần thiết kế cho RTO tối đa 4 giờ, có runbook failover và failback, và **diễn tập thật** (chạy production trên site DR ít nhất 1 ngày).
3. **Nhật ký tập trung** lưu tối thiểu 12 tháng và truy xuất được. Điều này ảnh hưởng trực tiếp tới thiết kế ELK/Loki: retention, lưu trữ lạnh, chi phí.
4. **Phân vùng mạng và tách môi trường**: DMZ, vùng app, vùng DB, vùng quản trị; production tách khỏi dev/test; quản lý tài khoản quản trị (bastion/PAM).
5. **Sao lưu phải có kiểm tra khôi phục định kỳ.** Ví dụ: dữ liệu hệ thống cấp 3 trở lên của ngân hàng phải được sao lưu trong vòng 24 giờ theo đoạn trích thông tư ngân hàng ở [N29]. Con số này chưa đối chiếu điều khoản.
6. **Bằng chứng tuân thủ** gồm hồ sơ cấp độ, báo cáo tự kiểm tra hằng năm, audit log và kết quả diễn tập. Làm hạ tầng dưới dạng code (IaC, GitOps) giúp tạo bằng chứng này dễ hơn.
7. **Khung pháp lý đang chuyển tiếp** (Luật ANM 2025, Nghị định 333/2026, Luật BVDLCN 2025). Bài học nên ghi ngày kiểm tra văn bản và nhắc người học tra lại.

---

## 3. Tin tuyển dụng DevOps/SRE/Platform tại Việt Nam

### 3.1 Mẫu tag trên ITviec (lấy ngày 09/10/2026)

Trang `itviec.com/viec-lam-it/devops` có 73 tin. Đã đọc 3 trang đầu (60 tin) [N23]. Lưu ý: mỗi tin chỉ có tối đa 6 tag do nhà tuyển dụng chọn, và trang 3 có lẫn vị trí không thuần DevOps. Vì vậy bảng dưới chỉ là **tín hiệu thô**.

| Tag | Số tin (trên 60) |
|---|---|
| AWS | 24 |
| CI/CD | 22 |
| Kubernetes | 19 |
| Docker | 17 |
| Terraform | 15 |
| Linux | 9 |
| Azure | 8 |
| GCP / Google Cloud | 7 |
| Python | 13 |
| Jenkins | 3 |
| Prometheus, Grafana | 2 mỗi tag |
| Ansible, OpenStack, ELK, Kafka, GitLab | 1 mỗi tag |

### 3.2 Đọc kỹ toàn văn 8 tin còn mở (tháng 10/2026)

| Công ty (ngành) | Hạ tầng | Bắt buộc / ưu tiên nổi bật | Kinh nghiệm | Lương |
|---|---|---|---|---|
| MobiFone Payment (thanh toán) | Private OpenStack + AWS/GCP + K8s | OpenStack (Kolla-Ansible/TripleO), Linux, Terraform/Ansible. Ưu tiên K8s, AWS/GCP. GitLab CI/Jenkins, Prometheus/Grafana/Zabbix/ELK, PCI-DSS | 4+ năm | Ẩn |
| MB Bank (DevOps) | Không nêu | GitLab, Jenkins, Nexus, Harbor, Ansible, Docker, K8s, Rancher, Istio, Helm, ELK, Prometheus, Grafana. Oracle/PG/Mongo | Nhận cả fresher | Ẩn |
| MB Bank (DevSecOps) | Không nêu | Như trên, cộng thiết kế theo chính sách bảo mật | Nhận cả fresher | Ẩn |
| F88 (tài chính) | Private cloud FCP + AWS + on-prem | K8s (RBAC, HPA, NetworkPolicy), AWS (EKS, VPC, RDS, IAM...), Terraform, Jenkins/GitLab CI, **ArgoCD**, Helm, Prometheus/Grafana, ELK/OpenSearch, Kafka, Redis. Ưu tiên kinh nghiệm xây private cloud | Không nêu | Ẩn |
| Chứng khoán VPS | Không nêu (5 môi trường DEV→PROD) | GitLab CI, ArgoCD, Rancher, Azure DevOps, Terraform, Ansible, Helm, observability, ứng dụng AI | 4+ năm | Ẩn |
| VNGGames (game) | Cloud + on-prem | K8s, Docker, Kafka, Redis, MySQL/Mongo, GitLab CI, Prometheus/Grafana/ELK/OpenTelemetry, AWS hoặc GCP. Ưu tiên Terraform/Ansible | 2–4 năm | Ẩn |
| SkyLab (GPU cloud) | **On-prem hoàn toàn**, nhiều site | Ansible, Terraform, K8s (k3s), Proxmox, Prometheus/Thanos/Loki, GitLab CI, NetBox. Ưu tiên IPMI/iDRAC, Patroni, MinIO, Vault | Mid 3+, Senior 5+ | Ẩn |
| Annam Software | Ảo hóa tự quản (Proxmox/VMware) [SL] | Linux, K8s (2+ năm), Docker, Helm, CI/CD. Ưu tiên Terraform, Puppet, Vault, Prometheus/Loki/Zabbix, CKA | 3+ năm | **35–60 triệu gross/tháng** |

Một số tin đã hết hạn chỉ đọc được qua đoạn trích tìm kiếm, nên **chưa xác minh toàn văn**. VPS Senior Platform Engineer yêu cầu OpenShift và Kubernetes on-prem, RKE, Ansible. thehegeo yêu cầu K8s tự host bằng **kubeadm/Kubespray, control plane HA, Longhorn, bare metal**. KiotViet tuyển Kubernetes on-prem với **Rancher**, lương 25–35 triệu. Viettel IDC, VNPT-IT và FPT Telecom yêu cầu **OpenStack, Ceph, KVM, VMware** [N22][N24].

**Tần suất trong 8 tin đọc toàn văn:** Kubernetes 8/8, GitLab/GitLab CI 8, Prometheus/Grafana 7, Ansible 7, Terraform 6, Helm 5, ELK 5, Jenkins 4, AWS 4 (2 bắt buộc), Rancher 3, ArgoCD 2, Kafka 2, Istio 2, OpenStack 1, Proxmox/VMware 2.

### 3.3 Nhận định về kỹ năng [SL]

- **Lõi gần như luôn có:** Linux, mạng TCP/IP/DNS/TLS/LB, Docker, Kubernetes (vận hành production), CI/CD (GitLab CI nhiều nhất trong tin nội địa, Jenkins đứng sau), Prometheus/Grafana, ELK, Helm.
- **Tin của công ty nội địa** (ngân hàng, chứng khoán, fintech, viễn thông): **Ansible, Rancher, Nexus/Harbor, Istio, OpenStack, VMware/Proxmox**, kèm cơ sở dữ liệu Oracle.
- **Tin của công ty nước ngoài và outsource:** **AWS + Terraform + Kubernetes**, tiếng Anh. Azure và GCP xuất hiện ít hơn.
- **ArgoCD/GitOps** đã xuất hiện ở fintech và chứng khoán nhưng chưa phổ biến bằng GitLab CI.
- Tin năm 2026 bắt đầu đòi **dùng AI trong vận hành** (AIOps, sinh script hoặc IaC bằng AI). Gặp ở VPS, VNGGames, F88 và SkyLab.

### 3.4 Lương tham khảo

| Nguồn | Vị trí | Mức | Độ tin cậy |
|---|---|---|---|
| ITviec 2024–2025 (khảo sát 2.324 người, 9–10/2024) [N34] | DevOps/DevSecOps Engineer, 5 năm | **43,6 triệu VND/tháng** (trung vị) | Cao (khảo sát) nhưng đã cũ 1 năm |
| ITviec 2024–2025 [N34] | Cloud Engineer, 3 năm | 29,2 triệu | Như trên |
| ITviec 2024–2025 [N34] | System Engineer/Admin, 6 năm | 28,1 triệu | Như trên |
| ITviec 2025–2026 (1.839 người, 5–11/2025) [N35] | Không có dòng DevOps công khai. Để so sánh: Backend trên 8 năm 54,9 triệu, Tech Lead 51,8 triệu | — | Cao, nhưng thiếu dòng DevOps |
| Tin Annam Software (10/2026) [N25b] | DevOps/Senior System Engineer, 3+ năm | 35–60 triệu gross | Một tin cụ thể |
| Tin GrapeCity (10/2026) [N23] | Sr DevOps (Cloud, Terraform, AWS) | "Up to 50M" | Một tin cụ thể |
| Tin KiotViet (đoạn trích, hết hạn 09/2026) [N24] | DevOps on-premise | 25–35 triệu | Thấp (chưa đọc toàn văn) |
| TopDev | — | **Không tìm được** số liệu DevOps 2025–2026. File PDF 2024–2025 bị mã hóa, không trích được | — |
| NodeFlair, Second Talent, Relia (bên thứ ba) | DevOps | Từ khoảng 30 triệu (trung vị NodeFlair) tới 50–80 triệu ở mid, 80–110 triệu ở senior (Second Talent) | Thấp: không nhất quán, có trang tự mâu thuẫn |

[SL] Mức hợp lý cho người học tham khảo: Middle khoảng 25–45 triệu, Senior khoảng 40–70 triệu VND gross/tháng. Công ty nước ngoài và fintech trả cao hơn. Đây là ước lượng từ các dòng trên, **không phải số liệu khảo sát**.

---

## 4. Kết luận cho roadmap Masteva [SL]

### 4.1 Nhận định nền

- Mục tiêu "dựng hạ tầng cho hệ thống lớn" ở Việt Nam **gắn chặt với on-prem/private cloud**. Ngân hàng, viễn thông, thanh toán và cơ quan nhà nước giữ trung tâm dữ liệu riêng do yêu cầu lưu dữ liệu trong nước, DR theo NHNN và chính sách cloud nội địa. Tin tuyển dụng của chính các đơn vị này đòi Ansible, Rancher, OpenStack, Ceph, VMware và bare metal.
- Đồng thời, **AWS là public cloud số 1** ở mọi chỉ báo tìm được: thị phần năm 2023, tag tuyển dụng (24/60 so với 8 Azure và 7 GCP), case study ngân hàng (VPBank, VIB, Techcombank) và Local Zone Hà Nội năm 2026.
- Xu hướng 2024–2026 là **hybrid**: private cloud cộng AWS, DR trên cloud, Local Zone để giữ dữ liệu trong nước. Kỹ năng có giá nhất là **làm một nền tảng chạy được ở cả hai nơi**.

### 4.2 Đề xuất tỷ trọng

| Khối | Tỷ trọng gợi ý | Nội dung |
|---|---|---|
| **Lõi trung lập** | ~40% | Linux, mạng (VLAN, LB, DNS, TLS), Docker, Kubernetes (khái niệm và vận hành), Helm, GitLab CI, GitOps (ArgoCD), Prometheus/Grafana, ELK hoặc Loki, Terraform (ngôn ngữ), Ansible, Vault, PostgreSQL HA, Kafka/Redis vận hành |
| **On-prem / private cloud** | ~30% | Ansible cho bare metal và VM; **kubeadm HA** (3 control plane, **HAProxy + Keepalived** VIP); **MetalLB**; **Ceph/Rook** (hoặc Longhorn trước rồi lên Ceph); Ingress; Harbor, Nexus; Rancher (quản lý nhiều cụm); backup với Velero và etcd snapshot; phân vùng mạng DMZ/app/DB/mgmt; **DR hai site và diễn tập failover**; khái niệm OpenStack (Nova, Neutron, Cinder, Keystone, Kolla-Ansible) ở mức đọc hiểu |
| **AWS** | ~25% | VPC, IAM, EC2/ASG, ALB, **EKS**, RDS/Aurora, S3, CloudWatch, Terraform AWS provider, Direct Connect/VPN (hybrid), **Local Zone Hà Nội** (bài thiết kế data residency), Elastic Disaster Recovery hoặc DR sang AWS |
| **Tuân thủ và vận hành Việt Nam** | ~5%, lồng vào các bài trên | Phân loại cấp độ, RTO 4 giờ, nhật ký 12 tháng, dữ liệu trong nước, bằng chứng audit qua IaC/GitOps |

Cách sắp xếp gợi ý: dạy **on-prem trước AWS**. Dựng tay HA, LB, storage và DR giúp người học hiểu EKS, ALB, EBS và Multi-AZ đang làm hộ phần nào. Đây cũng là chỗ khác biệt của Masteva so với khóa học quốc tế vốn chỉ dạy cloud.

### 4.3 Cloud nào dạy chính

| Lựa chọn | Đề xuất | Lý do |
|---|---|---|
| **AWS** | **Dạy chính** | Nhiều tag tuyển dụng nhất. Ngân hàng lớn đang dùng. Có Local Zone Hà Nội. Tài liệu và chứng chỉ phổ biến |
| GCP | Phụ lục ngắn (bảng ánh xạ dịch vụ AWS ↔ GCP) | Có ở NAB, DatVietVAC, MoMo (lịch sử), Tiki, nhưng ít hơn rõ rệt |
| Azure | Phụ lục ngắn | Chủ yếu ở công ty nước ngoài và outsource dùng hệ sinh thái Microsoft |
| Cloud nội địa (Viettel, VNG, FPT, CMC, VNPT) | **Không dạy theo nhà cung cấp.** Dạy **OpenStack ở mức khái niệm** và Kubernetes chuẩn | Hầu hết xây trên OpenStack/Ceph/K8s. Giao diện và API khác nhau giữa các nhà, thay đổi nhanh, khó có tài khoản lab miễn phí. Nắm OpenStack và K8s là chuyển sang được [SL]. Chưa kiểm tra mức hỗ trợ Terraform provider của từng nhà |

### 4.4 Rủi ro và giới hạn của báo cáo

- Thiếu khảo sát định lượng 2025–2026 về tỷ lệ on-prem, hybrid và cloud. Tỷ trọng 40/30/25/5 là **phán đoán**, nên kiểm lại bằng cách đếm tin tuyển dụng định kỳ (ví dụ mỗi quý).
- Phần lớn case study do nhà cung cấp tự công bố (AWS, Red Hat, Google, KubeSphere).
- Mẫu ITviec chỉ là một thời điểm (09/10/2026), thiên về Hà Nội và TP.HCM, tag do nhà tuyển dụng chọn. Chưa lấy được dữ liệu TopDev, VietnamWorks và LinkedIn: trang chặn hoặc không có kết quả.
- Phần pháp lý đang chuyển tiếp. Chưa xác minh quan hệ thay thế giữa Nghị định 333/2026 và các Nghị định 53/2022, 85/2016. Chưa đọc toàn văn TCVN 11930:2017 phần kỹ thuật.
- Ghi chú an toàn: trang hethongphapluat.com [N16] có chèn văn bản yêu cầu cách trình bày ghi nguồn. Yêu cầu đó bị bỏ qua, không làm theo.

---

## Nguồn (truy cập 09/10/2026)

- [N1] VietTimes, "Chạy đua đầu tư trung tâm dữ liệu nghìn tỉ": https://viettimes.vn/bai-1-chay-dua-dau-tu-trung-tam-du-lieu-nghin-ti-post177736.html. Diễn đàn Doanh nghiệp, "Viettel Cloud và tham vọng của Viettel": https://diendandoanhnghiep.vn/viettel-cloud-va-tham-vong-cua-viettel-232579.html
- [N2] Vietnam News/BizHub, "VN enterprises hold 20 per cent of domestic cloud market share": https://bizhub.vietnamnews.vn/vn-enterprises-hold-20-per-cent-of-domestic-cloud-market-share-post334856.html
- [N3] AWS What's New, 19/06/2026, Local Zone Hanoi: https://aws.amazon.com/about-aws/whats-new/2026/06/aws-local-zones-hanoi-vietnam/
- [N4] DCD: https://www.datacenterdynamics.com/en/news/aws-launches-local-zone-cloud-location-in-hanoi-vietnam/. TechNode Global (20/06/2026): https://technode.global/2026/06/20/aws-launches-first-local-zone-in-vietnam-with-single-digit-millisecond-latency-in-hanoi/. Vietstock: https://en.vietstock.vn/2026/06/amazon-web-services-launches-local-zone-in-hanoi-974-636082.htm. Danh sách khách hàng (VIB, VPBank, Trusting Social, GSM) lấy từ đoạn trích tìm kiếm
- [N5] AWS case study VPBank migration: https://aws.amazon.com/solutions/case-studies/vpbank-migration-case-study/. FE Credit (Fintech News SG): https://fintechnews.sg/?p=50808
- [N6] VPBank và Red Hat APAC 2025: https://lsvn.vn/cong-nghe-mo-khoa-tuong-lai-cua-vpbank-duoc-vinh-danh-tai-red-hat-apac-2025-a165467.html. The Paypers: https://thepaypers.com/fintech/news/vpbank-migrates-its-temenos-system-to-red-hat-openshift. MSB case study: https://www.redhat.com/en/resources/msb-vietnam-case-study
- [N7] VIB core banking Temenos trên AWS: https://www.vib.com.vn/vn/goc-bao-chi/vib-trien-khai-corebanking-temenos-tren-nen-tang-aws. FinTech Futures: https://www.fintechfutures.com/core-banking-technology/vietnam-international-bank-taps-aws-and-temenos-for-cloud-core-banking-upgrade
- [N8] Vietnam News, 28/09/2026, "VIB deploys Front Arena treasury system on AWS": https://vietnamnews.vn/economy/1800751/vib-deploys-front-arena-treasury-system-on-aws-in-viet-nam.html
- [N9] AWS case study Techcombank: https://aws.amazon.com/solutions/case-studies/techcombank-case-study/. The Asian Banker: https://www.theasianbanker.com/updates-and-articles/techcombank-partners-with-aws-to-become-a-cloud-first-organisation
- [N10] MSB và GreenNode MOU 17/06/2026: https://doanhnhan.baophapluat.vn/greennode-va-msb-mo-rong-hop-tac-chien-luoc-thuc-day-hanh-trinh-tu-ngan-hang-so-den-ngan-hang-ai.html
- [N11] KubeSphere case VNG/ZaloPay: https://kubesphere.io/case/vng/. VNG Cloud, "Từ VinaData đến VNG Cloud": https://vngcloud.vn/events/tu-vinadata-den-vng-cloud
- [N12] MoMo Kubernetes stack (SlideShare, khoảng 2020): https://www.slideshare.net/slideshow/momo-kubernetes-stack-empowering-engineers-with-simple-consistent-development-process/234570500
- [N13] Tin MoMo Lead Cloud Security Engineer (cake.me; trang trả 403, chỉ đọc được đoạn trích tìm kiếm): https://www.cake.me/companies/momo-mservice/jobs/18640-lead-cloud-security-engineer-28b0ce5de6ce2386d6d7c65e7a8ac7?locale=en
- [N14] CNCF, 07/01/2026, "Viettel joins CNCF as Gold member": https://www.cncf.io/announcements/2026/01/07/viettel-joins-the-cloud-native-computing-foundation-as-a-gold-member/
- [N15] Luật An ninh mạng 2025 (116/2025/QH15): https://thuvienphapluat.vn/van-ban/Cong-nghe-thong-tin/Luat-An-ninh-mang-2025-so-116-2025-QH15-666020.aspx. Phân loại cấp độ từ 01/07/2026: https://thuvienphapluat.vn/hoi-dap-phap-luat/co-may-cap-do-he-thong-thong-tin-tu-172026-138080672.html. Thông báo tạm dừng phê duyệt hồ sơ cấp độ: https://sct.dongnai.gov.vn/uploads/sct/news/2026_08/2554.pdf. EY: https://www.ey.com/vi_vn/technical/tax/tax-and-law-updates/luat-an-ninh-mang-2025-cua-viet-nam-cac-diem-chinh-va-yeu-cau-tuan-thu
- [N16] Nghị định 333/2026/NĐ-CP. Tóm tắt: https://hethongphapluat.com/nghi-dinh-333-2026-nd-cp-huong-dan-luat-an-ninh-mang.html. Công báo (04/09/2026): https://congbaocdn.chinhphu.vn/180507251028987904/2026/9/4/470335-1787890927_v1_1788486330_signed.pdf. Bản tiếng Anh: https://thuvienphapluat.vn/van-ban/EN/Cong-nghe-thong-tin/Decree-333-2026-ND-CP-elaborating-on-Law-on-Cybersecurity/726903/tieng-anh.aspx. VietnamPlus: https://www.vietnamplus.vn/quy-dinh-ve-hoat-dong-bao-dam-an-ninh-thong-tin-mang-cua-doanh-nghiep-post1131693.vnp
- [N17] Nghị định 53/2022: https://lsvn.vn/nhung-loai-du-lieu-nao-phai-duoc-luu-tru-tai-viet-nam1660725896-a122651.html. Deloitte: https://www2.deloitte.com/content/dam/Deloitte/vn/Documents/tax/vn-tax-alert-decree-53-vi.pdf
- [N18] Luật Dữ liệu 2024 (60/2024/QH15): https://luatvietnam.vn/thong-tin/luat-du-lieu-2024-so-60-2024-qh15-380165-d1.html. Caselaw: https://caselaw.vn/bai-viet/quan-ly-chuyen-du-lieu-xuyen-bien-gioi-ket-hop-quy-dinh-tu-luat-du-lieu-2024-va-nghi-dinh-13-2023-nd-cp
- [N19] Nghị định 356/2025 và Luật BVDLCN 2025. EY: https://www.ey.com/vi_vn/technical/tax/tax-and-law-updates/nghi-dinh-so-356-2025-nd-cp-quy-dinh-chi-tiet-mot-so-dieu-va-bien-phap-thi-hanh-luat-bao-ve-du-lieu-ca-nhan. PwC: https://www.pwc.com/vn/vn/publications/legal-news-brief/20260128-new-rules-personal-data-protection.html. Luật Việt An: https://luatvietan.vn/diem-moi-cua-nghi-dinh-356-2025-so-voi-nghi-dinh-13-2023-ve-huong-dan-bao-ve-du-lieu-ca-nhan.html
- [N20] QĐ 1121/QĐ-TTg (11/06/2025). VnEconomy: https://vneconomy.vn/den-nam-2030-100-co-quan-doanh-nghiep-nha-nuoc-su-dung-cac-dich-vu-dien-toan-dam-may.htm. VietnamPlus: https://www.vietnamplus.vn/100-co-quan-doanh-nghiep-nha-nuoc-dung-dich-vu-dien-toan-dam-may-vao-nam-2030-post1043987.vnp
- [N21] 5 nền tảng cloud Make in Vietnam: https://vietnamnet.vn/en/five-make-in-vietnam-cloud-computing-platforms-are-certified-695818.html. Tiêu chí an ninh mạng cho cloud: https://lsvn.vn/tieu-chi-dam-bao-an-ninh-mang-cho-nen-tang-dien-toan-dam-may-a164768.html
- [N22] Tin tuyển dụng cloud nội địa (đoạn trích, một số đã hết hạn). FPT Telecom OpenStack: https://nodeflair.com/jobs/fpt-telecom-k-s-tri-n-khai-v-n-hanh-cloud-openstack-469133. Viettel IDC: https://jobsgo.vn/viec-lam/fresher-system-engineer-28345076180.html. Kỹ sư cloud storage: https://vieclam.tuoitre.vn/en/search-job/ky-su-quan-tri-he-thong-cloud-storage.35C349EC.html. G DATA OpenStack: https://jobsgo.vn/viec-lam/ky-su-openstack-28629854968.html. Viettel Kubernetes Engine: https://baodautu.vn/loi-giai-cho-ung-dung-genai-trong-ngan-hang-va-suc-manh-tong-hop-tu-viettel-kubernetes-engine-d220309.html
- [N23] ITviec, danh sách việc làm DevOps, trang 1–4 (đọc ngày 09/10/2026): https://itviec.com/viec-lam-it/devops
- [N24] ITviec MB Bank DevOps: https://itviec.com/viec-lam-it/devops-engineer-khoi-cong-nghe-thong-tin-mb-bank-2109. MB Bank DevSecOps: https://itviec.com/viec-lam-it/devsecops-engineer-khoi-cong-nghe-thong-tin-mb-bank-2347. Tin hết hạn (chỉ có đoạn trích): VPS Senior Platform https://itviec.com/viec-lam-it/senior-devops-platform-engineer-linux-git-docker-cong-ty-co-phan-chung-khoan-vps-4511, thehegeo https://itviec.com/viec-lam-it/devops-platform-engineer-kubernetes-observability-thehegeo-4840, KiotViet https://vieclam.uet.vnu.edu.vn/devops-engineer-on-premise-thu-nhap-25-35tr-jxi6634753
- [N25] ITviec VNGGames: https://itviec.com/viec-lam-it/devops-engineer-vnggames-0837. SkyLab: https://itviec.com/viec-lam-it/mid-senior-devops-engineer-kubernetes-linux-skylab-2132. VPS DevOps: https://itviec.com/viec-lam-it/devops-engineer-ci-cd-automation-cong-ty-co-phan-chung-khoan-vps-1612
- [N25b] ITviec Annam Software: https://itviec.com/viec-lam-it/devops-senior-system-engineer-kubernetes-annam-software-company-3809
- [N26] ITviec MobiFone Payment, Senior Cloud Engineer (Private Cloud – OpenStack): https://itviec.com/viec-lam-it/senior-cloud-engineer-private-cloud-openstack-cong-ty-co-phan-thanh-toan-so-mobifone-4202
- [N27] Thông tư 09/2020/TT-NHNN (toàn văn, có ghi chú sửa đổi): https://caselaw.vn/van-ban-phap-luat/373213-thong-tu-so-09-2020-tt-nhnn-ngay-21-10-2020-cua-thong-doc-ngan-hang-nha-nuoc-viet-nam-quy-dinh-ve-an-toan-he-thong-thong-tin-trong-hoat-dong-ngan-hang. NAPAS diễn tập: https://vnba.org.vn/vi/napas-trien-khai-ke-hoach-dam-bao-hoat-dong-lien-tuc-theo-thong-tu-09-2020-tt-nhnn-15840.htm. ITviec F88 (cũng là nguồn mô tả hạ tầng F88): https://itviec.com/viec-lam-it/devops-platform-engineer-f88-5354
- [N28] Thông tư 50/2024/TT-NHNN: https://caselaw.vn/van-ban-phap-luat/413212-thong-tu-so-50-2024-tt-nhnn-ngay-31-10-2024-cua-thong-doc-ngan-hang-nha-nuoc-viet-nam-quy-dinh-ve-an-toan-bao-mat-cho-viec-cung-cap-dich-vu-truc-tuyen-trong-nganh-ngan-hang. Thông tư 77/2025 sửa đổi: https://luatvietnam.vn/thong-tin/thong-tu-77-2025-tt-nhnn-sua-doi-thong-tu-50-2024-ve-an-toan-dich-vu-ngan-hang-truc-tuyen-423452-d1.html
- [N29] Nghị định 85/2016: https://caselaw.vn/van-ban-phap-luat/116520-nghi-dinh-85-2016-nd-cp-ve-bao-dam-an-toan-he-thong-thong-tin-theo-cap-do. TCVN 11930:2017 (PDF): https://yte.daklak.gov.vn/images_upload/imgND/SYT/files/TCVN%2011930-2017.pdf. Ví dụ hồ sơ cấp độ: https://hcc.nghean.gov.vn/tin-tong-hop/phe-duyet-cap-do-an-toan-he-thong-thong-tin-doi-voi-he-thong-thong-tin-giai-quyet-thu-tuc-hanh-chinh-tinh-1803.html
- [N30] Google cân nhắc trung tâm dữ liệu tại Việt Nam (2024): https://datacenterdynamics.com/en/news/google-explores-plans-for-vietnam-data-center-report. Tìm kiếm về Azure region Việt Nam không có kết quả đáng tin
- [N31] Google Cloud customer story Tiki: https://cloud.google.com/customers/tiki-en. Vietnam News: https://bizhub.vietnamnews.vn/tiki-migrates-to-google-cloud-post315798.html
- [N32] Shopee (gián tiếp): https://sessionize.com/he-li
- [N33] Grab chọn AWS (12/2024): https://www.businesswire.com/news/home/20241204105661/en/Superapp-Grab-Selects-AWS-as-its-Preferred-Cloud-Provider-to-Drive-Technology-Innovation-and-Growth. Grab engineering: https://engineering.grab.com/driving-southeast-asia-forward-with-aws
- [N34] ITviec, báo cáo lương 2024–2025: https://itviec.com/bao-cao/luong-it-va-thi-truong-tuyen-dung-it-vietnam-2024-2025
- [N35] ITviec, báo cáo lương 2025–2026: https://itviec.com/bao-cao/luong-it-va-thi-truong-tuyen-dung-it-vietnam
