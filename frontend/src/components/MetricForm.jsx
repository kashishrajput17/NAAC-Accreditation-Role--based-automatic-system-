import { useState } from 'react'

export default function MetricForm({ onSubmit, initialData = {}, criterionId }) {
    const [formData, setFormData] = useState({
        key_indicator: initialData.key_indicator || '',
        name: initialData.name || '',
        description: initialData.description || '',
        data_type: initialData.data_type || 'numeric',
        value: initialData.value || '',
        max_value: initialData.max_value || 100,
        document_url: initialData.document_url || '',
        status: initialData.status || 'pending',
        criterion_id: initialData.criterion_id || criterionId || '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({
            ...formData,
            value: formData.value ? parseFloat(formData.value) : null,
            max_value: parseFloat(formData.max_value),
            criterion_id: parseInt(formData.criterion_id),
        })
    }

    const inputClass = 'w-full px-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all'

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Key Indicator</label>
                    <input type="text" name="key_indicator" value={formData.key_indicator} onChange={handleChange}
                        placeholder="e.g. 1.1.1" className={inputClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Data Type</label>
                    <select name="data_type" value={formData.data_type} onChange={handleChange} className={inputClass}>
                        <option value="numeric">Numeric</option>
                        <option value="percentage">Percentage</option>
                        <option value="boolean">Boolean</option>
                        <option value="text">Text</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Metric name" className={inputClass} required />
            </div>

            <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                    placeholder="Describe this metric..." rows={3} className={inputClass} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Value</label>
                    <input type="number" name="value" value={formData.value} onChange={handleChange}
                        placeholder="0" step="0.01" className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Max Value</label>
                    <input type="number" name="max_value" value={formData.max_value} onChange={handleChange}
                        step="0.01" className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="verified">Verified</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Document URL</label>
                <input type="url" name="document_url" value={formData.document_url} onChange={handleChange}
                    placeholder="https://..." className={inputClass} />
            </div>

            <button type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg">
                {initialData.id ? 'Update Metric' : 'Create Metric'}
            </button>
        </form>
    )
}
