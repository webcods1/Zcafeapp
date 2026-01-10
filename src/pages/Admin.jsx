import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [adminBranch, setAdminBranch] = useState('');
    const [adminUsername, setAdminUsername] = useState('');
    const [loading, setLoading] = useState(true);

    const [notificationForm, setNotificationForm] = useState({
        title: '',
        message: '',
        location: 'all',
        company: 'all'
    });

    // Date filtering state
    const [dateFilter, setDateFilter] = useState('all'); // Default to ALL to show everything
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filteredServiceRequests, setFilteredServiceRequests] = useState([]);

    // Sidebar navigation state
    const [activeSection, setActiveSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Add animations and reset body styles
    useEffect(() => {
        // Reset body and html margins/padding
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            body, html {
                margin: 0 !important;
                padding: 0 !important;
                overflow-x: hidden;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
            // Reset on cleanup
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.documentElement.style.margin = '';
            document.documentElement.style.padding = '';
        };
    }, []);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        const branch = localStorage.getItem('adminBranch');
        const username = localStorage.getItem('adminUsername');

        if (!isLoggedIn || !branch) {
            navigate('/admin-login');
            return;
        }

        setAdminBranch(branch);
        setAdminUsername(username || 'Admin');
        fetchData(branch);
    }, [navigate]);

    // Date filtering effect
    useEffect(() => {
        filterOrdersByDate();
    }, [orders, serviceRequests, dateFilter, customDateFrom]);

    const filterOrdersByDate = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const isSameDay = (d1, d2) => {
            return d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate();
        };

        const filterItem = (item) => {
            // 1. Parsing Logic
            let dateObj = null;

            if (item.createdAt) {
                dateObj = new Date(item.createdAt);
            }

            if (!dateObj || isNaN(dateObj.getTime())) {
                const ts = item.timestamp;
                if (ts) {
                    // Check for DD/MM/YYYY pattern explicitly FIRST
                    const parts = String(ts).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                    if (parts) {
                        const d = new Date(`${parts[2]}/${parts[1]}/${parts[3]}`); // MM/DD/YYYY
                        if (!isNaN(d.getTime())) dateObj = d;
                    }

                    if (!dateObj) {
                        const d = new Date(ts);
                        if (!isNaN(d.getTime())) dateObj = d;
                    }
                }
            }

            // 2. Fallback for "Today" if parsing failed completely
            if (!dateObj || isNaN(dateObj.getTime())) {
                if (dateFilter === 'today') {
                    const d = today.getDate();
                    const m = today.getMonth() + 1;
                    const y = today.getFullYear();
                    const variants = [
                        `${d}/${m}/${y}`,           // 9/1/2026
                        `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`, // 09/01/2026
                    ];
                    return variants.some(v => (item.timestamp || '').includes(v));
                }
                return false;
            }

            // 3. Filter Logic
            switch (dateFilter) {
                case 'today':
                    return isSameDay(dateObj, today);
                case 'yesterday':
                    const yester = new Date(today);
                    yester.setDate(today.getDate() - 1);
                    return isSameDay(dateObj, yester);
                case 'custom':
                    if (customDateFrom) {
                        return isSameDay(dateObj, new Date(customDateFrom));
                    }
                    return true;
                default:
                    return true;
            }
        };

        setFilteredOrders(orders.filter(filterItem));
        setFilteredServiceRequests(serviceRequests.filter(filterItem));
    };

    const formatDisplayTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            let date = new Date(dateStr);
            // Handle DD/MM/YYYY parsing failure
            if (isNaN(date.getTime())) {
                const parts = String(dateStr).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})[, ]+(.*)/);
                if (parts) {
                    // Reconstruct as MM/DD/YYYY HH:MM:SS
                    date = new Date(`${parts[2]}/${parts[1]}/${parts[3]} ${parts[4]}`);
                }
            }
            if (isNaN(date.getTime())) return dateStr;

            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return dateStr;
        }
    };

    const fetchData = async (branch) => {
        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
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

            const app = initializeApp(firebaseConfig);
            const db = getDatabase(app);

            onValue(ref(db, 'orders'), (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const allOrders = Object.entries(data).map(([id, order]) => ({ id, ...order }));
                    const ordersArray = allOrders
                        .filter(order => {
                            // Case-insensitive branch matching
                            const orderBranch = order.branch ? order.branch.toLowerCase() : '';
                            const adminBranchLower = branch.toLowerCase();
                            return branch === 'all' || orderBranch === adminBranchLower || !order.branch;
                        })
                        .sort((a, b) => {
                            // Robust date parsing with fallback to ID
                            const getTime = (item) => {
                                if (item.createdAt) return new Date(item.createdAt).getTime();
                                const d = new Date(item.timestamp);
                                return isNaN(d.getTime()) ? 0 : d.getTime();
                            };

                            const timeA = getTime(a);
                            const timeB = getTime(b);

                            // If both have valid times, sort by time (Newest first)
                            if (timeA > 0 && timeB > 0) {
                                return timeB - timeA;
                            }

                            // Fallback: If times are invalid (legacy/app mismatch), 
                            // sort by Firebase Push ID (which is chronologically ordered)
                            // We reverse compare strings for Descending order
                            if (a.id > b.id) return -1;
                            if (a.id < b.id) return 1;
                            return 0;
                        });
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
                        .filter(request => branch === 'all' || request.customerLocation.includes(branch))
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
        localStorage.removeItem('adminUsername');
        navigate('/admin-login');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f5f5f5',
                gap: '20px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e0e0e0',
                    borderTop: '4px solid #666',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ fontSize: '1rem', color: '#666', fontWeight: '500' }}>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f0f4f8', /* Light blue background for main content */
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            display: 'flex'
        }}>
            {/* Left Sidebar */}
            <div style={{
                width: sidebarOpen ? '260px' : '0',
                minHeight: '100vh',
                background: '#ffffff',
                borderRight: '1px solid #dbeafe', /* Soft blue border */
                position: 'sticky',
                top: 0,
                left: 0,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                zIndex: 100,
                boxShadow: '2px 0 5px rgba(0,0,0,0.02)'
            }}>
                {/* Sidebar Header */}
                <div style={{
                    padding: '24px 20px',
                    borderBottom: '1px solid #dbeafe'
                }}>
                    <h2 style={{
                        margin: '0 0 4px 0',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#1e3a8a', /* Dark blue text */
                        letterSpacing: '-0.02em'
                    }}>
                        ZCafe Admin
                    </h2>
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#64748b' /* Slate gray */
                    }}>
                        {adminBranch} Branch
                    </p>

                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#eff6ff', /* Very light blue */
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Logged in as</div>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e40af' }}>{adminUsername}</div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div style={{ padding: '16px 0' }}>
                    <div style={{
                        padding: '0 20px 8px 20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        color: '#94a3b8',
                        textTransform: 'uppercase'
                    }}>
                        Navigation
                    </div>

                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'orders', label: 'Orders' },
                        { id: 'services', label: 'Service Requests' },
                        { id: 'notifications', label: 'Send Notification' },
                        { id: 'datefilter', label: 'Date Filter' }
                    ].map(item => (
                        <div
                            key={item.id}
                            onClick={() => {
                                setActiveSection(item.id);
                                document.getElementById(`section-${item.id}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            style={{
                                padding: '12px 20px',
                                margin: '4px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: activeSection === item.id ? '#eff6ff' : 'transparent', /* Active light blue bg */
                                transition: 'all 0.2s ease',
                                fontWeight: activeSection === item.id ? '600' : '400',
                                fontSize: '0.875rem',
                                color: activeSection === item.id ? '#1d4ed8' : '#475569', /* Active blue text */
                                borderLeft: activeSection === item.id ? '3px solid #3b82f6' : '3px solid transparent' /* Active blue border */
                            }}
                            onMouseEnter={(e) => {
                                if (activeSection !== item.id) {
                                    e.currentTarget.style.background = '#f8fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeSection !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>

                {/* Quick Stats */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid #dbeafe',
                    marginTop: 'auto'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        color: '#9e9e9e',
                        marginBottom: '12px',
                        textTransform: 'uppercase'
                    }}>
                        Quick Stats
                    </div>
                    <div style={{
                        background: '#f9f9f9',
                        borderRadius: '6px',
                        padding: '12px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                        }}>
                            <span style={{ fontSize: '0.875rem', color: '#616161' }}>Orders</span>
                            <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#212121' }}>{filteredOrders.length}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ fontSize: '0.875rem', color: '#616161' }}>Services</span>
                            <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#212121' }}>{filteredServiceRequests.length}</span>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e0e0e0' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#fff',
                            color: '#616161',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#f5f5f5';
                            e.target.style.borderColor = '#bdbdbd';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#fff';
                            e.target.style.borderColor = '#e0e0e0';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                padding: '0 24px 32px 24px',
                minHeight: '100vh',
                overflow: 'auto'
            }}>
                {/* Toggle Sidebar Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: 'fixed',
                        top: '16px',
                        left: sidebarOpen ? '270px' : '20px',
                        zIndex: 101,
                        background: '#fff',
                        color: '#424242',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        width: '40px',
                        height: '40px',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                    }}
                >
                    {sidebarOpen ? '‹' : '☰'}
                </button>

                <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '24px' }}>
                    {/* Statistics Cards */}
                    <div id="section-overview" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '20px',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            background: '#fff',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}>
                            <div style={{ fontSize: '0.875rem', color: '#757575', marginBottom: '8px', fontWeight: '500' }}>
                                Total Orders
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#212121' }}>
                                {orders.length}
                            </div>
                        </div>

                        <div style={{
                            background: '#fff',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}>
                            <div style={{ fontSize: '0.875rem', color: '#757575', marginBottom: '8px', fontWeight: '500' }}>
                                Service Requests
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#212121' }}>
                                {serviceRequests.length}
                            </div>
                        </div>
                    </div>

                    {/* Date Filter Section */}
                    <section id="section-datefilter" style={{
                        background: '#fff',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h2 style={{
                                    margin: '0 0 16px 0',
                                    color: '#1e293b',
                                    fontSize: '1.125rem',
                                    fontWeight: '600'
                                }}>
                                    Filter by Date
                                </h2>

                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center',
                                    flexWrap: 'wrap'
                                }}>
                                    {[
                                        { value: 'today', label: 'Today' },
                                        { value: 'yesterday', label: 'Yesterday' }
                                    ].map((filter) => (
                                        <button
                                            key={filter.value}
                                            onClick={() => {
                                                setDateFilter(filter.value);
                                                setCustomDateFrom(''); // Reset custom date when clicking presets
                                            }}
                                            style={{
                                                padding: '8px 20px',
                                                background: dateFilter === filter.value && !customDateFrom ? '#3b82f6' : '#fff',
                                                color: dateFilter === filter.value && !customDateFrom ? '#fff' : '#64748b',
                                                border: dateFilter === filter.value && !customDateFrom ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}

                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="date"
                                            value={customDateFrom}
                                            onChange={(e) => {
                                                setDateFilter('custom');
                                                setCustomDateFrom(e.target.value);
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                paddingLeft: '34px',
                                                border: dateFilter === 'custom' ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                color: '#334155',
                                                outline: 'none',
                                                background: '#f8fafc',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        />
                                        <span style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '1.1rem'
                                        }}>📅</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                textAlign: 'right',
                                fontSize: '0.875rem',
                                color: '#64748b',
                                background: '#f1f5f9',
                                padding: '8px 16px',
                                borderRadius: '6px'
                            }}>
                                Showing: <strong>
                                    {customDateFrom ? new Date(customDateFrom).toLocaleDateString() :
                                        dateFilter === 'yesterday' ? 'Yesterday' : 'Today'}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {/* Notification Form */}
                    <section id="section-notifications" style={{
                        background: '#fff',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}>
                        <h2 style={{
                            margin: '0 0 20px 0',
                            color: '#212121',
                            fontSize: '1.125rem',
                            fontWeight: '600'
                        }}>
                            Send Notification
                        </h2>

                        <form onSubmit={handleSendNotification} style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#424242',
                                    fontSize: '0.875rem'
                                }}>
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={notificationForm.title}
                                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        background: '#fff'
                                    }}
                                    placeholder="Enter notification title"
                                    required
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#424242',
                                    fontSize: '0.875rem'
                                }}>
                                    Message
                                </label>
                                <textarea
                                    value={notificationForm.message}
                                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        background: '#fff',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                    placeholder="Enter your message"
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '500',
                                        color: '#424242',
                                        fontSize: '0.875rem'
                                    }}>
                                        Target Location
                                    </label>
                                    <select
                                        value={notificationForm.location}
                                        onChange={(e) => setNotificationForm({ ...notificationForm, location: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            background: '#fff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="all">All Locations</option>
                                        <option value="Trivandrum">Trivandrum</option>
                                        <option value="Kollam">Kollam</option>
                                        <option value="Kochi">Kochi</option>
                                        <option value="Thrissur">Thrissur</option>
                                        <option value="Calicut">Calicut</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '500',
                                        color: '#424242',
                                        fontSize: '0.875rem'
                                    }}>
                                        Target Company
                                    </label>
                                    <input
                                        type="text"
                                        value={notificationForm.company}
                                        onChange={(e) => setNotificationForm({ ...notificationForm, company: e.target.value })}
                                        placeholder="Company name or 'all'"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            background: '#fff'
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    padding: '12px 24px',
                                    background: '#424242',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#212121';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#424242';
                                }}
                            >
                                Send Notification
                            </button>
                        </form>
                    </section>

                    {/* Orders Section */}
                    <section id="section-orders" style={{
                        background: '#fff',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{
                                margin: 0,
                                color: '#1e293b',
                                fontSize: '1.25rem',
                                fontWeight: '700'
                            }}>
                                Orders <span style={{
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.875rem',
                                    verticalAlign: 'middle',
                                    marginLeft: '8px'
                                }}>{filteredOrders.length}</span>
                            </h2>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px 20px',
                                color: '#94a3b8',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px dashed #cbd5e1'
                            }}>
                                <p style={{ fontSize: '1rem', fontWeight: '500', margin: 0 }}>No orders found</p>
                                <p style={{ fontSize: '0.875rem', margin: '8px 0 0 0' }}>New orders will appear here automatically</p>
                                {orders.length > 0 && (
                                    <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                                        Debug: DB has {orders.length} orders. <br />
                                        Latest: "{orders[0]?.timestamp}"
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    background: '#fff'
                                }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Company</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Items</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Address</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Time</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id}
                                                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <td style={{ padding: '16px', color: '#334155', fontSize: '0.875rem', fontWeight: '500' }}>
                                                    {order.customerPhone}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                                                    {order.customerCompany}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                                                    {order.items.map((item, i) => (
                                                        <div key={i} style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{
                                                                background: '#e0f2fe',
                                                                color: '#0369a1',
                                                                fontSize: '0.75rem',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontWeight: '600'
                                                            }}>x{item.quantity}</span>
                                                            <span style={{ color: '#334155', fontWeight: '500' }}>{item.name}</span>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                                                    {order.deliveryAddress}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                                    {formatDisplayTime(order.timestamp)}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <button
                                                        onClick={() => handleMarkDelivered(order.id)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            background: '#3b82f6',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = '#2563eb';
                                                            e.target.style.transform = 'translateY(-1px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = '#3b82f6';
                                                            e.target.style.transform = 'translateY(0)';
                                                        }}
                                                    >
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

                    {/* Service Requests Section */}
                    <section id="section-services" style={{
                        background: '#fff',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}>
                        <h2 style={{
                            margin: '0 0 20px 0',
                            color: '#212121',
                            fontSize: '1.125rem',
                            fontWeight: '600'
                        }}>
                            Service Requests ({filteredServiceRequests.length})
                        </h2>

                        {filteredServiceRequests.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px 20px',
                                color: '#9e9e9e'
                            }}>
                                <p style={{ fontSize: '1rem', fontWeight: '500', margin: 0 }}>No service requests found</p>
                                <p style={{ fontSize: '0.875rem', margin: '8px 0 0 0' }}>Requests will appear here</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    background: '#fff'
                                }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Company</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Message</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Location</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Time</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredServiceRequests.map((request) => (
                                            <tr key={request.id}
                                                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <td style={{ padding: '16px', color: '#334155', fontSize: '0.875rem', fontWeight: '500' }}>
                                                    {request.customerPhone}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                                                    {request.customerCompany}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                                                    <span style={{
                                                        background: '#f1f5f9',
                                                        color: '#475569',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        {request.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                                                    {request.message}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                                                    {request.customerLocation}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                                    {formatDisplayTime(request.timestamp)}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <button
                                                        onClick={() => handleMarkServiceDone(request.id)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            background: '#3b82f6',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = '#2563eb';
                                                            e.target.style.transform = 'translateY(-1px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = '#3b82f6';
                                                            e.target.style.transform = 'translateY(0)';
                                                        }}
                                                    >
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
            </div >
        </div >
    );
};

export default Admin;
