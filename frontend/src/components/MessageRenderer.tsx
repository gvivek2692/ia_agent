import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageRendererProps {
  content: string;
  isBot: boolean;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, isBot }) => {
  // Custom components for markdown rendering
  const components = {
    // Style headings
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold text-white mb-3 border-b border-white/20 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-semibold text-white mb-2 mt-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-medium text-white mb-2 mt-3">
        {children}
      </h3>
    ),
    
    // Style lists
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-3 space-y-1 text-white">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-3 space-y-1 text-white">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="ml-2">{children}</li>
    ),
    
    // Style paragraphs
    p: ({ children }: any) => (
      <p className="mb-3 text-white leading-relaxed">
        {children}
      </p>
    ),
    
    // Style code blocks
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="bg-white/20 px-1 py-0.5 rounded text-sm font-mono text-pink-200">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-white/20 p-3 rounded-lg overflow-x-auto mb-3">
          <code className="text-sm font-mono text-pink-200">{children}</code>
        </pre>
      );
    },
    
    // Style tables
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-white/20 border border-white/20 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-white/10">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="bg-white/5 divide-y divide-white/20">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-white/10">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
        {children}
      </td>
    ),
    
    // Style blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-pink-500 pl-4 py-2 mb-3 bg-white/10 text-white italic">
        {children}
      </blockquote>
    ),
    
    // Style strong and emphasis
    strong: ({ children }: any) => (
      <strong className="font-semibold text-pink-200">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-200">{children}</em>
    ),
  };


  if (!isBot) {
    return (
      <div className="text-sm text-white">
        {content}
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageRenderer;