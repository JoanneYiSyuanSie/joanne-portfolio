// Cloudflare Pages Function: /api/admin/easter-egg
// Handles retrieving and updating Easter Egg settings in D1.

interface Env {
  DB?: any;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context: { env: Env }) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({
      config: {
        enable: false,
        triggerMode: 'keyboard',
        secretKeyList: ['上', '上', '下', '下', '左', '右', '左', '右', 'B', 'A'],
        couponCode: '',
        message: '',
        startDate: '',
        endDate: '',
      },
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Ensure table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS easter_eggs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '活動彩蛋',
        is_active INTEGER DEFAULT 0,
        trigger_mode TEXT NOT NULL DEFAULT 'keyboard',
        secret_sequence TEXT NOT NULL,
        coupon_code TEXT,
        message TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const stmt = env.DB.prepare('SELECT * FROM easter_eggs ORDER BY id DESC LIMIT 1');
    const row = await stmt.first();

    if (row) {
      let secretKeyList = [];
      try {
        secretKeyList = JSON.parse(row.secret_sequence);
      } catch {
        secretKeyList = String(row.secret_sequence || '').split(',').map((s: string) => s.trim());
      }

      return new Response(JSON.stringify({
        config: {
          id: row.id,
          title: row.title,
          enable: !!row.is_active,
          triggerMode: row.trigger_mode || 'keyboard',
          secretKeyList,
          couponCode: row.coupon_code || '',
          message: row.message || '',
          startDate: row.start_date || '',
          endDate: row.end_date || '',
        },
      }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    // If no row in D1 yet, seed with clean default
    const def = {
      enable: false,
      triggerMode: 'keyboard',
      secretKeyList: ['上', '上', '下', '下', '左', '右', '左', '右', 'B', 'A'],
      couponCode: '',
      message: '恭喜找到隱藏優惠！',
      startDate: '',
      endDate: '',
    };

    return new Response(JSON.stringify({ config: def }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('Get easter egg error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Database error' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database service is unavailable' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  try {
    const data = await request.json();
    const {
      id,
      title = '活動彩蛋',
      enable = false,
      triggerMode = 'keyboard',
      secretKeyList = ['上', '上', '下', '下', '左', '右', '左', '右', 'B', 'A'],
      couponCode = '',
      message = '',
      startDate = '',
      endDate = '',
    } = data;

    // Ensure table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS easter_eggs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '活動彩蛋',
        is_active INTEGER DEFAULT 0,
        trigger_mode TEXT NOT NULL DEFAULT 'keyboard',
        secret_sequence TEXT NOT NULL,
        coupon_code TEXT,
        message TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const sequenceJson = JSON.stringify(secretKeyList);

    if (id) {
      await env.DB.prepare(`
        UPDATE easter_eggs SET
          title = ?, is_active = ?, trigger_mode = ?, secret_sequence = ?,
          coupon_code = ?, message = ?, start_date = ?, end_date = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        title,
        enable ? 1 : 0,
        triggerMode,
        sequenceJson,
        couponCode,
        message,
        startDate,
        endDate,
        id
      ).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO easter_eggs (
          title, is_active, trigger_mode, secret_sequence, coupon_code, message, start_date, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        title,
        enable ? 1 : 0,
        triggerMode,
        sequenceJson,
        couponCode,
        message,
        startDate,
        endDate
      ).run();
    }

    return new Response(JSON.stringify({ success: true, enable }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('Save easter egg error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Save error' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
