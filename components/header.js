// components/Header.js
"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react"; // [BARU] Impor useState

export default function Header() {
  // [BARU] State untuk melacak apakah menu mobile sedang terbuka atau tidak
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container">
        <Link href="/" className="logo">
          {/* [BARU] Logo yang bisa beradaptasi */}
          <span className="logo-desktop">Yuk Literasi Keuangan</span>
          <span className="logo-mobile">YLK</span>
        </Link>
        
        {/* [DIUBAH] Navigasi dengan class dinamis */}
        <nav className={isMenuOpen ? "nav-open" : ""}>
          <Link href="/home">Home</Link>
          <Link href="/articles">Artikel</Link>
          <Link href="/flashcards">Flashcards</Link>
          <Link href="/yuk-literasi">Yuk Literasi</Link>
          <Link href="/dictionary">Kamus</Link>
          <Link href="/about">Tentang</Link>
        </nav>

        <div className="header-actions">
          {/* [DIUBAH] Form pencarian hanya untuk desktop */}
          <form action="/search" method="get" className="search-form-desktop">
            <input
              type="text"
              name="q"
              placeholder="Cari..."
              aria-label="Cari"
            />
            <button className="btn btn-ghost" type="submit">Cari</button>
          </form>

          {/* [BARU] Link pencarian hanya untuk mobile */}
          <Link href="/search" className="search-icon-mobile" aria-label="Buka Pencarian">
            🔍
          </Link>

          <ThemeToggle />

          {/* [BARU] Tombol Hamburger hanya untuk mobile */}
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Buka menu"
            aria-expanded={isMenuOpen}
          >
            {/* Ikon hamburger (SVG) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}