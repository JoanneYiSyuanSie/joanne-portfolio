// 展示版本：尚未串接 Threads API，這裡先放範例佔位。

const SAMPLE_POSTS = [
  { id: "sample_1", label: "SAMPLE_01" },
  { id: "sample_2", label: "SAMPLE_02" },
  { id: "sample_3", label: "SAMPLE_03" },
];

export function ThreadsFeed() {
  return (
    <div className="pb-8">
      <div className="space-y-8 max-w-3xl">
        {SAMPLE_POSTS.map((post) => (
          <div key={post.id} className="border-l-4 border-ink pl-6 py-2 relative">
            <span className="absolute -left-[14px] top-4 w-6 h-6 bg-paper border-4 border-ink flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-ink"></span>
            </span>
            <div className="font-mono text-xs font-bold text-ink/50 mb-2">
              {post.label}
            </div>
            <p className="font-sans font-bold text-ink leading-relaxed text-lg">
              範例 Threads 串文會顯示在這裡
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
