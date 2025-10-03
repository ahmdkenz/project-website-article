"use client";

// Polyfill untuk browser lama, khususnya Safari
// File ini akan memuat polyfill yang diperlukan untuk fitur modern JavaScript

// Tambahkan di sini kode polyfill yang diperlukan jika fitur modern tidak tersedia
export function loadPolyfills() {
  // Periksa apakah di browser dan tunggu hingga window benar-benar tersedia
  if (typeof window === 'undefined') return;
  
  // Gunakan setTimeout untuk memastikan polyfill dimuat setelah hidratasi
  setTimeout(() => {
  
  // Polyfill untuk Promise.allSettled
  if (!Promise.allSettled) {
    Promise.allSettled = function(promises) {
      return Promise.all(
        promises.map(p => 
          Promise.resolve(p).then(
            value => ({ status: 'fulfilled', value }),
            reason => ({ status: 'rejected', reason })
          )
        )
      );
    };
  }

  // Polyfill untuk Array.prototype.at
  if (!Array.prototype.at) {
    Object.defineProperty(Array.prototype, 'at', {
      value: function(n) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        if (n < 0 || n >= this.length) return undefined;
        return this[n];
      },
      writable: true,
      enumerable: false,
      configurable: true
    });
  }

  // Polyfill untuk Object.fromEntries
  if (!Object.fromEntries) {
    Object.fromEntries = function(entries) {
      if (!entries || !entries[Symbol.iterator]) {
        throw new Error('Object.fromEntries requires an iterable object');
      }
      const obj = {};
      for (const [key, value] of entries) {
        obj[key] = value;
      }
      return obj;
    };
  }
  
  // Polyfill untuk String.prototype.replaceAll
  if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(str, newStr) {
      if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
        return this.replace(str, newStr);
      }
      return this.replace(new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
    };
  }

    console.log('[Polyfills] Browser compatibility polyfills loaded');
    
    // Deteksi Safari untuk log tambahan
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      console.info("[Polyfills] Safari-specific polyfills loaded");
    }
  }, 0); // setTimeout dengan delay 0 akan menjalankan setelah hidratasi
}