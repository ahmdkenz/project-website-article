// app/layout.js (Enhanced with i18n, PWA, and SEO improvements)

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
import '@/styles/home.css';
import '@/styles/footer-extra.css';

import { ModeProvider } from '@/context/ModeContext';
import { I18nProvider } from '@/lib/i18n';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import FontOptimizer from '@/components/FontOptimizer';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: {
    default: "Yuk Literasi Keuangan",
    template: "%s | Yuk Literasi Keuangan"
  },
  description: "Platform edukasi finansial untuk meningkatkan literasi keuangan masyarakat Indonesia dengan pendekatan yang menyenangkan dan mudah dipahami.",
  keywords: "literasi keuangan, edukasi finansial, investasi, menabung, perencanaan keuangan, finansial planning, indonesia",
  authors: [{ name: "Tim Yuk Literasi Keuangan" }],
  creator: "Tim Yuk Literasi Keuangan",
  publisher: "Yuk Literasi Keuangan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yukliterasikeuangan.id'),
  alternates: {
    canonical: '/',
    languages: {
      'id-ID': '/id',
      'en-US': '/en',
      'ms-MY': '/ms',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    title: 'Yuk Literasi Keuangan - Belajar Finansial dengan Menyenangkan',
    description: 'Platform edukasi finansial untuk meningkatkan literasi keuangan masyarakat Indonesia',
    siteName: 'Yuk Literasi Keuangan',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Yuk Literasi Keuangan - Platform Edukasi Finansial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yuk Literasi Keuangan',
    description: 'Platform edukasi finansial untuk meningkatkan literasi keuangan masyarakat Indonesia',
    images: ['/twitter-image.jpg'],
    creator: '@yukliterasikeuangan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'YukLiterasiKeuangan',
    'application-name': 'YukLiterasiKeuangan',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#2563eb',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#2563eb',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#2563eb" />
        
        {/* Additional PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="YukLiterasiKeuangan" />
        <meta name="application-name" content="YukLiterasiKeuangan" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Yuk Literasi Keuangan",
              "description": "Platform edukasi finansial untuk meningkatkan literasi keuangan masyarakat Indonesia",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://yukliterasikeuangan.id",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://yukliterasikeuangan.id"}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Yuk Literasi Keuangan",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://yukliterasikeuangan.id"}/logo.png`
                }
              }
            })
          }}
        />
      </head>
      <body>
        {/* Performance and Font Optimization */}
        <PerformanceMonitor />
        <FontOptimizer />
        
        {/* Combined Providers for better organization */}
        <ErrorBoundary>
          <I18nProvider>
            <ModeProvider>
              {children}
            </ModeProvider>
          </I18nProvider>
        </ErrorBoundary>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
