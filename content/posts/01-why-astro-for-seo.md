---
title: 《行銷人的 Technical SEO 實作：為什麼我選擇靜態網站而非 WordPress？》
slug: why-astro-for-seo
date: 2026-11-01 10:00:00
category: 技術 SEO
status: PUBLISHED
tags:
  - Technical SEO
  - Core Web Vitals
  - 網頁效能
  - 搜尋引擎優化
  - 靜態網站
excerpt: 身為兩年資歷內的行銷人，為什麼不直接套用常見的 WordPress，而是親自搭建靜態網站？本文從 Core Web Vitals、跳出率以及 Google 爬蟲抓取預算出發，誠實拆解 Technical SEO 底層的關鍵考量。
seoTitle: 《行銷人的 Technical SEO 實作：為什麼我選擇靜態網站而非 WordPress？》｜Joanne's Journal
seoDescription: 從行銷與 SEO 視角出發，解析 Core Web Vitals 對搜尋排名的實質影響，以及靜態網站架構如何達到極致的載入效能與爬蟲友善度。
password: ''
---

## 前言：行銷人為什麼要碰底層架構？

許多人認為 SEO 只需要做好關鍵字研究、寫出吸引人的文案並發布至社群即可。然而在過去兩年的行銷實務中，我深刻體會到一個痛點：**如果網站本身的體質不佳（速度慢、代碼臃腫、結構混亂），再優質的內容也難以在搜尋結果頁（SERP）中脫穎而出。**

為了真正弄懂搜尋引擎演算法對「技術體質」的要求，我決定不依賴傳統套版工具，而是親自實作一個以效能為導向的靜態內容站點。

---

## 一、Core Web Vitals 對行銷成效的真實影響

Google 已明確將「網站使用體驗核心指標（Core Web Vitals）」列為正式排名訊號：

1. **LCP (Largest Contentful Paint - 最大內容繪製)**：
   - 訪客進入頁面後，主要文字或視覺區塊載入所需的時間。實務數據顯示，頁面載入每延遲 1 秒，行動端跳出率顯著上升，轉換率可能下降高達 20%。
2. **CLS (Cumulative Layout Shift - 累計版面配置位移)**：
   - 頁面載入過程中元件跳動的情況。傳統部落格常因晚載入的廣告或圖片沒有固定尺寸，導致排版劇烈位移，大幅破壞閱讀體驗。
3. **INP (Interaction to Next Paint - 互動至下次繪製)**：
   - 使用者點擊按鈕或切換選單時的反應速度，考驗主執行緒是否被龐大的 JavaScript 阻塞。

---

## 二、WordPress 的瓶頸 vs 靜態網站的優勢

在過往的行銷專案中，WordPress 是最普及的建站選擇。但隨著功能增加，往往伴隨以下代價：
- **外掛臃腫**：為了 SEO、表單、快取、社群分享各裝一個外掛，導致頁面載入時請求數（Requests）激增，HTML 體積膨脹。
- **資料庫查詢延遲（TTFB 偏高）**：每次請求都需即時查詢 MySQL 資料庫，在一般主機規格下，首字節時間（TTFB）很難壓到 200ms 以內。
- **爬蟲抓取負擔**：對於搜尋引擎爬蟲（Googlebot）而言，等待動態渲染耗費運算資源，不利於多篇文章的深度爬取與快速索引。

### 為什麼選擇靜態網站生成（SSG）？
本站採用靜態生成模式，在建置期（Build Time）便將所有文章預先編譯為乾淨的原生 HTML/CSS：
- **零伺服器運算延遲**：沒有資料庫查詢，伺服器只需直接回應靜態檔案，TTFB 穩定維持在極低水平。
- **對爬蟲 100% 友善**：爬蟲抵達頁面時，不需要等待複雜的客戶端 JavaScript 執行，第一時間就能完整解析文字內容與階層結構。
- **極致的 PageSpeed 分數**：在 Google PageSpeed / Lighthouse 測試中，效能（Performance）與 SEO 得分均能穩定維持在 95～100 分。

---

## 三、行銷心得小結

跳脫「只會產文」的框架、跨入「Technical SEO」的世界後，我學會了從**使用者體感**與**搜尋引擎爬蟲**的雙重視角來審視網站。唯有在扎實的技術基石上展開內容策略，行銷推廣才能產生最大的槓桿效應。
