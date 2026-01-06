// ZCafe Service Worker - Caching Strategy
// This works alongside firebase-messaging-sw.js for notifications

const CACHE_NAME = 'zcafe-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/desktop.css',
  '/mobile.css',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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
    event.request.url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

console.log('[SW] Service worker loaded');
