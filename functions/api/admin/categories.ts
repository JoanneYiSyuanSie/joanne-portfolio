// Cloudflare Pages Function: /api/admin/categories
// Handles category listing, creation, and counts in D1.

interface Env {
  DB?: any;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DEFAULT_CATEGORIES = [
  { id: 1, title: '散文隨筆', slug: 'non-fic', post_count: 0 },
  { id: 2, title: '短篇小說', slug: 'short-stories', post_count: 0 },
  { id: 3, title: '公告須知', slug: 'announcements', post_count: 0 },
  { id: 4, title: '委託展示', slug: 'commissions', post_count: 0 },
  { id: 5, title: '礎潤而雨', slug: 'plinthus-and-rain', post_count: 0 },
  { id: 6, title: '【OC】薩托里', slug: 'i-sartori', post_count: 0 },
];

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context: { env: Env }) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ categories: DEFAULT_CATEGORIES }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  try {
    try {
      await env.DB.prepare('ALTER TABLE categories ADD COLUMN description TEXT').run();
    } catch (e) {
      // Column may already exist, ignore error
    }

    const stmt = env.DB.prepare(`
      SELECT c.id, c.title, c.slug, c.description, COUNT(p.id) AS post_count
      FROM categories c
      LEFT JOIN posts p ON c.slug = p.category_slug
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    const { results } = await stmt.all();

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ categories: DEFAULT_CATEGORIES }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({ categories: results }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('D1 Categories GET Error:', err);
    return new Response(JSON.stringify({ categories: DEFAULT_CATEGORIES, error: err.message }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  }
}

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
    const { title, slug, description } = data;

    if (!title || !slug) {
      return new Response(JSON.stringify({ error: 'Title and slug are required.' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const cleanTitle = title.trim();
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const cleanDesc = description ? description.trim() : null;

    try {
      await env.DB.prepare('ALTER TABLE categories ADD COLUMN description TEXT').run();
    } catch (e) {
      // Ignore if exists
    }

    // Check duplicate
    const checkStmt = env.DB.prepare('SELECT id FROM categories WHERE slug = ? OR title = ?').bind(cleanSlug, cleanTitle);
    const existing = await checkStmt.first();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Category with this title or slug already exists.' }), {
        status: 409,
        headers: CORS_HEADERS,
      });
    }

    const insertStmt = env.DB.prepare('INSERT INTO categories (title, slug, description) VALUES (?, ?, ?)').bind(cleanTitle, cleanSlug, cleanDesc);
    const res = await insertStmt.run();

    return new Response(JSON.stringify({
      success: true,
      category: {
        id: res.meta?.last_row_id,
        title: cleanTitle,
        slug: cleanSlug,
        description: cleanDesc,
        post_count: 0,
      },
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('D1 Categories POST Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to create category' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function onRequestPut(context: { env: Env; request: Request }) {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 database binding "DB" is not configured.' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  try {
    const data = await request.json();
    const { slug, title, description } = data;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Category slug is required.' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    try {
      await env.DB.prepare('ALTER TABLE categories ADD COLUMN description TEXT').run();
    } catch (e) {
      // Ignore if exists
    }

    const cleanTitle = title ? title.trim() : null;
    const cleanDesc = description !== undefined ? (description ? description.trim() : null) : undefined;

    // Check if category exists in D1, if not insert it
    const checkStmt = env.DB.prepare('SELECT id FROM categories WHERE slug = ?').bind(slug);
    const existing = await checkStmt.first();

    if (existing) {
      if (cleanTitle && cleanDesc !== undefined) {
        await env.DB.prepare('UPDATE categories SET title = ?, description = ? WHERE slug = ?').bind(cleanTitle, cleanDesc, slug).run();
      } else if (cleanTitle) {
        await env.DB.prepare('UPDATE categories SET title = ? WHERE slug = ?').bind(cleanTitle, slug).run();
      } else if (cleanDesc !== undefined) {
        await env.DB.prepare('UPDATE categories SET description = ? WHERE slug = ?').bind(cleanDesc, slug).run();
      }
    } else {
      // Insert seeded category into table with description
      await env.DB.prepare('INSERT INTO categories (title, slug, description) VALUES (?, ?, ?)').bind(cleanTitle || slug, slug, cleanDesc || null).run();
    }

    return new Response(JSON.stringify({
      success: true,
      category: {
        slug,
        title: cleanTitle,
        description: cleanDesc,
      },
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('D1 Categories PUT Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to update category' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
