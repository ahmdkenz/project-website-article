// src/app/(main)/articles/page.js
import React from "react"; // gunakan React.Suspense, hindari duplikat identifier
import Image from "next/image";
import { getAllArticles } from "@/lib/data";
import { getAllViews } from "@/lib/views";
import ArticleList from "@/components/ArticleList";
import Link from "next/link";

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  const viewsMap = await getAllViews();

  // gabungkan views ke setiap artikel
  const enrichedArticles = articles.map((a) => ({
    ...a,
    views: viewsMap[a.slug] || 0,
  }));

  // kumpulkan semua tags unik
  const tagSet = new Set();
  enrichedArticles.forEach((a) => {
    if (Array.isArray(a.tags)) a.tags.forEach((t) => tagSet.add(t));
  });
  const allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  // Gambar banner brand untuk halaman Artikel
  const bannerSrc = "/brand/hero-articles.jpg"; // ganti sesuai asetmu (disarankan .webp)

  return (
    <>
      {/* === Brand Banner (image-only) === */}
      <section
        className="hero"
        style={{
          // Opsional: sesuaikan tinggi banner halaman ini
          "--hero-h-min": "220px",
          "--hero-h-fluid": "26vw",
          "--hero-h-max": "360px",
        }}
      >
        <div className="hero-media" aria-hidden="true">
          <Image
            src={bannerSrc}
            alt=""
            fill
            sizes="100vw"
            priority={false}
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>
      </section>

      {/* === Blok teks di bawah banner === */}
      <section className="hero-content" aria-labelledby="articles-title">
        <h1 id="articles-title">Kumpulan Artikel</h1>
        <p className="muted">
          Panduan, tips, dan pengetahuan finansial yang mudah dipahami.
        </p>
      </section>

      {/* Bungkus ArticleList dengan React.Suspense */}
      <React.Suspense fallback={<p>Loading articles...</p>}>
        <ArticleList allArticles={enrichedArticles} />
      </React.Suspense>

      {/* Tags Section sebelum footer */}
      {allTags.length > 0 && (
        <section
          className="tags-section"
          style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <h3 style={{ marginBottom: ".75rem" }}>Semua Tag</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/articles?tags=${encodeURIComponent(t)}`}
                className="tag"
              >
                #{t}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
