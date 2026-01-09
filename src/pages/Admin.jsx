import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [adminBranch, setAdminBranch] = useState('');
    const [loading, setLoading] = useState(true);

    const [notificationForm, setNotificationForm] = useState({
        title: '',
        message: '',
        location: 'all',
        company: 'all'
    });

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        const branch = localStorage.getItem('adminBranch');

        if (!isLoggedIn || !branch) {
            navigate('/admin-login');
            return;
        }

        setAdminBranch(branch);
        fetchData(branch);
    }, [navigate]);

    const fetchData = async (branch) => {
        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
            const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

            const firebaseConfig = {
                apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
            };

            const app = initializeApp(firebaseConfig);
            const db = getDatabase(app);

            onValue(ref(db, 'orders'), (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const ordersArray = Object.entries(data)
                        .map(([id, order]) => ({ id, ...order }))
                        .filter(order => order.deliveryAddress.includes(branch) || branch === 'all')
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setOrders(ordersArray);
                } else {
                    setOrders([]);
                }
            });

            onValue(ref(db, 'service_requests'), (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const serviceArray = Object.entries(data)
                        .map(([id, request]) => ({ id, ...request }))
                        .filter(request => request.customerLocation.includes(branch) || branch === 'all')
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setServiceRequests(serviceArray);
                } else {
                    setServiceRequests([]);
                }
                setLoading(false);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleMarkDelivered = async (orderId) => {
        if (!confirm('Mark this order as delivered?')) return;

        try {
            const { getDatabase, ref, remove } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');
            const db = getDatabase();
            await remove(ref(db, `orders/${orderId}`));
            alert('Order marked as delivered and removed!');
        } catch (error) {
            console.error('Error marking order:', error);
            alert('Error updating order. Please try again.');
        }
    };

    const handleMarkServiceDone = async (requestId) => {
        if (!confirm('Mark this service request as done?')) return;

        try {
            const { getDatabase, ref, remove } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');
            const db = getDatabase();
            await remove(ref(db, `service_requests/${requestId}`));
            alert('Service request marked as done and removed!');
        } catch (error) {
            console.error('Error marking service:', error);
            alert('Error updating service request. Please try again.');
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();

        if (!notificationForm.title || !notificationForm.message) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const { getDatabase, ref, push, set } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');
            const db = getDatabase();

            const newNotifRef = push(ref(db, 'notifications'));
            await set(newNotifRef, {
                title: notificationForm.title,
                message: notificationForm.message,
                targetLocation: notificationForm.location,
                targetCompany: notificationForm.company,
                timestamp: new Date().toISOString(),
                sentBy: adminBranch
            });

            alert('Notification sent successfully!');
            setNotificationForm({ title: '', message: '', location: 'all', company: 'all' });
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Error sending notification. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminBranch');
        navigate('/admin-login');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '1.5rem',
                color: '#666'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Admin Dashboard - {adminBranch}</h1>
                <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
                    Logout
                </button>
            </div>

            <section style={{ marginBottom: '40px', background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                <h2 style={{ marginTop: 0 }}>Send Notification</h2>
                <form onSubmit={handleSendNotification} style={{ display: 'grid', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Title</label>
                        <input type="text" value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Message</label>
                        <textarea value={notificationForm.message} onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' }} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Target Location</label>
                            <select value={notificationForm.location} onChange={(e) => setNotificationForm({ ...notificationForm, location: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}>
                                <option value="all">All Locations</option>
                                <option value="Trivandrum">Trivandrum</option>
                                <option value="Kollam">Kollam</option>
                                <option value="Kochi">Kochi</option>
                                <option value="Thrissur">Thrissur</option>
                                <option value="Calicut">Calicut</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Target Company</label>
                            <input type="text" value={notificationForm.company} onChange={(e) => setNotificationForm({ ...notificationForm, company: e.target.value })} placeholder="Company name or 'all'" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }} />
                        </div>
                    </div>

                    <button type="submit" style={{ padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>
                        Send Notification
                    </button>
                </form>
            </section>

            <section style={{ marginBottom: '40px' }}>
                <h2>Orders ({orders.length})</h2>
                {orders.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>No orders yet</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Company</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Items</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Address</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Time</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', color: '#666' }}>{order.customerPhone}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{order.customerCompany}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>
                                            {order.items.map((item, i) => (
                                                <div key={i}>{item.name} (×{item.quantity})</div>
                                            ))}
                                        </td>
                                        <td style={{ padding: '12px', color: '#666' }}>{order.deliveryAddress}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{order.timestamp}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>
                                            <button onClick={() => handleMarkDelivered(order.id)} style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                Mark Delivered
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section>
                <h2>Service Requests ({serviceRequests.length})</h2>
                {serviceRequests.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>No service requests yet</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Company</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Type</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Message</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Location</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Time</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceRequests.map((request) => (
                                    <tr key={request.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', color: '#666' }}>{request.customerPhone}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{request.customerCompany}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{request.type}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{request.message}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{request.customerLocation}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{request.timestamp}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>
                                            <button onClick={() => handleMarkServiceDone(request.id)} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                Mark Done
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Admin;
