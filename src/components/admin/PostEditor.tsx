import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Bold,
  Italic,
  AlignCenter,
  Image as ImageIcon,
  Replace,
  WandSparkles,
  Clock
} from 'lucide-react';
import { FindReplaceBar } from './FindReplaceBar';
import type { PostItem, CategoryItem } from './AdminPostsApp';

export interface PostEditorProps {
  currentPost: PostItem;
  setCurrentPost: React.Dispatch<React.SetStateAction<PostItem>>;
  categories: CategoryItem[];
  saveStatus: 'idle' | 'saving' | 'saved' | 'publishing' | 'published' | 'error';
  statusMessage: string;
  onDismissStatusMessage: () => void;
  isGeneratingAI: boolean;
  onGenerateAI: () => void;
}

export function PostEditor({
  currentPost,
  setCurrentPost,
  categories,
  saveStatus,
  statusMessage,
  onDismissStatusMessage,
  isGeneratingAI,
  onGenerateAI,
}: PostEditorProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [formatMode, setFormatMode] = useState<'novel' | 'prose'>('novel');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut: Ctrl+F / Cmd+F to open Find & Replace in editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFindReplace((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format content algorithm (restored original: triggers only on clicking 執行排版)
  const handleFormatContent = () => {
    if (!currentPost.content) return;
    const text = currentPost.content.replace(/\r\n/g, '\n');
    const lines = text.split('\n');
    const processed: string[] = [];
    const useIndent = formatMode === 'novel';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].replace(/^(?:[　\s]|&emsp;)+/, '').trimEnd();
      if (line === '') {
        processed.push('');
        continue;
      }
      if (useIndent && !/^[※#>*\-\[\]]/.test(line)) {
        line = '&emsp;&emsp;' + line;
      }
      processed.push(line);
    }

    let joined = processed.join('\n');
    joined = joined.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');

    setCurrentPost((prev) => ({ ...prev, content: joined }));
  };

  const wrapSelection = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = `${before}${selected}${after}`;

    textarea.setRangeText(replacement, start, end, 'select');
    setCurrentPost((prev) => ({ ...prev, content: textarea.value }));
    textarea.focus();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '圖片上傳失敗');

      const imageUrl = data.url;
      const markdownImage = `\n![${file.name.replace(/\.[^/.]+$/, '')}](${imageUrl})\n`;
      wrapSelection(markdownImage);
    } catch (err: any) {
      alert(err.message || '圖片上傳失敗');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Character counter: Non-whitespace characters
  const charCount = (currentPost.content || '').replace(/\s/g, '').length;

  return (
    <div className="space-y-4">
      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`text-xs px-3 py-2 rounded-sm border flex items-center justify-between ${saveStatus === 'error'
              ? 'bg-[#FDE8E7] text-[#D9453B] border-[#F8B4B1]'
              : 'bg-[#E6F4EA] text-[#059669] border-[#A8DAB5]'
            }`}
        >
          <span>{statusMessage}</span>
          <button onClick={onDismissStatusMessage} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Metadata Box */}
      <div className="bg-white border border-[#E5E0D8] rounded-sm p-4 space-y-4">
        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="輸入文章標題..."
            value={currentPost.title}
            onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
            className="w-full text-xl md:text-2xl font-serif font-bold text-[#1A1A1A] bg-transparent border-b border-[#E5E0D8] pb-2 focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>

        {/* Core Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Category Selection */}
          <div>
            <label className="block text-[#666666] mb-1">分類</label>
            <select
              value={currentPost.category_slug}
              onChange={(e) => {
                const selectedSlug = e.target.value;
                const found = categories.find((c) => c.slug === selectedSlug);
                setCurrentPost({
                  ...currentPost,
                  category_slug: selectedSlug,
                  category: found ? found.title : currentPost.category,
                });
              }}
              className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-[#666666] mb-1">狀態</label>
            <select
              value={currentPost.status}
              onChange={(e) => setCurrentPost({ ...currentPost, status: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">已發布</option>
              <option value="UPDATED">已更新</option>
            </select>
          </div>

          {/* Publish Date */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#666666]">發布時間</label>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const pad = (n: number) => String(n).padStart(2, '0');
                  const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
                  setCurrentPost({ ...currentPost, date: formatted });
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#059669] hover:underline cursor-pointer"
                title="帶入目前系統時間"
              >
                <Clock className="w-3 h-3" />
                <span>現在時間</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="YYYY-MM-DD HH:mm"
                value={currentPost.date}
                onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                className="flex-1 px-2.5 py-1.5 font-mono bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
              />
              <input
                type="datetime-local"
                title="點擊日曆選擇日期時間"
                value={(() => {
                  try {
                    const d = new Date(currentPost.date.replace(' ', 'T'));
                    if (isNaN(d.getTime())) return '';
                    const pad = (n: number) => String(n).padStart(2, '0');
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  } catch {
                    return '';
                  }
                })()}
                onChange={(e) => {
                  if (e.target.value) {
                    setCurrentPost({ ...currentPost, date: e.target.value.replace('T', ' ') });
                  }
                }}
                className="w-8 h-[34px] px-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm cursor-pointer hover:border-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Slug Input */}
          <div>
            <label className="block text-[#666666] mb-1">網址代稱 (Slug)</label>
            <input
              type="text"
              placeholder="例如: my-story"
              value={currentPost.slug}
              onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
              className="w-full px-2.5 py-1.5 font-mono bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
        </div>

        {/* Collapsible Advanced Settings */}
        <div className="border-t border-[#E5E0D8] pt-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              {isAdvancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>進階設定 (密碼鎖、R18、SEO、標籤、摘要)</span>
            </button>

            {/* Workers AI SEO & Tags Assistant */}
            <button
              type="button"
              onClick={onGenerateAI}
              disabled={isGeneratingAI}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#FAF8F5] hover:bg-[#F0EBE3] text-[#1A1A1A] border border-[#D5CFBF] hover:border-[#059669] rounded-sm transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="使用 Workers AI 自動提煉 SEO 標題、描述與推薦標籤"
            >
              <WandSparkles className={`w-3.5 h-3.5 text-[#059669] ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'AI 提煉中...' : 'AI 提煉 SEO & 標籤'}</span>
            </button>
          </div>

          {isAdvancedOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#E5E0D8] text-xs">
              {/* Password & Hint */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[#666666] mb-1">閱讀存取密碼 (留空為公開)</label>
                  <input
                    type="password"
                    value={currentPost.password || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, password: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[#666666] mb-1">密碼提示</label>
                  <input
                    type="text"
                    placeholder="例如: 書名主角生日共四碼"
                    value={currentPost.password_hint || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, password_hint: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Flags & Tags */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[#666666] mb-1">標籤 (逗號分隔)</label>
                  <input
                    type="text"
                    placeholder="例如: 奇幻, 治癒, 原創"
                    value={currentPost.tags || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, tags: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[#666666] mb-1">屬性標記</label>
                  <div className="flex items-center gap-6 h-[31px]">
                    {/* Custom styled R18 checkbox */}
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${currentPost.is_r18
                            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                            : 'bg-[#F7F5F0] border-[#C8C2B8] group-hover:border-[#1A1A1A]'
                          }`}
                      >
                        {Boolean(currentPost.is_r18) && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(currentPost.is_r18)}
                        onChange={(e) => setCurrentPost({ ...currentPost, is_r18: e.target.checked ? 1 : 0 })}
                        className="sr-only"
                      />
                      <span className="text-[#1A1A1A] group-hover:text-black">限制級 (R18 警語)</span>
                    </label>

                    {/* Custom styled noindex checkbox */}
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${currentPost.noindex
                            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                            : 'bg-[#F7F5F0] border-[#C8C2B8] group-hover:border-[#1A1A1A]'
                          }`}
                      >
                        {Boolean(currentPost.noindex) && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(currentPost.noindex)}
                        onChange={(e) => setCurrentPost({ ...currentPost, noindex: e.target.checked ? 1 : 0 })}
                        className="sr-only"
                      />
                      <span className="text-[#1A1A1A] group-hover:text-black">阻擋搜尋引擎 (noindex)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div className="md:col-span-2">
                <label className="block text-[#666666] mb-1">文章摘要</label>
                <textarea
                  rows={2}
                  placeholder="站內文章摘要"
                  value={currentPost.excerpt || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              {/* SEO Title */}
              <div className="md:col-span-2">
                <label className="block text-[#666666] mb-1">自訂 SEO 標題</label>
                <input
                  type="text"
                  placeholder="站外 SEO 標題"
                  value={currentPost.seo_title || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, seo_title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              {/* SEO Description */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#666666]">自訂 SEO 描述 (Meta Description，留空則採用文章摘要)</label>
                  <span className="font-mono text-[11px] text-[#888888]">
                    {(currentPost.seo_description || '').length} 字 (建議 120-160 字)
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="站外 SEO 描述"
                  value={currentPost.seo_description || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, seo_description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded-sm focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white border border-[#E5E0D8] rounded-sm px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => wrapSelection('**', '**')}
            title="粗體 (**選取文字**)"
            className="p-1.5 text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#EAE5DC] border border-transparent hover:border-[#C8C2B8] rounded-sm cursor-pointer transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*')}
            title="斜體 (*選取文字*)"
            className="p-1.5 text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#EAE5DC] border border-transparent hover:border-[#C8C2B8] rounded-sm cursor-pointer transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<span class="spoiler">', '</span>')}
            title="防雷"
            className="px-2 py-1 text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#EAE5DC] border border-transparent hover:border-[#C8C2B8] rounded-sm cursor-pointer transition-colors font-medium"
          >
            防雷
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<div style="text-align:center">\n\n', '\n\n</div>')}
            title="置中"
            className="p-1.5 text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#EAE5DC] border border-transparent hover:border-[#C8C2B8] rounded-sm cursor-pointer transition-colors"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('\n\n***\n\n')}
            title="分隔線 (***)"
            className="px-2 py-1 font-mono text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#EAE5DC] border border-transparent hover:border-[#C8C2B8] rounded-sm cursor-pointer transition-colors font-bold"
          >
            ***
          </button>

          {/* Upload Image Button */}
          <label
            title="插入圖片 (上傳至 R2)"
            className="p-1.5 text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#EAE5DC] border border-transparent hover:border-[#C8C2B8] rounded-sm cursor-pointer inline-flex items-center transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploadingImage}
            />
          </label>
          {isUploadingImage && <span className="text-[#888888] ml-1">上傳中</span>}

          {/* Find & Replace Icon Button */}
          <button
            type="button"
            onClick={() => setShowFindReplace((prev) => !prev)}
            title="尋找與取代 (Ctrl + F)"
            className={`p-1.5 rounded-sm cursor-pointer transition-colors border ${showFindReplace
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#EAE5DC] border-transparent hover:border-[#C8C2B8]'
              }`}
          >
            <Replace className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Formatting Helper Segment */}
        <div className="flex items-center gap-1.5 border-l border-[#E5E0D8] pl-2">
          <div className="inline-flex border border-[#E5E0D8] rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setFormatMode('novel')}
              className={`px-2 py-1 cursor-pointer transition-colors ${formatMode === 'novel' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#666666]'
                }`}
            >
              小說縮排
            </button>
            <button
              type="button"
              onClick={() => setFormatMode('prose')}
              className={`px-2 py-1 cursor-pointer transition-colors ${formatMode === 'prose' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#666666]'
                }`}
            >
              散文排版
            </button>
          </div>
          <button
            type="button"
            onClick={handleFormatContent}
            title="套用所選排版規則"
            className="px-2.5 py-1 bg-white border border-[#1A1A1A] hover:bg-[#E5E0D8] rounded-sm cursor-pointer font-medium"
          >
            執行排版
          </button>
        </div>
      </div>

      {/* Find & Replace Bar (Collapsible) */}
      {showFindReplace && (
        <FindReplaceBar
          content={currentPost.content || ''}
          onUpdateContent={(newContent) => setCurrentPost((prev) => ({ ...prev, content: newContent }))}
          onClose={() => setShowFindReplace(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="bg-white border border-[#E5E0D8] rounded-sm p-4">
        <textarea
          ref={textareaRef}
          rows={22}
          placeholder="在此撰寫文章內文 (支援 Markdown 語法)"
          value={currentPost.content}
          onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
          className="w-full text-base font-serif leading-relaxed text-[#1A1A1A] bg-transparent resize-y focus:outline-none placeholder-[#AAAAAA]"
        />

        {/* Bottom Info Bar */}
        <div className="border-t border-[#E5E0D8] pt-2 mt-2 flex items-center justify-between text-xs font-mono text-[#888888]">
          <span>可直接貼上完整文字或 Markdown</span>
          <span>字元數: {charCount.toLocaleString()} (不含空格)</span>
        </div>
      </div>
    </div>
  );
}
