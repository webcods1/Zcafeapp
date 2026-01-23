import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Detect standalone mode (PWA installed) - iOS and Android
const isStandalone =
  // iOS Safari
  window.navigator.standalone ||
  // Android Chrome and others
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: minimal-ui)').matches ||
  // Android referrer check
  document.referrer.includes('android-app://');

console.log('[PWA] Standalone detection:', {
  isStandalone,
  navigatorStandalone: window.navigator.standalone,
  displayMode: window.matchMedia('(display-mode: standalone)').matches,
  minimalUI: window.matchMedia('(display-mode: minimal-ui)').matches,
  userAgent: navigator.userAgent.includes('Android') ? 'Android' : 'iOS/Other'
});

if (isStandalone) {
  console.log('[PWA] Running in standalone mode');
  document.body.classList.add('standalone-mode');
  document.documentElement.classList.add('standalone-mode');
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service worker registered:', reg.scope))
      .catch(err => console.warn('Service worker registration failed:', err));
  });
}
