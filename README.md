# Ange's website · 安歌的网站

前端工程师 Ange 的个人网站——线上简历、项目陈列室、内容自留地。

## 技术栈

- **框架**：Astro 7
- **UI**：Tailwind CSS v4
- **交互**：React 18.3（按需 hydration）
- **搜索**：Pagefind
- **部署**：Cloudflare Pages（国内走 EdgeOne Makers + DNSPod 分流）
- **包管理**：Yarn

## 快速开始

```bash
# 安装依赖
yarn install

# 本地开发
yarn dev

# 构建生产版本（含 Pagefind 索引）
yarn build

# 预览构建产物
yarn preview
```

## 项目结构

```
├── src/
│   ├── components/    # Astro 组件
│   ├── layouts/       # 布局
│   ├── pages/         # 路由页面
│   ├── content/       # 博客/项目/收藏数据
│   ├── styles/        # 全局样式与设计 token
│   └── config.ts     # 站点配置
├── public/           # 静态资源
├── docs/             # 项目文档（见下方）
└── astro.config.mjs
```

## 文档

所有项目文档都在 [`docs/`](./docs/) 目录下：

| 文档 | 说明 |
|------|------|
| [`docs/prd/v1.0/PRODUCT_PRD.md`](./docs/prd/v1.0/PRODUCT_PRD.md) | v1.0 产品需求文档（已冻结） |
| [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) | 开发规范（版本号、问题记录、工程约定） |
| [`docs/ISSUES_LOG.md`](./docs/ISSUES_LOG.md) | 问题台账（所有踩过的坑和解决方案） |
| [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) | 版本变更记录 |
| [`docs/dev-log/`](./docs/dev-log/) | 开发日志（按日期命名，每天一个文件） |

> 新版本的 PRD 按 `docs/prd/<版本号>/PRODUCT_PRD.md` 存放，一个产品版本一个目录。
> 开发日志按 `docs/dev-log/YYYY-MM-DD.md` 命名，每天一个文件，记录当天做了什么。

## 版本号

遵循 SemVer：`MAJOR.MINOR.PATCH`，当前 **0.0.1**（开发中）。
详见 [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md)。
