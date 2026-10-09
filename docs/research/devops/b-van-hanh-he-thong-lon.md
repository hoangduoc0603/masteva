# Góc B: Thực hành vận hành hệ thống lớn

Nghiên cứu cho roadmap DevOps của Masteva, 09/10/2026. Chỉ đọc, không sửa repo.

Câu hỏi: một DevOps/SRE/Platform engineer làm ở hệ thống lớn cần những năng lực gì, roadmap D0–D19 hiện tại thiếu gì, và nên có những dự án capstone nào để người học "thực chiến" chứ không chỉ học lý thuyết cơ bản.

Cách đọc: mục 1 tóm tắt kết luận. Mục 2 nêu các khung tham chiếu. Mục 3 liệt kê năng lực theo 14 mảng, mỗi năng lực có lý do (kèm sự cố thật) và lab. Mục 4 so với roadmap. Mục 5 là capstone. Mục 6 là nguồn.

Ký hiệu môi trường lab:
- **[L]** chạy được trên laptop (Lima, Docker, kind/k3d, kwok). Máy 16 GB RAM chạy được một cụm kind 3 node cộng stack quan sát gọn; 32 GB mới thoải mái cho 2–3 cụm cùng lúc.
- **[L+]** chạy được trên laptop nhưng chỉ mô phỏng; cảm giác thật cần cloud.
- **[C]** bắt buộc cloud thật (IAM tổ chức, multi-account, region thật, managed service).

---

## 1. Tóm tắt kết luận

1. **Đa số sự cố lớn gần đây không do thiếu kiến thức cơ bản.** Chúng xảy ra vì thay đổi (code, config, dữ liệu điều khiển) lan quá nhanh và quá rộng, không có dàn chặn. Ví dụ: Google Cloud 12/06/2025 (policy lan toàn cầu trong vài giây, code mới không sau feature flag), Cloudflare 18/11/2025 (file feature của Bot Management phình gấp đôi, phát tán toàn mạng), CrowdStrike 19/07/2024 (content update không triển khai theo giai đoạn), Datadog 08/03/2023 (bản vá systemd tự cài qua mọi region). Vì vậy **thay đổi an toàn (progressive delivery cho cả code lẫn config, kill switch, giới hạn blast radius)** phải là năng lực lõi. Hiện roadmap chỉ có một chủ đề `d7.rolling-blue-green-canary` và Argo Rollouts ở dạng tuỳ chọn.
2. **Khôi phục mới là thứ được tính, sao lưu thì chưa.** GitLab 2017 có 5 cơ chế sao lưu nhưng không cái nào dùng được. Atlassian 2022 mất tới 14 ngày để khôi phục 883 site. Roadmap có D17 nhưng "đa vùng" và "sao lưu tài nguyên cụm" đang là tuỳ chọn, và chưa có vận hành database (replica, failover, PITR, online migration) hay Kafka.
3. **Ở quy mô lớn, observability trở thành bài toán dữ liệu và chi phí:** cardinality, lưu trữ dài hạn, sampling trace, chi phí log, và hệ quan sát độc lập với hệ bị quan sát (bài học Roblox 2021). D12 hiện chỉ dạy mức "dựng được Prometheus + Grafana".
4. **Vận hành Kubernetes ở quy mô cần thêm:** nâng cấp an toàn (sự cố Reddit Pi Day 2023), vá OS cho cả đội máy, multi-tenancy, quản lý nhiều cụm (Cluster API, fleet), và chuyển từ ingress-nginx sang Gateway API. Ingress-nginx đã ngừng bảo trì từ 03/2026, mà roadmap vẫn dạy "Ingress và Gateway API" như hai thứ ngang nhau.
5. **Identity thay cho secret.** Workload identity, OIDC từ CI và credential ngắn hạn quan trọng hơn chuyện "chọn Vault hay KMS". Sự cố CircleCI 2023 và tj-actions 2025 cho thấy secret tĩnh bị lộ qua CI là kịch bản thật.
6. **D18 (service mesh) và D19 (platform engineering, FinOps) hiện tuỳ chọn hoàn toàn.** Với mục tiêu "dựng hạ tầng cho system lớn" thì platform engineering, FinOps và workload identity phải bắt buộc; mesh có thể vẫn tuỳ chọn.
7. **Đề xuất cấu trúc:** giữ 3 cấp hiện có, bồi thêm chủ đề cho D7, D11, D12, D13, D15, D16, D17, và thêm **cấp 4 "Hệ thống lớn" gồm 6 chặng mới** (D20–D25): Thay đổi an toàn · Giới hạn blast radius (cell, multi-region) · Vận hành dữ liệu stateful (Postgres, Kafka) · Observability ở quy mô · Nền móng cloud nhiều account và identity · Tuân thủ và quản trị. D19 chuyển thành bắt buộc, kết thúc bằng capstone.
8. **5 capstone** (mục 5). Ba dự án chạy hoàn toàn trên laptop: Nền tảng Neobank, IDP cho nhiều team, Hub-chat theo cell. Một dự án Observability ở quy mô chạy laptop 32 GB. Một dự án Landing zone + DR đa region cần cloud thật, khoảng 10–20 USD mỗi ngày lab nếu dựng xong là xoá.

---

## 2. Các khung tham chiếu và điều rút ra

| Nguồn | Điều cốt lõi cho roadmap |
|---|---|
| Google SRE Book (2016) và SRE Workbook (2018), sre.google | SLO và error budget là cơ chế quyết định giữa tốc độ và độ tin cậy. Alert theo burn rate nhiều cửa sổ. Toil ≤ 50%. Quản lý sự cố theo vai trò (IC, Ops, Comms). Postmortem không đổ lỗi. Quá tải và lỗi dây chuyền. Toàn vẹn dữ liệu: "không ai cần backup, người ta cần restore". Canary release. |
| Building Secure & Reliable Systems (Google, 2020) | Thiết kế cho phục hồi (recovery), least privilege, giới hạn blast radius, zero trust/BeyondCorp, chuẩn bị cho thảm hoạ, khủng hoảng an ninh. |
| DORA (dora.dev): 2024 Accelerate State of DevOps, 2025 State of AI-assisted Software Development, DORA capabilities | 4 (nay là 5) chỉ số giao hàng. Năm 2024, nền tảng nội bộ gắn với năng suất cá nhân +8% và hiệu năng đội +10%, nhưng throughput giảm 8% và độ ổn định thay đổi giảm 14% (thông tin từ báo cáo, The New Stack tóm tắt). Năm 2025, khoảng 90% tổ chức đã có nền tảng nội bộ, và chất lượng nền tảng quyết định AI có tạo giá trị hay không. AI làm tăng batch size, nên càng cần batch nhỏ và tự động hoá kiểm thử. |
| AWS Well-Architected (6 pillar) và AWS Builders' Library | Reliability: fault isolation (bulkhead, cell), static stability, timeout/retry/jitter, load shedding, tránh backlog hàng đợi không thoát được. Ops Excellence: triển khai an toàn tự động (one-box, wave, bake time, auto-rollback). Security: identity trước, nhiều account. Cost: đo, phân bổ, đơn vị kinh tế. Whitepaper "Reducing the Scope of Impact with Cell-Based Architecture" (2023). |
| Azure Well-Architected và Google Cloud Architecture Framework | Cùng 5–6 trụ cột. Azure nhấn mạnh **failure mode analysis**, **health model**, safe deployment practices (ring). GCP nhấn mạnh thiết kế cho failure domain (zone, region) và chi phí. |
| CNCF Platforms whitepaper và Platform Engineering Maturity Model | Nền tảng là sản phẩm phục vụ đội ứng dụng. Có 5 khía cạnh (Investment, Adoption, Interfaces, Operations, Measurement), mỗi khía cạnh có 4 mức (Provisional, Operational, Scalable, Optimizing). |
| Kubernetes docs: production environment, multi-tenancy, version skew, Cluster API | Nâng cấp tuần tự, chú ý API bị gỡ. Multi-tenancy bằng namespace, quota, NetworkPolicy, policy hoặc cụm ảo. Cluster API quản lý vòng đời cụm như tài nguyên khai báo. |
| FinOps Foundation Framework (bản 2025) và FOCUS | Bản 2025 thêm "Scopes" (Public Cloud, SaaS, Data Center…), bỏ chữ "cloud" khỏi tên domain và capability. Ba pha Inform, Optimize, Operate. FOCUS là chuẩn dữ liệu billing chung (bản 1.4, 06/2026). |
| Chuẩn tuân thủ: SOC 2, ISO/IEC 27001:2022, PCI DSS v4.0.1; ở Việt Nam là Luật Bảo vệ dữ liệu cá nhân 2025 (91/2025/QH15, hiệu lực 01/01/2026) và Thông tư 09/2020/TT-NHNN | Kỹ sư không cần là auditor nhưng phải tạo được **bằng chứng tự động**: kiểm soát truy cập, audit log, quản lý thay đổi, mã hoá, sao lưu/khôi phục, quản lý lỗ hổng, tách biệt môi trường. |

---

## 3. Năng lực "phải có" theo mảng

Mỗi bảng có 3 cột: năng lực, vì sao quan trọng (kèm sự cố hoặc ví dụ thật), và lab cụ thể.

### 3.1 SLO, error budget, toil

| Năng lực | Vì sao | Lab |
|---|---|---|
| Định nghĩa SLI theo hành trình người dùng (request-based và window-based), SLO, error budget policy | SRE Workbook chương "Implementing SLOs": SLO là công cụ quyết định khi nào dừng phát hành tính năng. Không có SLO thì mọi tranh luận "ổn định hay tốc độ" chỉ là cảm tính. | [L] Viết SLO cho 3 hành trình Neobank (đăng nhập, chuyển tiền, xem số dư) bằng Sloth hoặc Pyrra. Sinh recording rule và alert. Viết error budget policy 1 trang. |
| Alert theo burn rate nhiều cửa sổ (multi-window, multi-burn-rate) | SRE Workbook "Alerting on SLOs": giảm alert ồn mà vẫn bắt được sự cố nhanh. | [L] Dùng k6 bơm lỗi 2%, 10%, 50% vào service. Kiểm tra alert nào bắn và sau bao lâu. So với alert ngưỡng CPU. |
| Đo và giảm toil | SRE Book chương "Eliminating Toil": giới hạn toil khoảng 50% thời gian. | [L] Ghi nhật ký on-call giả lập 1 tuần, phân loại toil, tự động hoá 1 việc (ví dụ xoay chứng chỉ bằng cert-manager). |

### 3.2 Thay đổi an toàn và progressive delivery

| Năng lực | Vì sao | Lab |
|---|---|---|
| Triển khai theo wave/ring, có bake time và tự rollback theo chỉ số | AWS Builders' Library "Automating safe, hands-off deployments": one-box, rồi 1 AZ, rồi 1 region, rồi nhiều region, mỗi bước có bake time và auto-rollback. Netflix dùng Kayenta để chấm điểm canary tự động. | [L] Argo Rollouts (hoặc Flagger) với AnalysisTemplate truy vấn Prometheus. Cố ý đẩy một bản build lỗi 5xx; tiêu chí đạt: tự rollback trong ≤ 5 phút, không quá 10% traffic bị ảnh hưởng. |
| **Thay đổi config và dữ liệu điều khiển cũng phải đi theo giai đoạn** (không chỉ binary) | Google Cloud 12/06/2025: một policy có trường trống được ghi vào Spanner, nhân bản toàn cầu trong vài giây, làm Service Control crash ở mọi region. Code mới không sau feature flag. Cloudflare 18/11/2025: thay đổi quyền ClickHouse làm file feature phình gấp đôi, vượt giới hạn cứng của proxy, phát tán toàn mạng mỗi 5 phút. Cloudflare 05/12/2025: thay đổi cấu hình khi vá lỗ hổng React làm khoảng 28% traffic HTTP lỗi 25 phút. | [L] Đặt cấu hình động (feature flag, rate limit) trong Git, phát hành qua GitOps theo từng cụm (ApplicationSet có progressive sync, hoặc Kargo). Viết validator từ chối file config vượt kích thước hoặc schema. Thêm "kill switch" toàn cục. |
| Feature flag và kill switch có quy trình dọn dẹp | Google cam kết sau sự cố 06/2025: mọi thay đổi binary quan trọng phải nằm sau feature flag mặc định tắt. | [L] OpenFeature với flagd. Bật theo % người dùng, tắt khẩn cấp, đo thời gian tắt có hiệu lực. |
| Rollback an toàn và tương thích hai chiều (schema, message) | Builders' Library "Ensuring rollback safety during deployments": phiên bản mới phải đọc được dữ liệu của phiên bản cũ và ngược lại (two-phase deploy). | [L] Đổi tên cột theo expand/contract trên PostgreSQL. Rollback giữa chừng mà không lỗi. (Phần code đã có ở SB5; DevOps dạy pipeline và thứ tự.) |
| Cập nhật OS và agent cho đội máy cũng phải đi theo giai đoạn | Datadog 08/03/2023: bản vá systemd tự cài lúc 06:00 UTC trên Ubuntu 22.04 xoá route của Cilium, mất khoảng 60% compute ở 5 region. Lý do: kênh cập nhật bảo mật cũ còn bật, nằm ngoài quy trình rollout theo region. CrowdStrike 19/07/2024: content update không staged, hơn 8 triệu máy Windows khởi động lại liên tục. | [L] Tắt unattended-upgrades. Vá node qua image mới (Packer, hoặc Talos/Flatcar), thay node theo wave bằng `kubectl drain` có PodDisruptionBudget. |

### 3.3 Giới hạn blast radius: cell, shuffle sharding, static stability

| Năng lực | Vì sao | Lab |
|---|---|---|
| Kiến trúc cell (router theo partition key, cell không chia sẻ trạng thái, control plane tách data plane) | Whitepaper AWS về cell-based architecture (2023). Slack chuyển sang kiến trúc cell theo AZ sau sự cố mạng 30/06/2021; nay rút toàn bộ traffic khỏi một AZ trong 5 phút, bước 1%. Shopify dùng "pods" để cô lập shop. Roblox thêm cell sau sự cố 73 giờ năm 2021. | [L] Hub-chat chạy 3 cell (3 namespace hoặc 3 cụm kind), router là Envoy/Gateway API định tuyến theo tenant ID. Làm hỏng 1 cell, đo % tenant bị ảnh hưởng (mục tiêu ≤ 1/3). Rút cell trong ≤ 5 phút. |
| Shuffle sharding | Builders' Library "Workload isolation using shuffle-sharding": tenant xấu chỉ ảnh hưởng tổ hợp shard của nó. | [L] Script gán mỗi tenant 2/8 worker. Mô phỏng tenant "độc" (poison request), đo số tenant khác bị chung đủ cả 2 shard. |
| Static stability: data plane tiếp tục chạy khi control plane chết | Builders' Library "Static stability using Availability Zones". AWS us-east-1 19–20/10/2025: lỗi race trong tự động hoá DNS của DynamoDB làm endpoint trống, kéo theo EC2 launch và NLB health check. Ai phải "tạo mới tài nguyên" để phục hồi thì kẹt; ai đã có capacity dự phòng sẵn và global tables thì chịu được. | [L] Tắt API server của kind (dừng container control-plane), kiểm tra pod và Service vẫn phục vụ. Thử lại với HPA cần scale: thấy giới hạn. Rút ra quy tắc giữ sẵn capacity N+1 thay vì dựa vào autoscale lúc sự cố. |
| Phân tích phụ thuộc và lỗi chung nguồn (dependency, global control plane) | Roblox 2021: một cụm Consul dùng chung cho discovery, Nomad, Vault và cả monitoring, nên Consul chết là mất hết, kể cả khả năng quan sát. Facebook 04/10/2021: lệnh bảo trì làm mất backbone; DNS server tự rút BGP nên cả công cụ nội bộ và cửa ra vào datacenter cũng không dùng được. | [L] Vẽ dependency graph cho Neobank và đánh dấu mọi single point (DNS, Vault, registry, IdP, Git). Game day "registry chết": node mới có kéo được image không? Có phương án pull-through cache không? |

### 3.4 Quá tải và lỗi dây chuyền ở tầng hạ tầng

Phần code (Resilience4j, retry trong app) đã có ở M9 và SB7. DevOps cần năng lực ở tầng nền tảng.

| Năng lực | Vì sao | Lab |
|---|---|---|
| Ngân sách timeout và retry trên gateway/mesh, retry budget, jitter | Builders' Library "Timeouts, retries, and backoff with jitter". Sau sự cố 06/2025, Google cam kết rà soát để mọi hệ thống dùng exponential backoff có ngẫu nhiên: khi Service Control khởi động lại ở us-central1, tải dồn vào hạ tầng phía sau. | [L] Cấu hình timeout và retry ở Envoy Gateway hoặc Istio. Dùng Toxiproxy gây chậm. Quan sát retry storm khi retry ở mọi tầng, rồi sửa bằng retry budget. |
| Load shedding và admission control ở biên | Builders' Library "Using load shedding to avoid overload"; SRE Book "Handling Overload". | [L] k6 bắn vượt capacity 3 lần. So 2 cấu hình: không shedding (latency tăng vô hạn) và có shedding hoặc rate limit (goodput giữ ổn định). |
| Hàng đợi và backlog | Builders' Library "Avoiding insurmountable queue backlogs": backlog khiến hệ thống đã khoẻ vẫn chậm hàng giờ. | [L] Kafka consumer lag: ngừng consumer 10 phút, đo thời gian xả. Dùng KEDA scale theo lag. |

### 3.5 Quản lý sự cố và on-call

| Năng lực | Vì sao | Lab |
|---|---|---|
| Vai trò sự cố (Incident Lead/Commander, Responder, Comms), thang severity, kênh và nhịp cập nhật | SRE Book "Managing Incidents". GitLab handbook dùng Incident Lead, Incident Responder, Communications Manager, severity S1–S4, mục tiêu 99,95%. Datadog 2023 lập trung tâm điều hành với hơn 750 người, chia 4 ca. | [L] Game day có kịch bản: 1 người làm IC, 1 người làm Comms. Viết status update mỗi 30 phút. Dùng template của GitLab hoặc PagerDuty incident response docs. |
| Trang trạng thái và kênh liên lạc độc lập với hệ thống chính | Cloudflare 18/11/2025: status page (đặt ngoài hạ tầng của họ) cũng sập vì lý do khác, khiến đội tưởng đang bị tấn công. Facebook 2021: công cụ nội bộ chết cùng hệ thống. | [L] Thiết kế "out-of-band": status page tĩnh trên nhà cung cấp khác, danh bạ on-call offline, runbook đọc được khi SSO chết. |
| Postmortem không đổ lỗi, theo dõi action item | SRE Book "Postmortem Culture". Mọi postmortem lớn ở trên (AWS, Google, Cloudflare, Atlassian, Datadog) đều công khai kèm cam kết khắc phục. | [L] Viết postmortem cho một game day theo template SRE Book. Học viên đọc 3 postmortem thật và rút ra cơ chế (không phải "lỗi người"). |
| Runbook thành automation, break-glass access | BSRS chương "Design for Recovery" và "Crisis Management". | [L] Runbook "Postgres primary chết" có các bước bằng lệnh, sau đó tự động hoá một phần. Tài khoản break-glass có audit. |
| Game day và chaos engineering có giả thuyết | Shopify chuẩn bị BFCM 2025: game day trên các hành trình checkout, payment; "Resiliency Matrix" ghi kịch bản lỗi, RTO, playbook. | [L] Chaos Mesh hoặc LitmusChaos: kill pod, network delay, mất DNS. Mỗi thí nghiệm có giả thuyết, steady-state metric và điều kiện dừng. |

### 3.6 Observability ở quy mô

| Năng lực | Vì sao | Lab |
|---|---|---|
| Lưu metric dài hạn và nhiều cụm (Mimir, Thanos hoặc VictoriaMetrics), remote_write, HA, dedup | Một Prometheus đơn không chứa nổi metric của nhiều cụm hay giữ được 13 tháng. Cả ba hệ đều là open source, dùng object storage. | [L] 2 cụm kind remote_write về Mimir (monolithic mode) hoặc VictoriaMetrics cluster. Object storage dùng RustFS hoặc SeaweedFS (MinIO đã archive 04/2026; lab SB10 của Masteva đã dùng RustFS). |
| Quản trị cardinality | Nhãn `user_id` hay `path` thô làm số series tăng vọt, ăn RAM và tiền. | [L] Dùng `prometheus/avalanche` sinh 1 triệu series. Đo RAM. Dùng relabel để hạ series; đặt giới hạn mỗi tenant trong Mimir. |
| Sampling trace (head và tail), OTel Collector nhiều tầng (agent rồi gateway) | Giữ 100% trace ở quy mô lớn rất đắt. Tail sampling giữ trace lỗi hoặc chậm. | [L] Collector gateway với `tailsamplingprocessor`: giữ 100% trace lỗi, latency > 1 giây, 1% còn lại. Kiểm tra cần `loadbalancingexporter` theo trace ID. |
| Chi phí log: lọc, giảm mẫu, phân tầng lưu trữ, retention theo loại | Coinbase được cho là trả Datadog khoảng 65 triệu USD (Pragmatic Engineer, 2023). Observability thường là một trong các khoản lớn nhất của hạ tầng. | [L] Vector hoặc OTel: bỏ log debug ở prod, gộp log trùng, chuyển audit log sang lưu lâu. Đo GB/ngày trước và sau. |
| Meta-monitoring và quan sát độc lập | Roblox 2021: monitoring phụ thuộc chính stack bị hỏng. Kế hoạch sau sự cố có "telemetry độc lập". | [L] Watchdog alert (dead man's switch) gửi ra bên ngoài. Prometheus thứ hai giám sát stack quan sát. |
| Continuous profiling (Pyroscope hoặc Parca), eBPF | Tìm chi phí CPU ở quy mô đội máy. | [L] Pyroscope trên kind, tìm hàm nóng của một service Java. |

### 3.7 Capacity planning và hiệu năng hạ tầng

| Năng lực | Vì sao | Lab |
|---|---|---|
| Dự báo nhu cầu, headroom N+1/N+2 theo failure domain | Shopify "Capacity planning at scale". Chuẩn bị BFCM 2025: 5 đợt scale test, đỉnh khoảng 146 triệu request/phút, thử p99 ở 200 triệu RPM. | [L] Mô hình capacity trên bảng tính từ k6: tìm "knee" (điểm latency bẻ gãy), tính số pod cần cho đỉnh ×1,5 khi mất 1 zone. |
| Load test có kịch bản người dùng, open model, tránh coordinated omission | Shopify dùng công cụ nội bộ Genghis chạy kịch bản duyệt, giỏ hàng, checkout, tăng tải theo bậc tới khi gãy. (k6 và coordinated omission đã có ở SB12.) | [L] k6 với `ramping-arrival-rate` chạy trong cụm (k6-operator). |
| Giới hạn của autoscaling: thời gian scale, quota, giới hạn IP/subnet, cold start | Slack 04/01/2021: AWS Transit Gateway không kịp scale khi traffic sau kỳ nghỉ tăng vọt. | [L+] Mô phỏng 1.000 node bằng kwok cộng Karpenter (provider kwok) hoặc Cluster Autoscaler, đo thời gian scale. [C] Thử với EKS thật để thấy giới hạn IP của VPC CNI. |

### 3.8 Vận hành Kubernetes ở quy mô

| Năng lực | Vì sao | Lab |
|---|---|---|
| Nâng cấp cụm an toàn: version skew, API bị gỡ, label và feature gate đổi, cụm canary | Reddit Pi Day 14/03/2023, sập 314 phút: nâng cấp 1.23 lên 1.24 gỡ label `node-role.kubernetes.io/master`, trong khi route reflector của Calico chọn node theo label đó. EKS tính phí extended support gấp 6 lần ($0.60/giờ so với $0.10/giờ) nếu không nâng cấp kịp. Kubernetes ra 3 bản mỗi năm; 1.37 phát hành 26/08/2026. | [L] Cụm kubeadm trên 3 VM Lima: nâng cấp từng minor (n đến n+1), chạy `kubent` hoặc `pluto` tìm API bị gỡ, nâng cấp cụm canary trước, có checklist rollback (snapshot etcd). |
| Multi-tenancy: namespace-as-a-service, ResourceQuota, LimitRange, NetworkPolicy mặc định chặn, Pod Security, cụm ảo | Kubernetes docs "Multi-tenancy". Nền tảng nội bộ phục vụ nhiều team phải cô lập cả về tài nguyên lẫn quyền. | [L] Capsule hoặc vCluster trên kind. Team A không đọc được secret của team B, không vượt quota, không gọi được service team B. Có test tự động chứng minh. |
| Quản lý nhiều cụm: Cluster API, fleet GitOps (ApplicationSet theo cluster generator) | Uber vận hành hơn 100 cụm compute trên nhiều cloud và datacenter (nền tảng Up). Cluster API quản lý vòng đời cụm bằng CRD. | [L] Cluster API với Docker provider (CAPD): tạo 3 cụm workload từ một cụm quản lý, nâng cấp bằng đổi `version` của MachineDeployment, Argo CD ApplicationSet rải addon xuống mọi cụm. |
| Ingress đến Gateway API | Ingress-nginx ngừng bảo trì từ 03/2026 (thông báo của SIG Network 11/11/2025; Steering Committee ngày 29/01/2026 khuyến nghị chuyển ngay). Kèm theo là chuỗi CVE "IngressNightmare" 03/2025. | [L] Chuyển một app từ ingress-nginx sang Envoy Gateway hoặc Cilium Gateway bằng `ingress2gateway`, so sánh hành vi, chạy song song rồi cắt traffic. |
| Node lifecycle và image OS bất biến | Datadog 2023 (xem 3.2). | [L] Talos hoặc Flatcar trên Lima. Thay node thay vì vá tại chỗ. |
| Admission policy ở quy mô (Kyverno, Gatekeeper, ValidatingAdmissionPolicy có sẵn) | Chặn cấu hình nguy hiểm trước khi vào cụm. | [L] ValidatingAdmissionPolicy (CEL) bắt buộc có requests/limits, PDB, label owner. Đo tỉ lệ vi phạm trong chế độ audit trước khi bật enforce. |

### 3.9 Vận hành dữ liệu stateful

| Năng lực | Vì sao | Lab |
|---|---|---|
| Postgres HA: streaming replica, failover tự động, connection pooling, đo replication lag | Sự cố database là nguyên nhân hàng đầu khiến sập lâu. Stripe vận hành hơn 2.000 shard DocDB, 5 triệu QPS, 99,999% uptime năm 2023 nhờ nền tảng di chuyển dữ liệu không downtime. | [L] CloudNativePG trên kind: 1 primary, 2 replica. Kill primary, đo thời gian failover và số request lỗi. PgBouncer pooler. Alert theo replication lag. |
| Backup và PITR có **kiểm tra khôi phục định kỳ tự động** | GitLab 31/01/2017: xoá nhầm thư mục dữ liệu primary, 5 cơ chế backup không cái nào chạy đúng, mất khoảng 6 giờ dữ liệu. Atlassian 04/2022: script xoá 883 site của 775 khách, khôi phục mất tới 14 ngày vì quy trình khôi phục theo từng khách chưa được tự động hoá ở quy mô. | [L] CloudNativePG backup và WAL archive lên object storage cục bộ. PITR về thời điểm trước một lệnh `DELETE` sai. CronJob khôi phục mỗi đêm vào cụm tạm và chạy truy vấn kiểm tra. Đo RPO và RTO thực tế. |
| Online schema migration và di chuyển dữ liệu lớn (expand/contract, backfill có throttle) | Stripe: cắt traffic trong mili giây khi chuyển shard. | [L] Backfill 10 triệu dòng có throttle theo replication lag. (Code đã có ở SB5; DevOps dạy vận hành và quan sát.) |
| Kafka ops: KRaft, partition và replication factor, `min.insync.replicas`, rebalancing, consumer lag, rolling upgrade, MirrorMaker 2 cho DR, quota | Kafka 4.0 (03/2025) đã gỡ ZooKeeper hẳn, chỉ còn KRaft. Grab vận hành Kafka làm xương sống dữ liệu: phơi Kafka qua VPC endpoint và đặt tên broker theo zone để giảm phí cross-AZ, dùng ABAC với OPA, có nền tảng tự phục vụ (Coban) quản lý khoảng 5.000 tài nguyên streaming bằng IaC. | [L] Strimzi trên kind: cụm 3 broker KRaft, kill broker kiểm tra không mất message (acks=all, min.insync=2), thêm broker rồi rebalance bằng Cruise Control, rolling upgrade, MirrorMaker 2 sang cụm thứ hai. |
| Redis/cache ops (eviction, persistence, failover) ở mức đủ dùng | Cache chết gây thundering herd vào DB. | [L] Valkey có Sentinel. Flush cache rồi đo tải DB, thử thêm request coalescing. |

### 3.10 DR và multi-region

| Năng lực | Vì sao | Lab |
|---|---|---|
| Phân tầng RPO/RTO theo dịch vụ, chọn chiến lược: backup & restore, pilot light, warm standby, active-active | AWS whitepaper "Disaster Recovery of Workloads on AWS". Thông tư 09/2020/TT-NHNN (theo tổng hợp ngành) yêu cầu chuyển sang hệ thống dự phòng trong 4 giờ cho hệ thống cấp độ 3 trở lên. | [L] Bảng phân tầng cho 6 service Neobank, lý do chọn chiến lược cho từng service. |
| Region/cluster evacuation có diễn tập | Slack rút AZ trong 5 phút. AWS 10/2025: khách có DynamoDB global tables vẫn đọc ghi được ở region khác. | [L+] 2 cụm kind giả lập 2 region. GSLB bằng CoreDNS hoặc external-dns cộng health check. Dừng cụm A, đo RTO. [C] Route 53 failover thật giữa 2 region. |
| Sao lưu và khôi phục tài nguyên cụm và trạng thái GitOps (Velero, etcd snapshot), dựng lại cụm từ Git | Reddit 2023 phải khôi phục cụm từ backup. | [L] Xoá cụm kind, dựng lại bằng IaC cộng Argo CD cộng Velero restore PV. Mục tiêu ≤ 30 phút. |
| Phụ thuộc ẩn vào một region hoặc control plane toàn cầu | AWS 10/2025 ở us-east-1 kéo theo IAM, EC2 launch và nhiều dịch vụ toàn cầu. | [C] Liệt kê dịch vụ "global" (IAM, Route 53 control plane, CloudFront) mà quy trình DR cần. Thử DR khi không được gọi API control plane. |

### 3.11 Mạng ở quy mô

| Năng lực | Vì sao | Lab |
|---|---|---|
| DNS vận hành: TTL, negative caching, `ndots` trong K8s, NodeLocal DNSCache, DNS là điểm lỗi chung | AWS 10/2025 bắt nguồn từ bản ghi DNS của DynamoDB bị làm trống. Facebook 2021: DNS rút BGP. | [L] Đo ảnh hưởng `ndots:5` lên số truy vấn DNS. Cài NodeLocal DNSCache. Game day "CoreDNS chết". |
| BGP và anycast ở mức khái niệm cộng lab, CDN và cache | Facebook 2021; Cloudflare vận hành mạng anycast. | [L] Containerlab với FRR: 2 router quảng bá cùng anycast IP, rút một bên và quan sát hội tụ. |
| Kiểm soát egress, NAT, private endpoint, chi phí traffic cross-AZ và cross-region | Grab đặt tên broker Kafka theo zone để tránh phí data transfer liên AZ. NAT Gateway tính cả giờ lẫn GB. | [L] Cilium egress policy hoặc egress gateway: chỉ cho phép gọi API thanh toán. [C] Đọc Cost Explorer để thấy dòng NAT/inter-AZ. |
| Vòng đời chứng chỉ, mTLS, PKI nội bộ | Chứng chỉ hết hạn là nguyên nhân sự cố lặp lại nhiều nhất trong ngành. | [L] cert-manager với CA nội bộ, chứng chỉ hạn 24 giờ, alert trước 7 ngày (mô phỏng). |

### 3.12 Identity, secret và chuỗi cung ứng ở quy mô

| Năng lực | Vì sao | Lab |
|---|---|---|
| Workload identity thay secret tĩnh: IRSA hoặc EKS Pod Identity, GKE Workload Identity Federation, Azure Workload Identity | Credential tĩnh trong CI và trong pod là mục tiêu tấn công số một. | [C] EKS Pod Identity cho pod đọc S3. [L] Mô phỏng bằng SPIRE cộng Vault/OpenBao JWT auth. |
| OIDC từ CI đến cloud, không dùng access key dài hạn; ghim action theo SHA | tj-actions/changed-files 03/2025 (CVE-2025-30066): tag bị trỏ lại, secret của hơn 23.000 repo bị in ra log. CircleCI 01/2023: session SSO của kỹ sư bị đánh cắp, khách phải xoay mọi secret. | [L] GitHub Actions OIDC sang Vault/OpenBao (chạy local, phơi ra qua tunnel) hoặc [C] sang AWS IAM role. Renovate ghim SHA. Diễn tập "xoay mọi secret trong 1 giờ". |
| SPIFFE/SPIRE: danh tính dịch vụ xuyên cụm và xuyên nền tảng | Chuẩn CNCF cho danh tính workload, là nền của zero trust giữa service. | [L] SPIRE trên 2 cụm kind có federation. Service ở cụm A gọi cụm B bằng mTLS SVID. |
| Truy cập người: SSO, just-in-time, break-glass, audit | CircleCI 2023: kỹ sư có quyền sinh token production. | [L] Teleport hoặc tương đương trên kind; quyền admin cấp tạm 1 giờ có duyệt. |

### 3.13 Nền móng cloud: landing zone và IaC ở quy mô

| Năng lực | Vì sao | Lab |
|---|---|---|
| Nhiều account/project: OU, SCP, account log-archive và security, IAM Identity Center | AWS Security Reference Architecture; AWS Control Tower. Giới hạn blast radius ở tầng tổ chức. | [C] AWS Organizations: 3 OU (Security, Infra, Workloads), SCP chặn tắt CloudTrail, chặn region ngoài ap-southeast-1. Có thể dùng Control Tower hoặc Terraform `aws-organizations`. |
| IaC ở quy mô: state theo thành phần, pipeline plan/apply có review, policy as code, phát hiện drift định kỳ | Một state khổng lồ thì plan chậm và blast radius lớn. | [L] OpenTofu cộng LocalStack hoặc provider kind/helm. Atlantis hoặc Terrateam chạy plan trên PR. Conftest/OPA chặn security group mở 0.0.0.0/0. |
| Mạng hub-and-spoke, chia CIDR có kế hoạch | Hết IP và trùng CIDR là nợ khó trả khi công ty lớn lên. | [C] VPC IPAM, chia /16 cho mỗi môi trường. [L] Bài tập lập kế hoạch IP trên giấy cộng kiểm tra bằng script. |

### 3.14 Platform engineering, FinOps, tuân thủ

| Năng lực | Vì sao | Lab |
|---|---|---|
| Nền tảng là sản phẩm: golden path, self-service, API nền tảng (Crossplane, kro), portal (Backstage), đo adoption | CNCF Platforms whitepaper và Maturity Model. DORA 2024: nền tảng tăng năng suất nhưng làm giảm throughput và độ ổn định nếu làm kém. DORA 2025: chất lượng nền tảng quyết định giá trị của AI. Grab Coban, Uber Up là ví dụ nền tảng nội bộ. | [L] Backstage template tạo repo, pipeline, namespace, SLO và dashboard. Crossplane Composition "PostgresDatabase" sinh cụm CloudNativePG. Đo thời gian từ zero tới lần deploy đầu. |
| FinOps: phân bổ chi phí (tag, label), showback, unit economics, rightsizing, commitment và spot, chi phí observability | FinOps Framework 2025 (Inform, Optimize, Operate; Scopes). Dữ liệu billing theo FOCUS. Prime Video giảm 90% chi phí một hệ giám sát khi gộp kiến trúc (2023). | [L] OpenCost trên kind: chi phí theo namespace và team, rightsizing theo VPA recommendation. [C] AWS CUR/FOCUS export, Budget alert, chi phí trên mỗi giao dịch Neobank. |
| Tuân thủ ở mức kỹ sư: SOC 2 (Trust Services Criteria), ISO 27001:2022 Annex A, PCI DSS v4.0.1 (scope CDE, phân đoạn mạng, log, vá), Luật BVDLCN 2025, Thông tư 09/2020/TT-NHNN | Neobank Việt Nam bắt buộc theo TT 09. Kỹ sư phải tạo bằng chứng: ai đổi gì, khi nào, ai duyệt; dữ liệu cá nhân ở đâu; backup được khôi phục thử. | [L] Mapping 15 kiểm soát sang bằng chứng tự động: audit log K8s, lịch sử PR được duyệt, báo cáo Kyverno, báo cáo restore test, SBOM. Viết "evidence pack" cho một kỳ audit giả. |

---

## 4. So với roadmap Masteva hiện tại

### 4.1 Đánh giá theo chặng

Ký hiệu: ✓ đủ ý · ~ mỏng · ✗ thiếu.

| Chặng | Đánh giá | Đề xuất cụ thể |
|---|---|---|
| D0–D4 | ✓ | Giữ. D2 có thể thêm "DNS vận hành: TTL, cache" vào chủ đề DNS. |
| D5 Văn hoá DevOps | ✓ | DORA nay có 5 chỉ số (thêm rework rate từ 2024). Kiểm tra lại tên chủ đề "Bốn chỉ số DORA". |
| D6, D8 | ✓ | D8: thêm "ghim action theo SHA, OIDC trong CI" (sự cố tj-actions). |
| D7 CI/CD | ~ | Đổi `d7.feature-flag` từ tuỳ chọn thành bắt buộc. Progressive delivery chuyên sâu đặt ở chặng mới D20. |
| D9 Cloud | ~ | Thêm "Multi-account và tổ chức" (giới thiệu), "Region, AZ và failure domain". |
| D10 IaC | ~ | Thêm "Pipeline IaC và policy as code" (Atlantis, Conftest), "Tách state theo thành phần". |
| D11 K8s cốt lõi | ~ | Chủ đề "Ingress và Gateway API" nên ưu tiên Gateway API và ghi rõ ingress-nginx đã ngừng bảo trì từ 03/2026. Thêm PodDisruptionBudget, topology spread. |
| D12 Observability | ~ | Đủ cho mức Middle. Phần quy mô (Mimir/Thanos/VM, cardinality, tail sampling, chi phí log, meta-monitoring) đặt ở chặng mới D23. Thêm "SLO cơ bản trên Grafana" để nối D5 với D16. |
| D13 Vận hành K8s | ~ | Thêm "Multi-tenancy", "Vá node và image OS bất biến", "PodDisruptionBudget và drain". Nâng chủ đề "Nâng cấp cụm" bằng case Reddit. Thêm "Cluster API và nhiều cụm" (hoặc đặt ở D21). |
| D14 GitOps | ~ | Thêm "Thăng cấp giữa môi trường (Kargo hoặc ApplicationSet)" và "Quản lý nhiều cụm bằng GitOps". Argo Rollouts chuyển sang D20 thành bắt buộc. |
| D15 DevSecOps | ~ | "Vault, KMS hoặc External Secrets" đang là chủ đề chọn một. Thêm chủ đề bắt buộc "Workload identity và OIDC" (IRSA/Pod Identity, CI OIDC). SPIFFE đặt ở D24. Đổi Kyverno/Gatekeeper thành bắt buộc (hoặc ValidatingAdmissionPolicy). |
| D16 Độ tin cậy | ~ | Chaos engineering thành bắt buộc dưới dạng "Game day". Thêm "Vai trò và giao tiếp trong sự cố", "Alert theo burn rate", "Runbook và automation". Tách "Quá tải và lỗi dây chuyền" ở tầng hạ tầng khỏi M9 (xem 4.2). |
| D17 Sao lưu | ✗ một phần | "Đa vùng" và "sao lưu tài nguyên cụm" thành bắt buộc. Thêm "Kiểm tra khôi phục tự động" và "PITR". DR nhiều region chuyên sâu đặt ở D21. |
| D18 Service mesh | tuỳ chọn, hợp lý | Giữ tuỳ chọn. Chuyển "mTLS tự động" về D24 (identity) dưới góc SPIFFE. eBPF/Cilium nên lên chủ đề thường ở D11/D13 vì Cilium nay là CNI phổ biến (Datadog dùng). |
| D19 Platform, FinOps | ✗ (tuỳ chọn hoàn toàn) | Thành bắt buộc. Thêm "Nền tảng là sản phẩm và maturity model", "Multi-tenancy cho đội ứng dụng", "API nền tảng (Crossplane)", "Unit economics và FOCUS", "Chi phí observability và mạng". |
| — | ✗ | **Không có:** cell và shuffle sharding, static stability; vận hành Postgres HA và Kafka ops; observability ở quy mô; landing zone nhiều account; capacity planning có load test; tuân thủ. |

### 4.2 Ranh giới với Microservices (và Spring Boot)

Nguyên tắc: **Microservices và Spring Boot dạy cách viết code và thiết kế ranh giới; DevOps dạy cơ chế nền tảng, vận hành và đo.** Hai bên liên kết chéo bằng mã chặng, không viết trùng.

| Chủ đề | Hiện ở | Nên để ở | Ghi chú |
|---|---|---|---|
| Timeout, retry, circuit breaker trong code | M9, SB7 | Giữ M9/SB7 | DevOps (D16/D20) chỉ dạy timeout và retry budget ở gateway/mesh, load shedding ở biên. Link về M9. |
| Canary, blue-green | D7, M14 | Cơ chế (Rollouts, analysis, wave) ở D20. M14 giữ "tương thích khi lệch phiên bản" | Bỏ chủ đề "Canary và blue-green" khỏi M14 hoặc biến nó thành link sang D20. Lưu ý mã đã khoá: dùng `replacements` nếu gộp. |
| Observability | D12, M13 | M13: instrument (correlation ID, span, metric RED trong code). D12/D23: pipeline, backend, quy mô, chi phí | "SLO cho từng service" (M13) nên link sang D16. |
| Kafka | M5 (partition, consumer group, DLQ) | M5: ngữ nghĩa ứng dụng. D22: vận hành broker (KRaft, rebalance, MirrorMaker, quota, upgrade) | Lấy từ M5 sang không cần; chỉ thêm phần ops vào DevOps. |
| mTLS, zero trust | M10, D18 | M10: truyền token, uỷ quyền. D24: SPIFFE, mesh mTLS, PKI | |
| Service mesh | D18, M14 (opt) | Chỉ D18 | Bỏ `Service mesh (opt)` ở M14, thay bằng link. |
| Discovery, cấu hình, secret cho service | M12 | M12 giữ phía ứng dụng. D15/D24 giữ hạ tầng secret | |
| Autoscaling | M16, D13 | D13 (HPA, VPA, Karpenter). M16 giữ phân vùng dữ liệu và cache | |
| Template tạo service mới, chassis | M17 (opt) | Golden path ở D19. M17 giữ "thư viện dùng chung và cái giá" | |
| Team Topologies, platform team | M18 | M18 giữ khái niệm. D19 dạy "nền tảng là sản phẩm" và link sang M18 | |
| Cell-based architecture | Không có | D21 (DevOps), M16 link sang | Đây là quyết định hạ tầng và định tuyến nhiều hơn là code. |
| Load test, k6 | SB12 | SB12 cho ứng dụng; D16/D20 cho capacity cả hệ | Link về SB12 để không dạy lại công cụ. |
| Migration không downtime | SB5, D7 | SB5: code Flyway. D22: vận hành (backfill có throttle, lag) | |

### 4.3 Đề xuất cấu trúc

**Phương án A (khuyến nghị): thêm cấp 4 "Hệ thống lớn" (Staff/Principal), giữ nguyên D0–D19**

Mã cũ không đổi nên `ids.lock` an toàn; chỉ thêm chủ đề và đổi `kind` từ `opt` thành bắt buộc.

| Chặng mới | Chủ đề đề xuất |
|---|---|
| **D20 Thay đổi an toàn** | Wave, ring và bake time · Canary tự chấm điểm (Argo Rollouts/Flagger) · Config và dữ liệu điều khiển là thay đổi · Kill switch và feature flag ở quy mô · Rollback an toàn hai chiều · Vá OS và agent theo wave |
| **D21 Giới hạn blast radius và đa vùng** | Failure domain (AZ, region, cell) · Kiến trúc cell và router · Shuffle sharding · Static stability, control plane và data plane · Rút traffic khỏi AZ/cell · Active-passive và active-active · Phụ thuộc ẩn vào dịch vụ toàn cầu |
| **D22 Vận hành dữ liệu stateful** | Postgres HA với operator (CloudNativePG/Patroni) · Pooling và replication lag · PITR và kiểm tra khôi phục tự động · Backfill và migration lớn · Kafka ops (KRaft, rebalance, upgrade, MirrorMaker 2, quota) · Cache ops |
| **D23 Observability ở quy mô** | Metric dài hạn và nhiều cụm (Mimir, Thanos hoặc VictoriaMetrics, chọn một) · Cardinality · Tail sampling và Collector nhiều tầng · Chi phí và vòng đời log · Meta-monitoring · Continuous profiling (opt) |
| **D24 Nền móng cloud và identity** | Landing zone nhiều account · IaC ở quy mô (state, pipeline, policy) · Workload identity · SPIFFE/SPIRE · Truy cập người: JIT và break-glass · Egress và chi phí mạng |
| **D25 Tuân thủ và quản trị** | SOC 2 và ISO 27001 cho kỹ sư · PCI DSS (scope, phân đoạn) · Luật BVDLCN 2025 và TT 09/2020 · Bằng chứng tự động · Quản lý thay đổi và tách quyền |

Đồng thời: D19 bỏ `optional`; D16 `chaos-engineering` thành "Game day" bắt buộc; D17 `da-vung` và `sao-luu-tai-nguyen-cum` bắt buộc; D7 `feature-flag` bắt buộc; D14 `argo-rollouts` chuyển sang D20 (thêm vào `replacements`).

Tổng: 26 chặng, khoảng 165 chủ đề. Cấp 4 kết thúc bằng một capstone bắt buộc (mục 5).

**Phương án B (gọn hơn): không thêm cấp, bồi vào chặng hiện có**

Nhét các chủ đề trên vào D13, D16, D17, D19. Nhược điểm: các chặng Senior phình lên 12–15 chủ đề, và mất mốc rõ "đủ sức vận hành hệ thống lớn".

**Về chuỗi tiên quyết:** hiện D0 đến D19 là chuỗi tuyến tính. Với cấp 4 nên cho phép song song (ví dụ D22 chỉ cần D13 và D17; D24 chỉ cần D10 và D15) để người học chọn theo vai trò SRE, Platform hay Cloud.

---

## 5. Capstone "hệ thống lớn"

Nguyên tắc chung cho mọi capstone:
- Có **tiêu chí đo được** (số phút, %, USD), không chỉ "dựng xong".
- Kết thúc bằng **game day có người ngoài chấm**, hoặc tự chấm theo checklist, và một **postmortem**.
- Mọi thứ trong Git: chạy `make up` dựng lại từ đầu.
- Đo DORA của chính dự án (deploy frequency, lead time, change fail rate, time to restore).

Gắn với 2 dự án sẵn có: `neobank.json` hiện có milestone `neobank.compliance` (cần d15, d17), `hub-chat.json` có `hub-chat.production` (cần d12, d16). Các capstone dưới đây có thể thành milestone mới của hai dự án đó. Dự án 3 và 4 có thể thành dự án riêng.

### Capstone 1: Nền tảng production cho Neobank (laptop)

- **Mục tiêu:** đưa Neobank mini (từ roadmap Java và Microservices) lên một nền tảng có 3 môi trường, GitOps, observability đầy đủ, chịu được game day và DR drill.
- **Kiến trúc:**
  - 3 cụm kind/k3d: `mgmt` (Argo CD, Kargo, stack quan sát), `prod-a`, `prod-b`. Staging và dev là namespace của `prod-b`.
  - Argo CD ApplicationSet, Kargo promotion dev → staging → prod, Argo Rollouts canary có AnalysisTemplate.
  - CloudNativePG (1 primary, 2 replica, WAL archive lên RustFS hoặc SeaweedFS), Strimzi Kafka 3 broker KRaft.
  - OpenBao cộng External Secrets; Kyverno; cert-manager; Gateway API (Envoy Gateway).
  - OTel Collector (agent rồi gateway, tail sampling), Mimir/Loki/Tempo hoặc VictoriaMetrics/VictoriaLogs, Grafana. SLO bằng Sloth hoặc Pyrra, alert burn rate.
  - Chaos Mesh, k6-operator.
- **Năng lực kiểm chứng:** 3.1, 3.2, 3.5, 3.6, 3.9, 3.10, một phần 3.14 (bằng chứng tuân thủ TT 09).
- **Tiêu chí hoàn thành:**
  - Dựng lại toàn bộ từ zero bằng một lệnh trong ≤ 30 phút.
  - Bản build cố ý lỗi bị canary tự rollback trong ≤ 5 phút; ≤ 10% request bị ảnh hưởng.
  - Kill primary Postgres: failover ≤ 30 giây, không mất giao dịch đã commit (đối chiếu sổ cái kép).
  - PITR về trước lệnh `DELETE` sai: RPO ≤ 5 phút, RTO ≤ 20 phút. Restore test chạy tự động mỗi đêm.
  - Kill 1 broker Kafka với acks=all: 0 message mất.
  - Tắt cụm `prod-a`: traffic sang `prod-b` (GSLB qua CoreDNS hoặc external-dns), RTO ≤ 15 phút.
  - 3 SLO có alert burn rate; game day 4 kịch bản có IC và Comms, 1 postmortem.
  - Evidence pack 10 kiểm soát (audit log, PR được duyệt, báo cáo policy, báo cáo restore).
- **Máy:** khuyến nghị 32 GB RAM, 8 core. 16 GB vẫn chạy được nếu gộp `mgmt` vào `prod-b` và dùng VictoriaMetrics thay Mimir. **Chi phí cloud: 0.**

### Capstone 2: Landing zone nhiều account và DR đa region thật (cloud)

- **Mục tiêu:** dựng nền móng cloud cho một fintech: nhiều account, guardrail, identity không có access key, và một lần region evacuation thật.
- **Kiến trúc (AWS, có thể thay bằng GCP folders/projects):**
  - Organizations với các OU Security (log-archive, audit), Infra (network, shared-services), Workloads (dev, prod).
  - SCP chặn region ngoài ap-southeast-1 và một region DR; chặn tắt CloudTrail/Config. IAM Identity Center.
  - Toàn bộ bằng OpenTofu, pipeline plan/apply qua GitHub Actions OIDC (không access key). Conftest chặn cấu hình sai.
  - Prod: EKS (hoặc ECS cho rẻ) ở 2 region; RDS PostgreSQL có cross-region read replica hoặc Aurora Global Database; S3 có replication. Route 53 failover có health check. EKS Pod Identity.
  - Budget alarm, cost allocation tag, xuất dữ liệu FOCUS.
- **Năng lực kiểm chứng:** 3.10, 3.11, 3.12, 3.13, 3.14 (FinOps, tuân thủ).
- **Tiêu chí hoàn thành:**
  - `tofu apply` từ zero dựng toàn bộ org và workload. `tofu destroy` dọn sạch, kiểm tra bằng `aws resourcegroupstaggingapi` không còn tài nguyên.
  - 0 IAM user có access key. CI dùng OIDC; pod dùng Pod Identity.
  - Thử tắt CloudTrail từ account workload: bị SCP chặn (có log).
  - Region evacuation: promote replica, đổi DNS; RTO ≤ 30 phút, RPO đo được (≤ 1 phút với replica).
  - 100% tài nguyên có tag `team` và `env`; báo cáo chi phí trên mỗi 1.000 giao dịch.
- **Máy và chi phí (ước tính, phải kiểm tra trang giá AWS trước khi làm):** laptop để chạy OpenTofu.
  - Org, Identity Center, SCP: miễn phí. CloudTrail org trail (bản quản lý đầu tiên): miễn phí. Config và GuardDuty: vài USD/tháng mỗi account ở mức lab; GuardDuty có 30 ngày dùng thử.
  - Mỗi "ngày lab" 8 giờ, 2 region: EKS khoảng $0.10/giờ/cụm, 3 node t3.large mỗi region (Singapore khoảng $0.1/giờ on-demand, spot rẻ hơn nhiều), NAT Gateway khoảng $0.06/giờ, ALB khoảng $0.03/giờ, RDS nhỏ khoảng $0.1/giờ. Tổng khoảng **10–20 USD/ngày lab**; cả capstone (3–4 ngày dựng và diễn tập) khoảng **40–80 USD**.
  - **Bắt buộc `destroy` cuối ngày.** Bản rẻ hơn: thay EKS bằng ECS Fargate hoặc k3s trên EC2 spot, bỏ NAT Gateway (dùng VPC endpoint); khoảng 5 USD/ngày.

### Capstone 3: Internal Developer Platform cho 5 team (laptop)

- **Mục tiêu:** dựng nền tảng nội bộ để 5 team (các service của Hub-chat và Neobank) tự tạo service, database và môi trường mà không cần ticket.
- **Kiến trúc:**
  - Một cụm host kind; mỗi team có một vCluster hoặc tenant Capsule. ResourceQuota, NetworkPolicy mặc định chặn, Pod Security restricted.
  - Backstage (software catalog, TechDocs, scorecard) và template "Service Java mới": repo, pipeline, Dockerfile, chart, SLO, dashboard, owner.
  - Crossplane (hoặc kro) Composition: `PostgresDatabase`, `KafkaTopic`, `Bucket`; sinh tài nguyên CloudNativePG, Strimzi, RustFS.
  - Argo CD nhiều tenant (AppProject theo team), OpenCost showback theo team, Kyverno guardrail.
- **Năng lực kiểm chứng:** 3.8 (multi-tenancy), 3.14 (platform, FinOps), 3.12 (RBAC), 3.1.
- **Tiêu chí hoàn thành:**
  - Thời gian từ "bấm tạo" tới service chạy ở dev có URL và dashboard: ≤ 15 phút, không thao tác tay của đội nền tảng.
  - Test tự động chứng minh cô lập: team A không đọc secret, không gọi service, không vượt quota của team B (≥ 10 test âm).
  - 100% workload có owner, cost center và SLO. Báo cáo chi phí theo team từ OpenCost khớp ±10% với tổng của cụm.
  - Tự đánh giá theo CNCF Platform Maturity Model, đạt "Operational" ở cả 5 khía cạnh, có bằng chứng.
  - Khảo sát devex (5 người dùng thử) và một chỉ số adoption.
- **Máy:** 32 GB khuyến nghị (Backstage khá nặng); 16 GB chạy được với 3 tenant. **Chi phí cloud: 0.**

### Capstone 4: Observability ở quy mô và bài toán chi phí (laptop 32 GB)

- **Mục tiêu:** chứng minh vận hành được stack quan sát cho khoảng 1–2 triệu active series, trace và log khối lượng lớn, và giảm chi phí mà không mất khả năng phát hiện sự cố.
- **Kiến trúc:**
  - kwok giả lập 500–1.000 node và vài nghìn pod (metric kube-state).
  - `avalanche` sinh series; telemetrygen (OTel) sinh trace và log.
  - 2 Prometheus agent remote_write về Mimir (microservices mode tối giản) hoặc VictoriaMetrics cluster; object storage cục bộ.
  - OTel Collector 2 tầng với `loadbalancingexporter` và `tailsamplingprocessor`. Loki hoặc VictoriaLogs có retention theo stream.
  - Meta-monitoring bằng Prometheus riêng cộng dead man's switch.
- **Năng lực kiểm chứng:** 3.6, 3.7, 3.14 (chi phí observability).
- **Tiêu chí hoàn thành:**
  - Nạp ổn định ≥ 1 triệu active series; truy vấn dashboard chính p99 ≤ 2 giây.
  - Áp giới hạn series mỗi tenant; tenant "xấu" bị chặn mà không ảnh hưởng tenant khác.
  - Tail sampling giữ 100% trace lỗi và chậm, giảm tổng lượng trace ≥ 90%.
  - Giảm ≥ 50% GB log/ngày mà 100% alert SLO vẫn bắn đúng khi game day.
  - Mô hình chi phí: USD/tháng nếu chạy trên cloud (S3 cộng compute) so với bảng giá SaaS, kèm bản khuyến nghị.
  - Tắt stack quan sát chính: meta-monitoring báo trong ≤ 5 phút.
- **Máy:** 32 GB RAM, SSD trống ≥ 50 GB. **Chi phí cloud: 0.**

### Capstone 5: Hub-chat theo cell, capacity và game day (laptop)

- **Mục tiêu:** biến Hub-chat (đa tenant, nhiều kênh) thành kiến trúc cell, có mô hình capacity và chứng minh giới hạn blast radius.
- **Kiến trúc:**
  - 3–4 cell (mỗi cell là một namespace hoặc cụm kind riêng gồm app, Postgres và Kafka topic riêng).
  - Cell router bằng Envoy Gateway/HTTPRoute theo header tenant, kèm control plane nhỏ (bảng tenant → cell trong Git).
  - Shuffle sharding cho worker gửi tin nhắn. Load shedding ở biên. k6-operator; Chaos Mesh.
- **Năng lực kiểm chứng:** 3.3, 3.4, 3.7, 3.5.
- **Tiêu chí hoàn thành:**
  - Tenant "độc" (poison message) chỉ ảnh hưởng ≤ 1 cell; ≥ 70% tenant không bị ảnh hưởng (với 4 cell).
  - Rút toàn bộ traffic khỏi 1 cell trong ≤ 5 phút theo bước 1%, 10%, 50%, 100%, không request nào bị cắt giữa chừng.
  - Di chuyển 1 tenant giữa 2 cell (dữ liệu và route) không downtime quá 30 giây.
  - Tắt control plane (router config, Argo CD): data plane vẫn phục vụ 100% tenant hiện có (static stability).
  - Mô hình capacity: knee của 1 cell, số cell cần cho đỉnh ×3 khi mất 1 cell; so với kết quả k6 thực tế, sai lệch ≤ 20%.
  - Thử tải vượt 3 lần capacity: goodput ≥ 80% capacity nhờ shedding (không sập dây chuyền).
- **Máy:** 16–32 GB. **Chi phí cloud: 0.**

### Bảng tổng hợp capstone

| # | Dự án | Máy | Chi phí cloud | Chặng chính | Gắn với |
|---|---|---|---|---|---|
| 1 | Nền tảng production Neobank | Laptop 32 GB (16 GB rút gọn) | 0 | D12–D17, D20, D22 | Neobank (milestone mới "Vận hành production") |
| 2 | Landing zone và DR đa region | Cloud thật | khoảng 40–80 USD cả dự án | D9, D10, D15, D21, D24, D25 | Neobank (thay hoặc bổ sung `neobank.compliance`) |
| 3 | IDP cho 5 team | Laptop 32 GB | 0 | D13, D14, D19 | Dự án mới hoặc Hub-chat governance |
| 4 | Observability ở quy mô | Laptop 32 GB | 0 | D12, D23 | Dự án mới |
| 5 | Hub-chat theo cell | Laptop 16–32 GB | 0 | D16, D21, (M9, M16) | Hub-chat (milestone mới sau `hub-chat.production`) |

---

## 6. Lưu ý khi viết bài

- **Công cụ đổi nhanh, hãy ghi ngày kiểm chứng:** ingress-nginx ngừng bảo trì (03/2026); MinIO archive (04/2026), lab dùng RustFS hoặc SeaweedFS; Kafka 4.x chỉ còn KRaft; Kubernetes 1.37 (08/2026). Ghi phiên bản vào `verified` theo `docs/content-standard.md`.
- **Lab cloud** luôn có `<Callout kind="danger">` về chi phí, bước `destroy` và budget alarm trước khi tạo tài nguyên.
- **Mỗi chặng cấp 4 nên mở đầu bằng một postmortem thật** (đã liệt kê ở mục 3) làm "Goal". Học viên đọc bản gốc và tự rút cơ chế trước khi làm lab. Cách này đúng tinh thần "thực chiến".
- **Một số số liệu đến từ nguồn thứ cấp** (chi tiết cơ chế sự cố AWS 10/2025, Cloudflare 11/2025, DORA 2024 về platform, con số Coinbase/Datadog, yêu cầu 4 giờ của TT 09). Khi viết bài cần đối chiếu bản gốc.

---

## 7. Nguồn

**Khung và sách**
- Google SRE Book: https://sre.google/sre-book/table-of-contents/ (Managing Incidents, Postmortem Culture, Handling Overload, Addressing Cascading Failures, Data Integrity, Eliminating Toil)
- SRE Workbook: https://sre.google/workbook/table-of-contents/ (Implementing SLOs, Alerting on SLOs, Canarying Releases, Incident Response)
- Building Secure & Reliable Systems: https://sre.google/books/building-secure-reliable-systems/
- DORA capabilities: https://dora.dev/capabilities/
- DORA 2024: https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report ; tóm tắt: https://thenewstack.io/dora-2024-ai-and-platform-engineering-fall-short/
- DORA 2025: https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf ; https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report
- AWS Well-Architected: https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
- AWS cell-based architecture: https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/reducing-scope-of-impact-with-cell-based-architecture.html
- AWS Builders' Library: https://aws.amazon.com/builders-library/ (Timeouts, retries and backoff with jitter; Workload isolation using shuffle-sharding; Static stability using Availability Zones; Automating safe, hands-off deployments; Ensuring rollback safety during deployments; Using load shedding to avoid overload; Avoiding insurmountable queue backlogs)
- AWS Disaster Recovery whitepaper: https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html
- AWS Security Reference Architecture: https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/welcome.html
- Azure Well-Architected: https://learn.microsoft.com/azure/well-architected/
- Google Cloud Architecture Framework: https://cloud.google.com/architecture/framework
- CNCF Platforms whitepaper: https://tag-app-delivery.cncf.io/whitepapers/platforms/
- CNCF Platform Engineering Maturity Model: https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/ ; https://www.cncf.io/blog/2026/09/01/platform-engineering-maturity-from-toolchain-to-self-service/
- Kubernetes: production environment https://kubernetes.io/docs/setup/production-environment/ ; multi-tenancy https://kubernetes.io/docs/concepts/security/multi-tenancy/ ; version skew https://kubernetes.io/releases/version-skew-policy/ ; 1.37 https://kubernetes.io/releases/1.37/ ; Cluster API https://cluster-api.sigs.k8s.io/
- Ingress-nginx retirement: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/ ; https://kubernetes.io/blog/2026/01/29/ingress-nginx-statement/
- FinOps Framework 2025: https://www.finops.org/insights/2025-finops-framework ; FOCUS: https://focus.finops.org/focus-specification/
- SPIFFE: https://spiffe.io/docs/latest/spiffe-about/overview/
- OTel tail sampling: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor
- Apache Kafka 4.0: https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/ ; https://kafka.apache.org/40/getting-started/upgrade/
- MinIO maintenance mode: https://www.infoq.com/news/2025/12/minio-s3-api-alternatives/

**Sự cố và postmortem**
- AWS us-east-1, 10/2025: https://aws.amazon.com/message/101925/
- Google Cloud, 12/06/2025: https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW
- Cloudflare 18/11/2025: https://blog.cloudflare.com/18-november-2025-outage/
- Cloudflare 05/12/2025: https://blog.cloudflare.com/5-december-2025-outage/
- CrowdStrike Channel File 291 (tóm tắt RCA): https://www.techtarget.com/searchsecurity/news/366602392/CrowdStrike-details-errors-that-led-to-mass-IT-outage
- Datadog 08/03/2023: https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/ ; https://www.datadoghq.com/blog/engineering/2023-03-08-deep-dive-into-platform-level-impact/
- Reddit Pi Day 2023: https://www.reddit.com/r/RedditEng/comments/11xx5o0/you_broke_reddit_the_piday_outage/
- Roblox 10/2021: https://blog.roblox.com/2022/01/roblox-return-to-service-10-28-10-31-2021/
- Facebook 04/10/2021: https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/
- Slack 04/01/2021: https://slack.engineering/slacks-outage-on-january-4th-2021/
- GitLab 31/01/2017: https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/
- Atlassian 04/2022: https://www.atlassian.com/engineering/post-incident-review-april-2022-outage
- CircleCI 01/2023: https://circleci.com/blog/jan-4-2023-incident-report/
- tj-actions/changed-files (CVE-2025-30066): https://threats.wiz.io/all-incidents/tj-actionschanged-files-supply-chain-attack

**Engineering blog**
- Slack cellular architecture: https://slack.engineering/slacks-migration-to-a-cellular-architecture/
- Shopify BFCM readiness 2025: https://shopify.engineering/bfcm-readiness-2025 ; capacity planning: https://shopify.engineering/capacity-planning-shopify ; pods: https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale
- Stripe DocDB: https://stripe.dev/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations
- Uber Up: https://www.uber.com/blog/up-portable-microservices-ready-for-the-cloud/
- Netflix Kayenta: https://netflixtechblog.com/automated-canary-analysis-at-netflix-with-kayenta-3260bc7acc69
- Grab: https://engineering.grab.com/exposing-kafka-cluster ; https://engineering.grab.com/an-elegant-platform ; https://engineering.grab.com/migrating-to-abac ; danh sách bài Kafka khác (Kafka on Kubernetes, Zero traffic cost for Kafka consumers): https://engineering.grab.com/tags
- GitLab handbook incident management: https://handbook.gitlab.com/handbook/engineering/infrastructure-platforms/incident-management/
- Coinbase và Datadog: https://blog.pragmaticengineer.com/datadog-65m-year-customer-mystery/

**Tuân thủ**
- PCI DSS: https://www.pcisecuritystandards.org/document_library/
- Luật Bảo vệ dữ liệu cá nhân 2025: https://thitruongtaichinhtiente.vn/nhung-diem-chinh-can-luu-y-tai-luat-bao-ve-du-lieu-ca-nhan-chinh-thuc-co-hieu-luc-tu-ngay-1-1-2026-75881.html
- Thông tư 09/2020/TT-NHNN: https://thitruongtaichinhtiente.vn/dam-bao-an-toan-he-thong-thong-tin-trong-hoat-dong-ngan-hang-32429.html
