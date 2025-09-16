// components/Flashcard.js
"use client";

import { useState } from 'react';
import { useMode } from '@/context/ModeContext';

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { mode } = useMode();

  if (!card) {
    return null;
  }

  const { term, definitionFriendly, definitionModerate, definition } = card;

  // Choose definition based on mode
  const displayDefinition = mode === 'friendly' 
    ? (definitionFriendly || definition || '') 
    : (definitionModerate || definition || '');

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`flashcard ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      aria-label={`Flashcard: ${term}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFlip();
        }
      }}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <h3>{term}</h3>
        </div>
        <div className="flashcard-back">
          <p>{displayDefinition}</p>
        </div>
      </div>
    </div>
  );
}