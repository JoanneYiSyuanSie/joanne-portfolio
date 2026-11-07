# Joanne's Archive ｜ Modern Web Architecture & Portfolio

> 一個基於 **Astro 6**、**React 19**、**TypeScript** 與 **Tailwind CSS v4** 建構的現代個人作品集與技術典藏庫，具備**新粗獷主義（Neo-Brutalism）**設計風格與**動態主題切換引擎**。

---

## 🌟 核心技術亮點 (Key Highlights)

- ⚡ **島嶼架構（Islands Architecture）**：以 Astro 6 為主幹，預設編譯為零 JS 的原生 HTML，僅對導航、主題色彩與互動元件採用局部水合（`client:idle` / `client:only`）。
- 🎨 **Neo-Brutalism 設計系統**：銳利黑色邊框、高對比硬陰影與高親和力字體排版，兼具秩序感與視覺張力。
- 🌓 **動態多主題切換引擎**：提供四款經典色彩風格（大地色系、曜石墨黑、極簡紙色、鼠尾草灰綠），結合原生 CSS 變數注入與 `astro:after-swap`，達成**首屏無閃爍（Zero FOUC）**體驗。
- 📝 **以檔案為驅動的 Content Layer**：文章與分類完全採用 Markdown / YAML Frontmatter 格式集中管理，透過 Vite 的 `import.meta.glob` 進行建置期解析。
- ☁️ **雲端邊緣計算整合（Edge Functions）**：聯絡與合作表單經由 Cloudflare Pages Functions 於邊緣節點進行非同步分流與處理。
- 🔄 **Pre-build 同步管線**：透過 `sync-d1.mjs` 於建置前自動快取外部分散式資料庫內容，維持 100% 靜態站點生成（SSG）的頂級讀取效能。

---

## 🛠️ 技術棧 (Tech Stack)

| 領域 | 技術選型 |
| :--- | :--- |
| **Framework** | [Astro 6](https://astro.build/) (Static Site Generation + View Transitions) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (~5.8) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Typography Plugin |
| **Icons & Motion** | [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |
| **Deployment** | [Cloudflare Pages](https://pages.cloudflare.com/) + Cloudflare D1 |

---

## 📂 目錄結構 (Project Structure)

```text
├── content/              # 內容層（Markdown 文章與分類 JSON）
│   ├── categories/       # 系統架構、前端工程、雲端邊緣等分類設定
│   ├── posts/            # 技術架構拆解與工程筆記
│   ├── site-config.json  # 站點全域與作者設定
│   └── commission.json   # 專案合作與諮詢表單設定
├── functions/            # Cloudflare Pages Functions (Serverless API)
│   └── api/              # 邊緣端點路由
├── public/               # 靜態資源、Monogram、Decap CMS 配置
├── scripts/              # 建置前資料預同步腳本 (sync-d1.mjs)
├── src/
│   ├── components/       # React 互動島嶼組件與 Neo-Brutalism UI
│   ├── layouts/          # Astro 頁面骨架與 SEO 管理
│   ├── lib/              # Content Layer 工具函式與分析追蹤
│   └── pages/            # 靜態路由頁面與動態文章路徑
└── astro.config.mjs      # Astro 與 Vite 整合設定
```

---

## 🚀 快速啟動 (Quick Start)

### 1. 安裝依賴套件
```bash
npm install
```

### 2. 啟動本地開發伺服器
```bash
npm run dev
```
瀏覽器造訪 `http://localhost:3000` 即可預覽網站。

### 3. 建置生產版本
```bash
npm run build
```
建置輸出將生成於 `dist/` 目錄，可直接部署至任何靜態託管平台（如 GitHub Pages、Cloudflare Pages、Vercel 等）。

---

## 📄 License
MIT License. Crafted with precision by Joanne.

