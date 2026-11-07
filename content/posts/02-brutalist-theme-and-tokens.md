---
title: 《設計工程：新粗獷主義 (Neo-Brutalism) 與動態主題切換引擎》
slug: brutalist-theme-and-tokens
date: 2026-11-03 14:30:00
category: 前端工程
status: PUBLISHED
tags:
  - Neo-Brutalism
  - Tailwind CSS v4
  - CSS 變數
  - 主題切換
  - 前端工程
excerpt: 探討如何運用新粗獷主義（Neo-Brutalism）打造兼具極簡秩序與高對比視覺張力的介面系統，並實作基於 CSS 變數的無閃爍動態主題切換引擎（支援大地色、曜石黑、極簡白與鼠尾草綠）。
seoTitle: 《設計工程：新粗獷主義與動態主題切換引擎》｜Joanne's Archive
seoDescription: 詳解 Neo-Brutalism 設計風格在 Tailwind CSS 4 中的實現，以及結合 CSS 變數與 LocalStorage 的無閃爍多主題切換機制。
password: ''
---

## 前言：何謂新粗獷主義（Neo-Brutalism）？

在扁平化設計（Flat Design）與毛玻璃擬物風格（Glassmorphism）盛行的今日，**新粗獷主義（Neo-Brutalism）** 以其純粹的幾何結構、清晰銳利的黑色硬邊框（Solid Borders）、無模糊的高對比硬陰影（Hard Box Shadows）以及大膽的印刷字體排印，重新奪回了數位介面的真實感與層次度。

本專案將新粗獷主義的視覺特徵抽象為一套可複用的 Design Tokens，並透過 Tailwind CSS 與原生 CSS 變數無縫串接。

---

## 一、設計權杖（Design Tokens）與 Tailwind CSS v4 整合

在 `src/index.css` 中，我們定義了核心語意色彩變數，讓所有組件在保持粗獷質感的同時，能以極高的一致性響應全域主題切換：

```css
@theme {
  --font-sans: "Noto Sans TC", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Noto Serif TC", ui-serif, Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --color-paper: #F5F4EE;
  --color-ink: #0A0A0A;
  --color-ink-light: #4A4A4A;
  --color-accent: var(--theme-accent, #A06540); /* 動態主題主色 */
}

@layer components {
  /* 新粗獷主義標誌性硬陰影與邊框容器 */
  .brutalist-block {
    @apply bg-paper border-4 border-ink shadow-[12px_12px_0_0_#0A0A0A];
  }

  /* 具備觸覺下壓回饋的立體按鈕 */
  .brutalist-button {
    @apply bg-white border-4 border-ink px-4 py-2 font-mono font-bold text-ink 
           shadow-[4px_4px_0_0_#0A0A0A] transition-all 
           hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none 
           active:translate-x-[4px] active:translate-y-[4px];
  }
}
```

---

## 二、動態主題切換引擎（Theme Engine）

使用者可隨時在側邊欄切換四種不同性格的視覺調性：
1. **大地色系 (Earth / #A06540)**：溫暖、穩重且富有人文手感。
2. **曜石墨黑 (Obsidian / #18181B)**：極客硬派、低調洗鍊。
3. **極簡白/燕麥紙色 (Paper / #78716C)**：沉靜極簡、專注文本閱讀。
4. **鼠尾草灰綠 (Sage / #4A7C59)**：清新自然、溫和無害。

### 避免客戶端閃爍（FOUC）的關鍵實作

傳統 SPA 切換主題常在 React 水合完成後才讀取 `localStorage`，導致每次重整頁面時出現明顯的色彩閃爍。本專案透過在 `<head>` 中注入純原生 Inline 腳本，在 DOM 尚未解析完成前就先鎖定 CSS 變數：

```html
<script is:inline>
  (function() {
    const applyTheme = () => {
      try {
        const savedColor = localStorage.getItem('theme_accent_color');
        if (savedColor) {
          document.documentElement.style.setProperty('--theme-accent', savedColor);
        }
      } catch (e) {}
    };

    // 1. 首屏渲染前立即執行，防止白色/預設色閃爍
    applyTheme();

    // 2. 監聽 Astro 視圖過渡事件，確保頁面路由切換時主題狀態不流失
    document.addEventListener('astro:after-swap', applyTheme);
  })();
</script>
```

---

## 三、總結

透過「新粗獷主義的硬邊框語法」結合「零延遲的 CSS 變數注入機制」，我們在保持高對比可讀性的同時，為使用者帶來兼具工程嚴謹性與現代設計美學的互動體驗。

