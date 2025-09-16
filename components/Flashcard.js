// components/Flashcard.js
"use client";

import { useState } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { useMode } from '@/context/ModeContext';
import Only from '@/components/mdx/Only';

// MDX components for client-side rendering
const mdxComponents = {
  Only,
};

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { mode } = useMode();

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  // Use the pre-processed definitions for fallback
  const definition = mode === 'friendly' 
    ? card.definitionFriendly 
    : card.definitionModerate;

  return (
    <div 
      className="flashcard" 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard: ${card.term}. Click or press Enter to flip.`}
    >
      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-front">
          <h3>{card.term}</h3>
        </div>
        <div className="flashcard-back">
          {/* Use pre-processed text directly since MDX processing on client-side is complex */}
          <p>{definition || 'Belum ada definisi'}</p>
        </div>
      </div>
    </div>
  );
}