// app/(main)/articles/[slug]/ArticleContent.js
"use client"; // Menandakan ini adalah Client Component

import { useMode } from '@/context/ModeContext'; // Import hook untuk membaca mode

export default function ArticleContent({ article }) {
  // article adalah data yang kita dapat dari page.js
  const { mode } = useMode(); // Baca mode yang aktif

  // Pilih konten yang benar berdasarkan mode
  const contentToDisplay = mode === 'friendly' ? article.contentFriendly : article.contentModerate;

  return (
    <div 
      className="article-content" 
      // Tampilkan konten HTML dengan aman
      dangerouslySetInnerHTML={{ __html: contentToDisplay }} 
    />
  );
}