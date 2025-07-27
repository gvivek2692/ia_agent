import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MessageRendererProps {
  content: string;
  isBot: boolean;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, isBot }) => {
  // Custom components for markdown rendering
  const components = {
    // Style headings
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-medium text-gray-700 mb-2 mt-3">
        {children}
      </h3>
    ),
    
    // Style lists
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="ml-2">{children}</li>
    ),
    
    // Style paragraphs
    p: ({ children }: any) => (
      <p className="mb-3 text-gray-700 leading-relaxed">
        {children}
      </p>
    ),
    
    // Style code blocks
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">
          <code className="text-sm font-mono text-gray-800">{children}</code>
        </pre>
      );
    },
    
    // Style tables
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-gray-50">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-gray-50">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
        {children}
      </td>
    ),
    
    // Style blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary-500 pl-4 py-2 mb-3 bg-primary-50 text-gray-700 italic">
        {children}
      </blockquote>
    ),
    
    // Style strong and emphasis
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-700">{children}</em>
    ),
  };

  // Format financial numbers (detect patterns like ₹1,00,000 or 1.5L)
  const formatFinancialContent = (text: string) => {
    return text
      // Format large numbers with Indian numbering system
      .replace(/₹(\d+)/g, (match, num) => {
        const number = parseInt(num);
        if (number >= 10000000) {
          return `₹${(number / 10000000).toFixed(1)}Cr`;
        } else if (number >= 100000) {
          return `₹${(number / 100000).toFixed(1)}L`;
        } else if (number >= 1000) {
          return `₹${number.toLocaleString('en-IN')}`;
        }
        return match;
      })
      // Add proper spacing and formatting for percentages
      .replace(/(\d+\.?\d*)%/g, '<span class="font-medium text-green-600">$1%</span>')
      // Highlight important financial terms
      .replace(/\b(SIP|PPF|ELSS|EPF|Nifty|Sensex)\b/g, '<span class="font-medium text-primary-600">$1</span>');
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