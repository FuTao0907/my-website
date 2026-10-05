# v1.3 内容管理后台 · A2 方案（自写 CMS + Cloudflare Functions 代理）

> 状态：**方案已定，待实施**（2026-10-05）
> 关联：v1.3 PRD（冻结）、docs/decap-cms-guide.md（Decap 指南，暂保留）

## 1. 背景与决策记录

**GitHub OAuth 账号级风控（已确诊，2026-10-05）**：
- 任何**已登录** GitHub 会话访问 OAuth authorize URL 必返回 404（未登录时正常跳转登录页）
- 验证手段：标准 OAuth、Decap `auth_type: implicit`（GitHub Pages 模式）均复现；无痕/正常窗口、本机 curl/web_fetch 对照确认——**GitHub 侧限制，非本站配置问题**
- Decap CMS 的 GitHub backend 仅支持 OAuth 系列登录（bundle 中无 PAT 输入界面）→ **Decap 在线登录当前不可用**

**PAT 可用性验证**：
- fine-grained PAT（仅 `my-website` 仓库，Contents Read/Write）验证有效：`/user` 返回 FuTao0907、repo 读写权限均 True、根目录读取正常

**用户决策（选 C）**：先自写轻量 CMS 用起来，Decap 保留待风控解除。

**A2 要点**：GitHub PAT **只存放在 Cloudflare 环境变量**，浏览器与手机端全程不接触 GitHub token；所有内容操作经 Cloudflare Pages Functions 代理完成。

## 2. 架构

```
安卓手机浏览器 / 桌面浏览器
        │  HTTPS（同源 philia093.ink/manage）
        ▼
public/manage/（静态页面：登录 → 列表 → 编辑 → 上传）
        │  POST /api/cms/*（每次请求带登录口令 header）
        ▼
functions/api/cms.js（Cloudflare Pages Functions 代理）
        │  环境变量：GITHUB_PAT（仅 CF 侧持有）、CMS_PASSWORD
        ▼
api.github.com（GitHub Contents API，操作 main 分支）
        │
        ▼
Cloudflare Pages 自动构建部署（保存即发布）
```

## 3. 接口设计（functions/api/cms.js）

统一前缀 `/api/cms`，除 login 外均校验请求头 `X-CMS-Password`（与 CF 环境变量 `CMS_PASSWORD` 比对）。

| 方法 | 路径 | 功能 | 说明 |
|---|---|---|---|
| POST | `/api/cms/login` | 校验口令 | body `{password}`；成功返回 `{ok:true}`，前端将口令存 localStorage |
| GET | `/api/cms/list?collection=notes` | 列出集合条目 | 返回 `[{path, slug, title, date}]`（读目录 + 解析 frontmatter） |
| GET | `/api/cms/read?path=src/content/notes/xxx.md` | 读取文件原文 | 返回 `{content}` 原始 md |
| POST | `/api/cms/write` | 新建/更新文件 | body `{path, content, message, sha?}`（sha 用于更新）；PUT GitHub Contents API → 触发自动部署 |
| POST | `/api/cms/upload` | 上传图片 | body `{filename, base64}` → 写 `public/uploads/`，返回 `/uploads/xxx` 路径 |

**设计约定**：
- 响应统一 JSON；业务错误返回 `{ok:false, error:"中文友好提示"}`
- **无状态会话**：口令随每次请求发送（口令只是后台访问凭证，非 GitHub token）；不引入 KV/DB，避免额外配置
- CORS：前端与 API 同源（同一 Pages 站点），无需跨域处理
- GitHub API 调用：`GET /repos/{owner}/{repo}/contents/{path}`、`PUT .../contents/{path}`（body 含 message/sha/content(base64)/branch:main）
- 环境变量未配置时返回明确中文错误（复用 auth.js 的报错风格）

## 4. 前端页面（public/manage/，纯静态）

| 页面 | 功能 |
|---|---|
| 登录 | 口令输入 → 调 `/api/cms/login` → 存 localStorage → 跳列表 |
| 列表 | 顶部选集合（博客/一闪念/项目/收藏…）；卡片展示标题+日期；新建/编辑/删除入口 |
| 编辑 | 字段表单（与 zod schema 对齐）+ 正文 textarea（markdown）；保存调 `/api/cms/write`；保存后提示"已提交，构建中（约 2-3 分钟上线）" |
| 上传 | 文件选择 → base64 → `/api/cms/upload` → 复制引用路径 |

**技术要求**：
- 原生 JS 或极简依赖（保证安卓手机流畅，避免大 bundle）
- 响应式布局；复用现有 PWA manifest（`/admin` 的 manifest 复制适配 `/manage`，可添加到主屏幕）
- `<meta name="robots" content="noindex">` 防止收录
- 主题与主站一致（极简单色）

## 5. 集合映射（以 src/content.config.ts zod schema 为准）

| 集合 | 目录 | 关键字段 |
|---|---|---|
| 博客 | `src/content/blog` | title / date / tags / draft / 正文 |
| 一闪念 | `src/content/notes` | published / draft / 正文（无标题，identifier 用 published） |
| 项目 | `src/content/projects` | 名称 / 描述 / 链接 / 封面 / 状态 |
| 收藏 | `src/content/favorites`（或按类型分目录） | 名称 / 类型 / 链接 / 备注 |

（实施时以 config.yml 8 集合定义与 zod schema 逐一对齐，字段映射写进代码注释）

## 6. Cloudflare 配置（待用户操作）

1. Pages 项目 `anges-website` → 环境变量新增：
   - `GITHUB_PAT`：用户 fine-grained PAT（仅 my-website，Contents R/W）——已具备，填入 CF
   - `CMS_PASSWORD`：用户自定后台访问口令（建议强口令，手机端记住后不常输入）
2. 无需 KV / D1 / 其他绑定

## 7. 实施步骤（后续执行顺序）

1. `functions/api/cms.js`：代理 + 口令校验 + GitHub Contents API 封装
2. `public/manage/`：登录 / 列表 / 编辑 / 上传四个视图
3. 本地 `wrangler pages dev` 全链路验证（配临时环境变量）
4. 提交推送 → 自动部署 → 浏览器验证
5. Cloudflare 配环境变量（需用户）→ 线上登录 + 新建/编辑/上传 + 自动部署链路验证
6. 安卓真机验证（PWA 添加到主屏幕）
7. 更新指南文档（增补 A2 使用说明）+ 开发日志 + 发版 tag（完成后统一）

## 8. 与 Decap 的关系

- **入口分离**：Decap 保留在 `/admin`；自写 CMS 使用 `/manage`——并存不冲突
- Decap 相关文件（vendor、config.yml、functions/api/auth*.js）**暂不删除**，风控解除后可切回
- `/manage` 在手机上"添加到主屏幕"作为日常入口；两套入口在指南中说明

## 9. 风险与应对

| 风险 | 应对 |
|---|---|
| 口令被暴力猜测 | 口令强度要求 + admin/manage 均 noindex + 可选 CF 访问限制（暂缓） |
| PAT 泄露 | 仅存 CF 环境变量；fine-grained 权限最小化（单仓库）；可随时撤销重建 |
| 提交冲突（sha 过期） | write 接口回传 GitHub 返回的 sha；冲突时提示用户重新加载 |
| 部署延迟 | 保存后提示构建时间；不阻塞连续编辑（队列由 GitHub 侧处理） |
