import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/** 生产环境过滤草稿与不可见内容；开发环境全部可见 */
export function isPublic(p: BlogPost): boolean {
  if (import.meta.env.DEV) return true;
  return !p.data.draft && p.data.visible;
}

/** 获取已发布博客，按日期倒序 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const all = await getCollection('blog');
  return all
    .filter(isPublic)
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

/** 粗略阅读时长：中文按 300 字/分钟，英文按 200 词/分钟 */
export function readingMinutes(text: string): number {
  const chars = text.replace(/\s/g, '').length;
  return Math.max(1, Math.round(chars / 300));
}

/** 格式化日期 */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

/** 从 markdown 文本提取 h2/h3 标题，用于 TOC */
export function extractHeadings(md: string): Heading[] {
  const headings: Heading[] = [];
  const lines = md.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const depth = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
        .replace(/\s+/g, '-');
      headings.push({ depth, text, slug });
    }
  }
  return headings;
}
