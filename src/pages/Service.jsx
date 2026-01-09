import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useCart } from '../hooks/useCart';

const Service = () => {
    const navigate = useNavigate();
    const { getTotalQty } = useCart();
    const [complaintType, setComplaintType] = useState('Machine not turning on');
    const [complaintMessage, setComplaintMessage] = useState('');

    useEffect(() => {
        // Scroll animation
        const serviceGear = document.getElementById('service-gear');
        if (serviceGear) {
            serviceGear.classList.add('animate-enter');
        }
    }, []);

    const showNotification = (msg) => {
        const notification = document.createElement('div');
        notification.className = 'service-notification-toast';
        notification.textContent = msg;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!complaintType || !complaintMessage.trim()) {
            showNotification('Please fill in all fields (Type & Message).');
            return;
        }

        const serviceGear = document.getElementById('service-gear');
        if (serviceGear) {
            serviceGear.classList.remove('animate-enter');
            serviceGear.classList.add('animate-exit');

            setTimeout(() => {
                submitComplaint();
            }, 2000);
        } else {
            submitComplaint();
        }
    };

    const submitComplaint = async () => {
        try {
            const phone = localStorage.getItem('phoneNumber') || 'Unknown';
            const company = localStorage.getItem('companyName') || 'Unknown Company';
            const location = localStorage.getItem('deliveryAddress') || 'Unknown Location';

            // Import Firebase modules dynamically
            const { initializeApp, getApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
            const { getDatabase, ref, push, set } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

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
                // Try to initialize
                app = initializeApp(firebaseConfig);
            } catch (error) {
                // If already initialized, get existing app
                if (error.code === 'app/duplicate-app') {
                    app = getApp();
                } else {
                    throw error;
                }
            }

            const db = getDatabase(app);
            const newRequestRef = push(ref(db, 'service_requests'));

            await set(newRequestRef, {
                type: complaintType,
                message: complaintMessage,
                customerPhone: phone,
                customerCompany: company,
                customerLocation: location,
                status: 'Pending',
                timestamp: new Date().toLocaleString()
            });

            showNotification("The servicer will call you immediately! 📞");
            setComplaintType('Machine not turning on');
            setComplaintMessage('');

            const serviceGear = document.getElementById('service-gear');
            if (serviceGear) {
                setTimeout(() => {
                    serviceGear.classList.remove('animate-exit');
                    serviceGear.classList.add('animate-enter');
                }, 1000);
            }
        } catch (err) {
            console.error('Service Request Error:', err);
            showNotification("Error submitting request. Please try again.");
        }
    };

    return (
        <>


            <div className="no-top-nav service-page">
                <main className="main-content">
                    <h1>Machine Service</h1>
                    <form id="complaint-form" onSubmit={handleSubmit}>
                        <label htmlFor="complaint-type">Complaint Type</label>
                        <select
                            id="complaint-type"
                            value={complaintType}
                            onChange={(e) => setComplaintType(e.target.value)}
                            required
                        >
                            <option value="Machine not turning on">Machine not turning on</option>
                            <option value="Water not heating">Water not heating</option>
                            <option value="Switch complaints">Switch complaints</option>
                            <option value="Other">Other</option>
                        </select>

                        <label htmlFor="complaint-message">Message</label>
                        <textarea
                            id="complaint-message"
                            placeholder="Describe your complaint in detail..."
                            value={complaintMessage}
                            onChange={(e) => setComplaintMessage(e.target.value)}
                            required
                        />

                        <div className="service-animation-container">
                            <svg className="service-vehicle-page" id="service-gear" viewBox="0 0 24 24">
                                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                            </svg>

                            <button type="submit" id="send-complaint-btn" className="service-button-page">
                                Send Complaint <i className="fas fa-arrow-right" />
                            </button>

                            <div className="service-track-page" />
                        </div>
                    </form>
                </main>

                <BottomNav currentPage="service" cartCount={getTotalQty()} />
            </div>
        </>
    );
};

export default Service;
