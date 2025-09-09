// app/layout.js (Diperbaiki)

import '@/styles/globals.css';
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