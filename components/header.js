// components/Header.js
"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  // State untuk menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Tutup menu saat rute berubah (aksesibilitas + UX)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Tutup menu dengan tombol Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="navbar">
      <div className="container">
        <Link href="/" className="logo" aria-label="Beranda">
          {/* Ikon/logo bulat */}
          <Image
            src="/brand/mudamelekfinansial-logo.png"
            alt="Mudamelekfinansial"
            width={48}
            height={48}
            priority
          />
          {/* Teks responsif: panjang di desktop, singkat di mobile */}
          <span className="logo-desktop">Mudamelekfinansial</span>
          <span className="logo-mobile" aria-hidden>YLK</span>
        </Link>

        {/* Navigasi utama (buka/tutup di mobile via class nav-open) */}
        <nav className={isMenuOpen ? "nav-open" : ""} aria-label="Navigasi utama">
          <Link href="/home" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="/articles" onClick={() => setIsMenuOpen(false)}>Artikel</Link>
          <Link href="/flashcards" onClick={() => setIsMenuOpen(false)}>Flashcards</Link>
          <Link href="/yuk-literasi" onClick={() => setIsMenuOpen(false)}>Yuk Literasi</Link>
          <Link href="/dictionary" onClick={() => setIsMenuOpen(false)}>Kamus</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)}>Tentang</Link>
        </nav>

        {/* Aksi di sisi kanan header */}
        <div className="header-actions">
          {/* Search form hanya desktop */}
          <form action="/search" method="get" className="search-form-desktop" role="search">
            <input
              type="text"
              name="q"
              placeholder="Cari..."
              aria-label="Cari"
            />
            <button className="btn btn-ghost" type="submit">Cari</button>
          </form>

          {/* Ikon search khusus mobile */}
          <Link href="/search" className="search-icon-mobile" aria-label="Buka Pencarian">
            🔍
          </Link>

          <ThemeToggle />

          {/* Tombol Hamburger (mobile) */}
          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
          >
            {/* SVG sesuai state */}
            {isMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                   xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6L18 18M6 18L18 6"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                   xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 6H20M4 12H20M4 18H20"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
