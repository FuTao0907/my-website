# Cloudflare Pages GitHub 集成配置指南

> 把部署方式从手动 `wrangler pages deploy` 改成 GitHub 自动部署：push 到 main 自动构建上线。

---

## 配置步骤

### 1. 进入 Cloudflare Pages 控制台

打开 https://dash.cloudflare.com → 左侧 "Workers & Pages" → 点击 `anges-website` 项目

### 2. 连接 GitHub 仓库

1. 进入项目后，点顶部的 **"Settings"** 标签
2. 左侧菜单 → **"Builds & deployments"** → **"Git repository"**
3. 点 **"Connect to Git"**
4. 授权 Cloudflare 访问你的 GitHub 账号
5. 选择仓库：`FuTao0907/my-website`

### 3. 配置构建参数

| 配置项 | 值 |
|-------|-----|
| Production branch | `main` |
| Build command | `yarn build` |
| Build output directory | `dist` |
| Root directory | `/`（留空） |

### 4. 环境变量

在 Settings → "Environment variables" 里添加：

| 变量名 | 值 |
|-------|-----|
| NODE_VERSION | `20` |

### 5. 触发第一次自动部署

1. 回到 "Deployments" 标签
2. 点 "Retry deployment" 或 push 一个新 commit 到 main
3. 等构建完成（1-2 分钟）

---

## 验证

- 以后每次 `git push origin main`，Cloudflare 会自动触发构建部署
- 不用再手动跑 `wrangler pages deploy`
- 构建日志在 Cloudflare 控制台 "Deployments" 里看

## 注意

- 构建命令里的 `yarn build` 已经包含 `pagefind` 索引生成
- 如果构建失败，检查 Node 版本是不是 20+
