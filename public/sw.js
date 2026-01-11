// ZCafe Service Worker - React SPA Caching Strategy
// This works alongside firebase-messaging-sw.js for notifications

const CACHE_NAME = 'zcafe-cache-v5'; // Bumped for mobile PWA fixes
const ASSETS = [
  '/',
  '/logo.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Try to cache core assets, but don't fail installation if one fails
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll failed:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  return self.clients.claim(); // Take control immediately
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and Firebase requests
  if (event.request.method !== 'GET' ||
    event.request.url.includes('firebasestorage') ||
    event.request.url.includes('googleapis') ||
    event.request.url.includes('gstatic')) {
    return;
  }

  // **NETWORK FIRST** for navigation (HTML) requests
  // This ensures users always get the latest version of the app from the server
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Only fall back to cache if network fails (offline)
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // **STALE-WHILE-REVALIDATE** for assets (JS, CSS, Images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
      return cached || fetchPromise;
    })
  );
});

console.log('[SW] Service worker v5 loaded - Mobile PWA optimized');
