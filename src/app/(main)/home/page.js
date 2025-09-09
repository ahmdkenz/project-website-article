// app/(main)/home/page.js
export const revalidate = 60; // re-generate max tiap 60 detik

import { getAllArticles } from '@/lib/data';
import HomeHeroClient from '@/components/HomeHeroClient';
import HomeArticlesClient from '@/components/HomeArticlesClient';
import SavedListClient from "@/components/SavedListClient"; // ✅ tambah

export default async function HomePage() {
  const all = await getAllArticles();

  const latest = [...all]
    .filter(a => a?.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const popular = [...all]
    .sort((a, b) =>
      (b.views ?? 0) - (a.views ?? 0) ||
      (b.readTime ?? 0) - (a.readTime ?? 0) ||
      (new Date(b.date || 0) - new Date(a.date || 0))
    )
    .slice(0, 4);

  return (
    <>
      <HomeHeroClient />
      <div
        className="homepage-articles-wrapper"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '3rem'
        }}
      >
        <HomeArticlesClient latest={latest} popular={popular} />

        {/* ✅ Artikel Tersimpan (pakai data dari server via props) */}
        <section
          className="homepage-articles"
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <h2>⭐ Artikel Tersimpan</h2>
          <SavedListClient allArticles={all} />
        </section>
      </div>
    </>
  );
}
