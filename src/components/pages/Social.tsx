
import { ThreadsFeed } from "../../components/ThreadsFeed";

export function Social() {
  

  return (
    <div className="p-0 max-w-5xl mx-auto w-full">
      <header className="px-6 md:px-8 pt-10 md:pt-14 pb-8 border-b border-black/15">
        <h1 className="font-serif text-4xl font-semibold mb-2">
          社群
        </h1>
        <p className="font-sans text-ink-light max-w-xl">
          這裡會顯示 Threads 串文。<br/>
          目前是展示版本，尚未串接。
        </p>
      </header>

      <div className="px-6 md:px-8 py-8 space-y-12">
        <ThreadsFeed />
      </div>

    </div>
  );
}
