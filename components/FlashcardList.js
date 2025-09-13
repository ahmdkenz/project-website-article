// components/FlashcardList.js
"use client";

import { useState } from 'react';
import Flashcard from '@/components/Flashcard'; // Kita akan perbarui Flashcard.js nanti

export default function FlashcardList({ allFlashcards }) {
  // allFlashcards adalah data awal yang kita dapat dari server
  const [filteredFlashcards, setFilteredFlashcards] = useState(allFlashcards);

  // kontrol jumlah item yang ditampilkan
  const INITIAL_COUNT = 5;   // tampilkan 8 dulu
  const STEP = 5;            // tambah 8 setiap klik
  const [visible, setVisible] = useState(INITIAL_COUNT);

  const handleSearch = (event) => {
    const keyword = event.target.value.toLowerCase().trim();
    if (!keyword) {
      setFilteredFlashcards(allFlashcards); // Jika kosong, tampilkan semua
      setVisible(INITIAL_COUNT);            // reset tampilan awal
      return;
    }
    const filtered = allFlashcards.filter(card =>
      card.term.toLowerCase().includes(keyword)
    );
    setFilteredFlashcards(filtered);
    setVisible(INITIAL_COUNT);              // reset tampilan awal untuk hasil pencarian
  };

  // hitung irisan item yang akan dirender
  const total = filteredFlashcards.length;
  const items = filteredFlashcards.slice(0, visible);
  const canShowMore = visible < total;
  const canShowLess = visible > INITIAL_COUNT;

  const onShowMore = () => setVisible(v => Math.min(v + STEP, total));
  const onShowLess = () => setVisible(INITIAL_COUNT);

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

      {/* ← pakai grid default dari styles/flashcards.css */}
      <div
        id="flashcardsGrid"
        className="flashcards-grid"
        style={{ marginTop: '2rem' }}
        aria-live="polite"
      >
        {filteredFlashcards.length > 0 ? (
          items.map((card) => (
            <Flashcard key={card.term} card={card} />
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            Istilah tidak ditemukan.
          </p>
        )}
      </div>

      {/* Footer tombol Show More / Show Less */}
      {total > 0 && (
        <>
          <div className="list-footer" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '.5rem' }}>
            {canShowMore && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={onShowMore}
                aria-controls="flashcardsGrid"
                aria-expanded={visible > INITIAL_COUNT}
              >
                Lihat {Math.min(STEP, total - visible)} lagi
              </button>
            )}
            {canShowLess && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onShowLess}
                aria-controls="flashcardsGrid"
                aria-expanded={visible > INITIAL_COUNT}
              >
                Tampilkan lebih sedikit
              </button>
            )}
          </div>

          <div className="list-hint" style={{ textAlign: 'center', marginTop: '.5rem', fontSize: '.85rem' }}>
            Menampilkan <strong>{Math.min(visible, total)}</strong> dari <strong>{total}</strong> istilah
          </div>
        </>
      )}
    </>
  );
}
