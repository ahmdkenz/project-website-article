"use client";

import { useState, useMemo } from "react";

// Fungsi bantuan untuk normalisasi teks
const norm = (s) => (s || "").toString().toLowerCase().trim();

export default function DictionaryList({ allTerms = [] }) {
  // State input yang sedang diketik
  const [inputValue, setInputValue] = useState("");
  // State query yang disubmit (enter/klik)
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Pastikan selalu array supaya aman
  const safeTerms = useMemo(
    () => (Array.isArray(allTerms) ? allTerms : []),
    [allTerms]
  );

  // Filter berdasarkan submittedQuery (bukan live-typing)
  const filteredTerms = useMemo(() => {
    const q = norm(submittedQuery);
    if (!q) return [];
    return safeTerms.filter((term) => {
      const termText = norm(term.term);
      const definitionText = norm(
        term.definitionFriendly || term.definitionModerate
      );
      return termText.includes(q) || definitionText.includes(q);
    });
  }, [safeTerms, submittedQuery]);

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
            /* Agar input mengisi ruang */
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
              <article key={term.id ?? term.slug ?? index} className="term-card">
                <h3>{term.term}</h3>
                <p className="muted">
                  {term.definitionFriendly || term.definitionModerate}
                </p>
              </article>
            ))}
        </div>
      </section>
    </>
  );
}
