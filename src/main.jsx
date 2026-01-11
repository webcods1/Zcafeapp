import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Detect standalone mode (PWA installed)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone ||
  document.referrer.includes('android-app://');

if (isStandalone) {
  console.log('Running in standalone mode (PWA)');
  document.body.classList.add('standalone-mode');
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service worker registered:', reg.scope);

        // Check for updates every 60 seconds when app is active
        setInterval(() => {
          reg.update();
        }, 60000);

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              console.log('New service worker activated');
              // Optionally reload to get new content
              // window.location.reload();
            }
          });
        });
      })
      .catch(err => console.warn('Service worker registration failed:', err));
  });

  // Handle service worker controller change (new SW activated)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('Service worker controller changed, reloading page');
      window.location.reload();
    }
  });
}
