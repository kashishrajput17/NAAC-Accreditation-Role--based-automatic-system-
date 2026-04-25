import { useState, useEffect } from 'react'
import api from '../utils/api'
import { getStatusColor, capitalize } from '../utils/helpers'

const STATUS_BADGE = {
    draft: { bg: 'rgba(74,85,104,0.3)', text: '#8896B3', dot: '#4A5568' },
    submitted: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', dot: '#3B82F6' },
    approved: { bg: 'rgba(16,185,129,0.15)', text: '#34D399', dot: '#10B981' },
    rejected: { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5', dot: '#EF4444' },
    pending: { bg: 'rgba(245,158,11,0.15)', text: '#FBBF24', dot: '#F59E0B' },
    in_progress: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', dot: '#3B82F6' },
    completed: { bg: 'rgba(16,185,129,0.15)', text: '#34D399', dot: '#10B981' },
    verified: { bg: 'rgba(139,92,246,0.15)', text: '#A78BFA', dot: '#8B5CF6' },
}

export default function Metrics() {
    const [metrics, setMetrics] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('')

    useEffect(() => {
        fetchMetrics()
    }, [filterStatus])

    const fetchMetrics = async () => {
        try {
            const params = filterStatus ? `?status=${filterStatus}` : ''
            const res = await api.get(`/api/metrics${params}`)
            setMetrics(res.data.metrics)
        } catch (err) {
            console.error('Failed to fetch metrics:', err)
            setMetrics([
                { id: 1, metric_code: '1.1.1', title: 'Curricula developed with relevance to local, national and global needs', input_type: 'qualitative', max_score: 20, entries_count: 2 },
                { id: 2, metric_code: '1.1.2', title: 'Number of programmes where syllabus revision was carried out', input_type: 'quantitative', max_score: 30, entries_count: 4 },
                { id: 3, metric_code: '2.1.1', title: 'Enrolment percentage', input_type: 'quantitative', max_score: 15, entries_count: 4 },
                { id: 4, metric_code: '2.3.1', title: 'Student centric methods for enhancing learning experiences', input_type: 'qualitative', max_score: 20, entries_count: 2 },
                { id: 5, metric_code: '3.1.1', title: 'Grants received from Government and non-government agencies (INR Lakhs)', input_type: 'quantitative', max_score: 25, entries_count: 2 },
                { id: 6, metric_code: '3.3.1', title: 'Research papers published in Scopus/WoS/UGC indexed journals', input_type: 'quantitative', max_score: 25, entries_count: 3 },
                { id: 7, metric_code: '4.1.1', title: 'Adequate infrastructure and physical facilities', input_type: 'qualitative', max_score: 15, entries_count: 1 },
                { id: 8, metric_code: '5.2.1', title: 'Percentage of placement of outgoing students', input_type: 'quantitative', max_score: 15, entries_count: 3 },
                { id: 9, metric_code: '6.3.1', title: 'Financial support for teachers attending conferences', input_type: 'quantitative', max_score: 20, entries_count: 2 },
                { id: 10, metric_code: '7.1.1', title: 'Gender equity initiatives by the institution', input_type: 'quantitative', max_score: 15, entries_count: 2 },
            ])
        } finally {
            setLoading(false)
        }
    }

    const statuses = ['', 'pending', 'in_progress', 'completed', 'verified']

    if (loading) {
        return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-[var(--radius)] skeleton" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>All Metrics</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Track and manage all key indicators across criteria</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                {statuses.map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition"
                        style={{
                            background: filterStatus === s ? 'var(--gold)' : 'var(--bg-card)',
                            color: filterStatus === s ? 'var(--bg-base)' : 'var(--text-secondary)',
                            border: `1px solid ${filterStatus === s ? 'var(--gold)' : 'var(--border)'}`,
                        }}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            <div className="rounded-[var(--radius)] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ background: 'var(--bg-surface)' }}>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Code</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Metric Title</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Type</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Max Score</th>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Entries</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map(m => (
                            <tr key={m.id} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td className="px-4 py-3.5 font-mono text-xs font-semibold" style={{ color: 'var(--gold)' }}>{m.metric_code}</td>
                                <td className="px-4 py-3.5" style={{ color: 'var(--text-primary)' }}>{m.title}</td>
                                <td className="px-4 py-3.5">
                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>{m.input_type}</span>
                                </td>
                                <td className="px-4 py-3.5 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{m.max_score}</td>
                                <td className="px-4 py-3.5 font-mono" style={{ color: 'var(--text-secondary)' }}>{m.entries_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
