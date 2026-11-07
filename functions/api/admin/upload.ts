// Cloudflare Pages Function: /api/admin/upload
// Handles image uploads directly into Cloudflare R2 bucket.

interface Env {
  MEDIA_BUCKET?: any;
  R2_PUBLIC_URL?: string;
}

const CORS_HEADERS = {
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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided in form data.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Only image files are allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const timestamp = Date.now();
    const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `uploads/${timestamp}-${cleanOriginalName}`;

    if (!env.MEDIA_BUCKET) {
      // Local development or unconfigured fallback: Return data URL so UI doesn't break
      const buffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const dataUrl = `data:${file.type};base64,${base64}`;

      return new Response(JSON.stringify({
        success: true,
        url: dataUrl,
        key: objectKey,
        isFallback: true,
        message: 'R2 bucket is not bound in current environment; returned inline preview.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Put into R2
    await env.MEDIA_BUCKET.put(objectKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    let publicBase = env.R2_PUBLIC_URL || 'https://assets.adabanipal.com';
    if (!publicBase.startsWith('http://') && !publicBase.startsWith('https://')) {
      publicBase = `https://${publicBase}`;
    }
    const finalUrl = `${publicBase.replace(/\/$/, '')}/${objectKey}`;

    return new Response(JSON.stringify({
      success: true,
      url: finalUrl,
      key: objectKey,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (err: any) {
    console.error('R2 Upload Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Image upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
