// lib/i18n.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const I18nContext = createContext();

// Supported languages
export const SUPPORTED_LOCALES = {
  id: {
    name: 'Bahasa Indonesia',
    flag: '🇮🇩',
    dir: 'ltr'
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  },
  ms: {
    name: 'Bahasa Melayu',
    flag: '🇲🇾',
    dir: 'ltr'
  }
};

// Default locale
export const DEFAULT_LOCALE = 'id';

// Translation keys
export const translations = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.articles': 'Artikel',
    'nav.dictionary': 'Kamus',
    'nav.flashcards': 'Kartu Belajar',
    'nav.about': 'Tentang',
    'nav.search': 'Cari',
    
    // Welcome page
    'welcome.title': 'Selamat Datang di Muda Melek Finansial',
    'welcome.subtitle': 'Pilih gaya belajar yang paling sesuai — Friendly yang ringan atau Moderate yang terstruktur. Preferensi bisa diubah kapan saja.',
    'mode.friendly': 'Friendly Mode',
    'mode.moderate': 'Moderate Mode',
    'mode.friendly.desc': 'Bahasa santai, analogi ringan, cepat dipahami.',
    'mode.moderate.desc': 'Bahasa formal, data lebih lengkap untuk pendalaman.',
    'btn.choose.friendly': 'Pilih Friendly',
    'btn.choose.moderate': 'Pilih Moderate',
    
    // Common
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.noResults': 'Tidak ada hasil',
    'common.readMore': 'Baca Selengkapnya',
    'common.share': 'Bagikan',
    'common.bookmark': 'Tandai',
    'common.readTime': 'menit baca',
    
    // Search
    'search.placeholder': 'Cari artikel...',
    'search.results': 'Hasil pencarian',
    'search.noResults': 'Tidak ada hasil pencarian',
    
    // Theme
    'theme.dark': 'Mode Gelap',
    'theme.light': 'Mode Terang',
    'theme.switch': 'Ganti tema',
    
    // Footer
    'footer.copyright': '© 2025 Yuk Literasi Keuangan. Dibuat dengan ❤ untuk edukasi finansial.',
    
    // Accessibility
    'aria.menu': 'Menu navigasi',
    'aria.search': 'Pencarian',
    'aria.close': 'Tutup',
    'aria.open': 'Buka',
    'aria.next': 'Selanjutnya',
    'aria.previous': 'Sebelumnya'
  },
  
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.articles': 'Articles',
    'nav.dictionary': 'Dictionary',
    'nav.flashcards': 'Flashcards',
    'nav.about': 'About',
    'nav.search': 'Search',
    
    // Welcome page
    'welcome.title': 'Welcome to Young Financial Literacy',
    'welcome.subtitle': 'Choose the learning style that suits you best — Friendly for casual learning or Moderate for structured content. Preferences can be changed anytime.',
    'mode.friendly': 'Friendly Mode',
    'mode.moderate': 'Moderate Mode',
    'mode.friendly.desc': 'Casual language, simple analogies, easy to understand.',
    'mode.moderate.desc': 'Formal language, comprehensive data for deep learning.',
    'btn.choose.friendly': 'Choose Friendly',
    'btn.choose.moderate': 'Choose Moderate',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.noResults': 'No results found',
    'common.readMore': 'Read More',
    'common.share': 'Share',
    'common.bookmark': 'Bookmark',
    'common.readTime': 'min read',
    
    // Search
    'search.placeholder': 'Search articles...',
    'search.results': 'Search results',
    'search.noResults': 'No search results found',
    
    // Theme
    'theme.dark': 'Dark Mode',
    'theme.light': 'Light Mode',
    'theme.switch': 'Switch theme',
    
    // Footer
    'footer.copyright': '© 2025 Young Financial Literacy. Made with ❤ for financial education.',
    
    // Accessibility
    'aria.menu': 'Navigation menu',
    'aria.search': 'Search',
    'aria.close': 'Close',
    'aria.open': 'Open',
    'aria.next': 'Next',
    'aria.previous': 'Previous'
  },
  
  ms: {
    // Navigation
    'nav.home': 'Laman Utama',
    'nav.articles': 'Artikel',
    'nav.dictionary': 'Kamus',
    'nav.flashcards': 'Kad Belajar',
    'nav.about': 'Mengenai',
    'nav.search': 'Cari',
    
    // Welcome page
    'welcome.title': 'Selamat Datang ke Muda Celik Kewangan',
    'welcome.subtitle': 'Pilih gaya pembelajaran yang paling sesuai — Friendly yang ringan atau Moderate yang berstruktur. Keutamaan boleh diubah bila-bila masa.',
    'mode.friendly': 'Mod Mesra',
    'mode.moderate': 'Mod Sederhana',
    'mode.friendly.desc': 'Bahasa santai, analogi mudah, cepat difahami.',
    'mode.moderate.desc': 'Bahasa formal, data lengkap untuk pembelajaran mendalam.',
    'btn.choose.friendly': 'Pilih Mesra',
    'btn.choose.moderate': 'Pilih Sederhana',
    
    // Common
    'common.loading': 'Memuatkan...',
    'common.error': 'Ralat berlaku',
    'common.noResults': 'Tiada hasil',
    'common.readMore': 'Baca Lagi',
    'common.share': 'Kongsi',
    'common.bookmark': 'Tanda Buku',
    'common.readTime': 'min baca',
    
    // Search
    'search.placeholder': 'Cari artikel...',
    'search.results': 'Hasil carian',
    'search.noResults': 'Tiada hasil carian',
    
    // Theme
    'theme.dark': 'Mod Gelap',
    'theme.light': 'Mod Terang',
    'theme.switch': 'Tukar tema',
    
    // Footer
    'footer.copyright': '© 2025 Muda Celik Kewangan. Dibuat dengan ❤ untuk pendidikan kewangan.',
    
    // Accessibility
    'aria.menu': 'Menu navigasi',
    'aria.search': 'Carian',
    'aria.close': 'Tutup',
    'aria.open': 'Buka',
    'aria.next': 'Seterusnya',
    'aria.previous': 'Sebelumnya'
  }
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);

  // Load saved locale on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred_locale');
    if (saved && SUPPORTED_LOCALES[saved]) {
      setLocale(saved);
    }
  }, []);

  // Save locale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferred_locale', locale);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = locale;
    // Update HTML dir attribute for RTL languages (future use)
    document.documentElement.dir = SUPPORTED_LOCALES[locale]?.dir || 'ltr';
  }, [locale]);

  const t = (key, fallback = key) => {
    return translations[locale]?.[key] || translations[DEFAULT_LOCALE]?.[key] || fallback;
  };

  const changeLocale = (newLocale) => {
    if (SUPPORTED_LOCALES[newLocale]) {
      setLocale(newLocale);
    }
  };

  return (
    <I18nContext.Provider value={{
      locale,
      setLocale: changeLocale,
      t,
      supportedLocales: SUPPORTED_LOCALES
    }}>
      {children}
    </I18nContext.Provider>
  );
}