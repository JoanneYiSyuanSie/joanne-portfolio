---
title: 本站的技術架構：Astro 靜態網站
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
excerpt: 本站用 Astro 做靜態網站，放在 Cloudflare Pages 上。這篇寫靜態網站跟 WordPress 的差別、Core Web Vitals 在量什麼，以及本站的架構。
seoTitle: 本站的技術架構：Astro 靜態網站｜Joanne's Journal
seoDescription: 靜態網站跟 WordPress 的差別、Core Web Vitals 在量什麼，以及本站的技術架構。
password: null
---

> **📌 AI 生成內容**：本文由 AI 撰寫，介紹本站的技術架構。內容以可確認的事實為主，不含未經實測的數據。

## 靜態網站

靜態網站的意思是：網頁在發布之前就已經做好了。寫好一篇文章，建置的時候把它變成一份完整的 HTML 檔案，放在伺服器上。訪客來了，伺服器直接把檔案交出去，不用現場組裝。

WordPress 這類系統是動態的：訪客每次打開一頁，伺服器都要問資料庫、把內容拼成網頁，再送出來。這個過程需要時間，也需要主機運算。

靜態網站把工作提前到發布時做完，訪客來的時候沒什麼事要做，回應通常比較快。搜尋引擎的爬蟲也不用等頁面組裝。

## Core Web Vitals

Google 用 Core Web Vitals 衡量使用者實際感受到的網站體驗，量三件事：

- **主要內容出現的速度**：打開頁面後，最主要的文字或圖片多久才出現。
- **版面會不會跳動**：頁面載入時，文字或按鈕會不會突然移位。
- **點了之後多久有反應**：按按鈕或切換選單時，頁面多久才回應。頁面塞了太多 JavaScript，主執行緒被卡住，點擊就會感覺遲鈍。

## 本站的架構

本站用 Astro。它是靜態網站生成器，建置時把文章編成 HTML，預設幾乎不送 JavaScript 到瀏覽器，只有需要互動的地方才載入（Astro 叫它 Islands）。

架構分工：

- **Astro**：把 Markdown 文章編成靜態 HTML。
- **Cloudflare Pages**：放檔案、發給訪客。
- **Tailwind CSS**：樣式。
- 需要互動的區塊（例如文章頁的渲染）用 React 做成小元件，只在需要的地方載入。

沒有資料庫、沒有後端伺服器。文章就是 Markdown 檔案，改了就重新建置、重新發布。
