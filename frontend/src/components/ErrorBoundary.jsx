import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
                    <div className="max-w-md w-full rounded-xl border p-8 text-center animate-fade-in"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--accent-red)', boxShadow: '0 0 30px rgba(239,68,68,0.1)' }}>
                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
                            style={{ background: 'rgba(239,68,68,0.15)' }}>
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Something went wrong</h1>
                        <p className="font-medium mb-6" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>A rendering error broke this UI component. Check the console for stack traces.</p>
                        <div className="text-xs text-left p-4 rounded-lg overflow-x-auto mb-6 font-mono border"
                            style={{ background: 'rgba(239,68,68,0.05)', color: '#FCA5A5', borderColor: 'rgba(239,68,68,0.2)' }}>
                            {this.state.error && this.state.error.toString()}
                        </div>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="px-6 py-2.5 font-semibold rounded-lg transition w-full text-sm"
                            style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
