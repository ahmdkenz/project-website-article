'use client';

import React, { useEffect, useState } from 'react';
import { remark } from 'remark';
import html from 'remark-html';

export default function MarkdownRenderer({ markdownContent }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    const processContent = async () => {
      try {
        const result = await remark().use(html).process(markdownContent);
        setContent(result.toString());
      } catch (error) {
        console.error('Error processing markdown:', error);
        setContent('<p>Error rendering content</p>');
      }
    };

    processContent();
  }, [markdownContent]);

  return (
    <div className="markdown-content">
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <style jsx global>{`
        .markdown-content h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }
        .markdown-content h2 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }
        .markdown-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .markdown-content ol, .markdown-content ul {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-content li {
          margin-bottom: 0.5rem;
        }
        .markdown-content strong {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}