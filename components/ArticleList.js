// src/components/ArticleList.js

"use client";

// [UPDATE] Impor 'useContext' dari React dan 'ModeContext'
import { useMemo, useState, useEffect, useContext } from "react";
import { ModeContext } from "@/context/ModeContext";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import RealtimeViewCounter from "@/components/RealtimeViewCounter";

/** Util kecil */
const norm = (s) => (s || "").toString().toLowerCase().trim();

export default function ArticleList({ allArticles }) {
  const router = useRouter();
  const params = useSearchParams();

  // [UPDATE] Ambil 'mode' yang sedang aktif dari context
  const { mode } = useContext(ModeContext);

  // --- State management tidak berubah ---
  const urlCategory = params.get("category") || "";
  const urlTags = (params.get("tags") || "").split(",").map(t => t.trim()).filter(Boolean);
  const urlQ = params.get("q") || "";

  const [q, setQ] = useState(urlQ);
  const [category, setCategory] = useState(urlCategory);
  const [tags, setTags] = useState(urlTags);

  // [UPDATE] Filter artikel berdasarkan 'mode' terlebih dahulu.
  // Ini menjadi sumber data baru untuk filter-filter selanjutnya.
  const modeFilteredArticles = useMemo(() => {
    if (mode === 'moderate') {
      return allArticles.filter(article => article.mode === 'moderate' || !article.mode);
    }
    // Defaultnya adalah 'friendly'
    return allArticles.filter(article => article.mode === 'friendly' || !article.mode);
  }, [allArticles, mode]);

  // [UPDATE] Logika untuk mendapatkan kategori sekarang berdasarkan artikel yang sudah difilter oleh 'mode'.
  // Ini memastikan daftar kategori yang tampil relevan dengan mode pengguna.
  const { categories } = useMemo(() => {
    const catSet = new Set();
    // Gunakan 'modeFilteredArticles' sebagai sumber data
    (modeFilteredArticles || []).forEach(a => {
      if (a?.category) catSet.add(a.category);
    });
    return {
      categories: Array.from(catSet).sort((a, b) => a.localeCompare(b)),
    };
  }, [modeFilteredArticles]);

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

  // [UPDATE] Logika filter artikel (pencarian, kategori, tag) sekarang bekerja
  // di atas 'modeFilteredArticles', bukan 'allArticles' lagi.
  const filteredArticles = useMemo(() => {
    const nQ = norm(q);
    const nCat = norm(category);
    const tagSet = new Set(tags.map(norm));

    // Gunakan 'modeFilteredArticles' sebagai sumber data
    return (modeFilteredArticles || []).filter((a) => {
      const hay = `${a?.title ?? ""} ${a?.excerpt ?? ""}`.toLowerCase();
      const matchQ = nQ ? hay.includes(nQ) : true;
      const matchCat = nCat ? norm(a?.category) === nCat : true;
      const aTags = Array.isArray(a?.tags) ? a.tags.map(norm) : [];
      const matchTags = tagSet.size
        ? Array.from(tagSet).every((t) => aTags.includes(t))
        : true;

      return matchQ && matchCat && matchTags;
    });
  }, [modeFilteredArticles, q, category, tags]); // Tambahkan 'modeFilteredArticles' sebagai dependensi

  const clearFilters = () => {
    setQ("");
    setCategory("");
    setTags([]);
  };

  return (
    <>
      {/* Search input (TIDAK ADA PERUBAHAN DI SINI) */}
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

      {/* Hasil (TIDAK ADA PERUBAHAN DI SINI, karena sudah menggunakan 'filteredArticles' yang baru) */}
      <section className="card-grid" style={{ marginTop: "1rem" }}>
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <article key={article.slug} className="article-card">
              {/* ... sisa dari JSX Anda tidak berubah ... */}
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