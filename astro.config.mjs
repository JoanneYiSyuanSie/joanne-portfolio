import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const postsDir = path.resolve('content/posts');
let slugToDate = {};
try {
  const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  for (const file of postFiles) {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (match) {
      try {
        const data = parseYaml(match[1]);
        const slug = data.slug || file.replace(/\.md$/, '');
        if (data.date) {
          slugToDate[slug] = new Date(data.date).toISOString();
        }
      } catch (e) {}
    }
  }
} catch (e) {
  console.warn("Could not read posts for sitemap generation", e);
}

// https://astro.build/config
export default defineConfig({
  site: 'https://joanneyisyuansie.github.io',
  base: '/joanne-portfolio',
  trailingSlash: 'never',
  build: {
    format: 'file'
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true
  },
  integrations: [react(), sitemap({
    filter: (page) => !page.includes('/tools/'),
    serialize(item) {
      const urlObj = new URL(item.url);
      let pathname = urlObj.pathname.replace(/\/$/, '');
      if (pathname.endsWith('.html')) pathname = pathname.slice(0, -5);
      if (pathname.startsWith('/archive/')) {
        const slug = pathname.split('/').pop();
        if (slug && slugToDate[slug]) {
          item.lastmod = slugToDate[slug];
        }
      }
      return item;
    }
  }), partytown({
    config: {
      forward: ['dataLayer.push'],
    },
  })],
  vite: {
    plugins: [
      tailwindcss()
    ]
  }
});