import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Parse markdown text and convert to React elements using react-markdown
 * Supports full markdown syntax including:
 * - **bold text**, *italic text*, __underline__
 * - Headers (# H1, ## H2, etc.)
 * - Lists (ordered and unordered)
 * - Horizontal rules (---)
 * - Links, code blocks, etc.
 */
export const parseMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Customize heading styles to match chat design
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2 mt-3" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2 mt-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-1 mt-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="text-base font-bold mb-1 mt-1" {...props} />,

        // Customize list styles
        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="ml-2" {...props} />,

        // Customize horizontal rule
        hr: ({ node, ...props }) => <hr className="my-3 border-cyan-400/30" {...props} />,

        // Customize paragraph spacing
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,

        // Customize strong/em
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,

        // Customize code blocks
        code: ({ node, inline, ...props }: any) =>
          inline
            ? <code className="bg-cyan-900/50 px-1 rounded" {...props} />
            : <code className="block bg-cyan-900/50 p-2 rounded my-2 overflow-x-auto" {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

