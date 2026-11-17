// 展示版本：尚未串接 Threads API，這裡先放範例佔位。

const SAMPLE_POSTS = [
  { id: "sample_1", label: "範例 1" },
  { id: "sample_2", label: "範例 2" },
  { id: "sample_3", label: "範例 3" },
];

export function ThreadsFeed() {
  return (
    <div className="pb-8">
      <div className="max-w-3xl">
        {SAMPLE_POSTS.map((post) => (
          <div key={post.id} className="border-b border-black/15 py-5">
            <div className="font-sans text-xs text-ink-light mb-2">
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
