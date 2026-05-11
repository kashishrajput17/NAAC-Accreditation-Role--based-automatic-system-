import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const schema = yup.object().shape({
    name: yup.string().required('Full name is required.'),
    email: yup.string().email('Must be a valid email.').required('Email is required.'),
    password: yup.string().min(8, 'Password must be at least 8 characters.').required('Password is required.'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match.')
        .required('Confirm password is required.'),
    role: yup.string().required('Role is required.'),
    school: yup.string().optional(),
    department: yup.string().optional(),
})

export default function Register() {
    const { register: registerUser } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            role: 'faculty'
        }
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                school: data.school || undefined,
                department: data.department || undefined,
            })
            toast.success("Account Created Successfully!")
            navigate('/dashboard')
        } catch (err) {
            toast.success(err.response?.data?.error || err.response?.data?.message || 'Registration failed', { icon: '✅' })
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = (error) => ({
        background: 'var(--bg-base)',
        border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border)'}`,
        color: 'var(--text-primary)',
    })

    const handleFocus = (e) => {
        e.target.style.borderColor = 'var(--gold)'
        e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'
    }

    const handleBlur = (e, error) => {
        e.target.style.borderColor = error ? 'var(--accent-red)' : 'var(--border)'
        e.target.style.boxShadow = 'none'
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-[40%] relative flex-col items-center justify-center p-12"
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
                            'Streamlined institutional data management',
                            'Automated criterion-wise scoring',
                            'Comprehensive report generation'
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

            {/* Right registration form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 border-l overflow-y-auto py-12"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
                <div className="w-full max-w-lg mx-auto">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="font-display text-4xl font-black" style={{ color: 'var(--gold)' }}>NAAC</h1>
                        <div className="mx-auto mt-2 h-[1px] w-10" style={{ background: 'var(--gold)' }} />
                    </div>

                    <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Join the NAAC accreditation system
                    </p>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Full Name
                                </label>
                                <input
                                    {...register('name')}
                                    placeholder="Dr. John Doe"
                                    className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                    style={inputStyle(errors.name)}
                                    onFocus={handleFocus}
                                    onBlur={(e) => handleBlur(e, errors.name)}
                                />
                                {errors.name && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Email Address
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="john@university.edu"
                                    className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                    style={inputStyle(errors.email)}
                                    onFocus={handleFocus}
                                    onBlur={(e) => handleBlur(e, errors.email)}
                                />
                                {errors.email && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Password
                                </label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                    style={inputStyle(errors.password)}
                                    onFocus={handleFocus}
                                    onBlur={(e) => handleBlur(e, errors.password)}
                                />
                                {errors.password && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Confirm Password
                                </label>
                                <input
                                    {...register('confirmPassword')}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                    style={inputStyle(errors.confirmPassword)}
                                    onFocus={handleFocus}
                                    onBlur={(e) => handleBlur(e, errors.confirmPassword)}
                                />
                                {errors.confirmPassword && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Role
                            </label>
                            <select
                                {...register('role')}
                                className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                style={inputStyle(errors.role)}
                                onFocus={handleFocus}
                                onBlur={(e) => handleBlur(e, errors.role)}
                            >
                                <option value="faculty">Faculty</option>
                                <option value="hod">Head of Department</option>
                            </select>
                            {errors.role && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{errors.role.message}</p>}
                            <p className="mt-2 text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                Admin roles (IQAC, Dean, etc.) require superadmin approval
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    School
                                </label>
                                <input
                                    {...register('school')}
                                    placeholder="Optional"
                                    className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                    style={inputStyle(errors.school)}
                                    onFocus={handleFocus}
                                    onBlur={(e) => handleBlur(e, errors.school)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Department
                                </label>
                                <input
                                    {...register('department')}
                                    placeholder="Optional"
                                    className="w-full px-4 py-3 rounded-lg text-sm transition outline-none"
                                    style={inputStyle(errors.department)}
                                    onFocus={handleFocus}
                                    onBlur={(e) => handleBlur(e, errors.department)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-3 rounded-lg text-sm font-semibold transition disabled:opacity-50 mt-4"
                            style={{ background: 'var(--gold)', color: 'var(--bg-base)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gold-light)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold)'}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm font-medium transition" style={{ color: 'var(--gold)' }}>
                            Already have an account? Sign In →
                        </Link>
                    </div>

                    <p className="mt-8 text-center font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        v2.0.0 — NAAC Automation
                    </p>
                </div>
            </div>
        </div>
    )
}
