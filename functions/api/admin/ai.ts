// Cloudflare Pages Function: /api/admin/ai
// Handles generating SEO title, description, and suggested tags using Cloudflare Workers AI.

interface Env {
  DB?: any;
  AI?: any;
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
    const { title, content, category } = data;

    if (!title && !content) {
      return new Response(JSON.stringify({ error: 'Title or content is required.' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // Sample content (first 1,500 characters) to preserve tokens
    const cleanContent = (content || '')
      .replace(/&emsp;/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\r\n/g, '\n')
      .trim()
      .slice(0, 1500);

    // Fetch up to 3 recent published posts from D1 as Few-Shot examples
    let examplesText = '';
    if (env.DB) {
      try {
        const stmt = env.DB.prepare(
          "SELECT title, category, seo_title, seo_description, tags FROM posts WHERE status != 'DRAFT' AND seo_title IS NOT NULL AND seo_description IS NOT NULL ORDER BY date DESC LIMIT 3"
        );
        const { results } = await stmt.all();
        if (results && results.length > 0) {
          examplesText = results
            .map(
              (r: any, idx: number) =>
                `【範例 ${idx + 1}】\n標題：${r.title}\n分類：${r.category}\n既有SEO標題：${r.seo_title}\n既有SEO描述：${r.seo_description}\n標籤：${r.tags || ''}`
            )
            .join('\n\n');
        }
      } catch (dbErr) {
        console.warn('Could not load examples from DB:', dbErr);
      }
    }

    if (!examplesText) {
      examplesText = `【範例 1】\n標題：《一匹馬走進酒吧》\n分類：委託展示\n既有SEO標題：《一匹馬走進酒吧》噗浪轉蛋文字委託展示｜花花巴尼拔圖書館\n既有SEO描述：謊花非商業文字委託展示作品《一匹馬走進酒吧》（噗浪轉蛋）。不知道是在慶祝什麼的慶典之夜，綿羊一向對這種細節漠不關心。\n標籤：委託展示,文字委託,短篇小說`;
    }

    // Check if Cloudflare Workers AI binding is available
    if (env.AI && typeof env.AI.run === 'function') {
      const systemPrompt = `你現在是文學網站「花花巴尼拔圖書館（Adabanipal Library）」的圖書館管理員與資深文字編輯。
作者名為「謊花」，創作內容主要為原創小說、散文隨筆與文字委託。
請務必使用標準「繁體中文（台灣）」回覆，文字風格優雅沉穩，富有文學質感，絕不使用廉價浮誇的農場標題或行銷用語。

你必須嚴格僅回傳標準 JSON 物件，格式如下，不要包含任何額外說明文字或 Markdown 標記：
{
  "seoTitle": "《篇名》[分類/特質說明]｜花花巴尼拔圖書館",
  "seoDescription": "120~160字的故事摘要與氛圍介紹...",
  "suggestedTags": ["標籤1", "標籤2", "標籤3"]
}`;

      const userPrompt = `以下是圖書館過往已發布文章的風格範例供你參考命名格式與筆觸：
${examplesText}

---
【當前待分析新文章】
標題：${title || '未命名'}
分類：${category || '散文隨筆'}
開頭內文：
${cleanContent}

請嚴格僅回傳標準 JSON 物件：
{
  "seoTitle": "...",
  "seoDescription": "...",
  "suggestedTags": ["...", "..."]
}`;

      // Use verified Western models from Cloudflare Workers AI catalog
      // 1. @cf/meta/llama-3.1-8b-instruct-fp8 (Fast, 32k context)
      // 2. @cf/meta/llama-3.3-70b-instruct-fp8-fast (High-tier 70B flagship)
      // 3. @cf/meta/llama-3.2-3b-instruct (Lightweight, 128k context)
      const candidateModels = [
        '@cf/meta/llama-3.1-8b-instruct-fp8',
        '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        '@cf/meta/llama-3.2-3b-instruct',
      ];

      for (const modelId of candidateModels) {
        try {
          const aiResponse = await env.AI.run(modelId, {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 512,
            temperature: 0.3,
          });

          const responseText = aiResponse?.response || '';
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const modelShortName = modelId.split('/').pop() || modelId;
            return new Response(JSON.stringify({
              success: true,
              isFallback: false,
              model: modelShortName,
              data: {
                seoTitle: parsed.seoTitle || `${title}｜花花巴尼拔圖書館`,
                seoDescription: parsed.seoDescription || cleanContent.slice(0, 140),
                suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
              },
            }), {
              status: 200,
              headers: CORS_HEADERS,
            });
          }
        } catch (aiRunErr: any) {
          console.warn(`Workers AI model ${modelId} failed, trying next candidate:`, aiRunErr);
        }
      }
    }

    // Heuristic Fallback (useful for local dev when Workers AI binding is not loaded)
    const categorySuffix = category ? `${category}` : '原創';
    const fallbackTitle = `${title ? `《${title.replace(/[《》]/g, '')}》` : '新作'}${categorySuffix ? `${categorySuffix}｜` : '｜'}花花巴尼拔圖書館`;
    const fallbackDesc = cleanContent.slice(0, 140).replace(/\n+/g, ' ') + '...';
    const fallbackTags = [category || '短篇小說', '文字創作'];

    return new Response(JSON.stringify({
      success: true,
      isFallback: true,
      data: {
        seoTitle: fallbackTitle,
        seoDescription: fallbackDesc,
        suggestedTags: fallbackTags,
      },
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error('AI API Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'AI request failed' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
