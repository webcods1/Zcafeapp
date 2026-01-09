import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlist, updateQuantity, removeFromWishlist, wishlist: items } = useWishlist();
    const { addToCart, getTotalQty } = useCart();

    const handleQuantityChange = (name, value) => {
        const qty = parseInt(value);
        if (qty > 0) {
            updateQuantity(name, qty);
        }
    };

    const handleRemove = (index) => {
        const item = wishlist[index];
        const itemEl = document.querySelectorAll('.bag-item')[index];
        if (itemEl) {
            itemEl.classList.add('removing');
            setTimeout(() => {
                removeFromWishlist(item.name);
            }, 350);
        }
    };

    const flyToCart = (itemEl) => {
        const clone = itemEl.cloneNode(true);
        const rect = itemEl.getBoundingClientRect();
        const cartIcon = document.getElementById('bag-link');
        if (!cartIcon) return;

        const cartRect = cartIcon.getBoundingClientRect();

        clone.classList.add('fly-item');
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.position = 'fixed';
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.background = '#ffffff';
        clone.style.borderRadius = '14px';
        clone.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.25)';

        document.body.appendChild(clone);

        requestAnimationFrame(() => {
            clone.style.transform = `translate(${cartRect.left - rect.left}px, ${cartRect.top - rect.top}px) scale(0.2)`;
            clone.style.opacity = '0';
            clone.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease';
        });

        setTimeout(() => clone.remove(), 750);
    };

    const handleMoveToBag = (index) => {
        const item = wishlist[index];
        const itemEls = document.querySelectorAll('.bag-item');
        const itemEl = itemEls[index];

        if (itemEl) {
            flyToCart(itemEl);
            itemEl.classList.add('removing');
        }

        addToCart(item.name, item.quantity);

        setTimeout(() => {
            removeFromWishlist(item.name);
        }, 400);
    };

    const handleMoveAllToBag = () => {
        if (wishlist.length === 0) {
            alert('Wishlist is empty!');
            return;
        }

        const itemEls = document.querySelectorAll('.bag-item');
        itemEls.forEach(el => flyToCart(el));

        wishlist.forEach(item => {
            addToCart(item.name, item.quantity);
        });

        setTimeout(() => {
            wishlist.forEach(item => removeFromWishlist(item.name));
        }, 500);
    };

    const handleClearWishlist = () => {
        if (wishlist.length === 0) return;
        if (confirm('Clear wishlist?')) {
            wishlist.forEach(item => removeFromWishlist(item.name));
        }
    };

    return (
        <>
            <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .removing {
          opacity: 0;
          transform: translateX(-30px);
          transition: all 0.35s ease;
        }
        .fly-item {
          position: fixed;
          z-index: 9999;
          pointer-events: none;
          background: #ffffff;
          borderRadius: 14px;
          boxShadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease;
        }
      `}</style>

            <div className="no-top-nav">
                <header className="bag-header">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 21s-8-4.58-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.42-8 11-8 11Z" />
                    </svg>
                </header>

                <div className="container">
                    <div className="bag-items">
                        {wishlist.length === 0 ? (
                            <div>
                                <p style={{ textAlign: 'center', color: '#777', padding: '30px 0' }}>
                                    Your wishlist is empty ❤️
                                </p>
                                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                    <button
                                        className="add-cart-btn"
                                        onClick={() => navigate('/purchase')}
                                        style={{ padding: '12px 24px', fontSize: '1rem' }}
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            </div>
                        ) : (
                            wishlist.map((item, index) => (
                                <div
                                    key={item.name}
                                    className="bag-item"
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
                                        className="qty-input"
                                    />
                                    <button className="remove-btn" onClick={() => handleRemove(index)}>
                                        Remove
                                    </button>
                                    <button className="add-cart-btn" onClick={() => handleMoveToBag(index)}>
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="16"
                                            height="16"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                        Add to Cart
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {wishlist.length > 0 && (
                        <div className="actions">
                            <button className="book-btn" onClick={handleMoveAllToBag}>
                                Move All to Cart
                            </button>
                            <button className="clear-btn" onClick={handleClearWishlist}>
                                Clear Wishlist
                            </button>
                        </div>
                    )}
                </div>

                <BottomNav currentPage="wishlist" cartCount={getTotalQty()} />
            </div>
        </>
    );
};

export default Wishlist;
