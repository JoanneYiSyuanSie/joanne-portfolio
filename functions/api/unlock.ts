// Cloudflare Pages Function: /api/unlock
// Validates article password against D1 and returns full content if authorized.

interface Env {
  DB?: any;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database service is unavailable' }), {
      status: 503,
      headers: CORS_HEADERS,
    });
  }

  try {
    const data = await request.json();
    const { slug, password } = data;

    if (!slug || !password) {
      return new Response(JSON.stringify({ error: 'Slug and password are required' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const stmt = env.DB.prepare('SELECT password, content FROM posts WHERE slug = ?').bind(slug);
    const post = await stmt.first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    if (!post.password) {
      // Not encrypted
      return new Response(JSON.stringify({ success: true, content: post.content }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    // Verify password (trimmed comparison)
    if (String(post.password).trim() !== String(password).trim()) {
      return new Response(JSON.stringify({ success: false, error: '密碼不正確，請重新確認。' }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      content: post.content,
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('Unlock API Error:', err);
    return new Response(JSON.stringify({ error: 'Server error during password verification' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
