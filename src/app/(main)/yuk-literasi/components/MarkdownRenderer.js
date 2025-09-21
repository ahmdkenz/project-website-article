'use client';

import React, { useEffect, useState } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import '@/styles/markdown-content.css';

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
    </div>
  );
}