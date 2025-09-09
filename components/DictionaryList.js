"use client";

import { useState, useMemo } from "react";
import { useMode } from "@/context/ModeContext";

const norm = (s) => (s || "").toLowerCase().trim();

export default function DictionaryList({ allTerms = [] }) {
  const [q, setQ] = useState("");
  const { mode } = useMode(); // ✅ ambil mode (friendly/moderate)

  const results = useMemo(() => {
    const nQ = norm(q);
    if (!nQ) return [];
    return allTerms.filter((t) => {
      const hay = `${t.term} ${t.definitionFriendly || ""} ${t.definitionModerate || ""}`;
      return hay.toLowerCase().includes(nQ);
    });
  }, [q, allTerms]);

  return (
    <section>
      {/* Kolom Search */}
      <input
        type="search"
        id="searchInput"
        placeholder="Ketik istilah untuk mencari..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          width: "100%",
          padding: "0.85rem 1rem",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          background: "var(--surface-color)",
          color: "var(--text-color)",
          outline: "none",
          marginBottom: "1rem",
        }}
      />

      {/* Hasil Pencarian */}
      <div id="searchResult" className="search-result">
        {q && results.length === 0 ? (
          <p className="muted">Tidak ada hasil untuk "{q}"</p>
        ) : !q ? (
          <p className="muted">Hasil pencarian akan muncul di sini.</p>
        ) : (
          results.map((item) => (
            <div
              key={item.term}
              className="search-item"
              style={{
                borderBottom: "1px solid var(--border-color)",
                padding: "0.75rem 0",
                cursor: "pointer",
              }}
              onClick={() => alert(`Kamu klik: ${item.term}`)} // ✅ bisa diganti dengan navigasi detail
            >
              <h4 style={{ marginBottom: ".35rem" }}>{item.term}</h4>
              <p className="muted" style={{ lineHeight: 1.6 }}>
                {mode === "moderate"
                  ? item.definitionModerate
                  : item.definitionFriendly}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
