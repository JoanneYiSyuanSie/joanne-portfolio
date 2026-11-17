import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Marquee } from "./Marquee";
import { NewsletterModal } from "./NewsletterModal";

const NAV_ITEMS = [
  { path: "/", id: "01", label: "大廳", subtitle: "Lobby" },
  { path: "/archive", id: "02", label: "文章", subtitle: "Articles" },
  { path: "/social", id: "03", label: "動態", subtitle: "Social" },
  { path: "/commission", id: "04", label: "合作", subtitle: "Contact" },
  { path: "/about", id: "05", label: "關於", subtitle: "About" },
];

interface LayoutProps {
  children?: React.ReactNode;
  currentPath: string;
}

export function Layout({ children, currentPath }: LayoutProps) {
  const [sysMsg, setSysMsg] = useState("DATA_PRIVACY_PROTOCOL");
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

  // Persist memory across Astro page loads
  const [scrollMemory, setScrollMemory] = useState<{ [key: string]: number }>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(sessionStorage.getItem('scrollMemory') || '{}');
      } catch (e) {
        console.warn("sessionStorage access blocked:", e);
      }
    }
    return {};
  });

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

  // Scroll Restoration Logic
  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    // Restore position for new route
    const savedPosition = scrollMemory[currentPath] || 0;
    container.scrollTop = savedPosition;

    // Save position before leaving
    return () => {
      setScrollMemory(prev => {
        const next = { ...prev, [currentPath]: container.scrollTop };
        try {
          sessionStorage.setItem('scrollMemory', JSON.stringify(next));
        } catch (e) {
          console.warn("sessionStorage write blocked:", e);
        }
        return next;
      });
    };
  }, [currentPath]);

  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const withBase = (path: string) => {
    if (path === '/') return base || '/';
    return path.startsWith(base) ? path : `${base}${path}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto brutalist-block flex flex-col md:flex-row min-h-[85vh] md:h-[85vh] overflow-hidden relative">

        {/* Sidebar / Index System */}
        <aside className="md:w-72 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-black/15 bg-paper relative z-10">

          <a href={base || "/"} className="block shrink-0 p-6 md:p-8 border-b border-black/15 hover:bg-ink group overflow-hidden relative transition-colors duration-300">
            <div className="font-sans text-3xl font-extrabold tracking-tight text-ink group-hover:text-white transition-colors duration-300 relative z-10">
              JOANNE
              <br />
              <span className="text-4xl mt-1 block">ARCHIVE</span>
            </div>
            <div className="font-mono text-xs font-bold bg-accent text-white inline-block px-2 py-1 mt-4 group-hover:bg-white group-hover:text-ink transition-colors duration-300">
              JOANNE_VER_1.0
            </div>
          </a>

          <nav className="flex-1 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto custom-scrollbar divide-x md:divide-x-0 md:divide-y divide-black/15">
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
                    "flex-1 md:flex-none shrink-0 flex items-center md:items-start md:flex-col pl-4 pr-2 py-4 md:p-6 group relative transition-colors",
                    isActive ? "bg-ink text-white" : "hover:bg-black/5 text-ink"
                  )}
                >
                  <div className="flex flex-col relative z-10 min-w-max">
                    <span className={cn("font-mono text-[10px] font-bold mb-1", isActive ? "text-accent" : "opacity-50")}>
                      INDEX_{item.id}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[22px] md:text-2xl font-bold tracking-tight">
                        {item.label}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-widest hidden md:inline-block opacity-50">
                        — {item.subtitle}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </nav>

          <div className="hidden md:flex flex-col shrink-0 border-t border-black/15">
            <div className="p-4 font-mono text-[10px] uppercase font-bold text-ink/60 leading-none h-10 flex items-center">
              <a href={`${base}/privacy`} className="hover:text-ink hover:underline decoration-ink/30 underline-offset-4 transition-all cursor-help" title="SYS_PRIVACY_PROTOCOL">
                SYS.MSG: {sysMsg}
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-paper relative flex flex-col overflow-hidden">
          <Marquee text="* CONTENT STRATEGY * TECHNICAL SEO NOTES * MARKETING AUTOMATION * JOANNE JOURNAL *" className="border-b border-black/15 flex-shrink-0" />

          <div id="main-scroll-container" style={{ viewTransitionName: 'main-area' }} className="flex-1 relative flex flex-col overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </main>
      </div>

      <NewsletterModal 
        isOpen={isNewsletterModalOpen} 
        onClose={() => setIsNewsletterModalOpen(false)} 
      />
    </div>
  );
}
