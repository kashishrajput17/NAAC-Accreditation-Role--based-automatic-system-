import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

export default function ReportChart({ data, title }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dark-100 p-6">
                <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
                <p className="text-center text-dark-400 py-8">No data available</p>
            </div>
        )
    }

    const chartData = data.map((item) => ({
        name: `C${item.criterion_number}`,
        score: item.score,
        maxScore: item.max_score,
        fullName: item.criterion_name,
    }))

    return (
        <div className="bg-white rounded-2xl border border-dark-100 p-6">
            <h3 className="text-lg font-semibold text-dark-800 mb-6">{title}</h3>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value, name, props) => [
                            `${value} / ${props.payload.maxScore}`,
                            props.payload.fullName,
                        ]}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
