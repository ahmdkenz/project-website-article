// components/ArticleList.js
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

/** Util kecil */
const norm = (s) => (s || "").toString().toLowerCase().trim();

export default function ArticleList({ allArticles }) {
  const router = useRouter();
  const params = useSearchParams();

  // --- bootstrap filter dari URL ---
  const urlCategory = params.get("category") || "";
  const urlTags = (params.get("tags") || "").split(",").map(t => t.trim()).filter(Boolean);
  const urlQ = params.get("q") || "";

  const [q, setQ] = useState(urlQ);
  const [category, setCategory] = useState(urlCategory);
  const [tags, setTags] = useState(urlTags);

  // --- derive kategori & tag unik dari data ---
  const { categories, allTags } = useMemo(() => {
    const catSet = new Set();
    const tagSet = new Set();
    (allArticles || []).forEach(a => {
      if (a?.category) catSet.add(a.category);
      if (Array.isArray(a?.tags)) a.tags.forEach(t => t && tagSet.add(t));
    });
    return {
      categories: Array.from(catSet).sort((a, b) => a.localeCompare(b)),
      allTags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
    };
  }, [allArticles]);

  // --- sinkronkan state -> URL (debounce singkat) ---
  useEffect(() => {
    const handle = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (category) p.set("category", category);
      if (tags.length) p.set("tags", tags.join(","));
      const qs = p.toString();
      router.replace(`/articles${qs ? `?${qs}` : ""}`);
    }, 200);
    return () => clearTimeout(handle);
  }, [q, category, tags, router]);

  // --- filter artikel ---
  const filteredArticles = useMemo(() => {
    const nQ = norm(q);
    const nCat = norm(category);
    const tagSet = new Set(tags.map(norm));

    return (allArticles || []).filter((a) => {
      // by search
      const hay = `${a?.title ?? ""} ${a?.excerpt ?? ""}`.toLowerCase();
      const matchQ = nQ ? hay.includes(nQ) : true;

      // by category
      const matchCat = nCat ? norm(a?.category) === nCat : true;

      // by tags (semua tag terpilih harus ada pada artikel)
      const aTags = Array.isArray(a?.tags) ? a.tags.map(norm) : [];
      const matchTags = tagSet.size
        ? Array.from(tagSet).every((t) => aTags.includes(t))
        : true;

      return matchQ && matchCat && matchTags;
    });
  }, [allArticles, q, category, tags]);

  // --- helper toggle tag ---
  const toggleTag = (t) => {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

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
      </section>

      {/* Filter Bar */}
      <section
        className="filters"
        style={{
          display: "grid",
          gap: ".75rem",
          gridTemplateColumns: "1fr",
          margin: "0 0 1rem 0",
        }}
      >
        {/* Kategori */}
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
          <label htmlFor="categorySelect" className="muted" style={{ minWidth: 76 }}>
            Kategori
          </label>
          <select
            id="categorySelect"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="btn"
            style={{ minWidth: 220 }}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button className="btn-ghost" onClick={clearFilters} title="Reset filter">
            Reset
          </button>
        </div>
      </section>

{/* Hasil */}
<section className="card-grid" style={{ marginTop: "1rem" }}>
  {filteredArticles.length > 0 ? (
    filteredArticles.map((article) => (
      <article key={article.slug} className="article-card">
        <div className="article-content">
          <h3>{article.title}</h3>
          {article.excerpt && <p className="muted">{article.excerpt}</p>}

          {/* Kategori (badge kecil) */}
          {article.category ? (
            <div style={{ marginTop: ".25rem" }}>
              <span className="badge">{article.category}</span>
            </div>
          ) : null}

          {/* Aksi */}
          <div className="card-actions" style={{ marginTop: ".75rem" }}>
            <Link href={`/articles/${article.slug}`} className="btn btn-ghost">
              Baca Selengkapnya
            </Link>
          </div>

          {/* ✅ Tambahkan kembali tags di bawah tombol */}
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
                <span key={t} className="tag">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    ))
  ) : (
    <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
      Tidak ada artikel yang cocok dengan filter saat ini.
    </p>
  )}
</section>
    </>
  );
}
