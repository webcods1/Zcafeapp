# ZCafe Background Notifications Setup Guide

## Overview
This guide explains how to complete the setup for background push notifications on both Android and iOS platforms.

## What Has Been Implemented

✅ **Capacitor Push Notifications Plugin** - Installed and configured
✅ **Firebase Cloud Messaging Service Worker** - Handles background notifications on web
✅ **Unified Notification Manager** - Handles both native (Android/iOS) and web notifications
✅ **Auto-initialization** - Notifications automatically initialize on app load
✅ **Notification Permission Handling** - Smart permission requests
✅ **FCM Token Management** - Tokens saved to Firebase Database

## Required Setup Steps

### 1. Get Your VAPID Key from Firebase (For Web Push)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **zcafe-65f97**
3. Click on **Project Settings** (gear icon)
4. Go to **Cloud Messaging** tab
5. Scroll down to **Web Push certificates**
6. Click **Generate key pair** (if not already generated)
7. Copy the **VAPID key**
8. Open `d:\Zcafe\src\notificationManager.js`
9. Find line ~140 where it says `vapidKey: 'YOUR_VAPID_KEY_HERE'`
10. Replace `'YOUR_VAPID_KEY_HERE'` with your actual VAPID key

### 2. Configure Android for Push Notifications

#### A. Download google-services.json
1. In Firebase Console, go to **Project Settings**
2. Under **Your apps**, find your Android app (or add one if it doesn't exist)
   - Package name should be: `com.zcafe.app`
3. Download the `google-services.json` file
4. Place it in: `d:\Zcafe\android\app\` directory

#### B. Update Android Build Files
The Capacitor plugin should auto-configure, but verify:

**android/build.gradle** should have:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**android/app/build.gradle** should have at the bottom:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3. Configure iOS for Push Notifications

#### A. Download GoogleService-Info.plist
1. In Firebase Console, go to **Project Settings**
2. Under **Your apps**, find your iOS app (or add one if it doesn't exist)
   - Bundle ID should be: `com.zcafe.app`
3. Download the `GoogleService-Info.plist` file
4. Open Xcode project: `d:\Zcafe\ios\App\App.xcworkspace`
5. Drag `GoogleService-Info.plist` into the Xcode project (make sure "Copy items if needed" is checked)

#### B. Enable Push Notifications Capability in Xcode
1. Open the project in Xcode
2. Select your app target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability**
5. Add **Push Notifications**
6. Add **Background Modes** and enable:
   - Remote notifications

#### C. Apple Developer Portal Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Go to **Certificates, Identifiers & Profiles**
3. Select your app identifier (`com.zcafe.app`)
4. Enable **Push Notifications**
5. Generate APNs certificates (Development & Production)
6. Upload the certificates to Firebase Console:
   - Firebase Console > Project Settings > Cloud Messaging
   - Under **Apple app configuration**, upload your APNs certificates

### 4. Build and Sync Capacitor

After completing the above setup:

```bash
# Build your web app
npm run build

# Sync with native platforms
npm run cap:sync

# Open Android Studio to build Android app
npx cap open android

# Open Xcode to build iOS app  
npx cap open ios
```

### 5. Test Background Notifications

#### Method 1: Using Firebase Console (Recommended for testing)
1. Go to Firebase Console
2. Navigate to **Engage > Messaging**
3. Click **Create your first campaign** or **New campaign**
4. Select **Firebase Notification messages**
5. Enter notification title and text
6. Click **Next**
7. Select your app
8. Click **Next** through scheduling
9. Click **Review** and **Publish**

#### Method 2: Programmatically from Admin Panel
You can send notifications from your admin panel by creating a Firebase Cloud Function. See the section below.

## How It Works

### For Web (Browser)
1. Service worker (`firebase-messaging-sw.js`) handles background messages
2. When app is open, foreground messages are handled by the notification manager
3. User must grant notification permission first

### For Android
1. Firebase Cloud Messaging (FCM) delivers notifications
2. App receives notifications even when closed
3. Handled by Capacitor Push Notifications plugin

### For iOS
1. Firebase Cloud Messaging uses APNs (Apple Push Notification service)
2. App receives notifications even when closed
3. Handled by Capacitor Push Notifications plugin

## Sending Notifications from Admin Panel

To send notifications from your admin.html, you'll need to create a Firebase Cloud Function.

### Setup Firebase Cloud Functions

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Cloud Functions in your project:
```bash
cd d:\Zcafe
firebase login
firebase init functions
```

3. Create a function to send notifications (example):

**functions/index.js:**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  const { title, message, targetLocation, targetCompany } = data;
  
  // Get all FCM tokens from database
  const tokensSnapshot = await admin.database().ref('fcm_tokens').once('value');
  const tokens = [];
  
  tokensSnapshot.forEach((child) => {
    const tokenData = child.val();
    const matchLoc = targetLocation === 'all' || tokenData.deliveryAddress === targetLocation;
    const matchComp = targetCompany === 'all' || tokenData.companyName === targetCompany;
    
    if (matchLoc && matchComp) {
      tokens.push(tokenData.token);
    }
  });
  
  if (tokens.length === 0) {
    return { success: false, message: 'No recipients found' };
  }
  
  // Send notification to all matched tokens
  const payload = {
    notification: {
      title: title,
      body: message,
      icon: '/logo.png',
      click_action: 'https://your-app-url.com/notification.html'
    },
    data: {
      title: title,
      message: message,
      url: '/notification.html'
    }
  };
  
  const response = await admin.messaging().sendToDevice(tokens, payload);
  
  return {
    success: true,
    successCount: response.successCount,
    failureCount: response.failureCount
  };
});
```

4. Deploy the function:
```bash
firebase deploy --only functions
```

5. Call the function from admin.html:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendPushNotification = httpsCallable(functions, 'sendPushNotification');

// When admin sends notification:
await sendPushNotification({
  title: notificationTitle,
  message: notificationMessage,
  targetLocation: selectedLocation,
  targetCompany: selectedCompany
});
```

## Troubleshooting

### Notifications not appearing on Android
- Check that `google-services.json` is in the correct location
- Verify Firebase project settings
- Check Android app permissions in device settings
- Make sure app has internet connection

### Notifications not appearing on iOS
- Verify APNs certificates are uploaded to Firebase
- Check that push notifications capability is enabled in Xcode
- Test with both development and production builds
- Check iOS notification settings for the app

### Web notifications not working
- Verify VAPID key is correctly set in `notificationManager.js`
- Check that service worker is registered (in browser devtools > Application > Service Workers)
- Ensure website is served over HTTPS (or localhost for testing)
- Check browser notification permissions

### Token not saving to database
- Check Firebase Database rules allow writes to `fcm_tokens` path
- Verify internet connection
- Check browser/app console for errors

## Firebase Database Rules

Make sure your Firebase Realtime Database rules allow token storage:

```json
{
  "rules": {
    "fcm_tokens": {
      ".read": "auth != null",
      ".write": true
    },
    "notifications": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## Testing Checklist

- [ ] VAPID key added to notificationManager.js
- [ ] google-services.json added to Android project
- [ ] GoogleService-Info.plist added to iOS project
- [ ] Push Notifications capability enabled in Xcode
- [ ] APNs certificates uploaded to Firebase
- [ ] App built and synced with `npm run cap:sync`
- [ ] Notification permission granted on device
- [ ] Test notification sent from Firebase Console
- [ ] Notification received when app is closed
- [ ] Notification received when app is in background
- [ ] Notification received when app is open

## Additional Resources

- [Capacitor Push Notifications Docs](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)

## Support

If you encounter issues:
1. Check browser/app console for error messages
2. Verify all setup steps are completed
3. Test with Firebase Console first before custom implementation
4. Check Firebase project configuration

---

**Note:** For production use, you should implement proper authentication and security rules for the Firebase Cloud Function to prevent unauthorized notification sending.
