import { Link } from "react-router-dom";
import { useSEO } from "../../lib/seo";

export function NotFound() {
  useSEO({ title: "404 - 找不到頁面" });

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-black text-white relative overflow-hidden">
      {/* Glitchy background effect */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)', backgroundSize: '100% 4px' }}></div>
      
      <div className="relative z-10 text-center space-y-8">
        <h1 className="font-mono text-6xl md:text-8xl font-black text-accent tracking-tighter shadow-[8px_8px_0_0_#FFFDF9]">
          404
        </h1>
        
        <div className="bg-ink border-2 border-white p-4 inline-block">
          <p className="font-mono font-bold text-lg tracking-widest text-white">
            ERROR: FILE_NOT_FOUND
          </p>
        </div>
        
        <p className="font-sans font-bold text-xl max-w-md mx-auto text-white/80">
          您所尋找的頁面或紀錄不存在，可能已被加密、銷毀，或是位於另一個時空。
        </p>

        <div className="pt-8">
          <Link to="/" className="brutalist-button !bg-white !text-ink hover:!bg-accent hover:!text-white border-white px-8 py-4 text-lg">
            RETURN_TO_HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
