// components/Flashcard.js
"use client";

import { useState, useEffect, useRef } from 'react';
import { useMode } from '@/context/ModeContext'; // Import hook useMode
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import Only from "@/components/mdx/Only";

const mdxComponents = {
  Only,
};

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [serializedContent, setSerializedContent] = useState(null);
  const { mode } = useMode(); // Baca mode dari context

  // Serialize MDX content on the client side
  useEffect(() => {
    if (card.rawContent && !serializedContent) {
      serialize(card.rawContent, { components: mdxComponents })
        .then(setSerializedContent)
        .catch(console.error);
    }
  }, [card.rawContent, serializedContent]);

  return (
    <div className="flashcard" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-front">
          <h3>{card.term}</h3>
          <div className="flashcard-category">{card.category}</div>
        </div>
        <div className="flashcard-back">
          {serializedContent ? (
            <MDXRemote {...serializedContent} components={mdxComponents} />
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}