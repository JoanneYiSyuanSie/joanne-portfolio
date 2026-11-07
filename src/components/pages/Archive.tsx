import { useState } from "react";
import { ScrambleText } from "../../components/ScrambleText";
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
    <div className="p-0 flex flex-col h-full min-h-full">
      <header className="px-8 py-10 bg-black text-white border-b-4 border-black relative shrink-0 z-50" style={{ viewTransitionName: 'archive-header' }}>
        <h1 className="font-mono text-3xl font-black mb-2 tracking-widest">
          DATABASE <span className="text-accent">___</span>
        </h1>
        <p className="font-sans font-bold opacity-80 max-w-xl mb-6">
          RECORD_COUNT = {posts.length}; // ACCESS: GRANTED
          <br/>選擇你要解密的紀錄。
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CategoryDropdown 
            categories={categories}
            currentSlug={currentCategorySlug}
            currentName={currentCategoryName}
            totalCount={totalCount}
          />
          
          <div className="flex justify-end items-center min-h-[36px]">
            {isSearchOpen || searchQuery ? (
              <div className="flex items-center w-full sm:w-[240px] animate-in fade-in slide-in-from-right-4 duration-200">
                <span className="opacity-50 mr-2 font-mono font-bold text-accent">&gt;_</span>
                <input 
                  autoFocus
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setIsSearchOpen(false) }}
                  placeholder="SEARCH..."
                  className="w-full bg-transparent border-b-2 border-white/30 text-white font-mono py-1 text-xs focus:border-white focus:outline-none transition-colors placeholder-white/30"
                />
              </div>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="opacity-40 hover:opacity-100 transition-opacity p-2 flex items-center justify-center border-2 border-transparent hover:border-white/30"
                title="Search Database"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col pb-8">
        {filteredPosts.length === 0 ? (
          <div className="p-8 font-mono text-ink font-bold text-lg text-center opacity-50">
            NO_RECORDS_FOUND
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <a 
              key={post.slug} 
              href={getPostUrl(post)}
              className="group block border-b-4 border-ink relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center py-6 px-8 gap-4">
                <div className="font-mono text-xs font-black w-12 shrink-0 group-hover:text-white transition-colors">
                  #{(index + 1).toString().padStart(3, '0')}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h3 className="font-serif text-2xl font-black group-hover:text-white transition-colors mb-2 md:mb-0">
                    <ScrambleText text={post.title} />
                  </h3>
                </div>
                
                <div className="flex items-center gap-3 font-mono text-xs font-bold tracking-widest shrink-0 mt-2 md:mt-0">
                  <span className="px-2 py-1 bg-ink text-white group-hover:bg-white group-hover:text-ink transition-colors">
                    {post.category}
                  </span>
                  <span className="w-24 text-right group-hover:text-white transition-colors hidden sm:block">
                    {post.status}
                  </span>
                  <span className="w-24 text-right group-hover:text-white transition-colors">
                    {post.date.slice(0, 10).replace(/-/g, '.')}
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
      
      <div className="p-8 text-center bg-gray-100 font-mono text-xs font-bold text-ink-light">
        [ END OF INDEX ]
      </div>
    </div>
  );
}
