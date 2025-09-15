// app/(main)/search/page.js
import { Suspense } from "react";
import SearchPageClient from "@/components/SearchPageClient";
import { searchAll } from "@/lib/search";
import { buildSummaryForArticle, buildSummaryForTerm, buildSummaryForCard } from "@/lib/search";

// Pilihan dynamic:
// - "force-dynamic" -> hasil selalu up-to-date (disarankan jika data sering berubah atau menggunakan cookies/headers)
// - "force-static"  -> data diambil saat build, cocok untuk file-based static search
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  // 🔹 tunggu searchParams karena Next.js 15+ menjadikannya async
  const params = await searchParams;
  const q = (params?.q || "").toString();

  let rawResults = null;

  // 1) Coba panggil searchAll utama
  try {
    rawResults = await searchAll(q);
    rawResults = rawResults || {};
  } catch (err) {
    // fallback aman jika searchAll gagal
    console.warn("searchAll failed, fallback ke default data:", err?.message || err);
    rawResults = { articles: [], terms: [], flashcards: [] };
  }

  // 2) Ringkas data agar aman dikirim ke client
  const results = {
    articles: (rawResults.articles || [])
      .slice(0, 50) // batasi top 50
      .map(buildSummaryForArticle)
      .filter(Boolean),
    terms: (rawResults.terms || [])
      .slice(0, 50)
      .map(buildSummaryForTerm)
      .filter(Boolean),
    flashcards: (rawResults.flashcards || [])
      .slice(0, 50)
      .map(buildSummaryForCard)
      .filter(Boolean),
  };

  return (
    <Suspense fallback={<p>Loading search...</p>}>
      <SearchPageClient initialQuery={q} initialResults={results} />
    </Suspense>
  );
}
