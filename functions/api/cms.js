// Ange's website · 内容管理 API（Cloudflare Pages Function）
// A2 方案：浏览器不接触 GitHub token，全部经本代理（token 存环境变量 GITHUB_PAT）
// 访问口令：请求头 X-CMS-Password，与环境变量 CMS_PASSWORD 比对
//
// 统一入口：POST /api/cms，body 携带 action：
//   { action: 'login',  password }                     -> { ok }
//   { action: 'list',   collection }                   -> { ok, items: [{path,name,sha,title,date,draft}] }
//   { action: 'read',   path }                         -> { ok, content, sha }
//   { action: 'write',  path, content, message, sha? } -> { ok, sha, path }
//   { action: 'upload', filename, base64 }             -> { ok, path }
//   { action: 'delete', path, sha }                    -> { ok }

const REPO = 'FuTao0907/my-website';
const BRANCH = 'main';
const GITHUB_API = 'https://api.github.com';

const COLLECTIONS = {
  blog: 'src/content/blog',
  projects: 'src/content/projects',
  notes: 'src/content/notes',
  books: 'src/content/collections/books',
  music: 'src/content/collections/music',
  novels: 'src/content/collections/novels',
  videos: 'src/content/collections/videos',
  links: 'src/content/collections/links',
};

const CONTENT_PATH_RE =
  /^src\/content\/(blog|projects|notes|collections\/(books|music|novels|videos|links))\/.+\.md$/;
const UPLOAD_NAME_RE = /^[A-Za-z0-9._-]{1,120}\.(png|jpe?g|gif|webp|avif|svg)$/;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** 恒定时间字符串比较（Workers 无 Node timingSafeEqual） */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function checkAuth(request, env) {
  if (!env.CMS_PASSWORD) return { ok: false, error: '服务未配置 CMS_PASSWORD 环境变量' };
  const got = request.headers.get('X-CMS-Password') || '';
  return safeEqual(got, env.CMS_PASSWORD) ? { ok: true } : { ok: false, error: '访问口令错误' };
}

/** GitHub Contents API 封装 */
async function gh(env, method, path, body) {
  const headers = {
    Authorization: `Bearer ${env.GITHUB_PAT}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'anges-cms',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const init = { method, headers };
  if (body) init.body = JSON.stringify(body);
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${encodePath(path)}`, init);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg = data?.message || `GitHub API ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/** path 分段编码（保留 /） */
function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return {};
  const out = {};
  const lines = m[1].split(/\r?\n/);
  for (const line of lines) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    out[key] = val;
  }
  return out;
}

/* ===== action 处理 ===== */

async function handleLogin(body, env) {
  const pw = typeof body.password === 'string' ? body.password : '';
  if (!env.CMS_PASSWORD) return json({ ok: false, error: '服务未配置 CMS_PASSWORD 环境变量' }, 500);
  if (!safeEqual(pw, env.CMS_PASSWORD)) return json({ ok: false, error: '口令错误' }, 401);
  return json({ ok: true });
}

async function handleList(body, env) {
  const coll = typeof body.collection === 'string' ? body.collection : '';
  const dir = COLLECTIONS[coll];
  if (!dir) return json({ ok: false, error: '未知集合：' + coll }, 400);

  let entries;
  try {
    entries = await gh(env, 'GET', dir);
  } catch (e) {
    if (/Not Found/.test(e.message)) return json({ ok: true, items: [] }); // 目录还不存在
    return json({ ok: false, error: '读取集合失败：' + e.message }, 502);
  }

  const files = (Array.isArray(entries) ? entries : []).filter((f) => f.type === 'file' && f.name.endsWith('.md'));

  const items = [];
  const CHUNK = 8;
  for (let i = 0; i < files.length; i += CHUNK) {
    const chunk = files.slice(i, i + CHUNK);
    const results = await Promise.all(
      chunk.map(async (f) => {
        try {
          const data = await gh(env, 'GET', f.path);
          const text = Buffer.from(data.content, 'base64').toString('utf-8');
          const fm = parseFrontmatter(text);
          return {
            path: f.path,
            name: f.name,
            sha: data.sha,
            title: fm.title || '',
            date: fm.published || fm.date || '',
            draft: !!fm.draft,
          };
        } catch {
          return { path: f.path, name: f.name, sha: f.sha, title: '', date: '', draft: false, error: true };
        }
      })
    );
    items.push(...results);
  }

  items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  return json({ ok: true, items });
}

async function handleRead(body, env) {
  const path = typeof body.path === 'string' ? body.path : '';
  if (!CONTENT_PATH_RE.test(path)) return json({ ok: false, error: '路径不在允许范围' }, 400);
  try {
    const data = await gh(env, 'GET', path);
    return json({
      ok: true,
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      sha: data.sha,
    });
  } catch (e) {
    return json({ ok: false, error: '读取失败：' + e.message }, 502);
  }
}

async function handleWrite(body, env) {
  const { path, content, message, sha } = body || {};
  if (typeof path !== 'string' || !CONTENT_PATH_RE.test(path))
    return json({ ok: false, error: '路径不在允许范围' }, 400);
  if (typeof content !== 'string' || content.length === 0) return json({ ok: false, error: '内容为空' }, 400);
  if (typeof message !== 'string' || message.trim() === '') return json({ ok: false, error: '缺少提交说明' }, 400);

  const payload = {
    message: message.trim(),
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch: BRANCH,
  };
  if (typeof sha === 'string' && sha) payload.sha = sha;

  try {
    const data = await gh(env, 'PUT', path, payload);
    return json({ ok: true, sha: data.content?.sha || data.commit?.sha || '', path });
  } catch (e) {
    if (/is at /.test(e.message) || /sha/i.test(e.message)) {
      return json({ ok: false, error: '文件已被其他操作更新，请刷新后重试', conflict: true }, 409);
    }
    return json({ ok: false, error: '保存失败：' + e.message }, 502);
  }
}

async function handleUpload(body, env) {
  const { filename, base64 } = body || {};
  if (typeof filename !== 'string' || !UPLOAD_NAME_RE.test(filename))
    return json({ ok: false, error: '文件名不合法（仅字母数字 . _ -，图片格式）' }, 400);
  if (typeof base64 !== 'string' || !base64) return json({ ok: false, error: '缺少图片数据' }, 400);
  const clean = base64.replace(/^data:[^;]+;base64,/, '');
  const bytes = Buffer.from(clean, 'base64');
  if (bytes.length === 0) return json({ ok: false, error: '图片数据为空' }, 400);
  if (bytes.length > MAX_UPLOAD_BYTES) return json({ ok: false, error: '图片超过 5MB 限制' }, 400);

  const path = `public/uploads/${filename}`;
  try {
    await gh(env, 'PUT', path, {
      message: `upload: ${filename}`,
      content: clean,
      branch: BRANCH,
    });
    return json({ ok: true, path: `/uploads/${filename}` });
  } catch (e) {
    if (/already exists/.test(e.message)) {
      return json({ ok: false, error: '同名文件已存在，请换文件名' }, 409);
    }
    return json({ ok: false, error: '上传失败：' + e.message }, 502);
  }
}

async function handleDelete(body, env) {
  const { path, sha } = body || {};
  if (typeof path !== 'string' || !CONTENT_PATH_RE.test(path))
    return json({ ok: false, error: '路径不在允许范围' }, 400);
  if (typeof sha !== 'string' || !sha) return json({ ok: false, error: '缺少文件版本信息，请刷新后重试' }, 400);
  try {
    await gh(env, 'DELETE', path, { message: `delete: ${path}`, sha, branch: BRANCH });
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: '删除失败：' + e.message }, 502);
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') return json({ ok: false, error: '仅支持 POST 请求' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: '请求体不是合法 JSON' }, 400);
  }
  const action = body && typeof body.action === 'string' ? body.action : '';

  if (action === 'login') return handleLogin(body, env);

  const auth = checkAuth(request, env);
  if (!auth.ok) return json({ ok: false, error: auth.error }, 401);

  switch (action) {
    case 'list':
      return handleList(body, env);
    case 'read':
      return handleRead(body, env);
    case 'write':
      return handleWrite(body, env);
    case 'upload':
      return handleUpload(body, env);
    case 'delete':
      return handleDelete(body, env);
    default:
      return json({ ok: false, error: '未知操作' }, 400);
  }
}
