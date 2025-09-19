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
      <section className="options-section">
        <h2 className="section-title">Panduan Praktis</h2>

        <div className="options-grid">
          <article className="option-card">
            <div className="icon" aria-hidden="true">📝</div>
            <h3>Manajemen Arus Kas</h3>
            <p className="muted">
              Lacak dan alokasikan pendapatan serta pengeluaran Anda untuk 
              mencapai kontrol finansial penuh.
            </p>
          </article>

          <article className="option-card">
            <div className="icon" aria-hidden="true">💳</div>
            <h3>Pengelolaan Utang</h3>
            <p className="muted">
              Manfaatkan instrumen kredit secara strategis dan hindari 
              beban bunga yang tidak perlu.
            </p>
          </article>

          <article className="option-card">
            <div className="icon" aria-hidden="true">💰</div>
            <h3>Akumulasi Aset</h3>
            <p className="muted">
              Alokasikan sebagian pendapatan secara konsisten untuk membangun 
              dana darurat dan modal masa depan.
            </p>
          </article>

          <article className="option-card">
            <div className="icon" aria-hidden="true">📈</div>
            <h3>Pengenalan Investasi</h3>
            <p className="muted">
              Pahami prinsip dasar instrumen investasi yang sesuai 
              dengan profil risiko dan tujuan Anda.
            </p>
          </article>

          <article className="option-card">
            <div className="icon" aria-hidden="true">🚫</div>
            <h3>Prioritas Finansial</h3>
            <p className="muted">
              Terapkan kerangka keputusan untuk membedakan pengeluaran 
              esensial dari pengeluaran konsumtif.
            </p>
          </article>

          <article className="option-card">
            <div className="icon" aria-hidden="true">📚</div>
            <h3>Edukasi Berkelanjutan</h3>
            <p className="muted">
              Akses sumber daya edukatif secara rutin untuk mempertajam 
              kecerdasan finansial Anda.
            </p>
          </article>
        </div>
      </section>
      
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