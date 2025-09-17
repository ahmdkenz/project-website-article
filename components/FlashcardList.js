// components/FlashcardList.js
"use client";

import { useState, useEffect, useMemo } from 'react';
import Flashcard from '@/components/Flashcard';
import { useMode } from '@/context/ModeContext';

export default function FlashcardList({ allFlashcards = [] }) {
  // Pastikan allFlashcards selalu array
  const safeFlashcards = useMemo(() => 
    Array.isArray(allFlashcards) ? allFlashcards : [], [allFlashcards]);
  
  // State untuk pencarian & filter
  const [searchTerm, setSearchTerm] = useState('');
  const { mode } = useMode();
  
  // State untuk filter kategori
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Filter flashcards berdasarkan mode
  const modeFilteredFlashcards = useMemo(() => {
    if (!Array.isArray(safeFlashcards)) return [];
    
    return safeFlashcards.filter(card => {
      // Jika mode friendly, hanya tampilkan card yang memiliki definitionFriendly
      if (mode === 'friendly') {
        return card.definitionFriendly && card.definitionFriendly.trim() !== '';
      }
      // Jika mode moderate, hanya tampilkan card yang memiliki definitionModerate
      else {
        return card.definitionModerate && card.definitionModerate.trim() !== '';
      }
    });
  }, [safeFlashcards, mode]);
  
  // Ekstrak semua kategori yang unik
  const categories = useMemo(() => {
    const categorySet = new Set();
    modeFilteredFlashcards.forEach(card => {
      if (card.category) categorySet.add(card.category);
    });
    return Array.from(categorySet).sort();
  }, [modeFilteredFlashcards]);
  
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);

  // Kontrol jumlah item yang ditampilkan
  const INITIAL_COUNT = 5;
  const STEP = 5;
  const [visible, setVisible] = useState(INITIAL_COUNT);

  // Filter flashcards berdasarkan pencarian, kategori, dan mode
  useEffect(() => {
    const keyword = searchTerm.toLowerCase().trim();
    
    // Filter berdasarkan keyword pencarian dan kategori
    let filtered = modeFilteredFlashcards;
    
    // Filter berdasarkan kategori yang dipilih
    if (categoryFilter) {
      filtered = filtered.filter(card => 
        card.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    // Filter berdasarkan keyword pencarian
    if (keyword) {
      filtered = filtered.filter(card => {
        // Cari di term
        if (card.term?.toLowerCase().includes(keyword)) return true;
        
        // Cari di definisi berdasarkan mode
        const definition = mode === 'friendly' 
          ? card.definitionFriendly 
          : card.definitionModerate;
        
        if (definition?.toLowerCase().includes(keyword)) return true;
        
        // Cari di kategori
        if (card.category?.toLowerCase().includes(keyword)) return true;
        
        return false;
      });
    }
    
    console.log(`[FlashcardList] Filtered ${filtered.length} flashcards with search term: "${keyword}" in mode: ${mode}${categoryFilter ? ` and category: "${categoryFilter}"` : ''}`);
    setFilteredFlashcards(filtered);
    setVisible(INITIAL_COUNT); // Reset tampilan awal saat filter berubah
  }, [modeFilteredFlashcards, searchTerm, categoryFilter, mode]);

  // Handler untuk pencarian
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Hitung total dan item yang akan dirender
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
            value={searchTerm}
          />
        </div>
      </section>

      {/* Filter kategori */}
      {categories.length > 0 && (
        <section className="category-filter" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            <button 
              className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCategoryFilter('')}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Grid flashcards */}
      <div
        id="flashcardsGrid"
        className="flashcards-grid"
        style={{ marginTop: '2rem' }}
        aria-live="polite"
      >
        {filteredFlashcards.length > 0 ? (
          items.map((card, index) => (
            <Flashcard key={card.term || `flashcard-${index}`} card={card} />
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            {searchTerm ? `Istilah "${searchTerm}" tidak ditemukan.` : 'Tidak ada flashcard tersedia.'}
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
            {searchTerm ? ` untuk pencarian "${searchTerm}"` : ''}
            {categoryFilter ? ` dalam kategori "${categoryFilter}"` : ''}
          </div>
        </>
      )}
    </>
  );
}
