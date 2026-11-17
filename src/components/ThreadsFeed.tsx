// 展示版本：尚未串接 Threads API，這裡先放範例佔位。

const SAMPLE_POSTS = [
  { id: "sample_1", label: "SAMPLE_01" },
  { id: "sample_2", label: "SAMPLE_02" },
  { id: "sample_3", label: "SAMPLE_03" },
];

export function ThreadsFeed() {
  return (
    <div className="pb-8">
      <div className="max-w-3xl">
        {SAMPLE_POSTS.map((post) => (
          <div key={post.id} className="border-b border-black/15 py-5">
            <div className="font-mono text-xs text-ink-light mb-2">
              {post.label}
            </div>
            <p className="font-sans text-ink leading-relaxed text-lg">
              範例 Threads 串文會顯示在這裡
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
