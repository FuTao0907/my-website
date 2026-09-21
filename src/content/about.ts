export interface AboutExperience {
  company: string;
  title: string;
  period: string;
  summary: string;
  highlights: string[];
}

export interface AboutSkillGroup {
  group: string;
  items: string[];
}

export const about = {
  name: 'Ange',
  role: '前端开发工程师',
  tagline: '喜欢折腾小项目、记录技术与生活的前端开发者',
  location: '北京',
  avatar: '/avatar.jpg',
  skills: [
    { group: '熟练', items: ['HTML/CSS', 'TypeScript', 'JavaScript', 'React', 'Vue'] },
    { group: '熟悉', items: ['Astro', 'Tailwind CSS', 'Node.js', 'Git', 'Cloudflare'] },
    { group: '在学', items: ['性能优化', '边缘计算', '设计系统'] },
  ] satisfies AboutSkillGroup[],
  experience: [
    {
      company: '北京翼海云峰科技有限公司',
      title: '前端开发工程师',
      period: '2025.05 - 2026.04',
      summary: '外派至北京智者四海科技有限公司，负责知乎鸿蒙端适配开发',
      highlights: [
        '负责知乎业务在鸿蒙（HarmonyOS）系统端的适配工作',
        '处理多机型、多系统版本兼容性问题，保障核心页面与功能体验',
      ],
    },
  ] satisfies AboutExperience[],
  social: {
    github: 'https://github.com/FuTao0907',
    email: 'mailto:18010031387@163.com',
  },
};
