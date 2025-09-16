// src/components/SearchResultsList.js
"use client";

import Link from "next/link";

export default function SearchResultsList({ results = [], onItemClick }) {
  if (!results?.length) {
    return <p className="muted">Tidak ada hasil.</p>;
  }

  return (
    <div className="search-result" role="listbox" aria-label="Hasil pencarian">
      {results.map((r) => (
        <div key={r.slug} className="search-item" role="option">
          <Link
            href={`/articles/${r.slug}`}
            onClick={onItemClick}
            className="search-item-link"
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <strong style={{ display: "block" }}>{r.title}</strong>
            {/* Mode badge */}
            {r.mode && (
              <span
                className={`badge badge-mode badge-mode-${r.mode}`}
                style={{
                  marginRight: 8,
                  background: r.mode === "friendly" ? "#ff9800" : "#8e24aa",
                  color: "#fff",
                  fontSize: ".8em",
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 8,
                  display: "inline-block"
                }}
              >
                {r.mode === "friendly"
                  ? "Friendly Mode"
                  : "Moderate Mode"}
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
