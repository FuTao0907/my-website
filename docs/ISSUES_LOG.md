# Ange's website · 问题台账

> 所有踩过的坑、根因、解决方案都记在这里。
> **遇到问题先搜这个文件**，确认没记过再新开一条；同一个问题不许修第二次。

---

## 格式模板

```
### ISSUE-XXX：一句话标题
- **日期**：YYYY-MM-DD
- **现象**：
- **根因**：
- **解决方案**：
- **状态**：已解决 / 已绕开
- **备注**：
```

---

## 已记录问题

### ISSUE-001：子目录页面 import BaseLayout 路径少写一层 `../`
- **日期**：2026-09-20
- **现象**：`yarn build` 报 `[UNRESOLVED_IMPORT] Could not resolve '../layouts/BaseLayout.astro'`
- **根因**：`src/pages/blog/index.astro` 在 `src/pages/blog/` 子目录下，`../` 指向 `src/pages/`，再找 `layouts/` 实际是 `src/pages/layouts/`；而布局文件在 `src/layouts/`，需要 `../../layouts/` 才能回到 `src/`
- **解决方案**：把 `src/pages/{projects,blog,collections}/index.astro` 里的 `../layouts/BaseLayout.astro` 改为 `../../layouts/BaseLayout.astro`
- **状态**：已解决
- **备注**：以后在 `src/pages/` 下新建子目录路由时，import 回 `src/` 下的文件一律用 `../../`；`src/pages/` 根目录下的页面才用 `../`。优先考虑在 `astro.config.mjs` 配 `vite.resolve.alias` 用 `@/` 别名彻底避免这类问题（M2 再做）

### ISSUE-002：相对路径 import 反复出错，改用 `@/` 别名
- **日期**：2026-09-20
- **现象**：build 多次报 `[UNRESOLVED_IMPORT]`，分别出现在 `about.astro`、`rss.xml.ts`、`blog/tags/*.astro`，都是 `../` 层数算错
- **根因**：不同目录层级的文件回引 `src/` 下模块时，`../` 层数要逐个算，极易错
- **解决方案**：在 `astro.config.mjs` 的 `vite.resolve.alias` 配 `@` → `fileURLToPath(new URL('./src', import.meta.url))`；`tsconfig.json` 配 `paths: { "@/*": ["./src/*"] }`。所有 import 统一用 `@/xxx`，不再写相对路径
- **状态**：已解决
- **备注**：别名必须用绝对路径（`fileURLToPath`），不能写 `'./src'`，否则 Vite 报 duplicated modules 警告

### ISSUE-003：Vite 把 .yaml 当 JS 解析导致构建失败
- **日期**：2026-09-20
- **现象**：`import data from '@/content/about.yaml'` 时报 `[PARSE_ERROR] Invalid Character '、'` 和 `Expected a semicolon`
- **根因**：用了 `@/` 别名后，Vite 不再走 Astro 的 yaml 处理管线，直接把 .yaml 当 JS/TS 文件解析
- **解决方案**：把 `about.yaml` 改成 `about.ts`，直接导出 TS 对象，附带类型定义
- **状态**：已解决
- **备注**：项目里放结构化数据优先用 `.ts`（带类型），不要用 `.yaml`/`.json` import；后续 projects/collections 的 schema 也走 Content Collections，不直接 import yaml

### ISSUE-004：重写 .astro 文件时漏写 import 导致 `BaseLayout is not defined`
- **日期**：2026-09-20
- **现象**：build 报 `ReferenceError: BaseLayout is not defined`
- **根因**：用 Edit/Write 重写 `collections/index.astro` 时只改了正文，漏掉了 frontmatter 里的 `import BaseLayout`
- **解决方案**：补回 import
- **状态**：已解决
- **备注**：写完每个新页面后先在本地跑一次 `astro dev` 或 `astro check`，再进批量工作

### ISSUE-005：Pagefind JS API 误用不存在的 `create()` 方法
- **日期**：2026-09-20
- **现象**：搜索页 F12 报错 `mod.create is not a function`，搜索完全不工作
- **根因**：凭印象写了 `pagefind.create()`，但实际 Pagefind 1.x 的 ESM bundle 导出的是 `{ search, createInstance, init, debouncedSearch, filters, ... }`，根本没有 `create`。`createInstance()` 返回实例，全局 `search()` 函数内部会自动 init
- **解决方案**：改成 `import * as pagefind from '/pagefind/pagefind.js'; await pagefind.init(); const res = await pagefind.search(q)`
- **状态**：已解决
- **备注**：第三方库 API 不要凭印象写，先看构建产物里的 `export {}` 语句确认有哪些导出。Pagefind 标准用法就是全局 `search()`，不需要自己 create 实例

### ISSUE-006：Astro `<script>` 里动态 import 外部脚本注入 `__VITE_PRELOAD__`
- **日期**：2026-09-20
- **现象**：搜索页报 `Uncaught ReferenceError: __VITE_PRELOAD__ is not defined`，即使加了 `/* @vite-ignore */` 也没用
- **根因**：Astro 会处理 `<script>` 标签里的所有动态 import，即使加了 @vite-ignore，打包时仍注入 Vite 运行时代码（`__VITE_PRELOAD__` 是 Vite 的 preload 运行时变量），而生产构建里这个变量在普通页面上下文不存在
- **解决方案**：把 `<script>` 改成 `<script is:inline>`，这样 Vite 完全不处理，浏览器原生执行 ESM 动态 import。同时脚本里不能用 TypeScript，全部用纯 JS 写法（var、function、无类型注解）
- **状态**：已解决
- **备注**：凡是要加载运行时才存在、且不属于 Vite 依赖图的脚本（Pagefind 这种构建后产物），一律用 `<script is:inline>` + 纯 JS，不要让 Astro 碰它。TypeScript 语法（类型、as、泛型）在 is:inline 里会直接报错

### ISSUE-007：页面切换时内容左右跳动（滚动条出现/消失导致布局偏移）
- **日期**：2026-09-21
- **现象**：点击导航切换页面时，关于页（内容多，有垂直滚动条）和其他短页面之间切换，居中的导航栏和内容会左右跳动一下
- **根因**：短页面内容不溢出，没有垂直滚动条；长页面内容溢出，出现垂直滚动条占了右边 10px。居中的 `max-w-5xl mx-auto` 容器在滚动条出现/消失时宽度变化，导致位置偏移
- **解决方案**：在 `html` 上加 `overflow-y: scroll`，强制始终显示垂直滚动条，不管内容长短都占着滚动条位置。`scrollbar-gutter: stable` 在某些场景下不生效，用 `overflow-y: scroll` 更保险
- **状态**：已解决
- **备注**：凡是有居中容器、且页面长短不一的网站，都要处理这个问题。`overflow-y: scroll` 会让短页面也有一个空的滚动条轨道，但对于防止跳动来说是最可靠的方案

### ISSUE-008：暗色模式下 accent 按钮白字对比度不足（2.54:1 < 4.5:1）
- **日期**：2026-10-04
- **现象**：Lighthouse 无障碍审计 95 分，color-contrast 报首页"看看我的项目"按钮白字在 `#60a5fa` 背景上对比度仅 2.54:1
- **根因**：亮色模式 accent 是 `#2563eb`（配白字 5.2:1 达标），但暗色模式 accent 是 `#60a5fa`（配白字只有 2.54:1）。所有 `bg-accent text-white` 按钮在暗色下都不达标，共 11 处
- **解决方案**：新增设计 token `--color-accent-fg`（accent 背景上的文字色）：亮色 `#ffffff`、暗色 `#0f0f0f`（对比度 7.5:1）。全站 11 处 `text-white` 替换为 `text-[var(--color-accent-fg)]`
- **状态**：已解决（复测 a11y 100）
- **备注**：**accent 背景上的文字一律用 `--color-accent-fg`，禁止写死 `text-white`**。已记入 docs/UI_SPEC.md §2.1 对比度约束

### ISSUE-009：OG 图片方案切换——astro-og-canvas 与 Astro 7 不兼容
- **日期**：2026-10-04
- **现象**：`yarn build` 报 `MISSING_EXPORT` / `Astro is not defined`（astro-og-canvas@0.13.2）；尝试 `generateOpenGraphImage`、`OGImageRoute` 三种写法均失败
- **根因**：astro-og-canvas 0.13.x 内部依赖的 API 在 Astro 7 中已移除/变更，插件导出在构建期解析不到
- **解决方案**：改用 `@resvg/resvg-js`（SVG → PNG）：新建 `src/pages/og/[slug].png.ts` endpoint，构建期为每篇公开博客/项目 + default 生成 1200x630 PNG；中文字体用仓库内置 `src/assets/NotoSansSC-Regular.woff2`（@fontsource 子集，1.08MB），resvg 用 `font.fontFiles` 显式加载
- **状态**：已解决（构建生成 4 张 PNG，博客/项目详情页 og:image/twitter:image 正确输出）
- **备注**：
  - `.png.ts` endpoint 是**纯 TS 模块，禁止写 `---` frontmatter**（会触发 vite-transform Unexpected token）
  - 字体路径**不能用 `import.meta.url`**（编译后指向 dist，会 ENOENT），改用 `resolve(process.cwd(), 'src/assets/...')`（构建时 cwd 恒为项目根，Cloudflare 环境一致）
  - `astro-og-canvas` 依赖已从 package.json 移除
  - 标题换行按像素宽度估算（中文/全角 60px、英文 32px，对应 60px 字号），避免"Hello World：这个网站诞生了"这种中英混排被按字符数误断行

### ISSUE-010：构建警告——glob-loader 提示 notes 目录无内容
- **日期**：2026-10-04
- **现象**：`yarn build` 有两条 `[WARN] [glob-loader] No files found matching "**/*.md" in directory "src\content\notes"` 和 `[content] The collection "notes" does not exist or is empty`
- **根因**：一闪念（notes）collection 已在 content.config.ts 声明、notes 页面已上线，但 `src/content/notes/` 还没有任何笔记内容，glob-loader 对空目录发出警告
- **解决方案**：无需改代码——这是"内容为空"的良性警告。notes 页面已有空状态 UI（"还没有一闪念，等我想到什么就记下来"）。等用户写入第一篇笔记后警告自动消失
- **状态**：已知预期行为（不阻塞构建）
- **备注**：以后再新建 collection 时，若目录暂时无内容，此警告属正常；上线前确认页面有空状态兜底即可

### ISSUE-011：astro check 与 TypeScript 7 不兼容（需要 6.x）
- **日期**：2026-10-04
- **现象**：`yarn astro check` 报 `The TypeScript module loaded (found 7.0.2) does not expose the programmatic API that astro check relies on`
- **根因**：TypeScript 7（原生编译器）不再提供 TS 6.x 的 programmatic API，而 astro check / @astrojs/language-server 依赖该 API（官方 roadmap 讨论 #1321 跟踪支持）
- **解决方案**：devDependencies 的 `typescript` 降到 `6`（当前 6.0.3）。@astrojs/check 需一并安装（`yarn add -D @astrojs/check typescript@6`）
- **状态**：已解决（astro check 0 errors / 0 warnings / 0 hints）
- **备注**：**不要升级 typescript 到 7.x**，直到 astro check 官方支持；装依赖时国内网络需用 `--registry https://registry.npmmirror.com`（registry.yarnpkg.com 直连被阻断，报 ERR_TLS_CERT_ALTNAME_INVALID）

### ISSUE-012：zod v4 迁移——astro:content 的 z 已弃用、z.string().url() 弃用
- **日期**：2026-10-04
- **现象**：astro check 报大量 `ts(6385): 'z' is deprecated`（从 `astro:content` 或 `astro:schema` 导入 z 均报）
- **根因**：Astro 7 内部使用 zod v4（`astro/zod` → `zod/v4`），`astro:content` / `astro:schema` 的 z 导出是 v3 兼容层（标记 deprecated）；zod v4 同时弃用了 `z.string().url()`（改为独立 `z.url()`）
- **解决方案**：
  - `zod`（^4.6.5）加入 dependencies（作为直接依赖，此前是 astro 的传递依赖）
  - `src/content.config.ts`：`import { z } from 'zod'`（顶层导出 zod v4，无 deprecated 标记）
  - `z.string().url().optional()` 全部改为 `z.url().optional()`（projects 的 demo/repo、收藏的 link 共 3 处）
- **状态**：已解决（astro check 0 hints）
- **备注**：zod v4 的 string format 校验（url/email/uuid 等）都改成了独立函数，`.string().xxx()` 写法以后直接写 `z.xxx()`

### ISSUE-013：EdgeOne 回源 Host 默认带加速域名 → Cloudflare Pages 返回 409
- **日期**：2026-10-04
- **现象**：`http://philia093.ink` 访问返回 `409 Conflict`（响应头 Server: cloudflare / CF-RAY，来自 Cloudflare Pages），EdgeOne 加速配置看着都正常
- **根因**：EdgeOne 源站设置的"源主机头（Host Header）"默认是**使用加速域名称**（philia093.ink），回源时带着这个 Host 打到 Cloudflare Pages；Pages 只认它绑定过的域名，不认 philia093.ink → 409
- **解决方案**：EdgeOne 源站设置 → 源主机头 改为**使用源域名**（anges-website.pages.dev），回源时 Pages 就正常响应
- **状态**：已解决（等待验证）
- **备注**：EdgeOne 回源 Cloudflare Pages 这类"只认绑定域名"的源站时，**回源 Host 必须显式设为源站域名**；DNS 探测方法：`Resolve-DnsName philia093.ink` 看 CNAME 链、curl 看响应头是否含 EO-* 与 CF-RAY

### ISSUE-014：DNSPod 分线路解析导致 EdgeOne 免费证书自动验证失败
- **日期**：2026-10-04
- **现象**：EdgeOne 申请免费证书报 `FailedOperation.ApplyCertAutoVerificationFailed`（CheckFreeCertificateVerification），path 指向站点 DNS 记录页
- **根因**：EdgeOne 免费证书由 Let's Encrypt 颁发，**CA 验证服务器主要在中国大陆以外（北美）**；DNSPod 分线路解析时"默认"线路指向了 `anges-website.pages.dev`（非 EdgeOne），CA 走默认线路访问不到 EdgeOne 的验证文件 → 验证失败（官方文档明确：分线路/分区域解析会导致此失败）
- **解决方案**：把 DNSPod 所有线路统一指向 EdgeOne CNAME（`philia093.ink.eo.dnse3.com`）——默认线路也从 pages.dev 改为 EdgeOne，并删除电信/联通/移动三条值相同的分线路记录，合并为一条默认 CNAME。等 TTL（600s）生效后重新申请证书
- **状态**：修复中（DNS 合并后等待重新验证）
- **备注**：EdgeOne 免费套餐全球加速且流量不计量，**没必要保留"国外直连 pages.dev"的默认线路**，全量走 EdgeOne 反而避免 CA 验证和源站 409 两类问题；CNAME 接入 + 分线路的组合对免费证书不友好

### ISSUE-015：静态托管下 URL query 筛选完全不生效（v1.0 遗留）
- **日期**：2026-10-04
- **现象**：本地 `astro dev` 下 `/projects?tech=zzz` 能正确过滤为空；但 `astro preview`（= Cloudflare Pages 静态托管行为）访问同一 URL 却显示全部项目——项目/博客/收藏所有筛选 tab 在线上都是"死"的
- **根因**：Astro 静态生成（SSG）页面时 `Astro.url.searchParams` 是构建期 URL（无 query），服务端按 `?status=xxx` 做的过滤在构建时被固化为"全部"。本地 dev 是 SSR 动态渲染所以正常，preview/线上是纯静态 HTML，query 参数无人消费
- **解决方案**：改为"全量渲染 + 客户端过滤"——页面输出全部数据卡片（带 `data-status`/`data-tech`/`data-rating`/`data-date` 属性），`<script is:inline>` 在客户端解析 `location.search` 过滤/排序 DOM；筛选链接点击 `preventDefault` + `history.pushState` 无刷新过滤（跨维度参数互相保留），监听 `popstate` 支持前进后退；空态容器预置 hidden，客户端按结果显隐
- **状态**：已解决（浏览器实测 `?tech=zzz` → 空态+清除筛选；点"进行中" → URL 合并为 `?status=active&tech=zzz`）
- **备注**：**以后所有依赖 URL query 的筛选/分页，一律客户端实现，不要在 SSG 构建时读 searchParams 过滤**；涉及页面：projects/index、blog/index、collections/{books,links,novels,music,videos}/index

### ISSUE-016：页面切换中间帧新旧内容叠加（View Transitions 旧快照未让位）
- **日期**：2026-10-04
- **现象**：线上（philia093.ink）切换页面时，过渡中间帧出现"旧页面内容半透明叠加在新页面内容上"（如首页 Hero/三栏叠在项目页内容上，形成重叠文字）。本地 dev 不明显，线上复现
- **根因**：`html:not(.theme-switch)::view-transition-old(main-content) { animation: none }` —— 给旧内容快照设了 `animation: none`，旧快照在整段 400ms 过渡里**保持原位且完全不消失**；新内容从 `translateY(8px) + opacity:0` 淡入覆盖其上，过渡中段新旧两页内容同时可见 → 叠加
- **解决方案**：旧快照改为立即让位：`animation: route-leave 1ms both`（route-leave keyframe 结束态为 `opacity:0`，1ms 内完成并保持）。过渡变成"旧内容瞬间消失 → 新内容 400ms 淡入上移"，不再叠加
- **状态**：已解决（本地 preview 实测：手动 startViewTransition 替换 main 后页面干净无残留；真实导航切换无叠加）
- **备注**：**View Transitions 里"让旧快照让位"必须用一个 1ms 结束态动画（`Xms both` 到 opacity:0），不能写 `animation: none`**——none 会让旧快照整个过渡期钉在原位；新快照动画时长可正常配置

### ISSUE-001：Astro 部署到 Cloudflare Pages 后图片不显示
- **日期**：2026-09-21
- **现象**：构建成功但线上页面图片 404
- **根因**：使用了 `/public/...` 绝对路径，但 astro.config.mjs 没设 base
- **解决方案**：在 astro.config.mjs 补 `base: ''` 并用 `import.meta.env.BASE_URL` 拼路径
- **状态**：已解决
- **备注**：图片统一走 astro:assets，不要再手写绝对路径
-->
