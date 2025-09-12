// components/HomeHeroClient.js — CLIENT COMPONENT
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMode } from "@/context/ModeContext";

export default function HomeHeroClient() {
  const { mode } = useMode();

  const isFriendly = mode === "friendly";
  const title = isFriendly ? "Belajar Keuangan" : "Literasi Keuangan";
  const desc = isFriendly
    ? "Panduan singkat dan mudah dipahami untuk mengatur keuangan sehari-hari."
    : "Pendalaman manajemen keuangan dengan analisis dan strategi yang lebih serius.";

  return (
    <>
      {/* === BANNER BRAND: gambar saja, tanpa teks === */}
      <section className="hero" id="hero">
        <div className="hero-media" aria-hidden="true">
          <Image
            src="/brand/hero-mudamelekfinansial.jpg"  // pastikan file ada di /public/brand/
            alt=""                                     // dekoratif (teks ada di bawah)
            fill
            priority
            sizes="100vw"
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>
      </section>

      {/* === TEKS & CTA DIPISAH (tidak menutupi banner) === */}
      <section className="hero-content" aria-labelledby="hero-title">
        <h1 id="hero-title">{title}</h1>
        <p className="muted">{desc}</p>

        <div className="hero-actions">
          <Link href="/articles" className="btn btn-primary">Mulai</Link>
          <Link href="/articles" className="btn btn-ghost">Lihat Artikel</Link>
        </div>
      </section>

      {/* === Section pilihan cepat (tetap seperti sebelumnya) === */}
      <section id="main-options" className="options-section">
        <h2 className="section-title" style={{ textAlign: "center", marginTop: "3rem", marginBottom: "2rem", fontSize: "3rem" }}>
          Mau mulai dari mana?
        </h2>

        <div className="options-grid">
          <article className="option-card">
            <div className="icon">📰</div>
            <h3>Artikel</h3>
            <p className="muted">Baca artikel bertahap: dasar, menengah, hingga lanjutan.</p>
            <div className="card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <Link className="btn btn-primary" href="/articles">Buka Artikel</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🃏</div>
            <h3>Flashcards</h3>
            <p className="muted">Kartu interaktif untuk menghafal istilah-istilah penting.</p>
            <div className="card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <Link className="btn btn-ghost" href="/flashcards">Coba Flashcards</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🚀</div>
            <h3>Yuk Literasi</h3>
            <p className="muted">Kumpulan kiat & tutorial langkah demi langkah.</p>
            <div className="card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <Link className="btn btn-primary" href="/yuk-literasi">Mulai Yuk</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🔎</div>
            <h3>Cari Istilah</h3>
            <p className="muted">Ketik istilah keuangan, dapatkan definisi singkat.</p>
            <div className="card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
              <Link id="open-search" className="btn btn-ghost" href="/dictionary">Cari Istilah</Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
