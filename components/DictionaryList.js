"use client";

import { useState, useMemo } from 'react';

// Fungsi bantuan untuk normalisasi teks
const norm = (s) => (s || "").toString().toLowerCase().trim();

export default function DictionaryList({ allTerms }) {
  // [DIUBAH] State untuk input yang sedang diketik
  const [inputValue, setInputValue] = useState('');
  
  // [BARU] State untuk query yang sudah disubmit (setelah tekan Enter/klik)
  const [submittedQuery, setSubmittedQuery] = useState('');

  // [DIUBAH] Logika filter sekarang bergantung pada `submittedQuery`
  const filteredTerms = useMemo(() => {
    const normalizedQuery = norm(submittedQuery);
    if (!normalizedQuery) {
      return []; // Jika belum ada yang dicari, jangan tampilkan apa-apa
    }
    
    return allTerms.filter(term => {
      const termText = norm(term.term);
      const definitionText = norm(term.definitionFriendly || term.definitionModerate);
      return termText.includes(normalizedQuery) || definitionText.includes(normalizedQuery);
    });
  }, [allTerms, submittedQuery]);

  // [BARU] Fungsi untuk menangani submit pencarian
  const handleSearch = (e) => {
    e.preventDefault(); // Mencegah halaman reload
    setSubmittedQuery(inputValue); // Set query yang akan dicari
  };

  return (
    <>
      {/* [DIUBAH] Input sekarang dibungkus dengan <form> */}
      <section className="search-area">
        <form className="search-wrapper" onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik istilah, lalu tekan Enter..."
            aria-label="Cari Istilah"
            style={{ flexGrow: 1 }} // Agar input mengisi ruang
          />
          <button type="submit" className="btn btn-primary">
            Cari
          </button>
        </form>
      </section>
      
      {/* [DIUBAH] Tampilan hasil disesuaikan dengan logika baru */}
      <section className="dictionary-results" style={{ marginTop: '2rem' }}>
        <div className="terms-container">
          {/* Kondisi saat halaman baru dibuka */}
          {!submittedQuery && (
            <p style={{ textAlign: 'center' }}>Silakan ketik istilah untuk memulai pencarian.</p>
          )}

          {/* Kondisi saat sudah mencari tapi tidak ada hasil */}
          {submittedQuery && filteredTerms.length === 0 && (
            <p style={{ textAlign: 'center' }}>Istilah "{submittedQuery}" tidak ditemukan.</p>
          )}

          {/* Kondisi saat hasil ditemukan */}
          {filteredTerms.length > 0 && (
            filteredTerms.map((term, index) => (
              <article key={term.id || index} className="term-card">
                <h3>{term.term}</h3>
                <p className="muted">{term.definitionFriendly || term.definitionModerate}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}