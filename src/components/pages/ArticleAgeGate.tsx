import { useState } from "react";
import { ArticleRenderer } from "./ArticleRenderer";

export function ArticleAgeGate({ post, processedContent }: { post: any; processedContent: string }) {
  const [isAgreed, setIsAgreed] = useState(false);

  if (isAgreed) {
    return <ArticleRenderer processedContent={processedContent} />;
  }

  return (
    <div className="my-12 w-full p-8 md:p-12 border border-[#E5E0D8] bg-white/80 rounded-xs text-center font-sans">
      <div className="inline-block px-2 py-0.5 border border-[#1A1A1A] text-[#1A1A1A] font-mono text-xs font-bold mb-3">
        R18
      </div>

      <h3 className="font-serif font-bold text-base text-[#1A1A1A] mb-2">
        可能包含敏感題材
      </h3>

      <p className="text-xs text-[#666666] mb-6 leading-relaxed">
        本篇文章可能存在不適合未成年人閱讀之內容，包含但不限於：色情、暴力、具有爭議性或令人不適的描述或主題。<br />
        文章內容為虛構，且不等同於作者立場或價值觀。點擊繼續閱讀即視同您已成年，且理解並接受上述條件。
      </p>

      <button
        onClick={() => setIsAgreed(true)}
        className="px-6 py-2.5 bg-accent text-white hover:opacity-90 text-xs font-medium rounded-xs transition-all cursor-pointer"
      >
        我已年滿 18 歲，開始閱讀
      </button>
    </div>
  );
}
