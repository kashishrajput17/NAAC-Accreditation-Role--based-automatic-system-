import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <p className="text-8xl mb-6">🔍</p>
            <h1 className="text-4xl font-bold text-dark-900 mb-2">404</h1>
            <p className="text-dark-400 mb-8">The page you're looking for doesn't exist</p>
            <Link
                to="/dashboard"
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-md"
            >
                Go to Dashboard
            </Link>
        </div>
    )
}
