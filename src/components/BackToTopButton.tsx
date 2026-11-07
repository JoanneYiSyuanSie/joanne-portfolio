import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    const container = document.getElementById("main-scroll-container");
    // On mobile, the window scrolls instead of the container, so take the max of both
    const scrollPos = Math.max(container ? container.scrollTop : 0, window.scrollY);

    if (scrollPos > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    const container = document.getElementById("main-scroll-container");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const container = document.getElementById("main-scroll-container");
    
    container?.addEventListener("scroll", toggleVisibility);
    window.addEventListener("scroll", toggleVisibility);
    
    return () => {
      container?.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-50 p-3 bg-ink text-white border-2 border-ink shadow-[4px_4px_0_0_var(--theme-accent)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--theme-accent)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
      aria-label="Back to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
