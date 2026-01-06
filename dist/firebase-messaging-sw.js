// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
    authDomain: "zcafe-65f97.firebaseapp.com",
    databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com",
    projectId: "zcafe-65f97",
    storageBucket: "zcafe-65f97.firebasestorage.app",
    messagingSenderId: "480288327990",
    appId: "1:480288327990:web:9c79040289023919034b97",
    measurementId: "G-HKLYPNGTET"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'ZCafe Notification';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.message || 'You have a new notification',
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [200, 100, 200],
        tag: 'zcafe-notification',
        requireInteraction: false,
        data: {
            url: payload.data?.url || '/',
            ...payload.data
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.');

    event.notification.close();

    // Navigate to the appropriate page
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there is already a window/tab open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window/tab
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
