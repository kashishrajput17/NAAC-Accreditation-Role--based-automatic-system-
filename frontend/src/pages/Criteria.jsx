import { useState, useEffect, useMemo } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const STATUS_BADGE = {
    draft: { bg: 'rgba(74,85,104,0.3)', text: '#8896B3', dot: '#4A5568' },
    submitted: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', dot: '#3B82F6' },
    approved: { bg: 'rgba(16,185,129,0.15)', text: '#34D399', dot: '#10B981' },
    rejected: { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5', dot: '#EF4444' },
}

export default function Criteria() {
    const { user, hasPermission } = useAuth()

    const [criteria, setCriteria] = useState([])
    const [metricsData, setMetricsData] = useState({})
    const [loading, setLoading] = useState(true)

    const [expandedCriterion, setExpandedCriterion] = useState(null)
    const [expandedIndicator, setExpandedIndicator] = useState(null)
    const [academicYear, setAcademicYear] = useState('2024-25')

    const [modalOpen, setModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('entry')
    const [selectedMetric, setSelectedMetric] = useState(null)
    const [formEntry, setFormEntry] = useState(null)
    const [formData, setFormData] = useState({ value_text: '', value_numeric: '' })
    const [formLoading, setFormLoading] = useState(false)
    const [entryHistory, setEntryHistory] = useState([])

    const years = ['2022-23', '2023-24', '2024-25']

    useEffect(() => {
        fetchData()
    }, [academicYear])

    const fetchData = async () => {
        setLoading(true)
        try {
            const criteriaRes = await api.get('/api/criteria')
            setCriteria(criteriaRes.data.criteria)

            const params = new URLSearchParams()
            params.append('academic_year', academicYear)
            if (user.role === 'faculty' || user.role === 'hod') {
                if (user.school) params.append('school', user.school)
                if (user.department) params.append('department', user.department)
            }

            const metricsRes = await api.get(`/api/metrics?${params.toString()}`)
            const mData = {}
            metricsRes.data.metrics.forEach(m => {
                mData[m.id] = m.entries || []
            })
            setMetricsData(mData)
        } catch (err) {
            console.error('Failed to fetch criteria data:', err)
            setCriteria([
                {
                    id: 1, criterion_number: 'C1', title: 'Curricular Aspects', description: 'Curriculum design, development and planning', weightage: 150,
                    key_indicators: [
                        {
                            id: 1, indicator_code: '1.1', title: 'Curriculum Design and Development', description: 'Relevance to local, national, regional and global needs', max_score: 50,
                            metrics: [
                                { id: 1, metric_code: '1.1.1', title: 'Curricula developed with relevance to developmental needs', input_type: 'qualitative', max_score: 20 },
                                { id: 2, metric_code: '1.1.2', title: 'Programmes with syllabus revision during the year', input_type: 'quantitative', max_score: 30 },
                            ]
                        },
                        {
                            id: 2, indicator_code: '1.2', title: 'Academic Flexibility', description: 'Choice-based credit system and elective options', max_score: 50,
                            metrics: [
                                { id: 3, metric_code: '1.2.1', title: 'New courses introduced across programmes', input_type: 'quantitative', max_score: 25 },
                                { id: 4, metric_code: '1.2.2', title: 'Programmes with CBCS/Elective system', input_type: 'quantitative', max_score: 25 },
                            ]
                        },
                    ]
                },
                {
                    id: 2, criterion_number: 'C2', title: 'Teaching-Learning and Evaluation', description: 'Student enrolment, teaching methods and evaluation', weightage: 200,
                    key_indicators: [
                        {
                            id: 3, indicator_code: '2.1', title: 'Student Enrolment and Profile', description: 'Enrolment and diversity metrics', max_score: 30,
                            metrics: [
                                { id: 5, metric_code: '2.1.1', title: 'Enrolment percentage', input_type: 'quantitative', max_score: 15 },
                                { id: 6, metric_code: '2.1.2', title: 'Seats filled against reserved categories', input_type: 'quantitative', max_score: 15 },
                            ]
                        },
                    ]
                },
                {
                    id: 3, criterion_number: 'C3', title: 'Research, Innovations and Extension', description: 'Research grants, publications and community outreach', weightage: 250,
                    key_indicators: [
                        {
                            id: 5, indicator_code: '3.1', title: 'Resource Mobilization for Research', max_score: 50,
                            metrics: [{ id: 9, metric_code: '3.1.1', title: 'Grants received for research projects', input_type: 'quantitative', max_score: 25 }]
                        },
                    ]
                },
                {
                    id: 4, criterion_number: 'C4', title: 'Infrastructure and Learning Resources', description: 'Physical facilities, library, and IT infrastructure', weightage: 100,
                    key_indicators: [
                        {
                            id: 7, indicator_code: '4.1', title: 'Physical Facilities', max_score: 30,
                            metrics: [{ id: 11, metric_code: '4.1.1', title: 'Adequate infrastructure for teaching-learning', input_type: 'qualitative', max_score: 15 }]
                        },
                    ]
                },
                {
                    id: 5, criterion_number: 'C5', title: 'Student Support and Progression', description: 'Scholarships, placement and student activities', weightage: 100,
                    key_indicators: [
                        {
                            id: 9, indicator_code: '5.1', title: 'Student Support', max_score: 30,
                            metrics: [{ id: 13, metric_code: '5.1.1', title: 'Students benefited by government scholarships', input_type: 'quantitative', max_score: 15 }]
                        },
                    ]
                },
                {
                    id: 6, criterion_number: 'C6', title: 'Governance, Leadership and Management', description: 'Institutional vision, strategy, and faculty empowerment', weightage: 100,
                    key_indicators: [
                        {
                            id: 11, indicator_code: '6.1', title: 'Institutional Vision and Leadership', max_score: 30,
                            metrics: [{ id: 15, metric_code: '6.1.1', title: 'Reflective and participative governance', input_type: 'qualitative', max_score: 15 }]
                        },
                    ]
                },
                {
                    id: 7, criterion_number: 'C7', title: 'Institutional Values and Best Practices', description: 'Social responsibility, best practices, and distinctiveness', weightage: 100,
                    key_indicators: [
                        {
                            id: 13, indicator_code: '7.1', title: 'Institutional Values', max_score: 40,
                            metrics: [{ id: 17, metric_code: '7.1.1', title: 'Gender equity initiatives during the year', input_type: 'quantitative', max_score: 15 }]
                        },
                    ]
                },
            ])
            const fallbackEntries = {}
            for (let i = 1; i <= 18; i++) {
                fallbackEntries[i] = [
                    { id: i * 100, submitted_by: 1, academic_year: '2024-25', status: i % 3 === 0 ? 'submitted' : 'approved', value_numeric: 15 + i, value_text: 'Sample qualitative data entry with detailed description.' }
                ]
            }
            setMetricsData(fallbackEntries)
        } finally {
            setLoading(false)
        }
    }

    const calculateCompletion = (criterion) => {
        let totalMetrics = 0
        let filledMetrics = 0
        criterion.key_indicators?.forEach(ki => {
            ki.metrics?.forEach(m => {
                totalMetrics++
                const entries = metricsData[m.id] || []
                if (entries.length > 0) filledMetrics++
            })
        })
        if (totalMetrics === 0) return 0
        return Math.round((filledMetrics / totalMetrics) * 100)
    }

    const fetchHistory = async (entryId) => {
        try {
            const res = await api.get(`/api/audit/metrics/entry/${entryId}/history`)
            setEntryHistory(res.data.history)
        } catch (err) {
            console.error('Failed to fetch history:', err)
        }
    }

    const handleOpenModal = (metric) => {
        setSelectedMetric(metric)
        const entries = metricsData[metric.id] || []
        let existingEntry = null
        if (user.role === 'faculty' || user.role === 'superadmin' || user.role === 'hod') {
            existingEntry = entries.find(e => e.academic_year === academicYear && (user.role === 'superadmin' || e.submitted_by === user.id))
        }
        setFormEntry(existingEntry || null)
        setFormData({ value_text: existingEntry?.value_text || '', value_numeric: existingEntry?.value_numeric || '' })
        setEntryHistory([])
        setActiveTab('entry')
        if (existingEntry) fetchHistory(existingEntry.id)
        setModalOpen(true)
    }

    const handleSaveDraft = async (e) => {
        e?.preventDefault()
        setFormLoading(true)
        try {
            const payload = {
                academic_year: academicYear,
                ...(selectedMetric.input_type === 'quantitative' ? { value_numeric: parseFloat(formData.value_numeric) } : { value_text: formData.value_text })
            }
            if (formEntry && formEntry.status === 'draft') {
                await api.put(`/api/metrics/entry/${formEntry.id}`, payload)
            } else if (!formEntry) {
                await api.post(`/api/metrics/${selectedMetric.id}/entry`, payload)
            }
            setModalOpen(false)
            fetchData()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save entry')
        } finally {
            setFormLoading(false)
        }
    }

    const handleSubmitFinal = async () => {
        if (!formEntry || formEntry.status !== 'draft') return
        if (!confirm('Are you sure you want to submit this metric? It will be sent for review and cannot be edited.')) return
        setFormLoading(true)
        try {
            await api.patch(`/api/metrics/entry/${formEntry.id}/submit`)
            setModalOpen(false)
            fetchData()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit entry')
        } finally {
            setFormLoading(false)
        }
    }

    const handleReview = async (entryId, statusStr) => {
        try {
            await api.patch(`/api/metrics/entry/${entryId}/review`, { status: statusStr })
            fetchData()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to review entry')
        }
    }

    if (loading && criteria.length === 0) {
        return (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-[var(--radius)] skeleton" />)}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Criteria & Data Entry</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage NAAC metrics for the selected academic year</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Academic Year:</label>
                    <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="px-3 py-2 rounded-lg text-sm outline-none transition"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {criteria.map((c) => {
                    const completion = calculateCompletion(c)
                    const isExpanded = expandedCriterion === c.id

                    return (
                        <div key={c.id} className="rounded-[var(--radius)] overflow-hidden transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            {/* Criterion header */}
                            <div
                                onClick={() => setExpandedCriterion(isExpanded ? null : c.id)}
                                className="p-5 flex items-center justify-between cursor-pointer transition-colors"
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="font-display text-4xl font-black opacity-20 select-none hidden sm:block" style={{ color: 'var(--gold)' }}>{c.criterion_number}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider sm:hidden" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>{c.criterion_number}</span>
                                            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</h2>
                                        </div>
                                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{c.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm ml-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Weightage</p>
                                        <p className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{c.weightage}</p>
                                    </div>
                                    <div className="w-28 hidden sm:block">
                                        <div className="flex justify-between text-[10px] mb-1 font-semibold uppercase tracking-wider">
                                            <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                                            <span style={{ color: completion === 100 ? 'var(--accent-green)' : 'var(--gold)' }}>{completion}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completion}%`, background: completion === 100 ? 'var(--accent-green)' : 'var(--gold)' }} />
                                        </div>
                                    </div>
                                    <span className={`transform transition-transform text-xs ${isExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>▼</span>
                                </div>
                            </div>

                            {/* Key Indicators */}
                            {isExpanded && (
                                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                                    {c.key_indicators?.map((ki) => {
                                        const isIndExpanded = expandedIndicator === ki.id
                                        return (
                                            <div key={ki.id} style={{ borderBottom: '1px solid var(--border)' }} className="last:border-0">
                                                <div
                                                    onClick={() => setExpandedIndicator(isIndExpanded ? null : ki.id)}
                                                    className="px-6 py-4 flex items-center justify-between cursor-pointer transition-colors"
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-xs font-mono font-bold shrink-0 mt-0.5" style={{ color: 'var(--gold)' }}>{ki.indicator_code}</span>
                                                        <div>
                                                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ki.title}</h3>
                                                            <p className="text-xs mt-0.5 max-w-2xl" style={{ color: 'var(--text-muted)' }}>{ki.description}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`transform transition-transform text-[10px] ${isIndExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>▼</span>
                                                </div>

                                                {/* Metrics Table */}
                                                {isIndExpanded && (
                                                    <div className="px-6 pb-5 pt-2">
                                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                                                            <table className="w-full text-left text-sm">
                                                                <thead>
                                                                    <tr style={{ background: 'var(--bg-base)' }}>
                                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px] w-16" style={{ color: 'var(--text-muted)' }}>Code</th>
                                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px]" style={{ color: 'var(--text-muted)' }}>Metric</th>
                                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px] w-28" style={{ color: 'var(--text-muted)' }}>Type</th>
                                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px] w-32" style={{ color: 'var(--text-muted)' }}>Status</th>
                                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[2px] w-28 text-right" style={{ color: 'var(--text-muted)' }}>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {ki.metrics?.map(m => {
                                                                        const entries = metricsData[m.id] || []
                                                                        let displayEntry = null
                                                                        if (user.role === 'faculty' || user.role === 'hod') {
                                                                            displayEntry = entries.find(e => e.submitted_by === user.id) || entries[0]
                                                                        } else {
                                                                            displayEntry = entries.find(e => ['submitted', 'approved', 'rejected'].includes(e.status)) || entries[0]
                                                                        }
                                                                        const sb = displayEntry ? STATUS_BADGE[displayEntry.status] : null

                                                                        return (
                                                                            <tr key={m.id} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }}
                                                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                            >
                                                                                <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--gold)' }}>{m.metric_code}</td>
                                                                                <td className="px-4 py-3 min-w-[200px]" style={{ color: 'var(--text-primary)' }}>{m.title}</td>
                                                                                <td className="px-4 py-3">
                                                                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                                                                                        {m.input_type}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-3">
                                                                                    {sb ? (
                                                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: sb.bg, color: sb.text }}>
                                                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sb.dot }} />
                                                                                            {displayEntry.status}
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Not Started</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-4 py-3 text-right">
                                                                                    <button
                                                                                        onClick={() => handleOpenModal(m)}
                                                                                        className="text-xs font-semibold px-3 py-1.5 rounded-md transition"
                                                                                        style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}
                                                                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--bg-base)' }}
                                                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
                                                                                    >
                                                                                        {hasPermission('can_submit_data') || hasPermission('can_review_data') ? 'Fill / View' : 'View Data'}
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Modal */}
            {modalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(10,14,26,0.7)' }}>
                    <div className="w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-[var(--radius-lg)]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <p className="font-mono text-xs mb-1" style={{ color: 'var(--gold)' }}>{selectedMetric.metric_code}</p>
                                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Data Entry</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Academic Year: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{academicYear}</span></p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-2xl font-light leading-none transition" style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >&times;</button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 pt-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                            <button onClick={() => setActiveTab('entry')}
                                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                                style={{
                                    borderBottom: activeTab === 'entry' ? '2px solid var(--gold)' : '2px solid transparent',
                                    color: activeTab === 'entry' ? 'var(--gold)' : 'var(--text-muted)',
                                }}
                            >Data Entry</button>
                            {formEntry && (
                                <button onClick={() => setActiveTab('history')}
                                    className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                                    style={{
                                        borderBottom: activeTab === 'history' ? '2px solid var(--gold)' : '2px solid transparent',
                                        color: activeTab === 'history' ? 'var(--gold)' : 'var(--text-muted)',
                                    }}
                                >History ({entryHistory.length})</button>
                            )}
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {activeTab === 'entry' ? (
                                <>
                                    <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)' }}>
                                        <span className="font-semibold block mb-1 text-sm" style={{ color: 'var(--gold-light)' }}>{selectedMetric.title}</span>
                                        {selectedMetric.description && <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>{selectedMetric.description}</span>}
                                    </div>

                                    <form id="metric-form" onSubmit={handleSaveDraft} className="space-y-4">
                                        {selectedMetric.input_type === 'quantitative' ? (
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Numeric Value (Max: {selectedMetric.max_score})</label>
                                                <input
                                                    type="number" step="0.01" required
                                                    disabled={formEntry?.status === 'submitted' || formEntry?.status === 'approved'}
                                                    value={formData.value_numeric}
                                                    onChange={e => setFormData({ ...formData, value_numeric: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition"
                                                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                    onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                                                    placeholder="e.g. 154"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Qualitative Description</label>
                                                <textarea
                                                    rows={6} required
                                                    disabled={formEntry?.status === 'submitted' || formEntry?.status === 'approved'}
                                                    value={formData.value_text}
                                                    onChange={e => setFormData({ ...formData, value_text: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition resize-none"
                                                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                                    onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                                                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                                                    placeholder="Provide detailed description..."
                                                />
                                            </div>
                                        )}
                                    </form>

                                    {formEntry?.status === 'submitted' && hasPermission('can_review_data') && (
                                        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                                            <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Review Action</h4>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleReview(formEntry.id, 'approved')} className="flex-1 py-2.5 font-semibold rounded-lg transition text-sm" style={{ background: 'var(--accent-green)', color: '#fff' }}>Approve</button>
                                                <button onClick={() => handleReview(formEntry.id, 'rejected')} className="flex-1 py-2.5 font-semibold rounded-lg transition text-sm" style={{ background: 'var(--accent-red)', color: '#fff' }}>Reject</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="relative ml-3 pl-6 space-y-8 pb-4" style={{ borderLeft: '2px solid var(--border)' }}>
                                    {entryHistory.map((h) => (
                                        <div key={h.id} className="relative">
                                            <div className="absolute -left-8 mt-1.5 w-4 h-4 rounded-full border-2"
                                                style={{ borderColor: 'var(--bg-surface)', background: h.action === 'create' ? 'var(--accent-green)' : h.action === 'update' ? 'var(--accent-blue)' : 'var(--accent-orange)' }} />
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{h.user_name}</span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>{h.user_role}</span>
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>• {new Date(h.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm font-semibold capitalize mb-2" style={{ color: 'var(--text-secondary)' }}>
                                                    Action: <span style={{ color: h.action === 'create' ? 'var(--accent-green)' : h.action === 'update' ? 'var(--accent-blue)' : 'var(--accent-orange)' }}>{h.action}</span>
                                                </p>
                                                {(h.action === 'update' || h.action === 'create') && (
                                                    <div className="text-xs font-mono p-3 rounded-lg" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                                        {h.action === 'create' ? (
                                                            <div>{h.new_value}</div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-2 rounded break-all" style={{ background: 'rgba(239,68,68,0.05)', borderLeft: '3px solid var(--accent-red)', color: '#FCA5A5' }}>{h.old_value}</div>
                                                                <div className="p-2 rounded break-all" style={{ background: 'rgba(16,185,129,0.05)', borderLeft: '3px solid var(--accent-green)', color: '#34D399' }}>{h.new_value}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {entryHistory.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No history available.</p>}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
                            <div>
                                {formEntry && (() => {
                                    const sb = STATUS_BADGE[formEntry.status]
                                    return (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: sb?.bg, color: sb?.text }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sb?.dot }} />
                                            {formEntry.status}
                                        </span>
                                    )
                                })()}
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold transition" style={{ color: 'var(--text-secondary)' }}>Close</button>
                                {hasPermission('can_submit_data') && (!formEntry || formEntry.status === 'draft' || formEntry.status === 'rejected') && (
                                    <>
                                        <button type="submit" form="metric-form" disabled={formLoading}
                                            className="px-5 py-2.5 text-sm font-semibold rounded-lg transition"
                                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        >Save as Draft</button>
                                        <button onClick={handleSubmitFinal} disabled={formLoading || !formEntry}
                                            className="px-5 py-2.5 text-sm font-semibold rounded-lg transition disabled:opacity-50"
                                            style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}
                                        >Submit Final</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
