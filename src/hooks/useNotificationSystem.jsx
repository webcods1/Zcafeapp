import React, { useState, useEffect, useRef } from 'react';
import { getBranchForLocation } from '../utils/branchMapping';

// Global notification logic to be used across pages
export const useNotificationSystem = () => {
    const [popupNotification, setPopupNotification] = useState(null);
    const audioRef = useRef(null);

    // Initialize audio only once
    useEffect(() => {
        audioRef.current = new Audio('/notification.mp3');
    }, []);

    useEffect(() => {
        let unsubscribe = null;

        const initFirebase = async () => {
            try {
                const { initializeApp, getApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
                const { getDatabase, ref, onValue, update } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

                const firebaseConfig = {
                    apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                    databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
                };

                let app;
                try {
                    app = initializeApp(firebaseConfig);
                } catch (e) {
                    if (e.code === 'app/duplicate-app') app = getApp();
                    else throw e;
                }
                const db = getDatabase(app);

                // Listen for notifications
                unsubscribe = onValue(ref(db, 'notifications'), (snapshot) => {
                    if (!snapshot.exists()) return;

                    // BLOCK NOTIFICATIONS ON ADMIN PAGES
                    if (window.location.pathname.startsWith('/admin')) {
                        return;
                    }

                    const data = snapshot.val();
                    const userLoc = localStorage.getItem('deliveryAddress') || '';
                    const userBranch = getBranchForLocation(userLoc);
                    const userComp = localStorage.getItem('companyName') || '';

                    // Simple "read" tracking stored in localStorage as a list of read notification IDs
                    const readNotifs = JSON.parse(localStorage.getItem('read_notifications') || '[]');

                    // Find newest relevant notification that is NOT read
                    const notifs = Object.entries(data).map(([id, n]) => ({ id, ...n }));

                    // Sort by timestamp descending
                    notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                    for (const notif of notifs) {
                        // Skip if already read locally
                        if (readNotifs.includes(notif.id)) continue;

                        // Check targeting
                        if (userBranch && notif.sentBy && notif.sentBy !== userBranch) continue;

                        const matchLoc = notif.targetLocation === 'all' ||
                            notif.targetLocation?.toLowerCase() === userLoc.toLowerCase() ||
                            userLoc.toLowerCase().includes(notif.targetLocation?.toLowerCase());

                        const matchComp = notif.targetCompany === 'all' ||
                            notif.targetCompany?.toLowerCase() === userComp.toLowerCase() ||
                            userComp.toLowerCase().includes(notif.targetCompany?.toLowerCase());

                        if (matchLoc && matchComp) {
                            // FOUND A NEW NOTIFICATION!
                            setPopupNotification(notif);

                            // Play sound
                            if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.play().catch(e => console.log('Audio blocked:', e));
                            }

                            // We only show ONE at a time for less chaos
                            break;
                        }
                    }
                });

            } catch (error) {
                console.error("Firebase init error in NotificationSystem:", error);
            }
        };

        initFirebase();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const dismissNotification = (id) => {
        const readNotifs = JSON.parse(localStorage.getItem('read_notifications') || '[]');
        if (!readNotifs.includes(id)) {
            readNotifs.push(id);
            localStorage.setItem('read_notifications', JSON.stringify(readNotifs));
        }
        setPopupNotification(null);
    };

    return { popupNotification, dismissNotification };
};

export const NotificationPopup = ({ notification, onClose }) => {
    // Double check: Don't render on admin pages even if state is somehow set
    if (window.location.pathname.startsWith('/admin')) return null;

    if (!notification) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px', // Mobile slide up style
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '400px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            zIndex: 10001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUpBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
            <style>{`
                @keyframes slideUpBounce {
                    0% { transform: translate(-50%, 100%); opacity: 0; }
                    60% { transform: translate(-50%, -10%); opacity: 1; }
                    100% { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>

            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔔</span>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>New Message</span>
                </div>
                <button
                    onClick={() => onClose(notification.id)}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px'
                    }}
                >✕</button>
            </div>

            <div style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1rem' }}>{notification.title}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {notification.message}
                </p>
            </div>
        </div>
    );
};
