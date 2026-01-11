import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';

// Detect standalone mode (PWA installed)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone ||
  document.referrer.includes('android-app://');

if (isStandalone) {
  console.log('[PWA] Running in standalone mode');
  document.body.classList.add('standalone-mode');
}

// Render React App
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('[PWA ERROR] Root element not found');
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[PWA] Service worker registered:', reg.scope);

        // Check for updates every 60 seconds
        setInterval(() => reg.update(), 60000);

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              console.log('[PWA] New service worker activated');
            }
          });
        });
      })
      .catch(err => console.warn('[PWA] Service worker registration failed:', err));
  });

  // Handle service worker controller change
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] Controller changed, reloading');
      window.location.reload();
    }
  });
}
