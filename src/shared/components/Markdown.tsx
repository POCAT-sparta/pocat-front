import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * 채팅 말풍선용 마크다운 렌더러.
 * 누적된 전체 텍스트를 받아 한 번에 렌더한다(청크 단위 X).
 * Tailwind typography 플러그인이 없으므로 요소별로 직접 스타일을 준다.
 */
const components: Components = {
  p: ({ children }) => <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-[15px] font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2.5 mb-1 first:mt-0">{children}</h3>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#CC0000] underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-muted-foreground/30 pl-3 my-1.5 text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return <code className="block">{children}</code>;
    }
    return (
      <code className="px-1 py-0.5 rounded bg-muted text-[0.85em] font-mono break-words">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 p-3 rounded-lg bg-muted overflow-x-auto text-[0.85em] font-mono leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full text-left border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border px-2 py-1 font-semibold bg-muted/50">{children}</th>,
  td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
