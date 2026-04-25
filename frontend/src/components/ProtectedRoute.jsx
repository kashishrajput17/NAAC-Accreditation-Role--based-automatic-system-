import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

/**
 * ProtectedRoute HOC — redirects unauthenticated users to /login.
 * Optionally accepts `requiredPermission` to check role-based access.
 */
export default function ProtectedRoute({ children, requiredPermission }) {
    const { user, loading, hasPermission } = useAuth()
    const location = useLocation()

    if (loading) {
        return <Loading />
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <p className="text-6xl mb-4">🚫</p>
                <h2 className="text-2xl font-bold text-dark-900 mb-2">Access Denied</h2>
                <p className="text-dark-400">You don't have permission to access this page.</p>
                <p className="text-dark-300 text-sm mt-1">Required: <code className="bg-dark-100 px-2 py-0.5 rounded text-dark-600">{requiredPermission}</code></p>
            </div>
        )
    }

    return children
}
