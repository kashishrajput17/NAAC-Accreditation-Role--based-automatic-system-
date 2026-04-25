import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const schema = yup.object().shape({
    email: yup.string().email('Must be a valid email.').required('Email is required.'),
    password: yup.string().required('Password is required.')
})

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await login(data.email, data.password)
            toast.success("Login Successful!")
            navigate('/dashboard')
        } catch (err) {
            toast.success(err.response?.data?.error || 'Authentication Failed', { icon: '✅' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-[60%] relative flex-col items-center justify-center p-12"
                style={{
                    background: 'var(--bg-base)',
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(201,168,76,0.04) 35px, rgba(201,168,76,0.04) 36px)'
                }}
            >
                <div className="text-center max-w-md">
                    <h1 className="font-display text-7xl font-black tracking-tight" style={{ color: 'var(--gold)' }}>
                        NAAC
                    </h1>
                    <div className="mx-auto mt-3 h-[2px] w-16" style={{ background: 'var(--gold)' }} />
                    <p className="mt-4 text-sm tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                        Accreditation Automation System
                    </p>

                    <div className="mt-10 text-left space-y-4">
                        {[
                            'Automated scoring across all 7 NAAC criteria',
                            'Real-time metrics tracking & analytics dashboard',
                            'Role-based access for faculty, HODs, Deans & IQAC'
                        ].map((text, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="absolute bottom-8 text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Government of India &nbsp;|&nbsp; UGC
                </p>
            </div>

            {/* Right login form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 border-l"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
                <div className="w-full max-w-sm mx-auto">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="font-display text-4xl font-black" style={{ color: 'var(--gold)' }}>NAAC</h1>
                        <div className="mx-auto mt-2 h-[1px] w-10" style={{ background: 'var(--gold)' }} />
                    </div>

                    <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Sign in to your institution portal
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Email Address
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="admin@naac.edu"
                                className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                style={{
                                    background: 'var(--bg-base)',
                                    border: `1px solid ${errors.email ? 'var(--accent-red)' : 'var(--border)'}`,
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                                onBlur={(e) => { e.target.style.borderColor = errors.email ? 'var(--accent-red)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
                            />
                            {errors.email && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Password
                            </label>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                style={{
                                    background: 'var(--bg-base)',
                                    border: `1px solid ${errors.password ? 'var(--accent-red)' : 'var(--border)'}`,
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                                onBlur={(e) => { e.target.style.borderColor = errors.password ? 'var(--accent-red)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
                            />
                            {errors.password && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{errors.password.message}</p>}
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                            style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-light)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold)'}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/register" className="text-sm font-medium transition" style={{ color: 'var(--gold)' }}>
                            Create a new account →
                        </Link>
                    </div>

                    <p className="mt-12 text-center font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        v2.0.0 — NAAC Automation
                    </p>
                </div>
            </div>
        </div>
    )
}
