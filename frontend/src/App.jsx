import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Loading from './components/Loading'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Criteria from './pages/Criteria'
import CriterionDetail from './pages/CriterionDetail'
import Metrics from './pages/Metrics'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Profile from './pages/Profile'
import AuditLogs from './pages/AuditLogs'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

function App() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <AuthProvider>
            <div className="font-sans antialiased text-dark-900 min-h-screen bg-dark-50">
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={
                        <ErrorBoundary>
                            <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
                                <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
                                {mobileMenuOpen && (
                                    <div
                                        className="fixed inset-0 z-20 lg:hidden backdrop-blur-sm transition-opacity"
                                        style={{ background: 'rgba(10,14,26,0.7)' }}
                                        onClick={() => setMobileMenuOpen(false)}
                                    />
                                )}
                                <div className="flex-1 flex flex-col lg:ml-64 transition-all">
                                    <Navbar onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                                    <main className="flex-1 px-4 lg:px-8 py-8 mt-14 overflow-y-auto">
                                        <Outlet />
                                    </main>
                                </div>
                            </div>
                        </ErrorBoundary>
                    }>
                        {/* All Protected Routes get rendered within the Layout Outlet */}
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/criteria" element={<ProtectedRoute><Criteria /></ProtectedRoute>} />
                        <Route path="/criteria/:id" element={<ProtectedRoute><CriterionDetail /></ProtectedRoute>} />
                        <Route path="/metrics" element={<ProtectedRoute><Metrics /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute requiredPermission="can_manage_users"><Users /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/audit-logs" element={<ProtectedRoute requiredPermission="can_manage_users"><AuditLogs /></ProtectedRoute>} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </div>
        </AuthProvider>
    )
}

export default App
