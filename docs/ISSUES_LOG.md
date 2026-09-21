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

<!--
示例（不要删，只作模板参考）：

### ISSUE-001：Astro 部署到 Cloudflare Pages 后图片不显示
- **日期**：2026-09-21
- **现象**：构建成功但线上页面图片 404
- **根因**：使用了 `/public/...` 绝对路径，但 astro.config.mjs 没设 base
- **解决方案**：在 astro.config.mjs 补 `base: ''` 并用 `import.meta.env.BASE_URL` 拼路径
- **状态**：已解决
- **备注**：图片统一走 astro:assets，不要再手写绝对路径
-->
