# Chiến lược lab cho roadmap DevOps của Masteva

Ngày nghiên cứu: 09/10/2026. Phạm vi: chỉ đọc repo, đo nhẹ trên máy có sẵn, tra giá công khai. Không cài phần mềm, không tạo tài nguyên cloud.

Quy ước độ tin cậy trong báo cáo:

- **[đo]**: số đo thật trên máy của người sáng lập hôm nay.
- **[nguồn]**: lấy từ trang chính thức, có URL ở cuối mục.
- **[ước lượng]**: suy ra từ cấu hình mặc định hoặc kinh nghiệm, **phải đo lại khi viết bài**.

---

## 0. Kết luận ngắn

1. **Khoảng 85–90% chủ đề DevOps (D0–D19) làm được hoàn toàn trên laptop**, không tốn tiền. Chỉ D9 Cloud là bắt buộc cần cloud thật để học đúng (IAM thật, VPC, database được quản lý, theo dõi chi phí). Các phần cloud khác (EKS ở D13, KMS ở D15, đa vùng ở D17, spot/tag chi phí ở D19) nên là **bài tuỳ chọn có chi phí**.
2. **Cụm kind 1 control plane + 2 worker rất nhẹ khi rảnh**: tạo trong 35 giây, tổng khoảng 1,0 GiB RAM [đo]. Thứ làm nặng máy là add-on (observability, mesh, Backstage), không phải số node.
3. **Ngưỡng an toàn cho máy 8 GB**: Docker/VM dùng tối đa khoảng 4 GB, mỗi lúc chỉ chạy một môi trường (hoặc VM Lima, hoặc kind), stack observability thu gọn. Máy 16 GB chạy đủ mọi lab trừ Backstage cùng lúc với cụm đầy đủ.
4. **Không dựa vào LocalStack làm đường chính.** Từ 23/03/2026 bản community không còn: repo GitHub đã archive, image mới bắt buộc tài khoản và auth token; gói Hobby miễn phí chỉ cho dùng phi thương mại và **không có IAM enforcement, RDS, EKS** [nguồn]. Giả lập cloud chỉ dùng để dạy cú pháp SDK/Terraform cho S3, SQS, DynamoDB, Lambda, không dạy được IAM hay mạng.
5. **Terraform/OpenTofu dạy được trọn D10 trên provider local** (docker, kind, kubernetes, helm, local, random, tls, null) cộng backend state trên PostgreSQL hoặc object storage tương thích S3 chạy local. Chỉ module "VPC thật" phải để sang bài cloud.
6. **Chi phí một bài cloud làm trong 2 giờ rất thấp (0,1–1 USD)**; rủi ro thật là **quên xoá**: một lab EKS bị bỏ quên một tháng tốn khoảng 180 USD. Chiến lược chi phí phải xoay quanh việc huỷ tài nguyên, không phải chọn loại máy rẻ.
7. **AWS Free plan mới (từ 15/07/2025)** là lựa chọn an toàn nhất cho người học: tới 200 USD credit, không bị tính tiền trừ khi tự nâng cấp, tài khoản tự đóng sau 6 tháng hoặc khi hết credit [nguồn]. GCP có 300 USD trong 90 ngày, cũng không tự tính tiền [nguồn].

---

## 1. Môi trường và số đo trên máy hiện tại

### 1.1 Công cụ có sẵn (chỉ kiểm, không cài)

| Công cụ | Có? | Phiên bản |
|---|---|---|
| Lima (`limactl`) | Có | 2.2.0; VM `ubuntu` (vz, aarch64, 2 CPU, 2 GiB, 20 GiB, Ubuntu 26.04), đang dừng |
| Docker | Có | Docker Desktop, Engine 29.8.0 arm64; VM 6 CPU, 7,75 GiB |
| kind | Có | v0.33.0 (node image `kindest/node:v1.37.0` đã có sẵn trong cache) |
| kubectl | Có | v1.37.1 (Kustomize v5.8.1) |
| helm | Có | v4.3.0 |
| aws CLI | Có | 2.25.8 |
| vagrant | Có | 2.4.1 (không hữu ích trên Apple Silicon khi thiếu provider VM phù hợp) |
| k3d, terraform, tofu, ansible, minikube, colima, podman, multipass, gcloud, az, localstack | Không | – |

Lúc đo, Docker đang chạy 5 container Supabase local (khoảng 245 MiB tổng). Hệ thống còn khoảng 33% RAM trống.

### 1.2 Đo cụm kind 1 control plane + 2 worker [đo]

Cấu hình: `kind create cluster --name dr-probe` với 3 node (1 `control-plane`, 2 `worker`), image `kindest/node:v1.37.0` đã có trong cache. Cụm đã xoá ngay sau khi đo; kiểm lại không còn container, cluster hay context `dr-probe`.

| Chỉ số | Kết quả |
|---|---|
| Thời gian `kind create` (tới khi control plane Ready) | **35 giây** |
| Thêm thời gian để cả 3 node và mọi pod hệ thống Ready | 2 giây |
| Số pod hệ thống | 13 |
| RAM control plane khi rảnh (6 lần lấy mẫu) | 727–730 MiB |
| RAM mỗi worker khi rảnh | 134–138 MiB |
| **Tổng RAM cụm 1+2 khi rảnh** | **khoảng 1,0 GiB** |
| CPU khi rảnh | control plane 15–23% một nhân; worker 1–9% một nhân |
| Thời gian `kind delete` | 1 giây |
| Kernel / runtime trong node | 7.0.12-linuxkit (arm64), containerd 2.3.4, Debian 13 |

Nhận xét:

- Chi phí chính là control plane (etcd, API server, controller manager, scheduler, CoreDNS). **Thêm worker gần như miễn phí** (khoảng 135 MiB), nên dạy multi-node (affinity, taint, DaemonSet, drain) trên kind 1+2 là hợp lý ngay cả với máy 8 GB.
- Lần đầu người học phải kéo image node (khoảng 1,3 GB sau giải nén), thời gian tạo cụm lần đầu sẽ dài hơn nhiều so với 35 giây; bài D0 nên ghi rõ.
- Mỗi node kind thấy toàn bộ 6 CPU của VM Docker (`Allocatable cpu: 6`), không phải tài nguyên riêng. Bài về request/limit (D11) cần nói rõ điều này để người học không hiểu sai "node có 6 CPU".
- `kubectl top` báo "Metrics API not available": kind không có metrics-server sẵn. HPA (D13) và `kubectl top` (D11) cần cài metrics-server với `--kubelet-insecure-tls`.
- Không đo Lima (VM `ubuntu` của người dùng đang dừng, giữ nguyên trạng). Không đo k3d vì chưa cài.

---

## 2. Từng chặng D0–D19: local hay cloud?

Ký hiệu cột "Laptop": **Đủ** (làm trọn trên laptop), **Gần đủ** (một phần nhỏ cần cloud hoặc mô phỏng), **Cloud** (cần cloud thật để học đúng).

RAM ghi là phần **thêm vào** ngoài macOS/Windows và trình duyệt. Hai cột "8 GB" và "16 GB" là cấu hình đề xuất cho máy người học.

| Chặng | Công cụ lab đề xuất | RAM/CPU ước tính | Máy 8 GB | Máy 16 GB | Laptop |
|---|---|---|---|---|---|
| D0 Dựng phòng lab | Lima (VM Ubuntu), Docker Desktop/Colima/OrbStack, kind (k3d là lựa chọn), kubectl, helm | VM 2 vCPU/2 GB; Docker VM 4 GB | Docker 4 GB, không chạy VM và kind cùng lúc | Docker 6–8 GB, VM 2–4 GB | Đủ |
| D1 Linux | VM Lima (đã làm ở D1.1) | 2 vCPU/2 GB | Như nhau | Như nhau | Đủ |
| D2 Mạng | VM Lima, network namespace, container; Nginx/Caddy; `tcpdump`, `dig`, `ss`. Firewall/NAT/LB thật: 2–3 VM Lima nối bằng mạng `user-v2`, hoặc netns trong một VM | 1 VM 2 GB hoặc 3 VM × 1 GB | Dùng netns/container trong 1 VM | 3 VM nhỏ được | Đủ. TLS công khai (Let's Encrypt) cần tên miền và IP công khai, thay bằng CA nội bộ (`mkcert`, Caddy internal CA, `step-ca`) |
| D3 Scripting | Bash, jq, Python/Go trong VM hoặc trên Mac | Không đáng kể | – | – | Đủ |
| D4 Git | Git local, GitHub/GitLab miễn phí (PR, review, branch protection) | Không đáng kể | – | – | Đủ (cần tài khoản GitHub miễn phí) |
| D5 Văn hoá, DORA | Tính 4 chỉ số DORA từ `git log`, GitHub API, lịch sử deploy của lab D7 | Không đáng kể | – | – | Đủ |
| D6 Container | Docker, Compose, `docker buildx` (multi-arch), Trivy/Grype; Podman tuỳ chọn | 1–3 GB khi build | Build từng image | – | Đủ |
| D7 CI/CD | GitHub Actions trên repo public (miễn phí) deploy vào kind qua runner tự host trên máy, **hoặc** Gitea + act_runner/Woodpecker/Jenkins trong Docker; migration DB bằng Flyway/Atlas với PostgreSQL container | Jenkins ~1 GB; Gitea + runner ~0,5 GB; kind ~1 GB | Gitea/GitHub, không dùng Jenkins | Bất kỳ | Đủ |
| D8 Chuỗi cung ứng | Registry local (`registry:2`, Zot; Harbor nặng ~2–4 GB), cosign (khoá local; keyless dùng Sigstore công khai miễn phí qua GitHub OIDC), Syft SBOM, Grype/Trivy, SLSA provenance bằng GitHub Actions | 0,2–0,5 GB (Harbor 2–4 GB) | Zot/`registry:2`, không Harbor | Harbor được | Đủ |
| **D9 Cloud** | AWS (hoặc GCP/Azure): IAM, VPC/subnet/SG, EC2, ECS/Fargate hoặc App Runner, RDS, S3, Budgets/Cost Explorer; Lambda tuỳ chọn | Chạy trên cloud | – | – | **Cloud**. Giả lập (MiniStack/Floci/Moto) chỉ dùng để luyện CLI/SDK trước khi lên cloud |
| D10 IaC | OpenTofu hoặc Terraform với provider docker, kind, kubernetes, helm, local, random, tls, null; state trên backend `pg` (PostgreSQL container) hoặc `s3` trỏ object storage local; Ansible vào VM Lima | 1–2 GB (kind + PG) | Như nhau | – | Gần đủ. Module VPC/EC2 thật dùng chung bài D9 |
| D11 Kubernetes cốt lõi | kind 1+2; Gateway API với Envoy Gateway/Traefik/NGINX Gateway Fabric (**không dạy ingress-nginx**, đã ngừng bảo trì từ 03/2026); metrics-server; `cloud-provider-kind` cho Service `LoadBalancer`; NetworkPolicy dùng kindnet (có hỗ trợ) hoặc Calico | ~1 GB [đo] + 0,3 GB add-on | kind 1+2 | kind 1+2 | Đủ |
| D12 Observability | kube-prometheus-stack, Grafana, Loki (single binary), OpenTelemetry Collector, Tempo (monolithic) tuỳ chọn. ELK là nhánh "pick" nặng | Prometheus stack 1–1,5 GB; Loki 0,2–0,4 GB; OTel 0,1 GB; Tempo 0,2–0,3 GB; ELK ~3 GB [ước lượng] | kind 1 node, retention ngắn, tắt Alertmanager/Tempo khi không dùng, chọn Loki thay ELK | kind 1+2, đủ stack | Đủ |
| D13 Vận hành Kubernetes | kubeadm trên VM Lima (cài, nâng cấp, sao lưu etcd); Helm/Kustomize; HPA + metrics-server; VPA; cluster autoscaler mô phỏng bằng provider **KWOK** (node giả); CRD/Operator (Kubebuilder/Operator SDK) | kubeadm: CP 2 vCPU/2 GB (yêu cầu chính thức) + mỗi worker 1–1,5 GB | 1 CP + 1 worker (~3,5 GB), tắt Docker Desktop khi làm | 1 CP + 2 worker (~5 GB) | Gần đủ. Cluster autoscaler thật và "dịch vụ quản lý" (EKS/GKE/AKS) là bài cloud tuỳ chọn |
| D14 GitOps | Argo CD hoặc Flux trên kind, repo GitHub hoặc Gitea local; Argo Rollouts tuỳ chọn | Argo CD 0,4–0,8 GB; Flux 0,15–0,3 GB [ước lượng] | Flux, hoặc Argo CD bản core | Argo CD đủ | Đủ |
| D15 DevSecOps | OpenBao/Vault (dev mode hoặc 1 node), External Secrets Operator; RBAC, Pod Security Admission, audit log của API server (kind cho cấu hình kubeadm patch), Trivy/Checkov/tfsec trong pipeline; Kyverno hoặc Gatekeeper | OpenBao 0,1–0,2 GB; ESO 0,1 GB; Kyverno 0,3–0,5 GB [ước lượng] | Như nhau | – | Gần đủ. KMS thật và "quyền tối thiểu trong cloud" cần cloud (tuỳ chọn, dùng chung tài khoản D9). OpenBao transit thay KMS để học khái niệm |
| D16 Độ tin cậy | SLO bằng Prometheus + Sloth/Pyrra, Alertmanager, k6 tạo tải, Chaos Mesh hoặc LitmusChaos | Dựa trên stack D12 + 0,3 GB | Stack thu gọn | – | Đủ |
| D17 Sao lưu và DR | CloudNativePG (backup và PITR vào object storage S3 local như RustFS/Garage/SeaweedFS), `pg_dump`/`pg_basebackup`, Velero với S3 local; diễn tập khôi phục | CNPG operator 0,1 GB + 3 instance PG 0,3–0,7 GB; Velero + object storage 0,3 GB [ước lượng] | 1 primary + 1 replica | 1 + 2 replica | Gần đủ. "Đa vùng" mô phỏng bằng 2 cụm kind; đa vùng thật là bài cloud tuỳ chọn |
| D18 Service mesh (tuỳ chọn) | Linkerd (nhẹ), Istio ambient, Cilium trên kind (`disableDefaultCNI: true`, thay kube-proxy) + Hubble | Istio khuyên Docker ≥ 8 GB, 4 CPU cho Istio + Bookinfo [nguồn]; Linkerd ~0,3 GB; Cilium 0,2–0,3 GB/node [ước lượng] | Linkerd hoặc Cilium trên kind 1+1; Istio ambient chỉ với app nhỏ | Istio ambient + Bookinfo | Đủ |
| D19 Platform, FinOps (tuỳ chọn) | Backstage (golden path, template), OpenCost trên kind với bảng giá tự khai, Kubecost tuỳ chọn; rightsizing từ số liệu Prometheus/VPA | Backstage: **tối thiểu 6 GB RAM và 20 GB đĩa** để tạo app [nguồn] | Chạy Backstage riêng (`yarn start`), tắt cụm | Được, nhưng không chạy cùng stack D12 | Gần đủ. Tag/phân bổ chi phí thật, Cost Explorer, spot instance là bài cloud tuỳ chọn |

### 2.1 Chỗ phải thu gọn cho máy 8 GB

| Tình huống | Cách thu gọn |
|---|---|
| Multi-node Kubernetes | Giữ kind 1+2 (chỉ ~1 GB). Không tăng số control plane trừ bài HA etcd |
| kubeadm trên VM | 2 VM (CP 2 vCPU/2 GB, worker 1 vCPU/1,5 GB). Yêu cầu chính thức: 2 GB RAM mỗi máy, 2 CPU cho control plane; nên worker 1,5 GB là "dưới khuyến nghị nhưng chạy được", cần ghi rõ trong bài. Tắt Docker Desktop khi làm |
| Observability | kind 1 node; Prometheus retention 6h; tắt Alertmanager, node-exporter (trên Docker Desktop node-exporter có thể lỗi mount `/`, cần `hostRootFsMount.enabled: false` – phải kiểm khi viết bài); Loki thay ELK; không dùng Mimir |
| GitOps | Flux, hoặc Argo CD không cài Dex, notification, ApplicationSet |
| Mesh | Linkerd hoặc Cilium; Istio ambient chỉ khi tắt stack D12 |
| Kafka/Strimzi (nếu bài DevOps hay Microservices dùng) | 1 broker KRaft; Strimzi khuyên Docker ≥ 2 CPU, tốt nhất ≥ 4 GB [nguồn] |
| Backstage | Chạy ngoài cụm, tắt mọi thứ khác; hoặc chỉ đọc mô hình catalog/template mà không build app |
| Quy tắc chung | Mỗi bài có bước "Dọn dẹp" xoá cụm (`kind delete cluster`) và dừng VM (`limactl stop`). D0 dạy `docker system df`, `docker system prune` (có callout danger) |

---

## 3. Giả lập cloud cục bộ

### 3.1 Tình trạng các công cụ (10/2026)

| Công cụ | Giấy phép | Tài khoản? | Dịch vụ | IAM enforcement | Ghi chú |
|---|---|---|---|---|---|
| **LocalStack for AWS** | Repo cũ Apache-2.0, **đã archive 23/03/2026**; image mới theo EULA | **Bắt buộc** tài khoản + auth token (kể cả CI) | Hobby (miễn phí, **phi thương mại**): 30+; Base 39 USD/tháng: 55+; Ultimate 89 USD/tháng: 110+ | Hobby: không; Base: cơ bản; Ultimate: nâng cao | Hobby không có RDS, EKS, Cloud Pods. Có Student plan qua GitHub Student Pack. Dùng bản cũ 4.12 thì không cần token nhưng không còn cập nhật |
| **Moto (server mode)** | Apache-2.0 | Không | 100+ (độ sâu khác nhau) | Không đầy đủ | Image `motoserver/moto`, cổng 5000; có ví dụ Terraform với `endpoints`. Dự án lâu đời nhất (từ 2014) |
| **MiniStack** | MIT | Không | 38–40+ | Không | RDS/ElastiCache chạy Postgres/MySQL/Redis thật trong container. Tài liệu chủ yếu từ chính dự án |
| **Floci** | MIT | Không | 47–68 (nguồn khác nhau) | Chưa rõ | Ra mắt đầu 2026, rất nhẹ; độ tương thích còn đang được kiểm |
| **fakecloud** | AGPL-3.0 | Không | 30+ | Có chế độ `soft`/`strict` | Chạy Terraform acceptance test trong CI. Mới |
| **kumo** | MIT | Không | 76 | Chưa rõ | v0.x, một người bảo trì |
| Dịch vụ đơn lẻ | Khác nhau | Không | DynamoDB Local, ElasticMQ (SQS), object storage S3 (RustFS, Garage, SeaweedFS) | – | Ổn định hơn emulator đa dịch vụ cho từng việc |

Nhận định cho Masteva:

- **Không dùng LocalStack trong bài**: Masteva là sản phẩm thương mại (dù nội dung CC BY-NC-SA), người học có thể làm lab trong giờ làm việc ở công ty, rơi vào vùng "commercial use" của gói Hobby; thêm bước tạo tài khoản bên thứ ba cho người học. Rủi ro điều khoản thay đổi tiếp.
- **Nếu cần một emulator**, ưu tiên **Moto server** (lâu đời, Apache-2.0, không tài khoản) cho bài luyện CLI/SDK/Terraform với S3, SQS, DynamoDB, Lambda. MiniStack/Floci có thể hay hơn nhưng còn mới; phải tự kiểm trước khi đưa vào bài.
- Object storage S3 trong lab nên dùng **RustFS** như Spring Boot SB10 đã chọn (MinIO đã archive, không còn image cộng đồng, theo `docs/status.md`), để thống nhất giữa các roadmap.

### 3.2 Terraform/OpenTofu dạy được tới đâu trên provider local

| Khái niệm D10 | Provider local đủ dạy? | Cách làm |
|---|---|---|
| Provider, resource, data source, output | Đủ | `kreuzwerker/docker` tạo network, volume, container; `hashicorp/local`, `random`, `tls` |
| State, plan/apply, dependency graph | Đủ | Như trên; `tofu graph` |
| Remote state, locking | Đủ | Backend `pg` với PostgreSQL container; hoặc backend `s3` trỏ RustFS (cần `use_path_style`, bỏ kiểm tra credential/region; locking bằng `use_lockfile` – phải kiểm với phiên bản dùng) |
| Module, biến, môi trường (workspace hoặc thư mục env) | Đủ | Module "web app" = container + network; env dev/staging khác nhau số replica, cổng |
| Drift và import | Đủ | Sửa tay container bằng `docker` rồi `plan`; `import` container tạo bằng tay; với Kubernetes: `kubectl edit` rồi `plan` |
| Kubernetes bằng IaC | Đủ | `tehcyx/kind` (tạo cụm), `hashicorp/kubernetes`, `hashicorp/helm` |
| Ansible | Đủ | Playbook vào VM Lima qua SSH (Lima tạo sẵn cấu hình SSH) |
| VPC, subnet, route table, SG, IAM role, EC2, RDS | **Không** | Emulator cho phép `apply` nhưng không có mạng thật, không thực thi IAM, nên không chứng minh được gì. Làm trong bài cloud D9 |
| CloudFormation | Không (trừ emulator) | Tuỳ chọn, cần AWS |
| Pulumi | Đủ (provider docker/kubernetes) | Tuỳ chọn |

Lưu ý giấy phép: Terraform theo BSL 1.1 (dùng học và dùng nội bộ được), OpenTofu theo MPL 2.0. Lệnh hai bên gần như giống nhau; đề xuất bài dùng **OpenTofu** làm lệnh chính và ghi chú lệnh `terraform` tương đương, vì OpenTofu mở và cài không cần điều khoản.

### 3.3 Cái cloud không giả lập tốt

| Thứ | Vì sao không giả lập được | Thay thế local để học khái niệm |
|---|---|---|
| IAM thật (policy evaluation, role assumption, SCP, permission boundary) | Emulator miễn phí không thực thi, hoặc thực thi một phần | RBAC Kubernetes, policy OpenBao; IAM thật ở D9 |
| VPC, route table, NAT, IGW, security group | Không có mạng thật | netns, iptables/nftables, nhiều VM Lima (D2) |
| Database được quản lý (RDS: Multi-AZ, snapshot, parameter group, bảo trì) | Emulator chỉ chạy Postgres trong container | CloudNativePG (failover, backup, PITR) dạy cùng khái niệm vận hành |
| Load balancer được quản lý (ALB, health check, target group) | Không có | `cloud-provider-kind`, MetalLB, Envoy Gateway |
| EKS/GKE/AKS (IRSA/Pod Identity, node group, autoscaler, add-on được quản lý) | Không có | kubeadm (D13), KWOK cho autoscaler |
| Hoá đơn, Budgets, Cost Explorer, tag phân bổ chi phí, spot interruption | Không có | OpenCost với bảng giá tự khai (D19) |
| Quota, giới hạn vùng, độ trễ giữa vùng | Không có | Hai cụm kind |

---

## 4. Cloud thật: chi phí và free tier

### 4.1 Đơn giá AWS (us-east-1, on-demand, 10/2026)

| Tài nguyên | Đơn giá | Một tháng nếu quên (730 giờ) | Nguồn |
|---|---|---|---|
| EKS control plane | 0,10 USD/giờ (0,60 USD/giờ nếu rơi vào extended support) | 73 USD (438 USD nếu extended) | [EKS pricing](https://aws.amazon.com/eks/pricing/) |
| NAT gateway | 0,045 USD/giờ + 0,045 USD/GB xử lý | 32,85 USD + dữ liệu | [VPC pricing](https://aws.amazon.com/vpc/pricing/) (ví dụ dùng Ohio, cùng mức us-east-1) |
| Public IPv4 (đang dùng hoặc idle) | 0,005 USD/giờ mỗi địa chỉ | 3,65 USD mỗi IP | [VPC pricing](https://aws.amazon.com/vpc/pricing/) |
| ALB | 0,0225 USD/giờ + 0,008 USD/LCU-giờ | ≥ 16,4 USD | [ELB pricing](https://aws.amazon.com/elasticloadbalancing/pricing/) |
| EC2 t4g.small (2 vCPU arm64, 2 GiB) | 0,0168 USD/giờ | 12,3 USD | [Vantage t4g.small](https://instances.vantage.sh/aws/ec2/t4g.small) |
| EC2 t3.micro (2 vCPU x86, 1 GiB) | 0,0104 USD/giờ | 7,6 USD | [Vantage t3.micro](https://instances.vantage.sh/aws/ec2/t3.micro) |
| RDS PostgreSQL db.t4g.micro Single-AZ | ~0,016 USD/giờ + lưu trữ | ~11,7 USD + ~2,3 USD (20 GB) | Bên thứ ba ([Vantage](https://instances.vantage.sh/aws/rds/db.t4g.micro), Holori); bảng trên [RDS pricing](https://aws.amazon.com/rds/postgresql/pricing/) không đọc được bằng công cụ, cần kiểm lại |
| S3 Standard | ~0,023 USD/GB-tháng; GET 0,0004 USD/1.000 request | Không đáng kể với lab | [S3 pricing](https://aws.amazon.com/s3/pricing/) (giá lưu trữ là mức niêm yết quen thuộc, bảng không đọc được, cần kiểm lại) |
| Data transfer ra Internet | 100 GB/tháng miễn phí | – | [EC2 on-demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/) |
| AWS Budgets | Theo dõi và cảnh báo miễn phí; 2 budget có action đầu tiên miễn phí | 0 | [Budgets pricing](https://aws.amazon.com/aws-cost-management/aws-budgets/pricing/) |

Chọn region: us-east-1 hoặc us-east-2 thường rẻ nhất; Singapore (ap-southeast-1) gần Việt Nam, độ trễ console/SSH tốt hơn nhưng đắt hơn khoảng 20–30% [ước lượng]. Với lab 2 giờ, chênh lệch dưới 0,1 USD, nên **chọn ap-southeast-1 cho trải nghiệm**, hoặc us-east-1 nếu muốn số trong bài khớp ví dụ của AWS. Quan trọng hơn là **cố định một region** trong cả roadmap để bước kiểm tra dọn dẹp không bỏ sót.

### 4.2 Chi phí ước tính cho từng kiểu lab (us-east-1)

| Lab | Tài nguyên | 2 giờ | Nếu quên 1 tháng |
|---|---|---|---|
| D9: VPC + 2 EC2 ở public subnet | 2 × t4g.small, 2 IPv4, EBS 8 GB | ~0,09 USD | ~32 USD |
| D9: thêm private subnet + NAT | + 1 NAT gateway, 1 GB dữ liệu | ~0,23 USD | ~66 USD |
| D9: RDS nhỏ | db.t4g.micro, 20 GB | ~0,04 USD | ~14 USD |
| D9: ALB trước 2 EC2 | 1 ALB | ~0,06 USD | ~17 USD |
| D9: S3 + IAM + Lambda | Vài MB, vài request | ~0 USD | ~0 USD |
| D13 tuỳ chọn: EKS | Control plane, 2 × t4g.medium (~0,0336 USD/giờ), ALB, không NAT | ~0,45 USD (thực tế 2–3 giờ vì tạo/xoá cụm mất 10–20 phút mỗi chiều: < 1 USD) | ~140 USD; có NAT ~175 USD |
| D17 tuỳ chọn: đa vùng | Bucket S3 sao chép chéo vùng, RDS snapshot copy | < 0,5 USD | Vài USD |

Kết luận: mục tiêu **dưới 5 USD mỗi bài** đạt dễ dàng nếu huỷ trong ngày; **chi phí thật nằm ở việc quên xoá**, đặc biệt EKS, NAT gateway, ALB, RDS và IPv4 idle.

### 4.3 Free tier hiện hành

| Nhà cung cấp | Chương trình | Có tự tính tiền không? | Phù hợp cho lab |
|---|---|---|---|
| **AWS** (từ 15/07/2025) | Tới 200 USD credit (100 USD khi đăng ký + tới 100 USD khi làm các hoạt động như tạo EC2, RDS, Lambda, Budget). **Free plan**: không tính tiền trừ khi tự nâng cấp; tài khoản tự đóng sau 6 tháng hoặc khi hết credit. Paid plan: dùng mọi dịch vụ, tính tiền khi vượt credit | Free plan: **không**. Paid plan: có | Rất tốt cho D9 và cả EKS: danh sách dịch vụ của Free plan (trải nghiệm đăng ký mới) có EC2, VPC, ELB, RDS, S3, IAM, EKS, ECS, ECR, Lambda, KMS, Secrets Manager, Budgets. Lưu ý trang AWS ghi trải nghiệm đăng ký mới "đang mở dần cho một số khách hàng", cần kiểm khi viết bài |
| **GCP** | 300 USD credit, 90 ngày. Không tính tiền trừ khi tự nâng cấp; hết hạn thì tài nguyên dừng, có 30 ngày để nâng cấp và lấy lại. Always free: 1 e2-micro ở us-west1/us-central1/us-east1. GKE: phí quản lý 0,10 USD/giờ, credit 74,40 USD/tháng phủ 1 cụm zonal hoặc Autopilot | **Không** (trong trial) | Rất tốt cho bài Kubernetes được quản lý: phí control plane gần như bằng 0 |
| **Azure** | 200 USD credit trong 30 ngày, một số dịch vụ miễn phí 12 tháng (ví dụ 750 giờ B1s). AKS Free tier: control plane miễn phí, chỉ trả node | Phải tự chuyển sang pay-as-you-go | 30 ngày quá ngắn cho người học theo nhịp roadmap |

Đề xuất: bài cloud viết cho **AWS** (nhu cầu tuyển dụng ở Việt Nam cao nhất, khớp chủ đề "pick" AWS/GCP/Azure), khuyên người học **mở tài khoản AWS Free plan riêng cho lab** (không dùng tài khoản công ty hay tài khoản cá nhân đang chạy thứ khác). Ghi chú GCP là lựa chọn tương đương an toàn. Không viết song song ba cloud.

### 4.4 Giữ chi phí lab dưới 5–10 USD mỗi bài

| Biện pháp | Chi tiết |
|---|---|
| Tài khoản riêng cho lab | Free plan (không thể bị tính tiền) hoặc tài khoản Paid riêng; bật MFA cho root, dùng IAM user/Identity Center cho lab |
| Budget alarm ở bài D9.1 | Hai ngưỡng 5 USD và 10 USD, báo cả "forecasted"; email. Ghi rõ cảnh báo trễ 8–12 giờ nên không thay được bước dọn dẹp |
| Mọi tài nguyên tạo bằng OpenTofu | `default_tags { tags = { masteva-lab = "d9.2", owner = "<tên>" } }` trong provider AWS; bước dọn dẹp là `tofu destroy` |
| Kiểm tra sau dọn dẹp | `aws resourcegroupstaggingapi get-resources --tag-filters Key=masteva-lab` phải rỗng; liệt kê thêm thứ hay sót (EIP, NAT, ELB, EBS volume, snapshot, CloudWatch log group, ENI do EKS tạo) |
| Lưới an toàn cuối | `aws-nuke` (bản fork ekristen đang bảo trì) hoặc `cloud-nuke` (Gruntwork, có `--dry-run`), luôn chạy dry-run trước, chỉ trên tài khoản lab. Đặt trong callout danger |
| Thiết kế tránh bẫy | Không NAT gateway trừ bài dạy NAT (dùng public subnet + SG chặt, hoặc S3 gateway endpoint miễn phí); không Elastic IP thừa; RDS `skip_final_snapshot = true` và `deletion_protection = false` trong lab; EKS dùng node t4g.medium, không bật add-on tốn phí |
| Thời lượng | Bài cloud thiết kế để xong trong 1–2 giờ một phiên; nếu dừng giữa chừng thì `tofu destroy` rồi `apply` lại phiên sau (một lý do nữa để dùng IaC) |
| Một region | Toàn roadmap dùng một region; các lệnh kiểm tra dọn dẹp chỉ cần chạy ở đó |
| Cảnh báo theo lịch (tuỳ chọn) | Gợi ý người học đặt nhắc nhở; không tự động huỷ bằng Lambda vì làm bài phức tạp hơn |

---

## 5. Chiến lược lab tổng thể đề xuất

### 5.1 Ba tầng môi trường

| Tầng | Dùng cho | Tỷ lệ bài |
|---|---|---|
| **Local cốt lõi** (VM Lima + Docker + kind) | D0–D8, D10–D18, phần lớn D19 | ~85–90% |
| **Local mô phỏng** (KWOK, 2 cụm kind, OpenCost, emulator S3/SQS) | Autoscaler, đa vùng, FinOps, luyện CLI cloud | ~5% |
| **Cloud thật, gắn nhãn chi phí** | D9 (bắt buộc), EKS/GKE ở D13, IAM/KMS ở D15, đa vùng ở D17, tag/spot ở D19 (tuỳ chọn) | ~5–10% |

Quy tắc trình bày:

- Bài cloud có khối đầu bài: **chi phí ước tính khi làm đúng** (ví dụ "~0,3 USD nếu xoá trong 2 giờ"), **chi phí nếu quên xoá một tháng**, thời lượng, yêu cầu tài khoản. Callout danger trước lệnh `tofu destroy`/`aws-nuke`.
- Bài cloud tuỳ chọn có "đường local" tương đương để người không muốn trả tiền vẫn đạt mục `Check` cốt lõi; mục `Check` chỉ làm được trên cloud nên đặt trong chủ đề `opt`.
- Thống nhất `where`: lệnh `aws`/`tofu` chạy trên Mac dùng `where="mac"`; lệnh trong EC2 dùng `where="linux"`. Có thể cân nhắc thêm `where="cloud"` cho CloudShell, nhưng không bắt buộc.
- Mỗi chặng ghi rõ **profile máy** (8 GB / 16 GB) ở phần Chuẩn bị, kèm cấu hình kind/Docker tương ứng.

### 5.2 Hệ quả cho việc kiểm chứng (`status: verified`)

- Bài local: chạy thật trên máy người sáng lập như D1.1 và roadmap Java. Máy hiện tại (M1 Pro, 16 GB, Docker 7,7 GB) đủ cho mọi bài, trừ việc chạy Backstage cùng cụm đầy đủ.
- Bài cloud: cần tài khoản AWS lab thật để kiểm chứng. Ước tính một vòng kiểm chứng toàn bộ bài cloud (khoảng 8–12 bài, mỗi bài 0,1–1 USD, chạy lại vài lần khi gỡ lỗi) **dưới 30 USD**, nằm trong 200 USD credit nếu dùng tài khoản Free plan mới. Đây là quyết định chi phí, cần người dùng đồng ý trước khi tạo tài khoản và tài nguyên (theo `CLAUDE.md`).
- Đề xuất bổ sung chuẩn nội dung: metadata `verified` của bài cloud ghi thêm `region` và `cost` thực tế (USD) của lần kiểm chứng.

### 5.3 Rủi ro và cách giảm

| Rủi ro | Mức | Cách giảm |
|---|---|---|
| Máy 8 GB không chạy nổi D12, D18, D19 | Cao | Profile 8 GB trong mỗi bài; một môi trường tại một thời điểm; bỏ ELK, Mimir; Linkerd thay Istio; Backstage chạy riêng |
| Apple Silicon (arm64) | Trung bình | Hầu hết image CNCF có multi-arch; `kindest/node` có arm64 [đo]. **Tránh chart/image Bitnami**: từ 28/08/2025 catalog miễn phí chỉ còn tag `latest` cho dev, bản cũ sang `bitnamilegacy` không cập nhật; dùng operator/chart chính chủ (CloudNativePG, Strimzi, Valkey). Image chỉ có amd64 chạy qua Rosetta (`--platform linux/amd64`) chậm; bài nên ghi khi gặp. EC2 Graviton (t4g) cùng kiến trúc arm64 với Mac M, tiện mang binary lên; người dùng x86 chọn t3 |
| Windows | Trung bình–cao | Lima trên Windows chỉ có driver WSL2 thử nghiệm; đề xuất `where="vm"` = **Ubuntu trên WSL2** (bật systemd trong `/etc/wsl.conf`), Docker Desktop backend WSL2. WSL2 mặc định chỉ dùng 50% RAM máy; cần `.wslconfig`. kind trên WSL2 có thể lỗi cgroup, đội kind không hỗ trợ Windows. kubeadm nhiều node trên Windows khó: dùng Hyper-V/Multipass hoặc chấp nhận 1 node. Cần một người thử trên Windows trước khi gắn nhãn đã kiểm chứng cho Windows |
| Linux | Thấp | kind chạy native, nhẹ hơn macOS. Multi-node cần tăng `fs.inotify.max_user_watches=524288` và `max_user_instances=512` [nguồn kind]. Lima chạy được bằng QEMU, hoặc dùng VM của distro |
| Thay đổi giấy phép/sản phẩm (LocalStack, Bitnami, MinIO, ingress-nginx) | Trung bình | Chọn dự án CNCF/nền tảng mở; ghi phiên bản trong `verified`; mỗi quý rà các phụ thuộc có rủi ro |
| Người học quên xoá tài nguyên cloud | Cao | Free plan, budget, tag, bước kiểm tra sau dọn dẹp, nuke tool; ghi số "nếu quên một tháng" ngay đầu bài |
| Docker Desktop yêu cầu giấy phép trả phí ở công ty lớn (≥ 250 nhân viên hoặc ≥ 10 triệu USD doanh thu) | Thấp | D0 nêu Colima/OrbStack/Podman là lựa chọn; kind chạy được trên Podman (rootless có hạn chế) |
| Phiên bản trôi nhanh (Kubernetes 1.37, kind 0.33, Helm 4) | Trung bình | Ghim phiên bản trong lệnh, ghi vào `verified` |

---

## 6. Việc nên làm tiếp (khi viết bài)

1. Đo lại theo profile khi viết từng chặng: D12 (kube-prometheus-stack + Loki + OTel), D14 (Argo CD), D18 (Istio ambient, Cilium), D19 (Backstage); thay các số **[ước lượng]** trong bảng mục 2 bằng số đo.
2. Thử kubeadm nhiều VM Lima với mạng `user-v2` (Lima có template `k8s` một node; ghép nhiều node chưa có ví dụ chính thức).
3. Thử backend state `s3` của OpenTofu trỏ RustFS và backend `pg`.
4. Quyết định với người dùng: tạo tài khoản AWS lab (Free plan) để kiểm chứng D9; chọn region; có thêm `where="cloud"` hay không.
5. Kiểm lại giá RDS, S3, EBS trên AWS Pricing Calculator ngay trước khi viết bài D9 (bảng giá trên trang chính thức không đọc được bằng công cụ hôm nay).

---

## 7. Nguồn

Repo Masteva: `content/roadmaps/devops.json`, `content/steps/d0…d19/meta.json`, `content/steps/d1/d1-1.mdx`, `docs/content-standard.md`, `docs/status.md`.

Kubernetes và công cụ local:

- kind known issues (inotify, Docker Desktop, WSL2): https://kind.sigs.k8s.io/docs/user/known-issues/
- kubeadm yêu cầu phần cứng: https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/
- k3s yêu cầu: https://docs.k3s.io/installation/requirements
- Lima ví dụ (template k8s, WSL2): https://lima-vm.io/docs/examples/
- Istio trên Docker Desktop (8 GB, 4 CPU): https://istio.io/latest/docs/setup/platform-setup/docker/
- Istio ambient platform prerequisites: https://istio.io/latest/docs/ambient/install/platform-prerequisites/
- Istio trên kind: https://istio.io/latest/docs/setup/platform-setup/kind/
- Cilium trên kind: https://docs.cilium.io/en/stable/installation/kind/
- Strimzi quickstart (Docker ≥ 2 CPU, ≥ 4 GB): https://strimzi.io/quickstarts/
- Backstage getting started (6 GB RAM, 20 GB đĩa): https://backstage.io/docs/getting-started/
- Ingress NGINX retirement: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/
- kindnet network policies: https://kindnet.sigs.k8s.io/docs/user/network-policies/
- Cluster autoscaler KWOK provider: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/kwok/README.md, https://kwok.sigs.k8s.io/docs/examples/scalability/scale-using-ca/
- node-exporter trên Docker Desktop (mount propagation, cần kiểm): https://hub.docker.com/hardened-images/catalog/dhi/node-exporter/guides, https://ithelp.ithome.com.tw/articles/10331330

Giả lập cloud:

- LocalStack chuyển sang image duy nhất: https://blog.localstack.cloud/localstack-single-image-next-steps/
- LocalStack pricing: https://www.localstack.cloud/pricing
- Repo LocalStack (archive 23/03/2026): https://github.com/localstack/localstack
- Moto server mode: https://docs.getmoto.org/en/latest/docs/server_mode.html
- So sánh MiniStack, Floci, kumo, fakecloud, moto (26/04/2026): https://codenote.net/en/posts/localstack-archived-oss-alternatives-comparison/
- Bitnami thay đổi catalog: https://community.broadcom.com/blogs/beltran-rueda-borrego/2025/08/18/how-to-prepare-for-the-bitnami-changes-coming-soon, https://thenewstack.io/broadcom-ends-free-bitnami-images-forcing-users-to-find-alternatives/

Giá và free tier:

- AWS Free Tier: https://aws.amazon.com/free/ ; thông báo 07/2025: https://aws.amazon.com/about-aws/whats-new/2025/07/aws-free-tier-credits-month-free-plan/
- Dịch vụ trong Free plan (trải nghiệm đăng ký mới): https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html
- EKS: https://aws.amazon.com/eks/pricing/
- VPC (NAT, IPv4): https://aws.amazon.com/vpc/pricing/
- ELB: https://aws.amazon.com/elasticloadbalancing/pricing/
- RDS PostgreSQL: https://aws.amazon.com/rds/postgresql/pricing/ ; db.t4g.micro (bên thứ ba): https://instances.vantage.sh/aws/rds/db.t4g.micro
- EC2: https://instances.vantage.sh/aws/ec2/t4g.small, https://instances.vantage.sh/aws/ec2/t3.micro, https://aws.amazon.com/ec2/pricing/on-demand/
- S3: https://aws.amazon.com/s3/pricing/
- AWS Budgets pricing: https://aws.amazon.com/aws-cost-management/aws-budgets/pricing/ ; độ trễ cảnh báo: https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
- GCP free trial và free tier: https://docs.cloud.google.com/free/docs/free-cloud-features
- GKE pricing: https://cloud.google.com/kubernetes-engine/pricing
- Azure free account: https://azure.microsoft.com/en-us/pricing/free-services ; AKS pricing: https://azure.microsoft.com/en-us/pricing/details/kubernetes-service/
- aws-nuke (fork ekristen): https://github.com/ekristen/aws-nuke ; cloud-nuke: https://github.com/gruntwork-io/cloud-nuke
- GitHub Actions thay đổi giá 2026 (public repo vẫn miễn phí; phí runner tự host đã hoãn): https://resources.github.com/actions/2026-pricing-changes-for-github-actions/, https://www.theregister.com/2025/12/17/github_charge_dev_own_hardware/
