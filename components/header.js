// components/Header.js
"use client";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="navbar">
      <div className="container">
        <Link href="/" className="logo">
          Yuk Literasi Keuangan
        </Link>
        <nav>
          <Link href="/home">Home</Link>
          <Link href="/articles">Artikel</Link>
          <Link href="/flashcards">Flashcards</Link>
          <Link href="/dictionary">Kamus</Link>
          <Link href="/about">Tentang</Link>
        </nav>

        {/* Form pencarian sederhana menuju /search */}
        <form action="/search" method="get" style={{display:"flex",gap:".5rem",alignItems:"center"}}>
          <input
            type="text"
            name="q"
            placeholder="Cari..."
            aria-label="Cari"
            style={{padding:".5rem .75rem",border:"1px solid var(--border-color)",borderRadius:"8px"}}
          />
          <button className="btn btn-ghost" type="submit">Search</button>
        </form>

        <ThemeToggle />
      </div>
    </header>
  );
}
