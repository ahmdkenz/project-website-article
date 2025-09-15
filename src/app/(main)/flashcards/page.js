// app/(main)/flashcards/page.js
import Image from "next/image";
import { getAllFlashcards } from '@/lib/data';
import FlashcardList from '@/components/FlashcardList'; // Import komponen client kita

export default async function FlashcardsPage() {
  // 1. Ambil data di sisi server saat halaman di-build
  const flashcards = await getAllFlashcards();

  // Gambar banner brand untuk halaman Flashcards
  const bannerSrc1 = "/brand/hero-flashcards.jpg";
  const bannerSrc2 = "/brand/hero-2.jpg"; // Gambar kedua, sama seperti di homepage

  return (
    <>
      {/* === Brand Banner (disesuaikan untuk animasi FADE) === */}
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          {/* --- PERUBAHAN: Struktur dikembalikan untuk animasi FADE --- */}
          
          {/* Gambar Pertama */}
          <Image
            src={bannerSrc1}
            alt=""
            fill // Gunakan 'fill' untuk menutupi container
            sizes="100vw"
            priority={false}
            className="hero-img"
            id="hero-img-1" // ID untuk target animasi
          />
          {/* Gambar Kedua */}
          <Image
            src={bannerSrc2}
            alt=""
            fill // Gunakan 'fill' untuk menutupi container
            sizes="100vw"
            priority={false}
            className="hero-img"
            id="hero-img-2" // ID untuk target animasi
          />
          
          {/* --- AKHIR PERUBAHAN --- */}
          <div className="hero-overlay" />
        </div>
      </section>

      {/* === Blok teks di bawah banner === */}
      <section className="hero-content" aria-labelledby="flashcards-title">
        <h1 id="flashcards-title">🎴 Flashcards Keuangan</h1>
        <p className="muted">Belajar istilah keuangan dengan cara yang lebih seru & interaktif.</p>
      </section>

      {/* 2. Render komponen client dan kirim data sebagai props */}
      <section>
        <FlashcardList allFlashcards={flashcards} />
      </section>
    </>
  );
}