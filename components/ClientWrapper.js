"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

// Import komponen dengan opsi ssr: false dalam client component
const ErrorBoundary = dynamic(() => import('@/components/ErrorBoundary'), {
  ssr: false
});

const SafariPolyfills = dynamic(() => import('@/lib/polyfills').then(mod => {
  mod.loadPolyfills();
  return () => null;
}), { ssr: false });

const ErrorTracker = dynamic(() => import('@/components/ErrorTracker'), {
  ssr: false
});

// Komponen wrapper untuk semua komponen dinamis
export default function ClientWrapper({ children }) {
  // Deteksi browser Safari dan tambahkan class setelah mounting komponen
  // Ini mencegah hydration mismatch karena kelas akan ditambahkan setelah hidratasi
  useEffect(() => {
    // Deteksi browser Safari untuk logging tambahan dan CSS khusus
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      console.info("Safari browser detected - enabling compatibility mode");
      document.documentElement.classList.add('safari');
    }

    // Setup global error handler
    window.onerror = function(message, source, lineno, colno, error) {
      console.error("Global error:", message, "at", source, lineno, colno);
      // Kirim ke layanan analitik jika diperlukan
    };
  }, []);

  return (
    <>
      <SafariPolyfills />
      <ErrorTracker />
      <ErrorBoundary showDetails={false}>
        {children}
      </ErrorBoundary>
    </>
  );
}