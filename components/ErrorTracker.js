"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Komponen untuk melacak dan melaporkan error pada halaman
export default function ErrorTracker() {
  const pathname = usePathname();
  const [errorCount, setErrorCount] = useState(0);
  
  useEffect(() => {
    // Reset error counter ketika halaman berubah
    setErrorCount(0);
    
    // Simpan referensi ke handler error asli
    let originalErrorHandler;
    try {
      originalErrorHandler = window.onerror;
    } catch (e) {
      console.warn("[ErrorTracker] Couldn't access window.onerror:", e);
    }
    
    // Fungsi untuk menangkap error JavaScript
    const errorHandler = (message, source, lineno, colno, error) => {
      try {
        // Panggil handler original jika ada
        if (typeof originalErrorHandler === 'function') {
          originalErrorHandler(message, source, lineno, colno, error);
        }
        
        // Tambahkan error counter
        setErrorCount(prev => prev + 1);
        
        // Log error ke console dengan informasi halaman
        console.error(`[ErrorTracker] Error on ${pathname}:`, message);
        
        // Deteksi Safari untuk log tambahan
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
          console.info("[ErrorTracker] Error occurred in Safari browser");
        }
        
        // Kirim ke layanan analitik (jika diperlukan)
        // if (window.gtag) {
        //   window.gtag('event', 'javascript_error', {
        //     'page': pathname,
        //     'message': message,
        //     'source': source,
        //     'line': lineno,
        //     'isSafari': isSafari
        //   });
        // }
      } catch (handlerError) {
        console.error("[ErrorTracker] Error in error handler:", handlerError);
      }
      
      // Return false untuk tidak menampilkan dialog error browser
      return false;
    };
    
    // Setup error handler
    window.onerror = errorHandler;
    
    // Unhandled promise rejection handler
    const rejectionHandler = (event) => {
      console.error('[ErrorTracker] Unhandled promise rejection:', event.reason);
      setErrorCount(prev => prev + 1);
    };
    
    // Setup promise rejection handler
    window.addEventListener('unhandledrejection', rejectionHandler);
    
    // Cleanup
    return () => {
      window.onerror = originalErrorHandler;
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, [pathname]);
  
  // Tidak render UI apapun, hanya sebagai utility
  return null;
}