import React, { useEffect, useState } from 'react';
import { ArticleRenderer } from '../pages/ArticleRenderer';
import { ArticleControls } from '../pages/ArticleControls';
import { ArticleAgeGate } from '../pages/ArticleAgeGate';
import { PostItem } from './AdminPostsApp';
import { Lock, X } from 'lucide-react';

export function AdminPreviewApp() {
  const [post, setPost] = useState<PostItem | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('adabanipal_admin_preview');
      if (saved) {
        setPost(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load preview post:', e);
    }
  }, []);

  if (!post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-6 text-center font-mono">
        <p className="text-sm text-ink/70 mb-4">[ 尚無預覽資料。請在編輯器中點擊「預覽」以載入。 ]</p>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 border-2 border-ink text-xs font-bold hover:bg-ink hover:text-white transition-colors cursor-pointer"
        >
          關閉分頁
        </button>
      </div>
    );
  }

  const processedContent = (post.content || '').replace(/\n\n\n+/g, (match: string) => {
    const newlineCount = (match.match(/\n/g) || []).length;
    return '\n\n' + '&nbsp;\n\n'.repeat(newlineCount - 2);
  });

  return (
    <div className="flex flex-col bg-[#FFFDF9] min-h-full">
      {/* Top Banner: Floating Preview Ribbon */}
      <div className="bg-[#1A1A1A] text-white px-4 md:px-12 py-2 flex items-center justify-between text-xs font-mono border-b-2 border-ink">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          <span>[ 1:1 訪客真實預覽模式 ]</span>
          <span className="opacity-50">|</span>
          <span className="opacity-80">DOC: {post.slug || 'untitled'}</span>
        </div>
        <button
          onClick={() => window.close()}
          className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>關閉預覽</span>
        </button>
      </div>

      {/* Sticky Bar: Mirroring [slug].astro */}
      <div className="sticky top-0 bg-ink text-white z-20 flex items-center justify-between p-4 px-6 md:px-12 border-b-4 border-ink">
        <div className="font-mono text-sm font-bold flex items-center gap-2">
          <span className="bg-white text-ink w-6 h-6 flex items-center justify-center rounded-sm">&lt;</span>
          <span>{post.category || '散文隨筆'}</span>
        </div>
        <div className="font-mono text-xs font-bold opacity-80">DOC: {post.slug || 'untitled'}</div>
      </div>

      {/* Main Reading Container: Exact 1:1 Replica of [slug].astro */}
      <div className="flex-1 max-w-3xl w-full p-6 md:p-12 pb-32">
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center justify-center px-2 py-1 bg-accent text-white font-mono text-xs font-bold leading-none">
              {post.category || '散文隨筆'}
            </span>
            <span className="inline-flex items-center justify-center px-2 py-1 border-2 border-ink text-ink font-mono text-xs font-bold leading-none">
              {(post.date || '').slice(0, 10).replace(/-/g, '.')}
            </span>
            {post.status === 'UPDATED' && (
              <span className="inline-flex items-center justify-center px-2 py-1 bg-ink text-accent font-mono text-xs font-bold leading-none">
                UPDATED
              </span>
            )}
            {post.password && (
              <span className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-[#D9453B] text-white font-mono text-xs font-bold leading-none">
                <Lock className="w-3 h-3" />
                LOCKED
              </span>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-black text-ink leading-snug mb-8">
            {post.title || '無標題'}
          </h1>

          {/* Real Article Controls (Text size & Alignment) */}
          <ArticleControls slug={post.slug || 'preview'} />
        </header>

        {/* Real Article Typography */}
        <article
          id="article-content"
          className="prose prose-stone max-w-none text-ink leading-loose font-serif tracking-wide font-medium prose-p:my-6 prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-ink-light prose-blockquote:before:content-none prose-blockquote:after:content-none prose-strong:text-ink prose-strong:font-black prose-h2:scroll-mt-24 prose-h3:scroll-mt-24 prose-a:text-accent prose-a:underline prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:decoration-accent/50 prose-lg prose-layout-left"
        >
          {post.is_r18 ? (
            <ArticleAgeGate post={post} processedContent={processedContent} />
          ) : (
            <ArticleRenderer processedContent={processedContent} />
          )}
        </article>

        {/* Real Article Footer */}
        <footer className="mt-24 pt-8 border-t-4 border-ink text-center flex flex-col items-center gap-4 relative">
          <div className="flex items-center justify-center gap-8 w-full max-w-sm mx-auto">
            <div className="w-8 h-8 rounded-full border-4 border-ink flex items-center justify-center shrink-0">
              <div className="w-2 h-2 bg-accent"></div>
            </div>
          </div>
          <div className="flex flex-col gap-2" id="article-end-marker" data-slug={post.slug}>
            <span className="font-mono text-xs font-bold text-ink/70">
              [ END OF TRANSMISSION ]
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
