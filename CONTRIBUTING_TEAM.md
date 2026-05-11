# 团队二开协作工作流

> 本文档是 Sylanex 团队 fork 上游开源项目进行二次开发的通用工作流规范。
> 适用于本仓库及其他类似的 fork 项目（如 `cc-switch-dongli` 等）。
>
> 文档分两部分：
> - [通用流程](#一通用流程所有-fork-项目共享)：所有 fork 项目共用的分支模型、同步策略、协作规范
> - [部署形态适配](#二部署形态适配按项目类型选用)：按项目类型（Docker / 桌面客户端 / 服务器二进制）选择对应章节

---

## 一、通用流程（所有 fork 项目共享）

### 1.1 仓库远程配置

每个 fork 项目都应配置两个远程：

```bash
git remote -v
# origin    https://github.com/Sylanex/<repo>.git       (team 的 fork)
# upstream  https://github.com/<author>/<repo>.git      (原项目，只读)
```

如未配置 `upstream`：

```bash
git remote add upstream https://github.com/<author>/<repo>.git
git remote set-url --push upstream DISABLE  # 防止误推到上游
```

### 1.2 分支模型

```
upstream/main  ──●──●──●──●──●─────  原项目（只读）
                  ╲    ╲    ╲
origin/main    ────●────●────●─────  fork 的 main，仅做上游同步中转
                       ╲    ╲
origin/team   ──────────●────●─────  团队二开主线（4 人协作的基准）
                          ╲
                feature/* ─●         个人功能分支，PR 合到 team
```

- **`main`**：保持是 upstream 的镜像。**禁止**直接在 main 上提交业务代码。
- **`team`**：团队二开主线。受保护，只能通过 PR 合入。
- **`feature/<your-name>/<topic>`**：个人功能分支，命名约定 `feature/alice/oauth-fix`。

### 1.3 分支保护规则（GitHub Settings → Branches）

对 `team` 和 `main` 启用：

- ✅ Require a pull request before merging
- ✅ Require approvals: **至少 1 人**
- ✅ Require status checks to pass before merging（勾上 CI 关键作业）
- ✅ Require branches to be up to date before merging
- ❌ 不勾 "Allow force pushes"

### 1.4 日常开发流程

```bash
# 1. 从最新 team 切功能分支
git switch team
git pull
git switch -c feature/<your-name>/<topic>

# 2. 写代码、提交
git add -p
git commit -m "feat: ..."

# 3. 推送并发 PR
git push -u origin feature/<your-name>/<topic>
# → 在 GitHub 上发 PR，目标分支选 team

# 4. 至少 1 人 review 通过后 squash merge
```

**Commit message 规范**：沿用 Conventional Commits（`feat:` / `fix:` / `chore:` / `docs:` 等），与上游保持一致，方便 cherry-pick 和反向贡献。

### 1.5 上游同步流程（每周或上游发版后执行一次）

由值班人员（轮流）执行：

```bash
# 1. 拉取上游最新
git fetch upstream

# 2. 把上游 main 同步到 origin/main
git switch main
git merge upstream/main           # 用 merge，不用 rebase
git push origin main

# 3. 把上游变更合入 team
git switch team
git pull
git merge main                    # 解决冲突 → 跑测试
git push origin team
```

**冲突处理原则**：
- 优先保留团队侧改动（毕竟是二开重点）
- 上游对**公共基础设施**（CI、依赖、安全补丁）的改动则倾向接受
- 大冲突无法独自决断时，开 issue 拉所有改过相关代码的人一起看

**为什么用 merge 而不是 rebase**：`team` 是被多人 push 的长期分支，rebase 会重写历史，强推会让其他人的本地分支全部错乱。merge 的合并节点虽不那么"干净"，但安全得多。

### 1.6 版本号约定

无论项目是什么部署形态，团队发布物统一用以下版本号方案：

```
v<upstream-version>-team.<n>
```

例：上游最新是 `v0.1.125`，团队基于它的第 1 个发布版叫 `v0.1.125-team.1`，第 2 个叫 `v0.1.125-team.2`。

**好处**：
- 不与上游 tag 冲突（pull 上游 tag 不会撞车）
- 一眼看出基线版本
- 符合 semver pre-release 规范，包管理器和构建工具都认

### 1.7 产物渠道

每个 fork 项目都应提供两类产物：

| 渠道 | 用途 | 触发方式 |
|---|---|---|
| **`team-edge`** | 滚动构建，反映 `team` 分支最新状态 | 每次 push 到 `team` 自动触发 |
| **`v*-team.N`** | 正式发布版，固定不可变 | 打 tag 触发 |

具体产物形态见下方"部署形态适配"。

---

## 二、部署形态适配（按项目类型选用）

### 2.A Docker 镜像类（例：sub2api_dongli）

#### 镜像 tag 约定

| Tag | 用途 |
|---|---|
| `ghcr.io/sylanex/<image>:team-edge` | 团队最新构建，测试环境用 |
| `ghcr.io/sylanex/<image>:team-<short-sha>` | 每次构建的精确引用，回滚用 |
| `ghcr.io/sylanex/<image>:v0.1.125-team.1` | 正式发布版，生产环境用 |

#### CI 配置

- **滚动构建**：`.github/workflows/team-build.yml`，监听 `team` 分支 push
- **正式发布**：`.github/workflows/release.yml`（继承自上游），监听 `v*` tag

#### 部署流程

```bash
# 测试环境（用 team-edge）
echo "SUB2API_VERSION=team-edge" >> .env
docker compose -f deploy/docker-compose.local.yml pull
docker compose -f deploy/docker-compose.local.yml up -d

# 生产环境（固定版本）
git switch team && git pull
git tag -a v0.1.125-team.1 -m "首个团队正式版"
git push origin v0.1.125-team.1
# 等 CI 构建完成（GitHub Actions 页面查看进度）
# 然后在生产机：
echo "SUB2API_VERSION=v0.1.125-team.1" >> .env
docker compose -f deploy/docker-compose.local.yml pull
docker compose -f deploy/docker-compose.local.yml up -d
```

#### GHCR 镜像可见性

首次推送后，进 GitHub 仓库 → Packages → 对应镜像 → Package settings → Change visibility。
- **Public**：部署机无需登录，简单
- **Private**：部署机用 PAT `docker login ghcr.io`，更安全

---

### 2.B 桌面客户端类（例：cc-switch-dongli）

桌面客户端（Tauri / Electron 等）产物是用户下载的二进制安装包，不存在"服务端拉镜像"的概念。

#### 产物 tag 约定（GitHub Releases）

| Release | 用途 |
|---|---|
| Pre-release `team-edge` | 滚动构建，团队内部 dogfooding，**不对外发布** |
| Release `v0.1.125-team.1` | 正式发布版，可分发给用户 |

每个 release 附带各平台二进制：
- macOS：`.dmg`（Intel + Apple Silicon）
- Windows：`.msi` / `.exe`
- Linux：`.AppImage` / `.deb`

#### CI 配置

复用上游已有的 `release.yml`（Tauri 项目通常已用 `tauri-apps/tauri-action`），仅需：

1. 新增 `.github/workflows/team-build.yml`，监听 `team` 分支 push
2. 构建产物上传到一个**滚动更新**的 GitHub pre-release（tag `team-edge`），用 `softprops/action-gh-release` 的 `make_latest: false` + 删除旧 release 重建
3. 正式发布：打 `v*-team.N` tag 触发已有的 release.yml

#### 自动更新（Tauri updater）

如果上游已配置 Tauri updater：

- 团队版本的 `latest.json` 单独维护，**不复用上游的更新源**
- 在 `tauri.conf.json` 把 `updater.endpoints` 改成指向团队自己的 GitHub release JSON：
  ```
  https://github.com/Sylanex/<repo>/releases/latest/download/latest.json
  ```
- `team-edge` 构建不更新该 JSON（避免用户自动升级到不稳定版）

#### 分发流程

```bash
# 团队内部测试：从 GitHub pre-release "team-edge" 下载
# 生产分发：
git switch team && git pull
git tag -a v0.1.125-team.1 -m "Team release"
git push origin v0.1.125-team.1
# CI 构建完成后，在 GitHub Releases 把对应 release 从 draft 改为 published
# 用户即可通过 updater 收到推送
```

---

### 2.C 服务器二进制 / 单独构建部署类

直接构建二进制 + 配置文件，rsync 或 scp 到服务器运行的项目（无 Docker 化、无客户端分发）。

#### 产物约定

打包成 tarball，上传到 GitHub Releases：

```
<repo>-v0.1.125-team.1-linux-amd64.tar.gz
<repo>-v0.1.125-team.1-linux-arm64.tar.gz
```

包内含：编译好的二进制、`config.example.yaml`、systemd unit、启动脚本。

#### CI 配置

- **滚动构建**：`team-build.yml` 监听 `team` 分支，构建二进制，上传到 `team-edge` pre-release
- **正式发布**：tag 触发，可用 GoReleaser / cargo-dist / 自定义脚本

#### 部署流程

```bash
# 在服务器上
VERSION=v0.1.125-team.1
curl -L https://github.com/Sylanex/<repo>/releases/download/${VERSION}/<repo>-${VERSION}-linux-amd64.tar.gz \
  | tar xz -C /opt/<repo>
systemctl restart <repo>
```

建议在 `/opt/<repo>/current` 保留软链，方便快速回滚：

```bash
ln -sfn /opt/<repo>/releases/${VERSION} /opt/<repo>/current
systemctl restart <repo>
# 回滚：
ln -sfn /opt/<repo>/releases/${PREV_VERSION} /opt/<repo>/current
systemctl restart <repo>
```

---

## 三、新 fork 项目初始化清单

每次新增 fork 项目，按此清单走一遍：

- [ ] 在 GitHub 上 fork 原项目到 `Sylanex/<repo>`
- [ ] 本地 clone，配置 `upstream` 远程（见 [1.1](#11-仓库远程配置)）
- [ ] 从 `main` 创建 `team` 分支：`git switch -c team main && git push -u origin team`
- [ ] 设置 GitHub 分支保护（见 [1.3](#13-分支保护规则github-settings--branches)）
- [ ] 把本文档复制到新仓库根目录，按项目类型保留对应章节
- [ ] 根据部署形态（A/B/C）配置 `.github/workflows/team-build.yml`
- [ ] 指定一名值班人员负责每周上游同步
- [ ] 在团队 Wiki / Notion 登记该项目的：上游地址、当前基线版本、值班人

---

## 四、项目特定信息（cc-switch-dongli）

> 此节为本仓库特有。其他 fork 项目复制本文档后，应替换为各自项目的信息。

- **上游**：[farion1231/cc-switch](https://github.com/farion1231/cc-switch)
- **部署形态**：桌面客户端（Tauri 应用），适配章节 [2.B](#2b-桌面客户端类例cc-switch-dongli)
- **产物渠道**：GitHub Releases（团队 fork 的 release 页）
- **滚动构建 CI**：[.github/workflows/team-build.yml](.github/workflows/team-build.yml)
- **正式发布 CI**：[.github/workflows/release.yml](.github/workflows/release.yml)
- **Tauri updater endpoint**：[src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) 中已指向 `https://github.com/Sylanex/cc-switch-dongli/releases/latest/download/latest.json`（团队 fork，无需修改）

### 关键约定

- **team-edge 构建不签名**：跳过 Apple 代码签名/公证、Tauri updater signing，仅作内部测试。macOS 首次打开需右键 → 打开。
- **正式发布走完整签名链路**：打 `v*-team.N` tag 触发 [release.yml](.github/workflows/release.yml)，含 Apple 签名+公证+Tauri updater signing+`latest.json` 生成。
- **Tauri updater 只追踪正式 release**：team-edge 标记为 `prerelease`，GitHub `/releases/latest` 端点会跳过它，用户不会被自动升级到不稳定版。

### 必备 GitHub Secrets（正式发布用，team-edge 不需要）

| Secret | 用途 |
|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | Tauri updater 签名私钥 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 私钥密码（如有） |
| `APPLE_CERTIFICATE` | macOS Developer ID Application 证书（.p12 base64） |
| `APPLE_CERTIFICATE_PASSWORD` | 证书密码 |
| `KEYCHAIN_PASSWORD` | CI 临时 keychain 密码 |
| `APPLE_ID` / `APPLE_PASSWORD` / `APPLE_TEAM_ID` | macOS 公证用 |

- **上游同步值班**：待指定
