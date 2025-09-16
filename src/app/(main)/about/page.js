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

      {/* === Blok teks di bawah banner (Konten diperbarui) === */}
      <section className="hero-content" aria-labelledby="about-title">
        <h1 id="about-title">Muda Melek Finansial</h1>
        <p className="muted">
          Muda Melek Finansial adalah platform media edukasi keuangan yang didedikasikan 
          untuk membantu masyarakat memahami dan mengelola uang dengan lebih bijak. 
          Kami percaya literasi keuangan adalah kunci untuk masa depan yang lebih aman dan sejahtera.
        </p>
      </section>

      <div className="card-grid" style={{ marginTop: '2rem' }}>
        <article className="option-card">
          <div className="icon" aria-hidden="true">🎯</div>
          <h3>Visi Kami</h3>
          <p>
            Meningkatkan literasi keuangan masyarakat Indonesia agar mampu
            mengambil keputusan finansial yang cerdas, bijak, dan berkelanjutan demi
            mencapai kemandirian finansial.
          </p>
        </article>

        <article className="option-card">
          <div className="icon" aria-hidden="true">🚀</div>
          <h3>Misi Kami</h3>
          <ul style={{ paddingLeft: '1.2rem', listStyle: 'disc' }}>
            <li>Menyediakan artikel edukatif yang jelas, ringkas, dan mudah dipahami.</li>
            <li>Membuat konten interaktif yang menarik untuk membuat belajar keuangan menjadi menyenangkan.</li>
            <li>Menawarkan kamus istilah keuangan yang sederhana dan mudah diakses.</li>
            <li>Memberdayakan generasi muda dengan pengetahuan finansial untuk masa depan yang kuat.</li>
          </ul>
        </article>
        
        <article className="option-card">
          <div className="icon" aria-hidden="true">💡</div>
          <h3>Mengapa Mudamelekfinansial?</h3>
          <p>
            Mudamelekfinansial lahir dari kesadaran bahwa banyak orang masih kesulitan 
            dengan konsep dasar keuangan. Kami ingin menjembatani kesenjangan ini 
            dengan platform yang melayani berbagai gaya belajar.
          </p>
        </article>
      </div>
    </>
  );
}