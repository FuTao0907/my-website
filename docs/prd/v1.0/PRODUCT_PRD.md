# Ange's website · v1.0 产品开发文档（冻结版）

> **项目名**：Ange's website（安歌的网站）
>
> **仓库名**：`anges-website`（GitHub 仓库路径待定）
>
> **站名定位**：Ange 的数字名片 + 项目陈列室 + 内容自留地

---

## 文档版本管理规则

- 本文档是 **产品 v1.0** 的产品开发文档，**冻结后不再修改**。
- 文档自身的版本号（如 v0.1 / v0.2 / v0.3）是 PRD 在评审期间的迭代记录，**与产品版本号（v1.0 / v1.5 / v2.0）是两套独立编号，不要混为一谈**。
- v1.0 正式上线后，新需求（深度功能、新模块）一律**另起新文档**，例如 `PRODUCT_PRD_v1.5.md`；不在本文件上继续加内容。
- 本文件冻结状态：**v1.0 开发以此为准**。

> 本文档用于规划「个人网站」从 0 到 1 的开发。目标是把
>
> **功能逻辑、信息架构、数据模型、UI 规范、部署方案**
>
> 全部写清楚，使任何人都能照着文档 1:1 复刻出一致的产品。
> 状态：待评审。评审方式：你逐条找问题，我逐条修订，直到本文档标记为 v1.0 冻结后再动手写代码。



***

## 0. 文档修订记录



| 版本   | 日期         | 修订人 | 说明     |
| ---- | ---------- | --- | ------ |
| v0.1 | 2026-09-20 | 豆包  | 初版，待评审 |
| v0.2 | 2026-09-20 | 豆包  | 第一轮评审：锁定 Astro/Yarn/极简单色/方案C/DNS分流；一闪念移入 v1.5；Now 页面提前到 v1；评论 v1 不接；收藏夹纯手填 |
| v0.3 | 2026-09-20 | 豆包  | 第二轮评审：React 锁定 18.3；项目定名 Ange's website / 安歌的网站；封面无图时用随机图形；域名暂缓 |



***

## 1. 项目背景与目标

### 1.1 我是谁（Owner 画像）



* 身份：前端开发工程师

* 习惯 1：经常会 "突然冒出一个想法"，然后动手做个小项目验证

* 习惯 2：日常大量消费音乐、网文、书籍、视频，对喜欢但记不住的东西会想写篇博客 / 笔记沉淀

* 长期诉求：想有一个完全自主、数据自己掌控的 "数字空间"，不依赖任何第三方平台（防封号、防平台关停、防算法劫持）

### 1.2 网站要解决什么问题



| 场景            | 现在的痛点                                      | 网站要做成的样子                                    |
| ------------- | ------------------------------------------ | ------------------------------------------- |
| 求职 / 接外包 / 合作 | 简历 PDF 单薄，项目散落各平台，对方看不到全貌                  | 一个链接甩过去：我是谁、做过什么、能联系到我、项目可直接体验              |
| 记录灵感项目        | 做完的小 demo 散落在 GitHub 仓库 / Vercel 临时链接，无人知晓 | 一个「Projects」入口，按状态 / 时间 / 标签陈列，附线上 demo 与源码 |
| 沉淀笔记          | 好文、好歌、好书、好视频看完就忘，写了散落在备忘录 / 笔记软件           | 「收藏夹」按品类归档，写过的短评 / 长感作为独立博文可被搜索、可被 RSS 订阅   |
| 个人品牌          | 在社交平台说话受算法和封号风险限制                          | 自定义域名 + SEO + RSS，客户 / 雇主 / 同好能主动找到我        |

### 1.3 非目标（v1 明确不做）



* ❌ 不做用户注册 / 登录系统（v1 纯静态站，没有 "别人也来注册" 的需求）

* ❌ 不做站内私信 / 评论系统的自研后端（评论如需，用 Giscus / Waline 这类第三方挂载）

* ❌ 不做后台 CMS 可视化编辑（v1 直接用 Markdown + Git 提交，Git 就是 CMS）

* ❌ 不做多语言（v1 仅中文，i18n 架构预留但不实现）

* ❌ 不做 Web App 复杂交互（如在线记账、文件分享）—— 这些是未来 "小工具" 模块的事，不在 v1



***

## 2. 产品定位

一句话定位：**「一个前端工程师的数字名片 + 项目陈列室 + 内容自留地」**。



* 对外（陌生人 / 雇主 / 合作者）：30 秒内看懂 "你是谁、做过什么、凭什么信你"

* 对内（自己）：一个想写就写、想收藏就收藏、不被平台规则绑架的家

差异化（和常见模板站的区别）：



1. **Projects 模块是一等公民**，不是简历里的一行字，而是能展示 "想法→实现→结果" 的完整卡片

2. **Collections（收藏夹）模块**：音乐 / 书籍 / 网文 / 影视 / 视频分品类，每条带我的评分和短评 —— 这是很多模板没有的

3. **博客轻量化**：v1 先做长文；v1.5 再加"一闪念"短粒度，避免 v1 同时维护两套列表



***

## 3. 信息架构（IA）

### 3.1 站点地图



```
/                       首页（Hero + 最近更新 + 快速入口）

/about                  关于我 / 在线简历

/projects               项目陈列室

&#x20; /projects/\[slug]      单个项目详情页

/blog                   博客/笔记列表

&#x20; /blog/\[slug]          单篇文章

&#x20; /blog/tags/\[tag]      按标签过滤

&#x20; /blog/categories/\[cat] 按分类过滤

/collections            收藏夹总览（分类导航）

&#x20; /collections/books    书单

&#x20; /collections/music    音乐

&#x20; /collections/novels   网文

&#x20; /collections/videos   影视 / 视频

&#x20; /collections/links    其他值得收藏的链接

/now                    「正在做什么」页面（可选，借鉴 nownownow.com）

/rss.xml                RSS 订阅

/404
```

### 3.2 全局导航



* 顶部导航（桌面端）：`首页  关于  项目  博客  收藏  现在`

* 右上角：暗色模式切换、RSS 图标

* 移动端：汉堡菜单，抽屉式展开

* 页脚：版权、联系方式（邮箱 / GitHub / 其他社交）、ICP 备案号（如启用国内 CDN 则需要）、主题与部署栈说明

### 3.3 首页布局（从上到下）



1. **Hero 区**：头像 / 一句话定位 / 正在做的事 / 两个 CTA（看项目、联系我）

2. **最近更新**（三列卡片）：

* 最近 3 篇博客

* 最近 3 个项目

* 最近 5 条收藏（跨品类混合流）

1. **关于我摘要**：一段 80 字以内自我介绍 + "了解更多" 按钮

2. **联系方式**：邮箱、GitHub、其他



***

## 4. 功能模块详细设计

### 4.1 关于我（/about）—— 在线简历

**目标**：面试官 60 秒扫完能做判断。

内容区块（可按个人情况裁剪）：



* 一句话自我介绍

* 技能树（按熟练度分组，用进度条或标签云，**不要堆一长串技术名词**）

* 工作经历（时间线：公司 → 职位 → 时间 → 一句话做了什么 → 关键成果数据）

* 教育背景（折叠，默认不展开）

* 联系我（邮箱、GitHub、微信二维码可选）

* 可下载 PDF 简历（可选 v1.5）

数据字段（存在 `src/content/about.yaml`）：



```
name: ""

role: "前端开发工程师"

tagline: ""

location: ""

avatar: "/avatar.png"

skills:

&#x20; - group: "熟练"

&#x20;   items: \["HTML/CSS", "TypeScript", "React", "Vue"]

&#x20; - group: "了解"

&#x20;   items: \[]

experience:

&#x20; - company: ""

&#x20;   title: ""

&#x20;   period: "2023.06 - 至今"

&#x20;   summary: ""

&#x20;   highlights:

&#x20;     - ""

social:

&#x20; github: "https://github.com/你的ID"

&#x20; email: "you@example.com"
```



***

### 4.2 项目陈列室（/projects）

**这是全站最核心、最能体现差异化的模块。**

列表页 `/projects`：



* 卡片网格（桌面 3 列 / 平板 2 列 / 手机 1 列）

* 每张卡片：封面图、项目名、一句话描述、技术栈标签、状态徽标（进行中 / 已完结 / 归档）、更新时间

* 顶部过滤器：全部 / 进行中 / 已完结 / 按技术栈筛选

* 排序：默认按更新时间倒序

详情页 `/projects/[slug]`：



* Hero：项目名 + 一句话价值主张

* **问题与动机**（Why：这个想法是怎么冒出来的？解决什么痛点？）

* **实现思路**（How：技术选型、架构图、踩过的坑）

* **成果与演示**（What：线上 demo 链接、GitHub 仓库链接、截图 / GIF）

* 时间线：从 idea 到上线的关键节点

* 相关文章：自动关联同标签的博客

数据字段（`src/content/projects/[slug].md` 的 frontmatter）：



```
\---

title: "项目名"

slug: "my-cool-project"

status: "active | archived | completed" # 三态

description: "一句话描述（≤50字）"

cover: "/projects/xxx/cover.png"

demo: "https://demo.example.com"

repo: "https://github.com/you/xxx"

tech: \["React", "Cloudflare Workers"]

tags: \["idea", "tool"]

startDate: 2026-08-01

endDate: 2026-09-01 # 未完结则留空

featured: false # 是否在首页推荐

\---
```

正文支持 MDX：可嵌代码块、图片、GIF、YouTube/B 站视频。

**封面图规则**：

- 有截图/设计图时用真实封面，走 `astro:assets` 自动优化
- 没有封面图时，**自动生成随机几何图形占位**（基于项目 slug 哈希出一个 deterministic SVG：几何形状 + accent 色 + 项目名首字母），不用外部图床、不用 picsum 这类随机图服务，刷新不变、隐私可控
- 占位图样式和整体极简单色风格统一，不抢戏



***

### 4.3 博客（/blog）

**v1 仅做长文（post）**：技术笔记、完整复盘、教程。短想法、生活碎片这类"一闪念"粒度推迟到 v1.5，避免 v1 同时维护两套列表/筛选/渲染逻辑。

列表页 `/blog`：



* 默认按时间倒序，时间线视图

* 顶部分类 Tab：全部 / 技术 / 生活（v1 不出现"一闪念"Tab）

* 支持按标签过滤

* 每篇卡片：标题、发布日期、摘要、标签、阅读时长

文章页：



* 顶部：标题、日期、标签、阅读时长

* 正文：Markdown/MDX，支持代码高亮、图片、表格

* 底部：上一篇 / 下一篇、标签列表（v1 不接评论区）

* TOC 目录（桌面端右侧浮动，移动端折叠）

数据字段（`src/content/blog/[slug].md`）：



```
\---

title: ""

slug: ""

published: 2026-09-20

updated: 2026-09-20 # 可选

summary: "100字以内摘要"

tags: \["frontend", "cloudflare"]

category: "tech | life"

cover: "" # 可选

draft: false # true 时本地预览可见，线上构建不输出该页面

visible: true # true=公开；false=本地可见、构建时不输出（见本章末「内容可见性机制」说明）

\---
```



***

### 4.4 收藏夹（/collections）

**定位**：这是 "我喜欢但怕忘" 的东西的归档系统，不是电商书单。

每个条目必须包含：



* 基础信息（名称、作者 / 艺人、链接）

* **我的评分**（1-5 星，支持半星）

* **我的短评**（至少写 30 字，否则不收录 —— 这是写这个模块的意义）

* 状态（想看 / 在看 / 看过 / 想听 / 常听 / 已弃）

子模块：



| 路径                  | 数据源     | 特有字段                               |
| ------------------- | ------- | ---------------------------------- |
| /collections/books  | 书籍      | 作者、ISBN（可选）、读完日期、是否重读              |
| /collections/music  | 音乐      | 艺人、专辑 / 单曲、曲风、网易云 / Spotify 链接     |
| /collections/novels | 网文      | 作者、平台、状态（连载中 / 完本）、追读进度            |
| /collections/videos | 影视 / 视频 | 导演 / UP 主、类型、观看日期、B 站 / YouTube 链接 |
| /collections/links  | 其他链接    | 站点、为什么值得存                          |

列表页交互：



* 每个品类一个子页，卡片式陈列

* 支持按评分排序、按状态筛选

* 顶部显示 "统计"：共 N 本、平均分、今年读了 X 本等（v1.5 再加）

数据字段示例（`src/content/collections/books/[slug].md`）：



```
\---

title: "书名"

author: "作者"

rating: 4.5 # 1-5

status: "wishlist | reading | finished"

finishedDate: 2026-08-10

link: "https://book.douban.com/subject/xxx/"

cover: "/collections/books/xxx.jpg"

tags: \["frontend", "design"]

\---

短评正文...
```



***

### 4.5 其他小功能（v1.0 必做 /v1.5 再做）



| 功能                | 版本   | 说明                                                            |
| ----------------- | ---- | ------------------------------------------------------------- |
| RSS 订阅            | v1.0 | /rss.xml，含博客和收藏更新                                             |
| Sitemap + robots  | v1.0 | SEO 基础                                                        |
| 暗色模式              | v1.0 | 跟随系统 + 手动切换，localStorage 持久化                                  |
| 全站搜索              | v1.0 | Pagefind（纯静态、零后端）                                             |
| 标签 / 分类页          | v1.0 | 见 IA                                                          |
| 「Now」页面           | v1.0 | 当前在做什么的一句话状态，纯静态页，成本极低                                       |
| 图片懒加载 + WebP/AVIF | v1.0 | Astro 内置 Image 组件                                             |
| 评论                | 暂不接入 | v1 不做；v1.5 视情况再评估 Giscus（GitHub Discussions） |
| 在线访问统计            | v1.5 | 不接百度统计（国内合规麻烦）；用 Cloudflare Web Analytics（免费、隐私友好、不加载 JS 到主站） |



***

## 5. 技术栈选型

### 5.1 推荐栈（请重点评审）



| 层    | 选型                                         | 理由                                                                                            |
| ---- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 框架   | **Astro 5**                                | 内容驱动网站首选； Islands 架构默认零 JS，页面天然快；SSG 静态产物对 Cloudflare Pages 完美适配；MDX/Content Collections 原生支持 |
| 语言   | TypeScript（strict）                         | 工程化保证，与前端日常栈一致                                                                                |
| 样式   | **Tailwind CSS v4**                        | 原子化、与 Astro 集成顺畅、v4 不再需要 config 文件                                                            |
| 内容   | Markdown / MDX + Astro Content Collections | 类型安全的内容管理；Git 即 CMS                                                                           |
| 交互岛  | **React 18.3（锁定）** | 仅在需要复杂交互的组件（如搜索框、暗色切换）用，用 `client:only` 等指令隔离；v1 不升 19，避免生态兼容风险 |
| 包管理器 | **Yarn**                                   | 按用户 AGENTS.md 规范                                                                              |
| 图标   | lucide-react / astro-icon                  | 树形图标，按需引入                                                                                     |
| 搜索   | Pagefind                                   | 纯静态构建期生成索引，运行时零依赖                                                                             |
| 部署   | **Cloudflare Pages**                       | 免费额度足够；Git 推送自动部署；全球 CDN                                                                      |
| 版本控制 | GitHub                                     | 公开仓库（除 draft 内容外）                                                                             |

### 5.2 为什么不是 Next.js/ Hugo / WordPress？



* **Next.js**： heavier，需要 Node 运行时或复杂的边缘配置；内容站用 Next 是杀鸡用牛刀，且国内访问 Vercel 默认节点慢

* **Hugo / Hexo**：构建快但模板生态老旧，写交互（如项目卡片筛选、收藏夹评分）需要自己造轮子，前端开发用这个浪费技术积累

* **WordPress**：需要 PHP 主机、数据库，部署到 Cloudflare 不直接；安全和维护成本高，不符合 "轻量、自主" 诉求

* **Astro**：静态优先 + 可按需注入 React/Vue/Svelte 岛，正好匹配 "博客为主 + 少量交互" 的形态

### 5.3 目录结构（规划）



```
my-website/

├── public/                 # 静态资源（favicon、头像、robots.txt）

├── src/

│   ├── components/        # Astro 组件

│   │   ├── ui/             # Button、Card、Tag 等基础组件

│   │   └── sections/       # Hero、ProjectCard、PostCard 等业务组件

│   ├── layouts/           # BaseLayout、PostLayout、ProjectLayout

│   ├── pages/              # 路由文件

│   ├── content/           # 内容集合（Git 即 CMS）

│   │   ├── config.ts      # Content Collections schema 定义

│   │   ├── about.yaml

│   │   ├── blog/           # \*.md

│   │   ├── projects/      # \*.md

│   │   └── collections/

│   │       ├── books/

│   │       ├── music/

│   │       ├── novels/

│   │       └── videos/

│   ├── styles/             # 全局样式（Tailwind 入口）

│   └── config.ts           # 站点配置（标题、URL、社交链接）

├── astro.config.mjs

├── tailwind.config.mjs     # v4 可省略，用 CSS @theme

├── package.json

└── tsconfig.json
```



***

## 6. UI / UX 设计方向

### 6.1 设计原则



1. **内容优先**：去掉所有装饰性动效和花哨渐变，文字是主角

2. **阅读友好**：正文行宽 ≤ 75ch（约 700px），行高 1.7-1.8，正文字号 16-17px

3. **克制的色彩**：v1 锁定**极简单色风格**——黑白灰为主 + 一个 accent 色，暗色模式做完整；后续想换风格再改

4. **少即是多**：全站交互不超过 3 种动效（hover 提升、淡入、骨架屏）

5. **响应式优先**：手机端优先设计，再向桌面端扩展

### 6.2 设计 token（待视觉细化）



```
色板（浅色）：

&#x20; \--bg: #ffffff

&#x20; \--fg: #1a1a1a

&#x20; \--muted: #6b7280

&#x20; \--accent: #2563eb（蓝色，可换）

&#x20; \--border: #e5e7eb

色板（暗色）：

&#x20; \--bg: #0f0f0f

&#x20; \--fg: #e5e5e5

&#x20; \--muted: #9ca3af

&#x20; \--accent: #60a5fa

字体：

&#x20; 中文：系统字体栈（-apple-system, "PingFang SC", "Microsoft YaHei"）

&#x20; 英文/数字：Inter 或系统栈

&#x20; 代码：JetBrains Mono / Fira Code

字号阶梯：14 / 16 / 18 / 24 / 32 / 48

间距阶梯：4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

圆角：卡片 8px，按钮 6px
```

### 6.3 组件规范要点



* **卡片**：统一 1px 边框 + 8px 圆角 + hover 时轻微上浮（translateY (-2px) + shadow）

* **标签**：灰底圆角胶囊，不超过 4 个 / 卡片

* **按钮**：主按钮实心 accent 色，次按钮描边

* **图片**：统一 `astro:assets` 处理，自动 WebP/AVIF + 响应式尺寸 + 懒加载

* **代码块**：暗色背景，行号可选，一键复制

### 6.4 可访问性（a11y）



* 所有图片必须有 alt

* 颜色对比度 ≥ WCAG AA（4.5:1）

* 键盘可导航（Tab 顺序合理、focus 样式可见）

* 语义化 HTML（article、section、nav、footer）



***

## 7. 性能与 SEO 目标

### 7.1 性能预算（Lighthouse，移动端）



| 指标             | 目标           |
| -------------- | ------------ |
| LCP            | < 1.8s       |
| FID / INP      | < 100ms      |
| CLS            | < 0.1        |
| Lighthouse 性能分 | ≥ 95         |
| 首屏 JS          | < 50KB（gzip） |

手段：Astro 默认零 JS、Image 组件、Pagefind 构建期搜索、字体子集化、CSS 仅 Tailwind 用到的类。

### 7.2 SEO



* 每个页面独立 `<title>` 和 meta description

* Open Graph + Twitter Card

* JSON-LD 结构化数据（Person、BlogPosting、SoftwareProject）

* sitemap.xml + robots.txt

* canonical URL

* 语义化 H1/H2 层级



***

## 8. 部署架构与国内访问加速

### 8.1 问题

Cloudflare Pages 默认节点在中国大陆访问时常遇到：



* 首次 DNS 解析慢

* 回源走国际出口骨干，晚高峰拥堵

* 虽然是静态站，但 TTFB 仍可能 1-3 秒

### 8.2 方案对比（请重点评审选哪个）



| 方案                                            | 成本                | 复杂度   | 国内速度          | 海外访问 | 维护成本       |
| --------------------------------------------- | ----------------- | ----- | ------------- | ---- | ---------- |
| **A. 纯 Cloudflare Pages 默认**                  | 免费                | ★     | 一般（1-3s TTFB） | 快    | 0          |
| **B. Cloudflare Workers 优选 IP 反代**            | 免费                | ★★★   | 快（200-500ms）  | 快    | 中（需定期换 IP） |
| **C. DNS 分流：国内走 EdgeOne Makers，国外走 CF Pages** | 免费                | ★★★   | 很快            | 快    | 低（一次配置）    |
| **D. Cloudflare China Network（接 JD Cloud）**   | 付费 + **需 ICP 备案** | ★★★★★ | 最快            | 快    | 高          |

### 8.3 已选定：方案 C（DNS 分流），B 作为备选

**架构**：



```
用户请求

&#x20; ├─ 国内用户 → DNSPod 智能解析 → EdgeOne Makers（腾讯云免费 CDN）→ 拉取同源静态资源

&#x20; └─ 海外用户 → DNSPod 智能解析 → Cloudflare Pages → 全球节点
```

要点：



* 域名 NS 解析托管到 DNSPod（支持分线路解析）

* 同一份静态资源部署到 Cloudflare Pages 和 EdgeOne Makers 两个平台

* DNSPod 加两条 CNAME：`境内` → EdgeOne CNAME；`境外` → Cloudflare Pages CNAME

* 两边都配置自定义域名

* SSL 证书：Cloudflare 自动签；EdgeOne 也自动签（可能需要手动上传一次证书）

**为什么不直接选 D（Cloudflare China Network）**：需要 ICP 备案，个人备案流程 2-4 周，且付费；对一个 v1 个人站成本过高。

**为什么不是 B（优选 IP）**：需要自己写 Worker 反代 + 定期测 IP，长期维护负担重；C 一次配置一劳永逸。

### 8.4 构建与发布流水线



* Git push 到 `main` 分支 → Cloudflare Pages 自动构建部署

* EdgeOne Makers 通过 GitHub 集成自动同步（或手动触发）

* 预览部署：push 到任何分支都有 CF Pages 预览链接，方便评审

### 8.5 域名



* **当前阶段暂缓**——项目先在 Cloudflare Pages 分配的默认 `*.pages.dev` 域名下开发和预览

* 上线前再决定用现有域名还是新买；届时根域名 + www 都指向同一站

* RSS、sitemap 路径固定（`/rss.xml`、`/sitemap-index.xml`），换域名不影响路径



***

## 9. 开发里程碑

> 假设每周投入 8-12 小时（业余时间）。以下是建议节奏，可按实际调整。

### M1：地基（1 周）



* [ ] 初始化 Astro 5 + TypeScript + Tailwind v4 项目（yarn）

* [ ] 配置 ESLint + Prettier + EditorConfig

* [ ] 设计系统基础：颜色 token、字体、间距、暗色模式切换

* [ ] BaseLayout、全局导航、页脚

* [ ] 部署到 Cloudflare Pages，跑通 CI/CD

**交付物**：一个能上线的 "空白壳子"，有导航、有暗色模式、能推就能部署。

### M2：内容模块（1.5 周）



* [ ] Content Collections schema 定义（blog /projects/collections/\*）

* [ ] 首页 + 关于我页

* [ ] 博客列表页 + 详情页（含 TOC、代码高亮、draft 机制）

* [ ] 标签 / 分类页

* [ ] RSS + Sitemap + SEO meta

**交付物**：能正常写博客并被搜索引擎收录。

### M3：项目 + 收藏（1.5 周）



* [ ] Projects 列表 + 详情页

* [ ] Collections 五个子模块

* [ ] Pagefind 全站搜索

* [ ] 真实数据填充：把已有的项目、读过的书、听过的歌录入一批

**交付物**：网站 "看起来像个真的站了"，不是空模板。

### M4：打磨与上线（1 周）



* [ ] Lighthouse 性能优化到 95+

* [ ] 响应式 + a11y 检查

* [ ] 国内访问加速配置（EdgeOne Makers + DNSPod 分流）

* [ ] 自定义域名接入

* [ ] 写第一篇 "我上线了" 的博客

**交付物**：v1.0 正式上线。

### M5：v1.5（上线后持续迭代）

* [ ] 一闪念（note）专用短流页

* [ ] 收藏夹统计页（年度报告风）

* [ ] Cloudflare Web Analytics

* [ ] Giscus 评论（视情况再评估）



***

## 10. 参考项目（学习用，不照抄）



| 项目                                                 | 链接                                                                               | 学什么               |
| -------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------- |
| Fuwari（Astro 主题）                                   | [github.com/saicaca/fuwari](https://github.com/saicaca/fuwari)                   | 简洁博客布局、暗色模式、卡片设计  |
| astro-paper                                        | [github.com/satnaing/astro-paper](https://github.com/satnaing/astro-paper)       | 博客 + 标签 + 搜索的完整实现 |
| [ashleemboyer.com](https://ashleemboyer.com)（个人站）  | [ashleemboyer.com](https://ashleemboyer.com)                                     | 极简个人站排版节奏         |
| [brianchanderson.com](https://brianchanderson.com) | [brianchanderson.com](https://brianchanderson.com)                               | 项目陈列卡片设计          |
| kyechou.dev（国内开发者）                                 | kyechou.dev                                                                      | 中文个人站的信息密度和阅读节奏   |
| 冴羽的博客（Astro）                                       | [juejin.cn/book/7452253924608147467](https://juejin.cn/book/7452253924608147467) | Astro 实战、内容组织方式   |
| emdash（Astro CMS on CF）                            | [github.com/emdash-dev/emdash](https://github.com/emdash-dev/emdash)             | 未来想加 CMS 时的参考     |



***

## 11. 第一轮评审决策记录

> 2026-09-20 与 Owner 对齐结果。后续变更在此追加。

| # | 议题 | 决策 |
|---|------|------|
| 1 | 技术栈 | **Astro 5**，不换 Next.js |
| 2 | 包管理器 | **Yarn**（按全局规范）；pnpm 的优势对本项目影响可忽略 |
| 3 | 收藏夹外部同步 | v1 **纯手填**，不接豆瓣/网易云/Goodreads 自动同步 |
| 4 | 评论系统 | v1 **不接入**；v1.5 再评估 Giscus |
| 5 | 国内加速方案 | **方案 C**：DNSPod 智能分流（国内→EdgeOne Makers，国外→Cloudflare Pages）；方案 D（Cloudflare China Network + ICP 备案）暂不考虑 |
| 6 | 域名 | **待定**——用现有域名还是新买，后续单独决策 |
| 7 | 多语言 | v1 **不做**，不预留 i18n 架构（避免过度设计） |
| 8 | 一闪念（note） | v1 **不做**，只做长文博客；移入 v1.5 |
| 9 | Now 页面 | **v1 做**（成本极低、性格鲜明） |
| 10 | 视觉风格 | v1 锁定**极简单色**（黑白灰 + 一个 accent），后续想换再改 |
| 11 | 内容公开性 | 单条内容可设置 `visible: false`，本地可见、构建时不输出（见 4.6） |
| 12 | React 版本 | v1 用 **React 18.3**，锁定，不升 19 |
| 13 | 项目命名 | 英文名 **Ange's website**，中文名 **安歌的网站**；仓库名 `anges-website` |
| 14 | 项目封面图 | 无真实封面时自动生成**随机几何图形 SVG 占位**（基于 slug 哈希，deterministic），不接外部图床 |
| 15 | 域名 | **暂缓**——先用 `*.pages.dev` 默认域名开发，上线前再定 |

### 内容可见性机制（v1）

> 回应"单条内容可以选择是否公开"。

**技术约束**：纯静态站点所有产物都是公开 HTML/JS，没有服务端鉴权，做不到"已发布但只对我可见"。v1 用如下机制：

- `draft: true`：本地 `astro dev` 可见，生产构建时**不生成该页面**、不进列表/索引/RSS
- `visible: false`：语义同上，专门用于"这条我不想公开"的内容（和 draft 区分：draft 是还没写完，visible:false 是写完了但不想公开）
- 两者都在构建时被过滤，**不会出现在线上任何位置**（包括 sitemap、RSS、搜索索引）
- 如果未来真需要"线上私密页"，v2 再考虑 Cloudflare Workers Basic Auth 或密码门，v1 不投入

**仍待你拍板的**：React 用 18.3 还是直接上 19？



***

## 12. 风险与开放问题



* **Cloudflare 国内访问的长期不确定性**：Cloudflare 节点 IP 可能被运营商调整，需预留 B 方案。

* **EdgeOne Makers 免费额度**：需确认个人使用的免费带宽上限（目前文档说个人静态站够用，但要盯一下）。

* **图片存储**：项目封面、收藏封面图放仓库里会让 Git 仓库变大，后期要不要迁到 R2 / 图床？

* **内容备份**：所有内容在 Git 仓库即备份；但要确认本地有备份策略（如私有镜像仓库）。



***

**End of v0.3 — 核心决策已全部锁定，可进入开发准备阶段；继续评审或直接开工都可以。**