# 内容管理后台 /manage · 配置与使用指南（A2 自写 CMS）

> 对应版本：v1.3（2026-10-06 实施）
> 管理入口：`https://philia093.ink/manage/`（备用：`https://anges-website.pages.dev/manage/`）
> 说明：本文档按"他人可 100% 复刻"标准编写——从零配置到日常使用全覆盖。
> 背景：Decap CMS（/admin）因 GitHub 账号级 OAuth 风控暂不可用，A2 方案先自写轻量 CMS 用起来；Decap 保留待风控解除（见 decap-cms-guide.md）。

---

## 一、架构总览

```
安卓手机 / 电脑浏览器
   ↓ 打开 /manage/（静态管理页，极简单色）
   ↓ 输入访问口令（CMS_PASSWORD）
Cloudflare Pages Function（/api/cms，POST 统一分发）
   ↓ 校验 X-CMS-Password header + GitHub PAT（均在 CF 环境变量）
GitHub Contents API（branch=main）
   ↓ 写入 src/content/*.md（8 个内容集合）
GitHub 收到 commit → Cloudflare Pages 自动构建部署
   ↓
EdgeOne 国内加速 → philia093.ink
```

- **无后端服务、无数据库**：内容就是仓库里的 markdown，自带版本历史
- **安全模型**：浏览器只接触口令（CMS_PASSWORD），GitHub PAT 只存在 Cloudflare 环境变量，浏览器/页面代码永远拿不到 token
- **认证**：单口令登录（非 OAuth），口令由 `X-CMS-Password` header 随请求发送，API 校验后代理 GitHub 请求

---

## 二、文件结构

```
functions/api/
└── cms.js               # 统一 POST /api/cms 代理（login/list/read/write/upload/delete）
public/manage/
├── index.html           # 管理页壳（noindex + manifest + 顶栏 + view 容器）
├── styles.css           # 极简单色样式（复用主站 design token）
├── collections.js       # 8 集合字段定义（与 zod schema 对齐）
└── app.js               # 主逻辑：api/toast/frontmatter/hash 路由/登录/列表/编辑/上传
public/uploads/          # 后台图片上传目标目录（media）
.dev.vars                # 本地敏感变量（GITHUB_PAT + CMS_PASSWORD，已 gitignore）
```

---

## 三、首次配置（一次性）

### 步骤 1：准备 GitHub Fine-grained PAT

GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → 新建：

- **Repository access**：仅 `my-website`
- **Permissions → Contents**：**Read and write**
- 生成后复制 token（只显示一次）

### 步骤 2：配置 Cloudflare Pages 环境变量

Cloudflare Pages → 项目 `anges-website` → **Settings → Environment variables**，添加（Production）：

| 变量名 | 值 |
| --- | --- |
| `GITHUB_PAT` | 步骤 1 的 fine-grained PAT（仅限 my-website，Contents R/W） |
| `CMS_PASSWORD` | 后台登录口令（自己定，建议强一点，能写博客内容） |

保存后**重新部署一次**生效（push 一个提交即触发）。**两条密钥绝不写入仓库、文档、聊天记录。**

### 步骤 3：验证

- 浏览器打开 `https://philia093.ink/manage/`
- 输入 `CMS_PASSWORD` 口令 → 进入后台 → 左侧顶栏 8 个集合：博客 / 一闪念 / 项目 / 书 / 音乐 / 网文 / 视频 / 链接
- 博客列表应显示真实博客条目

---

## 四、API 契约（/api/cms）

统一 `POST https://philia093.ink/api/cms`，body 携带 `action` 分发：

| action | 参数 | 说明 |
| --- | --- | --- |
| `login` | — | 校验口令，成功 `{ok:true}` |
| `list` | `collection` | 列集合文件（含 title/date/draft 摘要） |
| `read` | `path` | 读单个文件全文 |
| `write` | `path, content, sha?` | 新建（无 sha）/更新（带 sha），content 含 frontmatter |
| `upload` | `path, content(base64)` | 上传图片（限 5MB、仅图片扩展名） |
| `delete` | `path, sha` | 删除文件 |

**规则**：
- 口令走 header `X-CMS-Password`（不带或错 → 401）
- 路径白名单：`src/content/{blog|projects|notes|collections/{books|music|novels|videos|links}}/*.md`（越界 → 403）
- GitHub 侧 PUT/DELETE Contents API，branch=main
- 上传：base64、限 5MB、仅图片扩展名（png/jpg/jpeg/gif/webp/svg/avif）

---

## 五、集合映射（与 zod 对齐）

`public/manage/collections.js` 字段定义与 `src/content.config.ts` 的 zod schema 逐字段对齐，保证保存后 `astro build` 不失败：

| 集合 key | 目录 | 字段要点 |
| --- | --- | --- |
| `blog` | `src/content/blog/` | title/date/updated/summary/tags/draft/cover + 正文 |
| `projects` | `src/content/projects/` | title/date/summary/tags/demo/repo/featured + 正文 |
| `notes` | `src/content/notes/` | **titleLess**：无标题，文件名=时间戳，identifier 用 published |
| `books` / `music` / `novels` / `videos` / `links` | `src/content/collections/*/` | 标题/作者/评分/链接/标签 + 正文 |

**修改字段的纪律**：改了 `content.config.ts` 的 schema，必须同步改 `collections.js` 对应集合，否则后台保存的数据可能被构建期校验拒绝（`astro build` 会明确报错，按错误修即可）。

**draft 语义**：勾选"草稿"保存 → frontmatter `draft: true` → 内容提交到仓库但不渲染到线上（Astro 集合过滤）。

---

## 六、本地开发模式

1. 本地准备 `.dev.vars`（已 gitignore）：

```env
GITHUB_PAT=github_pat_...
CMS_PASSWORD=local-test-123
```

2. 启动本地完整环境：

```bash
yarn wrangler pages dev public
```

（读 .dev.vars，端口 8788；`/manage/` 与 `/api/cms` 均可用，真实读写 GitHub）

3. 打开 `http://127.0.0.1:8788/manage/`，用 `local-test-123` 登录调试。

> 注意：本地验证会真实写入 GitHub 仓库（Contents API），测试内容记得删除；draft=true 的草稿不影响线上页面。

---

## 七、日常使用（手机 / 电脑）

### 电脑
- 打开 `/manage/` → 输入口令 → 编辑内容 → 保存（自动 commit + 触发线上部署）

### 安卓手机（主要场景）
1. 浏览器打开 `https://philia093.ink/manage/`，输入口令登录
2. 菜单 → **添加到主屏幕** → 桌面生成"内容管理"图标，以后点开直达
3. 常用操作：
   - **一闪念**：一闪念集合 → ＋ 新建 → 写内容 → 保存（无标题，自动时间戳命名）
   - **收藏**：对应品类（书/音乐/网文/视频/链接）→ ＋ 新建 → 填标题/作者/评分/链接 → 保存
   - **博客**：＋ 新建 → 填标题/摘要/正文 → 保存
4. 封面图：编辑页"上传图片"→ 选择文件 → 上传（自动存入 `public/uploads/` 并提交）

**保存即部署**：保存后约 1-2 分钟线上可见（Cloudflare 构建）。

---

## 八、常见问题（FAQ）

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 输入口令点进入没反应 | 口令错误 / 环境变量未生效 | 核对 CF 环境变量 CMS_PASSWORD，改完重新部署 |
| 登录后页面空白 | 路由 hash 异常（旧缓存） | 强制刷新（Ctrl+Shift+R）；老版本有 hash 解析 bug，已修 |
| 保存报错 401 | CMS_PASSWORD 与 CF 环境变量不一致 / GITHUB_PAT 失效 | 核对两个环境变量；PAT 失效去 GitHub 重新生成 |
| 保存报错 403 | 路径不在白名单 | 确认集合目录在 `src/content/` 对应位置 |
| 上传图片失败 | 超过 5MB / 非图片扩展名 / PAT 无写权限 | 压缩图片；确认 PAT Contents 读写 |
| 保存后线上没变化 | Cloudflare 构建失败或 EdgeOne 缓存 | 看 Cloudflare Pages 构建日志；EdgeOne 手动刷新缓存（见下） |
| 保存后构建失败 | collections.js 字段与 zod schema 不一致 | 按构建错误修正字段，参考"五"的对齐表 |

---

## 九、EdgeOne 缓存说明

- `/manage/` 页面与静态资源：EdgeOne 正常缓存（内容不变）
- `/api/cms`：POST 动态请求**必须不被缓存**——EdgeOne 默认对 API 动态请求不缓存；若出现登录异常，检查 EdgeOne 缓存规则未命中 `/api/*`
- **内容更新时效**：后台保存 → Pages 构建新 HTML → EdgeOne 按缓存 TTL 刷新。若希望立即生效，可在 EdgeOne 控制台手动刷新缓存（见 ISSUES_LOG / edgeone-setup-guide.md）

---

## 十、安全清单

- [x] GitHub PAT 只在 Cloudflare 环境变量（GITHUB_PAT），浏览器不接触 token
- [x] 口令只存 Cloudflare 环境变量（CMS_PASSWORD），登录后存 localStorage 仅供同源 API 请求
- [x] 路径白名单限制，越界 403
- [x] 上传限 5MB、仅图片扩展名
- [x] /manage 页面 `robots: noindex`，不进入搜索引擎
- [x] .dev.vars 已 gitignore，密钥不进仓库
- [x] 前端无任何 token 相关代码（可审查 app.js 确认）
