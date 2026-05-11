import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import MetricForm from '../components/MetricForm'
import { getStatusColor, capitalize } from '../utils/helpers'

export default function CriterionDetail() {
    const { id } = useParams()
    const [criterion, setCriterion] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchCriterion()
    }, [id])

    const fetchCriterion = async () => {
        try {
            const res = await api.get(`/api/criteria/${id}`)
            setCriterion(res.data.criterion)
        } catch (err) {
            console.error('Failed to fetch criterion:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateMetric = async (data) => {
        try {
            await api.post('/api/metrics', { ...data, criterion_id: parseInt(id) })
            setShowForm(false)
            fetchCriterion()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create metric')
        }
    }

    if (loading) {
        return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-dark-100 rounded-2xl animate-pulse" />)}</div>
    }

    if (!criterion) {
        return <div className="text-center py-16"><p className="text-dark-500">Criterion not found</p></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-dark-400">
                <Link to="/criteria" className="hover:text-primary-600 transition-colors">Criteria</Link>
                <span>/</span>
                <span className="text-dark-700">Criterion {criterion.number}</span>
            </div>

            <div className="bg-white rounded-2xl border border-dark-100 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-10 h-10 bg-primary-50 text-primary-700 rounded-xl flex items-center justify-center font-bold text-lg">{criterion.number}</span>
                            <h1 className="text-xl font-bold text-dark-900">{criterion.name}</h1>
                        </div>
                        {criterion.description && <p className="text-dark-400 mt-2 ml-13">{criterion.description}</p>}
                    </div>
                    <div className="text-right text-sm text-dark-400">
                        <p>Weightage: <span className="font-semibold text-dark-700">{criterion.weightage}%</span></p>
                        <p>Max Score: <span className="font-semibold text-dark-700">{criterion.max_score}</span></p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-dark-800">Metrics ({criterion.metrics?.length || 0})</h2>
                <button onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md">
                    {showForm ? 'Cancel' : '+ Add Metric'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-dark-100 p-6 shadow-sm">
                    <h3 className="font-semibold text-dark-800 mb-4">New Metric</h3>
                    <MetricForm onSubmit={handleCreateMetric} criterionId={id} />
                </div>
            )}

            {criterion.metrics && criterion.metrics.length > 0 ? (
                <div className="space-y-3">
                    {criterion.metrics.map((metric) => (
                        <div key={metric.id} className="bg-white rounded-2xl border border-dark-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-mono bg-dark-100 text-dark-600 px-2 py-0.5 rounded">{metric.key_indicator}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(metric.status)}`}>{capitalize(metric.status)}</span>
                                    </div>
                                    <h4 className="font-medium text-dark-800">{metric.name}</h4>
                                    {metric.description && <p className="text-sm text-dark-400 mt-1">{metric.description}</p>}
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-2xl font-bold text-dark-900">{metric.value ?? '—'}</p>
                                    <p className="text-xs text-dark-400">/ {metric.max_value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dark-100">
                    <p className="text-4xl mb-3">📈</p>
                    <p className="text-dark-500 font-medium">No metrics yet</p>
                    <p className="text-dark-400 text-sm mt-1">Add metrics to track this criterion's progress</p>
                </div>
            )}
        </div>
    )
}
