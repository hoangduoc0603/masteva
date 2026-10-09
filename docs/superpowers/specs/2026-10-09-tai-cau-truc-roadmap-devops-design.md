# Tái cấu trúc roadmap DevOps và tách roadmap Kubernetes (đợt 1)

Ngày: 09/10/2026. Trạng thái: **chờ người dùng duyệt spec**. Thực hiện phương án B trong [devops-content-review.md](../../devops-content-review.md), đợt 1: đổi cấu trúc, chưa viết bài.

## 1. Mục tiêu và phạm vi

- Roadmap DevOps đủ sâu tới "dựng và vận hành hạ tầng cho hệ thống lớn": thêm các mảng còn thiếu (thay đổi an toàn, dữ liệu stateful, observability ở quy mô, cloud ở quy mô tổ chức, blast radius, sự cố, tuân thủ), cân bằng on-prem và AWS.
- Kubernetes thành roadmap riêng, ba cấp theo trục KCNA/CKAD → CKA → CKS/CKNE.
- Người học **không mất tiến độ**: mã chặng cũ, URL bài D1.1, mã mục giữ nguyên; chủ đề đổi chỗ có mã thay thế trong `replacements`.
- Mọi chặng có khung đầy đủ (tên, chủ đề, tiền điều kiện), chưa có bài, như các chặng khung của Spring Boot đợt 1.

Ngoài phạm vi: viết bài; tóm tắt và tài liệu của chủ đề (viết cùng bài ở các đợt sau, như Spring Boot đợt 2–3, để người viết bài chọn tài liệu sát nội dung); milestone capstone mới cho Neobank và Hub-chat (làm ở đợt capstone).

## 2. Quyết định đã chốt với người dùng

| Câu hỏi | Lựa chọn |
|---|---|
| Phương án | B: tách roadmap Kubernetes |
| Trọng số on-prem và AWS | Gần ngang nhau |
| Bài cần AWS thật | Người dùng tự tạo tài khoản AWS lab (Free plan); budget alarm 5 và 10 USD; capstone đa region hỏi lại sau |
| Máy tham chiếu | 16 GB, mỗi bài ghi thêm profile 8 GB |

Quyết định của spec này (người dùng có thể đổi khi duyệt):

| Câu hỏi | Chọn | Lý do |
|---|---|---|
| Mã hiển thị Kubernetes | `K1`…`K11` | Ngắn; regex không khớp nhầm "K8s", "K3s" vì có chữ liền sau |
| id chặng mới của DevOps | `d20`…`d27` (số kế tiếp) | id đã dùng `d0`–`d19`; mã hiển thị D8, D17… đã thuộc chặng khác. Lệch giữa id và mã hiển thị đã có tiền lệ (`j14` hiện là J11) |
| id chặng mới của Kubernetes | Theo mã lúc tạo: `k2`, `k3`, `k5`…`k10` | Như `sb2` của Spring Boot |
| Đánh số lại mã hiển thị DevOps | Có, D0–D24 theo thứ tự mới | Mới có một bài (D1.1), chỉ 49 chỗ nhắc mã trong `content/` |
| Tóm tắt và tài liệu chủ đề | Viết cùng bài ở đợt sau | Đổi so với mục 4 của bản đánh giá; tránh viết hai lần |

## 3. Roadmap DevOps sau tái cấu trúc

`content/roadmaps/devops.json`: giữ id `devops`, track `devops`. Tiêu đề "DevOps, từ một máy Linux tới hạ tầng cho hệ thống lớn". Mô tả "Tự vận hành máy chủ và mạng, đưa ứng dụng lên production trên máy chủ riêng và AWS, rồi vận hành hệ thống lớn: thay đổi an toàn, dữ liệu, sự cố, DR và nền tảng nội bộ." `recommended`: `[]`.

Mục tiêu cấp:
- Nền tảng: "Tự vận hành máy Linux, mạng và đóng gói ứng dụng bằng container."
- Middle: "Đưa ứng dụng lên production trên máy chủ riêng và AWS. Học song song Kubernetes K1–K3."
- Senior: "Vận hành hệ thống lớn: an toàn, đáng tin cậy, ở quy mô."

Ký hiệu chủ đề: mặc định core; `[pick]` chọn một trong các công cụ; `[opt]` tuỳ chọn. ⟵ là mã cũ được thay (thêm vào `replacements`). "giữ" là chủ đề hiện có, không đổi mã.

### 3.1 Nền tảng

| Mã | id | Chặng | Tiền điều kiện | Chủ đề |
|---|---|---|---|---|
| D0 | d0 | Dựng phòng lab | — | giữ 5 chủ đề (kind/k3d `[pick]`) |
| D1 | d1 | Linux | d0 | giữ 8; thêm: `d1.kernel-sysctl-cgroups` Kernel, sysctl, namespace và cgroup · `d1.lvm-raid` LVM và RAID · `d1.apparmor-selinux` AppArmor và SELinux cơ bản |
| D2 | d2 | Mạng | d1 | giữ 10 (nginx/caddy `[pick]`); thêm: `d2.dns-van-hanh` DNS khi vận hành: TTL, cache, split-horizon · `d2.vlan-bonding` VLAN, bonding và mạng máy chủ |
| D3 | d3 | Scripting | d1 | giữ 6 |
| D4 | d4 | Git và cộng tác | d0 | giữ 5 |
| D5 | d6 | Container | d1 | giữ 7 (podman `[opt]`); thêm: `d6.namespace-cgroup-oci` Container dưới lớp vỏ: namespace, cgroup, OCI |

### 3.2 Middle

| Mã | id | Chặng | Tiền điều kiện | Chủ đề |
|---|---|---|---|---|
| D6 | d7 | CI/CD | d4, d6 | giữ 7, `d7.feature-flag` thành core; thêm: `d7.oidc-vao-cloud` OIDC từ pipeline vào cloud thay khoá tĩnh · `d7.bao-ve-pipeline` Bảo vệ pipeline: ghim action theo SHA, quyền token tối thiểu · `d7.runner-tu-host` Runner tự host · `d7.moi-truong-preview` Môi trường preview `[opt]` |
| D7 | d5 | Đo lường delivery | d7 | giữ 4; `d5.chi-so-dora` Năm chỉ số DORA ⟵ `d5.bon-chi-so-dora` |
| D8 | **d20** | Quản lý cấu hình máy (mới) | d2, d3 | `d20.ansible-co-ban` Ansible: inventory, module, playbook ⟵ `d10.ansible` · `d20.ansible-role-collection` Role và collection · `d20.idempotent-kiem-thu` Idempotent, check mode và kiểm thử với Molecule · `d20.ansible-vault` Bí mật trong Ansible · `d20.packer-golden-image` Golden image với Packer · `d20.va-os-theo-dot` Vá hệ điều hành theo đợt · `d20.awx-semaphore` AWX hoặc Semaphore `[opt]` |
| D9 | **d21** | Proxy, load balancer và TLS ở production (mới) | d2 | `d21.nginx-production` Nginx trên production: worker, keepalive, buffer, giới hạn tốc độ · `d21.haproxy` HAProxy: L4, L7 và health check · `d21.keepalived-vip` Keepalived và VIP · `d21.tls-production` TLS trên production: ACME, OCSP, cipher, xoay chứng chỉ · `d21.pki-noi-bo` PKI và CA nội bộ · `d21.cdn-waf` CDN và WAF · `d21.envoy` Envoy `[opt]` |
| D10 | d9 | Cloud: AWS | d2 | giữ 7 (`d9.aws-gcp-azure` đổi tên "AWS, đối chiếu GCP và Azure", bỏ `[pick]`; serverless `[opt]`); thêm: `d9.region-az-failure-domain` Region, AZ và failure domain · `d9.load-balancer-cloud` Load balancer trên cloud (ALB, NLB) · `d9.hybrid-vpn` Kết nối hybrid: VPN và Direct Connect · `d9.du-lieu-trong-nuoc` Dữ liệu trong nước: Local Zone Hà Nội và cloud nội địa · `d9.openstack-khai-niem` Private cloud: OpenStack ở mức khái niệm `[opt]` |
| D11 | d10 | Infrastructure as Code | d3, d6 | giữ 6 (bỏ `d10.ansible`, chuyển sang d20); thêm: `d10.remote-state-locking` Remote state và locking · `d10.kiem-thu-iac` Kiểm thử và review IaC |
| D12 | d12 | Observability | d6 | giữ 7 (loki/elk `[pick]`); thêm: `d12.alertmanager-routing` Alertmanager: route, nhóm, silence · `d12.log-tap-trung-luu-tru` Log tập trung và thời gian lưu |

### 3.3 Senior

| Mã | id | Chặng | Tiền điều kiện | Chủ đề |
|---|---|---|---|---|
| D13 | d14 | GitOps và thay đổi an toàn | d7, d11 | giữ 4, `d14.argo-rollouts` thành core; thêm: `d14.thang-cap-moi-truong` Thăng cấp giữa môi trường · `d14.wave-bake-time` Triển khai theo wave và bake time · `d14.config-la-thay-doi` Config và dữ liệu điều khiển cũng là thay đổi · `d14.kill-switch-rollback` Kill switch và rollback hai chiều |
| D14 | d8 | Chuỗi cung ứng phần mềm | d7 | giữ 5, `d8.slsa` thành core; thêm: `d8.vu-tan-cong-that` Các vụ tấn công chuỗi cung ứng thật |
| D15 | d15 | DevSecOps và identity | d9, d11 | giữ 6, `d15.opa-gatekeeper-kyverno` thành core; thêm: `d15.workload-identity` Workload identity · `d15.truy-cap-nguoi` Truy cập của người: SSO, JIT, break-glass, bastion · `d15.phan-vung-mang` Phân vùng mạng và tách môi trường · `d15.spiffe-spire` SPIFFE và SPIRE `[opt]` |
| D16 | d16 | SLO, alerting và observability ở quy mô | d12 | `d16.slo-error-budget` giữ · `d16.alert-burn-rate` Alert theo burn rate ⟵ `d16.alert-on-call` · `d16.metric-dai-han` Metric dài hạn và nhiều cụm · `d16.cardinality` Cardinality · `d16.tail-sampling` Tail sampling và Collector nhiều tầng · `d16.chi-phi-log` Chi phí và vòng đời log · `d16.meta-monitoring` Giám sát hệ thống giám sát · `d16.profiling-lien-tuc` Continuous profiling `[opt]` |
| D17 | **d22** | Sự cố và on-call (mới) | d16 | `d22.quy-trinh-su-co` Quy trình xử lý sự cố ⟵ `d16.xu-ly-su-co` · `d22.vai-tro-giao-tiep` Vai trò và giao tiếp trong sự cố · `d22.on-call-ben-vung` On-call bền vững · `d22.runbook-tu-dong-hoa` Runbook và tự động hoá · `d22.postmortem-khong-do-loi` Postmortem không đổ lỗi ⟵ `d16.postmortem-khong-do-loi` · `d22.game-day` Game day và chaos engineering ⟵ `d16.chaos-engineering` |
| D18 | **d23** | Dung lượng, hiệu năng và quá tải (mới) | d12 | `d23.ke-hoach-dung-luong` Kế hoạch dung lượng ⟵ `d16.ke-hoach-dung-luong` · `d23.qua-tai-loi-day-chuyen` Quá tải và lỗi dây chuyền ⟵ `d16.qua-tai-loi-day-chuyen` · `d23.load-test-ca-he` Load test cả hệ thống · `d23.load-shedding-bien` Load shedding ở biên · `d23.hieu-nang-os-mang` Hiệu năng ở tầng hệ điều hành và mạng |
| D19 | **d24** | Vận hành dữ liệu stateful (mới) | d12, k7 | `d24.postgres-ha` PostgreSQL HA với operator · `d24.pooling-replication-lag` Connection pooling và replication lag · `d24.pitr-kiem-tra-khoi-phuc` PITR và kiểm tra khôi phục tự động · `d24.migration-lon` Backfill và migration lớn · `d24.kafka-ops` Vận hành Kafka · `d24.cache-ops` Vận hành cache · `d24.database-dat-o-dau` Database trên Kubernetes, VM hay dịch vụ quản lý |
| D20 | d17 | Sao lưu và DR | d24 | giữ 5, `d17.sao-luu-tai-nguyen-cum` và `d17.da-vung` thành core; thêm: `d17.chien-luoc-dr` Chiến lược DR: từ backup tới active-active · `d17.hai-site` Hai site và yêu cầu DR của ngân hàng · `d17.failover-failback` Failover và failback |
| D21 | **d25** | Giới hạn blast radius (mới) | d17 | `d25.failure-domain` Failure domain · `d25.kien-truc-cell` Kiến trúc cell · `d25.shuffle-sharding` Shuffle sharding · `d25.static-stability` Static stability · `d25.rut-traffic` Rút traffic khỏi AZ hoặc cell · `d25.phu-thuoc-toan-cau` Phụ thuộc ẩn vào dịch vụ toàn cầu |
| D22 | **d26** | Cloud ở quy mô tổ chức (mới) | d9, d10, d15 | `d26.landing-zone` Landing zone · `d26.organizations-scp` AWS Organizations và SCP · `d26.identity-center` IAM Identity Center và SSO · `d26.mang-hub-spoke` Mạng hub-and-spoke và DNS hybrid · `d26.iac-o-quy-mo` IaC ở quy mô: tách state, Terragrunt, Atlantis · `d26.policy-as-code` Policy as code · `d26.egress-chi-phi-mang` Egress và chi phí mạng |
| D23 | d19 | Platform engineering và FinOps | d14 | Bỏ `optional` của chặng; 4 chủ đề cũ thành core, `d19.backstage` giữ `[opt]`; thêm: `d19.nen-tang-la-san-pham` Nền tảng là sản phẩm và maturity model · `d19.crossplane` API nền tảng với Crossplane · `d19.unit-economics` Unit economics và FOCUS |
| D24 | **d27** | Tuân thủ cho kỹ sư (mới) | d15, d17 | `d27.quy-dinh-viet-nam` Luật An ninh mạng 2025, Nghị định 333/2026, Luật BVDLCN 2025 · `d27.cap-do-an-toan` Cấp độ an toàn hệ thống thông tin · `d27.ngan-hang-tt09` An toàn hệ thống ngân hàng theo TT 09/2020 · `d27.soc2-iso27001` SOC 2 và ISO 27001 cho kỹ sư · `d27.pci-dss` PCI DSS · `d27.bang-chung-tu-dong` Bằng chứng tuân thủ tự động · `d27.quan-ly-thay-doi` Quản lý thay đổi và tách quyền |

## 4. Roadmap Kubernetes mới

`content/roadmaps/kubernetes.json`: id `kubernetes`, area `devops`, track `kubernetes` (mới). Tiêu đề "Kubernetes, từ pod đầu tiên tới vận hành nhiều cụm". Mô tả "Chạy ứng dụng trên Kubernetes, tự dựng và vận hành cụm on-prem hoặc trên cloud, rồi bảo mật, mở rộng và quản lý nhiều cụm." `recommended`: `["d6"]` (Container).

Mục tiêu cấp:
- Nền tảng: "Chạy và cấu hình ứng dụng trên Kubernetes."
- Middle: "Tự dựng, vận hành và mở rộng một cụm."
- Senior: "Bảo mật, mở rộng API và vận hành nhiều cụm."

| Cấp | Mã | id | Chặng | Tiền điều kiện | Chủ đề |
|---|---|---|---|---|---|
| Nền tảng | K1 | d11 | Kiến trúc và workload | d6 | giữ 6: kiến trúc cụm, pod/deployment, configmap/secret, request/limit, probe, job/cronjob/statefulset/daemonset; thêm: `d11.multi-container` Pod nhiều container và sidecar |
| | K2 | **k2** | Mạng, lưu trữ và quyền | d11, d2 | `k2.service-dns` ⟵ `d11.service-dns-cum` · `k2.gateway-api` Gateway API và Ingress cũ ⟵ `d11.ingress-gateway-api` · `k2.persistent-volume` ⟵ `d11.volume-persistentvolume` · `k2.rbac-serviceaccount` ⟵ `d11.rbac-serviceaccount` · `k2.networkpolicy` ⟵ `d11.networkpolicy` · `k2.security-context` SecurityContext |
| | K3 | **k3** | Đóng gói: Helm và Kustomize | k2 | `k3.helm-dung-chart` Dùng chart có sẵn · `k3.helm-viet-chart` Tự viết Helm chart ⟵ `d13.helm-kustomize` · `k3.kustomize-overlay` Kustomize và overlay · `k3.chart-oci` Phát hành chart qua OCI registry |
| Middle | K4 | d13 | Dựng và vận hành cụm | k3 | giữ 4: kubeadm/dịch vụ quản lý `[pick]`, nâng cấp cụm, sao lưu etcd, chẩn đoán sự cố; thêm: `d13.ha-control-plane` Control plane HA với HAProxy và Keepalived · `d13.metallb` LoadBalancer trên bare metal với MetalLB · `d13.chung-chi-cum` Chứng chỉ của cụm · `d13.vong-doi-node` Vòng đời node: drain, vá, image bất biến · `d13.rancher` Quản lý cụm bằng Rancher `[opt]` |
| | K5 | **k5** | Scheduling, autoscaling và multi-tenancy | d13 | `k5.affinity-taint` ⟵ `d13.affinity-taint-toleration` · `k5.topology-spread-pdb` Topology spread và PodDisruptionBudget · `k5.priority-preemption` Priority và preemption · `k5.quota-limitrange` ResourceQuota và LimitRange · `k5.hpa-vpa-autoscaler` ⟵ `d13.hpa-vpa-cluster-autoscaler` · `k5.keda` Scale theo sự kiện với KEDA · `k5.multi-tenancy` Multi-tenancy: namespace, Capsule, vCluster · `k5.karpenter` Karpenter `[opt]` |
| | K6 | **k6** | Mạng cụm chuyên sâu | d13 | `k6.cni-cilium` CNI, eBPF và Cilium ⟵ `d18.ebpf-cilium` · `k6.kube-proxy-dataplane` kube-proxy và data plane · `k6.gateway-api-nang-cao` Gateway API nâng cao · `k6.cert-manager` cert-manager · `k6.external-dns` external-dns · `k6.egress` Kiểm soát egress · `k6.coredns-quy-mo` CoreDNS ở quy mô |
| | K7 | **k7** | Lưu trữ và workload stateful | d13 | `k7.csi-storageclass` CSI và StorageClass · `k7.longhorn` Longhorn · `k7.rook-ceph` Rook và Ceph · `k7.snapshot` Snapshot và clone · `k7.operator-database` Operator quản lý database thế nào |
| Senior | K8 | **k8** | Bảo mật cụm | d13 | `k8.pod-security-admission` Pod Security Admission · `k8.admission-policy` Admission policy: ValidatingAdmissionPolicy và Kyverno · `k8.seccomp-apparmor` seccomp và AppArmor · `k8.runtime-falco` Phát hiện tấn công lúc chạy với Falco · `k8.xac-minh-image` Xác minh chữ ký image khi triển khai · `k8.audit-log` Audit log của cụm · `k8.cis-benchmark` CIS benchmark |
| | K9 | **k9** | Mở rộng Kubernetes | k3 | `k9.crd` CRD ⟵ `d13.crd-operator` · `k9.controller` Controller và vòng reconcile · `k9.viet-operator` Tự viết operator · `k9.dung-operator` Chọn và vận hành operator có sẵn |
| | K10 | **k10** | Nhiều cụm và fleet | d13, d14 | `k10.vi-sao-nhieu-cum` Khi nào cần nhiều cụm · `k10.cluster-api` Cluster API · `k10.gitops-nhieu-cum` GitOps cho nhiều cụm · `k10.failover-giua-cum` Failover giữa các cụm · `k10.chinh-sach-fleet` Chính sách chung cho fleet |
| | K11 | d18 | Service mesh | k6 | Giữ `optional`; giữ 4: sidecar/ambient, mTLS, điều phối lưu lượng, Istio/Linkerd (`d18.ebpf-cilium` chuyển sang K6) |

## 5. Không đổi

- id chặng cũ `d0`–`d19`, URL `/vi/learn/d1/d1-1`, mã mục `d1.1.*`, mã chủ đề không có trong danh sách ⟵.
- `recommended` của Microservices (`j11`, `j12`, `d6`, `d7`) và `needs` của hai dự án (`d6`, `d7`, `d11`, `d12`, `d15`, `d16`, `d17`): vẫn đúng vì trỏ theo id. `hub-chat.modular-k8s` cần `d11` nay là K1 thuộc roadmap Kubernetes, vẫn hợp lý.
- `content/ids.lock.json`: chỉ thêm chủ đề mới và 18 cặp `replacements` (mục 3, 4).

## 6. Đổi mã hiển thị trong nội dung

| Cũ | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D13 | D14 | D17 | D18 | D19 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mới | D7 | D5 | D6 | D14 | D10 | D11 | K1 | K4 | D13 | D20 | K11 | D23 |

D0–D4, D12, D15, D16 giữ mã. Thay một lượt bằng regex nguyên từ như lần tách Spring Boot (kể cả dạng `D1.1`). Sau khi thay, đọc lại từng chỗ trong 49 chỗ: câu nhắc nội dung đã đổi chỗ phải trỏ đúng chặng mới (ví dụ "D11 dạy Ingress" thành "K2"; "D16 dạy postmortem" thành "D17").

## 7. Thay đổi code

| Chỗ | Thay đổi |
|---|---|
| `src/lib/content/constants.ts` | Thêm `kubernetes` vào `TRACKS` |
| `src/lib/content/manifest.ts` | `ROADMAP_ORDER`: `java`, `spring-boot`, `devops`, `kubernetes`, `microservices` |
| `src/lib/content/validate.ts` | `CODE_REF` thêm `K`: `\b(J|SB|D|M|K)(\d{1,2})(?:\.(\d+))?\b`; test cho "K8s", "K3s" không bị bắt |
| Màu track `kubernetes` | Xanh dương (gần màu nhận diện Kubernetes). Chọn giá trị sáng và tối sao cho chữ trên chip đạt ≥ 4,5 : 1 ở cả hai theme; thêm vào `tokens.css` (cả `design/`), `global.css`, `roadmap.css` (cả `design/`), `lesson.css` như track `spring` |
| `messages/vi.json`, `en.json` | `tracks.kubernetes`: "Kubernetes" |
| **Đồng bộ tiến độ tài khoản** | `replacements` lần đầu khác rỗng. Lỗi đã biết trong `status.md`: chưa áp `replacements` khi gộp tiến độ khách và trước bước so thời điểm trong `applyRemote`. Phải sửa trong đợt này (TDD trong `src/lib/progress`), nếu không, dòng có mã cũ kéo từ server về sẽ hiện lại chủ đề cũ |
| Tự có, không cần code | Trang `/<lang>/roadmaps/kubernetes`, thẻ trang chủ, tìm kiếm, ô chọn roadmap ở thanh bên bài học |

## 8. Kiểm thử

- Unit (TDD): `CODE_REF` với `K`; áp `replacements` trong luồng đồng bộ tài khoản (gộp khách, `applyRemote`).
- Cập nhật E2E: số thẻ trang chủ (4 thành 5), số chặng DevOps (20 thành 25), test nhắc mã cũ.
- E2E mới: `/vi/roadmaps/kubernetes` có 3 cấp, 11 chặng; tiến độ có chủ đề `d11.networkpolicy` đặt "đã biết" hiện thành `k2.networkpolicy` sau khi tải.
- `pnpm verify`; xem bằng mắt trang chủ, hai trang roadmap, khung chi tiết chủ đề, thanh bên ở hai theme.

## 9. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Người học đã đặt "Tôi đã biết cấp" ở DevOps | Tiến độ cấp lưu theo roadmap; cấp Middle/Senior của DevOps đổi nội dung. Chấp nhận, ghi trong `status.md` (giống lần tách Spring Boot) |
| Chủ đề tách sang roadmap khác làm mất đánh dấu "đã biết" | `replacements` + sửa đồng bộ ở mục 7; E2E kiểm |
| Khung quá lớn (36 chặng, khoảng 230 chủ đề), viết bài kéo dài | Viết theo đợt 4 chặng, ưu tiên Nền tảng và Middle trước (mục 4 của bản đánh giá) |
| Tên quy định pháp luật còn chuyển tiếp | Chặng D24 ghi ngày kiểm tra văn bản khi viết bài |
