# Joanne's Journal ｜ Content Strategy & Technical SEO

> **📌 這是展示用作品集站（Showcase Demo），不是正式營運的網站。**
>
> 這個站是為了求職做的作品集：用同樣的 Astro 架構，展示 Technical SEO、內容架構與行銷自動化的實作能力。它是正式營運的個人網站的去識別化版本，用 Joanne 的職場身份，不含創作內容，也不會連結到正式站。
>
> This is a showcase portfolio site for job hunting, not the production site. It is a de-identified demo built with the same Astro architecture; it does not link to the production site.

---

## 這個展示站是什麼？ (What Is This?)

- **目的**：求職作品集，展示我親手搭建網站、做 Technical SEO 與內容架構的能力。
- **與正式站的關係**：正式站是我的個人網站（創作內容與行銷自動化都在上面跑）；這個展示站是它的靜態 demo 版，架構相同，但內容換成技術文章、不含創作身份，也不會公開正式站的網址。
- **內容**：站上只有 3 篇技術文章——為什麼選 Astro 做 SEO、內容分類學與內部連結、行銷自動化架構。3 篇都是 AI 生成，每篇開頭都有標示。文章的目的是用白話介紹網站架構、讓人快速理解，不是深度分析或數據證明。

---

## 這個站有什麼、沒有什麼 (What's In / What's Not)

**有的（展示站本身）：**

- **Astro 靜態生成**：文章是 Markdown，建置時編成靜態 HTML，沒有資料庫。預設不送 JavaScript 到瀏覽器，只有需要互動的地方才載入（Astro Islands）。
- **內容分類與內部連結**：網址結構是 `/archive/[分類]/[文章]`，分類頁與文章互相連結，讀者跟搜尋引擎都能看懂網站的結構。
- **SEO 基礎**：XML Sitemap、Open Graph、llms.txt（讓 AI 搜尋工具讀得懂網站內容）。
- **新粗獷主義（Neo-Brutalism）設計**：粗黑框、紙底配色，支援主題切換。

**沒有的（只在正式站有）：**

- **行銷自動化**：正式站的表單會走 Cloudflare Pages Functions，發 Discord 即時通知、同時在 Notion 自動建檔。這個展示站是純靜態 demo，沒有後端、沒有 Webhook，API 金鑰也不在這個公開 repo 裡。
- **電子報訂閱**：正式站有電子報訂閱機制，展示站沒有接。

---

## 🛠️ 技術選型 (Tech Stack)

| 領域 | 技術選型 | 說明 |
| :--- | :--- | :--- |
| **框架** | [Astro 6](https://astro.build/) | 靜態生成（SSG），文章預先編成 HTML |
| **UI** | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | 新粗獷主義風格、主題切換 |
| **內容層** | Markdown + YAML Frontmatter | Slug、標籤、Meta Description、發布日期 |
| **部署** | GitHub Actions + GitHub Pages | 推到 main 分支就自動建置、部署 |

---

## 📄 License
MIT License. Crafted with precision by Joanne.
