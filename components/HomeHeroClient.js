// components/HomeHeroClient.js — CLIENT COMPONENT
"use client";

import Link from 'next/link';
import { useMode } from '@/context/ModeContext';

export default function HomeHeroClient() {
  const { mode } = useMode();

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-inner">
          {mode === 'friendly' ? (
            <>
              <h1>Belajar Keuangan</h1>
              <p className="muted">
                Panduan singkat dan mudah dipahami untuk mengatur keuangan sehari-hari.
              </p>
            </>
          ) : (
            <>
              <h1>Literasi Keuangan</h1>
              <p className="muted">
                Pendalaman manajemen keuangan dengan analisis dan strategi yang lebih serius.
              </p>
            </>
          )}

          <div className="hero-actions">
            <Link href="/articles" className="btn btn-primary">Mulai</Link>
            <Link href="/articles" className="btn btn-ghost">Lihat Artikel</Link>
          </div>
        </div>
      </section>

      <section id="main-options" className="options-section">
        <h2 className="section-title" style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
          Mau mulai dari mana?
        </h2>

        <div className="options-grid">
          <article className="option-card">
            <div className="icon">📰</div>
            <h3>Artikel</h3>
            <p className="muted">Baca artikel bertahap: dasar, menengah, hingga lanjutan.</p>
            <div className="card-actions" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <Link className="btn btn-primary" href="/articles">Buka Artikel</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🃏</div>
            <h3>Flashcards</h3>
            <p className="muted">Kartu interaktif untuk menghafal istilah-istilah penting.</p>
            <div className="card-actions" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <Link className="btn btn-ghost" href="/flashcards">Coba Flashcards</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🚀</div>
            <h3>Yuk Literasi</h3>
            <p className="muted">Kumpulan kiat & tutorial langkah demi langkah.</p>
            <div className="card-actions" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <Link className="btn btn-primary" href="/yuk-literasi">Mulai Yuk</Link>
            </div>
          </article>

          <article className="option-card">
            <div className="icon">🔎</div>
            <h3>Cari Istilah</h3>
            <p className="muted">Ketik istilah keuangan, dapatkan definisi singkat.</p>
            <div className="card-actions" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <Link id="open-search" className="btn btn-ghost" href="/dictionary">Cari Istilah</Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
