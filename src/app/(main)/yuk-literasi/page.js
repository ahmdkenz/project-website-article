// app/(main)/yuk-literasi/page.js
import Image from "next/image";

export const metadata = {
  title: "Yuk Literasi - Yuk Literasi Keuangan",
  description:
    "Panduan literasi keuangan sederhana dan mendalam. Belajar mengatur uang, investasi, dan istilah keuangan dengan mudah.",
  openGraph: {
    title: "Yuk Literasi Keuangan",
    description: "Panduan literasi keuangan sederhana dan mendalam.",
    type: "website",
    url: "https://namadomainmu.com/",
    images: [
      {
        url: "https://namadomainmu.com/assets/cover.jpg",
        width: 1200,
        height: 630,
        alt: "Yuk Literasi Keuangan",
      },
    ],
  },
};

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

      {/* === Blok teks di bawah banner === */}
      <section className="hero-content" aria-labelledby="yl-title">
        <h1 id="yl-title">🚀 Yuk, Mulai Literasi Keuangan!</h1>
        <p className="muted">
          Kiat sederhana &amp; tutorial praktis agar makin bijak mengelola uang.
        </p>
      </section>

      {/* Kiat & Tutorial */}
      <section className="options-section">
        <h2 className="section-title">Kiat &amp; Tutorial</h2>

        <div className="options-grid">
          <article className="option-card">
            <div className="icon">📝</div>
            <h3>Buat Anggaran Bulanan</h3>
            <p className="muted">
              Catat pemasukan dan pengeluaran agar tahu ke mana uangmu pergi.
            </p>
          </article>

          <article className="option-card">
            <div className="icon">💳</div>
            <h3>Batasi Kartu Kredit</h3>
            <p className="muted">
              Gunakan hanya untuk kebutuhan penting dan bayar tagihan tepat waktu.
            </p>
          </article>

          <article className="option-card">
            <div className="icon">💰</div>
            <h3>Mulai Menabung Rutin</h3>
            <p className="muted">
              Sisihkan minimal 10% dari penghasilanmu untuk tabungan masa depan.
            </p>
          </article>

          <article className="option-card">
            <div className="icon">📈</div>
            <h3>Belajar Investasi</h3>
            <p className="muted">
              Kenali instrumen sederhana seperti reksa dana atau emas untuk pemula.
            </p>
          </article>

          <article className="option-card">
            <div className="icon">🚫</div>
            <h3>Hindari Utang Konsumtif</h3>
            <p className="muted">
              Bedakan antara kebutuhan &amp; keinginan sebelum memutuskan berhutang.
            </p>
          </article>

          <article className="option-card">
            <div className="icon">📚</div>
            <h3>Terus Belajar</h3>
            <p className="muted">
              Baca artikel, ikuti seminar, atau dengarkan podcast tentang finansial.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}