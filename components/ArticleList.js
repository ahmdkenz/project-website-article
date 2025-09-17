// components/ArticleList.js

"use client";

import { useMemo, useState, useEffect, useContext } from "react";
import { useMode } from "@/context/ModeContext";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import RealtimeViewCounter from "@/components/RealtimeViewCounter";

/** Util kecil untuk normalisasi */
const norm = (s) => (s || "").toString().toLowerCase().trim();

/** Normalisasi mode agar konsisten */
const normMode = (m) => {
  if (!m) return "moderate"; // treat missing mode as 'moderate' (conservative)
  const v = m.toString().toLowerCase().trim();
  if (v === "friendly" || v === "moderate" || v === "both") return v;
  return "moderate";
};

export default function ArticleList({ allArticles = [] }) {
  const router = useRouter();
  const params = useSearchParams();

  // Pastikan allArticles selalu array
  const safeArticles = Array.isArray(allArticles) ? allArticles : [];

  // Ambil 'mode' yang sedang aktif dari context
  const { mode: ctxMode } = useMode();
  const mode = normMode(ctxMode);

  // State dari URL
  const urlCategory = params.get("category") || "";
  const urlTags = (params.get("tags") || "").split(",").map(t => t.trim()).filter(Boolean);
  const urlQ = params.get("q") || "";

  // State lokal
  const [q, setQ] = useState(urlQ);
  const [category, setCategory] = useState(urlCategory);
  const [tags, setTags] = useState(urlTags);

  // Debug info
  useEffect(() => {
    console.log(`[ArticleList] Mode: ${mode}, Articles: ${safeArticles.length}, Query: "${q}", Category: "${category}", Tags: [${tags.join(', ')}]`);
  }, [mode, safeArticles, q, category, tags]);

  // Filter artikel berdasarkan 'mode' terlebih dahulu
  const modeFilteredArticles = useMemo(() => {
    return safeArticles.filter((article) => {
      const aMode = normMode(article?.mode);
      // Artikel dengan mode 'both' akan selalu ditampilkan
      if (aMode === "both") return true;
      // Artikel lain hanya ditampilkan jika mode-nya sama dengan mode saat ini
      return aMode === mode;
    });
  }, [safeArticles, mode]);

  // Ekstrak semua kategori dari artikel yang sudah difilter oleh mode
  const { categories } = useMemo(() => {
    const catSet = new Set();
    modeFilteredArticles.forEach(a => {
      if (a?.category) catSet.add(a.category);
    });
    return {
      categories: Array.from(catSet).sort((a, b) => a.localeCompare(b)),
    };
  }, [modeFilteredArticles]);

  // Sinkronkan state -> URL dengan debounce
  useEffect(() => {
    const handle = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (category) p.set("category", category);
      if (tags.length) p.set("tags", tags.join(","));
      const qs = p.toString();
      router.replace(`/articles${qs ? `?${qs}` : ""}`);
    }, 300);
    return () => clearTimeout(handle);
  }, [q, category, tags, router]);

  // Filter artikel (pencarian, kategori, tag) di atas modeFilteredArticles
  const filteredArticles = useMemo(() => {
    const nQ = norm(q);
    const nCat = norm(category);
    const tagSet = new Set(tags.map(norm));

    return modeFilteredArticles.filter((a) => {
      // Cari di judul dan ringkasan
      const hay = `${a?.title ?? ""} ${a?.excerpt ?? ""}`.toLowerCase();
      const matchQ = nQ ? hay.includes(nQ) : true;
      
      // Filter kategori jika dipilih
      const matchCat = nCat ? norm(a?.category) === nCat : true;
      
      // Filter tag jika dipilih
      const aTags = Array.isArray(a?.tags) ? a.tags.map(norm) : [];
      const matchTags = tagSet.size
        ? Array.from(tagSet).every((t) => aTags.includes(t))
        : true;

      return matchQ && matchCat && matchTags;
    });
  }, [modeFilteredArticles, q, category, tags]);

  // Reset filter
  const clearFilters = () => {
    setQ("");
    setCategory("");
    setTags([]);
  };

  return (
    <>
      {/* Search input */}
      <section className="search-area">
        <div className="search-wrapper">
          <input
            type="text"
            id="articleSearchInput"
            placeholder="Cari artikel berdasarkan judul atau ringkasan…"
            aria-label="Cari artikel"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        
        {/* Filter info dan tombol clear */}
        {(q || category || tags.length > 0) && (
          <div className="filter-info" style={{ display: "flex", justifyContent: "space-between", marginTop: ".5rem", fontSize: ".9rem" }}>
            <span>
              {filteredArticles.length} artikel ditemukan
              {category ? ` di kategori "${category}"` : ""}
              {tags.length > 0 ? ` dengan tag [${tags.join(", ")}]` : ""}
              {q ? ` mengandung "${q}"` : ""}
            </span>
            <button 
              onClick={clearFilters}
              className="btn btn-ghost btn-sm"
              style={{ padding: "0 .5rem", fontSize: ".8rem" }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

      {/* Kategori pills jika ada */}
      {categories.length > 0 && (
        <div className="categories-pills" style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? "" : cat)}
              className={`btn btn-sm ${category === cat ? "btn-primary" : "btn-outline"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Hasil artikel */}
      <section className="card-grid" style={{ marginTop: "1.5rem" }}>
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <article key={article.slug} className="article-card">
              <div className="article-content">
                <h3>{article.title}</h3>
                {article.excerpt && <p className="muted">{article.excerpt}</p>}

                {/* Kategori + Views */}
                <div style={{ marginTop: ".25rem", display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
                  {article.category && (
                    <span 
                      className="badge"
                      onClick={() => setCategory(article.category)}
                      style={{ cursor: "pointer" }}
                    >
                      {article.category}
                    </span>
                  )}
                  <RealtimeViewCounter slug={article.slug} />
                  {article.mode && (
                    <span className={`mode-badge mode-${article.mode}`} style={{ fontSize: '.8rem', opacity: 0.8 }}>
                      {article.mode === 'friendly' ? 'Friendly' : article.mode === 'moderate' ? 'Moderate' : 'Both'}
                    </span>
                  )}
                </div>

                {/* Aksi */}
                <div className="card-actions" style={{ marginTop: ".75rem" }}>
                  <Link href={`/articles/${article.slug}`} className="btn btn-ghost">
                    Baca Selengkapnya
                  </Link>
                </div>

                {/* Tags */}
                {Array.isArray(article.tags) && article.tags.length > 0 && (
                  <div
                    className="tags-row"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: ".35rem",
                      marginTop: ".75rem",
                      paddingTop: ".5rem",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    {article.tags.map((t) => (
                      <span 
                        key={t} 
                        className="tag"
                        onClick={() => setTags(prev => tags.includes(t) ? prev.filter(tag => tag !== t) : [...prev, t])}
                        style={{ cursor: "pointer" }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            Tidak ada artikel yang cocok dengan filter saat ini.
            {mode && <span style={{ display: "block", marginTop: ".5rem" }}>
              Mode konten saat ini: <strong>{mode === 'friendly' ? 'Friendly' : 'Moderate'}</strong>
            </span>}
          </p>
        )}
      </section>
    </>
  );
}
