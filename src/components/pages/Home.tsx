
import { useState, useEffect } from "react";
import { Redacted } from "../../components/Redacted";
import { ScrambleText } from "../../components/ScrambleText";
import { getRecentPosts, getPostUrl, type PostMeta } from "../../lib/content";

import { cn } from "../../lib/utils";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "STATUS: PUBLISHED", className: "bg-ink text-white group-hover:bg-white group-hover:text-ink" },
  UPDATED: { label: "STATUS: UPDATED", className: "border-2 border-ink text-ink group-hover:border-white group-hover:text-white" },
  DRAFT: { label: "STATUS: DRAFT", className: "border-2 border-ink/50 text-ink/50 group-hover:border-white/50 group-hover:text-white/50" },
};

function PostCard({ post, variant }: { post: PostMeta; variant: "accent" | "ink" }) {
  const status = STATUS_STYLE[post.status] || STATUS_STYLE.PUBLISHED;
  return (
    <article className={cn(
      "brutalist-block p-6 group transition-colors",
      variant === "accent" ? "hover:bg-accent hover:border-accent" : "hover:bg-ink"
    )}>
      <a href={getPostUrl(post)} className="block space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-2">
          <span className={cn("font-mono text-xs font-bold px-2 py-1 break-words max-w-[70%]", status.className)}>
            {status.label}
          </span>
          <span className="font-mono text-xs font-bold text-ink-light group-hover:text-white/80 shrink-0">
            {post.date.slice(0, 10).replace(/-/g, '.')}
          </span>
        </div>
        <h3 className={cn(
          "font-serif text-2xl font-bold transition-colors",
          variant === "accent" ? "group-hover:text-white" : "group-hover:text-accent"
        )}>
          {post.title}
        </h3>
        <p className="font-sans text-sm font-bold text-ink-light group-hover:text-white/90 line-clamp-3">
          {post.excerpt}
        </p>
      </a>
    </article>
  );
}

export function Home() {
  // Use defaults for homepage

  const recentPosts = getRecentPosts(2);
  const variants: ("accent" | "ink")[] = ["accent", "ink"];

  const handleDotClick = () => {
    try {
      localStorage.setItem("newsletter_dot_dismissed", "true");
      document.documentElement.classList.add("dot-dismissed");
    } catch {}
    window.dispatchEvent(new CustomEvent("open-newsletter"));
  };

  return (
    <div className="p-8 md:p-12 xl:p-16 space-y-16 relative min-h-full">
      <section className="space-y-8">
        <button 
          onClick={handleDotClick}
          className="inline-flex items-center gap-2 border-2 border-ink bg-ink text-white font-mono text-xs px-3 py-1 font-bold shadow-[2px_2px_0_0_var(--theme-accent)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_var(--theme-accent)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          aria-label="訂閱通訊"
        >
          <span>SUBSCRIBE_</span>
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse-dot [.dot-dismissed_&]:!hidden" />
        </button>

        <h1 className="font-serif text-3xl md:text-5xl font-black leading-snug">
          歡迎來到<br className="hidden md:block" />
          <ScrambleText text="JOANNE ARCHIVE" />
        </h1>

        <p className="font-sans text-lg md:text-xl font-bold text-ink-light leading-relaxed max-w-2xl border-l-4 border-accent pl-6">
          你好，我是 Joanne。<br />
          專注於現代前端開發、靜態與邊緣混合渲染架構與互動體驗設計。
        </p>
      </section>

      <section className="pt-12 border-t-4 border-ink relative">
        {/* Decorative corner box */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-paper border-2 border-ink"></div>
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-paper border-2 border-ink"></div>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 className="font-mono text-xl font-black uppercase tracking-widest text-ink flex items-center gap-2">
            <span className="w-4 h-4 bg-accent inline-block shadow-[2px_2px_0_0_#0A0A0A]"></span>
            RECENT_FILES
          </h2>
          <a href="/archive" className="brutalist-button px-4 py-2 text-sm shrink-0">
            VIEW_ALL <span className="font-mono ml-2">→</span>
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {recentPosts.map((post, i) => (
            <PostCard key={post.slug} post={post} variant={variants[i % 2]} />
          ))}
        </div>
      </section>

    </div>
  );
}
