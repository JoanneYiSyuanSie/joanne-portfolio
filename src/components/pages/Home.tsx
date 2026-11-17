import { useState, useEffect } from "react";
import { Redacted } from "../../components/Redacted";
import { getRecentPosts, getPostUrl, type PostMeta } from "../../lib/content";

function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="border-t border-black/15">
      <a href={getPostUrl(post)} className="group grid md:grid-cols-[110px_1fr_110px] gap-1 md:gap-7 py-6 md:items-baseline">
        <span className="font-sans text-xs tracking-[0.14em] text-accent">
          {post.category}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-2xl font-semibold leading-snug group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          <p className="font-sans text-sm text-ink-light leading-relaxed mt-2 line-clamp-2">
            {post.excerpt}
          </p>
        </div>
        <span className="font-sans text-xs text-ink-light md:text-right">
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
    <div className="px-6 md:px-8 pt-10 md:pt-14 pb-16 max-w-5xl mx-auto w-full">
      <section>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-snug">
          你好，我是 Joanne。
        </h1>

        <p className="font-sans text-base md:text-lg text-ink leading-relaxed max-w-2xl mt-6">
          具備 2 年以內行銷經驗。<br />
          這是我為了深入實踐 Technical SEO、Core Web Vitals 與行銷自動化而親手搭建的成果展示站。
        </p>

        <button
          onClick={handleDotClick}
          className="mt-8 inline-flex items-center gap-2 border border-ink bg-transparent text-ink font-sans text-sm px-4 py-2 font-bold hover:bg-ink hover:text-white transition-colors cursor-pointer"
          aria-label="訂閱通訊"
        >
          <span>訂閱電子報</span>
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse-dot [.dot-dismissed_&]:!hidden" />
        </button>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-ink pt-3 mb-2">
          <h2 className="font-serif text-2xl font-semibold">
            最近文章
          </h2>
          <a href={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/archive`} className="font-sans text-sm text-accent hover:text-ink transition-colors shrink-0">
            全部文章 →
          </a>
        </div>

        <div className="border-b border-black/15">
          {recentPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

    </div>
  );
}
