import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { NewsletterModal } from "./NewsletterModal";

const NAV_ITEMS = [
  { path: "/", label: "大廳" },
  { path: "/archive", label: "文章" },
  { path: "/social", label: "動態" },
  { path: "/commission", label: "合作" },
  { path: "/about", label: "關於" },
];

interface LayoutProps {
  children?: React.ReactNode;
  currentPath: string;
}

export function Layout({ children, currentPath }: LayoutProps) {
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  // Listen for global open-newsletter events
  useEffect(() => {
    const handleOpen = () => setIsNewsletterModalOpen(true);
    window.addEventListener("open-newsletter", handleOpen as EventListener);
    return () => window.removeEventListener("open-newsletter", handleOpen as EventListener);
  }, []);

  // Auto-open newsletter modal if URL contains ?subscribe=true or #subscribe
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("subscribe") === "true" || window.location.hash === "#subscribe") {
        setIsNewsletterModalOpen(true);
      }
    }
  }, []);

  const [lastVisited, setLastVisited] = useState<{ [key: string]: string }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('lastVisited');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn("sessionStorage access blocked:", e);
      }
    }
    return {
      "/archive": "/archive",
      "/social": "/social",
      "/commission": "/commission",
      "/about": "/about",
    };
  });

  // Track and remember the last sub-path visited for each section
  useEffect(() => {
    const sections = ["/archive", "/social", "/commission", "/about"];
    const currentSection = sections.find(s => currentPath.startsWith(s));

    if (currentSection) {
      setLastVisited(prev => {
        const next = { ...prev, [currentSection]: currentPath };
        try {
          sessionStorage.setItem('lastVisited', JSON.stringify(next));
        } catch (e) {
          console.warn("sessionStorage write blocked:", e);
        }
        return next;
      });
    }
  }, [currentPath]);

  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const withBase = (path: string) => {
    if (path === '/') return base || '/';
    return path.startsWith(base) ? path : `${base}${path}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Magazine masthead */}
      <div className="text-center px-6 pt-10 md:pt-12">
        <a
          href={base || "/"}
          className="font-serif text-[34px] sm:text-[44px] md:text-[54px] font-semibold leading-none tracking-tight text-ink"
        >
          Joanne's Journal
        </a>
        <p className="mt-3 text-[10px] sm:text-xs tracking-[0.14em] sm:tracking-[0.28em] text-ink-light">
          SEO · CONTENT STRATEGY · MARKETING AUTOMATION
        </p>
      </div>
      <div className="mx-6 md:mx-8 mt-7 border-t-2 border-b border-ink h-[5px]" aria-hidden="true" />

      {/* Sticky nav */}
      <div className="sticky top-0 z-40 bg-paper">
        <nav className="flex justify-center gap-7 md:gap-11 px-6 py-3 border-b border-ink/25">
          {NAV_ITEMS.map((item) => {
            const cleanCurrent = currentPath.startsWith(base) ? (currentPath.slice(base.length) || '/') : currentPath;
            const isActive = cleanCurrent === item.path || (item.path !== "/" && cleanCurrent.startsWith(item.path));
            // Use the last visited sub-path if available for this section
            const targetPath = item.path === "/" ? "/" : (lastVisited[item.path] || item.path);

            return (
              <a
                key={item.path}
                href={withBase(targetPath)}
                className={cn(
                  "text-sm font-bold whitespace-nowrap transition-colors",
                  isActive ? "text-accent" : "text-ink hover:text-accent"
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t border-black/15 px-6 md:px-8 py-6 flex items-center justify-between gap-4">
        <span className="font-sans text-xs text-ink-light">© 2026 Joanne</span>
        <a href={`${base}/privacy`} className="font-sans text-xs text-ink-light hover:text-accent transition-colors">
          隱私權政策
        </a>
      </footer>

      <NewsletterModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
      />
    </div>
  );
}
