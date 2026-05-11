# DongliAI-Switch 打包与发行指南

> 面向：内部研发同事 / 插件开发者 / 发布流程负责人
> 最后更新：2026-05-09

本文档讲清楚 **从代码到客户手里能装的 .dmg/.msi/.deb** 这条链路。读完你应能：

1. 在本机构建一个完整带签名的发布包
2. 理解自动更新原理，知道密钥在哪、谁能签名、出问题怎么排查
3. 当你改后端/加插件时，知道哪些动作会影响发布
4. 之后启动 CI 自动化时，知道要往哪些 Secrets 里塞东西

---

## 1. 项目概览

DongliAI-Switch 是基于上游 [farion1231/cc-switch](https://github.com/farion1231/cc-switch) 的二次开发版本，核心架构未动：

| 层 | 技术 | 输出 |
|---|---|---|
| 前端（界面） | React 18 + TypeScript + Vite | 静态 HTML/JS/CSS（打到 App 内置） |
| 后端（系统调用） | Rust + Tauri 2 | 平台 native 二进制 |
| 打包 | Tauri Bundler | `.dmg` / `.msi` / `.deb` / `.rpm` / `.AppImage` |

构建一次 `pnpm build` 同时跑：Vite 编前端 → Cargo 编 Rust → Tauri 把两者塞进平台安装包。

---

## 2. 构建产物清单

执行 `pnpm build` 后产物在 `src-tauri/target/release/bundle/`：

### macOS

```
bundle/macos/
├── DongliAI-Switch.app                # App 包（直接双击运行）
├── DongliAI-Switch.app.tar.gz         # 自动更新用的压缩包
└── DongliAI-Switch.app.tar.gz.sig     # 上面那个包的签名（验证更新真实性）

bundle/dmg/
└── DongliAI-Switch_3.14.1_aarch64.dmg # 给客户的安装包（Apple Silicon）
```

> Intel Mac 客户需要 `--target x86_64-apple-darwin`，或一次性出双架构 `--target universal-apple-darwin`。

### Windows

```
bundle/msi/
├── DongliAI-Switch_3.14.1_x64_en-US.msi
└── DongliAI-Switch_3.14.1_x64_en-US.msi.sig
```

### Linux

```
bundle/appimage/<file>.AppImage(.sig)
bundle/deb/<file>.deb
bundle/rpm/<file>.rpm
```

> `.sig` 仅给自动更新用；客户手动安装只要 `.dmg` / `.msi` / `.deb` 等本体。

---

## 3. 本地构建步骤

### 3.1 环境依赖

| 工具 | 版本 | 安装方式 |
|---|---|---|
| Node.js | ≥ 18 | `brew install node` 或 nvm |
| pnpm | ≥ 8 | `npm i -g pnpm` |
| Rust | 1.95（项目 [`rust-toolchain.toml`](../rust-toolchain.toml) 锁定） | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Tauri CLI | 2.8+（已在 `package.json` 里） | `pnpm install` 自动装 |

Linux 还需 `libwebkit2gtk-4.1-dev libgtk-3-dev` 等系统依赖，详见 [`.github/workflows/release.yml`](../.github/workflows/release.yml) 里的 `Install Linux system deps` 段落。

### 3.2 不带签名的构建（用于本地验证）

```bash
pnpm install               # 首次或依赖变更后
pnpm build
```

**注意**：当前 `tauri.conf.json` 设了 `"createUpdaterArtifacts": true` 且 `"pubkey"` 不为空，**最后一步会因找不到私钥而退出码 1**——但 `.dmg` 已经先生成了，照样能装。

### 3.3 带签名的完整构建（出正式发布物）

需要拿到私钥文件（参见 §4），然后**根据系统选对应命令**。

#### macOS / Linux（bash / zsh）

```bash
TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/dongli.key)" \
TAURI_SIGNING_PRIVATE_KEY_PASSWORD="" \
pnpm build
```

#### Windows（PowerShell）

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content $HOME\.tauri\dongli.key -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
pnpm build
```

成功后 `.tar.gz` 旁边会多一个 `.tar.gz.sig`，自动更新就靠它。

#### ⚠️ 三个常见坑

1. **环境变量名必须带 `SIGNING_` 这一段**
   - ✅ `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
   - ❌ `TAURI_PRIVATE_KEY_PASSWORD`（少了 `SIGNING_`，会报"prompt for password"，部分 AI 工具会给错这个名字）

2. **密码字段"必须设置为空字符串"，不能完全不设**
   - 私钥确实没密码，但 Tauri 检测到 key 文件后**会去找这个环境变量**；没找到 → 弹交互式提示 → CI / 后台脚本卡死

3. **看到 key 文件里 "encrypted secret key" 字样**不要慌
   - rsign 工具**固定**用 "encrypted secret key" 作为文件头部注释，**即使密码为空也是这写法**
   - 它说的是"文件结构是加密格式"，不是"你需要密码"
   - 我们这把 `dongli.key` 真的没密码，传 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""` 就能签

#### 拿到 key 后先验完整性

如果是同事通过网盘/微信传过来的，强烈建议先核对哈希避免传输损坏：

```bash
# macOS / Linux
shasum -a 256 ~/.tauri/dongli.key
# Windows PowerShell
Get-FileHash $HOME\.tauri\dongli.key -Algorithm SHA256
```

当前这把 key 的参考值（联系密钥持有人核对）：
- 文件大小：348 字节
- `dongli.key.pub` 的内容跟 [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json) 里 `updater.pubkey` 应该 base64 解码后**一致**

### 3.4 构建耗时参考（Apple Silicon M-系列）

| 阶段 | 首次 | 增量 |
|---|---|---|
| `pnpm install` | 1-2 min | 0-30 s |
| Vite 前端 | ~5 s | ~5 s |
| Cargo Rust（dev profile，`pnpm dev`） | 5-15 min | 5-30 s |
| Cargo Rust（release profile，`pnpm build`） | 10-25 min | 1-3 min |

**第一次 release 构建慢是正常的**——release profile 要做完整优化，Cargo 要重新编译大部分依赖。

---

## 4. 密钥与签名

### 4.1 两种密钥的区别

DongliAI-Switch 涉及**两套独立的密钥体系**，新人最容易混淆：

| 密钥 | 解决什么问题 | 是否必需 | 成本 |
|---|---|---|---|
| **Tauri 自动更新签名密钥** | 客户 App 验证自动更新包未被篡改 | 自动更新必需 | 免费（自己生成） |
| **Apple Developer ID 证书** | Mac 不弹"无法验证开发者"警告 | 否，但客户首次开 App 会被 GateKeeper 拦 | ¥688/年 |

**当前我们：✅ 有 Tauri 签名密钥；❌ 没买 Apple Developer**

客户首次安装在 Mac 上需要走"右键→打开"绕过 GateKeeper。第二次起正常双击。

### 4.2 Tauri 签名密钥（你需要知道的）

```
~/.tauri/dongli.key       ← 私钥（绝不能传 git）
~/.tauri/dongli.key.pub   ← 公钥（已写进 src-tauri/tauri.conf.json）
```

**签名怎么工作**：

```
开发者机器                     客户机器
─────────────                  ─────────────
私钥签名 .tar.gz              公钥（编译进 App）
   ↓                                ↑
 .tar.gz + .sig  ───上传───→ 验证签名
                                    ↓
                              对得上才装；对不上拒绝
```

**为什么这件事重要**：

- 黑客即使能在传输路径上替换 `.tar.gz`，签名验证一定不过，App 不会装恶意更新
- 只有**持有私钥的人**能发新版——这意味着私钥泄漏 = 完全失控
- 私钥丢了 = **永远没法再发更新**——已经装了 App 的客户从此停留在最后那个版本

**保管原则**：

1. 备份私钥到 1Password / 加密 U 盘 / KeePass，**至少 2 处**
2. 启用 GitHub Secret 时用环境变量传递，**绝不 commit**
3. 仓库根目录 [`.gitignore`](../.gitignore) 已经默认不 track `.tauri/`，但小心别误把 `~/.tauri/dongli.key` 软链到项目里

### 4.3 私钥重新生成（仅当丢失或泄漏）

```bash
pnpm tauri signer generate -w ~/.tauri/dongli.key --ci
# 拷贝 ~/.tauri/dongli.key.pub 内容到 src-tauri/tauri.conf.json 的 updater.pubkey
```

**重要后果**：换密钥后，**已经装了旧版本的客户无法收到新版的自动更新**——他们的 App 用旧公钥验证，新签名对不上。要么让客户手动重装最新 .dmg，要么提前在旧版本里推一次"过渡更新"换新公钥。

---

## 5. 自动更新机制

### 5.1 流程图

```
                          ┌────────────────────────────┐
                          │  GitHub Release 页面       │
                          │  ├─ DongliAI-Switch_X.dmg  │ ← 客户首次下载
                          │  ├─ DongliAI-Switch.tar.gz │
                          │  ├─ DongliAI-Switch.sig    │
                          │  └─ latest.json            │ ← App 定期访问这个
                          └─────────┬──────────────────┘
                                    │
                                    │ HTTPS GET
                                    ↓
       客户 App 启动后周期性调用 ────┘
       ↓
       拿 latest.json 比对版本号
       ↓
       发现自己旧 → 下载 .tar.gz + .sig
       ↓
       用编译进 App 的公钥验证 .sig
       ↓
       通过 → 解压、替换 App 内容、重启
       不通过 → 静默放弃
```

### 5.2 关键配置文件

[`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json):

```json
"updater": {
  "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6...",   // 我们的公钥
  "endpoints": [
    "https://github.com/Sylanex/cc-switch-dongli/releases/latest/download/latest.json"
  ]
}
```

`endpoints` 改了 → 客户 App 重新构建后才生效；老版本仍指向旧 URL。

### 5.3 latest.json 长啥样

```json
{
  "version": "3.14.2",
  "notes": "本次更新内容",
  "pub_date": "2026-05-09T12:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6...",
      "url": "https://github.com/Sylanex/cc-switch-dongli/releases/download/v3.14.2/DongliAI-Switch.app.tar.gz"
    },
    "darwin-x86_64":  { /* 同上，universal 包共用 */ },
    "windows-x86_64": { /* msi */ },
    "linux-x86_64":   { /* AppImage */ },
    "linux-aarch64":  { /* AppImage */ }
  }
}
```

**"signature" 字段**就是 `.tar.gz.sig` 文件的 base64 内容。手动发版时记得把 .sig 内容贴进 latest.json 而不是上传 .sig 文件。

---

## 6. 分发流程

### 6.1 当前手动流程（我们现在用这个）

```bash
# 1. 打 tag（必须 v + version 字段值，参见下方"tag 命名约定"）
git tag v3.14.1-1 && git push --tags

# 2. 本地构建
TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/dongli.key)" pnpm build

# 3. 手动写 latest.json（参见 §5.3 模板）

# 4. 用 gh CLI 上传到 GitHub Release
gh release create v3.14.1-1 \
  src-tauri/target/release/bundle/dmg/*.dmg \
  src-tauri/target/release/bundle/macos/*.tar.gz \
  src-tauri/target/release/bundle/macos/*.tar.gz.sig \
  latest.json \
  --title "v3.14.1-1 (DongLi fork)" --notes "更新说明"
```

#### Tag 命名约定（重要）

**Tag 名必须等于 `v` + 三个 version 字段的值**（`package.json` / `Cargo.toml` / `tauri.conf.json`）。当前是 `3.14.1-1`，所以 tag 用 `v3.14.1-1`。

**原因**：[AboutSection.tsx](../src/components/settings/AboutSection.tsx) 里的"Release Notes"按钮是直接拼 `https://.../releases/tag/v${version}` 打开的。如果 tag 加了额外后缀（比如 `v3.14.1-dongli.1`），用户点按钮就 404。

想让 release 在 GitHub 列表里更有辨识度，写在 release **title / notes 里**（如 `v3.14.1-1 (DongLi fork)`），不要动 tag 本身。

> 这套适合短期发版稀疏的阶段。频率上来后改 CI 自动化（§7）。

### 6.2 客户安装路径

| 平台 | 客户操作 |
|---|---|
| **macOS** | 下载 `.dmg` → 拖入 Applications → **首次右键→打开**（绕过 GateKeeper）→ 之后正常双击 |
| **Windows** | 下载 `.msi` → 双击安装。Microsoft Defender SmartScreen 可能拦一次，"仍要运行" |
| **Linux** | `.AppImage` 加可执行权限直接跑；`.deb`/`.rpm` 用包管理器装 |

### 6.3 分发渠道

目前我们用 **GitHub Release**：

- 优点：免费、稳定、CDN 加速、客户能直接看到所有历史版本
- 缺点：客户域名是 github.com，国内有时访问慢

未来可选：

- 自家网站 ai.dongli.work 加下载页 → 链接到 GitHub Release 的资源 URL（域名是你的，文件走 GitHub CDN）
- 或自建 OSS/CDN，把 .dmg 放上去

---

## 7. 未来：CI 自动化（暂未开启）

上游已经写好了完整的 [`.github/workflows/release.yml`](../.github/workflows/release.yml)，触发条件：

```yaml
on:
  push:
    tags: ['v*']
```

也就是 `git tag v3.14.2 && git push --tags` 就会自动跑。**当前这个文件还是上游的 CI 脚本，没改造给 DongLi 用**。要启用得做：

### 7.1 必做的改造

1. **搜索替换**：30 多处 `CC-Switch-...` → `DongliAI-Switch-...`，`CC Switch.app` → `DongliAI-Switch.app`，DMG 卷名 `CC Switch` → `DongliAI-Switch`
2. **GitHub Secrets 配置**（仓库 Settings → Secrets and variables → Actions）：

| Secret | 内容 | 必需性 |
|---|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | `~/.tauri/dongli.key` 的 base64 编码内容 | 必需，不然构建出错（现在本地构建一样的错） |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 留空（我们生成时没设密码） | 可选 |
| `APPLE_CERTIFICATE` | Apple Developer .p12 证书的 base64 | 仅当要 Mac 公证；现在用不上 |
| `APPLE_CERTIFICATE_PASSWORD` | 上面证书的密码 | 仅 Mac 公证 |
| `KEYCHAIN_PASSWORD` | CI 临时 keychain 密码（任意字符串） | 仅 Mac 公证 |
| `APPLE_ID` / `APPLE_PASSWORD` / `APPLE_TEAM_ID` | Apple 账号信息 | 仅 Mac 公证 |

3. **未配 Apple 证书时**：需要把 release.yml 里 macOS 那段的 "Import Apple signing certificate" / "Notarize macOS DMG" / "Verify code signing" 步骤注释掉或删掉，否则 CI 会因找不到 secrets 而失败

### 7.2 上游 CI 已经做好的部分

- 多平台并行（macOS universal + Windows + Linux x86_64 + Linux ARM64）
- 自动生成 latest.json（§5.3 那个）
- Release 标题/描述模板
- 失败重试（macOS 公证最多 3 次）

改造后大概**每次发版就是 `git push --tags`**，剩下交给 CI。

---

## 8. 给插件/扩展开发者的注意事项

如果你在做的是**给 DongliAI-Switch 加新功能 / 接入外部工具**，下面这些跟打包发行直接相关：

### 8.1 改前端（React / TypeScript）

- 改完 `pnpm dev` 实时热更新即可，不用重新构建
- 但你的改动要进 release 必须重新出包；老客户**只能靠自动更新或手动重装**拿到你的代码
- 注意不要给 i18n 漏翻译 key——release 出来后用户看到 "[missing key]" 就尴尬了

### 8.2 改后端（Rust）

- 在 `src-tauri/Cargo.toml` 加新依赖会让首次 `pnpm build` 时间显著变长（重新编译那个依赖及其传递依赖）
- 加 Tauri 插件（如 `tauri-plugin-clipboard`）要同时在 `Cargo.toml`、`src-tauri/src/lib.rs`（注册）、`src-tauri/capabilities/*.json`（授权）三处改，缺一处构建不报错但运行时调用失败
- **Capabilities 是安全沙箱**——Tauri 2 默认拒绝所有 fs/shell 调用，需要显式 allow

### 8.3 改图标 / 品牌资源

- App 图标：[`src-tauri/icons/`](../src-tauri/icons/)（多分辨率）
- 安装包内的预设供应商图标：[`src/icons/extracted/`](../src/icons/extracted/)
- 当前限制：[`PICKER_ALLOWED_ICONS`](../src/icons/extracted/index.ts) 把 IconPicker 限制在 5 个图标内，加新品牌图标记得同步加到这个 allowlist

### 8.4 改自动更新行为

- 改 `tauri.conf.json` 的 `endpoints` 立刻生效到下次构建；老客户仍指向旧 URL
- 想让老客户切到新 URL，唯一办法：在老 URL 还能用的时候，发一次新版（带新 endpoints），老客户更新后即切换
- **永远不要乱改 `pubkey`**——除非真的私钥泄漏需要轮换；轮换的代价见 §4.3

### 8.5 改 deeplink 协议

- 当前注册的 scheme 是 `ccswitch://`（在 `src-tauri/tauri.conf.json` 和 `src-tauri/src/deeplink/` 里）
- 改 scheme 会让所有第三方（你们另写的工具、文档里的链接、用户书签）失效
- 想加新 deeplink 类型（比如 `ccswitch://import-skill?url=...`）只要在 [`src-tauri/src/deeplink/`](../src-tauri/src/deeplink/) 加 handler，不需要改协议本身

---

## 9. 常见问题排查

### 构建：`A public key has been found, but no private key`

`tauri.conf.json` 里有 `pubkey` 但环境变量没设私钥。

```bash
# 临时跑：
TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/dongli.key)" pnpm build

# 永久（写到 ~/.zshrc）：
echo 'export TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/dongli.key)"' >> ~/.zshrc
```

### 构建：签名工具一直在提示密码

两种可能：

1. **环境变量名写错了**——必须是 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`，**不是** `TAURI_PRIVATE_KEY_PASSWORD`（少了 `SIGNING_`）
2. **环境变量没设，工具走交互提示**——即使 key 真没密码，也得显式设 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""`

> 我们这把 `dongli.key` 文件头部写着 "rsign encrypted secret key"，**这是 rsign 的固定格式，不代表真有密码**。详见 §3.3 "三个常见坑"。

### 装：Mac 客户报"无法验证开发者"

正常——我们没买 Apple Developer。教客户：**右键 .app → 打开 → 弹窗里再点一次"打开"**。第二次起正常双击。

要彻底去掉这个警告，唯一方法是 §4.1 那张表里的 ¥688/年 Apple Developer。

### 跑：`pnpm dev` 启动了但窗口没出现

大概率是已经有一个 `cc-switch` 进程在跑（生产版或之前的 dev），`tauri-plugin-single-instance` 把焦点交给已有窗口、当前 dev 进程退出。

```bash
ps aux | grep -E "MacOS/cc-switch|target/debug/cc-switch" | grep -v grep
# 看到的 PID 杀掉，再 pnpm dev
```

### 升级：客户 App 装了但收不到自动更新

排查顺序：

1. `tauri.conf.json` 里 `endpoints` URL 直接浏览器访问，能拿到 200 + 合法 latest.json 吗？
2. latest.json 的 `version` 字段是不是真的比客户当前版本号高？
3. `signature` 字段是不是用**当前 App 内置公钥对应的私钥**签的？换过 pubkey 的话老客户验证一定过不了
4. 客户 OS 防火墙/代理把 GitHub release CDN 拦了？

---

## 10. 当前状态速查

| 项 | 状态 | 备注 |
|---|---|---|
| 项目重命名 | ✅ 完成 | App 名 `DongliAI-Switch`、preset 名 `慧境冻梨AICode` |
| 自动更新基础设施 | ✅ 完成 | 公私钥就位、endpoint 指向我们的 fork |
| Apple 公证 | ❌ 未做 | 客户首次需"右键打开" |
| 本地手动构建 | ✅ 已验证 | `.dmg` 13MB 可用 |
| GitHub Release 发版 | ⏳ 待做 | 当前用手动 `gh release create` |
| CI 自动化 | ⏳ 待启 | release.yml 待改造 + Secrets 待配 |

---

## 附录：相关链接

- Tauri 官方文档：https://tauri.app/v2/
- Tauri 自动更新插件：https://tauri.app/v2/plugin/updater/
- 上游项目（参考）：https://github.com/farion1231/cc-switch
- 我们的 fork：https://github.com/Sylanex/cc-switch-dongli
- minisign 签名格式（Tauri 用的就是这个）：https://jedisct1.github.io/minisign/

有问题或文档过时了，请直接改这个文件并提 PR。
