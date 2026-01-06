/**
 * Initialize Notifications for ZCafe App
 * This script should be included in all pages to enable background notifications
 */

import notificationManager from './notificationManager.js';

// Initialize notifications when the app loads
async function initializeNotifications() {
    try {
        console.log('Starting notification initialization...');

        // Check if notifications are supported
        if (!notificationManager.isSupported()) {
            console.warn('Notifications are not supported on this device');
            return;
        }

        // Check current permission status
        const permissionStatus = await notificationManager.getPermissionStatus();
        console.log('Current notification permission:', permissionStatus);

        // If permission is already granted, initialize
        if (permissionStatus === 'granted') {
            await notificationManager.initialize();
            console.log('Notifications initialized successfully');
        }
        // If permission is default/prompt, we'll ask when user interacts
        else if (permissionStatus === 'prompt' || permissionStatus === 'default') {
            console.log('Notification permission not yet requested');
            // You can choose to request permission here or wait for user action
            // For better UX, we'll wait for user action in notification.html
        }
        // If permission is denied
        else {
            console.warn('Notification permission denied by user');
        }
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotifications);
} else {
    initializeNotifications();
}

// Export for manual initialization if needed
export { notificationManager, initializeNotifications };
