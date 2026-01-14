import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useCart } from '../hooks/useCart';
import { showSuccessNotification } from '../utils/notifications';

const Bag = () => {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, clearCart, getTotalQty } = useCart();
    const [userOrders, setUserOrders] = useState([]);
    const [viewOrder, setViewOrder] = useState(null);
    const [ackTrigger, setAckTrigger] = useState(0);
    const [loading, setLoading] = useState(true);

    // 1. Fetch all user orders in real-time
    useEffect(() => {
        let unsubscribe = null;

        const fetchOrders = async () => {
            try {
                const { initializeApp, getApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
                const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

                const firebaseConfig = {
                    apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                    authDomain: "zcafe-65f97.firebaseapp.com",
                    databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com",
                    projectId: "zcafe-65f97",
                    storageBucket: "zcafe-65f97.firebasestorage.app",
                    messagingSenderId: "480288327990",
                    appId: "1:480288327990:web:9c79040289023919034b97"
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
                const userPhone = localStorage.getItem('phoneNumber');

                if (!userPhone) {
                    setLoading(false);
                    return;
                }

                // Listen to orders and store the unsubscribe function
                unsubscribe = onValue(ref(db, 'orders'), (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        // Get all orders for this user, sorted by date (newest first)
                        const sortedOrders = Object.entries(data)
                            .map(([id, order]) => ({ id, ...order }))
                            .filter(order => order.customerPhone === userPhone)
                            .sort((a, b) => {
                                const timeA = new Date(a.createdAt || a.timestamp).getTime();
                                const timeB = new Date(b.createdAt || b.timestamp).getTime();
                                return timeB - timeA;
                            });
                        setUserOrders(sortedOrders);
                    } else {
                        setUserOrders([]);
                    }
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };

        fetchOrders();

        // Cleanup Firebase listener on unmount
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
                console.log('🧹 Firebase listener cleaned up');
            }
        };
    }, []);

    // 2. Logic to determine WHICH order to show (The View Logic)
    useEffect(() => {
        if (!userOrders.length) {
            setViewOrder(null);
            return;
        }

        let orderToShow = null;

        // Iterate through orders to find the most relevant one
        for (const order of userOrders) {
            if (order.status === 'Delivered') {
                // STRICT CHECK: Only show if delivered by the SAME branch
                // If deliveredByBranch is missing (old data), current logic assumes it's valid to keep legacy working,
                // OR we can strictly enforce it. User asked for "users from other companies must NOT see".
                // So let's enforce: MUST match if it exists.

                if (order.deliveredByBranch && order.deliveredByBranch !== order.branch) {
                    continue; // Skip this order, wrong branch delivered it (shouldn't happen but good safety)
                }

                // Check if this delivery has been seen
                const seenKey = `delivery-seen-${order.id}`;
                const hasSeen = localStorage.getItem(seenKey);

                if (!hasSeen) {
                    // Valid unseen delivery - SHOW THIS PRIORITY
                    orderToShow = order;
                    break;
                }
                // If seen, skip it (don't show old delivered orders)
            } else {
                // Pending or Out for Delivery - ALWAYS SHOW ACTIVE orders
                // Since list is sorted new->old, this captures the newest active order
                orderToShow = order;
                break;
            }
        }

        setViewOrder(orderToShow);
    }, [userOrders, ackTrigger]);

    // 3. Auto-Acknowledge Delivery Logic
    // 3. Auto-Acknowledge Delivery Logic
    useEffect(() => {
        if (viewOrder && viewOrder.status === 'Delivered') {
            const seenKey = `delivery-seen-${viewOrder.id}`;

            // Check if already marked seen to prevent duplicate timers/logic
            if (localStorage.getItem(seenKey) === 'true') {
                // Tricky case: If it's already marked seen but we are here, 
                // it means the View Logic picked it up (maybe race condition).
                // We should force an ackTrigger to refresh.
                setAckTrigger(prev => prev + 1);
                return;
            }

            console.log('✅ Delivery Completed message displayed for order:', viewOrder.id);

            // It's displayed now. Set a timer to mark it as seen.
            const timer = setTimeout(() => {
                localStorage.setItem(seenKey, 'true');
                console.log('⏰ Auto-hiding delivery message after 3 seconds');

                // Trigger re-evaluation of which order to show
                setAckTrigger(prev => prev + 1);
            }, 3000); // 3 Seconds display time

            return () => {
                console.log('🧹 Cleaning up timer - marking seen on unmount/status change');
                clearTimeout(timer);
                // CRITICAL FIX: Mark as seen even if user navigates away before 3s
                // This prevents "Always showing" loop if user leaves quickly.
                localStorage.setItem(seenKey, 'true');
            };
        }
    }, [viewOrder?.id, viewOrder?.status]); // Stable dependencies

    const handleQuantityChange = (name, value) => {
        const qty = parseInt(value);
        if (qty > 0) {
            updateQuantity(name, qty);
        }
    };

    const handleRemove = (name) => {
        const item = cart.find(i => i.name === name);
        if (item) {
            const itemEl = document.querySelector(`[data-item-name="${name}"]`);
            if (itemEl) {
                itemEl.classList.add('removing');
                setTimeout(() => {
                    removeFromCart(name);
                }, 350);
            } else {
                removeFromCart(name);
            }
        }
    };

    const handleBookOrder = async () => {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        const deliveryAddress = localStorage.getItem('deliveryAddress');
        const branch = localStorage.getItem('branch');
        const phone = localStorage.getItem('phoneNumber');
        const company = localStorage.getItem('companyName');

        if (!deliveryAddress || !branch || !phone || !company) {
            alert('Please complete your profile with all required information including branch selection.');
            navigate('/profile');
            return;
        }

        try {
            const { getDatabase, ref, push, set } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');
            const db = getDatabase();

            const orderData = {
                items: cart,
                customerPhone: phone,
                customerCompany: company,
                deliveryAddress: deliveryAddress,
                branch: branch,
                status: 'Pending',
                timestamp: new Date().toLocaleString(),
                createdAt: new Date().toISOString()
            };

            const newOrderRef = push(ref(db, 'orders'));
            const orderId = newOrderRef.key;
            await set(newOrderRef, orderData);

            // Immediately show the order status (don't wait for Firebase listener)
            const newOrderObj = { id: orderId, ...orderData };
            // Optimistically update
            setUserOrders(prev => [newOrderObj, ...prev]);

            clearCart();
            showSuccessNotification('Order placed successfully!');
        } catch (error) {
            console.error('Error booking order:', error);
            alert('Error placing order. Please try again.');
        }
    };

    const handleClearCart = () => {
        if (cart.length === 0) return;
        if (confirm('Clear all items from cart?')) {
            clearCart();
            showSuccessNotification('Cart cleared');
        }
    };

    return (
        <>
            <style>{`
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(25px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes cartPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                }
                .removing {
                    opacity: 0;
                    transform: translateX(-30px);
                    transition: all 0.35s ease;
                }
                @keyframes roadScroll {
                    0% { background-position: 0 0; }
                    100% { background-position: 100px 0; }
                }
                @keyframes vehicleBounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }
                .road-container {
                    position: relative;
                    width: 100%;
                    height: 80px;
                    margin: 16px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .road-surface {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 30px;
                    background: linear-gradient(to bottom, #5a5a5a 0%, #3a3a3a 100%);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .road-lines {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 3px;
                    transform: translateY(-50%);
                    background-image: repeating-linear-gradient(
                        to right,
                        #fff 0px,
                        #fff 20px,
                        transparent 20px,
                        transparent 40px
                    );
                    animation: roadScroll 1s linear infinite;
                }
                .vehicle-running {
                    position: relative;
                    z-index: 2;
                    font-size: 3rem;
                    display: inline-block;
                    animation: vehicleBounce 0.5s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .success-checkmark {
                    animation: pulse 0.6s ease-out;
                }
                
                /* Delivery Completion Animation */
                @keyframes vehicleArrive {
                    0% {
                        transform: translateX(-150%);
                    }
                    50% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(0%);
                    }
                }
                @keyframes doorOpen {
                    0%, 50% {
                        transform: scaleX(1);
                        opacity: 0;
                    }
                    60% {
                        transform: scaleX(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: scaleX(0);
                        opacity: 1;
                    }
                }
                @keyframes checkmarkAppear {
                    0%, 70% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    80% {
                        transform: scale(1.3);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                @keyframes textFadeIn {
                    0%, 75% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .delivery-scene {
                    position: relative;
                    width: 100%;
                    height: 120px;
                    margin: 16px 0;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    overflow: hidden;
                }
                .delivery-road {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 30px;
                    background: linear-gradient(to bottom, #5a5a5a 0%, #3a3a3a 100%);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .delivery-road-lines {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 3px;
                    transform: translateY(-50%);
                    background-image: repeating-linear-gradient(
                        to right,
                        #fff 0px,
                        #fff 20px,
                        transparent 20px,
                        transparent 40px
                    );
                    animation: roadScroll 1s linear 0s 2;
                }
                .building {
                    position: absolute;
                    right: 20px;
                    bottom: 30px;
                    font-size: 4rem;
                    z-index: 1;
                }
                .delivery-vehicle {
                    position: absolute;
                    left: 50%;
                    bottom: 30px;
                    font-size: 3rem;
                    z-index: 2;
                    animation: vehicleArrive 2s ease-out forwards;
                }
                .vehicle-door {
                    position: absolute;
                    right: -5px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 8px;
                    height: 25px;
                    background: #666;
                    transform-origin: left center;
                    animation: doorOpen 1.5s ease-out 2s forwards;
                }
                .delivery-checkmark {
                    position: absolute;
                    left: 50%;
                    top: 20%;
                    transform: translate(-50%, -50%) scale(0);
                    font-size: 3.5rem;
                    z-index: 3;
                    animation: checkmarkAppear 1s ease-out 2.5s forwards;
                    color: #2e7d32;
                    filter: drop-shadow(0 2px 8px rgba(46, 125, 50, 0.3));
                }
                .delivery-text {
                    animation: textFadeIn 0.8s ease-out 3s forwards;
                    opacity: 0;
                }
                
                /* Packing Animation for Pending Orders */
                @keyframes itemFall {
                    0% {
                        transform: translateY(-100px);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes boxClose {
                    0%, 60% {
                        transform: scaleY(0.3);
                    }
                    100% {
                        transform: scaleY(1);
                    }
                }
                @keyframes tapeAppear {
                    0%, 70% {
                        width: 0;
                        opacity: 0;
                    }
                    100% {
                        width: 60%;
                        opacity: 1;
                    }
                }
                @keyframes sparkle {
                    0%, 100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .packing-scene {
                    position: relative;
                    width: 100%;
                    height: 140px;
                    margin: 16px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .packing-box {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 5rem;
                    z-index: 1;
                }
                .box-top {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70%;
                    transform-origin: top center;
                    animation: boxClose 2s ease-out 2s forwards;
                }
                .packing-tape {
                    position: absolute;
                    top: 35%;
                    left: 50%;
                    transform: translateX(-50%);
                    height: 4px;
                    background: #ffa726;
                    border-radius: 2px;
                    animation: tapeAppear 1s ease-out 3.5s forwards;
                    width: 0;
                    z-index: 2;
                }
                .falling-item {
                    position: absolute;
                    font-size: 2rem;
                    animation: itemFall 0.6s ease-out forwards;
                }
                .falling-item:nth-child(1) {
                    top: 20%;
                    left: 45%;
                    animation-delay: 0s;
                }
                .falling-item:nth-child(2) {
                    top: 35%;
                    left: 50%;
                    animation-delay: 0.6s;
                }
                .falling-item:nth-child(3) {
                    top: 50%;
                    left: 42%;
                    animation-delay: 1.2s;
                }
                .sparkle-effect {
                    position: absolute;
                    font-size: 1.5rem;
                    animation: sparkle 1s ease-out 4s;
                }
                .sparkle-1 {
                    top: 10%;
                    left: 20%;
                }
                .sparkle-2 {
                    top: 15%;
                    right: 25%;
                }
                .sparkle-3 {
                    bottom: 20%;
                    left: 15%;
                }
                .packing-text {
                    animation: textFadeIn 0.8s ease-out 0.5s forwards;
                    opacity: 0;
                }
                .product-packet {
                    position: absolute;
                    width: 80px;
                    height: 100px;
                    border-radius: 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 700;
                    color: white;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    animation: itemFall 1s ease-out forwards;
                    background: linear-gradient(135deg, #d2691e 0%, #8b4513 50%, #654321 100%);
                    border: 3px solid #4a2c1a;
                    top: 15%;
                    left: 50%;
                    transform: translateX(-50%);
                }
                .packet-label {
                    font-size: 0.7rem;
                    margin-top: 4px;
                    opacity: 0.95;
                    font-weight: 800;
                }
            `}</style>

            <div className="no-top-nav">
                <div className="bag-header">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                </div>

                {/* Active Order Status - Always Visible */}
                {viewOrder && (
                    <div style={{
                        margin: '16px',
                        padding: '20px',
                        background: viewOrder.status === 'Delivered' ? '#e8f5e9' :
                            viewOrder.status === 'Out for Delivery' ? '#fff3e0' : '#e3f2fd',
                        borderRadius: '12px',
                        border: viewOrder.status === 'Delivered' ? '2px solid #a5d6a7' :
                            viewOrder.status === 'Out for Delivery' ? '2px solid #ffcc80' : '2px solid #90caf9',
                        textAlign: 'center'
                    }}>
                        {viewOrder.status === 'Delivered' ? (
                            <div>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '120px',
                                    margin: '16px 0',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center'
                                }}>
                                    {/* Road */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        left: '0',
                                        right: '0',
                                        height: '30px',
                                        background: 'linear-gradient(to bottom, #5a5a5a 0%, #3a3a3a 100%)',
                                        borderRadius: '4px'
                                    }}></div>

                                    {/* Building on right */}
                                    <div style={{
                                        position: 'absolute',
                                        right: '20px',
                                        bottom: '30px',
                                        fontSize: '4rem',
                                        zIndex: 1
                                    }}>🏢</div>

                                    {/* Vehicle parked */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '50%',
                                        bottom: '30px',
                                        fontSize: '3rem',
                                        zIndex: 2,
                                        transform: 'translateX(-50%)'
                                    }}>🚚</div>

                                    {/* Checkmark */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '50%',
                                        top: '10%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: '3rem',
                                        zIndex: 3,
                                        color: '#2e7d32',
                                        filter: 'drop-shadow(0 2px 8px rgba(46, 125, 50, 0.3))'
                                    }}>✓</div>
                                </div>

                                <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: '#2e7d32',
                                    marginBottom: '8px',
                                    textAlign: 'center'
                                }}>
                                    Delivery Completed!
                                </div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: '#558b2f',
                                    textAlign: 'center'
                                }}>
                                    Your order has been successfully delivered
                                </div>
                            </div>
                        ) : viewOrder.status === 'Pending' ? (
                            <div>
                                <div className="packing-scene">
                                    <div className="packing-box">
                                        📦
                                        <div className="box-top"></div>
                                    </div>
                                    <div className="packing-tape"></div>
                                </div>
                                <div className="packing-text" style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: '#1565c0',
                                    marginBottom: '8px',
                                    textAlign: 'center'
                                }}>
                                    Order Confirmed!
                                </div>
                                <div className="packing-text" style={{
                                    fontSize: '0.9rem',
                                    color: '#1976d2',
                                    lineHeight: '1.5',
                                    textAlign: 'center'
                                }}>
                                    Packing your order
                                </div>

                                {/* Show Order Items */}
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.5)',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    color: '#333'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>Order Items:</div>
                                    {viewOrder.items && viewOrder.items.map((item, idx) => (
                                        <div key={idx} style={{ padding: '4px 0' }}>
                                            {item.name} × {item.quantity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="road-container">
                                    <div className="road-surface">
                                        <div className="road-lines"></div>
                                    </div>
                                    <div className="vehicle-running">
                                        🚚
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: viewOrder.status === 'Out for Delivery' ? '#e65100' : '#1565c0',
                                    marginBottom: '8px'
                                }}>
                                    {viewOrder.status === 'Out for Delivery' ? 'Out for Delivery!' : 'Order Confirmed!'}
                                </div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: viewOrder.status === 'Out for Delivery' ? '#f57c00' : '#1976d2',
                                    lineHeight: '1.5'
                                }}>
                                    {viewOrder.status === 'Out for Delivery'
                                        ? 'Your order is on the way!'
                                        : 'Your order will be delivered within a week'}
                                </div>

                                {/* Show Order Items */}
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.5)',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    color: '#333'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>Order Items:</div>
                                    {viewOrder.items && viewOrder.items.map((item, idx) => (
                                        <div key={idx} style={{ padding: '4px 0' }}>
                                            {item.name} × {item.quantity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="bag-items">
                    {cart.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px 20px', color: '#777' }}>
                            Your cart is empty. <br />
                            <button
                                onClick={() => navigate('/purchase')}
                                style={{
                                    marginTop: '20px',
                                    padding: '12px 24px',
                                    background: '#aa0a0a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Browse Products
                            </button>
                        </p>
                    ) : (
                        <>
                            {cart.map((item, index) => (
                                <div
                                    key={item.name}
                                    className="bag-item"
                                    data-item-name={item.name}
                                    style={{
                                        opacity: 0,
                                        transform: 'translateY(25px)',
                                        animation: `slideUpFade 0.45s ease forwards ${index * 0.05}s`
                                    }}
                                >
                                    <h3>{item.name}</h3>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item.name, e.target.value)}
                                        style={{
                                            width: '80px',
                                            padding: '8px',
                                            textAlign: 'center',
                                            border: '1px solid #ccc',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemove(item.name)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="actions">
                        <button className="book-btn" onClick={handleBookOrder}>
                            Book Order
                        </button>
                        <button className="clear-btn" onClick={handleClearCart}>
                            Clear Cart
                        </button>
                    </div>
                )}

                <BottomNav currentPage="bag" cartCount={getTotalQty()} />
            </div>
        </>
    );
};

export default Bag;
