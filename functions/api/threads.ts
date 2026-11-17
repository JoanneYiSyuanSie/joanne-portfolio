// Static demo: this showcase site has no backend.
// The /api/threads endpoint from the original codebase is intentionally
// disabled here. The social page shows placeholders instead of a live feed.
export async function onRequest() {
  return new Response(JSON.stringify({ error: 'Not configured in this demo.' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}
