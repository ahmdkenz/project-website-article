// app/(main)/flashcards/page.js
import { getAllFlashcards } from '@/lib/data';
import FlashcardList from '@/components/FlashcardList'; // Import komponen client kita

export default async function FlashcardsPage() {
  // 1. Ambil data di sisi server saat halaman di-build
  const flashcards = await getAllFlashcards();

  return (
    <>
      <section className="hero small">
        <h1>🎴 Flashcards Keuangan</h1>
        <p className="muted">Belajar istilah keuangan dengan cara yang lebih seru & interaktif.</p>
      </section>

      {/* 2. Render komponen client dan kirim data sebagai props */}
      <FlashcardList allFlashcards={flashcards} />
    </>
  );
}