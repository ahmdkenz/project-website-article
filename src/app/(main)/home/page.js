// src/app/(main)/home/page.js
export const revalidate = 60; // ISR: refresh max tiap 60 detik

// ⬇️ Pastikan CSS untuk behavior tombol mobile dimuat
import "@/styles/home.css";

import { getAllArticles } from "@/lib/data";
import { getAllViews } from "@/lib/views";
import HomeHeroClient from "@/components/HomeHeroClient";
import HomeArticlesTabsClient from "@/components/HomeArticlesClient"; // default export, boleh di-alias

// Ubah limit dengan mudah (null = tanpa batas)
const LATEST_LIMIT  = 5;   // set ke null jika ingin semua
const POPULAR_LIMIT = 5;   // set ke null jika ingin semua

export default async function HomePage() {
  const all = await getAllArticles();
  const viewsMap = await getAllViews();

  // gabungkan views ke artikel
  const enriched = all.map((a) => ({
    ...a,
    views: viewsMap[a.slug] || 0,
  }));

  // Terbaru (sort by date desc)
  const latestSorted = [...enriched]
    .filter((a) => a?.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = LATEST_LIMIT ? latestSorted.slice(0, LATEST_LIMIT) : latestSorted;

  // Populer (views desc, fallback readTime & date)
  const popularSorted = [...enriched].sort(
    (a, b) =>
      (b.views ?? 0) - (a.views ?? 0) ||
      (b.readTime ?? 0) - (a.readTime ?? 0) ||
      new Date(b.date || 0) - new Date(a.date || 0)
  );
  const popular = POPULAR_LIMIT ? popularSorted.slice(0, POPULAR_LIMIT) : popularSorted;

  return (
    <>
      {/* === Banner brand / hero di paling atas === */}
      <HomeHeroClient />

      {/* === Navigasi artikel horizontal (Disimpan · Terbaru · Populer) === */}
      <div
        className="homepage-articles-wrapper"
        style={{ display: "block", marginTop: "3rem" }}
      >
        <HomeArticlesTabsClient
          latest={latest}
          popular={popular}
          allArticles={enriched}
        />
      </div>
    </>
  );
}
