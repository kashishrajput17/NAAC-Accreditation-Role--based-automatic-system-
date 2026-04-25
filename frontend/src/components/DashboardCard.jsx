export default function DashboardCard({ title, value, subtitle, icon, color = 'primary' }) {
    const colorMap = {
        primary: 'from-primary-500 to-primary-700',
        accent: 'from-accent-500 to-accent-700',
        amber: 'from-amber-500 to-amber-700',
        rose: 'from-rose-500 to-rose-700',
        indigo: 'from-indigo-500 to-indigo-700',
    }

    return (
        <div className="bg-white rounded-2xl border border-dark-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-dark-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-dark-900">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-dark-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.primary} flex items-center justify-center text-white text-xl shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
