/**
 * Content layer utilities for loading Markdown posts at build time.
 * Uses Vite's import.meta.glob to statically analyse all .md files
 * under content/posts/ and expose them as typed data.
 */

import { parse as parseYaml } from 'yaml';
import CryptoJS from 'crypto-js';
import d1PostsRaw from '../data/d1-posts.json';

// ---------- Types ----------

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  categorySlug: string;
  status: string;
  excerpt: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isR18?: boolean;
  password_hint?: string;
}

export interface Post extends PostMeta {
  content: string;
  isEncrypted?: boolean;
}

// ---------- Frontmatter parser ----------

/**
 * Parses YAML frontmatter robustly.
 */
function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const frontmatterBlock = match[1];
  const content = match[2].trim();
  let data: Record<string, any> = {};
  
  try {
    data = parseYaml(frontmatterBlock) || {};
  } catch (e) {
    console.error("YAML Parse Error:", e);
  }

  return { data, content };
}

// ---------- Category slug mapping ----------

const categoryModules = import.meta.glob('/content/categories/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, { title: string, slug?: string, description?: string }>;

const CATEGORY_SLUG_MAP: Record<string, string> = {};
const CATEGORY_DESC_MAP: Record<string, string> = {};
for (const data of Object.values(categoryModules)) {
  if (data.title && data.slug) {
    CATEGORY_SLUG_MAP[data.title] = data.slug;
  }
  if (data.slug && data.description) {
    CATEGORY_DESC_MAP[data.slug] = data.description;
  }
}

const SLUG_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_MAP).map(([k, v]) => [v, k])
);

export function getCategorySlug(categoryName: string): string {
  return CATEGORY_SLUG_MAP[categoryName] || categoryName;
}

export function getCategoryName(slug: string): string | undefined {
  return SLUG_CATEGORY_MAP[slug];
}

// ---------- Post loading ----------

// Vite eagerly imports all .md files as raw strings at build time.
// Uses **/*.md to support subdirectory organization.
const postModules = import.meta.glob('/content/posts/**/*.md', {
  query: '?raw',
  eager: true,
  import: 'default',
}) as Record<string, string>;

function fileNameToSlug(filePath: string): string {
  // "/content/posts/star-dust-lullaby.md" → "star-dust-lullaby"
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.md$/, '');
}

function parsePost(filePath: string, raw: string): Post {
  const { data, content } = parseFrontmatter(raw);
  
  let finalContent = content;
  let isEncrypted = false;

  if (data.password) {
    // We use crypto-js to encrypt the content during build time
    // This ciphertext will be shipped to the browser
    finalContent = CryptoJS.AES.encrypt(content, data.password.toString()).toString();
    isEncrypted = true;
  }

  const category = data.category || '';
  return {
    slug: data.slug || fileNameToSlug(filePath),
    title: data.title || 'Untitled',
    date: data.date || '',
    category,
    categorySlug: getCategorySlug(category),
    status: data.status || 'DRAFT',
    excerpt: data.excerpt || '',
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    tags: data.tags || [],
    isR18: !!data.isR18,
    content: finalContent,
    isEncrypted
  };
}

function parseD1Post(row: any): Post {
  let finalContent = row.content || '';
  let isEncrypted = false;

  if (row.password && String(row.password).trim()) {
    finalContent = CryptoJS.AES.encrypt(finalContent, String(row.password).trim()).toString();
    isEncrypted = true;
  }

  const category = row.category || '';
  let tags: string[] = [];
  if (row.tags) {
    if (typeof row.tags === 'string') {
      try {
        const parsed = JSON.parse(row.tags);
        if (Array.isArray(parsed)) tags = parsed;
        else tags = row.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      } catch {
        tags = row.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    } else if (Array.isArray(row.tags)) {
      tags = row.tags;
    }
  }

  return {
    slug: row.slug,
    title: row.title || 'Untitled',
    date: row.date || '',
    category,
    categorySlug: row.category_slug || getCategorySlug(category),
    status: row.status || 'PUBLISHED',
    excerpt: row.excerpt || '',
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    tags,
    isR18: !!row.is_r18,
    password_hint: row.password_hint,
    content: finalContent,
    isEncrypted,
  };
}

function extractChapterNumber(title: string): number | null {
  const m = title.match(/(?:Ch\.?|Chapter|第|#)\s*(\d+)/i) || title.match(/[（(](\d+)[)）]/);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

export function processDynamicContent(content: string, currentPost: PostMeta, allPosts: Post[]): string {
  if (!content) return '';
  if (!content.includes('{{AUTO_LAST_UPDATED}}') && !content.includes('{{AUTO_CHAPTER_LIST}}')) {
    return content;
  }

  // Find all posts in the same category/series, excluding this intro/hub post
  const seriesPosts = allPosts.filter(
    (p) =>
      p.category === currentPost.category &&
      p.slug !== currentPost.slug &&
      !p.title.includes('簡介') &&
      !p.title.includes('設定')
  );

  // Natural chapter sorting (Ch. 1, Ch. 2, ...)
  seriesPosts.sort((a, b) => {
    const numA = extractChapterNumber(a.title);
    const numB = extractChapterNumber(b.title);
    if (numA !== null && numB !== null) {
      return numA - numB;
    }
    return (a.date || '').localeCompare(b.date || '');
  });

  // Calculate latest update date
  let latestDate = currentPost.date || '';
  for (const p of seriesPosts) {
    if (p.date && p.date > latestDate) {
      latestDate = p.date;
    }
  }
  const formattedDate = latestDate ? latestDate.slice(0, 10) : '';

  // Generate chapter list in Markdown format
  const chapterList =
    seriesPosts.length > 0
      ? seriesPosts.map((p) => `- [${p.title}](${getPostUrl(p)})`).join('\n')
      : '_連載準備中_';

  return content
    .replace(/\{\{AUTO_LAST_UPDATED\}\}/g, formattedDate)
    .replace(/\{\{AUTO_CHAPTER_LIST\}\}/g, chapterList);
}

// ---------- Public API ----------

let _allPosts: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (!_allPosts) {
    const postMap = new Map<string, Post>();

    // 1. Load local markdown posts first
    const localPosts = Object.entries(postModules)
      .map(([path, raw]) => parsePost(path, raw))
      .filter((post) => post.status !== 'DRAFT');

    for (const p of localPosts) {
      postMap.set(p.slug, p);
    }

    // 2. Load D1 posts and overwrite local posts with same slug
    if (Array.isArray(d1PostsRaw)) {
      for (const row of d1PostsRaw) {
        if (row && row.slug && row.status !== 'DRAFT') {
          const d1Post = parseD1Post(row);
          postMap.set(d1Post.slug, d1Post);
        }
      }
    }

    const sorted = Array.from(postMap.values())
      .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

    // Dynamic resolution of series placeholders (e.g. {{AUTO_LAST_UPDATED}}, {{AUTO_CHAPTER_LIST}})
    _allPosts = sorted.map((post) => {
      if (post.content && (post.content.includes('{{AUTO_LAST_UPDATED}}') || post.content.includes('{{AUTO_CHAPTER_LIST}}'))) {
        return {
          ...post,
          content: processDynamicContent(post.content, post, sorted),
        };
      }
      return post;
    });
  }
  return _allPosts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getRecentPosts(count: number): Post[] {
  return getAllPosts().slice(0, count);
}

export function getPostsByCategory(categorySlug: string): Post[] {
  return getAllPosts().filter((p) => p.categorySlug === categorySlug);
}

export interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
  description?: string;
}

export function getCategoryDescription(slug: string): string | undefined {
  return CATEGORY_DESC_MAP[slug];
}

export function getCategories(): CategoryInfo[] {
  const posts = getAllPosts();
  const countMap = new Map<string, number>();
  for (const post of posts) {
    countMap.set(post.category, (countMap.get(post.category) || 0) + 1);
  }
  return Array.from(countMap.entries())
    .map(([name, count]) => {
      const slug = getCategorySlug(name);
      return {
        name,
        slug,
        count,
        description: CATEGORY_DESC_MAP[slug],
      };
    })
    .sort((a, b) => b.count - a.count);
}

/** Build a URL path for a post: /archive/[categorySlug]/[slug] */
export function getPostUrl(post: PostMeta): string {
  return `/archive/${post.categorySlug}/${post.slug}`;
}

// ---------- Site Config ----------

import siteConfigRaw from '/content/site-config.json';
import linksRaw from '/content/links.json';
import commissionRaw from '/content/commission.json';

export interface SiteLink {
  name: string;
  url: string;
}

export interface SiteConfig {
  siteUrl?: string;
  siteName: string;
  siteNameEn: string;
  siteDescription: string;
  author: string;
  authorBio: string;
  social: SiteLink[];
  friendLinks: SiteLink[];
  commission: {
    surprisePackOpen: boolean;
    surprisePackReferenceUrl: string;
    googleAppsScriptUrl: string;
    types?: Array<{
      id: string;
      label: string;
      description: string;
    }>;
  };
}

export function getSiteConfig(): SiteConfig {
  return {
    ...siteConfigRaw,
    ...linksRaw,
    ...commissionRaw
  } as unknown as SiteConfig;
}
