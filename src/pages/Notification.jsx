import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useCart } from '../hooks/useCart';

const Notification = () => {
    const navigate = useNavigate();
    const { getTotalQty } = useCart();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
                const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

                const firebaseConfig = {
                    apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                    databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
                };

                const app = initializeApp(firebaseConfig);
                const db = getDatabase(app);

                onValue(ref(db, 'notifications'), (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const userLoc = localStorage.getItem('deliveryAddress') || '';
                        const userComp = localStorage.getItem('companyName') || '';

                        const notifArray = Object.entries(data).map(([id, notif]) => ({
                            id,
                            ...notif
                        })).filter(notif => {
                            const matchLoc = notif.targetLocation === 'all' || notif.targetLocation === userLoc;
                            const matchComp = notif.targetCompany === 'all' || notif.targetCompany === userComp;
                            return matchLoc && matchComp;
                        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                        setNotifications(notifArray);
                    } else {
                        setNotifications([]);
                    }
                    setLoading(false);
                });

                const lastSeen = Date.now();
                localStorage.setItem('lastNotifSeen', lastSeen.toString());
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="no-top-nav">
            <div className="bag-header" style={{
                padding: '20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                marginBottom: '20px'
            }}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="white" style={{ marginBottom: '10px' }}>
                    <path d="M12 24a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 0 0-12 0v7L4 20v1h16v-1Z" />
                </svg>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Notifications</h2>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 15px 100px 15px' }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#666'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '3px solid #f3f3f3',
                            borderTop: '3px solid #667eea',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
                        <p>Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#999'
                    }}>
                        <svg viewBox="0 0 24 24" width="80" height="80" fill="#e0e0e0" style={{ marginBottom: '20px' }}>
                            <path d="M12 24a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 0 0-12 0v7L4 20v1h16v-1Z" />
                        </svg>
                        <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>No notifications yet</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                            You'll see updates from ZCafe here
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {notifications.map((notif, index) => (
                            <div
                                key={notif.id}
                                style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    borderLeft: '4px solid #667eea',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    opacity: 0,
                                    animation: `slideIn 0.4s ease forwards ${index * 0.1}s`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <style>{`
                  @keyframes slideIn {
                    from {
                      opacity: 0;
                      transform: translateY(20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '8px'
                                }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '1.1rem',
                                        color: '#333',
                                        fontWeight: '600',
                                        flex: 1
                                    }}>
                                        {notif.title}
                                    </h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: '#999',
                                        whiteSpace: 'nowrap',
                                        marginLeft: '10px',
                                        background: '#f8f9fa',
                                        padding: '4px 8px',
                                        borderRadius: '12px'
                                    }}>
                                        {formatTime(notif.timestamp)}
                                    </span>
                                </div>

                                <p style={{
                                    margin: 0,
                                    color: '#666',
                                    lineHeight: '1.6',
                                    fontSize: '0.95rem'
                                }}>
                                    {notif.message}
                                </p>

                                {(notif.targetLocation !== 'all' || notif.targetCompany !== 'all') && (
                                    <div style={{
                                        marginTop: '10px',
                                        fontSize: '0.8rem',
                                        color: '#999',
                                        display: 'flex',
                                        gap: '10px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {notif.targetLocation !== 'all' && (
                                            <span style={{
                                                background: '#e3f2fd',
                                                color: '#1976d2',
                                                padding: '2px 8px',
                                                borderRadius: '8px'
                                            }}>
                                                📍 {notif.targetLocation}
                                            </span>
                                        )}
                                        {notif.targetCompany !== 'all' && (
                                            <span style={{
                                                background: '#f3e5f5',
                                                color: '#7b1fa2',
                                                padding: '2px 8px',
                                                borderRadius: '8px'
                                            }}>
                                                🏢 {notif.targetCompany}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav currentPage="notification" cartCount={getTotalQty()} />
        </div>
    );
};

export default Notification;
