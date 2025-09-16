// components/DictionaryList.js
"use client";

import { useState } from 'react';

export default function DictionaryList({ allTerms }) {
  const [filteredTerms, setFilteredTerms] = useState(allTerms || []);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event) => {
    const keyword = event.target.value.toLowerCase().trim();
    setSearchQuery(keyword);
    
    if (!keyword) {
      setFilteredTerms(allTerms || []);
      return;
    }
    
    const filtered = (allTerms || []).filter(term =>
      term.title?.toLowerCase().includes(keyword) ||
      term.definition?.toLowerCase().includes(keyword)
    );
    setFilteredTerms(filtered);
  };

  return (
    <div>
      {/* Search input */}
      <div className="search-input-wrapper" style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Cari istilah keuangan..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Terms list */}
      <div className="terms-grid" style={{ display: 'grid', gap: '1rem' }}>
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term, index) => (
            <div
              key={index}
              className="term-card"
              style={{
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-color)'
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                {term.title || term.term || 'Untitled'}
              </h3>
              <p style={{ margin: 0, color: 'var(--muted-color)' }}>
                {term.definition || 'No definition available'}
              </p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--muted-color)' }}>
            {searchQuery ? 'Tidak ada istilah yang ditemukan.' : 'Belum ada istilah tersedia.'}
          </p>
        )}
      </div>
    </div>
  );
}