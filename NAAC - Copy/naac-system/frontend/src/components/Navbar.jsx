import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/criteria': 'Criteria',
    '/metrics': 'Metrics',
    '/reports': 'Reports',
    '/profile': 'My Profile',
    '/audit-logs': 'Audit Logs',
    '/admin/users': 'User Management',
}

export default function Navbar({ onMobileToggle }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const pageTitle = PAGE_TITLES[location.pathname] || 'NAAC'

    return (
        <header
            className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 lg:px-8 lg:left-64 border-b"
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
        >
            <div className="flex items-center gap-4">
                <button onClick={onMobileToggle} className="lg:hidden p-2 transition" style={{ color: 'var(--text-secondary)' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <h2 className="font-display italic text-xl font-bold" style={{ color: 'var(--gold)' }}>
                    {pageTitle}
                </h2>
            </div>

            {user && (
                <div className="flex items-center gap-4">
                    {/* Notification bell */}
                    <button className="relative p-2 transition rounded-lg" style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
                    </button>

                    {/* Divider */}
                    <div className="w-[1px] h-6" style={{ background: 'var(--border)' }} />

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg transition"
                            style={{ color: 'var(--text-primary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-dim)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase"
                                style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)' }}
                            >
                                {user.name.charAt(0)}
                            </div>
                            <div className="text-left hidden md:block">
                                <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                                <div className="text-[10px] uppercase tracking-[1.5px] font-bold" style={{ color: 'var(--gold)' }}>{user.role.replace('_', ' ')}</div>
                            </div>
                            <svg className="w-4 h-4 hidden md:block" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {menuOpen && (
                            <div
                                className="absolute right-0 mt-2 w-48 rounded-lg overflow-hidden py-1 animate-fade-in z-50 border"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
                            >
                                <div className="px-4 py-2 border-b lg:hidden" style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                                    <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{user.role}</p>
                                </div>
                                <button
                                    onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-dim)'; e.currentTarget.style.color = 'var(--gold)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                                >
                                    My Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition"
                                    style={{ color: 'var(--accent-red)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
