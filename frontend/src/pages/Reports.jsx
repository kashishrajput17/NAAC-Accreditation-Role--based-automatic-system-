import { useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading'

export default function Reports() {
    const { user } = useAuth()

    const [filters, setFilters] = useState({
        academic_year: '2024-25',
        school: user?.school || '',
        department: user?.department || ''
    })

    const [loading, setLoading] = useState(false)
    const [reportData, setReportData] = useState(null)

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.school) params.append('school', filters.school)
            if (filters.academic_year) params.append('academic_year', filters.academic_year)
            const res = await api.get(`/api/reports/naac-summary?${params.toString()}`)
            setReportData(res.data)
        } catch (err) {
            console.error("Failed to fetch report summary: ", err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = (type) => {
        const params = new URLSearchParams()
        if (filters.school) params.append('school', filters.school)
        if (filters.academic_year) params.append('academic_year', filters.academic_year)
        if (type === 'csv' && filters.department) params.append('department', filters.department)
        downloadSecurely(`/api/reports/export/${type}?${params.toString()}`, type)
    }

    const downloadSecurely = async (url, type) => {
        try {
            setLoading(true)
            const response = await api.get(url, { responseType: 'blob' })
            const blob = new Blob([response.data], { type: type === 'csv' ? 'text/csv' : 'application/pdf' })
            const blobUrl = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = `naac_report_${filters.academic_year || 'all'}.${type}`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (err) {
            console.error(`Failed to download ${type}:`, err)
            alert(`Export failed or unauthorized.`)
        } finally {
            setLoading(false)
        }
    }

    const isRestricted = user?.role === 'dean' || user?.role === 'faculty' || user?.role === 'hod'
    const inputStyle = { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Custom Reports & Exports</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Generate dynamic breakdowns and download official accreditation documents.</p>
            </div>

            <div className="rounded-[var(--radius)] overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="p-6" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>Academic Year</label>
                            <select name="academic_year" value={filters.academic_year} onChange={handleFilterChange}
                                className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                                <option value="">All Years</option>
                                <option value="2022-23">2022-23</option>
                                <option value="2023-24">2023-24</option>
                                <option value="2024-25">2024-25</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>School</label>
                            <input type="text" name="school" value={filters.school} onChange={handleFilterChange}
                                disabled={isRestricted}
                                className="px-3 py-2 rounded-lg text-sm outline-none disabled:opacity-50" style={inputStyle} placeholder="e.g. Engineering" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>Department <span className="font-normal lowercase" style={{ color: 'var(--text-muted)' }}>(CSV Only)</span></label>
                            <input type="text" name="department" value={filters.department} onChange={handleFilterChange}
                                disabled={user?.role === 'faculty' || user?.role === 'hod'}
                                className="px-3 py-2 rounded-lg text-sm outline-none disabled:opacity-50" style={inputStyle} placeholder="e.g. Computer Science" />
                        </div>

                        <div className="flex gap-2 ml-auto">
                            <button onClick={handleGenerate} className="px-4 py-2 font-semibold rounded-lg text-sm transition"
                                style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}>
                                Generate View
                            </button>
                            <button onClick={() => handleDownload('csv')} className="px-4 py-2 font-semibold rounded-lg text-sm transition"
                                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                Export CSV
                            </button>
                            <button onClick={() => handleDownload('pdf')} className="px-4 py-2 font-semibold rounded-lg text-sm transition flex items-center gap-2"
                                style={{ background: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}>
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--gold)' }} /></div>
                    ) : !reportData ? (
                        <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            Select parameters and click "Generate View" to see structured report here.
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                                <div>
                                    <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{reportData.institution}</h2>
                                    <div className="h-[2px] w-10 mt-2" style={{ background: 'var(--gold)' }} />
                                    <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-secondary)' }}>School: <span style={{ color: 'var(--text-primary)' }}>{reportData.school}</span></p>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Session: <span style={{ color: 'var(--text-primary)' }}>{reportData.academic_year}</span></p>
                                </div>

                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>Completion</p>
                                        <div className="px-4 py-2 rounded-lg font-bold text-sm" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
                                            {reportData.completion_percentage}%
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>Grade</p>
                                        <div className="w-16 h-10 flex items-center justify-center rounded-lg font-display font-black text-lg" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)', boxShadow: 'var(--shadow-gold)' }}>
                                            {reportData.grade}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-bold tracking-[2px] mb-2" style={{ color: 'var(--text-muted)' }}>CGPA</p>
                                        <div className="text-3xl font-display font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
                                            {reportData.overall_score.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-display italic text-base mb-4" style={{ color: 'var(--text-primary)' }}>Criterion Performance Outline</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {reportData.criteria.map((c, i) => (
                                        <div key={c.criterion_number} className="p-4 rounded-lg flex items-center justify-between transition"
                                            style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-hover)', border: '1px solid var(--border)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <div className="pr-4">
                                                <div className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--gold)' }}>{c.criterion_number}</div>
                                                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.title}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Score</div>
                                                <div className="text-xl font-display font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                                                    {c.score.toFixed(2)} <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/ 4.0</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
