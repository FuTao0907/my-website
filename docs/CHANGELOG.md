# Ange's website · CHANGELOG

> 版本号规则见 `docs/DEVELOPMENT.md`。本文件按时间倒序记录每次发版。

---

## [1.2.1] - 2026-10-04

### 🐛 修复
- **页面切换中间帧新旧内容叠加**（ISSUE-016）：`::view-transition-old(main-content)` 从 `animation: none` 改为 `route-leave 1ms both`，旧内容快照在过渡开始时立即让位（1ms 内淡出），不再与淡入的新内容叠加成重叠文字

---

## [1.2.0] - 2026-10-04

> 体验成熟化：状态完备 + 加载反馈 + 交互闭环。PRD：`docs/prd/v1.2/PRODUCT_PRD.md`

### ✨ 新功能
- **页面切换加载动画**：View Transitions（内容区独立过渡 + 顶部路由进度条，导航/页脚静止不闪动）
- **链接预取**：hover/视口预取新页，切换不再等待
- **统一 Toast**：底部居中浮层（成功/错误两态），博客代码复制与分享复制接入
- **全局空状态组件**：统一"图标+文案+操作"空态，覆盖项目/博客/收藏/标签/一闪念/搜索
- **搜索加载/错误状态**：spinner 加载态、索引失败错误框 + 重试按钮

### 🎨 优化
- **筛选修复（重要）**：修复静态托管下 URL query 筛选失效（v1.0 遗留，ISSUE-015），项目/博客/收藏全部筛选改为客户端过滤，支持无刷新切换与参数保留
- **列表交互统一**：所有列表卡片 hover 标题变 accent + 箭头滑入
- **详情页排版统一**：博客/项目/收藏详情页元信息区与状态胶囊统一
- **图片加载占位**：图片加载完成前显示浅灰底色，避免空白闪跳
- **按压反馈**：全局按钮/链接按下变暗
- **键盘焦点态**：全局 focus-visible outline
- **触摸目标**：移动端独立点击目标最小 44px
- **404 页增强**：新增搜索全站入口

### 📦 其他
- ISSUES_LOG 更新至 ISSUE-015
- dev-log 记录 v1.2 完整实现过程

---

## [1.1.1] - 2026-10-04

### 🐛 修复
- **暗色模式按钮对比度**：accent 按钮文字在暗色下白字对比度不足（2.54:1），新增设计 token `--color-accent-fg`，全站 11 处替换（a11y 100）
- **站点 URL 拼写**：`https://anges.pages.dev` → `https://anges-website.pages.dev`（修复 sitemap/canonical/og:url/JSON-LD 错误）
- **收藏统计页笔误**：`stats.avgRating` → `stats.books.avgRating`（运行时错误）
- **TypeScript 版本兼容**：TS 7 不提供 `astro check` 依赖的 API，锁定 typescript@6
- **zod v4 迁移**：`z.string().url()` 弃用写法改为 `z.url()`，zod 设为直接依赖

### ✨ 优化
- **OG 图片自动生成**：构建期生成 1200×630 PNG（深色底 + accent 竖条 + 中文标题自动换行），博客/项目详情页自动带 og:image
- **图片优化 astro:assets**：头像迁入 src/assets，构建自动生成 WebP + 双尺寸
- **构建弃用警告清理**：markdown remark/rehype 插件迁移到 `markdown.processor: unified()`
- **类型检查全绿**：`astro check` 0 errors / 0 warnings / 0 hints（34 files）
- **依赖治理**：移除 astro-og-canvas（与 Astro 7 不兼容），@astrojs/check 加入 devDependencies

### 🚀 部署
- **EdgeOne 国内加速接入**：`philia093.ink` 全量解析到 EdgeOne（DNSPod 合并为 2 条记录），回源 Host 设为源域名，免费证书已签发（TrustAsia DV，自动续期）
- **文档体系完善**：UI_SPEC.md（可 1:1 复刻）、edgeone-setup-guide.md（最终架构版）、ISSUES_LOG 更新至 ISSUE-014

---

## [1.1.0] - 2026-09-21

### ✨ 新功能
- **一闪念**：短想法/碎片记录页面，随手记录灵感
- **收藏详情页**：每个收藏条目独立详情页，展示完整长评
- **收藏夹统计页**：各品类数量、平均评分统计
- **站点地图页**：全站内容索引
- **博客标签云**：按文章数量调整字号，点击跳转标签页
- **博客相关文章推荐**：同标签文章推荐
- **博客分享按钮**：复制链接分享
- **TOC 高亮当前章节**：滚动时自动高亮
- **键盘快捷键**：按 `/` 快速打开搜索

### 🎨 优化
- **首页增强**：头像、关于摘要
- **关于我页增强**：精选项目卡片
- **项目列表页增强**：技术栈筛选、featured 项目置顶
- **项目详情页增强**：面包屑导航
- **博客列表页增强**：分类 Tab、标签云
- **博客详情页增强**：面包屑、更新时间、字数统计、分享按钮、相关文章
- **收藏夹总览页增强**：数量统计、最近更新
- **页面切换淡入动画**
- **打印样式优化**

### 📦 其他
- 移除 Now 页面
- 页脚新增站点地图链接
- 搜索页排除非内容页面

---

## [1.0.0] - 2026-09-21

### ✨ 新功能
- 线上简历（关于页）
- 项目陈列室（状态筛选、随机几何封面）
- 博客系统（标签、RSS、阅读时长、上一篇/下一篇）
- 收藏夹（书/音乐/网文/视频/链接，五星评分）
- 全站搜索（Pagefind）
- Now 页面
- 暗色模式（View Transitions 圆形扩散动画）
- 移动端响应式（汉堡菜单）

### 🎨 设计
- 极简单色风格（黑白灰 + 蓝色 accent）
- 自定义滚动条
- sticky 顶栏 + 毛玻璃
- a11y 优化（skip link、aria-live、prefers-reduced-motion）

### 🚀 部署
- Cloudflare Pages 部署上线
- GitHub 仓库集成

### 🐛 修复
- 修复 Pagefind 搜索 API 误用
- 修复 `__VITE_PRELOAD__ is not defined` 错误
- 修复页面切换滚动条跳动问题
- 修复移动端菜单点击外部不关闭

---

## [0.0.1] - 2026-09-20
- 项目初始化，搭建基础框架
