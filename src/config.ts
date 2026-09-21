/**
 * 站点全局配置
 * 所有页面从这里取站点名、描述、社交链接，避免散落硬编码。
 * 上线前把 url 改成正式域名。
 */
export const SITE = {
  name: "Ange's website",
  nameZh: '安歌的网站',
  title: 'Ange · 安歌',
  description:
    '前端工程师 Ange 的数字名片、项目陈列室与内容自留地——写博客、做项目、收藏好东西。',
  // 上线前替换为正式域名；当前先用 pages.dev 默认域名
  url: 'https://anges-website.pages.dev',
  author: 'Ange',
  locale: 'zh-CN',
  nav: [
    { text: '首页', href: '/' },
    { text: '项目', href: '/projects' },
    { text: '博客', href: '/blog' },
    { text: '一闪念', href: '/notes' },
    { text: '收藏', href: '/collections' },
    { text: '关于', href: '/about' },
  ],
  social: {
    github: 'https://github.com/FuTao0907',
    email: 'mailto:18010031387@163.com',
  },
} as const;

export type Site = typeof SITE;
