import { useState, useEffect } from "react";
import { AlignLeft, AlignJustify } from "lucide-react";
import { cn } from "../../lib/utils";
import { trackEvent } from "../../lib/analytics";

type TextSize = "sm" | "md" | "lg";
type LayoutAlign = "left" | "justify";

export function ArticleControls({ slug }: { slug: string }) {
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [layoutAlign, setLayoutAlign] = useState<LayoutAlign>("left");
  const [isClient, setIsClient] = useState(false);

  // Load saved preferences
  useEffect(() => {
    setIsClient(true);
    const savedAlign = localStorage.getItem("joanne_layout_align") as LayoutAlign | null;
    if (savedAlign === "left" || savedAlign === "justify") {
      setLayoutAlign(savedAlign);
    }
  }, []);

  // Apply classes to the article container outside of React
  useEffect(() => {
    const article = document.getElementById("article-content");
    if (!article) return;

    // Remove old classes
    article.classList.remove("prose-base", "prose-lg", "prose-xl", "prose-layout-justify", "prose-layout-left");

    // Add new classes
    const sizeClass = textSize === "sm" ? "prose-base" : textSize === "md" ? "prose-lg" : "prose-xl";
    const alignClass = layoutAlign === "justify" ? "prose-layout-justify" : "prose-layout-left";
    
    article.classList.add(sizeClass, alignClass);
  }, [textSize, layoutAlign, isClient]);

  const handleSetLayoutAlign = (align: LayoutAlign) => {
    setLayoutAlign(align);
    localStorage.setItem("joanne_layout_align", align);
    trackEvent("change_layout_align", { align, slug });
  };

  const handleSetTextSize = (size: TextSize) => {
    setTextSize(size);
    trackEvent("change_text_size", { size, slug });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-6">
      <div className="flex items-center gap-2">
        <span className="font-sans text-xs text-ink-light">字體大小</span>
        <div className="flex bg-black/5 border border-black/15 p-1">
          {(["sm", "md", "lg"] as TextSize[]).map((size) => (
            <button
              key={size}
              onClick={() => handleSetTextSize(size)}
              className={cn(
                "w-8 h-8 flex items-center justify-center font-sans font-bold text-sm transition-colors cursor-pointer",
                textSize === size ? "bg-accent text-white" : "text-ink hover:bg-ink/10"
              )}
              aria-label={`Set text size to ${size}`}
            >
              {size === "sm" ? "S" : size === "md" ? "M" : "L"}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <span className="font-sans text-xs text-ink-light">對齊</span>
        <div className="flex bg-black/5 border border-black/15 p-1">
          <button
            onClick={() => handleSetLayoutAlign("left")}
            className={cn(
              "w-8 h-8 flex items-center justify-center transition-colors cursor-pointer",
              layoutAlign === "left" ? "bg-accent text-white" : "text-ink hover:bg-ink/10"
            )}
            aria-label="Align text left"
            title="靠左對齊（自然排版）"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSetLayoutAlign("justify")}
            className={cn(
              "w-8 h-8 flex items-center justify-center transition-colors cursor-pointer",
              layoutAlign === "justify" ? "bg-accent text-white" : "text-ink hover:bg-ink/10"
            )}
            aria-label="Justify text"
            title="兩端對齊（方正對齊）"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
