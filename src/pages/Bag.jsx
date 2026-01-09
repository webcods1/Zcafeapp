import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useCart } from '../hooks/useCart';
import { showSuccessNotification } from '../utils/notifications';

const Bag = () => {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, clearCart, getTotalQty } = useCart();
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        // Dynamic import Firebase
        const initFirebase = async () => {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');

            const firebaseConfig = {
                apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                authDomain: "zcafe-65f97.firebaseapp.com",
                databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com",
                projectId: "zcafe-65f97",
                storageBucket: "zcafe-65f97.firebasestorage.app",
                messagingSenderId: "480288327990",
                appId: "1:480288327990:web:9c79040289023919034b97"
            };

            initializeApp(firebaseConfig);
        };

        initFirebase();
    }, []);

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
        if (!deliveryAddress) {
            alert('Please set delivery address in Profile first.');
            navigate('/profile');
            return;
        }

        try {
            const { getDatabase, ref, push, set } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');
            const db = getDatabase();

            const phone = localStorage.getItem('phoneNumber') || 'Unknown';
            const company = localStorage.getItem('companyName') || 'Unknown';

            const orderData = {
                items: cart,
                customerPhone: phone,
                customerCompany: company,
                deliveryAddress: deliveryAddress,
                status: 'Pending',
                timestamp: new Date().toLocaleString()
            };

            const newOrderRef = push(ref(db, 'orders'));
            await set(newOrderRef, orderData);

            setShowBookingModal(true);
            clearCart();

            setTimeout(() => {
                setShowBookingModal(false);
            }, 5000);
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
      `}</style>

            <div className="no-top-nav">
                <div className="bag-header">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                </div>

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

                {/* Booking Modal */}
                {showBookingModal && (
                    <div className="booking-modal active" style={{ display: 'flex', opacity: 1 }}>
                        <div className="booking-content">
                            <h2>Order Placed! 🎉</h2>
                            <p>Your order has been successfully placed. Our delivery team will contact you shortly.</p>

                            <div className="delivery-scene">
                                <div className="moving-bg" />
                                <div className="road-surface" />
                                <div className="van-stationary">🚚</div>
                            </div>

                            <button className="ok-btn" onClick={() => setShowBookingModal(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                )}

                <BottomNav currentPage="bag" cartCount={getTotalQty()} />
            </div>
        </>
    );
};

export default Bag;
