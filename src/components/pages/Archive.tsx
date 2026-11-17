import { useState } from "react";
import { CategoryDropdown } from "../../components/CategoryDropdown";
import { getPostUrl, type Post, type CategoryInfo } from "../../lib/content";

interface ArchiveProps {
  posts: Post[];
  categories: CategoryInfo[];
  currentCategorySlug: string | null;
  currentCategoryName: string | null;
  totalCount: number;
}

export function Archive({
  posts,
  categories,
  currentCategorySlug,
  currentCategoryName,
  totalCount
}: ArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
      (post.tags && post.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="p-0 flex flex-col h-full min-h-full max-w-5xl mx-auto w-full">
      <header className="px-6 md:px-8 pt-10 md:pt-14 pb-8 relative z-50" style={{ viewTransitionName: 'archive-header' }}>
        <h1 className="font-serif text-4xl font-semibold mb-3">
          文章
        </h1>
        <p className="font-sans text-ink-light max-w-xl mb-8">
          共 {posts.length} 篇。收錄所有 SEO、內容策略與行銷自動化實務文章。
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-black/15 pt-6">
          <CategoryDropdown
            categories={categories}
            currentSlug={currentCategorySlug}
            currentName={currentCategoryName}
            totalCount={totalCount}
          />

          <div className="flex justify-end items-center min-h-[36px]">
            {isSearchOpen || searchQuery ? (
              <div className="flex items-center w-full sm:w-[240px] animate-in fade-in slide-in-from-right-4 duration-200">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setIsSearchOpen(false) }}
                  placeholder="搜尋文章…"
                  className="w-full bg-transparent border-b border-ink/30 text-ink font-sans py-1 text-sm focus:border-ink focus:outline-none transition-colors placeholder-ink/40"
                />
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="opacity-50 hover:opacity-100 transition-opacity p-2 flex items-center justify-center"
                title="搜尋文章"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col px-6 md:px-8 pb-16">
        {filteredPosts.length === 0 ? (
          <div className="py-12 font-sans text-ink text-lg text-center opacity-50">
            沒有符合的文章。
          </div>
        ) : (
          filteredPosts.map((post) => (
            <a
              key={post.slug}
              href={getPostUrl(post)}
              className="group block border-t border-black/15 last:border-b"
            >
              <div className="grid md:grid-cols-[110px_1fr_110px] gap-1 md:gap-7 py-6 md:items-baseline">
                <span className="font-sans text-xs tracking-[0.14em] text-accent">
                  {post.category}
                </span>

                <h3 className="font-serif text-2xl font-semibold leading-snug group-hover:text-accent transition-colors">
                  {post.title}
                </h3>

                <span className="font-sans text-xs text-ink-light md:text-right">
                  {post.date.slice(0, 10).replace(/-/g, '.')}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
