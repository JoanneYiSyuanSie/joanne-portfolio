import { useState, useEffect } from "react";
import { ScrambleText } from "./ScrambleText";
import { cn } from "../lib/utils";

// 根據 Threads API 的資料結構定義 Type
interface ThreadPost {
  id: string;
  text: string;
  timestamp: string;
  media_type: "TEXT_POST" | "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  permalink: string;
  username: string;
  media_url?: string;
}

function ThreadItem({ post }: { post: ThreadPost }) {
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const [logId, setLogId] = useState("");

  useEffect(() => {
    const date = new Date(post.timestamp);
    const dateStr = date.toLocaleDateString("zh-TW", { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
    const timeStr = date.toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '');
    setLogId(`LOG_${dateStr}_${timeStr}`);
  }, [post.timestamp]);

  return (
    <div className="border-l-4 border-ink pl-6 py-2 relative group hover:border-accent transition-colors animate-in fade-in slide-in-from-left-4">
      <span className="absolute -left-[14px] top-4 w-6 h-6 bg-paper border-4 border-ink flex items-center justify-center group-hover:border-accent transition-colors">
        <span className="w-1.5 h-1.5 bg-ink group-hover:bg-accent transition-colors"></span>
      </span>

      <div className="flex justify-between items-start mb-2">
        <div className="font-mono text-xs font-bold text-ink/50 group-hover:text-ink transition-colors">
          <ScrambleText text={logId} />
        </div>
        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[10px] font-bold px-2 py-0.5 border border-ink text-ink hover:bg-ink hover:text-white transition-colors"
          title="View on Threads"
        >
          EXTERNAL_LINK ↗
        </a>
      </div>

      <p className="font-sans font-bold text-ink leading-relaxed text-lg whitespace-pre-wrap">
        {post.text}
      </p>

      {/* Media Handling with Toggle */}
      {post.media_url && (post.media_type === "IMAGE" || post.media_type === "VIDEO") && (
        <div className="mt-4">
          {!mediaExpanded ? (
            <button
              onClick={() => setMediaExpanded(true)}
              className="font-mono text-xs font-bold text-accent border border-accent px-3 py-1 hover:bg-accent hover:text-white transition-colors"
            >
              [ + EXPAND_ATTACHED_MEDIA ]
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setMediaExpanded(false)}
                className="font-mono text-xs font-bold text-ink/50 hover:text-ink transition-colors"
              >
                [ - COLLAPSE_MEDIA ]
              </button>

              {post.media_type === "IMAGE" && (
                <div className="border-4 border-ink shadow-[4px_4px_0_0_#0A0A0A] max-w-md overflow-hidden bg-white">
                  <img src={post.media_url} alt="Threads media" className="w-full h-auto object-cover" />
                </div>
              )}

              {post.media_type === "VIDEO" && (
                <div className="border-4 border-ink shadow-[4px_4px_0_0_#0A0A0A] max-w-md overflow-hidden bg-black aspect-video flex items-center justify-center relative">
                  <video src={post.media_url} controls className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-ink text-white font-mono text-[10px] px-1 font-bold">VIDEO_DATA</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {post.media_type === "CAROUSEL_ALBUM" && (
        <div className="mt-4 font-mono text-xs font-bold text-accent">
          [ ATTACHED_ALBUM: <a href={post.permalink} target="_blank" rel="noreferrer" className="underline hover:bg-accent hover:text-white">CLICK_TO_VIEW_EXTERNAL</a> ]
        </div>
      )}
    </div>
  );
}

const CACHE_KEY = "joanne_signals_cache_v1";

const MOCK_SIGNALS: ThreadPost[] = [
  {
    id: "sig_1",
    text: "完成了 Core Web Vitals 與靜態載入效能優化測試，Lighthouse Performance 與 SEO 雙雙達到滿分 ✨",
    timestamp: new Date().toISOString(),
    media_type: "TEXT_POST",
    permalink: "https://github.com/JoanneYiSyuanSie/joanne-portfolio",
    username: "joanneyisyuansie"
  },
  {
    id: "sig_2",
    text: "重構網站內容分類學（Taxonomy）與內部連結結構，並配置規範化語意 URL 與麵包屑導航。",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    media_type: "TEXT_POST",
    permalink: "https://github.com/JoanneYiSyuanSie/joanne-portfolio",
    username: "joanneyisyuansie"
  },
  {
    id: "sig_3",
    text: "實裝並率先導入 llms.txt 規範，方便 ChatGPT Search 與 Perplexity 等生成式 AI 搜尋引擎檢索引用。",
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    media_type: "TEXT_POST",
    permalink: "https://github.com/JoanneYiSyuanSie/joanne-portfolio",
    username: "joanneyisyuansie"
  }
];

export function ThreadsFeed() {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (!forceRefresh) {
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            setPosts(JSON.parse(cached));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("sessionStorage access blocked:", e);
        }
      }

      const response = await fetch("/api/threads");

      if (!response.ok) {
        throw new Error("API not configured or unavailable");
      }

      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        setPosts(data.data);
      } else {
        setPosts(MOCK_SIGNALS);
      }
    } catch (err: any) {
      // Fallback to mock developer signals for demo mode
      setPosts(MOCK_SIGNALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-l-4 border-ink pl-6 py-2 relative animate-pulse opacity-50">
            <span className="absolute -left-[14px] top-4 w-6 h-6 bg-paper border-4 border-ink flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-ink"></span>
            </span>
            <div className="h-4 bg-ink w-48 mb-4"></div>
            <div className="h-4 bg-ink w-full mb-2"></div>
            <div className="h-4 bg-ink w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-l-4 border-[#D9453B] pl-6 py-4 relative bg-[#D9453B]/5 pb-8">
        <span className="absolute -left-[14px] top-5 w-6 h-6 bg-paper border-4 border-[#D9453B] flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-[#D9453B]"></span>
        </span>
        <div className="font-mono text-xs font-bold text-[#D9453B] mb-2">
          [ CONNECTION_ERROR ]
        </div>
        <p className="font-sans font-bold text-[#D9453B]">{error}</p>
        <p className="font-sans text-sm font-bold text-ink/70 mt-2">
          可能原因：API Token 尚未設定。
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="border-l-4 border-ink pl-6 py-4 relative pb-8">
        <span className="absolute -left-[14px] top-5 w-6 h-6 bg-paper border-4 border-ink flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-ink"></span>
        </span>
        <p className="font-sans font-bold text-ink">目前沒有任何訊號傳入...</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex justify-end mb-8">
        <button
          onClick={() => fetchThreads(true)}
          className="font-mono text-[10px] font-bold text-ink border-2 border-ink px-4 py-2 bg-white hover:bg-ink hover:text-white transition-colors shadow-[2px_2px_0_0_#0A0A0A] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          [ REFRESH_SIGNAL ]
        </button>
      </div>
      <div className="space-y-8 max-w-3xl">
        {posts.map((post) => (
          <ThreadItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
