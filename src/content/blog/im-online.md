---
title: "我上线了：Ange's website v1.0"
published: 2026-09-21
summary: "从想法到上线，记录 v1.0 做完的所有功能，以及踩过的坑。"
tags: [meta, launch]
category: tech
---

## 终于上线了

从昨天开始写代码，到今天正式部署到 Cloudflare Pages，v1.0 终于跑起来了。

## v1.0 做了什么

**核心功能：**
- 线上简历（关于页）
- 项目陈列室（带状态筛选、随机封面）
- 博客系统（标签、RSS、阅读时长、上一篇/下一篇）
- 收藏夹（书、音乐、网文、视频、链接，五星评分）
- 全站搜索（Pagefind）
- Now 页面（当前在做什么）

**技术选型：**
- Astro 7 + Tailwind v4 + React 18.3
- 包管理器用 Yarn
- 部署在 Cloudflare Pages

**设计：**
- 极简单色风格（黑白灰 + 一个蓝色 accent）
- 暗色模式（圆形扩散动画）
- 移动端响应式（汉堡菜单）
- 自定义滚动条、a11y 优化

## 踩过的坑

做的过程中踩了不少坑，都记在 ISSUES_LOG 里了：
- 相对路径 import 算错层数 → 改用 `@` 别名
- Vite 把 yaml 当 JS 解析 → 改用 ts 文件
- Pagefind API 用错 → 看构建产物的 export 才搞对
- Vite 动态 import 注入 `__VITE_PRELOAD__` → 用 `is:inline` 绕过
- 页面切换滚动条跳动 → 强制 `overflow-y: scroll`

## 接下来

v1.0 只是起点。后面计划：
- 一闪念（短笔记粒度）
- 评论系统
- 更多内容填充
- 自定义域名 + 国内加速优化

这是我的第一个个人站，也是一个数字资产的开始。慢慢来，持续迭代。
