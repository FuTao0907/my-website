// OG 图片自动生成：构建期为每篇博客/项目 + 默认图生成 1200x630 PNG
// 方案：resvg（@resvg/resvg-js）渲染 SVG -> PNG，字体用仓库内置 Noto Sans SC（woff2）
// 说明：astro-og-canvas 与 Astro 7 不兼容（MISSING_EXPORT），改用本方案
import { getCollection } from 'astro:content';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isPublic } from '@/utils/posts';
import { isPublicProject } from '@/utils/projects';

// 构建时 cwd 固定为项目根（本地与 Cloudflare 构建环境一致），从源码路径读字体
const FONT_PATH = resolve(process.cwd(), 'src/assets/NotoSansSC-Regular.woff2');
readFileSync(FONT_PATH); // 构建期确认字体存在，缺失直接报错

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 估算文本渲染宽度：中文/全角 60px，英文/数字 32px（对应 60px 字号） */
function measureWidth(s) {
  return [...s].reduce(
    (w, ch) => w + (/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef\u3000-\u303f]/.test(ch) ? 60 : 32),
    0,
  );
}

/** 标题自动换行：按像素宽度截断（最大行宽 1000px），最多 3 行，超出加省略号 */
function wrapText(text, maxWidth = 1000, maxLines = 3) {
  const chars = [...text];
  const lines = [];
  let line = '';
  for (const ch of chars) {
    if (measureWidth(line + ch) > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length === maxLines) break;
    } else {
      line += ch;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (measureWidth(text) > maxWidth * maxLines) {
    // 超出 3 行容量：最后一行截断 + 省略号
    let last = lines[maxLines - 1] ?? '';
    while (last && measureWidth(last + '…') > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = last + '…';
  }
  return lines.length > 0 ? lines : [''];
}

/** SVG 模板：极简单色风格，深色底 + accent 竖条 + 白标题 */
function buildSvg(title, label) {
  const lines = wrapText(title);
  const y0 = 300;
  const lineHeight = 88;
  const textLines = lines
    .map(
      (line, i) =>
        `<text x="80" y="${y0 + i * lineHeight}" font-size="60" fill="#ffffff" font-family="Noto Sans SC, sans-serif">${escapeXml(line)}</text>`,
    )
    .join('\n  ');
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0f0f0f"/>
  <rect x="0" y="0" width="12" height="630" fill="#60a5fa"/>
  <text x="80" y="130" font-size="30" fill="#60a5fa" font-family="Noto Sans SC, sans-serif">${escapeXml(label)}</text>
  <text x="80" y="180" font-size="30" fill="#9ca3af" font-family="Noto Sans SC, sans-serif">Ange's website</text>
  ${textLines}
  <text x="80" y="580" font-size="26" fill="#6b7280" font-family="Noto Sans SC, sans-serif">anges-website.pages.dev</text>
</svg>`;
}

export async function getStaticPaths() {
  const posts = (await getCollection('blog')).filter(isPublic);
  const projects = (await getCollection('projects')).filter(isPublicProject);
  return [
    { params: { slug: 'default' }, props: { title: 'Ange · 安歌', label: "Ange's website" } },
    ...posts.map((p) => ({ params: { slug: p.id }, props: { title: p.data.title, label: '博客' } })),
    ...projects.map((p) => ({ params: { slug: p.id }, props: { title: p.data.title, label: '项目' } })),
  ];
}

export const GET = async ({ props }) => {
  const { title, label } = props;
  const svg = buildSvg(title, label);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { fontFiles: [FONT_PATH], defaultFontFamily: 'Noto Sans SC' },
  });
  const png = resvg.render().asPng();
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
