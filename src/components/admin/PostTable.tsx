import React from 'react';
import { Search, Edit3, ExternalLink, Trash2, Check, X } from 'lucide-react';
import type { PostItem, CategoryItem } from './AdminPostsApp';

export interface PostTableProps {
  filteredPosts: PostItem[];
  categories: CategoryItem[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  filterStatus: 'ALL' | 'PUBLISHED' | 'UPDATED' | 'DRAFT';
  setFilterStatus: (status: 'ALL' | 'PUBLISHED' | 'UPDATED' | 'DRAFT') => void;
  selectedPostIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  isBatchProcessing: boolean;
  onBatchAction: (action: 'PUBLISHED' | 'DRAFT') => void;
  onClearSelection: () => void;
  onEditPost: (post: PostItem) => void;
  onDeletePost: (post: PostItem) => void;
}

export function PostTable({
  filteredPosts,
  categories,
  loading,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  selectedPostIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected,
  isSomeSelected,
  isBatchProcessing,
  onBatchAction,
  onClearSelection,
  onEditPost,
  onDeletePost,
}: PostTableProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white border border-[#E5E0D8] rounded-sm p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋文章標題或 Slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#666666] whitespace-nowrap">分類:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-transparent border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
          >
            <option value="ALL">全部分類</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center border border-[#E5E0D8] rounded-sm overflow-hidden text-xs">
          {(['ALL', 'PUBLISHED', 'UPDATED', 'DRAFT'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                filterStatus === s
                  ? 'bg-[#1A1A1A] text-white font-medium'
                  : 'bg-white text-[#666666] hover:bg-[#F7F5F0]'
              }`}
            >
              {s === 'ALL' ? '全部' : s === 'PUBLISHED' ? '已發布' : s === 'UPDATED' ? '已更新' : '草稿'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E0D8] bg-[#F7F5F0] text-xs font-mono text-[#666666]">
              <th className="py-2.5 px-3 w-10 text-center">
                <label className="inline-flex items-center justify-center cursor-pointer select-none group">
                  <div
                    className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                      isAllSelected
                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                        : isSomeSelected
                        ? 'bg-[#E5E0D8] border-[#1A1A1A] text-[#1A1A1A]'
                        : 'bg-white border-[#C8C2B8] group-hover:border-[#1A1A1A]'
                    }`}
                  >
                    {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    {isSomeSelected && <div className="w-2 h-0.5 bg-[#1A1A1A]" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="sr-only"
                  />
                </label>
              </th>
              <th className="py-2.5 px-4 font-normal">標題</th>
              <th className="py-2.5 px-4 font-normal w-28">分類</th>
              <th className="py-2.5 px-4 font-normal w-24">狀態</th>
              <th className="py-2.5 px-4 font-normal w-28">字數</th>
              <th className="py-2.5 px-4 font-normal w-32">發布日期</th>
              <th className="py-2.5 px-4 font-normal w-32 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E0D8] text-sm">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-[#888888]">
                  {loading ? '載入中...' : '尚無符合條件的文章。'}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr
                  key={post.slug}
                  className={`hover:bg-[#FAF8F5] transition-colors ${
                    post.id && selectedPostIds.includes(post.id) ? 'bg-[#F6F3EC]' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-center">
                    {post.id ? (
                      <label className="inline-flex items-center justify-center cursor-pointer select-none group">
                        <div
                          className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                            selectedPostIds.includes(post.id)
                              ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                              : 'bg-white border-[#C8C2B8] group-hover:border-[#1A1A1A]'
                          }`}
                        >
                          {selectedPostIds.includes(post.id) && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedPostIds.includes(post.id)}
                          onChange={() => post.id && onToggleSelect(post.id)}
                          className="sr-only"
                        />
                      </label>
                    ) : (
                      <span className="text-[#CCC] font-mono text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onEditPost(post)}
                      className="font-medium text-left hover:text-[#059669] transition-colors cursor-pointer"
                    >
                      {post.title || '無標題'}
                    </button>
                    <div className="text-xs font-mono text-[#888888]">{post.slug}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 bg-[#F0EBE3] text-[#4A4A4A] rounded-sm">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {post.status === 'PUBLISHED' ? (
                      <span className="text-xs px-2 py-0.5 bg-[#E6F4EA] text-[#059669] font-medium rounded-sm">
                        已發布
                      </span>
                    ) : post.status === 'UPDATED' ? (
                      <span className="text-xs px-2 py-0.5 bg-[#E8F0FE] text-[#1A73E8] font-medium rounded-sm">
                        已更新
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-[#F1F3F4] text-[#5F6368] rounded-sm">
                        草稿
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#666666]">
                    {post.content_length
                      ? post.content_length.toLocaleString()
                      : (post.content || '').replace(/\s/g, '').length.toLocaleString()}{' '}
                    字
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#666666]">
                    {(post.date || '').slice(0, 10).replace(/-/g, '.')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onEditPost(post)}
                        title="編輯"
                        className="p-1 text-[#666666] hover:text-[#1A1A1A] hover:bg-[#E5E0D8] rounded-sm transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          localStorage.setItem('adabanipal_admin_preview', JSON.stringify(post));
                          window.open('/admin/posts/preview', '_blank');
                        }}
                        title="預覽"
                        className="p-1 text-[#666666] hover:text-[#1A1A1A] hover:bg-[#E5E0D8] rounded-sm transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePost(post)}
                        title="刪除"
                        className="p-1 text-[#888888] hover:text-[#D9453B] hover:bg-[#FDE8E7] rounded-sm transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Batch Floating Action Bar */}
      {selectedPostIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1A1A1A] text-white px-5 py-3 rounded shadow-2xl flex items-center gap-4 border border-[#333333] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-mono text-[#D1D5DB]">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
            已選取 <span className="font-bold text-white text-sm">{selectedPostIds.length}</span> 篇文章
          </div>
          <div className="h-4 w-px bg-[#444444]" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isBatchProcessing}
              onClick={() => onBatchAction('PUBLISHED')}
              className="px-3 py-1.5 text-xs font-medium bg-[#059669] hover:bg-[#047857] text-white rounded-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isBatchProcessing ? '處理中...' : '批量發布'}
            </button>
            <button
              type="button"
              disabled={isBatchProcessing}
              onClick={() => onBatchAction('DRAFT')}
              className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isBatchProcessing ? '處理中...' : '批量轉為草稿'}
            </button>
            <button
              type="button"
              disabled={isBatchProcessing}
              onClick={onClearSelection}
              className="p-1 text-[#888888] hover:text-white rounded-sm transition-colors cursor-pointer ml-1"
              title="取消選取"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
