// Decap CMS GitHub OAuth · 发起授权（Cloudflare Pages Function）
// 使用方式：https://philia093.ink/api/auth
export async function onRequest({ env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response('Server misconfigured: GITHUB_CLIENT_ID is not set', { status: 500 });
  }

  const state = crypto.randomUUID();
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  url.searchParams.set('scope', 'repo,user');
  url.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
