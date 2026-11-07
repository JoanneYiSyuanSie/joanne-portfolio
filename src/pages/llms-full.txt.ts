import type { APIRoute } from 'astro';
import { getAllPosts, getSiteConfig, getPostUrl } from '../lib/content';

export const GET: APIRoute = async () => {
  const config = getSiteConfig();
  const posts = getAllPosts();

  const baseUrl = config.siteUrl || 'https://joanne-portfolio.dev';

  let markdown = `# ${config.siteName} (${config.siteNameEn}) - Full Content\n\n`;
  markdown += `> This file contains the complete content of all public articles on ${config.siteName}.\n\n`;

  markdown += `## About & Key Links\n`;
  markdown += `- [首頁](${baseUrl}/): ${config.siteDescription || "Joanne's Archive 首頁"}\n`;
  markdown += `- [關於作者](${baseUrl}/about): 關於 Joanne 的基本資訊、技術專長與社群連結\n`;
  markdown += `- [技術典藏](${baseUrl}/archive): 收錄所有架構說明與技術文件\n`;
  markdown += `- [專案合作](${baseUrl}/commission): 專案合作與技術諮詢表單\n`;
  markdown += `- [隱私權政策](${baseUrl}/privacy): 網站隱私權政策與聲明\n\n`;

  if (config.social && config.social.length > 0) {
    markdown += `## Social Connections\n`;
    for (const link of config.social) {
      markdown += `- [${link.name}](${link.url})\n`;
    }
    markdown += `\n`;
  }

  markdown += `## Content Archive\n\n`;
  for (const post of posts) {
    const tagsString = post.tags && post.tags.length > 0 ? `\n- **Tags**: ${post.tags.join(', ')}` : '';
    
    markdown += `### [${post.title}](${baseUrl}${getPostUrl(post)})\n`;
    markdown += `- **Category**: ${post.category}\n`;
    markdown += `- **Date**: ${post.date.slice(0, 10)}${tagsString}\n`;
    markdown += `- **Description**: ${post.excerpt || '無摘要'}\n`;
    
    if (post.isEncrypted) {
      markdown += `\n#### Content:\n*(此文章已加密保護，無法直接提供全文。)*\n\n`;
    } else {
      markdown += `\n#### Content:\n${post.content}\n\n`;
    }
    markdown += `---\n\n`;
  }

  return new Response(markdown.trim() + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
