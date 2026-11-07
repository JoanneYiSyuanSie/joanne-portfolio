// Pre-build script: Fetches published posts from Cloudflare D1 via REST API
// Writes them to src/data/d1-posts.json so Astro SSG can build static pages from D1.

import fs from 'node:fs';
import path from 'node:path';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.D1_DATABASE_ID || process.env.CLOUDFLARE_DATABASE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

const outputDir = path.resolve('src/data');
const outputFile = path.join(outputDir, 'd1-posts.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!accountId || !databaseId || !apiToken) {
  console.log('[sync-d1] No Cloudflare D1 credentials provided; using existing/local posts.');
  if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, JSON.stringify([]));
  }
  process.exit(0);
}

console.log('[sync-d1] Fetching published posts from Cloudflare D1...');

try {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql: "SELECT * FROM posts WHERE status != 'DRAFT' ORDER BY date DESC",
    }),
  });

  const data = await res.json();
  if (!data.success) {
    console.error('[sync-d1] D1 Query API Error:', data.errors);
    process.exit(0);
  }

  const posts = data.result?.[0]?.results || [];
  console.log(`[sync-d1] Successfully fetched ${posts.length} published posts from D1.`);
  fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
} catch (err) {
  console.error('[sync-d1] Failed to sync posts from D1:', err);
  if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, JSON.stringify([]));
  }
}
