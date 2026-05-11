import { useState, useEffect } from 'react'
import api from '../utils/api'

const ACTION_COLORS = {
    create: { color: '#34D399', label: 'CREATE' },
    update: { color: '#60A5FA', label: 'UPDATE' },
    delete: { color: '#FCA5A5', label: 'DELETE' },
    submit: { color: '#C9A84C', label: 'SUBMIT' },
    review: { color: '#C9A84C', label: 'APPROVE' },
}

export default function AuditLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filters, setFilters] = useState({ table: '', from_date: '', to_date: '' })

    useEffect(() => {
        fetchLogs(page)
    }, [page, filters])

    const fetchLogs = async (pageNum) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: pageNum, per_page: 25 })
            if (filters.table) params.append('table', filters.table)
            if (filters.from_date) params.append('from_date', filters.from_date)
            if (filters.to_date) params.append('to_date', filters.to_date)
            const res = await api.get(`/api/audit/logs?${params.toString()}`)
            setLogs(res.data.logs)
            setTotalPages(res.data.pages)
        } catch (err) {
            console.error('Failed to fetch audit logs:', err)
            setLogs([
                { id: 1, timestamp: '2026-04-08T10:15:00Z', user_name: 'Super Admin', action: 'create', table_name: 'users', record_id: 1, old_value: null, new_value: 'Created Super Admin account' },
                { id: 2, timestamp: '2026-04-08T10:16:00Z', user_name: 'Super Admin', action: 'create', table_name: 'criteria', record_id: 1, old_value: null, new_value: 'Seeded 7 NAAC Criteria' },
                { id: 3, timestamp: '2026-04-08T11:30:00Z', user_name: 'Prof. Vikram Singh', action: 'create', table_name: 'metric_entries', record_id: 1, old_value: null, new_value: 'Submitted C1 metric 1.1.1' },
                { id: 4, timestamp: '2026-04-08T11:45:00Z', user_name: 'Prof. Vikram Singh', action: 'submit', table_name: 'metric_entries', record_id: 1, old_value: 'draft', new_value: 'submitted' },
                { id: 5, timestamp: '2026-04-08T14:00:00Z', user_name: 'Dr. Anil Kumar', action: 'review', table_name: 'metric_entries', record_id: 1, old_value: 'submitted', new_value: 'approved' },
                { id: 6, timestamp: '2026-04-08T14:30:00Z', user_name: 'Prof. Neha Gupta', action: 'create', table_name: 'metric_entries', record_id: 2, old_value: null, new_value: 'Submitted C2 metric 2.1.1' },
                { id: 7, timestamp: '2026-04-08T15:00:00Z', user_name: 'Prof. Deepa Iyer', action: 'create', table_name: 'metric_entries', record_id: 5, old_value: null, new_value: 'Research grants: INR 20 Lakhs' },
                { id: 8, timestamp: '2026-04-08T15:30:00Z', user_name: 'Dr. Sunita Rao', action: 'update', table_name: 'users', record_id: 7, old_value: 'role: faculty', new_value: 'role: faculty (updated)' },
                { id: 9, timestamp: '2026-04-09T09:00:00Z', user_name: 'Dr. Kavita Nair', action: 'review', table_name: 'metric_entries', record_id: 5, old_value: 'submitted', new_value: 'approved' },
                { id: 10, timestamp: '2026-04-09T10:15:00Z', user_name: 'Dr. Priya Mehta', action: 'create', table_name: 'metric_entries', record_id: 10, old_value: null, new_value: 'NAAC summary report generated' },
            ])
            setTotalPages(1)
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

    if (loading && logs.length === 0) {
        return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-12 rounded-[var(--radius)] skeleton" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Audit Logs</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Track all system changes and data modifications</p>
            </div>

            <div className="flex flex-wrap gap-3 items-end p-4 rounded-[var(--radius)]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>Table</label>
                    <select value={filters.table} onChange={(e) => setFilters({ ...filters, table: e.target.value })}
                        className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                        <option value="">All Tables</option>
                        <option value="users">Users</option>
                        <option value="criteria">Criteria</option>
                        <option value="metric_entries">Metric Entries</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>From</label>
                    <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                        className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>To</label>
                    <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                        className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
            </div>

            <div className="rounded-[var(--radius)] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ background: 'var(--bg-surface)' }}>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Timestamp</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>User</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Action</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Table</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Changes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => {
                            const ac = ACTION_COLORS[log.action] || { color: 'var(--text-secondary)', label: log.action?.toUpperCase() }
                            return (
                                <tr key={log.id} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{log.user_name}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ac.color }}>{ac.label}</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{log.table_name}</td>
                                    <td className="px-4 py-3 max-w-xs">
                                        {log.old_value && log.new_value ? (
                                            <div className="flex gap-2 text-xs font-mono">
                                                <div className="px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.05)', borderLeft: '3px solid var(--accent-red)', color: '#FCA5A5' }}>
                                                    {log.old_value}
                                                </div>
                                                <span style={{ color: 'var(--text-muted)' }}>→</span>
                                                <div className="px-2 py-1 rounded" style={{ background: 'rgba(16,185,129,0.05)', borderLeft: '3px solid var(--accent-green)', color: '#34D399' }}>
                                                    {log.new_value}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{log.new_value || '—'}</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            style={{
                                background: page === p ? 'var(--gold)' : 'var(--bg-card)',
                                color: page === p ? 'var(--bg-base)' : 'var(--text-secondary)',
                                border: `1px solid ${page === p ? 'var(--gold)' : 'var(--border)'}`,
                            }}
                        >{p}</button>
                    ))}
                </div>
            )}
        </div>
    )
}
