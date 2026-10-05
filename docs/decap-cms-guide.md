# Decap CMS 内容管理后台 · 配置与使用指南

> 对应版本：v1.3（2026-10-05 冻结）
> 管理入口：`https://philia093.ink/admin/`
> 说明：本文档按"他人可 100% 复刻"标准编写——从零配置到日常使用全覆盖。

---

## 一、架构总览

```
浏览器 → /admin/（Decap CMS SPA，静态）
   ↓ GitHub OAuth（弹窗授权）
Cloudflare Pages Function（/api/auth, /api/auth/callback）
   ↓ GitHub API
仓库 src/content/*.md（8 个内容集合）
   ↓ git push（Decap 保存时自动 commit）
Cloudflare Pages 自动构建部署
   ↓
EdgeOne 国内加速 → philia093.ink
```

- **无后端服务**：Decap CMS 是纯前端，内容读写走 GitHub API
- **无数据库**：内容就是仓库里的 markdown，自带版本历史
- **认证**：GitHub OAuth，由 Cloudflare Pages Functions 代理（密钥不暴露给浏览器）

---

## 二、文件结构

```
public/admin/
├── index.html          # 管理页入口（加载 Decap CMS + manifest）
├── config.yml          # 后台配置（后端 + 8 集合字段定义）
├── manifest.json       # PWA manifest（安卓"添加到主屏幕"）
├── icons/              # PWA 图标（192/512）
└── vendor/             # decap-cms 自托管包（yarn add -D decap-cms 后从 node_modules/decap-cms/dist 复制，排除 *.map）
functions/api/
├── auth.js             # OAuth 发起：state cookie + 302 到 GitHub
└── auth/callback.js    # OAuth 回调：校验 state → 换 token → postMessage 回 CMS
public/uploads/         # 后台图片上传目录（media_folder）
```

**vendor 更新方式**：`yarn add -D decap-cms` 升级后，把 `node_modules/decap-cms/dist/` 下除 `*.map` 外的文件复制到 `public/admin/vendor/`，随后**删除冗余的 `cms.js` / `*.cms.js`**（仅保留 `decap-cms.js` 主入口 + `*.decap-cms.js` chunks + wasm，约 6.2MB）。自托管原因：避免 unpkg 等第三方 CDN 在国内访问不稳，且构建确定性（版本锁定）。

---

## 三、首次配置（一次性）

### 步骤 1：创建 GitHub OAuth App

1. GitHub → Settings → Developer settings → **OAuth Apps** → **New OAuth App**
2. 填写：
   - **Application name**：`Ange's website CMS`
   - **Homepage URL**：`https://philia093.ink`
   - **Authorization callback URL**：`https://philia093.ink/api/auth/callback`
3. 创建后记下 **Client ID**，生成并复制 **Client Secret**（只能看一次）

### 步骤 2：配置 Cloudflare Pages 环境变量

Cloudflare Pages → 项目 `anges-website` → **Settings → Environment variables**，添加（Production）：

| 变量名 | 值 |
| --- | --- |
| `GITHUB_CLIENT_ID` | 步骤 1 的 Client ID |
| `GITHUB_CLIENT_SECRET` | 步骤 1 的 Client Secret |

保存后重新部署一次生效。**密钥绝不写入仓库 / config.yml。**

### 步骤 3：验证

- 浏览器打开 `https://philia093.ink/admin/`
- 点 **Login with GitHub** → 授权 → 进入管理界面
- 左侧应能看到 8 个集合：博客 / 项目 / 收藏 · 书籍 / 音乐 / 网文 / 视频 / 链接 / 一闪念

---

## 四、config.yml 字段与 zod schema 对齐

后台字段定义与 `src/content.config.ts` 的 zod schema **逐字段对齐**，保证编辑保存后 `astro build` 不失败：

| zod 类型 | Decap widget | 说明 |
| --- | --- | --- |
| `z.string()` | `string` / `text` | 标题用 string，多行（summary/description）用 text |
| `z.coerce.date()` | `datetime` | 日期时间，保存 ISO 格式，zod coerce 可解析 |
| `z.enum([...])` | `select` + `options` | 枚举（category/status/type 等） |
| `z.array(z.string())` | `list` | 标签/技术栈 |
| `z.boolean()` | `boolean` | draft/visible/featured 等开关 |
| `z.number().min(1).max(5)` | `number` + `value_type: int, min, max` | 评分 |
| `z.url()` | `string` | URL（demo/repo/link 等，zod v4 z.url() 校验字符串） |
| `z.string().optional()` | `required: false` | 可选字段 |
| 正文 | `markdown` | 文件主体内容 |

**修改字段的纪律**：改了 `content.config.ts` 的 schema，必须同步改 `config.yml` 对应集合的字段，否则后台保存的数据可能被构建期校验拒绝（`astro build` 会明确报错，按错误修即可）。

---

## 五、本地开发模式

### 方式 A：纯本地编辑调试（推荐，无需 OAuth）

用 Decap 官方本地代理，编辑直接写本地文件，`astro dev` 实时预览：

1. 启动本地 git 代理：`npx decap-server`（监听 `http://localhost:8081`）
2. 临时修改 `public/admin/config.yml` 的 backend 段为：

```yaml
backend:
  name: proxy
  url: http://localhost:8081
  branch: main
local_backend: true
```

3. 本地跑 `yarn dev`，打开 `http://localhost:4321/admin/`
4. 编辑、保存 → 文件直接写入 `src/content/`，页面热更新
5. **调试完必须把 backend 段改回 github 配置并提交**（proxy 配置只用于本地）

> 注意：`local_backend: true` 会让线上也尝试连接本地代理，所以该行只在本地调试时存在。

### 方式 B：本地全流程（含 OAuth，可选）

需要 GitHub 上额外建一个 dev OAuth App（回调填 `http://localhost:8787/api/auth/callback`），然后：

```bash
wrangler pages dev --local --env GITHUB_CLIENT_ID=<dev-id> --env GITHUB_CLIENT_SECRET=<dev-secret>
```

本地 Functions + 静态资源完整模拟线上，能调试 OAuth 全流程。

---

## 六、日常使用（手机 / 电脑）

### 电脑
- 打开 `/admin/` → Login with GitHub → 编辑内容 → 保存（自动 commit + 触发线上部署）

### 安卓手机（主要场景）
1. 浏览器打开 `https://philia093.ink/admin/`，登录一次（GitHub 授权记住后下次免登）
2. 菜单 → **添加到主屏幕** → 桌面生成"内容管理"图标，以后点开直达
3. 常用操作：
   - **一闪念**：一闪念集合 → 新建 → 写内容 → 保存
   - **收藏**：对应品类（书籍/音乐/网文/视频/链接）→ 新建 → 填标题/作者/评分/链接 → 保存
   - **博客**：新建 → 填标题/摘要/正文 → 保存
4. 封面图：在编辑页点封面字段 → 上传图片（自动存入 `public/uploads/` 并提交）

**保存即部署**：保存后约 1-2 分钟线上可见（Cloudflare 构建）。

---

## 七、常见问题（FAQ）

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 点 Login with GitHub 没反应 | OAuth App 未创建 / 回调 URL 填错 / 环境变量未生效 | 核对步骤 1-2，改完重新部署 |
| 授权后一直转圈 | state cookie 校验失败（浏览器禁 cookie）或 token 交换失败 | 换浏览器 / 无痕窗口重试 |
| 保存报错 401/403 | GitHub token 过期或 scope 不足 | 退出重新登录（后台自动重新授权） |
| 保存后线上没变化 | Cloudflare 构建失败或 EdgeOne 缓存 | 看 Cloudflare Pages 构建日志；EdgeOne 缓存确认（见下） |
| 保存后构建失败 | config.yml 字段与 zod schema 不一致 | 按构建错误修正字段，参考"四"的对齐表 |
| 上传图片不显示 | media_folder/public_folder 与页面引用路径不一致 | 确认 cover 填 `/uploads/文件名` 格式 |

---

## 八、EdgeOne 缓存说明

- `/admin/` 页面和 vendor 静态资源：EdgeOne 正常缓存（内容不变）
- `/api/auth*`：OAuth 请求**必须不被缓存**——EdgeOne 默认对 API 动态请求不缓存；若出现登录异常，检查 EdgeOne 缓存规则未命中 `/api/*`
- **内容更新时效**：后台保存 → Pages 构建新 HTML → EdgeOne 按缓存 TTL 刷新。若希望立即生效，可在 EdgeOne 控制台手动刷新缓存（见 ISSUES_LOG / edgeone-setup-guide.md）

---

## 九、安全清单（v1.3 P2-9 复核结论）

- [x] config.yml 无任何密钥，Client Secret 只在 Cloudflare Pages 环境变量
- [x] OAuth 回调校验 `state`（CSRF 防护），cookie HttpOnly + Secure + SameSite=Lax
- [x] token 通过 postMessage 回传并限定 origin（`window.location.origin`）
- [x] /admin 页面 `robots: noindex`，不进入搜索引擎
- [x] OAuth scope 最小化：`repo,user`（个人单用户场景）
- [x] 授权弹窗关闭即完成，token 不进 URL
