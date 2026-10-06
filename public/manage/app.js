// Ange's website · /manage 内容管理后台 · 主逻辑（原生 JS，无依赖）
'use strict';

const $ = (sel) => document.querySelector(sel);
const PW_KEY = 'cms_pw';
const view = $('#view');
const nav = $('#nav');
const logoutBtn = $('#logout');

/* ===== API ===== */
async function api(action, params = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (localStorage.getItem(PW_KEY)) headers['X-CMS-Password'] = localStorage.getItem(PW_KEY);
  const res = await fetch('/api/cms', {
    method: 'POST',
    headers,
    body: JSON.stringify(Object.assign({ action }, params)),
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = { ok: false, error: '服务响应异常（' + res.status + '）' };
  }
  if (res.status === 401 || (data && data.needLogin)) {
    localStorage.removeItem(PW_KEY);
    location.hash = '#/login';
  }
  return data;
}

/* ===== Toast ===== */
let toastTimer = null;
function toast(msg, isError) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('error', !!isError);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3200);
}

/* ===== Frontmatter ===== */
function yamlValue(v) {
  if (v === true) return 'true';
  if (v === false) return 'false';
  if (typeof v === 'number') return String(v);
  const s = String(v);
  if (/[:#\[\]{}&*!|>'"%@`,\n]/.test(s) || /^\s/.test(s) || /\s$/.test(s)) return JSON.stringify(s);
  return s;
}
function buildFrontmatter(data) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      if (!v.length) continue;
      lines.push(k + ':');
      for (const it of v) lines.push('  - ' + yamlValue(it));
    } else {
      lines.push(k + ': ' + yamlValue(v));
    }
  }
  lines.push('---');
  return lines.join('\n');
}
function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return {};
  const out = {};
  let curKey = null;
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^-\s/.test(line) && curKey) {
      out[curKey].push(line.slice(2).trim().replace(/^"(.*)"$/, '$1'));
      continue;
    }
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val === '') {
      curKey = key;
      out[key] = [];
      continue;
    }
    curKey = null;
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (/^\d+$/.test(val)) val = Number(val);
    out[key] = val;
  }
  return out;
}

/* ===== 时间工具 ===== */
const pad = (n) => String(n).padStart(2, '0');
function isoToLocalInput(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function localInputToIso(v) {
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString();
}
function nowStamp() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 't' + pad(d.getHours()) + '-' + pad(d.getMinutes()) + '-' + pad(d.getSeconds()) + '-000-08-00';
}
function todayPrefix() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function fmtDate(v) {
  if (!v) return '';
  const s = String(v);
  return s.slice(0, 10);
}

/* ===== 集合工具 ===== */
function collDef(key) {
  return CMS_COLLECTIONS[key];
}

/* ===== 视图：登录 ===== */
function renderLogin() {
  nav.hidden = true;
  logoutBtn.hidden = true;
  view.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'login-box';
  const h = document.createElement('h1');
  h.textContent = '内容管理';
  const p = document.createElement('p');
  p.textContent = '输入访问口令进入后台';
  const input = document.createElement('input');
  input.type = 'password';
  input.placeholder = '访问口令';
  input.autocomplete = 'current-password';
  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.textContent = '进入';
  box.append(h, p, input, btn);
  view.append(box);

  async function submit() {
    const pw = input.value.trim();
    if (!pw) return toast('请输入口令', true);
    btn.disabled = true;
    btn.textContent = '验证中…';
    const data = await api('login', { password: pw });
    btn.disabled = false;
    btn.textContent = '进入';
    if (data && data.ok) {
      localStorage.setItem(PW_KEY, pw);
      location.hash = '#/list/blog';
      if (location.hash === '#/list/blog') {
        router();
      } else {
        // hash 被外部回弹时仍强制进入列表
        nav.hidden = false;
        logoutBtn.hidden = false;
        return renderList('blog');
      }
    } else {
      toast((data && data.error) || '登录失败', true);
    }
  }
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
  setTimeout(() => input.focus(), 50);
}

/* ===== 视图：列表 ===== */
async function renderList(collKey) {
  const def = collDef(collKey);
  nav.hidden = false;
  logoutBtn.hidden = false;
  document.querySelectorAll('.nav button').forEach((b) => {
    b.classList.toggle('active', b.dataset.nav === 'list/' + collKey);
  });
  view.innerHTML = '';

  const head = document.createElement('div');
  head.className = 'page-head';
  const h = document.createElement('h2');
  h.textContent = def.label;
  const createBtn = document.createElement('button');
  createBtn.className = 'btn-primary';
  createBtn.textContent = '＋ 新建';
  createBtn.style.width = 'auto';
  createBtn.addEventListener('click', () => (location.hash = '#/new/' + collKey));
  head.append(h, createBtn);
  view.append(head);

  const listBox = document.createElement('div');
  listBox.className = 'list';
  const empty = document.createElement('div');
  empty.className = 'empty';
  empty.textContent = '加载中…';
  listBox.append(empty);
  view.append(listBox);

  const data = await api('list', { collection: collKey });
  if (!data || !data.ok) {
    empty.textContent = (data && data.error) || '加载失败';
    return;
  }
  listBox.innerHTML = '';
  if (!data.items.length) {
    empty.textContent = '这里还没有内容，点「＋ 新建」写第一条';
    listBox.append(empty);
    return;
  }
  for (const it of data.items) {
    const btn = document.createElement('button');
    btn.className = 'item';
    const t = document.createElement('span');
    t.className = 'it-title';
    t.textContent = it.title || it.name.replace(/\.md$/, '');
    const d = document.createElement('span');
    d.className = 'it-date';
    d.textContent = fmtDate(it.date);
    btn.append(t, d);
    if (it.draft) {
      const badge = document.createElement('span');
      badge.className = 'it-badge';
      badge.textContent = '草稿';
      btn.append(badge);
    }
    btn.addEventListener('click', () => (location.hash = '#/edit/' + collKey + '?path=' + encodeURIComponent(it.path)));
    listBox.append(btn);
  }
}

/* ===== 视图：编辑 ===== */
function renderForm(collKey, filename, initial, sha) {
  const def = collDef(collKey);
  nav.hidden = false;
  logoutBtn.hidden = false;
  document.querySelectorAll('.nav button').forEach((b) => {
    b.classList.toggle('active', b.dataset.nav === 'list/' + collKey);
  });
  view.innerHTML = '';

  const head = document.createElement('div');
  head.className = 'edit-head';
  const back = document.createElement('button');
  back.className = 'back';
  back.textContent = '← 返回';
  back.addEventListener('click', () => (location.hash = '#/list/' + collKey));
  const h = document.createElement('h2');
  h.textContent = def.label + ' · ' + (filename.endsWith('.md') ? filename.slice(0, -3) : filename);
  head.append(back, h);
  view.append(head);

  const pathHint = document.createElement('div');
  pathHint.className = 'edit-head';
  const pathEl = document.createElement('span');
  pathEl.className = 'path';
  pathEl.textContent = def.dir + '/' + filename;
  pathHint.append(pathEl);
  view.append(pathHint);

  const form = document.createElement('div');
  form.className = 'form';
  view.append(form);

  const fieldState = {}; // key -> element

  function makeField(f) {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    if (f.type === 'boolean') {
      const row = document.createElement('label');
      row.className = 'check-row';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!initial[f.key];
      fieldState[f.key] = cb;
      const span = document.createElement('span');
      span.textContent = f.label;
      row.append(cb, span);
      wrap.append(row);
      return wrap;
    }
    const label = document.createElement('label');
    label.textContent = f.label + (f.required ? ' *' : '');
    if (f.required) label.classList.add('req');
    let input;
    if (f.type === 'textarea') {
      input = document.createElement('textarea');
      input.value = initial[f.key] || '';
      if (f.max) input.maxLength = f.max;
    } else if (f.type === 'select') {
      input = document.createElement('select');
      for (const opt of f.options) {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        input.append(o);
      }
      input.value = initial[f.key] || f.options[0];
    } else if (f.type === 'datetime') {
      input = document.createElement('input');
      input.type = 'datetime-local';
      input.value = isoToLocalInput(initial[f.key]) || isoToLocalInput(new Date().toISOString());
    } else if (f.type === 'date') {
      input = document.createElement('input');
      input.type = 'date';
      input.value = initial[f.key] ? String(initial[f.key]).slice(0, 10) : todayPrefix();
    } else if (f.type === 'number') {
      input = document.createElement('input');
      input.type = 'number';
      input.min = f.min || 1;
      input.max = f.max || 5;
      input.value = initial[f.key] != null ? String(initial[f.key]) : '';
    } else if (f.type === 'tags') {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '逗号分隔，如：react, astro';
      input.value = (initial[f.key] || []).join(', ');
    } else {
      input = document.createElement('input');
      input.type = f.type === 'url' ? 'url' : 'text';
      input.value = initial[f.key] || '';
    }
    fieldState[f.key] = input;
    wrap.append(label, input);
    if (f.hint) {
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = f.hint;
      wrap.append(hint);
    }
    return wrap;
  }

  for (const f of def.fields) form.append(makeField(f));

  // 正文
  const bodyWrap = document.createElement('div');
  bodyWrap.className = 'field body-field';
  const bodyLabel = document.createElement('label');
  bodyLabel.textContent = def.body.label;
  const bodyInput = document.createElement('textarea');
  bodyInput.value = initial._body || '';
  bodyWrap.append(bodyLabel, bodyInput);
  form.append(bodyWrap);
  if (def.body.hint) {
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = def.body.hint;
    bodyWrap.append(hint);
  }

  // 上传区
  const uploadWrap = document.createElement('div');
  uploadWrap.className = 'field';
  const uploadLabel = document.createElement('label');
  uploadLabel.textContent = '上传图片';
  const uploadRow = document.createElement('div');
  uploadRow.className = 'upload-row';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  const upBtn = document.createElement('button');
  upBtn.className = 'btn';
  upBtn.textContent = '上传';
  const upResult = document.createElement('div');
  upResult.className = 'upload-result';
  uploadRow.append(fileInput, upBtn, upResult);
  uploadWrap.append(uploadLabel, uploadRow);
  form.append(uploadWrap);

  upBtn.addEventListener('click', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return toast('先选择图片', true);
    if (file.size > 5 * 1024 * 1024) return toast('图片超过 5MB', true);
    upBtn.disabled = true;
    upBtn.textContent = '上传中…';
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = String(reader.result).split(',')[1];
      const name = file.name.replace(/[^\w.-]/g, '_');
      const data = await api('upload', { filename: name, base64 });
      upBtn.disabled = false;
      upBtn.textContent = '上传';
      if (data && data.ok) {
        upResult.innerHTML = '';
        const code = document.createElement('code');
        code.textContent = data.path;
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn';
        copyBtn.textContent = '复制';
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(data.path);
            toast('已复制');
          } catch (e) {
            toast('复制失败，手动复制上方路径', true);
          }
        });
        upResult.append(code, copyBtn);
        toast('上传成功，可复制路径插入正文');
      } else {
        toast((data && data.error) || '上传失败', true);
      }
    };
    reader.onerror = () => {
      upBtn.disabled = false;
      upBtn.textContent = '上传';
      toast('读取文件失败', true);
    };
    reader.readAsDataURL(file);
  });

  // 操作按钮
  const actions = document.createElement('div');
  actions.className = 'actions';
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-primary';
  saveBtn.textContent = '保存并发布';
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger';
  deleteBtn.textContent = '删除';
  actions.append(saveBtn);
  if (sha) actions.append(deleteBtn);
  form.append(actions);

  function collect() {
    const data = {};
    for (const f of def.fields) {
      const el = fieldState[f.key];
      if (!el) continue;
      if (f.type === 'boolean') {
        data[f.key] = el.checked;
      } else if (f.type === 'tags') {
        data[f.key] = el.value
          .split(/[,，]/)
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === 'datetime') {
        const iso = localInputToIso(el.value);
        if (iso) data[f.key] = iso;
      } else if (f.type === 'number') {
        const n = Number(el.value);
        if (el.value !== '' && !isNaN(n)) data[f.key] = n;
      } else {
        if (el.value !== '') data[f.key] = el.value;
      }
    }
    if (def.titleLess) delete data.title;
    const bodyText = bodyInput.value;
    const fm = buildFrontmatter(data);
    const content = bodyText ? fm + '\n\n' + bodyText : fm + '\n';
    const title = data.title || filename.replace(/\.md$/, '');
    return { content, message: 'content: ' + title };
  }

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = '保存中…';
    const { content, message } = collect();
    const data = await api('write', { path: def.dir + '/' + filename, content, message, sha: sha || undefined });
    saveBtn.disabled = false;
    saveBtn.textContent = '保存并发布';
    if (data && data.ok) {
      toast('已提交，构建部署中（约 1-3 分钟生效）');
      setTimeout(() => (location.hash = '#/list/' + collKey), 1200);
    } else {
      toast((data && data.error) || '保存失败', true);
    }
  });

  deleteBtn.addEventListener('click', async () => {
    if (!confirm('确定删除「' + filename + '」？此操作不可恢复。')) return;
    deleteBtn.disabled = true;
    deleteBtn.textContent = '删除中…';
    const data = await api('delete', { path: def.dir + '/' + filename, sha });
    deleteBtn.disabled = false;
    deleteBtn.textContent = '删除';
    if (data && data.ok) {
      toast('已删除');
      setTimeout(() => (location.hash = '#/list/' + collKey), 800);
    } else {
      toast((data && data.error) || '删除失败', true);
    }
  });
}

async function renderEdit(collKey, params) {
  const def = collDef(collKey);
  const path = params.get('path');
  if (!path) {
    toast('缺少文件路径', true);
    location.hash = '#/list/' + collKey;
    return;
  }
  const filename = decodeURIComponent(path.split('/').pop() || '');
  const data = await api('read', { path });
  if (!data || !data.ok) {
    view.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = (data && data.error) || '读取失败';
    view.append(empty);
    return;
  }
  const parsed = parseFrontmatter(data.content);
  const bodyMatch = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(data.content);
  parsed._body = bodyMatch ? data.content.slice(bodyMatch[0].length) : data.content;
  renderForm(collKey, filename, parsed, data.sha);
}

async function renderNew(collKey) {
  const def = collDef(collKey);
  const filename = def.titleLess
    ? nowStamp() + '.md'
    : todayPrefix() + '-untitled.md';
  const empty = { _body: '' };
  renderForm(collKey, filename, empty, null);
}

/* ===== 路由 ===== */
async function router() {
  const hash = location.hash || '#/list/blog';
  const pw = !!localStorage.getItem(PW_KEY);
  if (!pw && hash !== '#/login') {
    return renderLogin();
  }
  const clean = hash.replace(/^#\/?/, '');
  const [route, query] = clean.split('?');
  const [head, collKey] = route.split('/');
  const params = new URLSearchParams(query || '');
  if (head === 'login') {
    return renderLogin();
  }
  if (!collDef(collKey)) {
    location.hash = '#/list/blog';
    return;
  }
  if (head === 'list') return renderList(collKey);
  if (head === 'new') return renderNew(collKey);
  if (head === 'edit') return renderEdit(collKey, params);
  location.hash = '#/list/blog';
}

/* ===== 事件绑定 ===== */
document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) {
    e.preventDefault();
    location.hash = '#' + navBtn.dataset.nav;
  }
});
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(PW_KEY);
  location.hash = '#/login';
});
window.addEventListener('hashchange', router);
router();
