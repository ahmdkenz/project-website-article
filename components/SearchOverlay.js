// src/components/SearchOverlay.js
"use client";

import { useEffect, useRef } from "react";
import { useSearch } from "@/hooks/useSearch";
import SearchResultsList from "@/components/SearchResultsList";
import { useRouter } from "next/navigation";

export default function SearchOverlay({ open, onClose }) {
  const { query, setQuery, results, loading } = useSearch({ minLen: 2, limit: 20, debounceMs: 200 });
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
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Pencarian">
      <div className="search-overlay-backdrop" onClick={onClose} />
      <div className="search-overlay-panel" role="document">
        <div className="search-overlay-head">
          <input
            ref={inputRef}
            className="search-overlay-input"
            type="text"
            placeholder="Ketik untuk mencari…"
            aria-label="Ketik untuk mencari"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Tutup">✕</button>
        </div>

        <div className="search-overlay-body">
          {query.trim().length < 2 ? (
            <p className="muted">Ketik minimal 2 karakter…</p>
          ) : loading ? (
            <p className="muted">Mencari…</p>
          ) : (
            <SearchResultsList
              results={results}
              onItemClick={onClose}
            />
          )}
        </div>

        <div className="search-overlay-foot">
          <button className="btn btn-outline" onClick={goAll} disabled={!query.trim()}>
            Lihat semua hasil
          </button>
        </div>
      </div>
    </div>
  );
}
