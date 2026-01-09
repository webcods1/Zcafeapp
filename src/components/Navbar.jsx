import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ wishlistCount = 0, notificationCount = 0, onSearch }) => {
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const recommendations = ['Coffee Non sugar', 'Tea Premium', 'Milk Boost', 'Cappuccino', 'Milk Horlicks', 'Coffee Premium'];

    useEffect(() => {
        const addr = localStorage.getItem('deliveryAddress') || 'Please set delivery address';
        const company = localStorage.getItem('companyName') || '';
        setAddress(addr);
        setCompanyName(company);

        // Navbar stays visible - scroll behavior disabled
        /* 
        let lastScrollTop = 0;
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const nav = document.querySelector('nav');

            if (scrollTop > lastScrollTop) {
                if (nav) nav.classList.add('hidden');
            } else {
                if (nav) nav.classList.remove('hidden');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
        */
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowDropdown(value.trim().length > 0);
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleSearchFocus = () => {
        if (!searchQuery.trim()) {
            setSearchQuery('');
        }
        setShowDropdown(searchQuery.trim().length > 0);
    };

    const filteredRecommendations = recommendations.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <nav>
            <div className="nav-top">
                <div className="search-container" style={{ position: 'relative' }}>
                    <img src="/logo.png" alt="ZCafe Logo" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />

                    {showDropdown && filteredRecommendations.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0', // Align to left edge
                            // transform: 'translateX(-50%)', // Removed centering
                            width: '100%', // Match parent width
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '10px',
                            maxHeight: '500px',
                            overflowY: 'auto',
                            zIndex: 20000,
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
                        }}>
                            {filteredRecommendations.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '10px',
                                        cursor: 'pointer',
                                        borderRadius: '10px',
                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                                        background: 'white',
                                        margin: '5px 0'
                                    }}
                                    onClick={() => {
                                        navigate(`/purchase?product=${encodeURIComponent(item)}`);
                                        setShowDropdown(false);
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="nav-right">
                    <div className="nav-icon" onClick={() => navigate('/notification')} title="Notifications" style={{ position: 'relative' }}>
                        <svg viewBox="0 0 24 24">
                            <path d="M12 24a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 0 0-12 0v7L4 20v1h16v-1Z" />
                        </svg>
                        {notificationCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                zIndex: 10
                            }}>
                                {notificationCount}
                            </div>
                        )}
                    </div>

                    <div className="nav-icon" onClick={() => navigate('/wishlist')} title="Wishlist" style={{ position: 'relative' }}>
                        <svg viewBox="0 0 24 24">
                            <path d="M12 21s-8-4.58-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.42-8 11-8 11Z" />
                        </svg>
                        {wishlistCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                zIndex: 10
                            }}>
                                {wishlistCount}
                            </div>
                        )}
                    </div>

                    <div className="nav-icon" onClick={() => navigate('/profile')} title="Profile">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5v3h18v-3c0-2.5-4-5-9-5Z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="deliver-to">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>Deliver To{companyName && ` (${companyName})`}:</span>
                <input type="text" value={address} readOnly />
            </div>
        </nav>
    );
};

export default Navbar;
