# UI 规范（UI_SPEC）

> 目标：完整记录 Ange's website 的视觉风格、布局、组件、动效与交互逻辑，任何人按此文档 + 源码即可 1:1 复刻。
> 版本：v1.1 · 配套代码：`src/styles/global.css`、`src/components/*`、`src/layouts/BaseLayout.astro`

---

## 1. 设计原则

1. **极简单色**（PRD v1.0 §6.2 锁定）：全站只有黑白灰 + 单一 accent 蓝色，无渐变、无多色、无装饰性插画。
2. **内容优先**：留白充足，信息密度克制，动效服务于状态反馈，不喧宾夺主。
3. **克制的动效**：所有动画 ≤ 500ms，悬停仅用 `transition-colors` / `transition-opacity`，并尊重 `prefers-reduced-motion`。
4. **暗色先行**：暗色模式是完整的一等公民，所有颜色有亮/暗两套 token，任何新组件必须双主题可用。

---

## 2. 设计 Token（唯一权威来源：`src/styles/global.css`）

### 2.1 颜色

定义于 `@theme`（亮色默认）+ `.dark` 覆盖（暗色）。

| Token | 亮色 | 暗色 | 用途 |
|-------|------|------|------|
| `--color-bg` | `#ffffff` | `#0f0f0f` | 页面背景 |
| `--color-fg` | `#1a1a1a` | `#e5e5e5` | 主文字 |
| `--color-muted` | `#6b7280` | `#9ca3af` | 次要文字/元信息 |
| `--color-accent` | `#2563eb` | `#60a5fa` | 强调色（链接、激活态、主按钮） |
| `--color-accent-fg` | `#ffffff` | `#0f0f0f` | **accent 背景上的文字色**（对比度达标） |
| `--color-border` | `#e5e7eb` | `#2a2a2a` | 边框、分隔线、浅底 |
| `--color-card` | `#ffffff` | `#161616` | 卡片背景 |

**对比度约束（a11y 硬性要求，≥4.5:1）：**
- 亮色：`#2563eb` + 白字 = 5.2:1 ✅
- 暗色：`#60a5fa` + `#0f0f0f` 深字 = 7.5:1 ✅
- **禁止**在 accent 背景上写死 `text-white`，必须用 `text-[var(--color-accent-fg)]`（曾因暗色下白字仅 2.54:1 被 Lighthouse 扣分）。

### 2.2 字体

| Token | 值 |
|-------|-----|
| `--font-sans` | `-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Segoe UI', Roboto, sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', Consolas, monospace` |

无外部字体加载（不引 Google Fonts，避免国内网络阻塞 + 提升性能）。

### 2.3 字号阶梯

| Token | 值 | 典型用途 |
|-------|-----|---------|
| `--text-xs` | 0.75rem | 标签、辅助信息 |
| `--text-sm` | 0.875rem | 元信息、导航、按钮 |
| `--text-base` | 1rem | 正文 |
| `--text-lg` | 1.125rem | 正文强调 |
| `--text-2xl` | 1.5rem | 区块标题 |
| `--text-3xl` | 2rem | 页面标题 |
| `--text-4xl` | 3rem | Hero 大标题 |

正文排版（`.prose-content`）：字号 **17px**、行高 **1.8**。

### 2.4 圆角 / 间距约定

- 按钮/输入：`rounded-md`（6px）
- 标签 chip：`rounded-full`
- 卡片：`rounded-xl`（12px）
- 代码块：`rounded-lg`（8px）+ `rounded`（块级内 `pre` 用 8px）
- 页面内边距：`px-4 sm:px-6`，主区域垂直 `py-10`

---

## 3. 布局规范

### 3.1 页面容器（BaseLayout）

```
body: min-h-screen flex flex-col
  ├─ Skip link（sr-only，focus 时显示）
  ├─ Header（sticky top-0, z-40）
  ├─ main#main-content: flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10
  │    └─ 各页面内容
  ├─ Footer
  └─ 回到顶部按钮（fixed bottom-6 right-6）
```

- 全站内容宽度统一 **`max-w-5xl`（64rem）**，居中 `mx-auto`，两侧 `px-4 sm:px-6`——所有页面一致，防止宽度漂移（曾因不统一出现滚动条跳动）。
- 正文阅读宽度：`.prose, article { max-width: 70ch }`。

### 3.2 顶部导航（Header）

- `sticky top-0` + `bg-[var(--color-bg)]/80 backdrop-blur`（毛玻璃半透明），高度 `h-16`。
- 左侧 Logo：`Ange<span muted>.dev</span>`。
- 桌面端（≥768px）：导航链接 `text-sm gap-6`，当前页 `text-[var(--color-accent)] font-medium`，其余 `text-[var(--color-fg)]`，hover 变 accent。
- 右侧操作区：主题切换按钮、搜索按钮、汉堡按钮（<768px 显示）。
- 移动端下拉菜单：`absolute left-0 right-0 top-full`，**不占文档流**（曾因占位把内容往下顶，已改为浮层），背景 `color-mix(bg 92%, transparent) + backdrop-blur-md` 半透明。

导航项定义在 `src/config.ts` 的 `SITE.nav`（顺序：首页/项目/博客/一闪念/收藏/关于）。

### 3.3 页脚（Footer）

- `border-t`，双列：左版权 `© {year} Ange · 用 Astro 构建，部署在 Cloudflare`；右侧链接 GitHub / Email / RSS / 站点地图，hover 变 accent。

---

## 4. 组件规范

### 4.1 按钮

| 变体 | Class | 场景 |
|------|-------|------|
| 主按钮 | `px-5 py-2.5 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-sm font-medium hover:opacity-90 transition-opacity` | 首页 CTA、404 回首页、项目"在线演示"、收藏"查看原始链接" |
| 次按钮 | `px-5 py-2.5 rounded-md border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-border)] transition-colors` | 首页"了解更多"、项目"源码" |

### 4.2 标签 / 筛选 Chip

- 筛选 chip：`px-3 py-1.5 rounded-full`；激活态 `bg-[var(--color-accent)] text-[var(--color-accent-fg)]`，未激活 `border border-[var(--color-border)] hover:bg-[var(--color-border)]`。
- 内容标签（博客 tags、收藏分类）：`px-2 py-0.5 rounded-full bg-[var(--color-border)] text-xs`。

### 4.3 卡片（相关文章 / 相关项目 / 推荐）

`block p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors`，标题 `group-hover:text-[var(--color-accent)]`。

### 4.4 目录 TOC（TableOfContents）

- 仅 `lg:` 及以上显示：`fixed right-8 top-1/2 -translate-y-1/2 w-56 max-h-[70vh] overflow-y-auto`。
- 标题行：`text-xs uppercase tracking-wider text-muted`，正文 `text-sm`。
- h3 二级缩进 `pl-4 text-xs`。
- **当前章节高亮**：IntersectionObserver（`rootMargin: '-20% 0px -80% 0px'`），命中的标题加 accent + font-medium。

### 4.5 项目封面（ProjectCover，确定性随机几何）

- 无封面图时生成：基于 `seed`（项目 slug）字符串哈希 → 确定性选择 圆/三角/圆角矩形 之一 + 冷色系 hue + 透明度，刷新/换端不变。
- 容器：`aspect-ratio` 按 `ratio` prop（默认 16/9，详情页 21/9），`rounded-lg border`。

### 4.6 回到顶部按钮

`fixed bottom-6 right-6 w-10 h-10 rounded-full bg-accent text-[var(--color-accent-fg)] shadow-lg z-40`，滚动 >300px 显示（opacity/invisible 切换）。

### 4.7 代码块复制

- 悬停 `pre` 显示右上角"复制"按钮（`.code-copy-btn`），点击复制 `pre>code` 文本，成功显示"已复制" 2 秒，失败显示"失败"。

### 4.8 阅读进度条（博客详情）

`fixed top-0 left-0 h-0.5 bg-accent z-50`，滚动时按文档高度比例更新 `width`。

### 4.9 面包屑（博客/项目/收藏详情）

`text-sm text-muted`，链接 hover accent，分隔符 `/`（`mx-2`），末级 `text-fg`。

---

## 5. 主题系统与暗色切换

### 5.1 机制

- **class 策略**：`<html class="dark">` 触发暗色，`@custom-variant dark` 接入 Tailwind。
- **首屏防闪烁**：BaseLayout `<head>` 内联脚本，读 `localStorage.theme`，无记录时跟随 `prefers-color-scheme`，在首帧前加 class。
- 切换时写 `localStorage.theme = 'light' | 'dark'`。

### 5.2 切换动画（圆形墨水扩散）

```js
// 支持 View Transitions API 的浏览器（Chrome/Edge/Safari）
document.startViewTransition(apply);   // apply = 切换 class + localStorage
transition.ready 后，animate() 从按钮中心 clip-path: circle(0px) → circle(radius)
// 时长 500ms，ease-in-out，作用于 ::view-transition-new(root)
// 不支持时直接切换（无动画）
```

- 全局样式禁用了默认的 view-transition 动画（`animation: none`），完全交给 JS 控制。
- **已知限制**：该扩散动画目前仅在暗色切换时生效；亮色无此效果（v1 接受现状）。

---

## 6. 动效规范

| 场景 | 实现 | 时长 |
|------|------|------|
| 暗色切换扩散 | View Transitions + clip-path circle | 500ms |
| 页面切换淡入 | global.css `.fade-in`（每页根元素） | 尊重 reduced-motion |
| 悬停反馈 | `transition-colors` / `transition-opacity` | 默认 150ms |
| 回到顶部按钮 | `transition-all duration-300` | 300ms |
| 阅读进度条 | `transition-[width] duration-100` | 100ms |

`prefers-reduced-motion: reduce` 时全局 `animation/transition-duration: 0.01ms !important`，滚动动画改 `auto`。

---

## 7. 响应式断点

| 断点 | 行为 |
|------|------|
| `< 640px`（默认） | 单列布局，导航折叠为汉堡菜单 |
| `≥ 640px`（sm） | 内边距从 px-4 → px-6；相关卡片 2 列 |
| `≥ 768px`（md） | 桌面导航显示；首页三列布局；页脚横向排布；卡片 3 列 |
| `≥ 1024px`（lg） | TOC 目录显示（博客/长文详情） |

移动端汉堡菜单状态：打开/关闭切换 aria-expanded；**点击菜单外部关闭**；**resize 到 ≥768px 时自动重置关闭**。

---

## 8. 无障碍（a11y）规范

- 所有 accent 背景文字用 `--color-accent-fg`（对比度 ≥4.5:1，Lighthouse 已验证 100 分）。
- Skip link：`sr-only`，focus 时固定显示，跳到 `#main-content`。
- 图标按钮必须有 `aria-label`（主题切换、搜索、汉堡）。
- 汉堡菜单：`aria-expanded` + `aria-controls="mobile-menu"`，图标切换 open/close。
- 键盘快捷键：任意页面按 `/`（非输入框内）跳转 `/search`，`e.preventDefault()` 防输入斜杠。
- 锚点跳转防遮挡：`h1[id]~h6[id] { scroll-margin-top: 80px }`（TOC 点击不被 sticky 导航盖住）。
- `prefers-reduced-motion` 全站降级。
- 图片必须 `alt`。

---

## 9. 滚动条（自定义）

- WebKit：`::-webkit-scrollbar` 宽 10px，thumb 用 `--color-border`（hover 变 muted），`border: 2px solid transparent + background-clip: padding-box` 实现内边距效果。
- Firefox：`scrollbar-width: thin; scrollbar-color: var(--color-border) transparent`。
- `html { overflow-y: scroll }` 强制常显滚动条，**防止页面切换时因滚动条出现/消失导致内容左右跳动**（ISSUES-007）。

---

## 10. 打印样式

- 隐藏 `header / footer / #back-to-top / .code-copy-btn`。
- `main { max-width: 100% !important; padding: 0 }`。
- 背景强制白、文字强制黑；链接加下划线。

---

## 11. 关键文件索引

| 文件 | 职责 |
|------|------|
| `src/styles/global.css` | 全部设计 token、全局样式、滚动条、打印、prose 排版 |
| `src/config.ts` | 站点名、URL、导航、社交链接（改导航顺序/链接都在这） |
| `src/layouts/BaseLayout.astro` | 页面骨架、SEO/OG/JSON-LD、主题首屏脚本、回到顶部、快捷键 |
| `src/components/Header.astro` | 导航、主题切换（扩散动画）、搜索、汉堡菜单 |
| `src/components/Footer.astro` | 版权 + 链接 |
| `src/components/TableOfContents.astro` | TOC + 高亮 |
| `src/components/ProjectCover.astro` | 确定性随机几何封面 |
