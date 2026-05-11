import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_COLORS = {
    superadmin: 'bg-red-500/20 text-red-400 border-red-500/30',
    iqac: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    vice_chancellor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    dean: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    hod: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    faculty: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const navItems = [
    {
        path: '/dashboard', label: 'Dashboard', icon: (
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
        )
    },
    {
        path: '/criteria', label: 'Criteria', icon: (
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        )
    },
    {
        path: '/metrics', label: 'Metrics', icon: (
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        )
    },
    {
        path: '/reports', label: 'Reports', icon: (
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        )
    },
]

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const { user } = useAuth()
    const location = useLocation()

    const items = [...navItems]
    items.push({
        path: '/profile', label: 'My Profile', icon: (
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        )
    })

    if (user && (user.role === 'superadmin' || user.role === 'iqac')) {
        items.push({
            path: '/audit-logs', label: 'Audit Logs', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            )
        })
    }

    if (user && user.role === 'superadmin') {
        items.push({
            path: '/admin/users', label: 'User Admin', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )
        })
    }

    const roleColor = ROLE_COLORS[user?.role] || ROLE_COLORS.faculty

    return (
        <aside
            className={`fixed left-0 top-0 bottom-0 w-64 flex flex-col border-r transform transition-transform duration-200 ease-in-out z-30 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
            {/* Logo */}
            <div className="px-6 pt-6 pb-4">
                <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--gold)' }}>
                    NAAC
                </h1>
                <div className="mt-2 h-[1px] w-[30px]" style={{ background: 'var(--gold)' }} />
            </div>

            <div className="h-[1px] mx-4" style={{ background: 'var(--border)' }} />

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto hidden-scrollbar">
                {items.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 relative"
                            style={{
                                color: isActive ? 'var(--gold-light)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--gold-dim)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--gold-dim)'
                                    e.currentTarget.style.color = 'var(--gold)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                }
                            }}
                        >
                            <span style={{ color: isActive ? 'var(--gold)' : 'inherit' }}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    )
                })}
            </nav>

            {/* User info at bottom */}
            {user && (
                <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                            style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)' }}
                        >
                            {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0) || ''}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-[1.5px] border ${roleColor}`}>
                                {user.role.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
