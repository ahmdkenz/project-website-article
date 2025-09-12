// app/(main)/flashcards/page.js
import Image from "next/image";
import { getAllFlashcards } from '@/lib/data';
import FlashcardList from '@/components/FlashcardList'; // Import komponen client kita

export default async function FlashcardsPage() {
  // 1. Ambil data di sisi server saat halaman di-build
  const flashcards = await getAllFlashcards();

  // Gambar banner brand untuk halaman Flashcards (sesuaikan nama file asetmu)
  const bannerSrc = "/brand/hero-flashcards.jpg";

  return (
    <>
      {/* === Brand Banner (image-only) === */}
      <section
        className="hero"
        style={{
          // Opsional: tinggi responsif khusus untuk Flashcards
          "--hero-h-min": "220px",
          "--hero-h-fluid": "30vw",
          "--hero-h-max": "380px",
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
      <section className="hero-content" aria-labelledby="flashcards-title">
        <h1 id="flashcards-title">🎴 Flashcards Keuangan</h1>
        <p className="muted">Belajar istilah keuangan dengan cara yang lebih seru & interaktif.</p>
      </section>

      {/* 2. Render komponen client dan kirim data sebagai props */}
      <FlashcardList allFlashcards={flashcards} />
    </>
  );
}
