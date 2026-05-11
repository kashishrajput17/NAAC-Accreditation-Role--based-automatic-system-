/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateString) {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

/**
 * Format a number as a percentage string.
 */
export function formatPercentage(value, decimals = 1) {
    if (value == null) return '0%'
    return `${Number(value).toFixed(decimals)}%`
}

/**
 * Get a CSS class for a NAAC grade badge.
 */
export function getGradeColor(grade) {
    const colors = {
        'A++': 'bg-emerald-100 text-emerald-800',
        'A+': 'bg-green-100 text-green-800',
        'A': 'bg-lime-100 text-lime-800',
        'B++': 'bg-yellow-100 text-yellow-800',
        'B+': 'bg-amber-100 text-amber-800',
        'B': 'bg-orange-100 text-orange-800',
        'C': 'bg-red-100 text-red-800',
        'D': 'bg-gray-100 text-gray-800',
    }
    return colors[grade] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status badge styling.
 */
export function getStatusColor(status) {
    const colors = {
        pending: 'bg-slate-100 text-slate-700',
        in_progress: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        verified: 'bg-emerald-100 text-emerald-700',
        draft: 'bg-yellow-100 text-yellow-700',
        finalized: 'bg-indigo-100 text-indigo-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}
