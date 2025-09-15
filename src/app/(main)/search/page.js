// app/(main)/search/page.js
import { Suspense } from "react";
import Image from "next/image";
import SearchPageClient from "@/components/SearchPageClient";
import { searchAll } from "@/lib/search";
import {
  buildSummaryForArticle,
  buildSummaryForTerm,
  buildSummaryForCard,
} from "@/lib/search";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  // Blok kode untuk mengambil data pencarian tidak berubah
  const params = await searchParams;
  const q = (params?.q || "").toString();
  let rawResults = null;
  try {
    rawResults = await searchAll(q);
    rawResults = rawResults || {};
  } catch (err) {
    console.warn("searchAll failed, fallback ke default data:", err?.message || err);
    rawResults = { articles: [], terms: [], flashcards: [] };
  }
  const results = {
    articles: (rawResults.articles || [])
      .slice(0, 50)
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
  // --- AKHIR BLOK DATA ---

  // Definisikan source gambar banner
  const bannerSrc1 = "/brand/hero-flashcards.jpg"; // Ganti jika perlu
  const bannerSrc2 = "/brand/hero-2.jpg";

  return (
    // Gunakan Fragment <> untuk membungkus semua elemen
    <>
      {/* === Struktur Brand Banner (sama seperti halaman lain) === */}
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          {/* Wrapper untuk animasi slider */}
          <div className="hero-slider-wrapper">
            <Image
              src={bannerSrc1}
              alt=""
              fill
              sizes="100vw"
              priority={false}
              className="hero-img"
            />
            <Image
              src={bannerSrc2}
              alt=""
              fill
              sizes="100vw"
              priority={false}
              className="hero-img"
              style={{ objectFit: 'contain' }} // ✨ PERUBAHAN DI SINI
            />
          </div>
          <div className="hero-overlay" />
        </div>
      </section>

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