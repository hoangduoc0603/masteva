# Đánh giá và đề xuất tái cấu trúc roadmap DevOps

Ngày: 09/10/2026. Trạng thái: **phương án B đã chọn; đợt 1 (tái cấu trúc, tách roadmap Kubernetes) đã làm ngày 09/10/2026**, xem [spec](superpowers/specs/2026-10-09-tai-cau-truc-roadmap-devops-design.md). Mã chặng D trong file này là mã cũ, trước khi tái cấu trúc. Yêu cầu gốc: roadmap DevOps phải đủ để làm thực chiến, làm dự án lớn, dựng hạ tầng cho hệ thống lớn, không dừng ở lý thuyết cơ bản.

Báo cáo chi tiết (nguồn, bảng phiên bản, số đo) nằm ở [research/devops/](research/devops/):

| File | Góc nghiên cứu |
|---|---|
| [a-chuan-tham-chieu.md](research/devops/a-chuan-tham-chieu.md) | Đối chiếu với roadmap.sh, đề cương CNCF (KCNA, CKAD, CKA, CKS, CKNE, CNPE…), AWS DOP-C02 và SAP-C02, Google Pro DevOps, Terraform Associate, các giáo trình thực hành |
| [b-van-hanh-he-thong-lon.md](research/devops/b-van-hanh-he-thong-lon.md) | Google SRE, DORA, AWS Well-Architected và Builders' Library, postmortem thật; năng lực "phải có" cho hệ thống lớn; 5 capstone |
| [c-ban-do-cong-cu.md](research/devops/c-ban-do-cong-cu.md) | Phiên bản, giấy phép, tình trạng của khoảng 170 công cụ tháng 10/2026; các "bẫy" |
| [d-chien-luoc-lab.md](research/devops/d-chien-luoc-lab.md) | Chặng nào chạy được trên laptop, chặng nào cần cloud, chi phí AWS, số đo cụm kind trên máy hiện tại |
| [e-boi-canh-viet-nam.md](research/devops/e-boi-canh-viet-nam.md) | Doanh nghiệp Việt Nam chạy hạ tầng thế nào, quy định (TT 09/2020, Luật ANM 2025, NĐ 333/2026, Luật BVDLCN 2025), tin tuyển dụng |

## 1. Hiện trạng

| | Số liệu |
|---|---|
| Roadmap DevOps | 20 chặng D0–D19, 130 chủ đề; Nền tảng 39, Middle 51, Senior 40 (trong đó 15 tuỳ chọn) |
| Bài học | 1 bài (D1.1). Chủ đề chưa có tóm tắt và tài liệu |
| Tiên quyết | Một đường thẳng D0 → D19 (Cloud phải học sau Chuỗi cung ứng, Kubernetes sau IaC…) |

**Điểm mạnh:** cấp Nền tảng và Middle phủ gần hết roadmap.sh DevOps, KCNA, CKAD và phần lớn CKA. Masteva đã có những mảng roadmap.sh không có: đo lường delivery, chuỗi cung ứng, SRE, DR, platform engineering.

**Điểm yếu, đúng chỗ người dùng cần:** cấp Senior mỏng nhất (21 chủ đề chính, ít hơn Middle). CKA chỉ là chuẩn Middle; mức "hệ thống lớn" tương ứng CKS, CKNE, CNPE và các chứng chỉ Professional của AWS/Google, và đó là phần Masteva thiếu nhiều nhất.

## 2. Kết luận chính

### 2.1 Thiếu hẳn (P0)

| Mảng | Vì sao cần | Nguồn đòi hỏi |
|---|---|---|
| **Thay đổi an toàn** (wave, bake time, canary tự rollback, config cũng là thay đổi, kill switch) | Phần lớn sự cố lớn gần đây do một thay đổi lan quá nhanh: Google Cloud 06/2025, Cloudflare 11 và 12/2025, CrowdStrike 07/2024 | AWS Builders' Library, CNPE (25% progressive delivery) |
| **Vận hành dữ liệu stateful** (Postgres HA, PITR có kiểm tra tự động, Kafka 4 KRaft) | GitLab 2017 có 5 cơ chế backup nhưng không cái nào khôi phục được; Atlassian 2022 mất 14 ngày | SRE Workbook, SAP-C02 |
| **Observability ở quy mô** (lưu dài hạn, cardinality, tail sampling, chi phí log, meta-monitoring) | Roblox 2021 mất 73 giờ một phần vì hệ thống giám sát phụ thuộc chính hệ thống bị sập | PCA, OTCA, Google Pro |
| **Cloud ở quy mô tổ chức** (landing zone, nhiều account, SCP, IAM Identity Center, hybrid) | SAP-C02 Domain 1 chiếm 26%; ngân hàng Việt Nam chạy hybrid | SAP-C02, Google Section 1 |
| **Identity thay cho secret tĩnh** (OIDC từ CI, workload identity, ghim action theo SHA) | CircleCI 2023, tj-actions 2025, Trivy action 03/2026 (75/76 tag bị chiếm) | CKS, DOP-C02 |
| **Mạng ở quy mô** (LB L4/L7, DNS, CDN, anycast mức khái niệm, CNI/eBPF, egress) | CNCF vừa ra chứng chỉ CKNE riêng cho mảng này (01/10/2026) | CKNE, CCA |
| **Giới hạn blast radius** (failure domain, cell, shuffle sharding, static stability) | Cách AWS, Slack, DoorDash giới hạn phạm vi sự cố | AWS Builders' Library |
| **Quản lý sự cố đầy đủ** (vai trò IC, giao tiếp, runbook, game day) | DOP-C02 Domain 5 chiếm 14% | DOP-C02, Google 3.3 |

### 2.2 Đặt sai mức hoặc đã lỗi thời

| Chỗ | Sửa |
|---|---|
| D5 "Bốn chỉ số DORA" | DORA có **5 chỉ số** từ 01/2026 (thêm deployment rework rate; MTTR đổi thành failed deployment recovery time) |
| D11 Ingress | Ingress-NGINX **ngừng bảo trì từ 03/2026**, repo đã archive. Dạy Gateway API (Envoy Gateway) làm chính |
| D13 Helm *hoặc* Kustomize | CKA và CKAD đòi cả hai |
| Ansible tuỳ chọn | Tin tuyển dụng Việt Nam hay đòi (7/8 tin đọc toàn văn); DOP-C02 và roadmap.sh coi là cốt lõi |
| Kyverno, Argo Rollouts, DR đa vùng, cả chặng D19 đang tuỳ chọn | CNPE, CNPA, SAP-C02 coi là nội dung chính |
| Cilium/eBPF nằm ở D18 Service mesh | Thuộc mạng Kubernetes cốt lõi (CKNE, CCA) |
| Container ở Middle | D0 đã cài Docker; mọi giáo trình đặt container ở nền tảng |
| Chuỗi cung ứng (ký, SBOM, SLSA) ở Middle | Là nội dung mức CKS, nên đứng cạnh DevSecOps |
| D11 (11 chủ đề), D13 (trộn 4 mảng), D16 (trộn SLO, sự cố, dung lượng) | Quá to, cần tách |

### 2.3 Công cụ phải đổi so với thói quen cũ

| Không dạy làm mặc định nữa | Dùng thay | Lý do |
|---|---|---|
| ingress-nginx | Gateway API 1.6 + Envoy Gateway 1.9 | Đã retire 03/2026 |
| MinIO | SeaweedFS 4.48 (hoặc RustFS 1.0 như SB10) | Repo archive 04/2026 |
| LocalStack | Moto, MiniStack, Floci | Bản community archive 03/2026, bản mới bắt buộc tài khoản |
| Chart/image Bitnami | Operator và chart chính chủ (CloudNativePG, Strimzi, Valkey) | Từ 08/2025 chỉ còn tag `latest` miễn phí |
| Promtail, Grafana Agent | Grafana Alloy 1.20 | Hết hạn 03/2026 |
| Helm 3 | Helm 4.3 | Helm 3 chỉ còn vá bảo mật tới 02/2027 |
| Vault (lab bắt buộc) | OpenBao 2.7 (khái niệm như Vault) | Vault theo BSL; vẫn nhắc Vault vì tuyển dụng |
| Redis | Valkey 9 | Redis đổi giấy phép |
| Kubernetes Dashboard | Headlamp | Dashboard đã archive |

Terraform (BSL) và OpenTofu (MPL, CNCF): dạy phần cú pháp chung, lab chạy được với cả hai.

### 2.4 Bối cảnh Việt Nam

- **Doanh nghiệp lớn chạy hybrid.** Ngân hàng giữ core trên trung tâm dữ liệu riêng hoặc private cloud và đưa dần workload lên AWS (VPBank, VIB, Techcombank). Fintech và ví điện tử cũng hybrid (MoMo, MobiFone Payment, ZaloPay chạy Kubernetes trên bare metal). Cloud nội địa phần lớn xây trên OpenStack, Ceph và Kubernetes.
- **AWS là public cloud nên dạy chính.** AWS dẫn đầu thị phần và tin tuyển dụng, có Local Zone Hà Nội từ 19/06/2026 (không phải Region đầy đủ). GCP và Azure chưa có region ở Việt Nam.
- **Quy định ảnh hưởng trực tiếp tới thiết kế hạ tầng:**
  - Thông tư 09/2020/TT-NHNN: hệ thống cấp độ 3 trở lên phải có DR, thời gian thay thế tối đa **4 giờ**, kiểm tra DR 6 tháng một lần. Cấp độ 4 phải chuyển hẳn sang site DR và chạy ít nhất 1 ngày làm việc mỗi năm.
  - Luật An ninh mạng 2025 và Nghị định 333/2026: lưu dữ liệu người dùng tại Việt Nam, nhật ký hệ thống tối thiểu 12 tháng, tách production khỏi dev/test, sao lưu có kiểm tra khôi phục.
  - Luật Bảo vệ dữ liệu cá nhân 2025 và Nghị định 356/2025.
- **Tin tuyển dụng:** Kubernetes có mặt ở cả 8/8 tin đọc toàn văn; GitLab CI 8, Prometheus/Grafana 7, Ansible 7, Terraform 6. Tin của doanh nghiệp nội địa còn hay đòi Rancher, Harbor/Nexus, OpenStack, VMware/Proxmox.

**Hệ quả cho roadmap:** cần dạy cả **on-prem** (kubeadm HA, HAProxy/Keepalived, MetalLB, Ceph/Rook, Harbor, hai site DR) lẫn **AWS**, với trọng số gần bằng nhau. Tuân thủ Việt Nam lồng vào các bài DR, log, bảo mật.

### 2.5 Lab chạy ở đâu và tốn bao nhiêu

- **Khoảng 85–90% chủ đề chạy trọn trên laptop.** Đo trên máy hiện tại (M1 Pro 16 GB, Docker 7,7 GB): cụm kind 1 control plane + 2 worker tạo trong 35 giây, dùng khoảng 1 GiB RAM. Thứ nặng là add-on (stack quan sát, Argo CD, Istio, Backstage), nên mỗi bài ghi profile máy 8 GB / 16 GB.
- **Cần AWS thật:** chặng Cloud (IAM, VPC, database được quản lý, chi phí) và các bài tuỳ chọn EKS, KMS, đa region, landing zone.
  - Một bài cloud làm xong và xoá trong 2 giờ tốn khoảng 0,1–1 USD.
  - Rủi ro thật là quên xoá: EKS bỏ quên một tháng khoảng 140–175 USD, NAT gateway khoảng 33 USD.
  - Tài khoản AWS mới có tối đa 200 USD credit (Free plan, tự đóng sau 6 tháng).
  - Ước tính kiểm chứng toàn bộ bài cloud dưới 30 USD; capstone landing zone và DR đa region khoảng 40–80 USD.
- Mỗi bài cloud ghi đầu bài "chi phí nếu làm đúng" và "chi phí nếu quên một tháng", có budget alarm, tag, bước `destroy` và kiểm tra sau dọn dẹp. Mục `Check` cốt lõi luôn có đường làm trên máy.

## 3. Phương án cấu trúc

| Phương án | Mô tả | Được | Mất |
|---|---|---|---|
| **A. Một roadmap, mở rộng** | Thêm khoảng 9 chặng, tách D11, D13, D16 | Một lộ trình liền mạch | Khoảng 33 chặng, dài hơn Java + Spring Boot cộng lại; cấp Senior rất dài |
| **B. Tách roadmap Kubernetes (đề xuất)** | Roadmap DevOps 25 chặng (D0–D24) + roadmap Kubernetes mới 11 chặng (K1–K11), nối nhau bằng `recommended` | Khớp cách roadmap.sh tách (DevOps, Kubernetes, Terraform, AWS là roadmap riêng) và trục chứng chỉ KCNA → CKAD → CKA → CKS/CKNE; mỗi roadmap vừa sức; cùng tiền lệ tách Spring Boot | Thêm việc chuyển chặng và một mã hiển thị mới (`K`) như lần tách Spring Boot |
| C. Thêm cấp thứ tư "Hệ thống lớn" | Giữ D0–D19, thêm D20–D25 ở cấp mới | Ít đổi cấu trúc | Code chỉ cho phép 3 cấp (`LEVELS` trong `src/lib/content/constants.ts`); tên cấp không khớp roadmap khác; không giải quyết chặng quá to |

**Đề xuất phương án B.** Lý do: người dùng muốn đủ sâu tới hệ thống lớn, nên tổng khối lượng sẽ gần gấp đôi hiện tại; tách Kubernetes giữ cho mỗi roadmap có ba cấp rõ nghĩa, và Kubernetes là kỹ năng xuất hiện trong mọi tin tuyển dụng nên xứng đáng có roadmap riêng.

### 3.1 Khung phương án B

Mã hiển thị là đề xuất. Chặng cũ giữ mã định danh và URL (`d11`, `/vi/learn/d11/…`), chỉ đổi mã hiển thị, như lần tách Spring Boot. Chặng **mới** in đậm.

**Roadmap DevOps**

| Cấp | Mã | Chặng | Ghi chú |
|---|---|---|---|
| Nền tảng: *tự vận hành máy Linux, mạng và đóng gói bằng container* | D0 | Dựng phòng lab (`d0`) | Thêm "DevOps là gì" ngắn; Lima + Docker Engine, kind |
| | D1 | Linux (`d1`) | Thêm sysctl, LVM, namespaces/cgroups, AppArmor/SELinux cơ bản; Ubuntu 26.04 dùng sudo-rs và uutils |
| | D2 | Mạng (`d2`) | Thêm DNS vận hành (TTL, cache), PKI cơ bản |
| | D3 | Scripting (`d3`) | |
| | D4 | Git và cộng tác (`d4`) | |
| | D5 | Container (`d6`) | Chuyển lên Nền tảng; thêm OCI, kho artifact |
| Middle: *đưa ứng dụng lên production trên máy chủ và AWS* | D6 | CI/CD (`d7`) | Thêm OIDC vào cloud, ghim action theo SHA, môi trường preview; feature flag thành bắt buộc |
| | D7 | Đo lường delivery (`d5`) | 5 chỉ số DORA; đứng sau CI/CD để có pipeline mà đo |
| | D8 | **Quản lý cấu hình máy** | Ansible (role, inventory, idempotent), Packer, vá OS theo đợt |
| | D9 | **Proxy, load balancer và TLS ở production** | Nginx, HAProxy, Keepalived (VIP), chứng chỉ và PKI nội bộ; nền cho on-prem |
| | D10 | Cloud: AWS (`d9`) | Thêm region/AZ/failure domain, Local Zone Hà Nội, VPN hybrid |
| | D11 | Infrastructure as Code (`d10`) | Remote state và locking, module; Terraform/OpenTofu; Ansible chuyển sang D8 |
| | D12 | Observability (`d12`) | Alloy thay Promtail; nối SLO cơ bản |
| Senior: *vận hành hệ thống lớn: an toàn, đáng tin cậy, ở quy mô* | D13 | GitOps và thay đổi an toàn (`d14`) | Argo CD, Argo Rollouts bắt buộc, thăng cấp giữa môi trường (Kargo), wave và bake time, config là thay đổi |
| | D14 | Chuỗi cung ứng phần mềm (`d8`) | Chuyển lên Senior; ký, SBOM, SLSA 1.2, case study Trivy 03/2026 |
| | D15 | DevSecOps và identity (`d15`) | Workload identity, OIDC, OpenBao + External Secrets, Kyverno bắt buộc |
| | D16 | SLO, alerting, observability ở quy mô (`d16` tách) | Burn rate, Mimir/Thanos/VictoriaMetrics, cardinality, tail sampling, chi phí log, meta-monitoring |
| | D17 | **Sự cố và on-call** | Vai trò IC, giao tiếp, runbook, postmortem, game day |
| | D18 | **Dung lượng, hiệu năng và quá tải** | Capacity planning, load test cả hệ (k6 đã dạy ở SB12), load shedding ở biên |
| | D19 | **Vận hành dữ liệu stateful** | Postgres HA (CloudNativePG), PITR và kiểm tra khôi phục tự động, Kafka 4 KRaft ops, cache |
| | D20 | Sao lưu và DR (`d17`) | Chiến lược DR (backup-restore → active-active), hai site theo TT 09/2020, diễn tập chuyển hẳn sang DR |
| | D21 | **Giới hạn blast radius** | Failure domain, cell, shuffle sharding, static stability, rút traffic khỏi AZ/cell |
| | D22 | **Cloud ở quy mô tổ chức** | Landing zone nhiều account, SCP, IAM Identity Center, IaC ở quy mô (Terragrunt/Atlantis, policy as code), hybrid và dữ liệu trong nước |
| | D23 | Platform engineering và FinOps (`d19`) | Bắt buộc (trừ Backstage); nền tảng là sản phẩm, Crossplane, OpenCost, unit economics |
| | D24 | **Tuân thủ cho kỹ sư** | TT 09/2020, Luật ANM 2025 và NĐ 333/2026, Luật BVDLCN 2025, SOC 2/ISO 27001/PCI DSS ở mức kỹ sư, bằng chứng tự động |

**Roadmap Kubernetes (mới)**

| Cấp | Mã | Chặng | Ghi chú |
|---|---|---|---|
| Nền tảng (≈ KCNA, CKAD) | K1 | Kiến trúc và workload (`d11` tách) | Pod, Deployment, Job, StatefulSet, DaemonSet, ConfigMap/Secret, probe, request/limit |
| | K2 | **Mạng, lưu trữ và quyền** (`d11` tách) | Service, CoreDNS, Gateway API, PV/StorageClass, RBAC, SecurityContext, NetworkPolicy |
| | K3 | **Đóng gói: Helm và Kustomize** | Tự viết Helm chart (Helm 4), Kustomize overlay |
| Middle (≈ CKA) | K4 | Dựng và vận hành cụm (`d13` tách) | kubeadm HA trên VM Lima, API VIP bằng HAProxy/Keepalived, MetalLB, nâng cấp, etcd, xoay chứng chỉ, chẩn đoán; EKS là lựa chọn |
| | K5 | **Scheduling, autoscaling và multi-tenancy** (`d13` tách) | Affinity, taint, topology spread, PDB, priority, quota, HPA/VPA/KEDA, cluster autoscaler/Karpenter, Capsule/vCluster |
| | K6 | **Mạng cụm chuyên sâu** | Cilium/eBPF, kube-proxy, Gateway API nâng cao, egress, external-dns, cert-manager |
| | K7 | **Lưu trữ và workload stateful** | CSI, Longhorn, Rook-Ceph, snapshot, cách operator quản lý database |
| Senior (≈ CKS, CKNE) | K8 | **Bảo mật cụm** | Pod Security Admission, admission policy, seccomp/AppArmor, Falco, xác minh chữ ký image, audit log, CIS benchmark |
| | K9 | **Mở rộng Kubernetes** | CRD, controller, operator tự viết (từ `d13.crd-operator`) |
| | K10 | **Nhiều cụm và fleet** | Cluster API, GitOps nhiều cụm, failover giữa cụm |
| | K11 | Service mesh (`d18`, tuỳ chọn) | Istio ambient, mTLS, điều phối lưu lượng; eBPF chuyển sang K6 |

**Ranh giới với roadmap khác** (chi tiết ở báo cáo B, mục 4.2): Microservices và Spring Boot dạy code và thiết kế ranh giới; DevOps và Kubernetes dạy cơ chế nền tảng, vận hành và đo. Ví dụ: retry và circuit breaker trong code ở M9/SB7, còn D18 dạy load shedding ở biên; k6 đã dạy ở SB12 thì D18 chỉ dùng cho capacity cả hệ; ngữ nghĩa Kafka ở M5, còn D19 vận hành broker.

### 3.2 Dự án capstone

Mỗi capstone có tiêu chí đo được (phút, %, USD), kết thúc bằng game day và postmortem, dựng lại từ đầu bằng một lệnh.

| # | Dự án | Máy | Chi phí cloud | Tiêu chí tiêu biểu |
|---|---|---|---|---|
| 1 | **Nền tảng production cho Neobank** (2 "site", GitOps, canary, CloudNativePG, Kafka, SLO, DR theo TT 09) | Laptop 16 GB (rút gọn) hoặc 32 GB | 0 | Canary lỗi tự rollback ≤ 5 phút; failover Postgres ≤ 30 giây; PITR RPO ≤ 5 phút; tắt site chính, chuyển site phụ ≤ 15 phút |
| 2 | **Landing zone nhiều account và DR đa region trên AWS** | Laptop + AWS | Khoảng 40–80 USD cả dự án, tuỳ chọn | 0 IAM user có access key; SCP chặn tắt CloudTrail; region evacuation RTO ≤ 30 phút |
| 3 | **Internal Developer Platform cho 5 team** (Backstage, Crossplane, vCluster/Capsule, OpenCost) | Laptop 32 GB (16 GB với 3 team) | 0 | Tạo service mới tới khi chạy ở dev ≤ 15 phút, không thao tác tay; ≥ 10 test âm chứng minh cô lập team |
| 4 | Observability ở quy mô (1 triệu series, tail sampling, giảm 50% log) | Laptop 32 GB, tuỳ chọn | 0 | Dashboard p99 ≤ 2 giây; tail sampling giảm ≥ 90% trace mà giữ 100% trace lỗi |
| 5 | **Hub-chat theo cell** (cell router, shuffle sharding, static stability) | Laptop 16–32 GB | 0 | Tenant độc chỉ ảnh hưởng ≤ 1 cell; rút một cell trong ≤ 5 phút |

Capstone 1 và 2 thành milestone mới của dự án Neobank; capstone 5 thành milestone của Hub-chat.

## 4. Khối lượng và thứ tự làm

| | Ước tính |
|---|---|
| Chặng | 36 (25 DevOps + 11 Kubernetes); khoảng 20 chặng mới hoặc tách |
| Chủ đề | Khoảng 230 (hiện 130) |
| Bài học | Khoảng 100 (mỗi chặng 2–4 bài) |
| Nhịp | Mỗi đợt 4 chặng song song như Spring Boot, khoảng 9–10 đợt |

Thứ tự đề xuất:

1. **Đợt 1 (cấu trúc):** tách roadmap Kubernetes, đổi mã hiển thị, thêm chặng khung mới, sửa các mục lỗi thời ở 2.2, chuyển tiên quyết sang dạng đồ thị, viết tóm tắt và tài liệu cho mọi chủ đề. Không viết bài.
2. **Đợt 2–4:** bài cho cấp Nền tảng và Middle của DevOps (D0–D12) và Kubernetes K1–K3. Đây là phần người học đi trước.
3. **Đợt 5–8:** Kubernetes K4–K10 và cấp Senior của DevOps.
4. **Đợt 9–10:** capstone, chặng tuỳ chọn (K11), bài cloud tốn phí.

## 5. Quyết định cần người dùng

1. **Cấu trúc:** phương án B (tách roadmap Kubernetes, đề xuất), A hay C.
2. **Trọng số on-prem:** đề xuất on-prem và AWS gần ngang nhau, theo bối cảnh Việt Nam.
3. **Tài khoản AWS cho bài cloud:** để kiểm chứng bài cloud cần một tài khoản AWS lab riêng do người dùng tự tạo (Free plan, budget alarm 5 và 10 USD). Ước tính dưới 30 USD cho các bài cloud, nằm trong 200 USD credit; capstone 2 thêm 40–80 USD và có thể để sau. Nếu chưa muốn, bài cloud viết ở trạng thái `draft` cho tới khi có tài khoản.
4. **Máy tham chiếu:** đề xuất bài thường chạy được trên 16 GB và có ghi profile 8 GB; capstone 3, 4 ghi rõ cần 32 GB.

## 6. Nguồn chính

Đầy đủ trong các báo cáo ở [research/devops/](research/devops/). Một số nguồn chính:

- roadmap.sh DevOps, Kubernetes, Terraform, AWS (repo `nilbuild/developer-roadmap`, 10/2026)
- Đề cương CNCF: https://github.com/cncf/curriculum (cập nhật 01/10/2026, có CKNE mới)
- DORA metrics: https://dora.dev/guides/dora-metrics/
- Ingress NGINX retirement: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/
- Google SRE Book và Workbook: https://sre.google/sre-book/table-of-contents/, https://sre.google/workbook/table-of-contents/
- AWS Builders' Library: https://aws.amazon.com/builders-library/
- CNCF Platforms White Paper và Platform Engineering Maturity Model: https://tag-app-delivery.cncf.io/whitepapers/platforms/
- AWS SAP-C02 exam guide: https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/
- Thông tư 09/2020/TT-NHNN, Luật An ninh mạng 2025, Nghị định 333/2026, Luật Bảo vệ dữ liệu cá nhân 2025 (xem báo cáo E, mục Nguồn)
