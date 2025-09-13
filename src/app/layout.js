// app/layout.js (Diperbaiki - tanpa globals.css, pakai CSS terpisah)

// Import CSS global terpisah
import '@/styles/base.css';
import '@/styles/header.css';
import '@/styles/header-responsive.css';
import '@/styles/footer.css';
import '@/styles/buttons.css';
import '@/styles/cards.css';
import '@/styles/mini-cards.css';
import '@/styles/scroller.css';
import '@/styles/scroller-nav.css';
import '@/styles/flashcards.css';
import '@/styles/searchbar.css';
import '@/styles/misc.css';
import '@/styles/homepage.css';
import '@/styles/hero-text.css';
import '@/styles/responsive.css';
import '@/styles/search-results.css';
import '@/styles/search-overlay.css';
import '@/styles/articles-compact.css';
import '@/styles/flashcards-compact.css';
import '@/styles/footer-extra.css';

import { ModeProvider } from '@/context/ModeContext'; // <-- 1. IMPORT PROVIDER

export const metadata = {
  title: "Yuk Literasi Keuangan",
  description: "Belajar finansial dengan cara menyenangkan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {/* 2. BUNGKUS SEMUANYA DENGAN MODEPROVIDER */}
        <ModeProvider>
          {children}
        </ModeProvider>
      </body>
    </html>
  );
}
