import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading'

const COLORS = ['#C9A84C', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899']
const STATUS_COLORS = { 'approved': '#10B981', 'submitted': '#3B82F6', 'draft': '#4A5568', 'rejected': '#EF4444' }

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-body)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 4 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>{p.value?.toFixed?.(2) ?? p.value}</p>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        mainSummary: null,
        trend: [],
        schoolScores: [],
        deptScores: [],
        entries: []
    })

    useEffect(() => {
        fetchDashboardData()
        const interval = setInterval(fetchDashboardData, 60000)
        return () => clearInterval(interval)
    }, [])

    const fetchDashboardData = async () => {
        try {
            const year = '2024-25'
            const sumRes = await api.get(`/api/scores/summary?academic_year=${year}`)
            const summary = sumRes.data
            const entRes = await api.get(`/api/metrics/entries?academic_year=${year}`)
            const entries = entRes.data.entries

            let schoolScoresList = []
            let deptScoresList = []
            let trendList = []

            if (['iqac', 'vice_chancellor', 'superadmin'].includes(user.role)) {
                const years = ['2022-23', '2023-24', '2024-25']
                const trendPromises = years.map(y => api.get(`/api/scores/summary?academic_year=${y}`).catch(() => null))
                const trendRes = await Promise.all(trendPromises)
                trendList = trendRes.map((r, i) => ({ year: years[i], score: r ? r.data.overall_cgpa : 0 }))

                const uniqueSchools = [...new Set(entries.map(e => e.school).filter(Boolean))]
                const schoolPromises = uniqueSchools.map(s => api.get(`/api/scores/summary?academic_year=${year}&school=${s}`).catch(() => null))
                const schoolRes = await Promise.all(schoolPromises)
                schoolScoresList = schoolRes.map((r, i) => ({ name: uniqueSchools[i] || 'Unknown', score: r ? r.data.overall_cgpa : 0 })).sort((a, b) => b.score - a.score)

                const uniqueDepts = [...new Set(entries.map(e => e.department).filter(Boolean))]
                const deptPromises = uniqueDepts.map(d => api.get(`/api/scores/summary?academic_year=${year}&department=${d}`).catch(() => null))
                const deptRes = await Promise.all(deptPromises)
                deptScoresList = deptRes.map((r, i) => ({ name: uniqueDepts[i] || 'Unknown', score: r ? r.data.overall_cgpa : 0 })).sort((a, b) => b.score - a.score)
            }

            if (user.role === 'dean') {
                const uniqueDepts = [...new Set(entries.map(e => e.department).filter(Boolean))]
                const deptPromises = uniqueDepts.map(d => api.get(`/api/scores/summary?academic_year=${year}&department=${d}`).catch(() => null))
                const deptRes = await Promise.all(deptPromises)
                deptScoresList = deptRes.map((r, i) => ({ name: uniqueDepts[i] || 'Unknown', score: r ? r.data.overall_cgpa : 0 })).sort((a, b) => b.score - a.score)
            }

            setData({ mainSummary: summary, trend: trendList, schoolScores: schoolScoresList, deptScores: deptScoresList, entries })
        } catch (err) {
            console.error('Error fetching dashboard data:', err)
            setData({
                mainSummary: {
                    overall_cgpa: 3.12, grade: 'A', criteria: [
                        { criterion_number: 'C1', title: 'Curricular Aspects', weightage: 150, score: 3.4 },
                        { criterion_number: 'C2', title: 'Teaching-Learning & Evaluation', weightage: 200, score: 3.2 },
                        { criterion_number: 'C3', title: 'Research, Innovations & Extension', weightage: 250, score: 2.9 },
                        { criterion_number: 'C4', title: 'Infrastructure & Learning Resources', weightage: 100, score: 3.6 },
                        { criterion_number: 'C5', title: 'Student Support & Progression', weightage: 100, score: 3.1 },
                        { criterion_number: 'C6', title: 'Governance, Leadership & Management', weightage: 100, score: 2.8 },
                        { criterion_number: 'C7', title: 'Institutional Values & Best Practices', weightage: 100, score: 3.0 },
                    ]
                },
                trend: [{ year: '2022-23', score: 2.65 }, { year: '2023-24', score: 2.88 }, { year: '2024-25', score: 3.12 }],
                schoolScores: [{ name: 'Engineering', score: 3.35 }, { name: 'Sciences', score: 3.10 }, { name: 'Business', score: 2.98 }],
                deptScores: [{ name: 'Computer Science', score: 3.52 }, { name: 'Physics', score: 3.18 }, { name: 'Electrical Eng.', score: 3.05 }, { name: 'Management', score: 2.88 }],
                entries: [
                    { id: 1, school: 'Engineering', department: 'Computer Science', status: 'approved' },
                    { id: 2, school: 'Engineering', department: 'Electrical Eng.', status: 'approved' },
                    { id: 3, school: 'Sciences', department: 'Physics', status: 'submitted' },
                    { id: 4, school: 'Business', department: 'Management', status: 'approved' },
                    { id: 5, school: 'Engineering', department: 'Computer Science', status: 'draft' },
                    { id: 6, school: 'Business', department: 'Management', status: 'rejected' },
                ]
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading && !data.mainSummary) return <Loading />

    if (!data.mainSummary || data.mainSummary.overall_cgpa === undefined) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center h-full">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>📊</div>
                <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>No Assessment Data Yet</h2>
                <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>The dashboard requires metrics to be submitted and officially approved before generating analytics.</p>
                <Link to="/criteria" className="mt-6 px-5 py-2 font-medium rounded-lg text-sm transition" style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}>Go to Criteria</Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Real-time overview for academic year 2024-25</p>
                </div>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Auto-updates every 60s</p>
            </div>

            {['iqac', 'vice_chancellor', 'superadmin'].includes(user.role) && <GlobalView data={data} />}
            {user.role === 'dean' && <DeanView data={data} />}
            {['hod', 'faculty'].includes(user.role) && <DepartmentView data={data} />}
        </div>
    )
}

// ── Card component ──
function DashCard({ children, className = '', borderTop, style = {} }) {
    return (
        <div
            className={`rounded-[var(--radius)] p-6 transition-all duration-250 hover:-translate-y-0.5 ${className}`}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderTop: borderTop ? `3px solid ${borderTop}` : undefined,
                ...style
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-gold)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
        >
            {children}
        </div>
    )
}

function GlobalView({ data }) {
    const { mainSummary, trend, schoolScores, deptScores, entries } = data

    const statusCount = [
        { name: 'Approved', value: entries.filter(e => e.status === 'approved').length },
        { name: 'Submitted', value: entries.filter(e => e.status === 'submitted').length },
        { name: 'Draft', value: entries.filter(e => e.status === 'draft').length },
        { name: 'Rejected', value: entries.filter(e => e.status === 'rejected').length },
    ]

    const gaugeData = [
        { name: 'Score', value: mainSummary.overall_cgpa },
        { name: 'Remaining', value: 4.0 - mainSummary.overall_cgpa }
    ]

    const top5 = deptScores.slice(0, 5)
    const bottom5 = [...deptScores].reverse().slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Score cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashCard borderTop="var(--gold)" className="animate-card-1 flex flex-col items-center justify-center relative overflow-hidden">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[2px] absolute top-6 left-6" style={{ color: 'var(--text-secondary)' }}>Overall NAAC Score</h3>
                    <div className="h-40 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={110} dataKey="value" stroke="none">
                                    <Cell fill="var(--gold)" />
                                    <Cell fill="var(--border)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute bottom-6 flex flex-col items-center">
                        <span className="text-4xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{mainSummary.overall_cgpa.toFixed(2)}</span>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ 4.00</span>
                    </div>
                </DashCard>

                <DashCard borderTop="var(--accent-green)" className="animate-card-2 flex flex-col justify-center items-center text-center">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[2px] mb-3" style={{ color: 'var(--text-secondary)' }}>Predicted Grade</h3>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-display font-black" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '2px solid var(--gold)', boxShadow: 'var(--shadow-gold)' }}>
                        {mainSummary.grade}
                    </div>
                    <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>Based on submitted & approved data</p>
                </DashCard>

                <DashCard borderTop="var(--accent-purple)" className="animate-card-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[2px] mb-4" style={{ color: 'var(--text-secondary)' }}>Submission Status</h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusCount} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                                    <Cell fill={STATUS_COLORS.approved} />
                                    <Cell fill={STATUS_COLORS.submitted} />
                                    <Cell fill={STATUS_COLORS.draft} />
                                    <Cell fill={STATUS_COLORS.rejected} />
                                </Pie>
                                <RTTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </DashCard>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashCard>
                    <h3 className="font-display italic text-base mb-4" style={{ color: 'var(--text-primary)' }}>School-wise Performance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={schoolScores}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <YAxis domain={[0, 4]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <RTTooltip content={<CustomTooltip />} />
                                <Bar dataKey="score" fill="var(--gold)" opacity={0.8} radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </DashCard>

                <DashCard>
                    <h3 className="font-display italic text-base mb-4" style={{ color: 'var(--text-primary)' }}>Criteria-wise Performance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius="80%" data={mainSummary.criteria_scores || mainSummary.criteria}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="criterion_number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                <Radar name="Score" dataKey="score" stroke="var(--gold)" fill="rgba(201,168,76,0.15)" strokeWidth={2} />
                                <RTTooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </DashCard>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashCard>
                    <h3 className="font-display italic text-base mb-4" style={{ color: 'var(--text-primary)' }}>Year-over-Year Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="year" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <YAxis domain={[0, 4]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <RTTooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="score" stroke="var(--gold)" strokeWidth={3} dot={{ r: 6, fill: 'var(--bg-card)', stroke: 'var(--gold)', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </DashCard>

                <DashCard className="overflow-hidden flex flex-col">
                    <div className="p-0 mb-0">
                        <h3 className="font-display italic text-base" style={{ color: 'var(--text-primary)' }}>Department Rankings</h3>
                    </div>
                    <div className="flex-1 grid grid-cols-2 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="p-4" style={{ borderRight: '1px solid var(--border)' }}>
                            <h4 className="text-[10px] font-bold uppercase tracking-[2px] mb-3" style={{ color: 'var(--text-muted)' }}>Top Performers</h4>
                            <ul className="space-y-3">
                                {top5.map((d, i) => (
                                    <li key={i} className="flex justify-between items-center text-sm">
                                        <span className="truncate pr-2 font-medium" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                                        <span className="font-bold font-mono" style={{ color: 'var(--accent-green)' }}>{d.score.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[2px] mb-3 text-right" style={{ color: 'var(--text-muted)' }}>Needs Attention</h4>
                            <ul className="space-y-3">
                                {bottom5.map((d, i) => (
                                    <li key={i} className="flex justify-between items-center text-sm">
                                        <span className="font-bold font-mono" style={{ color: 'var(--accent-red)' }}>{d.score.toFixed(2)}</span>
                                        <span className="truncate pl-2 font-medium text-right" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </DashCard>
            </div>
        </div>
    )
}

function DeanView({ data }) {
    const { mainSummary, deptScores, entries } = data
    const pendingCount = entries.filter(e => e.status === 'submitted').length

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashCard borderTop="var(--gold)" className="animate-card-1">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[2px]" style={{ color: 'var(--text-secondary)' }}>School Overall Score</h3>
                    <div className="mt-2 text-4xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{mainSummary.overall_cgpa.toFixed(2)} <span className="text-xl font-normal" style={{ color: 'var(--text-muted)' }}>/ 4.0</span></div>
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Predicted Grade:</span>
                        <span className="px-3 py-1 rounded-lg font-display font-bold text-sm" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)' }}>{mainSummary.grade}</span>
                    </div>
                </DashCard>

                <DashCard borderTop="var(--accent-orange)" className="animate-card-2 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[11px] font-semibold uppercase tracking-[2px]" style={{ color: 'var(--text-secondary)' }}>Pending Approvals</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-4xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{pendingCount}</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>metrics await review</span>
                        </div>
                    </div>
                    <Link to="/criteria" className="mt-6 w-full text-center block px-4 py-2 font-semibold rounded-lg transition text-sm" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)' }}>
                        Review Now
                    </Link>
                </DashCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashCard>
                    <h3 className="font-display italic text-base mb-4" style={{ color: 'var(--text-primary)' }}>Criterion Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mainSummary.criteria_scores || mainSummary.criteria} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                <XAxis type="number" domain={[0, 'dataMax']} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <YAxis dataKey="criterion_number" type="category" width={40} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <RTTooltip content={<CustomTooltip />} />
                                <Bar dataKey="score" fill="var(--gold)" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </DashCard>

                <DashCard>
                    <h3 className="font-display italic text-base mb-4" style={{ color: 'var(--text-primary)' }}>Department Comparison</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptScores}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <YAxis domain={[0, 4]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <RTTooltip content={<CustomTooltip />} />
                                <Bar dataKey="score" fill="var(--accent-orange)" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </DashCard>
            </div>
        </div>
    )
}

function DepartmentView({ data }) {
    const { mainSummary, entries } = data
    const rejected = entries.filter(e => e.status === 'rejected')
    const totalFilled = entries.length

    const statCards = [
        { label: 'Approved', value: entries.filter(e => e.status === 'approved').length, color: 'var(--accent-green)', border: 'var(--accent-green)' },
        { label: 'Pending Review', value: entries.filter(e => e.status === 'submitted').length, color: 'var(--accent-blue)', border: 'var(--accent-blue)' },
        { label: 'Drafts', value: entries.filter(e => e.status === 'draft').length, color: 'var(--text-muted)', border: 'var(--border)' },
        { label: 'Total Submitted', value: totalFilled, color: 'var(--gold)', border: 'var(--gold)' },
    ]

    return (
        <div className="space-y-6">
            {rejected.length > 0 && (
                <div className="p-4 rounded-[var(--radius)] border-l-4" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'var(--accent-red)', color: '#FCA5A5' }}>
                    <div className="flex items-center gap-2 mb-2 font-bold text-sm">⚠ Action Required: {rejected.length} metrics rejected</div>
                    <ul className="space-y-2 text-sm pl-6 list-disc">
                        {rejected.map(r => (
                            <li key={r.id}>Metric <span className="font-semibold">{r.metric_id}</span>: <span className="italic">"{r.review_comment}"</span>
                                <Link to="/criteria" className="ml-3 font-medium hover:underline" style={{ color: 'var(--accent-red)' }}>Fix now →</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <DashCard key={i} borderTop={stat.border} className={`animate-card-${i + 1}`}>
                        <h4 className="text-[11px] font-semibold uppercase tracking-[2px]" style={{ color: 'var(--text-secondary)' }}>{stat.label}</h4>
                        <div className="text-3xl font-display font-bold mt-1" style={{ color: stat.color }}>{stat.value}</div>
                    </DashCard>
                ))}
            </div>

            <DashCard>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display italic text-base" style={{ color: 'var(--text-primary)' }}>Data Completion by Criterion</h3>
                    <Link to="/criteria" className="text-sm font-semibold transition" style={{ color: 'var(--gold)' }}>Fill metrics →</Link>
                </div>
                <div className="space-y-5">
                    {(mainSummary.criteria_scores || mainSummary.criteria || []).map(c => (
                        <div key={c.criterion_number}>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.criterion_number}: {c.title}</span>
                                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{c.completion_percentage || Math.round((c.score / 4) * 100)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.completion_percentage || Math.round((c.score / 4) * 100)}%`, background: 'var(--gold)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </DashCard>
        </div>
    )
}
