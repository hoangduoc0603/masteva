# Đánh giá roadmap DevOps của Masteva: góc chuẩn tham chiếu và giáo trình

Ngày: 09/10/2026. Phạm vi: chỉ đọc, không sửa repo. Đối tượng đánh giá: `content/roadmaps/devops.json` và `content/steps/d0…d19/meta.json` (20 chặng D0–D19, 3 cấp). Câu hỏi: so với các chuẩn tham chiếu (roadmap.sh, đề cương chứng chỉ CNCF/LF, AWS, Google, HashiCorp, giáo trình thực hành nổi tiếng), roadmap đã đủ để đưa người học **tới mức dựng và vận hành hạ tầng cho hệ thống lớn** chưa; thiếu gì; thứ tự và phân cấp có hợp lý không.

> Nguyên tắc đọc báo cáo: chứng chỉ chỉ dùng làm **thước đo phủ kiến thức**, không phải mục tiêu (product vision §5: "không dạy kiểu luyện thi chứng chỉ"). Một mảng được coi là quan trọng khi **nhiều nguồn độc lập** cùng đòi hỏi, đặc biệt các nguồn mức Professional/Specialist.

## 0. Kết luận ngắn

1. **Khung hiện tại tốt ở cấp Nền tảng và Middle**, phủ gần hết roadmap.sh DevOps, KCNA, CKAD và phần lớn CKA; **vượt roadmap.sh** ở văn hoá/đo lường, chuỗi cung ứng, SRE, DR, platform engineering (roadmap.sh DevOps không có các mục SRE, incident, FinOps, platform).
2. **Cấp Senior quá mỏng so với mục tiêu "hệ thống lớn"**: chỉ 21 chủ đề chính (15/40 chủ đề Senior là tuỳ chọn), ít hơn Middle (41). Các nguồn mức Professional (AWS SAP-C02, AWS DOP-C02, Google Professional Cloud DevOps Engineer, CKS, CKNE, CNPE) đòi hỏi những mảng Masteva **chưa có chặng nào**: cloud ở quy mô tổ chức (landing zone, multi-account, identity federation), networking sâu, IaC ở quy mô, storage và workload stateful, multi-cluster, quản lý cấu hình máy, release engineering, load test.
3. **Hai chỗ đã lỗi thời**: D5 "Bốn chỉ số DORA" (DORA hiện định nghĩa **5** chỉ số, thêm *deployment rework rate*, trang cập nhật 05/01/2026); D11 "Ingress và Gateway API" cần đặt Gateway API làm chính vì **Ingress NGINX đã ngừng bảo trì từ 03/2026**, Ingress API bị đóng băng tính năng.
4. **Một số lựa chọn "pick/opt" sai mức**: Helm *hoặc* Kustomize (CKA, CKAD đòi cả hai và CKA đòi cả việc dùng chúng để cài thành phần cụm); Ansible là tuỳ chọn (DOP-C02, roadmap.sh, KodeKloud coi là cốt lõi); Policy engine, progressive delivery (Argo Rollouts), DR đa vùng, Cilium/eBPF, platform engineering, FinOps đều là tuỳ chọn trong khi CNPE, CKS, CKNE, SAP-C02, Google Pro coi là nội dung chính.
5. **Thứ tự**: chuỗi tiên quyết đang là một đường thẳng D0→D19 (mỗi chặng đòi chặng trước), tạo phụ thuộc giả (Cloud đòi Chuỗi cung ứng, Kubernetes đòi IaC, DevSecOps đòi GitOps). Container nên lên Nền tảng; Văn hoá/DORA nên đứng sau CI/CD; Chuỗi cung ứng (ký, SBOM, SLSA) nên lùi về Senior cạnh DevSecOps.
6. **Kích thước chặng**: D11 (11 chủ đề), D13 (8 chủ đề lẫn 4 mảng khác nhau), D16 (7 chủ đề lẫn SLO, sự cố, dung lượng, chaos) quá to; D14 (4), D17 (3 chính) quá nhỏ.
7. **Đề xuất cấu trúc** (mục 5): giống cách đã làm với Spring Boot, cân nhắc **tách roadmap Kubernetes** riêng (khoảng 8–9 chặng, đi theo trục KCNA → CKAD → CKA → CKS/CKNE), DevOps giữ Linux, mạng, CI/CD, cloud, IaC, observability, SRE, DR, platform; nếu giữ một roadmap thì DevOps lên khoảng 26–28 chặng và cấp Senior phải dày gấp đôi hiện tại.

## 1. Nguồn đã đối chiếu

Tất cả truy cập ngày 09/10/2026 trừ khi ghi khác.

| Nhóm | Nguồn | Phiên bản / thời điểm | URL |
|---|---|---|---|
| roadmap.sh | DevOps (140 mục), DevOps Beginner (14), Kubernetes (67), Linux (102), Terraform (110), Docker (56), AWS (101), DevSecOps (94), Network Engineer (201) | Repo `nilbuild/developer-roadmap` (repo cũ `kamranahmedse/developer-roadmap` đã chuyển tên), commit `5f4fd12` ngày 09/10/2026. **roadmap.sh không có roadmap SRE** (đã kiểm danh sách thư mục `roadmaps/`) | https://roadmap.sh/devops, https://roadmap.sh/kubernetes, https://roadmap.sh/linux, https://roadmap.sh/terraform, https://roadmap.sh/docker, https://roadmap.sh/aws, https://roadmap.sh/devsecops, https://github.com/nilbuild/developer-roadmap/tree/master/roadmaps |
| CNCF / LF | Đề cương CKA v1.35, CKAD v1.37, CKS v1.34, KCNA, KCSA, PCA, OTCA, ICA, CCA, CGOA, CAPA, CNPA, CNPE, **CKNE (mới, thêm 01/10/2026)** | Repo `cncf/curriculum`, commit cuối 01/10/2026 | https://github.com/cncf/curriculum |
| LF | LFCS (Linux Foundation Certified System Administrator) | Trang chứng chỉ hiện hành | https://training.linuxfoundation.org/certification/linux-foundation-certified-sysadmin-lfcs/ |
| AWS | DevOps Engineer – Professional (DOP-C02): 6 domain và trọng số | Exam guide chính thức (bản tiếng Đức có bảng trọng số; chi tiết task của từng domain chưa đọc được bản chính thức, phần mô tả task dưới đây dựa trên tóm tắt bên thứ ba và cần đối chiếu lại) | https://docs.aws.amazon.com/de_de/aws-certification/latest/devops-engineer-professional-02/devops-engineer-professional-02.html, https://towardsthecloud.com/aws-devops-engineer-professional-exam-guide |
| AWS | Solutions Architect – Professional (SAP-C02): 4 domain, task chi tiết Domain 1 | Exam guide chính thức (có mục "Emerging topics" về AI) | https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.html |
| Google | Professional Cloud DevOps Engineer: 5 section | Exam guide PDF hiện hành (có Gemini, Cloud Deploy, fleets, FinOps) | https://cloud.google.com/learn/certification/cloud-devops-engineer, https://services.google.com/fh/files/misc/professional_cloud_devops_engineer_exam_guide_english.pdf |
| HashiCorp | Terraform Associate (004): 8 nhóm mục tiêu, kiểm Terraform 1.12 và HCP Terraform | Trang ôn tập chính thức | https://developer.hashicorp.com/terraform/tutorials/certification-004/associate-review-004 |
| DORA | Định nghĩa chỉ số delivery | Cập nhật 05/01/2026: 5 chỉ số (3 throughput, 2 instability) | https://dora.dev/guides/dora-metrics/ |
| Kubernetes | Ingress NGINX retirement | Blog 11/11/2025: bảo trì best-effort tới 03/2026 rồi ngừng | https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/, https://opensource.googleblog.com/2026/02/the-end-of-an-era-transitioning-away-from-ingress-nginx.html |
| Google SRE | *Site Reliability Engineering* và *The Site Reliability Workbook* (mục lục) | Bản online | https://sre.google/sre-book/table-of-contents/, https://sre.google/workbook/table-of-contents/ |
| CNCF TAG | Platforms White Paper, Platform Engineering Maturity Model v1 (5 khía cạnh: Investment, Adoption, Interfaces, Operations, Measurement) | © 2025 | https://tag-app-delivery.cncf.io/whitepapers/platforms/, https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/ |
| Giáo trình thực hành | DevOps Exercises (bregman-arie; ~84,8k sao, push cuối 27/12/2025; có thư mục `sre`, `chaos_engineering`, `kafka`, `databases`, `dns`, `security`) | GitHub | https://github.com/bregman-arie/devops-exercises |
| | SadServers: 96+ kịch bản sửa lỗi (Linux, web server Nginx/HAProxy/Envoy, database, Docker, Kubernetes, Terraform/Ansible, Vault, TLS) | Trang kịch bản | https://sadservers.com/scenarios |
| | KodeKloud DevOps learning path: 14 khoá (prereq → lập trình → Git → Jenkins → Docker → K8s → **Ansible** → Terraform → PCA → Loki → phỏng vấn) | Trang learning path | https://kodekloud.com/learning-path/devops |
| | Kubernetes The Hard Way: 13 lab, K8s v1.32, containerd 2.1, etcd 3.6, cần 4 máy (jumpbox + 3) | GitHub | https://github.com/kelseyhightower/kubernetes-the-hard-way |
| | 90DaysOfDevOps: 2022 (13 mảng: lập trình, Linux, mạng, cloud, Git, container, K8s, IaC, config management, CI/CD, monitoring, log, data management), 2023 (DevSecOps), 2024 (cộng đồng) | GitHub, push cuối 24/06/2026 | https://github.com/MichaelCade/90DaysOfDevOps |
| Sách | *The DevOps Handbook* (2nd ed., 2021), *Accelerate* (2018), *Team Topologies* | Không truy cập trực tiếp trong đợt này; dùng như khung khái niệm đã biết (Three Ways, capabilities, team types) | — |

## 2. Hiện trạng roadmap

Đếm từ `meta.json` (tôi đếm được **130 chủ đề**, không phải 133; có thể con số 133 tính cả mục khác):

| Cấp | Chặng | Chủ đề chính | `pick` | `opt` | Tổng |
|---|---|---|---|---|---|
| Nền tảng | D0 Lab, D1 Linux, D2 Mạng, D3 Scripting, D4 Git, D5 Văn hoá DevOps | 35 | 4 | 0 | 39 |
| Middle | D6 Container, D7 CI/CD, D8 Chuỗi cung ứng, D9 Cloud, D10 IaC, D11 K8s cốt lõi, D12 Observability | 41 | 4 | 6 | 51 |
| Senior | D13 Vận hành K8s, D14 GitOps, D15 DevSecOps, D16 Độ tin cậy, D17 Sao lưu/DR, D18 Service mesh (cả chặng tuỳ chọn), D19 Platform/FinOps (cả chặng tuỳ chọn) | 21 | 4 | 15 | 40 |

Bài đã có: chỉ D1.1 (đã kiểm chứng). Mọi chặng khác mới có khung chủ đề. Đây là thời điểm rẻ nhất để đổi cấu trúc.

## 3. Bảng phủ theo mảng kiến thức

Mức: **Đủ** (phủ đủ cho mục tiêu chặng), **Thiếu sâu** (có chủ đề nhưng chưa tới mức nguồn đòi), **Thiếu** (không có), **Thừa/đúng hướng** (Masteva đi xa hơn nguồn).

| Mảng | Masteva hiện có | Mức | Nguồn đòi hỏi (và đòi gì Masteva chưa có) |
|---|---|---|---|
| Linux vận hành | D1: FHS, quyền, tiến trình/signal, systemd, gói, đĩa/mount, theo dõi tài nguyên, chẩn đoán | Thiếu sâu | **LFCS**: tham số kernel (sysctl), SELinux, LVM, swap, automount, NFS/network block device, đồng bộ thời gian, cron/timer, giới hạn tài nguyên người dùng, ACL, LDAP, chứng chỉ SSL (25% Operations, 20% Storage). **roadmap.sh Linux**: boot loader, quá trình boot, cgroups, ulimits, LVM, inodes, swap, netfilter. **CKS**: AppArmor, seccomp, thu nhỏ bề mặt OS |
| Mạng nền tảng | D2: TCP/IP, IP/subnet/route, DNS, TCP/UDP, HTTP/TLS, firewall/NAT, Nginx/Caddy, LB/reverse proxy, SSH tunnel, công cụ | Đủ cho Nền tảng | roadmap.sh DevOps (OSI, DNS, HTTP/HTTPS, SSL/TLS, SSH, LB, reverse/forward proxy, caching server, firewall), LFCS (bridge, bonding, static route, reverse proxy/LB) |
| Mạng ở quy mô | Không có chặng | **Thiếu** | **CKNE** (toàn bộ đề: CNI, IPAM, kube-proxy và lựa chọn thay thế, tuỳ biến CoreDNS, Gateway API, egress gateway, service discovery xuyên cụm, mã hoá node/pod), **CKA** 20% Services and Networking (CoreDNS, Gateway API), **SAP-C02** Task 1.1 (kết nối nhiều VPC, on-prem, Direct Connect/VPN, transitive routing, hybrid DNS với Route 53 Resolver), **Google** 1.1 (Shared VPC, peering, Private Service Connect), **roadmap.sh Network Engineer** (BGP, anycast qua CDN, VXLAN, spine-leaf, HA/failover, VRRP) |
| Web server / proxy production | D2: chọn Nginx hoặc Caddy, LB/reverse proxy cơ bản | Thiếu sâu | **roadmap.sh DevOps**: Nginx, Apache, Tomcat, Caddy, Envoy, forward proxy, caching server, load balancer. **SadServers**: nhóm Web Servers (Nginx, Apache, HAProxy, Caddy, Gunicorn, HTTPS/TLS) là nhóm lớn. Chưa có: tuning (worker, keepalive, buffer, timeout), rate limit, cache, HTTP/2/3, TLS termination và xoay chứng chỉ, HAProxy/Envoy, health check và connection draining |
| PKI và chứng chỉ | D2 "HTTP và TLS" | Thiếu sâu | **LFCS** "Work with SSL certificates"; **CKNE** quản lý chứng chỉ TLS cho Gateway API; **CKS** Ingress với TLS; **roadmap.sh DevSecOps** certificate lifecycle, PKI design and failover; **SAP-C02** ACM, KMS. Chưa có: CA nội bộ, ACME/cert-manager, xoay và hết hạn chứng chỉ (lỗi production rất hay gặp, SadServers có kịch bản "Renew an SSL Certificate", "etcd SSL cert troubles") |
| Scripting | D3: Bash, pipe, grep/sed/awk, jq, `set -euo pipefail`, Python hoặc Go | Đủ | roadmap.sh DevOps/Linux, KodeKloud (Go, Python, Shell), Google 1.2 (Python, Go) |
| Git và cộng tác | D4: branch/merge/rebase, trunk-based, PR, commit sạch, GitHub/GitLab | Đủ | roadmap.sh DevOps, KodeKloud, LFCS (Git cơ bản) |
| Văn hoá và đo lường | D5: DevOps là gì, **bốn** chỉ số DORA, batch nhỏ, toil, SLI/SLO cơ bản | Đủ nhưng **lỗi thời một điểm** | **DORA** hiện có 5 chỉ số (thêm deployment rework rate; MTTR đổi thành failed deployment recovery time). **CNPA** "DORA Metrics for Platform Initiatives". *Accelerate*, *DevOps Handbook*. Masteva đi xa hơn roadmap.sh (roadmap.sh không có mục này) |
| Container | D6: image/layer, Dockerfile tốt, registry/tag, volume/network, Compose, quét lỗ hổng, Podman (opt) | Đủ, thiếu phần bên dưới | **roadmap.sh Docker**: namespaces, cgroups, union filesystem, OCI, runtime security. **CKA**: CRI. **KCSA**: container runtime. **CKS**: base image tối thiểu, sandboxed container. Chưa có: namespaces/cgroups, OCI/containerd/CRI, distroless, rootless |
| CI/CD | D7: pipeline, artifact/versioning, môi trường và thăng cấp, rolling/blue-green/canary, công cụ, migration DB, feature flag (opt) | Đủ cho Middle, thiếu phần tổ chức | **Google** 1.3–1.4, Section 2 (25%): Cloud Deploy, Artifact Registry, Packer, môi trường tạm (ephemeral), bảo mật pipeline, secrets trong pipeline. **DOP-C02** Domain 1 (22%). **CNPE** 25% GitOps and CD (Tekton, Flagger). Chưa có: OIDC từ CI vào cloud (không khoá tĩnh), runner tự quản ở quy mô, cache build, môi trường preview, continuous testing |
| Chuỗi cung ứng | D8: kho artifact, ký, SBOM, quét phụ thuộc, SLSA (opt) | Đủ, nhưng đặt sớm | **CKS** 20% Supply Chain Security (registry được phép, ký và xác minh, SBOM, phân tích tĩnh Kubesec/KubeLinter); **KCSA**; **Google** 2.4. Các nguồn coi đây là mức Specialist, không phải mức người mới vào CI/CD |
| Cloud cốt lõi | D9: chọn AWS/GCP/Azure, IAM, VPC, VM/container service, storage và DB được quản lý, chi phí, serverless (opt) | Đủ cho Middle | **roadmap.sh AWS** (IAM, VPC, EC2, S3, ELB, Route 53, CloudFront, RDS, ECS/EKS, CloudWatch, purchasing options, quotas) |
| Cloud ở quy mô tổ chức | Không có | **Thiếu** | **SAP-C02** Domain 1 (26%): Organizations, Control Tower, multi-account governance, central logging, IAM Identity Center, federation với IdP ngoài, chia sẻ tài nguyên; **Google** Section 1 (~20%): resource hierarchy, org policy, Shared VPC, multi-project logging, service account; **DOP-C02** Domain 2, 6 (StackSets, SCP, Config, Security Hub) |
| Identity cho người và máy | D9 IAM, D11 RBAC/ServiceAccount, D15 quyền tối thiểu | Thiếu sâu | **SAP-C02** 1.2 (cross-account, IdP ngoài); **Google** 1.1 (service account); **CKS** "least-privilege IAM", hạn chế truy cập API server; **CNPE** RBAC xuyên nền tảng. Chưa có: SSO/OIDC cho người (đăng nhập cloud và `kubectl` qua IdP), workload identity (IRSA/EKS Pod Identity, GKE Workload Identity), OIDC federation từ GitHub Actions, SPIFFE/SPIRE (mức khái niệm), break-glass |
| IaC cốt lõi | D10: khai báo/mệnh lệnh, Terraform/OpenTofu, provider/resource/state, module và môi trường, drift/import, Pulumi/CFN (opt), Ansible (opt) | Đủ cho Middle | **Terraform Associate 004** mục 1–7 |
| IaC ở quy mô | Không có | **Thiếu** | **roadmap.sh Terraform**: remote state, state locking, best practices for state, splitting large state, scaling Terraform, Terragrunt, CI/CD integration, testing (unit, contract, integration, e2e), Checkov/TFLint/Trivy/KICS/Terrascan, Infracost, Sentinel/compliance; **TA-004** mục 6 (backend, locking) và 8 (HCP workspaces, projects, governance); **Google** 1.2 (Config Connector, blueprints); **CNPE/CNPA** "Infrastructure Provisioning with Kubernetes" (Crossplane) |
| Quản lý cấu hình máy | D10 Ansible (opt) | **Thiếu** | **DOP-C02** Domain 2 "Configuration Management and IaC" (17%: SSM, patch, State Manager); **roadmap.sh DevOps** Configuration Management (Ansible, Chef, Puppet, Salt); **KodeKloud** path có "Ansible for Beginners" là khoá bắt buộc; **90DaysOfDevOps** có mảng riêng; **Google** 1.3 (Packer); **LFCS** quản lý gói, patch. Chưa có: Ansible cốt lõi, golden image bằng Packer, patch management cho fleet VM |
| Kubernetes cốt lõi | D11: kiến trúc, Pod/Deployment/RS, Service/DNS, Ingress/Gateway API, ConfigMap/Secret, request/limit/QoS, probe, volume/PV, Job/CronJob/StatefulSet/DaemonSet, RBAC/SA, NetworkPolicy | Gần đủ (CKAD) | **CKAD v1.37**: multi-container pod (sidecar, init), Helm và **Kustomize**, API deprecation, SecurityContext/capabilities, quota, CRD/Operator, admission control. Thiếu: multi-container pattern, ResourceQuota/LimitRange, SecurityContext, `kubectl debug`, API deprecation. Cần đổi trọng tâm sang Gateway API (Ingress NGINX đã ngừng) |
| Vận hành Kubernetes | D13: kubeadm/managed, nâng cấp, etcd, affinity/taint, Helm **hoặc** Kustomize, HPA/VPA/CA, CRD/Operator, chẩn đoán | Thiếu sâu | **CKA v1.35**: HA control plane, **Helm và Kustomize** để cài thành phần cụm, CNI/CSI/CRI, StorageClass và dynamic provisioning, access mode, reclaim policy, troubleshooting 30%. **roadmap.sh K8s**: pod priority, eviction, topology spread, quota cho namespace, custom scheduler, CSI driver, multi-cluster. **KTHW**: dựng từ PKI tới route mạng pod. Chưa có: HA control plane, PDB, priority/preemption, topology spread, multi-tenancy, Karpenter/KEDA |
| Storage và stateful | D1 đĩa/mount, D9 storage được quản lý, D11 volume/PV, D13 CRD/Operator | **Thiếu** | **CKA** 10% Storage; **LFCS** 20% Storage (LVM, NFS, network block device, hiệu năng storage); **roadmap.sh K8s** stateful applications, CSI drivers; **SAP-C02** storage types; **CNPE** "best practices for networking, storage, compute". Chưa có: block/file/object, StorageClass/CSI, snapshot, Rook/Ceph hoặc Longhorn, object storage tự vận hành, operator cho PostgreSQL (CloudNativePG) và Kafka (Strimzi), khi nào **không** nên chạy DB trên K8s |
| Packaging cho K8s | D13 pick Helm/Kustomize | Thiếu sâu | **CKA**, **CKAD** đòi cả Helm và Kustomize; **roadmap.sh K8s** Helm charts. Chưa có: tự viết chart (template, values schema, library chart, test chart, chart trong OCI registry), khi nào chọn Kustomize |
| Observability | D12: log/metric/trace, Prometheus/PromQL, Grafana, Loki/ELK, OTel Collector, RED/USE, alert theo triệu chứng | Đủ cho Middle, thiếu phần quy mô | **PCA**: histogram, rate, recording/alert rule, **Alertmanager**, exporter, instrumentation, đặt tên metric, giới hạn của Prometheus; **OTCA**: SDK, context propagation, Collector scaling và pipeline; **Google** 4.1 (tối ưu log: lọc, sampling, chi phí), 4.4 (trace). Chưa có: cardinality, lưu trữ dài hạn (Thanos/Mimir), backend trace (Tempo/Jaeger), pipeline log (Fluent Bit/Vector), synthetic/blackbox, profiling liên tục, chi phí telemetry |
| GitOps | D14: nguyên tắc, Argo CD/Flux, cấu trúc repo, Argo Rollouts (opt) | Thiếu sâu | **CGOA** 4 domain đều 25% (fundamentals, principles, tooling, **security & observability**); **CAPA** (Workflows, CD, Rollouts, Events); **CNPE** 25% (progressive delivery). Chưa có: secret trong GitOps (SOPS, Sealed Secrets, ESO; roadmap.sh DevOps liệt kê cả ba), thăng cấp giữa môi trường, ApplicationSet đa cụm |
| Release engineering | D7 versioning, môi trường, chiến lược deploy; D14 Argo Rollouts (opt) | **Thiếu** (không thành mảng) | **SRE book** ch.8 Release Engineering; **SRE Workbook** ch.16 Canarying Releases; **Google** 3.3 rollback; **CNPE** progressive delivery; **DOP-C02** Domain 1. Chưa có: release branch và hotfix, release train, semver và changelog tự động, canary có phân tích tự động, rollback vs roll-forward, đóng băng thay đổi, change management |
| DevSecOps | D15: Vault/KMS/ESO, quyền tối thiểu, quét image và IaC, PSS, audit log, OPA/Kyverno (opt) | Thiếu sâu | **CKS**: CIS benchmark, bảo vệ node metadata, xác minh binary, sandbox (gVisor/Kata), AppArmor/seccomp, phát hiện hành vi (Falco), container bất biến, mã hoá pod-to-pod; **KCSA**: threat model, 4C, compliance frameworks; **CNPE**: policy engine và admission controller (core), audit trail, compliance report; **roadmap.sh DevSecOps**: threat modeling (STRIDE, PASTA), SIEM, IR, zero trust, network segmentation, CSPM, DDoS, automated patching; **SAP-C02** Security Hub, Inspector, Access Analyzer |
| Compliance | Không có | **Thiếu** | **KCSA** 10% Compliance and Security Frameworks; **roadmap.sh DevSecOps** ISO 27001, SOC 2, NIST, audit compliance mapping; **CNPE** compliance report; **DOP-C02** Domain 6 (17%). Với dự án Neobank: yêu cầu ngành ngân hàng và luật dữ liệu cá nhân của Việt Nam (cần nghiên cứu riêng, chưa kiểm chứng trong đợt này) |
| Reliability / SRE | D16: SLO và error budget, alert và on-call, xử lý sự cố, postmortem, kế hoạch dung lượng, quá tải và lỗi dây chuyền, chaos (opt) | Đúng hướng, quá nén | **Google** Section 3 (~18%); **SRE book** (SLO, toil, monitoring, on-call, troubleshooting, emergency response, managing incidents, postmortem, handling overload, cascading failure, launch); **SRE Workbook** (SLO engineering, alerting on SLOs, on-call, incident response, managing load, error budget policy mẫu). roadmap.sh không có. Chưa có: error budget policy, production readiness review / launch checklist, đo tải |
| Quản lý sự cố | D16 "Xử lý sự cố", "Postmortem" | Thiếu sâu | **DOP-C02** Domain 5 Incident and Event Response (14%); **Google** 3.3 (draining/redirect, thêm capacity, rollback); **CNPA** Incident Response; **SRE book** ch.12–15. Chưa có: vai trò incident commander, mức nghiêm trọng, giao tiếp và trang trạng thái, runbook/playbook, game day, sức khoẻ on-call |
| Hiệu năng và load test | D16 "Kế hoạch dung lượng" | **Thiếu** | **Google** Section 5 (~12%: thu thập thông tin hiệu năng, FinOps); **SRE Workbook** ch.11 Managing Load; **DOP-C02** Domain 3. Roadmap Spring Boot SB12 đã có k6 cho ứng dụng; DevOps chưa có load test hạ tầng (LB, autoscaling, DB) |
| Kiểm thử hạ tầng | Không có | **Thiếu** | **roadmap.sh Terraform**: testing modules, unit/contract/integration/e2e testing; **CKS**: Kubesec, KubeLinter; **CNPE**: compliance check trong pipeline. Công cụ: `terraform test`, Terratest, conftest, kubeconform, chart-testing, Molecule |
| Sao lưu và DR | D17: RPO/RTO, sao lưu DB, diễn tập, sao lưu tài nguyên cụm (opt), đa vùng (opt) | Thiếu sâu | **SAP-C02** 1.3: chiến lược DR (backup-restore, pilot light, warm standby, multi-site), tự phục hồi; **DOP-C02** Domain 3; **CKA** sao lưu etcd (D13 đã có). Đa vùng không nên là tuỳ chọn ở cấp Senior của hệ thống lớn |
| Multi-cluster / fleet | Không có | **Thiếu** | **roadmap.sh K8s** multi-cluster management; **Google** 1.4 (quản lý GKE ở quy mô doanh nghiệp bằng fleet, vá và nâng cấp an toàn); **CKNE** service discovery và LB xuyên cụm; **CAPA/CGOA** (ApplicationSet) |
| Service mesh | D18 (cả chặng opt): sidecar/ambient, mTLS, điều phối lưu lượng, Istio/Linkerd, eBPF/Cilium | Đủ cho tuỳ chọn | **ICA** (cài đặt và nâng cấp canary, traffic 35%, bảo mật 25%, troubleshooting 20%); **CCA**; **CKS** mã hoá pod-to-pod. Cilium/eBPF nên chuyển về mạng K8s cốt lõi (CNI), không chỉ là phụ kiện mesh |
| Platform engineering | D19 (opt): IDP, golden path, Backstage | Thiếu, và sai mức | **CNPA** (36% core fundamentals, platform API, IDP, đo nền tảng); **CNPE** (25% Platform APIs and Self-Service: CRD tự thiết kế, operator, Crossplane; 15% kiến trúc; 20% vận hành); **CBA**; **CNCF Maturity Model**; *Team Topologies* (platform team). Chưa có: platform API bằng CRD/Crossplane, multi-tenancy, đo hiệu quả nền tảng |
| FinOps | D9 "Theo dõi chi phí", D19 (opt) tag và phân bổ, rightsizing/spot | Thiếu sâu, sai mức | **Google** 5.2 FinOps; **SAP-C02** 1.5 (tag chiến lược, purchasing options, Compute Optimizer); **CNPE** (OpenCost, right-sizing, multi-tenancy). Chưa có: chi phí Kubernetes theo namespace/team (OpenCost), showback/chargeback, unit economics, chi phí truyền dữ liệu |
| AI cho vận hành và hạ tầng AI | Không có (có phần "Khi làm cùng AI" ở mỗi bài theo chuẩn) | Thiếu, ưu tiên thấp | **Google** 1.5 (Gemini Code/Cloud Assist, Gemini CLI); **CNPA** AI/ML in platform automation; **CKNE** "Optimizing LLM traffic"; **SAP-C02** emerging topics (guardrails, AgentCore Identity) |
| Email, DNS cho email | Không có | Thiếu, ưu tiên thấp | **roadmap.sh DevOps**: SMTP, IMAP, POP3S, SPF, DKIM, DMARC; **roadmap.sh AWS** SES. Hệ thống gửi thông báo (Hub hội thoại, Neobank) cần SPF/DKIM/DMARC đúng |

**Những mục roadmap.sh DevOps có mà Masteva cố ý không cần:** liệt kê nhiều nhà cung cấp (Heroku, Netlify, Vercel, Hetzner, Contabo…), nhiều OS (FreeBSD, Windows), nhiều công cụ cùng loại (Chef, Puppet, Salt; Splunk, Graylog, Papertrail; TeamCity, Buildkite, Octopus). Cách "pick" một công cụ đại diện của Masteva hợp lý hơn.

## 4. Mảng thiếu hoặc quá mỏng, xếp theo mức quan trọng

Tiêu chí xếp: (a) người làm hạ tầng ở công ty có hệ thống lớn gặp hằng tuần; (b) số nguồn độc lập đòi hỏi, đặc biệt nguồn Professional/Specialist; (c) không học thì gây sự cố lớn hoặc chặn việc lên Senior.

### P0: thiếu thì chưa thể gọi là "dựng hạ tầng cho hệ thống lớn"

| # | Mảng | Vì sao quan trọng | Nguồn | Đề xuất |
|---|---|---|---|---|
| 1 | **Cloud ở quy mô tổ chức**: landing zone, multi-account/multi-project, OU và SCP/org policy, central logging, account vending, mạng hub-and-spoke (Transit Gateway/Shared VPC), private endpoint, hybrid DNS, kết nối on-prem (VPN/Direct Connect mức khái niệm) | Công ty lớn không chạy trong một account; mọi quyết định IAM, mạng, chi phí, audit bắt đầu từ cấu trúc account. Đây là domain lớn nhất của SAP-C02 | SAP-C02 D1 (26%), Google S1 (~20%), DOP-C02 D2, D6 | Chặng Senior mới "Cloud ở quy mô tổ chức" |
| 2 | **Identity cho người và máy**: SSO/OIDC cho người (cloud console, `kubectl`), workload identity (IRSA/Pod Identity, GKE WI), OIDC từ CI vào cloud thay khoá tĩnh, rotation, break-glass | Khoá tĩnh bị lộ là nguyên nhân sự cố bảo mật phổ biến; chuẩn hiện nay là không có long-lived credential | SAP-C02 1.2, Google 1.1, CKS, CNPE | Phần cốt lõi trong chặng Cloud tổ chức; OIDC từ CI đưa vào D7 |
| 3 | **Networking ở quy mô**: LB L4/L7 (cloud NLB/ALB, HAProxy/Envoy), health check, connection draining, DNS ở quy mô (TTL, cache, split-horizon, CoreDNS/`ndots`, NodeLocal DNSCache), CDN và cache, anycast/BGP mức khái niệm, CNI và IPAM, kube-proxy (iptables/IPVS/eBPF), egress, MTU | Phần lớn sự cố "chập chờn" ở hệ thống lớn là mạng và DNS; CNCF vừa ra hẳn một chứng chỉ (CKNE) cho mảng này | CKNE (toàn đề), CKA 20%, SAP-C02 1.1, Google 1.1, LFCS 25%, roadmap.sh Network Engineer | Chặng Senior mới "Mạng ở quy mô"; chuyển Cilium/eBPF từ D18 về đây |
| 4 | **IaC ở quy mô**: remote state và locking, chia state theo blast radius, layout repo nhiều account/môi trường, Terragrunt hoặc Terraform Stacks, plan/apply qua PR (Atlantis/HCP Terraform), policy as code (OPA/conftest, Sentinel), kiểm thử (`terraform test`, Terratest), Infracost, Crossplane mức giới thiệu | Một team Terraform nhiều người không có các thứ này sẽ khoá state, apply đè nhau, drift | roadmap.sh Terraform (≈25 mục liên quan), TA-004 mục 6, 8, DOP-C02 D2, Google 1.2, CNPE | Chặng Senior mới "IaC ở quy mô"; đưa remote state/locking vào D10 |
| 5 | **Storage và workload stateful**: block/file/object, StorageClass/CSI, snapshot, Rook/Ceph hoặc Longhorn (on-prem), object storage tự vận hành, operator cho PostgreSQL (CloudNativePG) và Kafka (Strimzi), tiêu chí "DB trên K8s hay dịch vụ quản lý" | Hệ thống lớn gần như luôn có dữ liệu; mất dữ liệu là sự cố nặng nhất | CKA 10%, LFCS 20%, roadmap.sh K8s, SAP-C02, CNPE | Chặng Senior mới "Storage và dữ liệu trên Kubernetes" (nối với D17) |
| 6 | **Vận hành cụm K8s đủ mức CKA**: HA control plane, CNI/CSI/CRI, PDB, priority/preemption, topology spread, ResourceQuota/LimitRange, multi-tenancy, API deprecation, cả Helm lẫn Kustomize | Đây là chuẩn tối thiểu của người vận hành cụm; hiện D13 thiếu khoảng một nửa | CKA v1.35, CKAD v1.37, roadmap.sh K8s, KTHW | Tách D13 thành hai chặng (mục 5) |
| 7 | **Quản lý sự cố**: incident commander, severity, kênh liên lạc và status page, runbook, giảm thiểu trước khi sửa (drain, rollback, thêm capacity), game day | Ở công ty lớn, quy trình sự cố quyết định thời gian khôi phục nhiều hơn kỹ thuật | DOP-C02 D5 (14%), Google 3.3, CNPA, SRE book ch.12–15 | Tách khỏi D16 thành chặng riêng |

### P1: cần cho Senior thực chiến

| # | Mảng | Nguồn | Đề xuất |
|---|---|---|---|
| 8 | **Quản lý cấu hình máy**: Ansible cốt lõi (inventory, role, idempotency, vault), golden image bằng Packer, patch management cho fleet VM | DOP-C02 D2, roadmap.sh DevOps, KodeKloud, 90DaysOfDevOps, Google 1.3, LFCS | Chặng Middle mới; Ansible bỏ `opt` |
| 9 | **Đóng gói ứng dụng cho K8s**: tự viết Helm chart (template, values schema, library chart, test, OCI registry), Kustomize overlay | CKA, CKAD, roadmap.sh K8s | Chuyển ra khỏi lựa chọn `pick`, thành phần chính trong chặng đóng gói/GitOps |
| 10 | **Release engineering và progressive delivery**: release branch/hotfix, semver và changelog tự động, canary có phân tích tự động (Argo Rollouts/Flagger), rollback vs roll-forward, change freeze | SRE book ch.8, Workbook ch.16, CNPE 25%, Google 3.3, DOP-C02 D1 | Gộp với D14 GitOps thành "GitOps và phát hành" |
| 11 | **Hiệu năng và load test hạ tầng**: k6/Locust ở mức hệ thống, kiểm autoscaling, tìm nút thắt ở LB/DB, capacity model | Google S5, SRE Workbook ch.11, DOP-C02 D3 | Tách từ D16 thành "Dung lượng và hiệu năng", dùng chung kỹ thuật k6 của SB12 |
| 12 | **Observability ở quy mô**: Alertmanager (route, inhibit, silence), recording rule, histogram, cardinality, lưu trữ dài hạn (Thanos/Mimir), backend trace, pipeline log (Fluent Bit/Vector), sampling và chi phí telemetry, SLO-based alerting | PCA, OTCA, Google 4.1–4.4, SRE Workbook | Tách D12 thành phần Middle (một ứng dụng) và phần Senior (quy mô) |
| 13 | **Bảo mật runtime và hardening**: CIS benchmark (kube-bench), Falco, AppArmor/seccomp, sandbox runtime, bảo vệ metadata endpoint, CSPM (Security Hub/SCC), WAF và DDoS, threat modeling | CKS, KCSA, roadmap.sh DevSecOps, SAP-C02 1.2 | Mở rộng D15; tách nếu quá to |
| 14 | **Compliance và audit**: ánh xạ control (ISO 27001, SOC 2, PCI DSS mức khái niệm), audit trail, bằng chứng tự động, policy engine là cốt lõi | KCSA, CNPE, roadmap.sh DevSecOps, DOP-C02 D6 | Một chủ đề chính trong DevSecOps; Kyverno/Gatekeeper bỏ `opt` |
| 15 | **Multi-cluster/fleet**: lý do có nhiều cụm, ApplicationSet, nâng cấp theo đợt (canary cluster), service discovery xuyên cụm | roadmap.sh K8s, Google 1.4, CKNE, CAPA | Chủ đề trong "Mạng ở quy mô" và "GitOps"; hoặc chặng nhỏ Senior |
| 16 | **Linux nâng cao**: boot, sysctl và tuning mạng (somaxconn, conntrack, ulimit), LVM/RAID/NFS, SELinux/AppArmor, đồng bộ thời gian, cron/systemd timer, namespaces/cgroups, công cụ hiệu năng (perf, strace, bpftrace) | LFCS, roadmap.sh Linux, CKS, SadServers | Bổ sung vào D1 hoặc thêm chặng "Linux nâng cao" ở Middle |
| 17 | **Web server/proxy production**: tuning Nginx, HAProxy hoặc Envoy, TLS termination, cert-manager/ACME, rate limit, cache | roadmap.sh DevOps, SadServers, LFCS, CKNE | Nằm trong chặng "Mạng ở quy mô" hoặc chặng Middle "Reverse proxy và TLS ở production" |
| 18 | **Kiểm thử hạ tầng**: lint, unit, policy test, integration test cho Terraform, Helm, Ansible | roadmap.sh Terraform, CKS (KubeLinter, Kubesec), CNPE | Chủ đề trong IaC ở quy mô và trong chặng đóng gói |

### P2: nên có, có thể để tuỳ chọn

| # | Mảng | Nguồn | Ghi chú |
|---|---|---|---|
| 19 | Platform engineering cốt lõi (platform API bằng CRD/Crossplane, self-service, đo nền tảng) | CNPA, CNPE, CNCF Maturity Model, Team Topologies | Nên bỏ `optional` ở cấp chặng, giữ Backstage là tuỳ chọn |
| 20 | FinOps cho Kubernetes và cloud (OpenCost, showback, commitment, unit cost) | Google 5.2, SAP-C02 1.5, CNPE | Phần tag và rightsizing nên là cốt lõi |
| 21 | Vận hành database (PostgreSQL HA, PgBouncer, replication, nâng cấp major) | DevOps Exercises (`databases`), SadServers (nhóm Databases) | Trùng với nhu cầu dữ liệu của Java/Spring; phối hợp, tránh viết hai lần |
| 22 | Hạ tầng cho AI (GPU, Dynamic Resource Allocation, gateway cho LLM) | CKNE, Google 1.5, CNPA, SAP-C02 emerging | Tuỳ chọn; theo dõi vì CNCF đã đưa vào đề |
| 23 | DNS cho email (SPF, DKIM, DMARC) | roadmap.sh DevOps, roadmap.sh AWS | Một chủ đề nhỏ trong D2 hoặc mạng |
| 24 | Event-driven automation và workflow (Argo Workflows/Events, EventBridge, tự khắc phục) | CAPA, DOP-C02 D5 | Tuỳ chọn trong platform |

## 5. Thứ tự và phân cấp

### 5.1 Vấn đề của cấu trúc hiện tại

| Vấn đề | Chi tiết | Hệ quả |
|---|---|---|
| Tiên quyết tuyến tính | Mỗi `meta.json` khai `prerequisites` là chặng liền trước: D9 Cloud đòi D8 Chuỗi cung ứng, D11 K8s đòi D10 IaC, D15 DevSecOps đòi D14 GitOps, D18 mesh đòi D17 DR | Người học không thể đi theo nhu cầu công việc; gợi ý sai về phụ thuộc kiến thức. Nên chuyển sang đồ thị (DAG): ví dụ D11 đòi D6, D2; D10 đòi D9; D14 đòi D11, D7 |
| D5 Văn hoá ở Nền tảng | DORA, batch nhỏ, luồng giá trị được học khi người học chưa có pipeline nào; "SLI/SLO cơ bản" lặp với D16 | Kiến thức trừu tượng, khó tự kiểm chứng. Nên giữ phần "DevOps là gì" ngắn ở đầu (có thể nhập vào D0), đưa DORA/luồng giá trị ra sau D7 CI/CD; SLI/SLO để ở D12/D16 |
| Container ở Middle | D0 đã cài Docker và kind; roadmap.sh DevOps Beginner, KodeKloud, 90DaysOfDevOps đều coi container là nền tảng | Nên chuyển D6 lên Nền tảng; mục tiêu cấp Nền tảng đổi thành "Tự vận hành một máy Linux và đóng gói ứng dụng bằng container" |
| D8 Chuỗi cung ứng đặt sớm | Ký artifact, SBOM, SLSA là nội dung mức CKS (Specialist) | Kho artifact và quét phụ thuộc gộp vào D6/D7; ký, SBOM, SLSA, admission xác minh chữ ký lùi về Senior cạnh D15 |
| Middle quá tải, Senior quá mỏng | Middle 51 chủ đề (Cloud, IaC, K8s, Observability cùng một cấp); Senior 21 chủ đề chính | Ngược với mục tiêu "hệ thống lớn". Senior cần nhận các chặng mới ở mục 4 (P0) |
| D11 quá to | 11 chủ đề, ứng với cả đề CKAD | Tách: "K8s: workload và cấu hình" (pod, deployment, job, statefulset, configmap/secret, probe, resource, multi-container) và "K8s: mạng, lưu trữ, quyền" (service, CoreDNS, Gateway API, PV/StorageClass, RBAC, SecurityContext, NetworkPolicy) |
| D13 trộn bốn mảng | Vòng đời cụm, scheduling, đóng gói, autoscaling, mở rộng API | Tách: "Vận hành cụm" (kubeadm HA, nâng cấp, etcd, CNI/CSI/CRI, node, chẩn đoán) và "Scheduling, autoscaling, multi-tenancy" (affinity, taint, PDB, priority, quota, HPA/VPA/CA/Karpenter, KEDA). Helm/Kustomize và CRD/Operator chuyển sang chặng đóng gói và chặng platform |
| D16 trộn ba mảng | SLO, sự cố, dung lượng, quá tải, chaos | Tách: "SLO và alerting", "Quản lý sự cố và on-call", "Dung lượng, hiệu năng, quá tải" |
| D14 và D17 quá nhỏ | D14: 4 chủ đề; D17: 3 chính | D14 gộp với release engineering và progressive delivery; D17 mở rộng chiến lược DR, đa vùng thành chính |
| D18, D19 tuỳ chọn cả chặng | Platform engineering và FinOps có hai chứng chỉ CNCF riêng, chiếm 12% đề Google | Giữ D18 tuỳ chọn (mesh không phải hệ thống nào cũng cần); D19 chuyển thành cốt lõi, chỉ Backstage là tuỳ chọn |

### 5.2 Hiệu chỉnh cấp theo chứng chỉ (chỉ để định cỡ)

| Mức chuẩn | Chứng chỉ tương ứng | Masteva hiện tại | Nên là |
|---|---|---|---|
| Nhập môn | KCNA, LFCS (một phần), Terraform Associate (một phần) | D0–D5 + D6, D9, D10 | Nền tảng + đầu Middle |
| Thực hành | CKAD, CKA, PCA, OTCA, Terraform Associate | D11, D12 (Middle), D13 (Senior) | Middle (CKA là chuẩn của người vận hành cụm, không phải Senior) |
| Chuyên sâu, quy mô | CKS, CKNE, CNPE, AWS DOP-C02, AWS SAP-C02, Google Pro DevOps, ICA/CCA | D15–D19, phần lớn tuỳ chọn | Senior; đây là nơi Masteva đang thiếu nhiều nhất |

### 5.3 Ba phương án cấu trúc

| Phương án | Mô tả | Được | Mất |
|---|---|---|---|
| A. Giữ một roadmap, mở rộng | Thêm 7–8 chặng (mục 4, P0/P1), tách D11, D13, D16 | Một lộ trình liền mạch | Roadmap lên khoảng 27–28 chặng, dài hơn Java + Spring cộng lại; Senior rất dài |
| **B. Tách roadmap Kubernetes (đề xuất cân nhắc)** | Roadmap "Kubernetes" (khoảng 8–9 chặng: cốt lõi workload, mạng/lưu trữ/quyền, đóng gói Helm/Kustomize, vận hành cụm, scheduling/autoscaling, mạng cụm sâu với CNI/Gateway API/Cilium, stateful và operator, bảo mật cụm, multi-cluster; mesh tuỳ chọn). DevOps giữ Linux, mạng, scripting, Git, container, CI/CD, cloud, IaC, config management, observability, GitOps và phát hành, cloud tổ chức, IaC ở quy mô, DevSecOps, SRE, sự cố, DR, platform/FinOps (khoảng 20–22 chặng). Nối nhau bằng `recommended` | Khớp cách roadmap.sh tách (DevOps, Kubernetes, Linux, Terraform, Docker, AWS là các roadmap riêng) và trục chứng chỉ KCNA → CKAD → CKA → CKS/CKNE; mỗi roadmap vừa sức; cùng tiền lệ Spring Boot | Thêm việc chuyển chặng (mã hiển thị đổi, **mã chặng, chủ đề, URL giữ nguyên** như lần tách Spring Boot) |
| C. Thêm cấp thứ tư | Thêm cấp "Staff/Platform" sau Senior | Ít đổi cấu trúc | Schema roadmap đang giả định 3 cấp; tên cấp không khớp các roadmap khác |

### 5.4 Khung tham khảo nếu chọn phương án A (một roadmap)

Mã mới là giả định, gán khi làm; chặng cũ giữ mã định danh.

| Cấp | Chặng (thứ tự) |
|---|---|
| Nền tảng: "Tự vận hành một máy Linux và đóng gói ứng dụng bằng container" | D0 Lab (thêm "DevOps là gì" ngắn) · D1 Linux · D2 Mạng · D3 Scripting · D4 Git · D6 Container (thêm namespaces/cgroups, OCI, kho artifact) |
| Middle: "Đưa ứng dụng lên production trên cloud và Kubernetes" | D7 CI/CD (thêm OIDC vào cloud, môi trường preview) · D5 Đo lường delivery (5 chỉ số DORA, luồng giá trị) · **Quản lý cấu hình máy** (Ansible, Packer, patch) · **Reverse proxy, TLS và chứng chỉ ở production** · D9 Cloud · D10 IaC (thêm remote state, locking) · D11a K8s workload và cấu hình · D11b K8s mạng, lưu trữ, quyền · **Đóng gói cho K8s** (Helm chart tự viết, Kustomize) · D12 Observability |
| Senior: "Vận hành ở quy mô, an toàn, đáng tin cậy" | D13a Vận hành cụm · D13b Scheduling, autoscaling, multi-tenancy · **Mạng ở quy mô** (gồm CNI/Cilium, DNS, LB L4/L7, CDN, egress, đa cụm) · **Storage và dữ liệu trên K8s** · D14 GitOps và phát hành (progressive delivery chính) · **Cloud ở quy mô tổ chức** (landing zone, identity) · **IaC ở quy mô** (policy as code, kiểm thử) · D8 + D15 Chuỗi cung ứng và DevSecOps (runtime, compliance) · D16a SLO và alerting (observability ở quy mô) · D16b Quản lý sự cố và on-call · D16c Dung lượng, hiệu năng, load test · D17 Sao lưu và DR (chiến lược DR, đa vùng chính) · D19 Platform engineering và FinOps (chính) · D18 Service mesh (tuỳ chọn) |

### 5.5 Sửa nhỏ, làm được ngay dù chọn phương án nào

| Chặng | Sửa | Lý do / nguồn |
|---|---|---|
| D5 | "Bốn chỉ số DORA" → "Năm chỉ số DORA" (thêm deployment rework rate; failed deployment recovery time thay MTTR) | https://dora.dev/guides/dora-metrics/ (cập nhật 05/01/2026) |
| D11 | Đặt Gateway API làm chính, Ingress là API cũ bị đóng băng; không dạy ingress-nginx làm controller mặc định trong lab | Kubernetes blog 11/11/2025; CKA v1.35 và CKNE đều có Gateway API |
| D13 | Helm **và** Kustomize (bỏ `pick`) | CKA v1.35 "Use Helm and Kustomize to install cluster components"; CKAD v1.37 có cả hai |
| D10 | Ansible bỏ `opt` (hoặc chuyển thành chặng riêng) | DOP-C02 D2, roadmap.sh, KodeKloud |
| D14 | Argo Rollouts thành chính dưới dạng `pick` Argo Rollouts/Flagger | CNPE 25% (progressive delivery), CAPA |
| D15 | OPA Gatekeeper/Kyverno thành chính | CNPE, KCSA (admission control), CKS |
| D17 | "Đa vùng" thành chính với nội dung chiến lược DR (backup-restore, pilot light, warm standby, active-active) | SAP-C02 1.3, DOP-C02 D3 |
| D18 → mạng | "eBPF và Cilium" chuyển về chặng mạng K8s | CKNE, CCA, CKS (mã hoá pod-to-pod) |
| D19 | Bỏ `optional` của chặng; Backstage giữ tuỳ chọn | CNPA, CNPE, Google 5.2 |
| D0 | Lab cần tối thiểu 3–4 VM cho HA control plane và mạng nhiều node (KTHW dùng 4 máy); ghi rõ yêu cầu RAM trên Mac | KTHW, CKA |

## 6. Lưu ý về lab và chi phí

- Nhiều chủ đề P0 (landing zone, multi-account, workload identity trên cloud, LB cloud) **cần tài khoản cloud thật**, có chi phí. Cần một chiến lược lab: budget alert, dọn dẹp tự động bằng IaC, ưu tiên dịch vụ có free tier, và phần chạy được trên máy (kind nhiều node, Cilium, MetalLB, Rook/Longhorn, RustFS thay MinIO như lab SB10 đã làm).
- Đề CKNE, CKS và Google Pro đều là bài thực hành; đây là bằng chứng các mảng trên **làm được thành lab**, khớp giá trị "thực chiến" của Masteva.
- SadServers và DevOps Exercises là mẫu tốt cho phần `<Practice>`/`<Mastery>`: kịch bản sự cố có trạng thái hỏng sẵn để người học sửa.

## 7. Giới hạn của báo cáo

- Chi tiết task của DOP-C02 lấy từ tóm tắt bên thứ ba; trọng số domain lấy từ exam guide chính thức. Nên đọc lại bản chính thức trước khi trích chi tiết.
- Không đánh giá thị trường tuyển dụng Việt Nam (on-prem, cloud nội địa như Viettel, FPT, VNG, CMC) vì ngoài góc này. Nếu nhiều công ty lớn trong nước chạy on-prem/bare-metal, mức ưu tiên của Ansible, kubeadm HA, MetalLB, Ceph/Rook, HAProxy/keepalived sẽ **tăng** so với xếp hạng ở mục 4 (giả định, cần kiểm chứng).
- Yêu cầu tuân thủ của ngành ngân hàng và luật dữ liệu cá nhân Việt Nam (liên quan dự án Neobank) chưa được nghiên cứu trong đợt này.
- Sách (*DevOps Handbook*, *Accelerate*, *Team Topologies*) dùng như khung khái niệm, không truy cập lại trong đợt này.
