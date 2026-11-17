import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import type { CategoryInfo } from "../lib/content";

interface CategoryDropdownProps {
  categories: CategoryInfo[];
  currentSlug: string | null;
  currentName: string | null;
  totalCount: number;
}

export function CategoryDropdown({
  categories,
  currentSlug,
  currentName,
  totalCount,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Clear any legacy sessionStorage on mount
  useEffect(() => {
    try {
      sessionStorage.removeItem("category_dropdown_open");
    } catch {}
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = currentName || "全部";
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={cn(
          "font-mono text-xs px-4 py-2 border transition-colors cursor-pointer flex items-center gap-2",
          isOpen
            ? "bg-white text-ink border-white"
            : "bg-transparent border-white/40 text-white hover:border-white"
        )}
      >
        <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 6l4 14M12 6v14M8 8v12M4 4v16" />
        </svg>
        {currentName && <span className="opacity-60 font-black">/</span>}
        {currentName && <span>{currentName}</span>}
        <span className="ml-1 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-black/15 shadow-lg p-2 min-w-[280px] sm:w-max max-w-[90vw] animate-modal-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {/* "全部" option */}
            <a
              href={`${base}/archive`}
              className={cn(
                "font-mono text-xs px-3 py-2 transition-colors block whitespace-nowrap truncate",
                currentSlug === null
                  ? "text-accent font-bold"
                  : "text-ink hover:bg-black/5"
              )}
            >
              ./全部 <span className="opacity-60">({totalCount})</span>
            </a>

            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`${base}/archive/${cat.slug}`}
                className={cn(
                  "font-mono text-xs px-3 py-2 transition-colors block whitespace-nowrap truncate",
                  currentSlug === cat.slug
                    ? "text-accent font-bold"
                    : "text-ink hover:bg-black/5"
                )}
              >
                ./{cat.name} <span className="opacity-60">({cat.count})</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
