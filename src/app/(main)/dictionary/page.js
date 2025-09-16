// app/(main)/dictionary/page.js
import Image from "next/image";
import { getAllTerms } from '@/lib/data';
import DictionaryList from '@/components/DictionaryList';

export const revalidate = 60;

export default async function DictionaryPage() {
  const termsData = await getAllTerms();
  const allTermsList = Object.values(termsData).flat();

  // Siapkan dua gambar untuk banner
  const bannerSrc1 = "/brand/hero-kamus.jpg";
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
      <section className="hero-content" aria-labelledby="dictionary-title">
        <h1 id="dictionary-title" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <span style={{fontSize:'1.2em',marginRight:6}}>📚</span>
          Glosarium Finansial Komprehensif
        </h1>
        <p className="muted" style={{textAlign:'center'}}>
          Referensi esensial untuk memahami bahasa keuangan. Dapatkan akses cepat ke definisi yang akurat untuk menavigasi dunia finansial dengan lebih percaya diri.
        </p>
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