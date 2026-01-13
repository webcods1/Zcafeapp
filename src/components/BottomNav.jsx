import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = ({ cartCount = 0, currentPage = '' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const lastNavigationRef = useRef(0);
    const NAVIGATION_COOLDOWN = 300; // ms between navigations

    // Throttled navigation to prevent rapid clicking crashes
    const handleNavigate = useCallback((path) => {
        const now = Date.now();

        // Prevent rapid successive navigations
        if (now - lastNavigationRef.current < NAVIGATION_COOLDOWN) {
            console.warn('🚫 Navigation too fast, cooldown active');
            return;
        }

        lastNavigationRef.current = now;
        navigate(path);
    }, [navigate]);

    useEffect(() => {
        let lastScrollTop = 0;
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const bottomNav = document.querySelector('.bottom-nav');

            if (scrollTop > lastScrollTop) {
                // scrolling down
                if (bottomNav) bottomNav.classList.add('hidden');
            } else {
                // scrolling up
                if (bottomNav) bottomNav.classList.remove('hidden');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => {
        if (currentPage) {
            return currentPage === path;
        }
        return location.pathname === `/${path}` || (path === '' && location.pathname === '/');
    };

    return (
        <div className="bottom-nav">
            <a
                className={`nav-item ${isActive('') || isActive('index') ? 'active' : ''}`}
                onClick={() => handleNavigate('/')}
                style={{ cursor: 'pointer' }}
            >
                <svg viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2Z" />
                </svg>
                Home
            </a>

            <a
                className={`nav-item ${isActive('purchase') ? 'active' : ''}`}
                onClick={() => handleNavigate('/purchase')}
                style={{ cursor: 'pointer' }}
            >
                <svg viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4v10l8 4 8-4z M12 3v10 M8 5v10 M16 5v10" />
                </svg>
                Purchase
            </a>

            <a
                className={`nav-item ${isActive('service') ? 'active' : ''}`}
                onClick={() => handleNavigate('/service')}
                style={{ cursor: 'pointer' }}
            >
                <svg viewBox="0 0 24 24" fill="#000">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                </svg>
                Service
            </a>

            <a
                className={`nav-item ${isActive('bag') ? 'active' : ''}`}
                onClick={() => handleNavigate('/bag')}
                id="bag-link"
                style={{ cursor: 'pointer', position: 'relative' }}
            >
                <svg viewBox="0 0 24 24">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Cart
                {cartCount > 0 && (
                    <div className="cart-badge" style={{ display: 'flex' }}>
                        {cartCount}
                    </div>
                )}
            </a>
        </div>
    );
};

export default BottomNav;
