
import { ThreadsFeed } from "../../components/ThreadsFeed";

export function Social() {
  

  return (
    <div className="p-0">
      <header className="px-8 py-10 border-b border-black/15">
        <h1 className="font-serif text-4xl font-semibold mb-2">
          社群
        </h1>
        <p className="font-sans text-ink-light max-w-xl">
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
