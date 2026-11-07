
import { ThreadsFeed } from "../../components/ThreadsFeed";
import { BackToTopButton } from "../../components/BackToTopButton";

export function Social() {
  

  return (
    <div className="p-0">
      <header className="px-8 py-10 bg-accent text-white border-b-4 border-ink relative">
        <h1 className="font-mono text-3xl font-black mb-2 tracking-widest flex items-center gap-4">
          <div className="w-4 h-4 bg-white animate-pulse"></div>
          DEVELOPER_SIGNALS
        </h1>
        <p className="font-sans font-bold opacity-90 max-w-xl">
          即時動態與技術手札記錄。<br/>
          ( 支援社群即時同步與邊緣快取技術 )
        </p>
      </header>

      <div className="p-8 space-y-12">
        <ThreadsFeed />
      </div>

    </div>
  );
}
