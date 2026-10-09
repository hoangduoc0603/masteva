# Bản đồ công cụ DevOps tháng 10/2026 cho roadmap Masteva

Ngày kiểm tra: **09/10/2026**. Phạm vi: chọn công cụ cho 20 chặng D0–D19 của `content/roadmaps/devops.json`.

## 0. Cách kiểm và mức tin cậy

- **Phiên bản và trạng thái archive**: lấy trực tiếp từ GitHub, gồm chuyển hướng `github.com/<repo>/releases/latest` (ra tag mới nhất cùng ngày phát hành) và dòng "This repository was archived…" trên trang repo. Đã quét hơn 170 repo. Đây là dữ liệu cấp 1, độ tin cậy cao. Riêng các repo chỉ phát hành qua kênh khác (GitLab, Docker Desktop, Ubuntu) thì dùng trang chính thức.
- **Giấy phép**: lấy trường `license.spdx_id` từ GitHub API. `NOASSERTION` nghĩa là GitHub không nhận ra giấy phép chuẩn, thường là BSL, ELv2 hoặc giấy phép kép.
- **Trạng thái CNCF**: lấy từ cncf.io/projects và cncf.io/sandbox-projects ngày 09/10/2026.
- **Chính sách, giấy phép thương mại, tuyển dụng**: lấy từ blog chính thức khi tìm được. Mục nào chỉ dựa vào nguồn thứ cấp thì ghi "(thứ cấp)".
- **Mức phổ biến trong tuyển dụng**: chưa có báo cáo thị trường Việt Nam năm 2026. Mức Cao, TB hoặc Thấp trong bảng là đánh giá định tính, dựa trên mẫu tin tuyển dụng trên JobOKO và JobsGO (AWS, Terraform, Kubernetes, ArgoCD, GitLab, Prometheus, Grafana, ELK, OpenTelemetry, Ansible, HPA/VPA/KEDA) cộng với hiểu biết chung về thị trường. Cần khảo sát thêm nếu dùng làm số liệu công bố.

---

## 1. Bảng theo mảng

Ký hiệu: **G** = CNCF Graduated, **I** = CNCF Incubating, **S** = CNCF Sandbox. "Chính" là công cụ nên dạy làm mặc định, "Thay thế" là lựa chọn phụ hoặc lựa chọn trong topic `pick`.

### 1.1. Lab, hệ điều hành, container (D0, D1, D6)

| Vai trò | Công cụ | Phiên bản (09/10/2026) | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| Distro lab **chính** | Ubuntu 26.04.1 LTS "Resolute Raccoon" | 26.04 phát hành 23/04/2026, đã có 26.04.1 | Tự do (Canonical) | Hỗ trợ tới 04/2031 (ESM 10 năm) | Cao | **Bẫy**: mặc định dùng **sudo-rs** và **uutils (Rust) coreutils**, bản GNU chỉ là phương án dự phòng. Bài D1/D3 cần ghi rõ và kiểm hành vi cờ ít dùng (thứ cấp). Ubuntu 24.04 LTS vẫn được hỗ trợ, dùng làm phương án dự phòng | https://discourse.ubuntu.com/t/ubuntu-26-04-resolute-raccoon-lts-released/80833 · https://documentation.ubuntu.com/release-notes/26.04/ · https://www.turbogeek.co.uk/rust-coreutils-sudo-rs-ubuntu-26-04/ |
| Distro thay thế | Debian 13 "trixie" | 13.7 (12/09/2026) | DFSG | Stable | TB | Gọn, GNU coreutils thuần, hợp làm base image | https://www.debian.org/releases/trixie/errata.en.html |
| Distro họ RHEL | Rocky Linux 10.2 / AlmaLinux 10.2 | 10.2 (28/05 và 26/05/2026) | Tự do | Hỗ trợ khoảng 10 năm (Alma 10 tới 31/05/2035) | TB, cao ở ngân hàng và doanh nghiệp lớn | Dùng để dạy `dnf`, SELinux. Rocky 10 bỏ CPU cũ hơn Haswell, Alma vẫn giữ (thứ cấp) | https://computingforgeeks.com/rocky-almalinux-rhel-comparison/ |
| VM trên Mac **chính** | Lima | v2.2.1 (03/10/2026) | Apache-2.0 | **I** (từ 10–11/2025) | Thấp (công cụ học) | Template mặc định chuyển sang Ubuntu 26.04 từ v2.1.3. Có template `docker`, `k8s` | https://github.com/lima-vm/lima/releases · https://www.cncf.io/blog/2025/11/11/lima-becomes-a-cncf-incubating-project/ |
| Container engine **chính** | Docker Engine (Moby) | docker-v29.9.0 (08/10/2026) | Apache-2.0 | Hoạt động | Cao | Bản 29 mặc định dùng **containerd image store** cho cài mới. nftables mới ở mức thử nghiệm | https://github.com/moby/moby/releases · https://www.docker.com/blog/docker-engine-version-29/ |
| Bản desktop | Docker Desktop | 4.94.0 (05/10/2026), đóng gói Engine 29.8.2 | Thương mại | Hoạt động | — | Miễn phí cho cá nhân, giáo dục và công ty **dưới 250 nhân viên VÀ doanh thu dưới 10 triệu USD**. Bài học nên chạy Engine trong Lima, Docker Desktop chỉ là tuỳ chọn | https://docs.docker.com/desktop/release-notes/ |
| Compose | Docker Compose | v5.6.0 (02/10/2026) | Apache-2.0 | Hoạt động | Cao | Đã lên major 5 | https://github.com/docker/compose/releases |
| Build | BuildKit / buildx | BuildKit v0.34.0, buildx v0.38.0 (07/10/2026) | Apache-2.0 | Hoạt động | TB | Dạy cache mount, `--cache-to/--cache-from` (registry hoặc gha) | https://github.com/moby/buildkit/releases |
| Container engine thay thế | Podman | **v6.1.3** (29/09/2026) | Apache-2.0 | **S** (2026). **Repo chuyển sang `podman-container-tools`** | TB (RHEL) | Bản 6.0 (24/06/2026) bỏ iptables, CNI, slirp4netns, cgroups v1, BoltDB và **bỏ hỗ trợ Mac Intel cùng Windows 10** | https://github.com/podman-container-tools/podman/releases · https://blog.podman.io/2026/08/ · https://linuxiac.com/podman-6-0-lands-with-breaking-changes-amd-gpus-support/ |
| Runtime | containerd / nerdctl | containerd v2.4.1, nerdctl v2.4.1 | Apache-2.0 | containerd **G** | TB | Dạy ở D11/D13 (runtime của node), `crictl`/`nerdctl` | https://github.com/containerd/containerd/releases |

### 1.2. CI/CD (D7)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| **Chính** | GitHub Actions | runner v2.338.0 (06/10/2026) | Runner MIT, dịch vụ thương mại | Hoạt động | Cao | Phí 0,002 USD/phút cho self-hosted runner trên repo private đã **hoãn** (12/2025), tới giữa 2026 vẫn chưa áp dụng, GitHub chưa nói là huỷ. Runner do GitHub host đã giảm giá từ 01/2026 | https://github.com/actions/runner/releases · https://www.theregister.com/2025/12/17/github_charge_dev_own_hardware/ |
| Runner trên K8s | Actions Runner Controller (scale set) | gha-runner-scale-set-0.15.0 (01/10/2026) | Apache-2.0 | Hoạt động | TB | Dạy ở D13/D19 như ví dụ autoscale runner | https://github.com/actions/actions-runner-controller/releases |
| Chạy Actions cục bộ | act | v0.2.89 (06/2026) | MIT | Hoạt động | Thấp | Giúp lab không cần đẩy lên GitHub | https://github.com/nektos/act/releases |
| Thay thế | GitLab CI | GitLab 19.4 (17/09/2026). Từ 19.0 yêu cầu PostgreSQL ≥ 17 | MIT (CE) và EE thương mại | Phát hành hằng tháng | **Cao ở Việt Nam** (nhiều công ty tự host GitLab CE) | Nên giữ trong topic pick | https://endoflife.ai/gitlab/19.4 (thứ cấp) · https://about.gitlab.com/releases/ |
| Thay thế | Jenkins | Bản weekly 2.585 (06/10/2026). LTS dòng 2.568.x | MIT | Hoạt động. **Yêu cầu Java 21 hoặc 25** từ LTS 2.555.1 | Cao ở doanh nghiệp cũ, ngân hàng | Giữ trong pick, dạy Pipeline as code (Jenkinsfile) | https://github.com/jenkinsci/jenkins/releases · https://www.jenkins.io/doc/book/platform-information/support-policy-java/ |
| Nâng cao | Tekton Pipelines | v1.17.0 (01/10/2026) | Apache-2.0 | **I** | Thấp | Chỉ nhắc ở D19 | https://github.com/tektoncd/pipeline/releases |
| Nâng cao | Dagger | v0.21.10 | Apache-2.0 | Vẫn ở 0.x | Thấp | Chỉ đọc thêm, chưa nên dạy chính | https://github.com/dagger/dagger/releases |
| Build cache | BuildKit cache (`type=gha`, `type=registry`), cache của Actions | — | — | — | — | Dạy cùng D6/D7 | https://docs.docker.com/build/cache/backends/ |

### 1.3. Chuỗi cung ứng phần mềm (D8)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| Ký **chính** | Sigstore cosign | **v3.1.3** (06/08/2026) | Apache-2.0 | Hoạt động | TB, đang tăng | Từ v3 mặc định dùng **bundle format** và chữ ký lưu thành OCI 1.1 referrer. v4 dự kiến xoá các cờ deprecated. Bài viết cho cosign v2 sẽ lỗi thời | https://github.com/sigstore/cosign/releases · https://blog.sigstore.dev/cosign-3-0-available/ |
| Khung tiêu chuẩn | SLSA | **Spec v1.2** (11/2025), thêm **Source Track** | CDLA/Apache | OpenSSF | TB | v1.2 tương thích ngược với v1.1 | https://slsa.dev/spec/v1.2/whats-new · https://slsa.dev/blog/2025/11/announce-slsa-v1.2 |
| Attestation | in-toto | attestation v1.2.0 | Apache-2.0 | **G** | Thấp | Nền tảng của SLSA provenance | https://github.com/in-toto/attestation/releases |
| SBOM **chính** | Syft | v1.54.1 (06/10/2026) | Apache-2.0 | Hoạt động | TB | Xuất CycloneDX và SPDX | https://github.com/anchore/syft/releases |
| Định dạng SBOM | CycloneDX / SPDX | CycloneDX **1.7** (spec 1.7.2), SPDX **3.0.1** | Mở | — | — | Dạy cả hai, mặc định dùng CycloneDX JSON | https://github.com/CycloneDX/specification/releases · https://github.com/spdx/spdx-spec/releases |
| Quét **chính** | Trivy | v0.75.0 (01/10/2026) | Apache-2.0 | Hoạt động | Cao | **Bẫy bảo mật**: 03/2026 bị TeamPCP tấn công chuỗi cung ứng (CVE-2026-33634). Binary v0.69.4 và image 0.69.4–0.69.6 bị cài mã độc, **75/76 tag của `trivy-action` bị force-push**. Đây là ví dụ thực tế để dạy pin action theo **commit SHA** | https://github.com/aquasecurity/trivy/releases · https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know · https://thehackernews.com/2026/03/trivy-security-scanner-github-actions.html |
| Quét thay thế | Grype | v0.120.1 | Apache-2.0 | Hoạt động | TB | Đi cặp với Syft (quét từ SBOM) | https://github.com/anchore/grype/releases |
| Cập nhật dependency | Renovate / Dependabot | Renovate 44.148.4, Dependabot-core v0.399.0 | Renovate **AGPL-3.0**, Dependabot MIT | Hoạt động | TB | Dependabot dễ nhất trên GitHub, Renovate đa nền tảng (GitLab) | https://github.com/renovatebot/renovate/releases |
| Registry lab **chính** | Zot | v2.1.22 | Apache-2.0 | **S** | Thấp | Một binary nhẹ, OCI-native, hỗ trợ referrers cho chữ ký cosign. Hợp chạy trong Lima hoặc kind | https://github.com/project-zot/zot/releases |
| Registry doanh nghiệp | Harbor | v2.15.4 (09/10/2026) | Apache-2.0 | **G** | **Cao ở Việt Nam** (tự host) | Nặng (nhiều thành phần), dạy ở mức "đọc và cài bằng Helm" | https://github.com/goharbor/harbor/releases |
| Registry cloud | GHCR / ECR | — | Thương mại | — | Cao | GHCR đi cùng GitHub Actions | — |
| Điểm bảo mật repo | OpenSSF Scorecard | v5.5.0 | Apache-2.0 | Hoạt động | Thấp | Tuỳ chọn | https://github.com/ossf/scorecard/releases |

### 1.4. Hạ tầng dưới dạng code (D10)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| Pick A | Terraform | **v1.16.5** (02/10/2026). 1.16.0 GA ngày 26/08/2026 | **BSL 1.1** (từ 08/2023). Bản quyền chuyển sang IBM | Hoạt động | **Cao nhất** (từ khoá có trong mọi tin tuyển dụng) | 1.16 thêm khối `store`, `import` trong module, `lifecycle destroy=false`. Gói Free cũ của HCP Terraform hết hạn 31/03/2026, gói Free mới giới hạn 500 resource | https://github.com/hashicorp/terraform/releases · https://discuss.hashicorp.com/t/terraform-v1-16-0-released/77683 · https://www.hashicorp.com/blog/continuing-hcp-terraform-s-enhanced-free-tier-experience |
| Pick B | OpenTofu | **v1.13.1** (01/10/2026) | **MPL-2.0** | **S**. Dòng 1.13 được hỗ trợ tới 01/08/2027 | TB, đang tăng | Khác biệt: mã hoá state (từ 1.7), `for_each` cho provider và cờ `-exclude` (1.9), registry OCI (1.10). Bản 1.13 thêm hàm giảm "known after apply", lint thử nghiệm. **1.13 là bản cuối có build 32-bit** | https://github.com/opentofu/opentofu/releases · https://alternativeto.net/news/2026/10/opentofu-1-13-adds-windows-arm64-and-planning-functions/ |
| Bọc nhiều môi trường | Terragrunt | **v1.1.6** (đã lên 1.x) | MIT | Hoạt động | TB | Nhắc ở topic "Module và môi trường" | https://github.com/gruntwork-io/terragrunt/releases |
| PR automation | Atlantis | v0.48.1 | Apache-2.0 | **S** | Thấp–TB | Tuỳ chọn | https://github.com/runatlantis/atlantis/releases |
| Tuỳ chọn | Pulumi | v3.268.0 | Apache-2.0 | Hoạt động | Thấp ở Việt Nam | Giữ `[opt]` | https://github.com/pulumi/pulumi/releases |
| Đã khai tử | CDK for Terraform (CDKTF) | v0.21.0 | MPL | **Archived 10/12/2025** | — | Không dạy | https://github.com/hashicorp/terraform-cdk |
| Control plane IaC | Crossplane | **v2.4.2** | Apache-2.0 | **G** | Thấp–TB | Dạy ở D19 | https://github.com/crossplane/crossplane/releases |
| Cấu hình máy | Ansible (ansible-core) | v2.21.5 (05/10/2026) | GPL-3.0 | Hoạt động | **Cao ở Việt Nam** | Nên nâng từ `[opt]` lên topic có lab ở D10, hoặc dạy sớm hơn (D3/D4) | https://github.com/ansible/ansible/releases |
| Policy as code | OPA / Conftest | OPA v1.21.1, Conftest v0.71.1 | Apache-2.0 | OPA **G** | TB | Rego v1 | https://github.com/open-policy-agent/opa/releases |
| Quét IaC | Checkov / Trivy config | Checkov 3.3.26 | Apache-2.0 | Hoạt động | TB | **tfsec**: bản cuối v1.28.14 (05/2025), đã gộp vào Trivy, không dạy riêng | https://github.com/bridgecrewio/checkov/releases · https://github.com/aquasecurity/tfsec |
| Lint | TFLint | v0.64.0 | MPL-2.0 | Hoạt động | Thấp | Tuỳ chọn | https://github.com/terraform-linters/tflint/releases |
| Provider chạy cục bộ | tehcyx/kind, kreuzwerker/docker, hashicorp/kubernetes, hashicorp/helm | v0.11.0, v4.6.0, **v3.3.0**, **v3.3.0** | MPL-2.0 | Hoạt động | — | Provider kubernetes/helm đã lên **major 3** (cú pháp khác v2) | Các trang releases tương ứng trên GitHub |

### 1.5. Kubernetes và hệ sinh thái (D0, D11, D13)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| Kubernetes | upstream | **1.37.1** (1.37 "Garhwal" phát hành 26/08/2026). Đang hỗ trợ 1.37, 1.36.5 và 1.35.9. **1.34 hết hạn 27/10/2026** | Apache-2.0 | **G** | Cao | 1.37: KYAML stable, metrics.k8s.io stable, HPA scale-to-zero beta (bật mặc định). kube-dns deprecated, **kube-proxy IPVS bắt đầu deprecate**. EOL: 1.37 → 28/10/2027, 1.36 → 28/06/2027, 1.35 → 28/02/2027 | https://kubernetes.io/releases/ · https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/ |
| Cụm lab **chính** | kind | **v0.33.0**, node mặc định `kindest/node:v1.37.0` (có sẵn 1.36.4, 1.35.8, 1.34.11) | Apache-2.0 | Hoạt động | — | Ghi kèm digest trong bài | https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0 |
| Cụm lab thay thế | k3d (k3s trong Docker) | k3d v5.9.0, k3s v1.37.1+k3s1 | MIT / Apache-2.0 | k3s **S** | TB (k3s ở edge) | k3d phát hành thưa (06/2026) | https://github.com/k3d-io/k3d/releases · https://github.com/k3s-io/k3s/releases |
| Khác | minikube | v1.39.0 | Apache-2.0 | Hoạt động | — | Không cần dạy thêm | https://github.com/kubernetes/minikube/releases |
| Cụm "thật" | kubeadm (trên VM Lima) | theo k8s 1.37 | Apache-2.0 | — | Cao (CKA) | Lab D13: tạo cụm 1.36 rồi nâng cấp lên 1.37 | — |
| OS bất biến | Talos Linux | v1.14.2 | MPL-2.0 | Hoạt động | Thấp | Đọc thêm | https://github.com/siderolabs/talos/releases |
| Ingress cũ | **Ingress-NGINX** | controller-v1.15.1 (03/2026) | Apache-2.0 | **Đã retire, repo archived 24/03/2026**, không còn bản vá | Vẫn thấy trong tin tuyển dụng (hệ thống cũ) | **Không dạy cài mới**. Chỉ dạy đọc manifest Ingress và chuyển sang Gateway API bằng `ingress2gateway` v1.2.0. API Ingress vẫn tồn tại nhưng đã đóng băng. InGate cũng đã retire (06/2026) | https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/ · https://www.kubernetes.io/blog/2026/01/29/ingress-nginx-statement/ |
| Gateway API | spec | **v1.6.3**. v1.6 (30/06/2026): TCPRoute và UDPRoute lên Standard, tài nguyên thử nghiệm chuyển sang group `gateway.networking.x-k8s.io` | Apache-2.0 | SIG Network | Đang tăng | — | https://kubernetes.io/blog/2026/08/03/gateway-api-v1-6-release/ |
| Gateway **chính** | Envoy Gateway | v1.9.2 | Apache-2.0 | Thuộc Envoy (**G**) | TB | Độ phủ conformance cao nhất trong bảng (37/38). Thuần Gateway API, cài nhẹ trên kind | https://github.com/envoyproxy/gateway/releases · https://gateway-api.sigs.k8s.io/docs/implementations/versions/ |
| Gateway thay thế | NGINX Gateway Fabric | v2.7.2 (2.7 nhắm conformance Gateway API 1.6) | Apache-2.0 | Hoạt động | TB | Quen với người đã biết nginx | https://community.nginx.org/t/nginx-gateway-fabric-2-7-gateway-api-1-6-conformance-external-authentication-and-fewer-snippets/10823 |
| Khác | Traefik v3.7.14, Istio, Cilium, kgateway v2.4.6 (**S**) | — | Apache/MIT | — | — | Cilium 1.20 mới đạt 29/38 tính năng | — |
| TLS | cert-manager | v1.21.2 | Apache-2.0 | **G** | TB | — | https://github.com/cert-manager/cert-manager/releases |
| DNS | external-dns | v0.23.0 | Apache-2.0 | SIG | TB | — | https://github.com/kubernetes-sigs/external-dns/releases |
| CNI | Cilium (chính, nâng cao) / Calico / Flannel | Cilium v1.20.2 (**G**), Calico v3.33.0, Flannel v0.28.10 | Apache-2.0 | — | Cilium tăng mạnh, Calico phổ biến | Kind dùng kindnet. Để dạy NetworkPolicy thì cài Calico hoặc Cilium (hoặc kiểm lại việc kindnet hỗ trợ NetworkPolicy) | Các trang releases |
| Storage | Longhorn / Rook-Ceph / OpenEBS | Longhorn v1.13.0 (**I**), Rook v1.21.0 (**G**), OpenEBS v4.6.2 (**S**) | Apache-2.0 | — | TB | Lab chỉ cần `local-path` mặc định của kind. Longhorn là lựa chọn dễ cho D17 | Các trang releases |
| Gói **chính** | Helm | **v4.3.0** (09/09/2026). Helm 4 GA 12/11/2025 | Apache-2.0 | **G** | Cao | Bản mới mặc định dùng server-side apply, `--wait` dựa trên kstatus (cần quyền `watch`), post-renderer phải là plugin, `--atomic` đổi thành `--rollback-on-failure`. **Helm 3 chỉ còn vá bảo mật tới 10/02/2027** | https://github.com/helm/helm/releases · https://helm.sh/blog/helm-v3-end-of-life |
| Gói thay thế | Kustomize | v5.8.3 | Apache-2.0 | SIG | TB | Có sẵn trong `kubectl -k` | https://github.com/kubernetes-sigs/kustomize/releases |
| Autoscale | KEDA / VPA / metrics-server / Karpenter / Cluster Autoscaler | KEDA v2.21.0 (**G**), VPA chart 0.13.0, metrics-server v0.9.0, Karpenter v1.14.1 | Apache-2.0 | — | KEDA và HPA/VPA có trong tin tuyển dụng Việt Nam | Karpenter chỉ chạy trên cloud (AWS, Azure), không lab được trên kind | Các trang releases |
| Đa cụm | Cluster API / vcluster | CAPI v1.14.3, vcluster v0.37.2 | Apache-2.0 | — | Thấp | vcluster hợp lab đa tenant ở D19 | Các trang releases |
| Giao diện | **Headlamp** (kubernetes-sigs) | v0.45.0 | Apache-2.0 | **S** | — | **Kubernetes Dashboard đã archived (21/01/2026)**, chuyển sang Headlamp | https://github.com/kubernetes-sigs/headlamp · https://github.com/kubernetes-retired/dashboard |
| CLI phụ trợ | k9s v0.51.0, stern v1.34.0 | — | Apache-2.0 | Hoạt động | — | Bộ công cụ D0 | — |

### 1.6. GitOps và progressive delivery (D14)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| **Chính** | Argo CD | **v3.5.4** (06/10/2026) | Apache-2.0 | Argo **G** | **Cao ở Việt Nam** | 3.5: mTLS nội bộ, xác minh chữ ký commit, ApplicationSet ở mọi namespace, hỗ trợ Helm 4 | https://github.com/argoproj/argo-cd/releases · https://infoq.com/news/2026/06/argocd-supply-chain-security |
| Thay thế | Flux | **v2.9.6** | Apache-2.0 | **G** | TB | Flux v1 đã archive từ 2022, chỉ dạy Flux 2 | https://github.com/fluxcd/flux2/releases |
| Progressive delivery | Argo Rollouts | v1.10.0 | Apache-2.0 | Argo **G** | TB | Đi cùng Argo CD | https://github.com/argoproj/argo-rollouts/releases |
| Thay thế | Flagger | v1.45.0 | Apache-2.0 | Thuộc Flux | Thấp | Đi cùng Flux | https://github.com/fluxcd/flagger/releases |
| Thăng cấp môi trường | Kargo | v1.12.3 | Apache-2.0 | Akuity, không thuộc CNCF | Thấp | Đọc thêm | https://github.com/akuity/kargo/releases |
| Cập nhật image | argocd-image-updater | v1.3.1 | Apache-2.0 | Hoạt động | Thấp | Tuỳ chọn | — |

### 1.7. Observability (D12, D16)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| Metric **chính** | Prometheus | **v3.15.0** (25/09/2026) | Apache-2.0 | **G** | Cao | Bài phải dùng cú pháp và UI của v3 (UTF-8 metric names, OTLP receiver) | https://github.com/prometheus/prometheus/releases |
| Cảnh báo | Alertmanager | v0.34.1 | Apache-2.0 | **G** | Cao | — | https://github.com/prometheus/alertmanager/releases |
| Gói cài | kube-prometheus-stack | chart **92.2.0**, prometheus-operator v0.94.1 | Apache-2.0 | Hoạt động | Cao | Cách nhanh nhất có Prometheus, Grafana và Alertmanager trên kind | https://github.com/prometheus-community/helm-charts/releases |
| Dashboard | Grafana | **v13.2.3** | **AGPL-3.0** | Hoạt động | Cao | Bài viết cho Grafana 10/11 sẽ lệch giao diện | https://github.com/grafana/grafana/releases |
| Log pick A | Loki + **Alloy** | Loki v3.7.8, Alloy v1.20.1 | Loki AGPL-3.0, Alloy Apache-2.0 | Hoạt động | TB–Cao | **Promtail hết hạn 02/03/2026** và **Grafana Agent đã archived**. Thu thập log phải dùng Alloy (hoặc OTel Collector, Fluent Bit v5.1.3) | https://grafana.com/docs/alloy/latest/set-up/migrate/from-promtail/ · https://github.com/grafana/loki/releases |
| Log pick B | ELK / OpenSearch | Elasticsearch v9.5.5, OpenSearch 3.9.0 | ES: AGPL-3.0 / SSPL / ELv2 (ba lựa chọn). OpenSearch: Apache-2.0 | Hoạt động | **Cao ở Việt Nam** (ELK) | Lab nên dùng OpenSearch (Apache) hoặc ES single-node theo AGPL | https://github.com/elastic/elasticsearch/releases · https://github.com/opensearch-project/OpenSearch/releases |
| Trace và telemetry | OpenTelemetry Collector + Operator | Collector (contrib) v0.162.0, Operator v0.160.0 | Apache-2.0 | **G** | Đang tăng (có trong tin tuyển dụng Việt Nam) | Collector vẫn ở 0.x, cần ghi phiên bản chính xác | https://github.com/open-telemetry/opentelemetry-collector-releases/releases |
| Trace backend | Tempo / Jaeger | Tempo v3.1.0 (AGPL), Jaeger v2.22.0 (Apache, **G**) | — | Hoạt động | TB | Jaeger v2 xây trên OTel Collector | Các trang releases |
| Metric dài hạn | Mimir / Thanos / VictoriaMetrics | Mimir 3.2.2 (AGPL), Thanos v0.42.4 (**I**), VictoriaMetrics v1.153.0 (Apache) | — | Hoạt động | TB | Chỉ giới thiệu ở D16/D19 | Các trang releases |
| Profiling | Pyroscope | v2.3.2 | AGPL-3.0 | Hoạt động | Thấp | Tuỳ chọn | https://github.com/grafana/pyroscope/releases |
| On-call | ~~Grafana OnCall OSS~~ | — | AGPL | **Archived** (maintenance từ 03/2025, archived 2026) | — | Dùng route của Alertmanager hoặc công cụ khác | https://grafana.com/blog/grafana-oncall-maintenance-mode/ |

### 1.8. Bảo mật (D15)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| Secrets server (pick "Vault") | HashiCorp Vault | **v2.1.2** (07/10/2026). Vault 2.0 ra 04/2026 theo chính sách hỗ trợ của IBM | **BSL 1.1** | Hoạt động | **Cao** (từ khoá "Vault") | Học và dùng nội bộ vẫn được, nhưng không phải open source | https://github.com/hashicorp/vault/releases · https://infoq.com/news/2026/04/vault-2-0-ibm-identity/ |
| Bản open source | **OpenBao** | v2.7.1 (01/10/2026) | **MPL-2.0** | Linux Foundation (OpenSSF, thứ cấp) | Thấp, đang tăng | API tương thích Vault 1.14, có namespaces miễn phí. **Gợi ý cho lab**: dạy khái niệm "Vault" và chạy OpenBao, kèm callout về khác biệt | https://github.com/openbao/openbao/releases |
| Đồng bộ secret | External Secrets Operator | dòng 2.x (Helm chart 2.12.0, 06/10/2026) | Apache-2.0 | **S**. Từng tạm dừng phát hành 08/2025, nay đã hoạt động lại | TB | Có CVE 2026 (CVE-2026-42876, sửa từ 2.4.1). Ghi rõ phiên bản | https://github.com/external-secrets/external-secrets/releases · https://infisical.com/blog/external-secrets-operator-paused.md (thứ cấp) |
| Mã hoá file | SOPS + age | SOPS v3.13.3 (**S**), age v1.3.2 | MPL-2.0 / BSD-3 | Hoạt động | TB | Hợp GitOps (Flux giải mã SOPS sẵn) | https://github.com/getsops/sops/releases |
| Policy **chính** | Kyverno | v1.19.1 | Apache-2.0 | **G** | TB | YAML, dễ học hơn Rego | https://github.com/kyverno/kyverno/releases |
| Policy thay thế | OPA Gatekeeper | v3.23.1 | Apache-2.0 | OPA **G** | TB | Có thể dạy ValidatingAdmissionPolicy (CEL, có sẵn trong k8s) làm bước nền | https://github.com/open-policy-agent/gatekeeper/releases |
| Runtime security | Falco / Tetragon | Falco 0.45.0 (**G**), Tetragon v1.7.1 (thuộc Cilium) | Apache-2.0 | Hoạt động | Thấp–TB | Tuỳ chọn | Các trang releases |
| Posture | Kubescape | v4.0.15 | Apache-2.0 | **I** | Thấp | Quét theo NSA/CIS | https://github.com/kubescape/kubescape/releases |
| Danh tính workload | SPIFFE / SPIRE | SPIRE v1.15.3 | Apache-2.0 | **G** | Thấp | Đọc thêm | https://github.com/spiffe/spire/releases |
| Truy cập | Teleport | v18.10.0 | Mã nguồn AGPL-3.0. **Binary Community Edition từ v16 dùng giấy phép riêng**: chỉ miễn phí cho tổ chức dưới 100 nhân viên VÀ doanh thu dưới 10 triệu USD | Hoạt động | Thấp | Chỉ nhắc, không làm lab chính | https://github.com/gravitational/teleport/discussions/39158 |
| Pod Security Admission | có sẵn trong k8s (Pod Security Standards) | — | — | Stable | — | Dạy trực tiếp | — |

### 1.9. Service mesh (D18)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Tuyển dụng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|---|
| **Chính** | Istio (sidecar và **ambient**) | **1.31.1**. 1.31 phát hành 31/08/2026, hỗ trợ k8s 1.32–1.36 | Apache-2.0 | **G**. Ambient GA từ 1.24 (11/2024). Ambient multicluster ở mức beta, 1.31 tập trung sửa lỗi | TB | **Lưu ý**: 1.31.0 chỉ ghi hỗ trợ tới k8s 1.36. Lab trên kind 1.37 cần kiểm hoặc chọn node 1.36. Istio không còn đẩy image và chart lên Google Cloud | https://istio.io/news/releases/1.31.x/announcing-1.31/ · https://github.com/istio/istio/releases |
| Thay thế | Linkerd | edge-26.10.1 (repo). Bản stable chỉ có qua **Buoyant Enterprise (BEL 2.20)** | Mã nguồn Apache-2.0. Binary stable thương mại, miễn phí cho công ty dưới 50 nhân viên | **G** | Thấp | Open source chỉ còn bản edge (gần như hằng tuần). Bài phải ghi rõ "edge-YY.MM.N" | https://www.buoyant.io/articles/how-linkerd-licensing-actually-works-apache-2-0-edge-releases-and-what-bel-pays-for |
| eBPF | Cilium Service Mesh / Gateway | Cilium v1.20.2 | Apache-2.0 | **G** | TB, đang tăng | Có thể dùng chung cho topic "eBPF và Cilium" | https://github.com/cilium/cilium/releases |

### 1.10. Platform, FinOps, chaos, kiểm thử tải (D16, D19)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|
| IDP **chính** | Backstage | v1.55.3 | Apache-2.0 | **I** | Nặng (Node.js), lab bằng `npx @backstage/create-app` và Software Template | https://github.com/backstage/backstage/releases |
| IDP SaaS | Port | — | Thương mại | — | Chỉ nhắc so sánh | https://www.port.io |
| Control plane | Crossplane v2.4.2 (**G**), KubeVela v1.11.0 (**I**) | — | Apache-2.0 | — | Crossplane là lựa chọn chính | Các trang releases |
| FinOps **chính** | OpenCost | v1.121.3 | Apache-2.0 | **I** | Chạy được trên kind với giá mặc định | https://github.com/opencost/opencost/releases |
| FinOps thương mại | Kubecost (IBM, mua từ 09/2024) | v3.3.0 | Thương mại (lõi là OpenCost) | Hoạt động | Gói Free của v3 giới hạn khoảng 100 nghìn USD chi tiêu mỗi 30 ngày | https://docs.aws.amazon.com/eks/latest/userguide/cost-monitoring-kubecost-bundles.html |
| Chaos | Chaos Mesh v2.8.4 (**I**) / Litmus 3.32.0 (**I**) | — | Apache-2.0 | Hoạt động | Chaos Mesh dễ cài trên kind | Các trang releases |
| Kiểm thử tải | Grafana k6 | **v2.3.0** (đã lên major 2) | AGPL-3.0 | Hoạt động | Bài viết cho k6 0.x hoặc 1.x cần cập nhật | https://github.com/grafana/k6/releases |

### 1.11. Database và operator stateful (D13, D17)

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|
| PostgreSQL **chính** | CloudNativePG | v1.30.1 | Apache-2.0 | **S** | Ví dụ CRD và Operator tốt nhất, có backup và PITR. Nên kiểm lại cơ chế backup hiện hành (plugin Barman Cloud thay cho `barmanObjectStore` cũ) | https://github.com/cloudnative-pg/cloudnative-pg/releases |
| Kafka | Strimzi | **1.2.0**. 1.0.0 ra 04/2026 | Apache-2.0 | **I** | Chỉ còn API **v1** (bỏ v1beta2). Kafka 4.x **chỉ chạy KRaft**, không còn ZooKeeper | https://strimzi.io/blog/2026/04/28/what-is-new-in-strimzi-1.0.0/ |
| Cache | Valkey | 9.1.2 | BSD-3-Clause | Linux Foundation | Ưu tiên Valkey thay Redis vì giấy phép (Redis ≥ 7.4 dùng RSAL/SSPL, Redis 8 thêm AGPL) | https://github.com/valkey-io/valkey/releases |
| Operator cache | OT-Container-Kit redis-operator | v0.27.0 (09/10/2026) | Apache-2.0 | Hoạt động | Chưa có Valkey operator chính thức ổn định. **spotahome/redis-operator archived 06/2026** | https://github.com/OT-CONTAINER-KIT/redis-operator/releases |
| Sao lưu cụm | Velero | v1.18.4. **Repo chuyển sang `velero-io/velero`** | Apache-2.0 | Hoạt động | D17 "Sao lưu tài nguyên cụm" | https://github.com/velero-io/velero/releases |

### 1.12. Giả lập cloud cục bộ và S3

| Vai trò | Công cụ | Phiên bản | Giấy phép | Tình trạng | Ghi chú và lý do | Nguồn |
|---|---|---|---|---|---|---|
| ~~Giả lập AWS cũ~~ | LocalStack | Repo community v4.14.0, **archived 23/03/2026**. Bản hợp nhất dùng calendar versioning (2026.03.0 trở đi) | Image hợp nhất là thương mại | **Bắt buộc có tài khoản và auth token** (kể cả trong CI). Gói Hobby miễn phí chỉ cho mục đích **phi thương mại** | Không dùng làm lab mặc định vì người học phải tạo tài khoản bên thứ ba | https://github.com/localstack/localstack · https://blog.localstack.cloud/localstack-single-image-next-steps/ |
| Giả lập AWS **chính** | **MiniStack** | v1.5.24 (08/10/2026) | MIT | Hoạt động (dự án mới, 2026) | Cổng 4566, thay thế trực tiếp LocalStack, hơn 60 dịch vụ, chạy được với Terraform. Số liệu về hiệu năng do dự án tự công bố | https://github.com/ministackorg/ministack · https://ministack.org/ |
| Giả lập AWS thay thế | **Floci** | 2.2.0 (06/10/2026) | MIT | Hoạt động (khoảng 26 nghìn sao) | "No account, no auth token", cổng 4566, hướng dẫn chuyển từ LocalStack | https://github.com/floci-io/floci |
| Giả lập trong test | Moto | 5.2.3 | Apache-2.0 | Hoạt động | Lâu năm, có server mode | https://github.com/getmoto/moto/releases |
| ~~S3 tự host cũ~~ | MinIO | RELEASE.2025-10-15, **archived 25/04/2026**. minio/operator archived 20/03/2026 | AGPL | Không còn image cộng đồng | **Không dùng** | https://github.com/minio/minio |
| S3 **chính** | SeaweedFS | 4.48 (28/09/2026) | Apache-2.0 | Hoạt động hơn 10 năm | Ổn định, có `weed server -s3` một container | https://github.com/seaweedfs/seaweedfs/releases |
| S3 thay thế | RustFS | **1.0.1**. 1.0 GA 09/2026 | Apache-2.0 | Mới GA | Giống MinIO nhất về trải nghiệm. **Các bản beta từng có CVE nghiêm trọng** (khoá RSA hard-code, CVE-2026-45041), phải dùng ≥ 1.0 | https://github.com/rustfs/rustfs/releases · https://linuxiac.com/rustfs-1-0-s3-compatible-object-storage-reaches-ga/ |
| S3 thay thế | Garage | v2.4.1 | **AGPL-3.0** | Hoạt động (repo chính ở git.deuxfleurs.fr) | Nhẹ, nhưng API S3 hẹp hơn | https://git.deuxfleurs.fr/Deuxfleurs/garage/releases |

### 1.13. Cloud chính để dạy (D9)

| Tiêu chí | AWS | Azure | GCP | Nguồn |
|---|---|---|---|---|
| Thị phần hạ tầng cloud Q2/2026 (Synergy, thứ cấp) | **28%** (giảm từ 30%) | 20–21% | 15% (tăng từ 13%) | https://www.articsledge.com/post/cloud-market-share · https://www.statista.com/chart/18819/worldwide-market-share-of-leading-cloud-infrastructure-service-providers/ |
| Hiện diện tại Việt Nam | **Local Zone Hà Nội GA 19/06/2026** (`ap-southeast-1-han-1a`, có EC2, EKS, S3, EBS, ALB). Khách hàng: VIB, VPBank, GSM | Chưa có region | Chưa có region (chỉ có tin data center năm 2024) | https://aws.amazon.com/about-aws/whats-new/2026/06/aws-local-zones-hanoi-vietnam/ |
| Tuyển dụng tại Việt Nam (mẫu tin) | **Áp đảo** (AWS + Terraform + EKS) | Có ở công ty dùng hệ sinh thái Microsoft hoặc outsource cho thị trường Nhật, châu Âu | Ít hơn | Các tin trên JobOKO và JobsGO (thứ cấp) |
| Gói miễn phí hiện hành | Tài khoản mới từ 15/07/2025: tối đa **200 USD credit** (100 USD khi đăng ký cộng 100 USD khi làm nhiệm vụ), **gói Free tối đa 6 tháng**, hết hạn thì đóng tài khoản (giữ dữ liệu 90 ngày). Hơn 30 dịch vụ luôn miễn phí | 200 USD trong 30 ngày, kèm một số dịch vụ miễn phí 12 tháng | 300 USD trong 90 ngày, kèm e2-micro luôn miễn phí | https://aws.amazon.com/free/free-tier-faqs/ · https://azure.microsoft.com/free · https://cloud.google.com/free |

**Khuyến nghị**: dạy **AWS** làm mặc định (thị phần lớn nhất, áp đảo trong tuyển dụng tại Việt Nam, đã có Local Zone Hà Nội). Giữ GCP và Azure ở dạng bảng đối chiếu khái niệm. Lab chạy trên MiniStack hoặc Floci trước, chỉ đụng tới AWS thật ở các bước cần như IAM, VPC hay EKS, có callout về chi phí và nhắc đặt AWS Budgets.

---

## 2. Danh sách "bẫy" (không dạy nữa hoặc phải cảnh báo)

1. **Ingress-NGINX**: retire 03/2026, repo archived 24/03/2026, không còn bản vá CVE. Đừng dạy cài mới. Dạy Gateway API và `ingress2gateway`. (InGate, ứng viên thay thế, cũng đã retire 06/2026.)
2. **MinIO và MinIO Operator**: archived (04/2026 và 03/2026). Không còn image cộng đồng. Thay bằng SeaweedFS, RustFS hoặc Garage.
3. **LocalStack Community**: repo archived 23/03/2026. Image hợp nhất bắt buộc auth token, gói miễn phí chỉ cho mục đích phi thương mại. Thay bằng MiniStack, Floci hoặc Moto.
4. **Bitnami images và charts**: từ 28/08 đến 29/09/2025, image theo phiên bản chuyển sang `bitnamilegacy` (không còn vá), bản đầy đủ phải trả phí (Bitnami Secure Images). **Tránh các chart Bitnami** cho PostgreSQL, Redis, Kafka trong lab. Dùng CNPG, Strimzi, Valkey và image chính thức. (Nguồn chủ yếu là thứ cấp năm 2025, nên kiểm lại.)
5. **Promtail** (EOL 02/03/2026), **Grafana Agent** (EOL 11/2025, repo archived), **Grafana OnCall OSS** (archived): dùng Alloy hoặc OTel Collector.
6. **Kubernetes Dashboard**: archived 21/01/2026. Dùng Headlamp hoặc k9s.
7. **Helm 3**: chỉ còn vá bảo mật tới **10/02/2027**. Bài mới viết cho Helm 4 (SSA, kstatus `--wait`, cờ đổi tên).
8. **tfsec**: không phát hành từ 05/2025, đã gộp vào Trivy (`trivy config`). **CDKTF** archived 12/2025.
9. **Trivy, trivy-action, setup-trivy (03/2026)**: tag action bị chiếm và cài mã độc (CVE-2026-33634, nằm trong danh sách KEV của CISA). Dùng tiếp Trivy được (v0.75.0) nhưng **mọi bài CI phải pin action theo commit SHA** và nhắc xoay vòng secret. Đây là case study rất tốt cho D8.
10. **Terraform và Vault đã chuyển sang BSL 1.1** (không phải OSS). Gói Free cũ của HCP Terraform hết hạn 31/03/2026 (gói mới giới hạn 500 resource). Học vẫn được, nhưng cần nêu OpenTofu và OpenBao như lựa chọn mở.
11. **Docker Desktop**: giấy phép thương mại (miễn phí khi dưới 250 nhân viên VÀ dưới 10 triệu USD doanh thu). Người học đi làm ở công ty lớn cần biết. Lab nên dùng Docker Engine trong Lima.
12. **Podman 6**: bỏ hỗ trợ **Mac Intel** và Windows 10, bỏ CNI, iptables, cgroups v1. Repo đổi org. Hướng dẫn cũ dùng `podman machine` trên Mac Intel sẽ hỏng.
13. **Ubuntu 26.04 LTS**: `sudo` và coreutils mặc định là bản viết bằng Rust. Một số cờ hiếm có thể khác GNU. Bài D1/D3 phải ghi `verified` trên 26.04 và chỉ cách chuyển về GNU nếu cần.
14. **Linkerd**: open source chỉ còn bản edge. Binary stable (BEL) miễn phí cho công ty dưới 50 nhân viên. Đừng ghi "Linkerd stable 2.x" như sản phẩm OSS.
15. **Teleport Community Edition** (từ v16): binary không còn Apache, chỉ miễn phí cho tổ chức dưới 100 nhân viên.
16. **Redis**: giấy phép đã đổi (RSAL/SSPL, sau đó thêm AGPL). Dạy Valkey. `spotahome/redis-operator` archived 06/2026.
17. **Flux v1** (archived 2022), **Weave GitOps** (Weaveworks đã đóng cửa, repo chỉ có rc lẻ tẻ): không dạy.
18. **Kubernetes 1.34 hết hạn 27/10/2026.** kube-proxy IPVS đang deprecate, kube-dns deprecated. Bài dùng k8s 1.37 (hoặc 1.36 nếu Istio chưa hỗ trợ 1.37).
19. **Kafka ZooKeeper**: Kafka 4.x chỉ chạy KRaft. Strimzi ≥ 1.0 chỉ còn CRD v1.
20. **Jenkins** cần **Java 21+**. Hướng dẫn cũ chạy Jenkins trên Java 17 không dùng được với LTS mới.
21. **Provider Terraform `kubernetes` và `helm` lên v3**: cú pháp khối provider khác v2, cần ghi phiên bản trong `required_providers`.
22. **cosign v3**: định dạng bundle mặc định và các cờ đã thay đổi. v4 sẽ xoá cờ deprecated. Ghi đúng phiên bản trong `verified`.

---

## 3. Khuyến nghị bộ công cụ chuẩn cho roadmap

Nguyên tắc chọn:

- **Chạy được trên MacBook của người học** (Apple Silicon, có phương án cho Intel), không cần tài khoản bên thứ ba.
- **Giấy phép mở** cho phần lab bắt buộc. Công cụ BSL hoặc thương mại vẫn dạy nếu thị trường cần, kèm callout.
- **Khớp tin tuyển dụng tại Việt Nam**: AWS, Terraform, Kubernetes, ArgoCD, GitLab/GitHub, Prometheus, Grafana, ELK/Loki, Ansible, Vault.
- Ghi phiên bản chính xác và digest image trong `verified`.

| Chặng | Mặc định (lab) | Lựa chọn trong pick hoặc callout |
|---|---|---|
| **D0** | Lima 2.2 → VM Ubuntu 26.04 LTS. Docker Engine 29 trong Lima (template `docker`) và `docker` CLI trên Mac. **kind 0.33** (node 1.37.0, pin digest). kubectl 1.37, Helm 4.3, k9s, jq, yq | k3d 5.9 / k3s 1.37. Docker Desktop 4.94 (callout giấy phép). Podman 6 (không dùng được trên Mac Intel) |
| **D1** | Ubuntu 26.04 LTS (callout sudo-rs và uutils coreutils) | Debian 13, Rocky/Alma 10 để đối chiếu `dnf` |
| **D2** | Nginx (pick) trên Ubuntu 26.04 | Caddy (**chưa kiểm phiên bản trong báo cáo này**) |
| **D3** | Bash, jq. Python 3 có sẵn trên 26.04 | Go |
| **D4** | GitHub (đi cùng Actions và GHCR) | GitLab CE (phổ biến khi tự host ở Việt Nam) |
| **D6** | Docker Engine 29, BuildKit 0.34/buildx 0.38, Compose v5, Trivy 0.75 (pin) | Podman 6 (`[opt]`), Grype |
| **D7** | **GitHub Actions** (pin SHA, `act` để chạy cục bộ, self-hosted runner trong Lima). Cache của BuildKit | GitLab CI 19.x, Jenkins LTS 2.568 (Java 21) |
| **D8** | Zot làm registry lab, GHCR. cosign 3 (keyless và key-pair), Syft → CycloneDX 1.7 và SPDX 3, Grype hoặc Trivy, Dependabot, **SLSA 1.2** (build provenance qua GitHub attestations). **Case study Trivy 03/2026** | Harbor 2.15 (doanh nghiệp), Renovate (AGPL), Notation |
| **D9** | **AWS** (IAM, VPC, EC2, ECS/EKS, S3, RDS, Budgets). Lab đầu dùng **MiniStack** hoặc **Floci** trên cổng 4566 | GCP, Azure (đối chiếu khái niệm). Moto. LocalStack (callout bắt buộc tài khoản) |
| **D10** | **Pick Terraform 1.16 / OpenTofu 1.13**. Mã lab nằm trong **tập con chung** (không dùng `store` hay mã hoá state ở phần bắt buộc), kiểm cả `terraform` lẫn `tofu`. Provider: kind 0.11, docker 4.6, kubernetes 3.3, helm 3.3, aws (trỏ MiniStack). **Ansible (ansible-core 2.21) nên có lab thật** vì tin tuyển dụng Việt Nam hay yêu cầu | Terragrunt 1.1, Atlantis, Pulumi (`[opt]`). Checkov và `trivy config` cho policy. Conftest |
| **D11** | k8s 1.37 trên kind. **Gateway API 1.6 + Envoy Gateway 1.9**. Calico 3.33 hoặc Cilium 1.20 cho NetworkPolicy. cert-manager 1.21 | NGINX Gateway Fabric 2.7, Traefik 3.7. Ingress (chỉ đọc) và `ingress2gateway` 1.2 |
| **D12** | **kube-prometheus-stack 92** (Prometheus 3.15, Alertmanager 0.34, Grafana 13.2). Pick **Loki 3.7 + Alloy 1.20**. OTel Collector 0.162 và Operator 0.160. Tempo 3.1 hoặc Jaeger 2.22 cho trace | ELK: OpenSearch 3.9 (Apache) hoặc Elasticsearch 9.5 (AGPL). Fluent Bit 5.1 |
| **D13** | **kubeadm** trên 2–3 VM Lima (lab nâng cấp 1.36 → 1.37, sao lưu etcd). Helm 4.3 hoặc Kustomize 5.8. metrics-server 0.9, HPA, VPA, KEDA 2.21. **CNPG 1.30** làm ví dụ Operator. Headlamp | EKS (pick "dịch vụ quản lý"). Karpenter 1.14 (chỉ AWS). Talos |
| **D14** | **Argo CD 3.5** và Argo Rollouts 1.10 | Flux 2.9 + Flagger 1.45. Kargo (đọc thêm) |
| **D15** | **External Secrets Operator 2.x** + **OpenBao 2.7** (khái niệm Vault, giấy phép mở), SOPS + age. **Kyverno 1.19**. PSA. Quét bằng Trivy, Checkov, Kubescape trong pipeline | Vault 2.1 (BSL, callout). Gatekeeper 3.23. AWS KMS / Secrets Manager. Falco 0.45 |
| **D16** | Prometheus và Alertmanager (SLO, burn rate), k6 2.3, Chaos Mesh 2.8 | Litmus 3.32. Sloth/Pyrra (**chưa kiểm**) |
| **D17** | CNPG backup và PITR lên **SeaweedFS S3** trong cụm. `etcdctl snapshot`. **Velero 1.18** (repo `velero-io`) | RustFS 1.0, Garage 2.4, Longhorn snapshot |
| **D18** | **Istio 1.31 ambient** (kiểm tương thích k8s 1.37, nếu chưa được thì dùng node kind 1.36.4). Cilium 1.20 cho eBPF | Linkerd edge (callout giấy phép stable). Tetragon |
| **D19** | Backstage 1.55 (Software Template), Crossplane 2.4, **OpenCost 1.121**, vcluster 0.37 | Port (SaaS), KubeVela, Kubecost 3 (IBM) |

### Ghi chú triển khai cho bài học

- **Ma trận phiên bản**: nên có một file dữ liệu chung, ví dụ `content/devops-versions.json` hoặc một trang tham chiếu, giữ kind node digest, Helm chart version và image tag. Như vậy cập nhật một chỗ là đủ, và `verified` của từng bài trỏ về đó. (Đây là đề xuất, chưa kiểm cấu trúc repo để thực hiện.)
- **Pin mọi thứ**: GitHub Action theo SHA, image theo digest, Helm chart theo `--version`, provider Terraform theo `~>`.
- **Nhịp rà soát**: Kubernetes ra minor mỗi khoảng 4 tháng (1.38 dự kiến 12/2026), Helm và Argo CD mỗi khoảng 3 tháng, OTel Collector 2 tuần một lần. Nên rà `verified` theo quý.

---

## 4. Chưa kiểm được hoặc cần xác minh thêm

- Phiên bản Nginx, Caddy, Sloth/Pyrra, kubectl plugin (krew), yq: chưa kiểm.
- Kindnet (CNI mặc định của kind) có thực thi NetworkPolicy hay không: chưa xác minh với kind 0.33.
- Istio 1.31 với Kubernetes 1.37: thông báo 1.31.0 chỉ ghi tới 1.36. Cần xem trang "supported releases" của Istio cho 1.31.1.
- Cơ chế backup hiện hành của CNPG 1.30 (plugin Barman Cloud): cần đọc tài liệu CNPG trước khi viết D17.
- Tình trạng giấy phép, gói Hobby của LocalStack và giá thương mại: lấy từ blog LocalStack và nguồn thứ cấp.
- Bitnami: nguồn chủ yếu là năm 2025, chưa xác minh trạng thái tháng 10/2026.
- Mức phổ biến trong tuyển dụng tại Việt Nam là định tính, dựa trên mẫu tin. Chưa có số liệu thống kê (có thể dùng TopDev, ITviec để đếm từ khoá nếu cần).
- Không truy cập được trang giấy phép gốc của Docker. Điều kiện "dưới 250 nhân viên VÀ dưới 10 triệu USD" lấy từ nguồn thứ cấp 09/2026.

## 5. Nguồn chính (ngoài các link trong bảng)

- Phiên bản và archive: trang `github.com/<owner>/<repo>/releases/latest` và trang repo, quét ngày 09/10/2026.
- CNCF: https://www.cncf.io/projects/ · https://www.cncf.io/sandbox-projects/
- Kubernetes: https://kubernetes.io/releases/
- Helm 3 EOL: https://helm.sh/blog/helm-v3-end-of-life
- Ingress-NGINX: https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/
- LocalStack: https://blog.localstack.cloud/localstack-single-image-next-steps/ · https://blog.localstack.cloud/localstack-for-aws-release-2026-03-0/
- MinIO và các lựa chọn thay thế: https://pinggy.io/blog/minio_archived_self_hosted_s3_alternatives/ · https://glukhov.org/data-infrastructure/object-storage/self-hosted-s3-alternatives/
- Trivy incident: https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know · https://snyk.io/articles/trivy-github-actions-supply-chain-compromise/
- Promtail và Alloy: https://grafana.com/docs/alloy/latest/set-up/migrate/from-promtail/
- Bitnami: https://northflank.com/blog/bitnami-deprecates-free-images-migration-steps-and-alternatives (thứ cấp)
- Podman 6: https://blog.podman.io/2026/08/ · https://computingforgeeks.com/podman-6-breaking-changes-upgrade/
- Lima: https://www.cncf.io/blog/2026/03/25/lima-v2-1-macos-guests-and-enhanced-ai-agent-safety/
- Vault 2.0: https://infoq.com/news/2026/04/vault-2-0-ibm-identity/
- Teleport license: https://github.com/gravitational/teleport/discussions/39158
- Kubecost: https://hl.com/about-us/transactions/kubecost-ibm/
- AWS Local Zone Hà Nội: https://technode.global/2026/06/20/aws-launches-first-local-zone-in-vietnam-with-single-digit-millisecond-latency-in-hanoi/
- Tuyển dụng tại Việt Nam (mẫu): https://vn.joboko.com/viec-lam-sr-devops-engineer-cloud-terraform-aws-up-to-50m-xvi6697252 · https://jobsgo.vn/viec-lam-ky-su-devops.html
