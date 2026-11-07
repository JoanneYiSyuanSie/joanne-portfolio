// Cloudflare Pages Function: /api/admin/batch
// Handles batch updating post statuses (e.g., publish, draft/unpublish) with single deploy hook trigger.

interface Env {
  DB?: any;
  DEPLOY_HOOK_URL?: string;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
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
    const { ids, action } = data; // action: 'PUBLISHED' | 'DRAFT'

    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'No post IDs provided.' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    if (action !== 'PUBLISHED' && action !== 'DRAFT') {
      return new Response(JSON.stringify({ error: 'Invalid action. Must be PUBLISHED or DRAFT.' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // Check old statuses to determine if deploy hook is needed:
    // Deploy hook is needed if:
    // 1. Publishing: any post in ids is currently not PUBLISHED
    // 2. Unpublishing (DRAFT): any post in ids was previously PUBLISHED or UPDATED
    const placeholders = ids.map(() => '?').join(',');
    const checkStmt = env.DB.prepare(`SELECT id, status FROM posts WHERE id IN (${placeholders})`).bind(...ids);
    const { results } = await checkStmt.all();

    let shouldDeploy = false;
    if (action === 'PUBLISHED') {
      shouldDeploy = (results || []).some((p: any) => p.status !== 'PUBLISHED');
    } else if (action === 'DRAFT') {
      shouldDeploy = (results || []).some((p: any) => p.status === 'PUBLISHED' || p.status === 'UPDATED');
    }

    // Execute batch update
    const updateStmt = env.DB.prepare(
      `UPDATE posts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`
    ).bind(action, ...ids);
    await updateStmt.run();

    // Trigger Deploy Hook ONLY ONCE
    let deployTriggered = false;
    if (shouldDeploy && env.DEPLOY_HOOK_URL) {
      try {
        const hookRes = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
        deployTriggered = hookRes.ok;
      } catch (deployErr) {
        console.warn('Batch deploy hook failed:', deployErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      updatedCount: ids.length,
      action,
      shouldDeploy,
      deployTriggered,
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('Batch error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Batch update failed' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
