/**
 * Notification Manager for ZCafe
 * Handles both web push notifications (FCM) and native notifications via Capacitor
 */

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

class NotificationManager {
    constructor() {
        this.isNative = Capacitor.isNativePlatform();
        this.messaging = null;
        this.fcmToken = null;
        this.initialized = false;
    }

    /**
     * Initialize push notifications
     */
    async initialize() {
        if (this.initialized) {
            console.log('Notification manager already initialized');
            return;
        }

        try {
            if (this.isNative) {
                await this.initializeNativeNotifications();
            } else {
                await this.initializeWebNotifications();
            }
            this.initialized = true;
            console.log('Notification manager initialized successfully');
        } catch (error) {
            console.error('Error initializing notification manager:', error);
            throw error;
        }
    }

    /**
     * Initialize native notifications for Android/iOS
     */
    async initializeNativeNotifications() {
        console.log('Initializing native notifications...');

        // Request permission
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.warn('Push notification permission not granted');
            return;
        }

        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        // Listen for registration success
        PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success, token: ' + token.value);
            this.fcmToken = token.value;
            this.saveTokenToDatabase(token.value);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Listen for push notifications received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received: ', notification);
            this.handleNotificationReceived(notification);
        });

        // Listen for push notification actions (when user taps on notification)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push notification action performed', notification);
            this.handleNotificationAction(notification);
        });

        console.log('Native notifications initialized');
    }

    /**
     * Initialize web push notifications using Firebase Cloud Messaging
     */
    async initializeWebNotifications() {
        console.log('Initializing web notifications...');

        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
            console.warn('Service workers are not supported');
            return;
        }

        // Check if Notification API is supported
        if (!('Notification' in window)) {
            console.warn('Notifications are not supported');
            return;
        }

        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);

            // Import Firebase Messaging dynamically
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
            const { getMessaging, getToken, onMessage } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js');

            // Initialize Firebase
            const firebaseConfig = {
                apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                authDomain: "zcafe-65f97.firebaseapp.com",
                databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com",
                projectId: "zcafe-65f97",
                storageBucket: "zcafe-65f97.firebasestorage.app",
                messagingSenderId: "480288327990",
                appId: "1:480288327990:web:9c79040289023919034b97",
                measurementId: "G-HKLYPNGTET"
            };

            const app = initializeApp(firebaseConfig);
            this.messaging = getMessaging(app);

            // Request notification permission
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('Notification permission granted');

                // Get FCM token
                // Note: You need to add your VAPID key from Firebase Console
                // Go to Project Settings > Cloud Messaging > Web Push certificates
                const currentToken = await getToken(this.messaging, {
                    vapidKey: 'YOUR_VAPID_KEY_HERE', // TODO: Replace with your actual VAPID key
                    serviceWorkerRegistration: registration
                });

                if (currentToken) {
                    console.log('FCM Token:', currentToken);
                    this.fcmToken = currentToken;
                    this.saveTokenToDatabase(currentToken);
                } else {
                    console.warn('No registration token available.');
                }

                // Handle foreground messages
                onMessage(this.messaging, (payload) => {
                    console.log('Message received (foreground): ', payload);
                    this.showForegroundNotification(payload);
                });
            } else {
                console.warn('Notification permission denied');
            }
        } catch (error) {
            console.error('Error initializing web notifications:', error);
            throw error;
        }
    }

    /**
     * Save FCM token to Firebase Database
     */
    async saveTokenToDatabase(token) {
        try {
            const userId = localStorage.getItem('userId') || 'anonymous';
            const deliveryAddress = localStorage.getItem('deliveryAddress') || '';
            const companyName = localStorage.getItem('companyName') || '';

            // Import Firebase Database
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
            const { getDatabase, ref, set } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

            const firebaseConfig = {
                apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
            };

            const app = initializeApp(firebaseConfig, 'notification-app');
            const db = getDatabase(app);

            // Save token with user information
            await set(ref(db, `fcm_tokens/${userId}`), {
                token: token,
                deliveryAddress: deliveryAddress,
                companyName: companyName,
                platform: this.isNative ? Capacitor.getPlatform() : 'web',
                timestamp: Date.now(),
                updatedAt: new Date().toISOString()
            });

            console.log('FCM token saved to database');
        } catch (error) {
            console.error('Error saving token to database:', error);
        }
    }

    /**
     * Handle notification received while app is in foreground (native)
     */
    handleNotificationReceived(notification) {
        // Play notification sound
        this.playNotificationSound();

        // You can also show a local notification or update the UI
        console.log('Notification received:', notification);
    }

    /**
     * Handle notification action (user tapped on notification)
     */
    handleNotificationAction(notificationAction) {
        const data = notificationAction.notification.data;

        // Navigate to appropriate page based on notification data
        if (data && data.page) {
            window.location.href = data.page;
        } else {
            window.location.href = '/notification.html';
        }
    }

    /**
     * Show foreground notification for web
     */
    showForegroundNotification(payload) {
        const notificationTitle = payload.notification?.title || payload.data?.title || 'ZCafe Notification';
        const notificationOptions = {
            body: payload.notification?.body || payload.data?.message || 'You have a new notification',
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [200, 100, 200],
            tag: 'zcafe-notification',
            requireInteraction: false
        };

        // Show browser notification
        if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
        }

        // Play notification sound
        this.playNotificationSound();
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Error playing notification sound:', e));
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    /**
     * Get current FCM token
     */
    getToken() {
        return this.fcmToken;
    }

    /**
     * Check if notifications are supported
     */
    isSupported() {
        if (this.isNative) {
            return true;
        }
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    /**
     * Check notification permission status
     */
    async getPermissionStatus() {
        if (this.isNative) {
            const permStatus = await PushNotifications.checkPermissions();
            return permStatus.receive;
        } else {
            if ('Notification' in window) {
                return Notification.permission;
            }
            return 'unsupported';
        }
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (this.isNative) {
            const permStatus = await PushNotifications.requestPermissions();
            return permStatus.receive === 'granted';
        } else {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
            return false;
        }
    }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;
