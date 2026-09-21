import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog 内容集合
 * - draft: true 本地预览可见，线上构建时过滤
 * - visible: false 本地可见，线上不输出（写完了但不想公开）
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    summary: z.string().max(200).default(''),
    tags: z.array(z.string()).default([]),
    category: z.enum(['tech', 'life']).default('tech'),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    visible: z.boolean().default(true),
  }),
});

/** Projects：灵感项目陈列室 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['active', 'completed', 'archived']).default('active'),
    description: z.string().max(120),
    cover: z.string().optional(),
    demo: z.string().url().optional(),
    repo: z.string().url().optional(),
    tech: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

/** 收藏夹通用字段 */
const collectBase = {
  title: z.string(),
  author: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  status: z.enum(['wishlist', 'ongoing', 'finished']).default('ongoing'),
  link: z.string().url().optional(),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  finishedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
};

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/collections/books' }),
  schema: z.object({
    ...collectBase,
    isbn: z.string().optional(),
    reread: z.boolean().default(false),
  }),
});

const music = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/collections/music' }),
  schema: z.object({
    ...collectBase,
    artist: z.string(),
    album: z.string().optional(),
    genre: z.string().optional(),
  }),
});

const novels = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/collections/novels' }),
  schema: z.object({
    ...collectBase,
    platform: z.string().optional(),
    progress: z.string().optional(),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/collections/videos' }),
  schema: z.object({
    ...collectBase,
    creator: z.string().optional(),
    type: z.enum(['movie', 'series', 'video', 'anime']).default('video'),
  }),
});

const links = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/collections/links' }),
  schema: z.object({
    ...collectBase,
    site: z.string(),
  }),
});

/** Notes：一闪念，短想法/碎片记录 */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    published: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, projects, books, music, novels, videos, links, notes };
