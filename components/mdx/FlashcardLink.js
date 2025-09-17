"use client";
import Link from "next/link";

export default function FlashcardLink({ term, children }) {
  return (
    <Link
      href={`/flashcards?search=${encodeURIComponent(term)}`}
      className="flashcard-link"
      style={{ color: "#0070f3", textDecoration: "underline", cursor: "pointer" }}
      title={`Lihat flashcard: ${term}`}
    >
      {children}
    </Link>
  );
}
