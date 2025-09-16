// app/(main)/search/page.js
import { Suspense } from "react";
import Image from "next/image";
import SearchPageClient from "@/components/SearchPageClient";
import { searchAll } from "@/lib/search";
import { cookies } from "next/headers";
import {
  buildSummaryForArticle,
  buildSummaryForTerm,
  buildSummaryForCard,
} from "@/lib/search";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  // Ambil mode dari cookie (atau default 'friendly')
  const params = await searchParams;
  const q = (params?.q || "").toString();
  let mode = "friendly";
  try {
    const cookieStore = await cookies();
    const cookieMode = cookieStore.get("theme_mode");
    if (cookieMode && (cookieMode.value === "friendly" || cookieMode.value === "moderate")) {
      mode = cookieMode.value;
    } else {
      // Default yang aman jika tidak ada cookie
      mode = "moderate";
    }
  } catch (err) {
    console.warn("Error reading cookie, fallback to moderate mode:", err);
    mode = "moderate";
  }

  // Log untuk debug - membantu memahami mode yang aktif
  console.log(`[Search Page] Active mode: ${mode}, query: "${q}"`);
  
  let rawResults = null;
  try {
    // Gunakan searchAll dengan mode yang tepat
    rawResults = await searchAll(q, mode);
    rawResults = rawResults || {};
    
    // Log hasil pencarian untuk debug
    console.log(`[Search Page] Found ${rawResults.articles?.length || 0} articles in "${mode}" mode`);
  } catch (err) {
    console.warn("searchAll failed, fallback ke default data:", err?.message || err);
    rawResults = { articles: [], terms: [], flashcards: [] };
  }
  // Map artikel dan tambahkan filter sekali lagi untuk memastikan hanya mode yang tepat
  let articleResults = (rawResults.articles || [])
    .slice(0, 50)
    .map(buildSummaryForArticle)
    .filter(Boolean);
    
  // Double-check filter mode
  articleResults = articleResults.filter(article => {
    const articleMode = (article.mode || "moderate").toLowerCase().trim();
    return articleMode === mode;
  });
  
  console.log(`[Server Search] After final filter: ${articleResults.length} articles in "${mode}" mode`);
    
  const results = {
    articles: articleResults,
    terms: (rawResults.terms || [])
      .slice(0, 50)
      .map(buildSummaryForTerm)
      .filter(Boolean),
    flashcards: (rawResults.flashcards || [])
      .slice(0, 50)
      .map(buildSummaryForCard)
      .filter(Boolean),
  };
  // --- AKHIR BLOK DATA ---

  // Definisikan source gambar banner
  const bannerSrc1 = "/brand/hero-flashcards.jpg"; // Ganti jika perlu
  const bannerSrc2 = "/brand/hero-2.jpg";

  return (
    <>
      {/* === Blok teks di bawah banner === */}
      <section className="hero-content" aria-labelledby="search-title">
        <h1 id="search-title">🔍 Hasil Pencarian</h1>
        <p className="muted">
          Menampilkan hasil untuk: <strong>{q || "..."}</strong>
        </p>
      </section>

      {/* === KONTEN UTAMA dengan PERBAIKAN TATA LETAK === */}
      <section>
        {/* ✨ PERBAIKAN: Tambahkan div.container untuk membatasi lebar dan menengahkan konten */}
        <div className="container">
          <Suspense fallback={<p>Memuat hasil pencarian...</p>}>
            <SearchPageClient initialQuery={q} initialResults={results} />
          </Suspense>
        </div>
      </section>
    </>
  );
}