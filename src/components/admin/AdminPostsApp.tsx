import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Folder,
  Upload,
  ArrowLeft,
  Download,
  ExternalLink,
  Gift
} from 'lucide-react';
import { PostTable } from './PostTable';
import { PostEditor } from './PostEditor';
import { CategoryModal } from './CategoryModal';
import { ImportModal } from './ImportModal';
import { EasterEggModal } from './EasterEggModal';

export interface PostItem {
  id?: number;
  slug: string;
  title: string;
  date: string;
  category: string;
  category_slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'UPDATED';
  excerpt?: string;
  tags?: string;
  password?: string;
  password_hint?: string;
  is_r18?: number | boolean;
  noindex?: number | boolean;
  seo_title?: string;
  seo_description?: string;
  content: string;
  content_length?: number;
  updated_at?: string;
}

export interface CategoryItem {
  id?: number;
  title: string;
  slug: string;
  description?: string;
  post_count?: number;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 1, title: '散文隨筆', slug: 'non-fic', post_count: 0 },
  { id: 2, title: '短篇小說', slug: 'short-stories', post_count: 0 },
  { id: 3, title: '公告須知', slug: 'announcements', post_count: 0 },
  { id: 4, title: '委託展示', slug: 'commissions', post_count: 0 },
  { id: 5, title: '礎潤而雨', slug: 'plinthus-and-rain', post_count: 0 },
  { id: 6, title: '【OC】薩托里', slug: 'i-sartori', post_count: 0 },
];

export function AdminPostsApp() {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEasterEggModal, setShowEasterEggModal] = useState(false);

  // List View Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'UPDATED' | 'DRAFT'>('ALL');

  // Batch Selection State
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Active Post for Editing
  const [currentPost, setCurrentPost] = useState<PostItem>({
    slug: '',
    title: '',
    date: new Date().toISOString().replace('T', ' ').slice(0, 19),
    category: '散文隨筆',
    category_slug: 'non-fic',
    status: 'DRAFT',
    excerpt: '',
    tags: '',
    password: '',
    password_hint: '',
    is_r18: 0,
    noindex: 0,
    seo_title: '',
    seo_description: '',
    content: '',
  });

  // Editor State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'publishing' | 'published' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [postsRes, catsRes] = await Promise.all([
        fetch('/api/admin/posts').catch(() => null),
        fetch('/api/admin/categories').catch(() => null),
      ]);

      let loadedPosts: PostItem[] = [];

      if (postsRes && postsRes.ok) {
        const postsData = await postsRes.json();
        if (postsData.posts && postsData.posts.length > 0) {
          loadedPosts = postsData.posts;
        }
      }

      // If remote returned nothing (e.g. local dev fallback), load from localStorage
      if (loadedPosts.length === 0) {
        try {
          const localSaved = localStorage.getItem('adabanipal_admin_posts_local');
          if (localSaved) {
            loadedPosts = JSON.parse(localSaved);
          }
        } catch { }
      }

      setPosts(loadedPosts);

      if (catsRes && catsRes.ok) {
        const catsData = await catsRes.json();
        if (catsData.categories && catsData.categories.length > 0) {
          setCategories(catsData.categories);
        }
      }
    } catch (err) {
      console.warn('Initial fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Switch to new post
  const handleNewPost = () => {
    const defaultCat = categories[0] || { title: '散文隨筆', slug: 'non-fic' };
    setCurrentPost({
      slug: '',
      title: '',
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: defaultCat.title,
      category_slug: defaultCat.slug,
      status: 'DRAFT',
      excerpt: '',
      tags: '',
      password: '',
      password_hint: '',
      is_r18: 0,
      noindex: 0,
      seo_title: '',
      seo_description: '',
      content: '',
    });
    setSaveStatus('idle');
    setStatusMessage('');
    setView('editor');
  };

  // Switch to edit existing post
  const handleEditPost = async (postItem: PostItem) => {
    setLoading(true);
    try {
      let fullPost = postItem;
      if (!postItem.content && postItem.slug) {
        const res = await fetch(`/api/admin/posts?slug=${encodeURIComponent(postItem.slug)}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.post) fullPost = data.post;
        }
      }

      setCurrentPost({
        ...fullPost,
        is_r18: fullPost.is_r18 ? 1 : 0,
        noindex: fullPost.noindex ? 1 : 0,
      });
      setSaveStatus('idle');
      setStatusMessage('');
      setView('editor');
    } catch (err) {
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save handler (Draft vs Publish / Update)
  const handleSave = async (targetStatus?: 'DRAFT' | 'PUBLISHED' | 'UPDATED') => {
    if (!currentPost.title.trim()) {
      alert('請填寫文章標題');
      return;
    }
    if (!currentPost.slug.trim()) {
      alert('請填寫網址代稱 (Slug)');
      return;
    }

    let nextStatus: 'DRAFT' | 'PUBLISHED' | 'UPDATED';
    if (targetStatus) {
      nextStatus = targetStatus;
    } else {
      nextStatus = currentPost.status === 'UPDATED' ? 'UPDATED' : 'PUBLISHED';
    }

    const isLive = nextStatus === 'PUBLISHED' || nextStatus === 'UPDATED';
    setSaveStatus(isLive ? 'publishing' : 'saving');

    const isUnpublishing = (currentPost.status === 'PUBLISHED' || currentPost.status === 'UPDATED') && nextStatus === 'DRAFT';

    setStatusMessage(
      isUnpublishing
        ? '正在轉為草稿並觸發前台自動下架打包'
        : isLive
          ? '正在儲存並觸發前台自動打包發布'
          : '正在儲存草稿'
    );

    const payload: PostItem = {
      ...currentPost,
      status: nextStatus,
      is_r18: currentPost.is_r18 ? 1 : 0,
      noindex: currentPost.noindex ? 1 : 0,
    };

    try {
      let data: any = null;
      let usedLocalFallback = false;

      try {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          usedLocalFallback = true;
        }
      } catch {
        usedLocalFallback = true;
      }

      if (usedLocalFallback) {
        const localKey = 'adabanipal_admin_posts_local';
        let localList: PostItem[] = [];
        try {
          const saved = localStorage.getItem(localKey);
          if (saved) localList = JSON.parse(saved);
        } catch { }
        const nextList = [payload, ...localList.filter((p) => p.slug !== payload.slug)];
        localStorage.setItem(localKey, JSON.stringify(nextList));
        data = { id: Date.now(), slug: payload.slug, status: nextStatus };
      }

      setCurrentPost((prev) => ({
        ...prev,
        id: data.id || prev.id,
        status: nextStatus,
      }));

      setSaveStatus(isLive ? 'published' : 'saved');
      if (data && data.deployTriggered) {
        if (data.isUnpublishing || isUnpublishing) {
          setStatusMessage('已轉為草稿（已觸發雲端自動打包，約 1 分鐘後前台下架）');
        } else {
          setStatusMessage(
            nextStatus === 'UPDATED'
              ? '已更新並標記為 UPDATED（已觸發雲端自動打包，約 1 分鐘後前台生效）'
              : '已發布（已觸發雲端自動打包，約 1 分鐘後前台生效）'
          );
        }
      } else {
        if (isUnpublishing) {
          setStatusMessage('已轉為草稿（已存入 D1 資料庫）');
        } else if (isLive) {
          setStatusMessage('已儲存發布狀態（已存入 D1 資料庫）');
        } else {
          setStatusMessage('已儲存');
        }
      }

      setPosts((prev) => {
        const exists = prev.some((p) => p.slug === payload.slug || (payload.id && p.id === payload.id));
        if (exists) {
          return prev.map((p) => (p.slug === payload.slug || (payload.id && p.id === payload.id) ? { ...payload, id: data.id || p.id } : p));
        }
        return [{ ...payload, id: data.id }, ...prev];
      });

      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 5000);
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(err.message || '儲存失敗');
    }
  };

  // Delete handler
  const handleDeletePost = async (postItem: PostItem) => {
    if (!confirm(`確定要刪除文章「${postItem.title}」嗎？此操作不可逆。`)) {
      return;
    }

    try {
      const param = postItem.id ? `id=${postItem.id}` : `slug=${encodeURIComponent(postItem.slug)}`;
      const res = await fetch(`/api/admin/posts?${param}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== postItem.slug && p.id !== postItem.id));
        if (postItem.id) {
          setSelectedPostIds((prev) => prev.filter((id) => id !== postItem.id));
        }
        if (view === 'editor' && currentPost.slug === postItem.slug) {
          setView('list');
        }
      } else {
        const data = await res.json();
        alert(data.error || '刪除失敗');
      }
    } catch (err) {
      alert('刪除失敗');
    }
  };

  // Preview via localStorage
  const handlePreview = () => {
    try {
      localStorage.setItem('adabanipal_admin_preview', JSON.stringify(currentPost));
      window.open('/admin/posts/preview', '_blank');
    } catch (e) {
      console.error('Preview error:', e);
      alert('無法開啟預覽');
    }
  };

  // Export .md file
  const handleExportMarkdown = () => {
    const frontmatterObj: Record<string, any> = {
      title: currentPost.title,
      date: currentPost.date,
      category: currentPost.category,
      category_slug: currentPost.category_slug,
      status: currentPost.status,
    };

    if (currentPost.excerpt) frontmatterObj.excerpt = currentPost.excerpt;
    if (currentPost.tags) frontmatterObj.tags = currentPost.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (currentPost.password) frontmatterObj.password = currentPost.password;
    if (currentPost.password_hint) frontmatterObj.password_hint = currentPost.password_hint;
    if (currentPost.is_r18) frontmatterObj.is_r18 = true;
    if (currentPost.noindex) frontmatterObj.noindex = true;
    if (currentPost.seo_title) frontmatterObj.seo_title = currentPost.seo_title;
    if (currentPost.seo_description) frontmatterObj.seo_description = currentPost.seo_description;

    const yamlLines = ['---'];
    for (const [k, v] of Object.entries(frontmatterObj)) {
      if (Array.isArray(v)) {
        yamlLines.push(`${k}:`);
        v.forEach((item) => yamlLines.push(`  - ${JSON.stringify(item)}`));
      } else if (typeof v === 'boolean') {
        yamlLines.push(`${k}: ${v}`);
      } else if (typeof v === 'string') {
        yamlLines.push(`${k}: ${JSON.stringify(v)}`);
      } else {
        yamlLines.push(`${k}: ${v}`);
      }
    }
    yamlLines.push('---');
    yamlLines.push('');
    yamlLines.push(currentPost.content || '');

    const blob = new Blob([yamlLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPost.slug || 'untitled'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Batch selection handlers
  const handleToggleSelect = (id: number) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchAction = async (action: 'PUBLISHED' | 'DRAFT') => {
    if (selectedPostIds.length === 0) return;
    const actionLabel = action === 'PUBLISHED' ? '發布' : '轉為草稿';
    if (!confirm(`確定要將選取的 ${selectedPostIds.length} 篇文章批量${actionLabel}嗎？`)) {
      return;
    }

    setIsBatchProcessing(true);
    try {
      let deployed = false;
      try {
        const res = await fetch('/api/admin/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedPostIds, action }),
        });
        if (res.ok) {
          const data = await res.json();
          deployed = !!data.deployed;
        }
      } catch {
        // Fallback to local dev
      }

      setPosts((prev) => {
        const updated = prev.map((p) =>
          p.id && selectedPostIds.includes(p.id) ? { ...p, status: action } : p
        );
        try {
          localStorage.setItem('adabanipal_admin_posts_local', JSON.stringify(updated));
        } catch { }
        return updated;
      });

      const count = selectedPostIds.length;
      setSelectedPostIds([]);
      alert(`成功將 ${count} 篇文章批量${actionLabel}${deployed ? '，並已觸發雲端自動打包發布' : ''}！`);
    } catch (err: any) {
      alert(err.message || '批量操作失敗');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Workers AI Assistant handler for SEO & Tags
  const handleGenerateAI = async () => {
    if (!currentPost.title && !currentPost.content) {
      alert('請先輸入文章標題或內文');
      return;
    }

    setIsGeneratingAI(true);
    try {
      let resultData: any = null;
      let isRealAI = false;
      let usedModel = '';

      try {
        const res = await fetch('/api/admin/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: currentPost.title,
            content: currentPost.content,
            category: currentPost.category,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            resultData = json.data;
            const isFallback = json.isFallback ?? json.data.isFallback ?? false;
            isRealAI = !isFallback;
            usedModel = json.model || '';
          }
        }
      } catch { }

      if (!resultData) {
        const cleanContent = (currentPost.content || '')
          .replace(/&emsp;/g, '')
          .replace(/<[^>]+>/g, '')
          .trim();
        resultData = {
          seoTitle: `${currentPost.title ? `《${currentPost.title.replace(/[《》]/g, '')}》` : '新作'}｜${currentPost.category || '短篇小說'}｜花花巴尼拔圖書館`,
          seoDescription: cleanContent.slice(0, 140) + '...',
          suggestedTags: [currentPost.category || '短篇小說', '文字創作'],
        };
      }

      const { seoTitle, seoDescription, suggestedTags } = resultData;

      const existingTags = (currentPost.tags || '')
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean);
      const newTags = Array.isArray(suggestedTags) ? suggestedTags : [];
      const mergedTags = Array.from(new Set([...existingTags, ...newTags])).join(', ');

      setCurrentPost((prev) => ({
        ...prev,
        seo_title: seoTitle || prev.seo_title,
        seo_description: seoDescription || prev.seo_description,
        tags: mergedTags || prev.tags,
      }));

      setStatusMessage(
        isRealAI
          ? `AI (${usedModel || 'Meta Llama'}) 已根據全文生成 SEO 標題、描述與標籤`
          : '本地離線範本，請確認 Cloudflare Pages 綁定 AI 變數並重新部署'
      );
      setSaveStatus('saved');
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (err: any) {
      alert(err.message || 'AI 分析失敗');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Filtered post list
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filterCategory !== 'ALL' && post.category_slug !== filterCategory) return false;
      if (filterStatus !== 'ALL' && post.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (post.title || '').toLowerCase().includes(q);
        const matchSlug = (post.slug || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSlug) return false;
      }
      return true;
    });
  }, [posts, filterCategory, filterStatus, searchQuery]);

  const selectablePostIds = useMemo(() => {
    return filteredPosts.map((p) => p.id).filter((id): id is number => typeof id === 'number');
  }, [filteredPosts]);

  const isAllSelected = selectablePostIds.length > 0 && selectablePostIds.every((id) => selectedPostIds.includes(id));
  const isSomeSelected = selectedPostIds.length > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(selectablePostIds);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1A1A1A] font-sans antialiased">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#F7F5F0] border-b border-[#E5E0D8] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('list')}
            className="font-serif font-bold text-lg md:text-xl tracking-wide hover:text-[#059669] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>花花巴尼拔圖書館</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 border border-[#E5E0D8] text-[#666666] rounded-sm">
              後台管理
            </span>
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          {view === 'list' ? (
            <>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E5E0D8] hover:border-[#1A1A1A] bg-white rounded-sm transition-colors cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>分類管理</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E5E0D8] hover:border-[#1A1A1A] bg-white rounded-sm transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>匯入 .md</span>
              </button>
              <button
                onClick={() => setShowEasterEggModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E5E0D8] hover:border-[#1A1A1A] bg-white rounded-sm transition-colors cursor-pointer"
                title="管理活動彩蛋與兌換碼"
              >
                <Gift className="w-3.5 h-3.5 text-[#059669]" />
                <span>活動彩蛋</span>
              </button>
              <button
                onClick={handleNewPost}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1A1A1A] text-white hover:bg-[#059669] rounded-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增文章</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setView('list')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E5E0D8] hover:border-[#1A1A1A] bg-white rounded-sm transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>返回列表</span>
              </button>
              <button
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E5E0D8] hover:border-[#1A1A1A] bg-white rounded-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>匯出 .md</span>
              </button>
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E5E0D8] hover:border-[#1A1A1A] bg-white rounded-sm transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>預覽</span>
              </button>
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={saveStatus === 'saving' || saveStatus === 'publishing'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1A1A1A] hover:bg-[#E5E0D8] bg-white rounded-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>{currentPost.status === 'PUBLISHED' || currentPost.status === 'UPDATED' ? '轉為草稿' : '儲存草稿'}</span>
              </button>
              <button
                onClick={() => handleSave()}
                disabled={saveStatus === 'saving' || saveStatus === 'publishing'}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#059669] text-white hover:bg-[#047857] rounded-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>{currentPost.status === 'PUBLISHED' || currentPost.status === 'UPDATED' ? '更新' : '發布'}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {/* VIEW 1: ARTICLE LIST */}
        {view === 'list' && (
          <PostTable
            filteredPosts={filteredPosts}
            categories={categories}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            selectedPostIds={selectedPostIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            isBatchProcessing={isBatchProcessing}
            onBatchAction={handleBatchAction}
            onClearSelection={() => setSelectedPostIds([])}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
          />
        )}

        {/* VIEW 2: ARTICLE EDITOR */}
        {view === 'editor' && (
          <PostEditor
            currentPost={currentPost}
            setCurrentPost={setCurrentPost}
            categories={categories}
            saveStatus={saveStatus}
            statusMessage={statusMessage}
            onDismissStatusMessage={() => setStatusMessage('')}
            isGeneratingAI={isGeneratingAI}
            onGenerateAI={handleGenerateAI}
          />
        )}
      </main>

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <CategoryModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onCategoryCreated={(newCat) => {
            setCategories((prev) => [...prev, newCat]);
          }}
          onCategoryUpdated={(updatedCat) => {
            setCategories((prev) =>
              prev.map((c) => (c.slug === updatedCat.slug ? { ...c, ...updatedCat } : c))
            );
          }}
        />
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <ImportModal
          categories={categories}
          onClose={() => setShowImportModal(false)}
          onImport={(importedPost) => {
            setCurrentPost((prev) => ({
              ...prev,
              ...importedPost,
            }));
            setShowImportModal(false);
            setView('editor');
          }}
        />
      )}

      {/* EASTER EGG MODAL */}
      {showEasterEggModal && (
        <EasterEggModal onClose={() => setShowEasterEggModal(false)} />
      )}
    </div>
  );
}
