// components/Flashcard.js
"use client";

import { useState } from 'react';
import { useMode } from '@/context/ModeContext'; // Import hook useMode

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { mode } = useMode(); // Baca mode dari context

  // Pilih definisi yang benar berdasarkan mode
  const definition = mode === 'friendly' ? card.definitionFriendly : card.definitionModerate;

  return (
    <div className="flashcard" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-front">
          <h3>{card.term}</h3>
        </div>
        <div className="flashcard-back">
          <p>{definition}</p>
        </div>
      </div>
    </div>
  );
}