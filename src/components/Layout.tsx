import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Marquee } from "./Marquee";
import { trackEvent } from "../lib/analytics";
import { NewsletterModal } from "./NewsletterModal";

const NAV_ITEMS = [
  { path: "/", id: "01", label: "大廳", subtitle: "Lobby" },
  { path: "/archive", id: "02", label: "典藏", subtitle: "Archive" },
  { path: "/social", id: "03", label: "動態", subtitle: "Social" },
  { path: "/commission", id: "04", label: "合作", subtitle: "Inquiry" },
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

  // Theme Restoration Logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedColor = localStorage.getItem('theme_accent_color');
        if (savedColor) {
          document.documentElement.style.setProperty('--theme-accent', savedColor);
        }
      } catch (e) {
        console.warn("localStorage read blocked:", e);
      }
    }
  }, []);

  const changeTheme = (color: string, colorName: string) => {
    document.documentElement.style.setProperty('--theme-accent', color);
    setSysMsg(`THEME_UPDATED: ${colorName}`);
    trackEvent("change_theme", { color_name: colorName });
    setTimeout(() => setSysMsg("DATA_PRIVACY_PROTOCOL"), 2500);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme_accent_color', color);
      } catch (e) {
        console.warn("localStorage write blocked:", e);
      }
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { colorName } }));
    }
  };

  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const withBase = (path: string) => {
    if (path === '/') return base || '/';
    return path.startsWith(base) ? path : `${base}${path}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto brutalist-block flex flex-col md:flex-row min-h-[85vh] md:h-[85vh] overflow-hidden relative">

        {/* Sidebar / Index System */}
        <aside className="md:w-72 flex-shrink-0 flex flex-col border-b-4 md:border-b-0 md:border-r-4 border-ink bg-[#FFFDF9] relative z-10">

          <a href={base || "/"} className="block shrink-0 p-6 md:p-8 border-b-4 border-ink hover:bg-ink group overflow-hidden relative transition-colors duration-300">
            {/* Background noise texture effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjRjJGMEU5Ij48L3JlY3Q+CiA8cGF0aCBkPSJNMCAwdjhoOHYtOEgwem00IDRWMGgydjRIMHoiIGZpbGw9IiNFMEQ4QzgiIGZpbGwtb3BhY2l0eT0iLjMiPjwvcGF0aD4KPC9zdmc+')]"></div>

            <div className="font-serif text-3xl font-black text-ink group-hover:text-white transition-colors duration-300 relative z-10">
              JOANNE
              <br />
              <span className="text-4xl mt-1 block">ARCHIVE</span>
            </div>
            <div className="font-mono text-xs font-bold bg-accent text-white inline-block px-2 py-1 mt-4 group-hover:bg-white group-hover:text-ink transition-colors duration-300">
              JOANNE_VER_1.0
            </div>
          </a>

          <nav className="flex-1 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto custom-scrollbar divide-x-4 md:divide-x-0 md:divide-y-4 divide-ink">
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
                    "flex-1 md:flex-none shrink-0 flex items-center md:items-start md:flex-col pl-4 pr-2 py-4 md:p-6 group relative overflow-hidden transition-colors",
                    isActive ? "bg-accent text-white" : "hover:bg-ink hover:text-white text-ink"
                  )}
                >
                  <div className="flex flex-col relative z-10 min-w-max">
                    <span className="font-mono text-[10px] font-bold opacity-60 mb-1">
                      INDEX_{item.id}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-[22px] md:text-2xl font-bold tracking-widest group-hover:skew-x-[-10deg] transition-transform duration-300">
                        {item.label}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-widest hidden md:inline-block">
                        — {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Accent sweep on hover */}
                  <div className={cn(
                    "absolute inset-0 bg-ink origin-left scale-x-0 transition-transform duration-300 ease-out z-0",
                    !isActive && "group-hover:scale-x-100"
                  )}></div>
                </a>
              );
            })}
          </nav>

          <div className="hidden md:flex flex-col shrink-0 border-t-4 border-ink bg-[#EAE8E4]">
            <div className="p-4 flex gap-3 border-b border-ink/20">
              <button
                onClick={() => changeTheme('#A06540', 'EARTH')}
                className="w-4 h-4 rounded-full bg-[#A06540] shadow-[2px_2px_0_0_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] active:translate-y-[2px] active:translate-x-[1px] active:shadow-none transition-all cursor-pointer border-2 border-ink"
                title="SYS_COLOR: EARTH (大地暖色)"
              />
              <button
                onClick={() => changeTheme('#18181B', 'OBSIDIAN')}
                className="w-4 h-4 rounded-full bg-[#18181B] shadow-[2px_2px_0_0_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] active:translate-y-[2px] active:translate-x-[1px] active:shadow-none transition-all cursor-pointer border-2 border-ink"
                title="SYS_COLOR: OBSIDIAN (曜石黑)"
              />
              <button
                onClick={() => changeTheme('#78716C', 'PAPER')}
                className="w-4 h-4 rounded-full bg-[#78716C] shadow-[2px_2px_0_0_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] active:translate-y-[2px] active:translate-x-[1px] active:shadow-none transition-all cursor-pointer border-2 border-ink"
                title="SYS_COLOR: PAPER (極簡白紙灰)"
              />
              <button
                onClick={() => changeTheme('#4A7C59', 'SAGE')}
                className="w-4 h-4 rounded-full bg-[#4A7C59] shadow-[2px_2px_0_0_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] active:translate-y-[2px] active:translate-x-[1px] active:shadow-none transition-all cursor-pointer border-2 border-ink"
                title="SYS_COLOR: SAGE (鼠尾草灰綠)"
              />
            </div>
            <div className="p-4 font-mono text-[10px] uppercase font-bold text-ink/80 leading-none h-10 flex items-center">
              <a href={`${base}/privacy`} className="hover:text-ink hover:underline decoration-ink/30 underline-offset-4 transition-all cursor-help" title="SYS_PRIVACY_PROTOCOL">
                SYS.MSG: {sysMsg}
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#FFFDF9] relative flex flex-col overflow-hidden">
          <Marquee text="* OPEN FOR COLLABORATION * WELCOME TO JOANNE ARCHIVE * MODERN WEB ARCHITECTURE *" className="border-b-4 border-ink flex-shrink-0" />

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
