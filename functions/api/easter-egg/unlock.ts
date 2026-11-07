// Cloudflare Pages Function: /api/easter-egg/unlock
// Validates easter egg trigger sequence against server-side D1 configuration.
// Sensitive data (coupon code, secret message) is NEVER leaked to client until verified.

interface Env {
  DB?: any;
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

  try {
    const data = await request.json();
    const { triggerMode, inputSequence } = data;

    if (!Array.isArray(inputSequence) || inputSequence.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'INVALID_SEQUENCE_PAYLOAD' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    let config: {
      enable: boolean;
      triggerMode: string;
      secretKeyList: string[];
      couponCode?: string;
      message?: string;
      startDate?: string;
      endDate?: string;
    } | null = null;

    // 1. Try fetching active easter egg from D1
    if (env.DB) {
      try {
        const stmt = env.DB.prepare(
          'SELECT * FROM easter_eggs WHERE is_active = 1 ORDER BY id DESC LIMIT 1'
        );
        const row = await stmt.first();
        if (row) {
          let secretKeys: string[] = [];
          try {
            secretKeys = JSON.parse(row.secret_sequence);
          } catch {
            secretKeys = String(row.secret_sequence || '').split(',').map((s: string) => s.trim());
          }

          config = {
            enable: !!row.is_active,
            triggerMode: row.trigger_mode || 'keyboard',
            secretKeyList: secretKeys,
            couponCode: row.coupon_code || '',
            message: row.message || '',
            startDate: row.start_date || '',
            endDate: row.end_date || '',
          };
        }
      } catch (dbErr) {
        console.warn('D1 easter egg query failed, checking fallback:', dbErr);
      }
    }

    if (!config || !config.enable) {
      return new Response(JSON.stringify({ success: false, error: 'SIGNAL_DISABLED' }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    // 3. Date range validation
    const now = new Date();
    if (config.startDate && new Date(config.startDate) > now) {
      return new Response(JSON.stringify({ success: false, error: 'SIGNAL_NOT_YET_ACTIVE' }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }
    if (config.endDate && new Date(config.endDate) < now) {
      return new Response(JSON.stringify({ success: false, error: 'SIGNAL_EXPIRED' }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    // 4. Verify sequence
    const targetSequence = (config.secretKeyList || []).map((s) => s.toUpperCase());
    const userSequence = inputSequence.map((s: string) => String(s).toUpperCase());

    if (userSequence.length !== targetSequence.length) {
      return new Response(JSON.stringify({ success: false, error: 'SEQUENCE_LENGTH_MISMATCH' }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    const isMatch = userSequence.every((key, idx) => key === targetSequence[idx]);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, error: 'INVALID_SEQUENCE' }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    // 5. Authorized! Return secret message and coupon code
    return new Response(JSON.stringify({
      success: true,
      couponCode: config.couponCode,
      message: config.message,
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('Easter egg unlock error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Unlock error' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
