---
title: 《架構剖析：基於 Astro 6 與 React 19 的島嶼架構實踐》
slug: astro-hybrid-architecture
date: 2026-11-01 10:00:00
category: 系統架構
status: PUBLISHED
tags:
  - Astro
  - React 19
  - 系統架構
  - 島嶼架構
  - 靜態網站生成
excerpt: 本文深入拆解本作品集網站的核心技術架構，探討如何結合 Astro 6 的靜態網站生成優勢與 React 19 的島嶼水合（Islands Hydration）機制，在維持零 JS 預設加載的前提下提供流暢的 SPA 互動體驗。
seoTitle: 《架構剖析：基於 Astro 6 與 React 19 的島嶼架構實踐》｜Joanne's Archive
seoDescription: 深入探討現代 Web 渲染模式、Astro 島嶼架構與 React 19 整合實踐，達成頂級效能與開發體驗。
password: ''
---

## 前言：為什麼選擇以 Astro 為核心？

在建構一個兼具「內容閱讀體驗」與「豐富應用互動」的現代網站時，傳統的 SPA（單頁應用程式）往往面臨過度依賴客戶端 JavaScript、首頁載入慢（FCP / LCP 指標不佳）以及不利於搜尋引擎索引（SEO）的瓶頸；另一方面，傳統的伺服器渲染框架（SSR）在部署與伺服器成本上也具備一定門檻。

本網站採用 **Astro 6** 搭配 **React 19**，核心目標就是實現 **「零 JS 預設代價（Zero-JS by Default）」**：
- 文章、索引與排版骨架全面在建置期（Build Time）編譯為乾淨的原生 HTML/CSS。
- 僅在需要高度動態狀態互動的局部組件（如主題切換器、全文篩選、後台預覽、聯絡表單）掛載 React Islands。

---

## 一、島嶼架構（Islands Architecture）策略

Astro 提出的島嶼架構允許開發者在完全靜態的 HTML 頁面中，獨立指定各個互動組件的水合時機（Hydration Directive）：

```astro
<!-- 靜態骨架與 SEO Meta 標籤：純 HTML，零額外 JS 負擔 -->
<Layout title="Joanne's Archive">
  <!-- client:idle：主執行緒閒置時才水合導航與主題互動 -->
  <ReactLayout client:idle currentPath={currentPath}>
    <main>
      <slot />
    </main>
  </ReactLayout>
  <!-- client:only：不需要 SSR 的純客戶端趣味組件 -->
  <EasterEgg client:only="react" />
</Layout>
```

### 水合策略配置細節：
1. **`client:idle`**：用於核心導航與主題色彩控制欄。優先確保頁面第一時間完成首次內容繪製（FCP），待瀏覽器主執行緒空閒時自動載入互動邏輯。
2. **`client:visible`**：用於滾動到可視範圍才需要觸發的長列表或動態元件。
3. **`client:only="react"`**：用於完全依賴瀏覽器特定 API（如鍵盤事件監聽、音效、特定動畫）的裝飾性功能，避免 SSR 階段出現 Hydration Mismatch。

---

## 二、動態內容層（Content Layer）設計

本站採用以檔案為驅動的資料層設計。所有文章以 Markdown / YAML Frontmatter 格式集中管理，並透過 Vite 的 `import.meta.glob` 進行編譯期靜態解析：

```typescript
// src/lib/content.ts
const postModules = import.meta.glob('/content/posts/*.md', {
  query: '?raw',
  eager: true,
}) as Record<string, string>;

export function getAllPosts(): Post[] {
  return Object.entries(postModules).map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    return {
      slug: data.slug || extractSlugFromPath(path),
      title: data.title,
      date: data.date,
      category: data.category,
      excerpt: data.excerpt,
      content,
      status: data.status || 'PUBLISHED',
    };
  });
}
```

這套架構讓文章內容與前端展示徹底解耦，不需要架設外部 Headless CMS 伺服器，所有文章內容就能直接納入版本控制（Git），並在每次 Git Push 時自動觸發靜態建置。

---

## 三、總結

透過 Astro 6 與 React 19 的結合，本專案成功達到了：
- **極致的載入效能**：首頁及文章頁 JavaScript 傳輸量降低超過 70%。
- **優秀的開發者體驗**：能在同一個專案中隨心所欲地使用熟悉的 React 生態系組件，卻不用犧牲靜態網站的簡潔與速度。

