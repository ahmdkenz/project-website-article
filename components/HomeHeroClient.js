// components/HomeHeroClient.js — CLIENT COMPONENT
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMode } from "@/context/ModeContext";

export default function HomeHeroClient() {
  const { mode } = useMode();

  const isFriendly = mode === "friendly";

  // --- Kalimat Profesional untuk Mode Friendly ---
  const friendlyTitle = "Memahami Uang Lebih Mudah";
  const friendlyDesc = "Pelajari langkah-langkah esensial untuk membangun kebiasaan finansial yang sehat, mulai dari menyusun anggaran hingga menabung secara efektif.";

  // --- Kalimat Profesional untuk Mode Moderate ---
  const moderateTitle = "Kecerdasan Finansial Strategis";
  const moderateDesc = "Tingkatkan pemahaman Anda dengan analisis berbasis data dan wawasan strategis yang dirancang untuk membantu Anda menavigasi kompleksitas keputusan investasi dan keuangan.";

  // Menggunakan kalimat yang sesuai dengan mode yang aktif
  const title = isFriendly ? friendlyTitle : moderateTitle;
  const desc = isFriendly ? friendlyDesc : moderateDesc;

  return (
    <>
      {/* === BANNER BRAND: sekarang dengan 2 gambar yang akan beranimasi === */}
      <section className="hero" id="hero">
        <div className="hero-media" aria-hidden="true">
          {/* --- PERUBAHAN DIMULAI DI SINI --- */}
          
          {/* Gambar Pertama */}
          <Image
            src="/brand/hero-mudamelekfinansial.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-img"
            id="hero-img-1" // ID untuk animasi CSS
          />

          {/* Gambar Kedua */}
          <Image
            src="/brand/hero-2.jpg" // Pastikan file ini ada di /public/brand/
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-img"
            id="hero-img-2" // ID untuk animasi CSS
          />

          {/* --- AKHIR PERUBAHAN --- */}
          <div className="hero-overlay" />
        </div>
      </section>

      {/* === TEKS & CTA DIPISAH (tidak menutupi banner) === */}
      <section className="hero-content" aria-labelledby="hero-title">
        <h1 id="hero-title">{title}</h1>
        <p className="muted">{desc}</p>

        <div className="hero-actions">
          <Link href="/articles" className="btn btn-primary">Mulai Belajar</Link>
          <Link href="/articles" className="btn btn-ghost">Lihat Artikel</Link>
        </div>
      </section>

      {/* === Section pilihan cepat (deskripsi diperbarui) === */}
      <section id="main-options" className="options-section">
        <h2 className="section-title" style={{ textAlign: "center", marginTop: "3rem", marginBottom: "2rem", fontSize: "3rem" }}>
          Mau mulai dari mana?
        </h2>

        <div className="options-grid">
          <article className="option-card">
            <div className="icon">📰</div>
            <h3>Artikel</h3>
            <p className="muted">Jelajahi wawasan mendalam melalui artikel yang terstruktur, dari tingkat pemula hingga ahli.</p>
            <div className="card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <Link className="btn btn-primary" href="/articles">Buka Artikel</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🃏</div>
            <h3>Flashcards</h3>
            <p className="muted">Perkuat pemahaman Anda akan istilah kunci keuangan melalui metode belajar interaktif.</p>
            <div className="card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <Link className="btn btn-ghost" href="/flashcards">Coba Flashcards</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🚀</div>
            <h3>Yuk Literasi</h3>
            <p className="muted">Ikuti panduan praktis dan studi kasus untuk menerapkan pengetahuan finansial Anda.</p>
            <div className="card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <Link className="btn btn-primary" href="/yuk-literasi">Mulai Yuk</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🔎</div>
            <h3>Glosarium</h3>
            <p className="muted">Akses glosarium lengkap kami untuk menemukan definisi istilah keuangan dengan cepat.</p>
            <div className="card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <Link id="open-search" className="btn btn-ghost" href="/dictionary">Cari Istilah</Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}