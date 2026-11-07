import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

export function ArticleRenderer({ processedContent }: { processedContent: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      components={{
        hr: () => <div className="prose-hr-dots" />,
        a: ({ node, ...props }) => {
          const href = props.href || '';
          const isExternal = href.startsWith('http');
          const isHash = href.startsWith('#');

          if (isHash) {
            return (
              <a {...props} className="cursor-pointer smooth-scroll-link">
                {props.children}
              </a>
            );
          }

          return (
            <a
              {...props}
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {props.children}
            </a>
          );
        }
      }}
    >
      {processedContent}
    </Markdown>
  );
}
