import { useState, useEffect } from "react";
import { Redacted } from "../../components/Redacted";
import { getRecentPosts, getPostUrl, type PostMeta } from "../../lib/content";

function PostCard({ post, index }: { post: PostMeta; index: number }) {
  return (
    <article className="border-t border-black/15">
      <a href={getPostUrl(post)} className="group flex items-baseline gap-4 py-5">
        <span className="font-mono text-xs text-ink-light shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-sans text-xl font-bold leading-snug group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          <p className="font-sans text-sm text-ink-light leading-relaxed mt-1 line-clamp-2">
            {post.excerpt}
          </p>
        </div>
        <span className="font-mono text-xs text-ink-light shrink-0 hidden sm:block">
          {post.date.slice(0, 10).replace(/-/g, '.')}
        </span>
      </a>
    </article>
  );
}

export function Home() {
  // Use defaults for homepage

  const recentPosts = getRecentPosts(2);

  const handleDotClick = () => {
    try {
      localStorage.setItem("newsletter_dot_dismissed", "true");
      document.documentElement.classList.add("dot-dismissed");
    } catch {}
    window.dispatchEvent(new CustomEvent("open-newsletter"));
  };

  return (
    <div className="px-8 md:px-12 xl:px-16 pt-8 md:pt-12 xl:pt-16 space-y-16 relative min-h-full">
      <section className="space-y-6">
        <button
          onClick={handleDotClick}
          className="inline-flex items-center gap-2 bg-ink text-white font-mono text-xs px-3 py-2 font-bold hover:bg-accent transition-colors cursor-pointer"
          aria-label="訂閱通訊"
        >
          <span>SUBSCRIBE_</span>
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse-dot [.dot-dismissed_&]:!hidden" />
        </button>

        <h1 className="font-sans text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
          JOANNE'S<br />JOURNAL
        </h1>

        <p className="font-sans text-base md:text-lg text-ink leading-relaxed max-w-2xl">
          你好，我是 Joanne。<br />
          具備 2 年以內行銷經驗。<br />
          這是我為了深入實踐 Technical SEO、Core Web Vitals 與行銷自動化而親手搭建的成果展示站。
        </p>
      </section>

      <section className="pt-10 border-t border-black/15">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
          <h2 className="font-sans text-xl font-bold">
            最近文章
          </h2>
          <a href={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/archive`} className="font-sans text-sm font-bold text-ink hover:text-accent transition-colors shrink-0">
            全部文章 →
          </a>
        </div>

        <div className="border-b border-black/15">
          {recentPosts.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </div>

        {/* Bottom spacer: fixed gap below the list — the parent's bottom padding is lost when the scroll area overflows */}
        <div aria-hidden="true" className="h-8 md:h-12 xl:h-16" />
      </section>

    </div>
  );
}
