// src/app/(main)/home/page.js
export const revalidate = 60; // re-generate max tiap 60 detik

import { getAllArticles } from "@/lib/data";
import { getAllViews } from "@/lib/views";
import HomeHeroClient from "@/components/HomeHeroClient";
import HomeArticlesClient from "@/components/HomeArticlesClient";
import SavedListClient from "@/components/SavedListClient";

export default async function HomePage() {
  const all = await getAllArticles();
  const viewsMap = await getAllViews();

  // gabungkan views ke artikel
  const enriched = all.map((a) => ({
    ...a,
    views: viewsMap[a.slug] || 0,
  }));

  const latest = [...enriched]
    .filter((a) => a?.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const popular = [...enriched]
    .sort(
      (a, b) =>
        (b.views ?? 0) - (a.views ?? 0) ||
        (b.readTime ?? 0) - (a.readTime ?? 0) ||
        new Date(b.date || 0) - new Date(a.date || 0)
    )
    .slice(0, 4);

  return (
    <>
      <HomeHeroClient />
      <div
        className="homepage-articles-wrapper"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginTop: "3rem",
        }}
      >
        <HomeArticlesClient latest={latest} popular={popular} />

        {/* ✅ Artikel Tersimpan */}
        <section
          className="homepage-articles"
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <h2>⭐ Artikel Tersimpan</h2>
          <SavedListClient allArticles={enriched} />
        </section>
      </div>
    </>
  );
}
