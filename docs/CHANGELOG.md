# Ange's website · CHANGELOG

> 版本号规则见 `docs/DEVELOPMENT.md`。本文件按时间倒序记录每次发版。

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
