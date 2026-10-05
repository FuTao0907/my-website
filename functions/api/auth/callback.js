// Decap CMS GitHub OAuth · 回调（Cloudflare Pages Function）
// GitHub OAuth App 的 Authorization callback URL 填：https://philia093.ink/api/auth/callback
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieHeader = request.headers.get('Cookie') || '';
  const storedState = cookieHeader.match(/(?:^|;\s*)oauth_state=([^;]+)/)?.[1];

  // CSRF 防护：state 必须与发起授权时下发的 cookie 一致
  if (!code || !state || !storedState || state !== storedState) {
    return new Response('Invalid state parameter', { status: 403 });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('Server misconfigured: GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are not set', {
      status: 500,
    });
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    const reason = data.error_description || data.error || 'unknown error';
    return new Response(`OAuth token exchange failed: ${reason}`, { status: 502 });
  }

  // Decap 标准授权回传格式：opener 的 CMS 收到后完成登录
  const payload = JSON.stringify({ token: data.access_token, provider: 'github' });
  const html = `<!doctype html><html><body><script>
    try {
      window.opener.postMessage('authorization:github:success:${payload}', window.location.origin);
      window.close();
    } catch (e) {
      document.body.textContent = '授权成功，请手动关闭此窗口，返回管理页继续操作。';
    }
  </script></body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
