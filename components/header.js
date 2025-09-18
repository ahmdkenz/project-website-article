// components/Header.js
"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/* === [TAMBAHAN] import komponen realtime search === */
import HeaderSearchDesktop from "@/components/HeaderSearchDesktop";
import SearchOverlay from "@/components/SearchOverlay";

export default function Header() {
  // State untuk menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /* === [TAMBAHAN] state overlay search mobile === */
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const pathname = usePathname();

  // Tutup menu saat rute berubah (aksesibilitas + UX)
  useEffect(() => {
    setIsMenuOpen(false);
    /* === [TAMBAHAN] tutup overlay saat pindah halaman === */
    setIsSearchOpen(false);
  }, [pathname]);

  // Tutup menu dengan tombol Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        /* === [TAMBAHAN] Esc juga menutup overlay === */
        setIsSearchOpen(false);
      }
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
            src="/brand/hero-logo.png"
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
          <Link href="/dictionary" onClick={() => setIsMenuOpen(false)}>Glosarium</Link>
          <Link href="/simulator" onClick={() => setIsMenuOpen(false)}>Simulasi</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)}>Tentang</Link>
        </nav>

        {/* Aksi di sisi kanan header */}
        <div className="header-actions">
          {/* ===================== */}
          {/*  SEARCH DESKTOP LAMA  */}
          {/* ===================== */}
          {/* [DIBIARKAN ADA, TAPI DISEMBUNYIKAN VIA CSS .legacy-search-desktop] */}
          <form
            action="/search"
            method="get"
            className="search-form-desktop legacy-search-desktop"
            role="search"
          >
            <input
              type="text"
              name="q"
              placeholder="Cari..."
              aria-label="Cari"
            />
            <button className="btn btn-ghost" type="submit">Cari</button>
          </form>

          {/* ======================== */}
          {/*  SEARCH DESKTOP (BARU)   */}
          {/* ======================== */}
          {/* form realtime + dropdown suggestions */}
          <div className="search-form-desktop">
            <HeaderSearchDesktop />
          </div>

          {/* ==================== */}
          {/*  SEARCH MOBILE LAMA  */}
          {/* ==================== */}
          {/* [DIBIARKAN ADA, TAPI DISEMBUNYIKAN VIA CSS .legacy-search-mobile] */}
          <Link href="/search" className="search-icon-mobile legacy-search-mobile" aria-label="Buka Pencarian">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="15.2" y1="15.2" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>

          {/* ===================== */}
          {/*  SEARCH MOBILE (BARU) */}
          {/* ===================== */}
          <button
            type="button"
            className="search-icon-mobile"
            aria-label="Buka Pencarian"
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen(true)}
            style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="15.2" y1="15.2" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

      {/* Script: Enter pada input search mobile langsung cari */}
      <script dangerouslySetInnerHTML={{__html:`
        document.addEventListener('DOMContentLoaded',function(){
          var overlay=document.querySelector('.search-overlay');
          if(!overlay)return;
          var input=overlay.querySelector('.search-overlay-input');
          if(!input)return;
          input.addEventListener('keydown',function(e){
            if(e.key==='Enter'){
              var val=input.value.trim();
              if(val.length>0){
                window.location.href='/search?q='+encodeURIComponent(val);
              }
            }
          });
        });
      `}} />
      {/* Style agar ikon search mobile menyesuaikan theme dan tanpa background */}
      <style jsx global>{`
        .search-icon-mobile {
          background: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .search-icon-mobile svg {
          color: #222;
          background: none !important;
          transition: color .2s;
        }
        html.dark .search-icon-mobile svg {
          color: #f1f5fa;
        }
      `}</style>

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

      {/* === [TAMBAHAN] Overlay mobile realtime === */}
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
