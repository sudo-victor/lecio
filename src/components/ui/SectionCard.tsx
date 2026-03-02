import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SectionCardProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

interface MarkdownComponentProps {
  children?: ReactNode;
}

const markdownComponents = {
  p: ({ children }: MarkdownComponentProps) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }: MarkdownComponentProps) => <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>,
  ol: ({ children }: MarkdownComponentProps) => <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>,
  li: ({ children }: MarkdownComponentProps) => <li className="leading-6">{children}</li>,
  strong: ({ children }: MarkdownComponentProps) => <strong className="font-semibold text-slate-800">{children}</strong>,
  h3: ({ children }: MarkdownComponentProps) => <h3 className="mt-3 mb-1.5 text-sm font-semibold text-slate-800">{children}</h3>,
  h4: ({ children }: MarkdownComponentProps) => <h4 className="mt-2 mb-1 text-sm font-medium text-slate-800">{children}</h4>,
};

const SectionCard = ({
  title,
  content,
  defaultOpen = false,
}: SectionCardProps) => {
  const displayContent = content?.trim() || "Sem conteudo gerado para esta secao.";

  return (
    <details
      className="overflow-hidden rounded-3xl border border-gray-100 bg-white open:border-green-500"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none border-l-4 border-transparent px-4 py-4 text-base font-semibold text-gray-800 transition marker:content-none hover:bg-gray-50 open:border-green-500">
        {title}
      </summary>
      <div className="border-t border-gray-50 px-4 py-4 text-sm leading-6 text-slate-700 [&>*:first-child]:mt-0">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {displayContent}
        </ReactMarkdown>
      </div>
    </details>
  );
};

export default SectionCard;
