// app/(main)/articles/page.js
import React from "react";
import Image from "next/image";
import { cookies } from "next/headers";
import { getAllArticles, filterByMode, getLatest, getPopular, normMode } from "@/lib/data";
import { getAllViews } from "@/lib/views";
import Link from "next/link";
import ArticlesShowMoreClient from "@/components/ArticlesShowMoreClient";

export const revalidate = 60;

export default async function ArticlesPage() {
  // ambil data
  const articles = await getAllArticles();
  const viewsMap = await getAllViews();

  // WAJIB: await cookies() sebelum menggunakan .get(...)
  const cookieStore = await cookies();
  const cookieMode = cookieStore.get("theme_mode")?.value;
  const activeMode = normMode(cookieMode);

  // enrich (full list, belum difilter)
  const enrichedArticles = (Array.isArray(articles) ? articles : []).map((a) => ({
    ...a,
    slug: a.slug,
    title: a.title,
    date: a.date,
    excerpt: a.excerpt,
    tags: Array.isArray(a.tags) ? a.tags : [],
    category: a.category ?? null,
    cover: a.cover ?? null,
    mode: a.mode ?? null,
    views: Number(viewsMap?.[a.slug] ?? 0),
  }));

  // Server-side filtered list
  const allArticlesFiltered = filterByMode(enrichedArticles, activeMode);
  const latest = getLatest(enrichedArticles, 6, { mode: activeMode });
  const popular = getPopular(enrichedArticles, viewsMap || {}, 6, { mode: activeMode });

  // kumpulkan tags
  const tagSet = new Set();
  enrichedArticles.forEach((a) => {
    if (Array.isArray(a.tags)) a.tags.forEach((t) => tagSet.add(t));
  });
  const allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  // Siapkan dua gambar untuk banner
  const bannerSrc1 = "/brand/hero-articles.jpg";
  const bannerSrc2 = "/brand/hero-2.jpg";

  return (
    <>
      {/* --- PERUBAHAN 1: 'style' untuk tinggi khusus dihapus dari section ini --- */}
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          {/* --- PERUBAHAN 2: Struktur diubah menjadi tumpukan 2 gambar untuk animasi fade --- */}
          <Image
            src={bannerSrc1}
            alt=""
            fill
            sizes="100vw"
            priority={false}
            className="hero-img"
            id="hero-img-1"
          />
          <Image
            src={bannerSrc2}
            alt=""
            fill
            sizes="100vw"
            priority={false}
            className="hero-img"
            id="hero-img-2"
          />
          <div className="hero-overlay" />
        </div>
      </section>

      {/* === Teks diperbarui di bawah ini === */}
      <section className="hero-content" aria-labelledby="articles-title">
        <h1 id="articles-title" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <span style={{fontSize:'1.2em',marginRight:6}}>📝</span>
          Artikel & Wawasan Finansial
        </h1>
        <p className="muted" style={{textAlign:'center'}}>
          Temukan artikel pilihan, tips, dan analisis mendalam untuk meningkatkan literasi keuangan Anda.
        </p>
      </section>

      <section className="articles-compact container" aria-labelledby="articles-list">
        <React.Suspense fallback={<p>Loading articles...</p>}>
          <ArticlesShowMoreClient
            allArticles={enrichedArticles}
            initialCount={6}
            step={6}
            latest={latest}
            popular={popular}
          />
        </React.Suspense>
      </section>

      {allTags.length > 0 && (
        <section className="tags-section" style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: ".75rem" }}>Semua Tag</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {allTags.map((t) => (
              <Link key={t} href={`/articles?tags=${encodeURIComponent(t)}`} className="tag">#{t}</Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}