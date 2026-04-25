import { Link } from 'react-router-dom'

export default function CriteriaCard({ criterion }) {
    const completionRate = criterion.metrics_count > 0 ? 75 : 0 // placeholder

    return (
        <Link
            to={`/criteria/${criterion.id}`}
            className="block bg-white rounded-2xl border border-dark-100 p-6 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-primary-50 text-primary-700 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-primary-100 transition-colors">
                    {criterion.number}
                </div>
                <span className="text-xs font-medium text-dark-400 bg-dark-50 px-3 py-1 rounded-full">
                    {criterion.metrics_count} metrics
                </span>
            </div>

            <h3 className="font-semibold text-dark-800 mb-2 group-hover:text-primary-700 transition-colors">
                {criterion.name}
            </h3>

            {criterion.description && (
                <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                    {criterion.description}
                </p>
            )}

            <div className="mt-4">
                <div className="flex justify-between text-xs text-dark-400 mb-1">
                    <span>Progress</span>
                    <span>{completionRate}%</span>
                </div>
                <div className="w-full bg-dark-100 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-dark-400">
                    Weightage: <span className="font-semibold text-dark-600">{criterion.weightage}%</span>
                </span>
                <span className="text-xs text-primary-600 font-medium group-hover:translate-x-1 transition-transform inline-block">
                    View details →
                </span>
            </div>
        </Link>
    )
}
