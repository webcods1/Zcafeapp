import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('🔥 Error Boundary Caught:', error);
        console.error('Error Info:', errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Optional: Send to error tracking service
        // logErrorToService(error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    }

    handleGoHome = () => {
        window.location.href = '/';
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '500px',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '40px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😕</div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Oops!</h1>
                        <p style={{ fontSize: '1.1rem', marginBottom: '30px', opacity: 0.9 }}>
                            Something went wrong. Don't worry, your data is safe!
                        </p>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    padding: '15px 30px',
                                    fontSize: '1rem',
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}
                            >
                                🔄 Reload Page
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                style={{
                                    padding: '15px 30px',
                                    fontSize: '1rem',
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: '2px solid white',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                🏠 Go Home
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginTop: '30px',
                                textAlign: 'left',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '15px',
                                borderRadius: '10px',
                                fontSize: '0.85rem'
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                    Error Details (Dev Only)
                                </summary>
                                <pre style={{
                                    marginTop: '10px',
                                    overflow: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {this.state.error.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
