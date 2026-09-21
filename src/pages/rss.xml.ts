import rss from '@astrojs/rss';
import { getPublishedPosts } from '@/utils/posts';
import { SITE } from '@/config';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: `${SITE.nameZh}的博客`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.published,
      description: post.data.summary,
      categories: post.data.tags,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>zh-cn</language>',
  });
}
