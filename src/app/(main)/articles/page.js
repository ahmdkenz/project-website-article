// src/app/(main)/articles/page.js
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
  const cookieMode = cookieStore.get("site_mode")?.value;
  const activeMode = normMode(cookieMode);

  // enrich (full list, belum difilter) — ini yang kita kirim ke client untuk fallback
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

  // Server-side filtered list (untuk initial HTML sesuai cookie)
  const allArticlesFiltered = filterByMode(enrichedArticles, activeMode);

  // latest & popular precomputed server-side (sesuai mode) — untuk initial render
  const latest = getLatest(enrichedArticles, 6, { mode: activeMode });
  const popular = getPopular(enrichedArticles, viewsMap || {}, 6, { mode: activeMode });

  // kumpulkan tags (optional)
  const tagSet = new Set();
  enrichedArticles.forEach((a) => {
    if (Array.isArray(a.tags)) a.tags.forEach((t) => tagSet.add(t));
  });
  const allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  const bannerSrc = "/brand/hero-articles.jpg";

  // debug singkat (opsional: hapus setelah verifikasi)
  // console.log(`SERVER ArticlesPage activeMode=${activeMode} total=${enrichedArticles.length} filtered=${allArticlesFiltered.length} latest=${latest.length} popular=${popular.length}`);

  return (
    <>
      <section className="hero" style={{ "--hero-h-min": "220px", "--hero-h-fluid": "26vw", "--hero-h-max": "360px" }}>
        <div className="hero-media" aria-hidden="true">
          <Image src={bannerSrc} alt="" fill sizes="100vw" priority={false} className="hero-img" />
          <div className="hero-overlay" />
        </div>
      </section>

      <section className="hero-content" aria-labelledby="articles-title">
        <h1 id="articles-title">Kumpulan Artikel</h1>
        <p className="muted">Panduan, tips, dan pengetahuan finansial yang mudah dipahami.</p>
      </section>

      <section className="articles-compact container" aria-labelledby="articles-list">
        <React.Suspense fallback={<p>Loading articles...</p>}>
          {/* --- KIRIM enriched (full) agar client dapat fallback tanpa reload --- */}
          <ArticlesShowMoreClient
            allArticles={enrichedArticles}    // full list (client fallback)
            initialCount={6}
            step={6}
            // opsional: juga bisa kirim latest/popular precomputed
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
