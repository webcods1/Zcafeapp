import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useCart } from '../hooks/useCart';

const OrderTracking = () => {
    const navigate = useNavigate();
    const { getTotalQty } = useCart();
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe = null;

        const fetchMyOrders = async () => {
            try {
                const { initializeApp, getApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
                const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

                const firebaseConfig = {
                    apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                    databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
                };

                let app;
                try {
                    app = initializeApp(firebaseConfig);
                } catch (e) {
                    if (e.code === 'app/duplicate-app') {
                        app = getApp();
                    } else {
                        throw e;
                    }
                }
                const db = getDatabase(app);

                // Get user's phone number from localStorage
                const userPhone = localStorage.getItem('phoneNumber');

                if (!userPhone) {
                    setLoading(false);
                    return;
                }

                // Listen to orders in real-time
                unsubscribe = onValue(ref(db, 'orders'), (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const ordersArray = Object.entries(data)
                            .map(([id, order]) => ({ id, ...order }))
                            .filter(order => order.customerPhone === userPhone)
                            .sort((a, b) => {
                                // Newest first
                                const timeA = new Date(a.createdAt || a.timestamp).getTime();
                                const timeB = new Date(b.createdAt || b.timestamp).getTime();
                                return timeB - timeA;
                            });
                        setMyOrders(ordersArray);
                    } else {
                        setMyOrders([]);
                    }
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };

        fetchMyOrders();

        // Cleanup Firebase listener on unmount
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
                console.log('🧹 OrderTracking listener cleaned up');
            }
        };
    }, []);

    const formatDate = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return timestamp;
        }
    };

    return (
        <>
            <style>{`
                @keyframes driveLeft {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-20px);
                    }
                }
                
                @keyframes driveRight {
                    0% {
                        transform: translateX(-20px);
                    }
                    100% {
                        transform: translateX(0);
                    }
                }
                
                @keyframes drive {
                    0%, 100% {
                        transform: translateX(-20px);
                    }
                    50% {
                        transform: translateX(20px);
                    }
                }
                
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
                
                .vehicle-running {
                    animation: drive 2s ease-in-out infinite;
                    font-size: 2.5rem;
                    display: inline-block;
                }
                
                .delivery-completed {
                    animation: fadeInScale 0.6s ease-out;
                }
                
                .success-checkmark {
                    animation: pulse 0.6s ease-out;
                }
            `}</style>

            <div className="no-top-nav">
                <div className="bag-header" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '24px 20px',
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '20px'
                }}>
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="white" style={{ marginBottom: '10px' }}>
                        <path d="M4 4h2v16H4z" />
                        <path d="M13 5l7 7-7 7z" fill="white" />
                        <path d="M6 12h12" stroke="white" strokeWidth="2" />
                    </svg>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>My Orders</h2>
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
                            <p>Loading your orders...</p>
                        </div>
                    ) : !localStorage.getItem('phoneNumber') ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#999'
                        }}>
                            <h3 style={{ color: '#666', marginBottom: '10px' }}>Profile Setup Required</h3>
                            <p style={{ marginBottom: '20px' }}>Please complete your profile to view orders</p>
                            <button
                                onClick={() => navigate('/profile')}
                                style={{
                                    padding: '12px 24px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                            >
                                Go to Profile
                            </button>
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#999'
                        }}>
                            <svg viewBox="0 0 24 24" width="80" height="80" fill="#e0e0e0" style={{ marginBottom: '20px' }}>
                                <path d="M4 4h2v16H4z" />
                                <path d="M13 5l7 7-7 7z" />
                            </svg>
                            <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>No orders yet</h3>
                            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem' }}>
                                Your orders will appear here
                            </p>
                            <button
                                onClick={() => navigate('/purchase')}
                                style={{
                                    padding: '12px 24px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {myOrders.map((order, index) => (
                                <div
                                    key={order.id}
                                    style={{
                                        background: '#fff',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        border: '1px solid #e0e0e0',
                                        opacity: 0,
                                        animation: `slideIn 0.4s ease forwards ${index * 0.1}s`
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

                                    {/* Order Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '16px',
                                        paddingBottom: '16px',
                                        borderBottom: '1px solid #f0f0f0'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#999',
                                                marginBottom: '4px'
                                            }}>
                                                Order ID
                                            </div>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                color: '#333',
                                                fontFamily: 'monospace'
                                            }}>
                                                #{order.id.slice(-8).toUpperCase()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#999',
                                                marginBottom: '4px'
                                            }}>
                                                Order Date
                                            </div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: '#666'
                                            }}>
                                                {formatDate(order.createdAt || order.timestamp)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div style={{
                                        marginBottom: '16px',
                                        padding: '12px',
                                        background: '#f8f9fa',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            color: '#555',
                                            marginBottom: '8px'
                                        }}>
                                            Items ({order.items?.length || 0})
                                        </div>
                                        {order.items && order.items.map((item, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '4px 0',
                                                fontSize: '0.9rem',
                                                color: '#666'
                                            }}>
                                                <span>{item.name}</span>
                                                <span style={{ fontWeight: '600' }}>×{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Delivery Status */}
                                    <div style={{
                                        background: order.status === 'Delivered' ? '#e8f5e9' :
                                            order.status === 'Out for Delivery' ? '#fff3e0' : '#e3f2fd',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        {order.status === 'Delivered' ? (
                                            <div className="delivery-completed">
                                                <div className="success-checkmark" style={{
                                                    fontSize: '3rem',
                                                    marginBottom: '8px'
                                                }}>
                                                    ✓
                                                </div>
                                                <div style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '700',
                                                    color: '#2e7d32',
                                                    marginBottom: '4px'
                                                }}>
                                                    Delivered Successfully
                                                </div>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: '#558b2f'
                                                }}>
                                                    Your order has been delivered
                                                </div>
                                            </div>
                                        ) : order.status === 'Out for Delivery' ? (
                                            <div>
                                                <div className="vehicle-running" style={{
                                                    marginBottom: '12px'
                                                }}>
                                                    🚚
                                                </div>
                                                <div style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '700',
                                                    color: '#e65100',
                                                    marginBottom: '4px'
                                                }}>
                                                    Out for Delivery
                                                </div>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: '#f57c00'
                                                }}>
                                                    Your order is on the way!
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{
                                                    fontSize: '2.5rem',
                                                    marginBottom: '8px'
                                                }}>
                                                    📦
                                                </div>
                                                <div style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '700',
                                                    color: '#1565c0',
                                                    marginBottom: '4px'
                                                }}>
                                                    Order Confirmed
                                                </div>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: '#1976d2'
                                                }}>
                                                    We're preparing your order
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delivery Address */}
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        color: '#666'
                                    }}>
                                        <div style={{ fontWeight: '600', marginBottom: '4px', color: '#333' }}>
                                            📍 Delivery Address
                                        </div>
                                        <div>{order.deliveryAddress}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <BottomNav currentPage="orders" cartCount={getTotalQty()} />
            </div>
        </>
    );
};

export default OrderTracking;
