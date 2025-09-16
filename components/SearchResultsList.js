// src/components/SearchResultsList.js
"use client";

import Link from "next/link";
import { useMode } from "@/context/ModeContext";

export default function SearchResultsList({ results = [], onItemClick }) {
  const { mode } = useMode(); // Akses mode aktif
  
  // Debug info
  console.log(`[SearchResultsList] Current mode: ${mode}, Results count before filter: ${results?.length || 0}`);
  if (results?.length > 0) {
    console.log(`[SearchResultsList] First result mode: ${results[0]?.mode || 'not set'}`);
  }
  
  // Filter hasil berdasarkan mode aktif (jika dalam friendly mode)
  // Jika dalam mode friendly, hanya tampilkan hasil friendly
  // Jika dalam mode moderate, tampilkan semua hasil
  const filteredResults = results?.filter(item => {
    // Jika tidak ada mode pada item, defaultnya moderate
    const itemMode = (item.mode || "moderate").toLowerCase().trim();
    
    // Hanya filter jika mode saat ini adalah friendly
    if (mode === "friendly") {
      return itemMode === "friendly";
    }
    // Dalam moderate mode, tampilkan semua hasil
    return true;
  });
  
  console.log(`[SearchResultsList] Results count after filter: ${filteredResults?.length || 0}`);
  
  if (!filteredResults?.length) {
    return <p className="muted">Tidak ada hasil untuk mode {mode}.</p>;
  }

  return (
    <div className="search-result" role="listbox" aria-label="Hasil pencarian">
      {filteredResults.map((r) => (
        <div key={r.slug} className="search-item" role="option">
          <Link
            href={`/articles/${r.slug}`}
            onClick={onItemClick}
            className="search-item-link"
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <strong style={{ display: "block" }}>{r.title}</strong>
            {/* Mode badge - Lebih jelas dengan icon */}
            {r.mode && (
              <span
                className={`badge badge-mode badge-mode-${r.mode}`}
                style={{
                  marginRight: 8,
                  background: r.mode === "friendly" ? "#ff9800" : "#8e24aa",
                  color: "#fff",
                  fontSize: ".8em",
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {r.mode === "friendly" ? (
                  <>
                    <span style={{ fontSize: "14px" }}>👶</span>
                    <span>Friendly Mode</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "14px" }}>🧠</span>
                    <span>Moderate Mode</span>
                  </>
                )}
              </span>
            )}
            {r.excerpt ? (
              <span className="muted" style={{ fontSize: ".9rem" }}>
                {r.excerpt}
              </span>
            ) : null}
            <div style={{ marginTop: ".35rem", display: "flex", gap: ".35rem", flexWrap: "wrap" }}>
              {r.category ? <span className="badge">{r.category}</span> : null}
              {Array.isArray(r.tags) &&
                r.tags.slice(0, 3).map((t) => (
                  <span className="tag" key={t}>#{t}</span>
                ))}
              {r.readTime ? <span className="tag">{r.readTime} min</span> : null}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
