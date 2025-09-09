// components/FlashcardList.js
"use client";

import { useState } from 'react';
import Flashcard from '@/components/Flashcard'; // Kita akan perbarui Flashcard.js nanti

export default function FlashcardList({ allFlashcards }) {
  // allFlashcards adalah data awal yang kita dapat dari server
  const [filteredFlashcards, setFilteredFlashcards] = useState(allFlashcards);

  const handleSearch = (event) => {
    const keyword = event.target.value.toLowerCase().trim();
    if (!keyword) {
      setFilteredFlashcards(allFlashcards); // Jika kosong, tampilkan semua
      return;
    }
    const filtered = allFlashcards.filter(card =>
      card.term.toLowerCase().includes(keyword)
    );
    setFilteredFlashcards(filtered);
  };

  return (
    <>
      <section className="search-area">
        <div className="search-wrapper">
          <input 
            type="text" 
            id="flashcardSearchInput" 
            placeholder="Cari istilah pada flashcard..." 
            aria-label="Cari flashcard"
            onChange={handleSearch}
          />
        </div>
      </section>

      <div className="card-grid" style={{ marginTop: '2rem' }}>
        {filteredFlashcards.length > 0 ? (
          filteredFlashcards.map((card) => (
            <Flashcard key={card.term} card={card} />
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            Istilah tidak ditemukan.
          </p>
        )}
      </div>
    </>
  );
}