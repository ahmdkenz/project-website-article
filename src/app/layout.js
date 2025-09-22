// app/layout.js - Updated with proper CSS import order

// Import CSS dalam urutan yang benar untuk mencegah konflik
// 1. Variables FIRST - Foundation untuk semua style lainnya
import '@/styles/variables.css';

// 2. Base styles - Global defaults dan reset
import '@/styles/base.css';

// 3. Layout systems - Grid, flexbox, containers
import '@/styles/responsive.css';

// 4. Component styles - Komponen spesifik
import '@/styles/buttons.css';
import '@/styles/cards.css';
import '@/styles/leaderboard.css';
import '@/styles/simulator.css';
import '@/styles/header.css';
import '@/styles/header-responsive.css';
import '@/styles/footer.css';
import '@/styles/footer-extra.css';
import '@/styles/mini-cards.css';
import '@/styles/scroller.css';
import '@/styles/scroller-nav.css';
import '@/styles/flashcards.css';
import '@/styles/searchbar.css';
import '@/styles/search-results.css';
import '@/styles/search-overlay.css';
import '@/styles/mini-quizzes.css';

// 5. Page-specific styles
import '@/styles/homepage.css';
import '@/styles/hero-text.css';
import '@/styles/home.css';
import '@/styles/articles-compact.css';

// 6. Utility dan override styles LAST
import '@/styles/misc.css';

import { ModeProvider } from '@/context/ModeContext'; // <-- 1. IMPORT PROVIDER

export const metadata = {
  title: "Mudamelekfinansial",
  description: "Belajar finansial dengan cara menyenangkan",
};

// Pastikan skala viewport mobile benar dan mendukung notch/safe area
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
