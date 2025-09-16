// public/sw.js
const CACHE_NAME = 'yuk-literasi-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/home',
  '/articles',
  '/dictionary',
  '/flashcards',
  '/about',
  '/manifest.json',
  // Add critical CSS and JS files
  '/_next/static/css/',
  '/_next/static/js/',
  // Add offline fallback page
  '/offline'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static files');
        return cache.addAll(STATIC_FILES.filter(url => !url.includes('/_next')));
      })
      .catch((error) => {
        console.error('[SW] Failed to precache:', error);
      })
  );
  
  // Force activate new service worker
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
  );
  
  // Take control of all pages
  return self.clients.claim();
});

// Fetch handler with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    handleFetch(request)
  );
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy for different types of resources
    if (url.pathname.startsWith('/api/')) {
      // API requests: Network first, cache as fallback
      return await networkFirstStrategy(request, DYNAMIC_CACHE);
    } else if (url.pathname.startsWith('/_next/static/')) {
      // Static assets: Cache first
      return await cacheFirstStrategy(request, STATIC_CACHE);
    } else if (url.pathname.includes('.')) {
      // Other assets (images, fonts, etc.): Cache first
      return await cacheFirstStrategy(request, STATIC_CACHE);
    } else {
      // Page requests: Stale while revalidate
      return await staleWhileRevalidateStrategy(request, DYNAMIC_CACHE);
    }
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return getOfflineFallback(request);
  }
}

// Cache first strategy (good for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// Network first strategy (good for dynamic content)
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale while revalidate strategy (good for pages)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // If network fails, we'll return cached version
    return cached;
  });
  
  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise;
}

// Offline fallback
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For page requests, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/offline') || new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Yuk Literasi Keuangan</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: #f8fafc;
              color: #334155;
            }
            .offline-container {
              max-width: 400px;
              margin: 0 auto;
              padding: 2rem;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .emoji { font-size: 3rem; margin-bottom: 1rem; }
            h1 { color: #1e293b; margin-bottom: 0.5rem; }
            p { color: #64748b; line-height: 1.6; }
            button {
              background: #2563eb;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="emoji">📚</div>
            <h1>Anda sedang offline</h1>
            <p>Koneksi internet tidak tersedia. Beberapa konten mungkin tidak dapat diakses.</p>
            <button onclick="window.location.reload()">Coba Lagi</button>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  // For other requests, return a generic offline response
  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

// Background sync for analytics and user actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('[SW] Background sync triggered');
}

// Push notifications support
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Buka',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});