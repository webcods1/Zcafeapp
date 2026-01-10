// ZCafe Service Worker - React SPA Caching Strategy
// This works alongside firebase-messaging-sw.js for notifications

const CACHE_NAME = 'zcafe-cache-v2';
const ASSETS = [
  '/',
  '/logo.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll failed:', err);
      });
    })
  );
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  // Take control of all clients immediately
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and Firebase requests
  if (event.request.method !== 'GET' ||
    event.request.url.includes('firebasestorage') ||
    event.request.url.includes('googleapis') ||
    event.request.url.includes('gstatic')) {
    return;
  }

  // For navigation requests, always try network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

console.log('[SW] Service worker loaded');
