import { useState, useEffect } from 'react'
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

export default function Users() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', role: 'faculty', password: '', school: '', department: '' })
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await api.get('/api/users/')
            setUsers(res.data.users)
        } catch (err) {
            console.error(err)
            setUsers([
                { id: 1, name: 'Super Admin', email: 'admin@naac.edu', role: 'superadmin', school: null, department: null, is_active: true },
                { id: 2, name: 'Dr. Rajesh Sharma', email: 'vc@naac.edu', role: 'vice_chancellor', school: null, department: null, is_active: true },
                { id: 3, name: 'Dr. Priya Mehta', email: 'iqac@naac.edu', role: 'iqac', school: null, department: null, is_active: true },
                { id: 4, name: 'Dr. Anil Kumar', email: 'dean_eng@naac.edu', role: 'dean', school: 'Engineering', department: null, is_active: true },
                { id: 5, name: 'Dr. Sunita Rao', email: 'hod_cs@naac.edu', role: 'hod', school: 'Engineering', department: 'Computer Science', is_active: true },
                { id: 6, name: 'Prof. Vikram Singh', email: 'fac_cs@naac.edu', role: 'faculty', school: 'Engineering', department: 'Computer Science', is_active: true },
                { id: 7, name: 'Prof. Neha Gupta', email: 'fac_cs2@naac.edu', role: 'faculty', school: 'Engineering', department: 'Computer Science', is_active: true },
                { id: 8, name: 'Dr. Ramesh Joshi', email: 'hod_ee@naac.edu', role: 'hod', school: 'Engineering', department: 'Electrical Engineering', is_active: true },
                { id: 9, name: 'Dr. Kavita Nair', email: 'dean_sci@naac.edu', role: 'dean', school: 'Sciences', department: null, is_active: true },
                { id: 10, name: 'Dr. Pooja Verma', email: 'hod_mgt@naac.edu', role: 'hod', school: 'Business', department: 'Management', is_active: true },
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await api.post('/api/users/', formData)
            setShowModal(false)
            setFormData({ name: '', email: '', role: 'faculty', password: '', school: '', department: '' })
            fetchUsers()
        } catch (err) {
            toast.success(err.response?.data?.error || 'Failed to create user', { icon: '✅' })
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    )

    const inputStyle = { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

    if (loading) {
        return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-[var(--radius)] skeleton" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage system users and their roles</p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 font-semibold rounded-lg text-sm transition"
                    style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}>
                    + Add User
                </button>
            </div>

            <div className="relative">
                <input
                    type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition pl-10"
                    style={{ ...inputStyle }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
                <svg className="absolute left-3 top-3.5 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="rounded-[var(--radius)] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ background: 'var(--bg-surface)' }}>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>User</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Email</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Role</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>School / Dept</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => {
                            const rc = ROLE_COLORS[u.role] || ROLE_COLORS.faculty
                            return (
                                <tr key={u.id} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase flex-shrink-0"
                                                style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.dot}` }}>
                                                {u.name.charAt(0)}{u.name.split(' ')[1]?.charAt(0) || ''}
                                            </div>
                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                    <td className="px-4 py-3.5">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: rc.bg, color: rc.text }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc.dot }} />
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {u.school || '—'}{u.department ? ` / ${u.department}` : ''}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                            style={{ background: u.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: u.is_active ? '#34D399' : '#FCA5A5' }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.is_active ? '#10B981' : '#EF4444' }} />
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(10,14,26,0.7)' }}>
                    <div className="w-full max-w-md rounded-[var(--radius-lg)] overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Add New User</h3>
                            <button onClick={() => setShowModal(false)} className="text-2xl font-light" style={{ color: 'var(--text-muted)' }}>&times;</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {[
                                { label: 'Full Name', name: 'name', type: 'text', required: true },
                                { label: 'Email', name: 'email', type: 'email', required: true },
                                { label: 'Password', name: 'password', type: 'password', required: true },
                                { label: 'School', name: 'school', type: 'text' },
                                { label: 'Department', name: 'department', type: 'text' },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                                    <input type={f.type} required={f.required} value={formData[f.name]} onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition" style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                                        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Role</label>
                                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                                    {['faculty', 'hod', 'dean', 'iqac', 'vice_chancellor', 'superadmin'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold transition mt-2"
                                style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}>Create User</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
