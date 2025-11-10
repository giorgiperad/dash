// sw.js - Service Worker for CCX PWA
const CACHE_NAME = 'crypto-collective-v7';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
  // Note: Icons should be added when they exist
];

const VERSION = 'v7.0.0';
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

// Install: Cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS.map(url => `${url}?v=${VERSION}`));
    }).then(() => self.skipWaiting()) // Force new SW to activate
  );
});

// Activate: Delete old caches + take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && !key.startsWith('dynamic-')) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages
  );
});

// Fetch: Network-first for API, Cache-first with fallback for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. API calls → always network
  if (
    url.origin.includes('coingecko.com') ||
    url.origin.includes('alternative.me') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses for 1 min
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then(cached => {
            return cached || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // 2. Static assets → cache first, then network (stale-while-revalidate)
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' || 
      event.request.destination === 'document' ||
      CORE_ASSETS.some(asset => url.pathname === new URL(asset, self.location).pathname)) {
    
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // 3. Everything else → network only with error handling
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return a basic response on network failure
      return new Response('Network error', { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

// Optional: Listen for update prompt
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
