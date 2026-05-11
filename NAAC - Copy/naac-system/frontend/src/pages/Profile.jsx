import { useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const ROLE_COLORS = {
    superadmin: { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5', dot: '#EF4444' },
    iqac: { bg: 'rgba(139,92,246,0.15)', text: '#A78BFA', dot: '#8B5CF6' },
    vice_chancellor: { bg: 'rgba(236,72,153,0.15)', text: '#F9A8D4', dot: '#EC4899' },
    dean: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', dot: '#3B82F6' },
    hod: { bg: 'rgba(245,158,11,0.15)', text: '#FBBF24', dot: '#F59E0B' },
    faculty: { bg: 'rgba(16,185,129,0.15)', text: '#34D399', dot: '#10B981' },
}

export default function Profile() {
    const { user } = useAuth()

    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setMessage(''); setError('')

        if (passwords.new_password !== passwords.confirm_password) {
            return setError("New passwords do not match")
        }

        if (passwords.new_password.length < 8) {
            return setError("New password must be at least 8 characters")
        }

        setLoading(true)
        try {
            await api.post('/api/users/change-password', {
                current_password: passwords.current_password,
                new_password: passwords.new_password
            })
            setMessage("Password updated successfully!")
            setPasswords({ current_password: '', new_password: '', confirm_password: '' })
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    const rc = ROLE_COLORS[user?.role] || ROLE_COLORS.faculty
    const inputStyle = { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your account credentials and view organizational assignments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="rounded-[var(--radius)] p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold uppercase"
                            style={{ background: rc.bg, color: rc.text, border: `2px solid ${rc.dot}` }}>
                            {user?.name.charAt(0)}{user?.name.split(' ')[1]?.charAt(0) || ''}
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                style={{ background: rc.bg, color: rc.text }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc.dot }} />
                                {user?.role.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'EMAIL ADDRESS', value: user?.email },
                            { label: 'ASSIGNED SCHOOL', value: user?.school || 'University Wide' },
                            { label: 'DEPARTMENT', value: user?.department || 'Executive Overhead' },
                        ].map((item) => (
                            <div key={item.label}>
                                <label className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>{item.label}</label>
                                <div className="font-medium text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Password */}
                <div className="rounded-[var(--radius)] p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Security Settings</h2>

                    {message && <div className="p-3 mb-4 rounded-lg text-sm font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>{message}</div>}
                    {error && <div className="p-3 mb-4 rounded-lg text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {[
                            { label: 'Current Password', key: 'current_password' },
                            { label: 'New Password', key: 'new_password', hint: 'Must be at least 8 characters' },
                            { label: 'Confirm New Password', key: 'confirm_password' },
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                                <input
                                    type="password" required minLength={field.key === 'new_password' ? 8 : undefined}
                                    value={passwords[field.key]}
                                    onChange={e => setPasswords({ ...passwords, [field.key]: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition"
                                    style={{
                                        ...inputStyle,
                                        borderColor: field.key === 'confirm_password' && passwords.confirm_password && passwords.new_password !== passwords.confirm_password ? 'var(--accent-red)' : undefined,
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                                />
                                {field.hint && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{field.hint}</p>}
                            </div>
                        ))}

                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 mt-2 font-semibold rounded-lg text-sm transition disabled:opacity-50"
                            style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}>
                            {loading ? 'Updating Credentials...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
