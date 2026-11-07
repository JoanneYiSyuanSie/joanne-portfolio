import React, { useState } from 'react';
import { X } from 'lucide-react';
import { parse as parseYaml } from 'yaml';
import type { CategoryItem, PostItem } from './AdminPostsApp';

interface ImportModalProps {
  categories: CategoryItem[];
  onClose: () => void;
  onImport: (post: Partial<PostItem>) => void;
}

export function ImportModal({
  categories,
  onClose,
  onImport,
}: ImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
    };
    reader.readAsText(file);
  };

  const handleParseAndLoad = () => {
    if (!rawText.trim()) {
      setError('請貼上內容或選擇檔案');
      return;
    }

    try {
      const match = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (match) {
        const frontmatterBlock = match[1];
        const content = match[2].trim();
        const data = (parseYaml(frontmatterBlock) || {}) as Record<string, any>;

        // Resolve category and category_slug
        let catSlug = data.category_slug || data.categorySlug || '';
        let catTitle = data.category || '';

        if (!catSlug && catTitle) {
          const found = categories.find(
            (c) =>
              c.title === catTitle ||
              c.slug === catTitle ||
              c.title.includes(catTitle) ||
              catTitle.includes(c.title)
          );
          if (found) {
            catSlug = found.slug;
            catTitle = found.title;
          }
        } else if (catSlug && !catTitle) {
          const found = categories.find((c) => c.slug === catSlug);
          if (found) {
            catTitle = found.title;
          }
        }

        onImport({
          title: data.title || '',
          slug: data.slug || '',
          date: data.date ? new Date(data.date).toISOString().replace('T', ' ').slice(0, 19) : '',
          category: catTitle || '散文隨筆',
          category_slug: catSlug || 'non-fic',
          status: data.status || 'PUBLISHED',
          excerpt: data.excerpt || '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
          password: data.password ? String(data.password) : '',
          password_hint: data.password_hint || data.passwordHint || '',
          is_r18: (data.is_r18 || data.isR18 || data.r18) ? 1 : 0,
          noindex: (data.noindex || data.noIndex) ? 1 : 0,
          seo_title: data.seo_title || data.seoTitle || '',
          seo_description: data.seo_description || data.seoDescription || '',
          content,
        });
      } else {
        // Plain text without frontmatter
        onImport({
          content: rawText,
        });
      }
    } catch (err: any) {
      setError('解析失敗: ' + (err.message || '格式不正確'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/40 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E0D8] rounded-sm max-w-lg w-full p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A]">匯入 Markdown / 貼上文字</h3>
          <button onClick={onClose} className="p-1 text-[#888888] hover:text-[#1A1A1A] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-[#666666]">
          支援直接上傳本地 <code>.md</code> 檔案，或在下方貼上包含 <code>---</code> Frontmatter 的完整內容，系統會自動填入各欄位。
        </div>

        <div>
          <input
            type="file"
            accept=".md,.txt"
            onChange={handleFileUpload}
            className="text-xs text-[#666666] file:mr-2 file:py-1 file:px-2.5 file:border file:border-[#E5E0D8] file:bg-[#F7F5F0] file:rounded-sm file:text-xs file:cursor-pointer"
          />
        </div>

        {error && <div className="text-xs text-[#D9453B]">{error}</div>}

        <div>
          <textarea
            rows={10}
            placeholder="在此貼上 Markdown 或純文字..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full p-2.5 text-xs font-mono bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-[#E5E0D8] hover:bg-[#F7F5F0] rounded-sm cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleParseAndLoad}
            className="px-3.5 py-1.5 text-xs bg-[#1A1A1A] text-white hover:bg-[#059669] rounded-sm cursor-pointer font-medium"
          >
            解析並載入編輯器
          </button>
        </div>
      </div>
    </div>
  );
}
