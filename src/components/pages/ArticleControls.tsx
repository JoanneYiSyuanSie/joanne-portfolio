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
    const savedAlign = localStorage.getItem("adabanipal_layout_align") as LayoutAlign | null;
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
    localStorage.setItem("adabanipal_layout_align", align);
    trackEvent("change_layout_align", { align, slug });
  };

  const handleSetTextSize = (size: TextSize) => {
    setTextSize(size);
    trackEvent("change_text_size", { size, slug });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-6">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-ink/70">TEXT_SIZE:</span>
        <div className="flex bg-ink/5 border-2 border-ink p-1">
          {(["sm", "md", "lg"] as TextSize[]).map((size) => (
            <button
              key={size}
              onClick={() => handleSetTextSize(size)}
              className={cn(
                "w-8 h-8 flex items-center justify-center font-mono font-bold text-sm transition-colors cursor-pointer",
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
        <span className="font-mono text-xs font-bold text-ink/70">ALIGN:</span>
        <div className="flex bg-ink/5 border-2 border-ink p-1">
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

      <div className="w-full sm:w-auto h-2 bg-ink flex-1 sm:ml-4 hidden sm:block"></div>
    </div>
  );
}
