// src/components/HeaderSearchDesktop.js
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useMode } from "@/context/ModeContext";
import SearchResultsList from "@/components/SearchResultsList";
import { useRouter } from "next/navigation";

export default function HeaderSearchDesktop() {
  const router = useRouter();
  const { mode } = useMode(); // Mengambil mode dari context
  const { query, setQuery, results, loading, canSearch } = useSearch({ 
    minLen: 2, 
    limit: 12, 
    debounceMs: 200, 
    mode: mode // Passing mode ke useSearch hook
  });

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // open suggestion if query valid
  useEffect(() => {
    if (canSearch && (results.length || loading)) setOpen(true);
    if (!query.trim()) setOpen(false);
  }, [canSearch, results.length, loading, query]);
  
  // Debug logging for mode changes
  useEffect(() => {
    console.log(`[HeaderSearchDesktop] Current mode: ${mode}`);
    if (results.length > 0) {
      console.log(`[HeaderSearchDesktop] Result count: ${results.length}`);
      const resultModes = {};
      results.forEach(r => {
        const rMode = r.mode || "moderate";
        resultModes[rMode] = (resultModes[rMode] || 0) + 1;
      });
      console.log(`[HeaderSearchDesktop] Results by mode:`, resultModes);
    }
  }, [mode, results]);

  function onSubmit(e) {
    e.preventDefault();
    const q = inputRef.current?.value?.trim();
    if (!q) return;
    setOpen(false);
    // Tambahkan parameter mode ke URL pencarian
    router.push(`/search?q=${encodeURIComponent(q)}&mode=${encodeURIComponent(mode)}`);
  }

  return (
    <div className="search-form-desktop" role="search" ref={wrapRef} style={{ position: "relative", display: "flex", gap: ".5rem" }}>
      <input
        ref={inputRef}
        type="text"
        name="q"
        placeholder="Cari..."
        aria-label="Cari"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.length >= 2) setOpen(true); }}
      />
      <button className="btn btn-ghost" type="button" onClick={onSubmit}>Cari</button>

      {open && (
        <div className="search-suggest" role="dialog" aria-label="Saran pencarian">
          {loading ? <p className="muted">Mencari…</p> : <SearchResultsList results={results} onItemClick={() => setOpen(false)} />}
          {!!query && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => { setOpen(false); router.push(`/search?q=${encodeURIComponent(query)}`); }}
              style={{ marginTop: ".75rem", width: "100%" }}
            >
              Lihat semua hasil untuk “{query}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
