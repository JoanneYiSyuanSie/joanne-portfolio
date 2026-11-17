import { Link } from "react-router-dom";
import { useSEO } from "../../lib/seo";

export function NotFound() {
  useSEO({ title: "404 - 找不到頁面" });

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 relative">
      <div className="relative z-10 text-center space-y-6">
        <h1 className="font-sans text-7xl md:text-8xl font-extrabold tracking-tight text-ink">
          404<span className="text-accent">.</span>
        </h1>

        <p className="font-sans text-xl max-w-md mx-auto text-ink-light">
          找不到這個頁面。
        </p>

        <div className="pt-4">
          <Link to="/" className="brutalist-button px-8 py-3 text-base">
            回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
