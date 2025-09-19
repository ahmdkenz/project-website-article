'use client';

// app/(main)/yuk-literasi/page.js
import Image from "next/image";
import TutorialList from './components/TutorialList';

export default function YukLiterasiPage() {
  // Siapkan dua gambar untuk banner
  const bannerSrc1 = "/brand/hero-yuk-literasi.jpg";
  const bannerSrc2 = "/brand/hero-2.jpg";

  return (
    <>
      {/* === Brand Banner (disesuaikan dengan animasi & ukuran standar) === */}
      
      {/* PERUBAHAN 1: Blok 'style' dihapus agar ukurannya sama seperti homepage */}
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          {/* PERUBAHAN 2: Struktur diubah menjadi tumpukan 2 gambar untuk animasi fade */}
          <Image
            src={bannerSrc1}
            alt=""
            fill
            sizes="100vw"
            priority={false}
            className="hero-img"
            id="hero-img-1"
          />
          <Image
            src={bannerSrc2}
            alt=""
            fill
            sizes="100vw"
            priority={false}
            className="hero-img"
            id="hero-img-2"
          />
          <div className="hero-overlay" />
        </div>
      </section>

      {/* === Blok teks di bawah banner (Konten diperbarui) === */}
      <section className="hero-content" aria-labelledby="yl-title">
        <h1 id="yl-title" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <span style={{fontSize:'1.2em',marginRight:6}}>🚀</span>
          Panduan Finansial Aplikatif
        </h1>
        <p className="muted" style={{textAlign:'center'}}>
          Kumpulan panduan praktis dan studi kasus yang dirancang untuk membantu Anda menerapkan konsep keuangan dalam kehidupan sehari-hari.
        </p>
      </section>

      {/* Mini Tutorial Section */}
      <div className="container">
        <TutorialList />
      </div>

      {/* Kiat & Tutorial (Konten diperbarui) */}
      {/* The options-grid block has been removed as its content is now dynamically generated from Markdown tutorials. */}
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
      `}</style>
    </>
  );
}