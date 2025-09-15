// app/about/page.js
import Image from "next/image";

export default function AboutPage() {
  // Siapkan dua gambar untuk banner
  const bannerSrc1 = "/brand/hero-about.jpg"; // siapkan aset ini (disarankan .webp)
  const bannerSrc2 = "/brand/hero-2.jpg"; // Gambar kedua, sama seperti di homepage

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

      {/* === Blok teks di bawah banner === */}
      <section className="hero-content" aria-labelledby="about-title">
        <h1 id="about-title">Tentang LiterasiKu</h1>
        <p className="muted">
          Media edukasi keuangan sederhana untuk membantu masyarakat memahami dan
          mengelola uang dengan lebih bijak.
        </p>
      </section>

      <div className="card-grid" style={{ marginTop: '2rem' }}>
        <article className="option-card">
          <div className="icon" aria-hidden="true">🎯</div>
          <h3>Visi Kami</h3>
          <p>
            Meningkatkan literasi keuangan masyarakat Indonesia agar mampu
            mengambil keputusan finansial yang cerdas, bijak, dan berkelanjutan.
          </p>
        </article>

        <article className="option-card">
          <div className="icon" aria-hidden="true">🚀</div>
          <h3>Misi Kami</h3>
          <ul style={{ paddingLeft: '1.2rem', listStyle: 'disc' }}>
            <li>Menyediakan artikel edukatif yang mudah dipahami.</li>
            <li>Membuat konten interaktif seperti flashcards.</li>
            <li>Menyediakan kamus istilah keuangan sederhana.</li>
            <li>Mendorong generasi muda untuk melek finansial.</li>
          </ul>
        </article>
        
        <article className="option-card">
          <div className="icon" aria-hidden="true">💡</div>
          <h3>Kenapa LiterasiKu?</h3>
          <p>
            LiterasiKu hadir karena banyak orang masih kesulitan memahami konsep
            dasar keuangan. Kami ingin semua orang bisa belajar sesuai gaya
            mereka.
          </p>
        </article>
      </div>
    </>
  );
}