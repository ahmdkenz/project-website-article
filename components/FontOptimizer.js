// components/FontOptimizer.js
"use client";

import { useEffect } from 'react';

export default function FontOptimizer() {
  useEffect(() => {
    // Preload critical fonts
    const preloadFont = (fontUrl, fontDisplay = 'swap') => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    };

    // Font loading optimization
    if ('fonts' in document) {
      // Load critical fonts first
      const criticalFonts = [
        {
          family: 'Inter',
          weight: '400',
          style: 'normal',
          display: 'swap'
        },
        {
          family: 'Inter',
          weight: '600',
          style: 'normal',
          display: 'swap'
        }
      ];

      // Load each critical font
      criticalFonts.forEach(font => {
        const fontFace = new FontFace(
          font.family,
          `url(/fonts/${font.family}-${font.weight}.woff2) format('woff2')`,
          {
            weight: font.weight,
            style: font.style,
            display: font.display
          }
        );

        fontFace.load().then(loadedFont => {
          document.fonts.add(loadedFont);
          console.log(`Font loaded: ${font.family} ${font.weight}`);
        }).catch(error => {
          console.warn(`Failed to load font: ${font.family}`, error);
        });
      });

      // Font loading event listeners
      document.fonts.addEventListener('loading', () => {
        console.log('Fonts are loading...');
      });

      document.fonts.addEventListener('loadingdone', () => {
        console.log('All fonts have finished loading');
        document.body.classList.add('fonts-loaded');
      });

      document.fonts.addEventListener('loadingerror', () => {
        console.warn('Some fonts failed to load');
        document.body.classList.add('fonts-failed');
      });
    }

    // Fallback for browsers without Font Loading API
    const addGoogleFonts = () => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    };

    // Load Google Fonts with fallback
    if (!('fonts' in document)) {
      addGoogleFonts();
    }

    // CSS for font loading states
    const style = document.createElement('style');
    style.textContent = `
      /* Font loading optimization */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        transition: font-family 0.2s ease;
      }
      
      body.fonts-loaded {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      
      body.fonts-failed {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }

      /* Prevent invisible text during font swap */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/fonts/Inter-Regular.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url('/fonts/Inter-Medium.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('/fonts/Inter-SemiBold.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/fonts/Inter-Bold.woff2') format('woff2');
      }

      /* Font loading states for critical text */
      .loading-text {
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .fonts-loaded .loading-text {
        opacity: 1;
      }
      
      /* Fallback for failed font loading */
      .fonts-failed .loading-text {
        opacity: 1;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }

      /* Reduce font weight for slow connections */
      @media (prefers-reduced-data: reduce) {
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
      }
    `;
    
    document.head.appendChild(style);

    // Resource hints for performance
    const addResourceHints = () => {
      // DNS prefetch for Google Fonts
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = '//fonts.googleapis.com';
      document.head.appendChild(dnsPrefetch);

      // Preconnect to Google Fonts
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect2);
    };

    addResourceHints();

    // Monitor font loading performance
    const measureFontLoadTime = () => {
      const startTime = performance.now();
      
      document.fonts.ready.then(() => {
        const loadTime = performance.now() - startTime;
        console.log(`Font loading time: ${loadTime.toFixed(2)}ms`);
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'font_load_time', {
            value: Math.round(loadTime),
            custom_parameter: 'performance'
          });
        }
      });
    };

    measureFontLoadTime();

  }, []);

  return null; // This component doesn't render anything
}

// Helper function to optimize font loading for specific components
export function useFontOptimization(fontFamily = 'Inter', weights = ['400', '600']) {
  useEffect(() => {
    if ('fonts' in document) {
      weights.forEach(weight => {
        const font = new FontFace(
          fontFamily,
          `url(/fonts/${fontFamily}-${weight}.woff2) format('woff2')`,
          { weight, display: 'swap' }
        );
        
        font.load().then(loadedFont => {
          document.fonts.add(loadedFont);
        }).catch(error => {
          console.warn(`Failed to load ${fontFamily} ${weight}:`, error);
        });
      });
    }
  }, [fontFamily, weights]);
}