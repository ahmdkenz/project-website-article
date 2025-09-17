"use client";

import { useState, useEffect, useMemo } from "react";
import { useMode } from "@/context/ModeContext";

// Fungsi bantuan untuk normalisasi teks
const norm = (s) => (s || "").toString().toLowerCase().trim();

export default function DictionaryList({ allTerms = {} }) {
  // Dapatkan mode dari context
  const { mode } = useMode();
  
  // State input yang sedang diketik
  const [inputValue, setInputValue] = useState("");
  // State query yang disubmit (enter/klik)
  const [submittedQuery, setSubmittedQuery] = useState("");
  // State untuk menyimpan semua istilah dalam bentuk array
  const [termsList, setTermsList] = useState([]);

  // Konversi objek kategori menjadi array flat di awal dan filter berdasarkan mode
  useEffect(() => {
    // Pastikan allTerms adalah objek
    if (typeof allTerms !== 'object' || allTerms === null) {
      console.warn('[DictionaryList] allTerms is not an object:', allTerms);
      setTermsList([]);
      return;
    }
    
    // Flatten objek terms berdasarkan kategori menjadi array
    try {
      const flatTerms = [];
      Object.entries(allTerms).forEach(([category, terms]) => {
        if (Array.isArray(terms)) {
          terms.forEach(term => {
            // Filter berdasarkan mode saat ini
            const definition = mode === 'friendly' 
              ? term.definitionFriendly 
              : term.definitionModerate;
            
            // Hanya tambahkan jika definisi untuk mode tersebut ada
            if (definition && definition.trim() !== '') {
              flatTerms.push({
                ...term,
                category: category
              });
            }
          });
        }
      });
      
      console.log(`[DictionaryList] Flattened ${flatTerms.length} terms from ${Object.keys(allTerms).length} categories in mode: ${mode}`);
      setTermsList(flatTerms);
    } catch (error) {
      console.error('[DictionaryList] Error flattening terms:', error);
      setTermsList([]);
    }
  }, [allTerms, mode]);

  // Filter berdasarkan submittedQuery dan mode
  const filteredTerms = useMemo(() => {
    const q = norm(submittedQuery);
    if (!q) return [];
    
    return termsList.filter((term) => {
      // Ambil definisi sesuai mode
      const definition = mode === 'friendly' 
        ? term.definitionFriendly 
        : term.definitionModerate;
      
      // Normalisasi untuk pencarian
      const termText = norm(term.term);
      const definitionText = norm(definition);
      const categoryText = norm(term.category);
      
      // Cari di term, definisi dan kategori
      return termText.includes(q) || 
        definitionText.includes(q) || 
        categoryText.includes(q);
    });
  }, [termsList, submittedQuery, mode]);

  // Submit pencarian
  const handleSearch = (e) => {
    e.preventDefault();
    const q = norm(inputValue);
    setSubmittedQuery(q); // jika kosong → akan sembunyikan hasil
  };

  return (
    <>
      {/* Input dibungkus form */}
      <section className="search-area">
        <form
          className="search-wrapper"
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik istilah, lalu tekan Enter…"
            aria-label="Cari Istilah"
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="btn btn-primary">
            Cari
          </button>
        </form>
      </section>

      {/* Hasil */}
      <section
        className="dictionary-results"
        style={{ marginTop: "2rem" }}
        aria-live="polite"
      >
        <div className="terms-container">
          {/* Halaman baru dibuka */}
          {!submittedQuery && (
            <p style={{ textAlign: "center" }}>
              Silakan ketik istilah untuk memulai pencarian.
            </p>
          )}

          {/* Sudah mencari tapi tidak ada hasil */}
          {submittedQuery && filteredTerms.length === 0 && (
            <p style={{ textAlign: "center" }}>
              Istilah <q>{submittedQuery}</q> tidak ditemukan.
            </p>
          )}

          {/* Hasil ditemukan */}
          {filteredTerms.length > 0 &&
            filteredTerms.map((term, index) => (
              <article key={term.id ?? term.term ?? index} className="term-card">
                <h3>{term.term}</h3>
                {term.category && (
                  <div className="term-category" style={{ fontSize: '.9rem', color: 'var(--muted-color)', marginBottom: '0.75rem' }}>
                    Kategori: {term.category}
                  </div>
                )}
                <div className="term-definition">
                  {mode === 'friendly'
                    ? <p>{term.definitionFriendly}</p>
                    : <p>{term.definitionModerate}</p>
                  }
                </div>
              </article>
            ))}
        </div>
      </section>
    </>
  );
}
