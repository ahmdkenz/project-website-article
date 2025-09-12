"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import RealtimeViewCounter from "@/components/RealtimeViewCounter";

/** Util kecil */
const norm = (s) => (s || "").toString().toLowerCase().trim();

export default function ArticleList({ allArticles }) {
  const router = useRouter();
  const params = useSearchParams();

  // --- State management tidak berubah ---
  const urlCategory = params.get("category") || "";
  const urlTags = (params.get("tags") || "").split(",").map(t => t.trim()).filter(Boolean);
  const urlQ = params.get("q") || "";

  const [q, setQ] = useState(urlQ);
  const [category, setCategory] = useState(urlCategory);
  const [tags, setTags] = useState(urlTags);

  // [DIPERBAIKI] Logika Kategori dikembalikan menjadi sederhana dan stabil.
  // Selalu tampilkan semua kategori yang ada dari seluruh artikel.
  const { categories } = useMemo(() => {
    const catSet = new Set();
    (allArticles || []).forEach(a => {
      if (a?.category) catSet.add(a.category);
    });
    return {
      categories: Array.from(catSet).sort((a, b) => a.localeCompare(b)),
    };
  }, [allArticles]); // Dependensi hanya pada allArticles

  // [DIHAPUS] useEffect untuk "self-healing" tidak lagi diperlukan
  // karena daftar kategori sekarang sudah stabil.

  // --- Sinkronkan state -> URL (tidak berubah) ---
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

  // --- Logika filter artikel (tidak berubah) ---
  const filteredArticles = useMemo(() => {
    const nQ = norm(q);
    const nCat = norm(category);
    const tagSet = new Set(tags.map(norm));

    return (allArticles || []).filter((a) => {
      const hay = `${a?.title ?? ""} ${a?.excerpt ?? ""}`.toLowerCase();
      const matchQ = nQ ? hay.includes(nQ) : true;
      const matchCat = nCat ? norm(a?.category) === nCat : true;
      const aTags = Array.isArray(a?.tags) ? a.tags.map(norm) : [];
      const matchTags = tagSet.size
        ? Array.from(tagSet).every((t) => aTags.includes(t))
        : true;

      return matchQ && matchCat && matchTags;
    });
  }, [allArticles, q, category, tags]);

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

      {/* Hasil */}
      <section className="card-grid" style={{ marginTop: "1rem" }}>
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <article key={article.slug} className="article-card">
              <div className="article-content">
                <h3>{article.title}</h3>
                {article.excerpt && <p className="muted">{article.excerpt}</p>}

                {/* Kategori + Views */}
                <div style={{ marginTop: ".25rem", display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                  {article.category && <span className="badge">{article.category}</span>}
                  <RealtimeViewCounter slug={article.slug} />
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