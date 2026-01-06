/**
 * Push Notification Sender Helper
 * 
 * This module provides functions to send push notifications to users
 * via Firebase Cloud Messaging (FCM).
 * 
 * NOTE: This requires Firebase Cloud Functions for production use.
 * For testing, use the Firebase Console Messaging feature.
 */

/**
 * Send push notification to specific users based on location and company
 * 
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.targetLocation - Target location ('all' or specific location)
 * @param {string} options.targetCompany - Target company ('all' or specific company)
 * @param {string} options.url - Optional URL to open when notification is clicked
 * 
 * @returns {Promise<Object>} Result object with success status
 */
export async function sendPushNotification(options) {
    const {
        title,
        message,
        targetLocation = 'all',
        targetCompany = 'all',
        url = '/notification.html'
    } = options;

    try {
        // Import Firebase Database
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
        const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

        const firebaseConfig = {
            apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
            databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
        };

        const app = initializeApp(firebaseConfig, 'notification-sender-' + Date.now());
        const db = getDatabase(app);

        // Get all FCM tokens from database
        const tokensRef = ref(db, 'fcm_tokens');
        const snapshot = await get(tokensRef);

        if (!snapshot.exists()) {
            console.warn('No FCM tokens found in database');
            return {
                success: false,
                message: 'No registered devices found'
            };
        }

        const tokensData = snapshot.val();
        const targetTokens = [];

        // Filter tokens based on location and company
        Object.entries(tokensData).forEach(([userId, data]) => {
            const matchLoc = targetLocation === 'all' || data.deliveryAddress === targetLocation;
            const matchComp = targetCompany === 'all' || data.companyName === targetCompany;

            if (matchLoc && matchComp) {
                targetTokens.push({
                    userId,
                    token: data.token,
                    platform: data.platform
                });
            }
        });

        if (targetTokens.length === 0) {
            console.warn('No matching tokens found for criteria:', { targetLocation, targetCompany });
            return {
                success: false,
                message: 'No recipients match the specified criteria'
            };
        }

        console.log(`Found ${targetTokens.length} recipients for notification`);

        /**
         * IMPORTANT: 
         * Direct FCM API calls require server-side implementation.
         * 
         * For production, you need to:
         * 1. Create a Firebase Cloud Function (see NOTIFICATION_SETUP.md)
         * 2. Call that function from here using Firebase Functions SDK
         * 
         * Example Cloud Function call:
         * 
         * import { getFunctions, httpsCallable } from 'firebase/functions';
         * const functions = getFunctions();
         * const sendNotification = httpsCallable(functions, 'sendPushNotification');
         * const result = await sendNotification({
         *   title, message, targetLocation, targetCompany, url
         * });
         */

        // For now, return the tokens that would receive the notification
        return {
            success: true,
            message: `Notification prepared for ${targetTokens.length} recipients`,
            recipientCount: targetTokens.length,
            recipients: targetTokens.map(t => ({
                userId: t.userId,
                platform: t.platform
            })),
            note: 'To actually send push notifications, please set up Firebase Cloud Functions. See NOTIFICATION_SETUP.md for details.'
        };

    } catch (error) {
        console.error('Error sending push notification:', error);
        return {
            success: false,
            message: 'Failed to send notification',
            error: error.message
        };
    }
}

/**
 * Get notification statistics
 * 
 * @returns {Promise<Object>} Statistics about registered devices
 */
export async function getNotificationStats() {
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
        const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

        const firebaseConfig = {
            apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
            databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
        };

        const app = initializeApp(firebaseConfig, 'stats-' + Date.now());
        const db = getDatabase(app);

        const tokensRef = ref(db, 'fcm_tokens');
        const snapshot = await get(tokensRef);

        if (!snapshot.exists()) {
            return {
                totalDevices: 0,
                platforms: { web: 0, android: 0, ios: 0 },
                locations: {},
                companies: {}
            };
        }

        const tokensData = snapshot.val();
        const stats = {
            totalDevices: 0,
            platforms: { web: 0, android: 0, ios: 0 },
            locations: {},
            companies: {}
        };

        Object.values(tokensData).forEach(data => {
            stats.totalDevices++;

            // Count by platform
            const platform = data.platform || 'web';
            stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;

            // Count by location
            const location = data.deliveryAddress || 'unknown';
            stats.locations[location] = (stats.locations[location] || 0) + 1;

            // Count by company
            const company = data.companyName || 'unknown';
            stats.companies[company] = (stats.companies[company] || 0) + 1;
        });

        return stats;

    } catch (error) {
        console.error('Error getting notification stats:', error);
        return null;
    }
}

/**
 * Test notification to current user only
 * Useful for testing without affecting other users
 * 
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export async function sendTestNotification(title = 'Test Notification', message = 'This is a test notification') {
    try {
        // Check if Notification API is available
        if (!('Notification' in window)) {
            alert('Notifications are not supported in this browser');
            return;
        }

        // Check permission
        if (Notification.permission !== 'granted') {
            alert('Please grant notification permission first');
            return;
        }

        // Create a local notification for testing
        const notification = new Notification(title, {
            body: message,
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [200, 100, 200],
            tag: 'test-notification'
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        console.log('Test notification sent successfully');
        return { success: true };

    } catch (error) {
        console.error('Error sending test notification:', error);
        return { success: false, error: error.message };
    }
}

// Example usage in admin.html:
/*
import { sendPushNotification, getNotificationStats, sendTestNotification } from './src/pushNotificationSender.js';

// Send notification to all users
const result = await sendPushNotification({
  title: 'New Offer!',
  message: 'Get 20% off on all coffee products',
  targetLocation: 'all',
  targetCompany: 'all'
});

console.log(result);

// Get stats
const stats = await getNotificationStats();
console.log('Notification Stats:', stats);

// Send test notification
await sendTestNotification('Test', 'Testing notifications');
*/
