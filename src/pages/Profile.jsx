import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { useCart } from '../hooks/useCart';
import { showSuccessNotification } from '../utils/notifications';

const Profile = () => {
    const navigate = useNavigate();
    const { getTotalQty } = useCart();

    const [formData, setFormData] = useState({
        phoneNumber: '',
        companyName: '',
        deliveryAddress: '',
        branch: 'Trivandrum'
    });

    useEffect(() => {
        setFormData({
            phoneNumber: localStorage.getItem('phoneNumber') || '',
            companyName: localStorage.getItem('companyName') || '',
            deliveryAddress: localStorage.getItem('deliveryAddress') || '',
            branch: localStorage.getItem('branch') || 'Trivandrum'
        });

        const nav = document.querySelector('nav');
        if (nav) {
            const navHeight = nav.offsetHeight;
            document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.phoneNumber || !formData.companyName || !formData.deliveryAddress) {
            alert('Please fill in all fields');
            return;
        }

        try {
            localStorage.setItem('phoneNumber', formData.phoneNumber);
            localStorage.setItem('companyName', formData.companyName);
            localStorage.setItem('deliveryAddress', formData.deliveryAddress);
            localStorage.setItem('branch', formData.branch);

            const { initializeApp, getApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
            const { getDatabase, ref, set } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

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

            await set(ref(db, `users/${formData.phoneNumber}`), {
                phoneNumber: formData.phoneNumber,
                companyName: formData.companyName,
                deliveryAddress: formData.deliveryAddress,
                branch: formData.branch,
                updatedAt: new Date().toISOString()
            });

            showSuccessNotification('Profile saved successfully! ✅');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error saving profile. Please try again.');
        }
    };

    return (
        <div className="no-top-nav" style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#f4e7cc',
            position: 'relative',
            width: '100%',
            overflowX: 'hidden',
            paddingBottom: '80px',
            height: '35vh'
        }}>
            {/* Profile icon section - separate from form */}
            <div style={{ textAlign: 'center', padding: '15px 0', marginBottom: '30px', background: '#f4e7cc', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="70" height="70" fill="#000">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5v3h18v-3c0-2.5-4-5-9-5Z" />
                </svg>
            </div>

            {/* Centered form container */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 15px 20px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div id="profile-view" style={{
                    width: '100%',
                    maxWidth: '550px',
                    maxHeight: '450px',
                    margin: '0 auto',
                    background: '#fff',
                    padding: '25px',
                    borderRadius: '25px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                            <div>
                                <label htmlFor="phone-number" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Phone Number:</label>
                                <input
                                    type="tel"
                                    id="phone-number"
                                    name="phoneNumber"
                                    placeholder="Enter phone number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="delivery-address" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Delivery Address:</label>
                                <textarea
                                    id="delivery-address"
                                    name="deliveryAddress"
                                    placeholder="Enter your full delivery address"
                                    value={formData.deliveryAddress}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '6px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: '16px',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="company-name" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Company Name:</label>
                                <input
                                    type="text"
                                    id="company-name"
                                    name="companyName"
                                    placeholder="Enter your company name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '6px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div className="branch-dropdown-container">
                                <label htmlFor="branch" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Product Deliver From (Branch):</label>
                                <select
                                    id="branch"
                                    name="branch"
                                    className="branch-select"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: '16px',
                                        background: 'white',
                                        boxSizing: 'border-box',
                                        appearance: 'none',
                                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        backgroundSize: '20px',
                                        paddingRight: '40px'
                                    }}
                                >
                                    <option value="" disabled>Select Branch</option>
                                    <option value="Trivandrum">Trivandrum</option>
                                    <option value="Eranamkulam">Eranamkulam</option>
                                    <option value="Thrissur">Thrissur</option>
                                    <option value="Vatakara">Vatakara</option>
                                    <option value="Pattikkad">Pattikkad</option>
                                </select>
                            </div>

                        </div>

                        <button type="submit" id="save-profile-btn" style={{
                            width: '100%',
                            padding: '14px',
                            marginTop: '18px',
                            background: '#aa0a0a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(170, 10, 10, 0.3)'
                        }}>
                            Save Profile
                        </button>
                    </form>
                </div>
            </div>

            <Footer />
            <BottomNav currentPage="profile" cartCount={getTotalQty()} />
        </div>
    );
};

export default Profile;
