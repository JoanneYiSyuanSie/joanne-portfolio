// Static demo: this showcase site has no backend.
// The /api/admin/upload endpoint from the original codebase is intentionally
// disabled here. Nothing in the demo calls it.
export async function onRequest() {
  return new Response(JSON.stringify({ error: 'Not configured in this demo.' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}
