// src/components/SearchOverlay.js
"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useMode } from "@/context/ModeContext";
import SearchResultsList from "@/components/SearchResultsList";
import { useRouter } from "next/navigation";

export default function SearchOverlay({ open, onClose }) {
  const { mode } = useMode(); // Mengambil mode dari context
  // Limit hint lebih sedikit untuk mobile agar tidak menumpuk
  const { query, setQuery, results, loading } = useSearch({ 
    minLen: 2, 
    limit: 5, 
    debounceMs: 180, 
    mode: mode // Passing mode ke useSearch hook
  });
  const router = useRouter();
  const inputRef = useRef(null);

  // autofocus & esc
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function goAll() {
    const q = query.trim();
    if (!q) return;
    onClose?.();
    // Tambahkan parameter mode ke URL
    router.push(`/search?q=${encodeURIComponent(q)}&mode=${encodeURIComponent(mode)}`);
  }

  return (
    <>
      <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Pencarian">
        <div className="search-overlay-backdrop" onClick={onClose} />
        <div className="search-overlay-panel" role="document">
          <div className="search-overlay-head">
            <input
              ref={inputRef}
              className="search-overlay-input"
              type="text"
              placeholder="Cari..."
              aria-label="Ketik untuk mencari"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-ghost btn-sm search-overlay-close" onClick={goAll} aria-label="Cari" disabled={!query.trim()}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
                <line x1="15.2" y1="15.2" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="search-overlay-body">
            {query.trim().length < 2 ? (
              <p className="muted">Ketik minimal 2 karakter…</p>
            ) : loading ? (
              <p className="muted">Mencari…</p>
            ) : (
              <SearchResultsList results={results} onItemClick={onClose} />
            )}
          </div>

          <div className="search-overlay-foot">
            <button className="btn btn-outline btn-sm" onClick={goAll} disabled={!query.trim()}>
              Lihat semua hasil
            </button>
          </div>
        </div>
      </div>
      {/* Removed inline style block to rely on global CSS file */}
      {/* <style jsx global>{` ... `}</style> */}
    </>
  );
}
