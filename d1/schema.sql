-- Cloudflare D1 Database Schema for joanne-portfolio
-- Database Name: joanne-db

-- 1. Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- 'PUBLISHED', 'UPDATED', 'DRAFT'
  excerpt TEXT,
  tags TEXT,
  password TEXT,
  password_hint TEXT,
  is_r18 INTEGER DEFAULT 0,
  noindex INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_slug);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 3. Initial Seed Categories (Matching current content/categories/*.json)
INSERT OR IGNORE INTO categories (title, slug) VALUES
  ('散文隨筆', 'non-fic'),
  ('短篇小說', 'short-stories'),
  ('公告須知', 'announcements'),
  ('委託展示', 'commissions'),
  ('礎潤而雨', 'plinthus-and-rain'),
  ('【OC】薩托里', 'i-sartori');

-- 4. Easter Eggs Table (Server-side true verification)
CREATE TABLE IF NOT EXISTS easter_eggs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '活動彩蛋',
  is_active INTEGER DEFAULT 0,
  trigger_mode TEXT NOT NULL DEFAULT 'keyboard', -- 'keyboard' or 'theme_sequence'
  secret_sequence TEXT NOT NULL, -- JSON array of keys
  coupon_code TEXT,
  message TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
