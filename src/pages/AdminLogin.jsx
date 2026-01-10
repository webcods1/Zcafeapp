import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);

    // Login state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginBranch, setLoginBranch] = useState('Trivandrum');

    // Registration state
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regBranch, setRegBranch] = useState('Trivandrum');

    const [loading, setLoading] = useState(false);

    const BRANCH_LIST = [
        "Trivandrum", "Eranamkulam", "Thrissur", "Vatakara", "Pattikkad"
    ];

    const [takenBranches, setTakenBranches] = useState([]);

    // Fetch taken branches when registering
    useEffect(() => {
        const fetchTakenBranches = async () => {
            try {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
                const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

                const firebaseConfig = {
                    apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                    databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
                };

                const app = initializeApp(firebaseConfig);
                const db = getDatabase(app);

                const snapshot = await get(ref(db, 'admin_credentials'));
                if (snapshot.exists()) {
                    const taken = Object.keys(snapshot.val());
                    setTakenBranches(taken);

                    // Auto-select first available branch if current is taken
                    // but ONLY if we are currently registering (to avoid messing up login state if they share logic?)
                    // The regBranch state is separate, so this is safe.
                    const currentTaken = taken.includes('Trivandrum'); // default
                    if (currentTaken) {
                        const firstFree = BRANCH_LIST.find(b => !taken.includes(b));
                        if (firstFree) setRegBranch(firstFree);
                    }
                } else {
                    setTakenBranches([]);
                }
            } catch (error) {
                console.error("Error fetching branches", error);
            }
        };

        if (isRegistering) {
            fetchTakenBranches();
        }
    }, [isRegistering]);

    // Add keyframe animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes floatIn {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!loginUsername || !loginPassword) {
            alert('Please enter username and password');
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

            const snapshot = await get(ref(db, `admin_credentials/${loginBranch}`));

            if (snapshot.exists()) {
                const adminData = snapshot.val();
                if (adminData.username === loginUsername && adminData.password === loginPassword) {
                    localStorage.setItem('adminBranch', loginBranch);
                    localStorage.setItem('adminLoggedIn', 'true');
                    localStorage.setItem('adminUsername', loginUsername);
                    navigate('/admin');
                } else {
                    alert('Invalid username or password');
                }
            } else {
                alert('Branch not found. Please register first.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Error logging in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!regUsername || !regPassword || !regConfirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (regPassword !== regConfirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (regPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js');
            const { getDatabase, ref, get, set } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');

            const firebaseConfig = {
                apiKey: "AIzaSyBD_s0bu-ei-bsdPDIFaDF6gbuck-85hbM",
                databaseURL: "https://zcafe-65f97-default-rtdb.firebaseio.com"
            };

            const app = initializeApp(firebaseConfig);
            const db = getDatabase(app);

            // Check if admin already exists for this branch
            const snapshot = await get(ref(db, `admin_credentials/${regBranch}`));

            if (snapshot.exists()) {
                alert('This branch already has an admin assigned.');
                // Do not auto-switch to login, let user decide.
                return;
            } else {
                // Create new admin account
                await set(ref(db, `admin_credentials/${regBranch}`), {
                    username: regUsername,
                    password: regPassword,
                    branch: regBranch,
                    createdAt: new Date().toISOString()
                });

                alert('Registration successful! Please login with your credentials.');

                // Reset form and switch to login
                setRegUsername('');
                setRegPassword('');
                setRegConfirmPassword('');
                setIsRegistering(false);
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('Error during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '2px solid #e8ecf1',
        borderRadius: '10px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        backgroundColor: '#f8f9fa',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '10px',
        fontWeight: '600',
        color: '#2d3748',
        fontSize: '0.95rem',
        letterSpacing: '0.3px'
    };

    const containerStyle = {
        background: 'white',
        padding: '20px',
        borderRadius: '24px',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.25), 0 10px 25px rgba(0, 0, 0, 0.12)',
        width: '100%',
        maxWidth: '440px',
        animation: 'floatIn 0.6s ease-out',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 15s ease infinite',
            padding: '20px',
            overflow: 'hidden'
        }}>
            {/* Decorative circles */}
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                top: '-100px',
                left: '-100px',
                animation: 'pulse 8s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                bottom: '-150px',
                right: '-150px',
                animation: 'pulse 10s ease-in-out infinite'
            }} />

            <div style={containerStyle}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        margin: '0 auto 10px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4)',
                        position: 'relative'
                    }}>
                        <img
                            src="/logo.png"
                            alt="ZCafe Logo"
                            style={{
                                width: '30px',
                                height: '30px',
                                objectFit: 'contain',
                                filter: 'brightness(0) invert(1)'
                            }}
                        />
                    </div>
                    <h1 style={{
                        margin: '0 0 5px 0',
                        color: '#1a202c',
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        letterSpacing: '-0.5px'
                    }}>
                        {isRegistering ? 'Admin Registration' : 'Admin Portal'}
                    </h1>
                    <p style={{
                        margin: 0,
                        color: '#718096',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                    }}>
                        {isRegistering ? 'Create your admin account' : 'Access ZCafe Admin Dashboard'}
                    </p>
                </div>

                {!isRegistering ? (
                    // Login Form
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <span style={{ marginRight: '8px' }}>👤</span>
                                Username
                            </label>
                            <input
                                type="text"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                placeholder="Enter your username"
                                style={inputStyle}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e8ecf1';
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.boxShadow = 'none';
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <span style={{ marginRight: '8px' }}>🏢</span>
                                Branch Location
                            </label>
                            <select
                                value={loginBranch}
                                onChange={(e) => setLoginBranch(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e8ecf1';
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                {BRANCH_LIST.map((branch) => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>
                                <span style={{ marginRight: '8px' }}>🔒</span>
                                Password
                            </label>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Enter your password"
                                style={inputStyle}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e8ecf1';
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.boxShadow = 'none';
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: loading ? 'none' : '0 6px 20px rgba(102, 126, 234, 0.5)',
                                letterSpacing: '0.5px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-3px)';
                                    e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '18px',
                                        height: '18px',
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        borderTop: '3px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }}></span>
                                    Logging in...
                                </span>
                            ) : (
                                <span>Login to Dashboard →</span>
                            )}
                        </button>
                    </form>
                ) : (
                    // Registration Form
                    <form onSubmit={handleRegister}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <span style={{ marginRight: '8px' }}>👤</span>
                                Username
                            </label>
                            <input
                                type="text"
                                value={regUsername}
                                onChange={(e) => setRegUsername(e.target.value)}
                                placeholder="Choose a username"
                                style={inputStyle}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e8ecf1';
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.boxShadow = 'none';
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <span style={{ marginRight: '8px' }}>🏢</span>
                                Branch Location
                            </label>
                            <select
                                value={regBranch}
                                onChange={(e) => setRegBranch(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e8ecf1';
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                {BRANCH_LIST.map((branch) => {
                                    const isTaken = takenBranches.includes(branch);
                                    return (
                                        <option
                                            key={branch}
                                            value={branch}
                                            disabled={isTaken}
                                            style={{ color: isTaken ? '#a0aec0' : '#2d3748' }}
                                        >
                                            {branch} {isTaken ? '(Admin Assigned)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <span style={{ marginRight: '8px' }}>🔒</span>
                                Password
                            </label>
                            <input
                                type="password"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="Create a password (min 6 chars)"
                                style={inputStyle}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e8ecf1';
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.boxShadow = 'none';
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>
                                <span style={{ marginRight: '8px' }}>✓</span>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                style={inputStyle}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e8ecf1';
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.boxShadow = 'none';
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: loading ? 'none' : '0 6px 20px rgba(102, 126, 234, 0.5)',
                                letterSpacing: '0.5px'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-3px)';
                                    e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '18px',
                                        height: '18px',
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        borderTop: '3px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }}></span>
                                    Registering...
                                </span>
                            ) : (
                                <span>Create Account →</span>
                            )}
                        </button>
                    </form>
                )}

                {/* Toggle between Login and Registration */}
                <div style={{
                    marginTop: '15px',
                    textAlign: 'center',
                    padding: '10px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    borderRadius: '12px'
                }}>
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#667eea',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                            e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        {isRegistering ? '← Back to Login' : 'New Admin? Register →'}
                    </button>
                </div>

                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    padding: '12px',
                    borderTop: '1px solid #e8ecf1'
                }}>
                    <p style={{
                        margin: 0,
                        color: '#a0aec0',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                    }}>
                        🔐 AUTHORIZED PERSONNEL ONLY
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
