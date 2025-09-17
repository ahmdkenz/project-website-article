// components/Flashcard.js
"use client";

import { useState, useEffect } from 'react';
import { useMode } from '@/context/ModeContext';

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { mode } = useMode();
  const [definition, setDefinition] = useState('');

  // Perbarui definisi saat mode berubah atau card berubah
  useEffect(() => {
    if (!card) {
      setDefinition('');
      return;
    }

    // Pilih definisi berdasarkan mode saat ini
    const selectedDefinition = mode === 'friendly' 
      ? card.definitionFriendly 
      : card.definitionModerate;
    
    setDefinition(selectedDefinition || 'Belum ada definisi');
  }, [card, mode]);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  // Validasi card untuk mencegah error
  if (!card || !card.term) {
    return null;
  }

  return (
    <div 
      className="flashcard" 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard: ${card.term}. Click atau tekan Enter untuk membalik.`}
    >
      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-front">
          <h3>{card.term}</h3>
          {/* Kategori dihilangkan dari bagian depan flashcard */}
        </div>
        <div className="flashcard-back">
          <div className="flashcard-content">
            {definition}
          </div>
          {/* Kategori dihilangkan dari bagian belakang flashcard */}
        </div>
      </div>
    </div>
  );
}
