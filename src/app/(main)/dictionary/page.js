// app/(main)/dictionary/page.js
import Image from "next/image";
import { getAllTerms } from '@/lib/data';
import DictionaryList from '@/components/DictionaryList';

export const revalidate = 60;

export default async function DictionaryPage() {
  const termsData = await getAllTerms();
  const allTermsList = Object.values(termsData).flat();

  // Gambar banner brand untuk halaman Kamus (sesuaikan asetmu)
  const bannerSrc = "/brand/hero-kamus.jpg"; // rekomendasi .webp

  return (
    <>
      {/* === Brand Banner (image-only, full-bleed) === */}
      <section
        className="hero"
        style={{
          // Tinggi banner lebih ringkas untuk Kamus
          "--hero-h-min": "200px",
          "--hero-h-fluid": "22vw",
          "--hero-h-max": "320px",
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
      <section className="hero-content" aria-labelledby="dictionary-title">
        <h1 id="dictionary-title">📖 Kamus Istilah Keuangan</h1>
        <p className="muted">Cari istilah keuangan dan pelajari definisinya dengan mudah.</p>
      </section>

      {/* === Konten utama dalam container === */}
      <main className="container">
        {/* Area pencarian */}
        <section className="options-section">
          <div className="search-area">
            <DictionaryList allTerms={allTermsList} />
          </div>
        </section>
      </main>
    </>
  );
}
