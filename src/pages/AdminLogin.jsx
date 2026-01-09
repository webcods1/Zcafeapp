import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [branch, setBranch] = useState('Trivandrum');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password) {
            alert('Please enter password');
            return;
        }

        setLoading(true);

        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
            const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

            const firebaseConfig = {
                apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
            };

            const app = initializeApp(firebaseConfig);
            const db = getDatabase(app);

            const snapshot = await get(ref(db, `admin_credentials/${branch}`));

            if (snapshot.exists()) {
                const adminData = snapshot.val();
                if (adminData.password === password) {
                    localStorage.setItem('adminBranch', branch);
                    localStorage.setItem('adminLoggedIn', 'true');
                    navigate('/admin');
                } else {
                    alert('Invalid password');
                }
            } else {
                alert('Branch not found');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Error logging in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img src="/logo.png" alt="ZCafe Logo" style={{ width: '80px', marginBottom: '20px' }} />
                    <h1 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '2rem' }}>
                        Admin Login
                    </h1>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                        Access ZCafe Admin Dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#555',
                            fontSize: '0.95rem'
                        }}>
                            Branch
                        </label>
                        <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                                cursor: 'pointer'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        >
                            <option value="Trivandrum">Trivandrum</option>
                            <option value="Eranamkulam">Eranamkulam</option>
                            <option value="Thrissur">Thrissur</option>
                            <option value="Vatakara">Vatakara</option>
                            <option value="Pattikkad">Pattikkad </option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#555',
                            fontSize: '0.95rem'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '0.85rem'
                }}>
                    <p style={{ margin: 0 }}>
                        Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
