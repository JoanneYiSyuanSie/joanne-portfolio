
import { ThreadsFeed } from "../../components/ThreadsFeed";
import { BackToTopButton } from "../../components/BackToTopButton";

export function Social() {
  

  return (
    <div className="p-0">
      <header className="px-8 py-10 bg-accent text-white relative">
        <h1 className="font-sans text-4xl font-extrabold tracking-tight mb-2">
          社群
        </h1>
        <p className="font-sans text-white/85 max-w-xl">
          這裡會顯示 Threads 串文。<br/>
          目前是展示版本，尚未串接。
        </p>
      </header>

      <div className="p-8 space-y-12">
        <ThreadsFeed />
      </div>

    </div>
  );
}
