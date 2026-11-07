import React, { useState } from 'react';
import { X, Edit2, Check, Plus } from 'lucide-react';
import type { CategoryItem } from './AdminPostsApp';

interface CategoryModalProps {
  categories: CategoryItem[];
  onClose: () => void;
  onCategoryCreated: (cat: CategoryItem) => void;
  onCategoryUpdated?: (cat: CategoryItem) => void;
}

export function CategoryModal({
  categories,
  onClose,
  onCategoryCreated,
  onCategoryUpdated,
}: CategoryModalProps) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const startEdit = (cat: CategoryItem) => {
    setEditingSlug(cat.slug);
    setEditTitle(cat.title);
    setEditDesc(cat.description || '');
    setError('');
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setEditTitle('');
    setEditDesc('');
  };

  const handleUpdate = async (slugToUpdate: string) => {
    if (!editTitle.trim()) {
      setError('分類名稱不得為空');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slugToUpdate,
          title: editTitle.trim(),
          description: editDesc.trim() || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '更新分類失敗');

      if (onCategoryUpdated) {
        onCategoryUpdated({
          slug: slugToUpdate,
          title: editTitle.trim(),
          description: editDesc.trim() || undefined,
        });
      }
      setEditingSlug(null);
    } catch (err: any) {
      setError(err.message || '更新分類失敗');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError('請輸入分類名稱與英文代稱');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          slug: slug.trim(),
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '新增分類失敗');

      onCategoryCreated(data.category || { 
        title: title.trim(), 
        slug: slug.trim(), 
        description: description.trim() || undefined,
        post_count: 0 
      });
      setTitle('');
      setSlug('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || '新增分類失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/40 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E0D8] rounded-sm max-w-lg w-full p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A]">分類設定與 SEO 導讀</h3>
          <button onClick={onClose} className="p-1 text-[#888888] hover:text-[#1A1A1A] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="text-[#D9453B] text-xs bg-[#FDF2F2] p-2 border border-[#FDE8E8] rounded-xs">{error}</div>}

        {/* Categories List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {categories.map((c) => {
            const isEditing = editingSlug === c.slug;

            if (isEditing) {
              return (
                <div key={c.slug} className="p-2.5 bg-[#FAF8F5] border border-[#059669] rounded-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#888888]">代稱: /{c.slug}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdate(c.slug)}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#059669] text-white rounded-xs hover:bg-[#047857] disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>儲存</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={isUpdating}
                        className="px-2 py-0.5 border border-[#D5CFBF] hover:bg-white rounded-xs cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#666666] mb-0.5">分類名稱</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#666666] mb-0.5">分類 SEO 描述 (留空將套用自動模板)</label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      placeholder="留空將自動帶入預設作品導讀"
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                </div>
              );
            }

            return (
              <div key={c.slug} className="flex items-start justify-between text-xs py-2 px-2.5 hover:bg-[#F7F5F0] border border-[#F0EBE3] rounded-sm group transition-colors">
                <div className="space-y-0.5 pr-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1A1A1A]">{c.title}</span>
                    <span className="font-mono text-[#888888] text-[11px]">/{c.slug}</span>
                  </div>
                  <p className="text-[#666666] text-[11px] line-clamp-1">
                    {c.description ? c.description : <span className="italic text-[#999999]">未自訂（套用自動導讀模板）</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="p-1 text-[#888888] hover:text-[#059669] hover:bg-white rounded-xs cursor-pointer shrink-0 transition-colors"
                  title="編輯此分類資訊與 SEO 描述"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleCreate} className="border-t border-[#E5E0D8] pt-3 space-y-3 text-xs">
          <div className="font-medium text-[#1A1A1A] flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>新增分類</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#666666] mb-1">名稱 (如: 委託展示)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2 py-1.5 border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="block text-[#666666] mb-1">Slug (如: commission)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-2 py-1.5 font-mono border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[#666666] mb-1">分類 SEO 描述 (選填，留空將自動帶入預設模板)</label>
            <textarea
              rows={2}
              placeholder="例如: 原創連載小說《...》目錄，收錄作品篇章與設定。"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-[#E5E0D8] hover:bg-[#F7F5F0] rounded-sm cursor-pointer"
            >
              關閉
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-[#1A1A1A] text-white hover:bg-[#059669] rounded-sm cursor-pointer disabled:opacity-50 font-medium"
            >
              新增
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
