// Cloudflare Pages Function: /api/admin/posts
// Handles listing, retrieving, creating, updating, and deleting posts in D1.

interface Env {
  DB?: any;
  DEPLOY_HOOK_URL?: string;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// GET: Retrieve list of posts or single post
export async function onRequestGet(context: { env: Env; request: Request }) {
  const { env, request } = context;
  const url = new URL(request.url);

  if (!env.DB) {
    return new Response(JSON.stringify({ 
      error: 'D1 database binding "DB" is not configured.',
      posts: []
    }), { status: 200, headers: CORS_HEADERS });
  }

  const slug = url.searchParams.get('slug');
  const id = url.searchParams.get('id');

  try {
    // 1. Single post lookup
    if (slug) {
      const stmt = env.DB.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug);
      const post = await stmt.first();
      if (!post) {
        return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers: CORS_HEADERS });
      }
      return new Response(JSON.stringify({ post }), { status: 200, headers: CORS_HEADERS });
    }

    if (id) {
      const stmt = env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id);
      const post = await stmt.first();
      if (!post) {
        return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers: CORS_HEADERS });
      }
      return new Response(JSON.stringify({ post }), { status: 200, headers: CORS_HEADERS });
    }

    // 2. Post list query with optional filters
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const q = url.searchParams.get('q');

    let query = `
      SELECT id, slug, title, date, category, category_slug, status, 
             excerpt, is_r18, length(content) as content_length, updated_at, created_at
      FROM posts
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ' AND category_slug = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (q) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    query += ' ORDER BY date DESC, id DESC';

    const stmt = env.DB.prepare(query).bind(...params);
    const { results } = await stmt.all();

    return new Response(JSON.stringify({ posts: results || [] }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('D1 GET Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Database query error' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

// POST: Create or Update post
export async function onRequestPost(context: { env: Env; request: Request }) {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 database binding "DB" is not configured.' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  try {
    const data = await request.json();
    const {
      id,
      slug,
      title,
      date,
      category,
      category_slug,
      status = 'DRAFT',
      excerpt = '',
      tags = '',
      password = '',
      password_hint = '',
      is_r18 = 0,
      noindex = 0,
      seo_title = '',
      seo_description = '',
      content = '',
    } = data;

    if (!title || !slug || !content) {
      return new Response(JSON.stringify({ error: 'Title, slug, and content are required.' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const cleanDate = date || new Date().toISOString().replace('T', ' ').slice(0, 19);
    const cleanCategory = category || '散文隨筆';
    const cleanCatSlug = category_slug || 'non-fic';

    let postId = id;
    let wasPublished = false;

    if (postId) {
      // Check previous status in DB to detect transition (e.g. unpublishing / changing to DRAFT)
      try {
        const oldPost = await env.DB.prepare('SELECT status FROM posts WHERE id = ?').bind(postId).first();
        if (oldPost && (oldPost.status === 'PUBLISHED' || oldPost.status === 'UPDATED')) {
          wasPublished = true;
        }
      } catch (checkErr) {
        console.warn('Could not check previous status:', checkErr);
      }

      // Check if updating existing post
      const updateStmt = env.DB.prepare(`
        UPDATE posts SET 
          slug = ?, title = ?, date = ?, category = ?, category_slug = ?,
          status = ?, excerpt = ?, tags = ?, password = ?, password_hint = ?,
          is_r18 = ?, noindex = ?, seo_title = ?, seo_description = ?, content = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        slug.trim(),
        title.trim(),
        cleanDate,
        cleanCategory,
        cleanCatSlug,
        status,
        excerpt,
        tags,
        password,
        password_hint,
        is_r18 ? 1 : 0,
        noindex ? 1 : 0,
        seo_title,
        seo_description,
        content,
        postId
      );
      await updateStmt.run();
    } else {
      // Check for slug uniqueness
      const checkStmt = env.DB.prepare('SELECT id FROM posts WHERE slug = ?').bind(slug.trim());
      const existing = await checkStmt.first();
      if (existing) {
        return new Response(JSON.stringify({ error: `Slug "${slug}" already exists. Please choose another slug.` }), {
          status: 409,
          headers: CORS_HEADERS,
        });
      }

      const insertStmt = env.DB.prepare(`
        INSERT INTO posts (
          slug, title, date, category, category_slug, status,
          excerpt, tags, password, password_hint, is_r18, noindex,
          seo_title, seo_description, content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        slug.trim(),
        title.trim(),
        cleanDate,
        cleanCategory,
        cleanCatSlug,
        status,
        excerpt,
        tags,
        password,
        password_hint,
        is_r18 ? 1 : 0,
        noindex ? 1 : 0,
        seo_title,
        seo_description,
        content
      );
      const res = await insertStmt.run();
      postId = res.meta?.last_row_id || null;
    }

    // Trigger Cloudflare Pages Deploy Hook when:
    // 1. Target status is live (PUBLISHED or UPDATED)
    // 2. An existing live post is unpublished (wasPublished is true, and target status is DRAFT)
    const isLive = status === 'PUBLISHED' || status === 'UPDATED';
    const isUnpublishing = wasPublished && status === 'DRAFT';
    const shouldDeploy = isLive || isUnpublishing;

    let deployTriggered = false;
    if (shouldDeploy && env.DEPLOY_HOOK_URL) {
      try {
        const hookRes = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
        deployTriggered = hookRes.ok;
      } catch (deployErr) {
        console.warn('Deploy hook trigger failed:', deployErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      id: postId,
      slug: slug.trim(),
      status,
      isUnpublishing,
      deployTriggered,
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('D1 POST Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to save post' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

// DELETE: Remove post
export async function onRequestDelete(context: { env: Env; request: Request }) {
  const { env, request } = context;
  const url = new URL(request.url);

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 database binding "DB" is not configured.' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  const id = url.searchParams.get('id');
  const slug = url.searchParams.get('slug');

  if (!id && !slug) {
    return new Response(JSON.stringify({ error: 'Post id or slug is required for deletion.' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  try {
    if (id) {
      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    } else if (slug) {
      await env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();
    }

    // Trigger Deploy Hook if configured
    if (env.DEPLOY_HOOK_URL) {
      fetch(env.DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('D1 DELETE Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to delete post' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
