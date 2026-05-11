import { createContext, useContext, useReducer, useEffect } from 'react'
import api, { setTokens, clearTokens, getAccessToken } from '../utils/api'

const AuthContext = createContext(null)

// ── State shape ──
const initialState = {
    user: null,
    permissions: null,
    loading: true,
    error: null,
}

// ── Reducer ──
function authReducer(state, action) {
    switch (action.type) {
        case 'AUTH_LOADING':
            return { ...state, loading: true, error: null }
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                permissions: action.payload.permissions || null,
                loading: false,
                error: null,
            }
        case 'AUTH_ERROR':
            return { ...state, user: null, permissions: null, loading: false, error: action.payload }
        case 'LOGOUT':
            return { ...initialState, loading: false }
        case 'CLEAR_ERROR':
            return { ...state, error: null }
        default:
            return state
    }
}

// ── Provider ──
export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // On mount: try to restore session via refresh token (stored only in memory across SPA navigations)
    useEffect(() => {
        const token = getAccessToken()
        if (token) {
            fetchCurrentUser()
        } else {
            dispatch({ type: 'LOGOUT' })
        }
    }, [])

    const fetchCurrentUser = async () => {
        dispatch({ type: 'AUTH_LOADING' })
        try {
            const res = await api.get('/api/auth/me')
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: res.data.user, permissions: res.data.permissions },
            })
        } catch {
            clearTokens()
            dispatch({ type: 'LOGOUT' })
        }
    }

    const login = async (email, password) => {
        dispatch({ type: 'AUTH_LOADING' })
        try {
            const res = await api.post('/api/auth/login', { email, password })
            setTokens(res.data.access_token, res.data.refresh_token)
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: res.data.user },
            })
            // Fetch full permissions
            fetchCurrentUser()
            return res.data
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Login failed'
            dispatch({ type: 'AUTH_ERROR', payload: errorMsg })
            throw err
        }
    }

    const register = async (userData) => {
        dispatch({ type: 'AUTH_LOADING' })
        try {
            const res = await api.post('/api/auth/register', userData)
            setTokens(res.data.access_token, res.data.refresh_token)
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: res.data.user },
            })
            fetchCurrentUser()
            return res.data
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed'
            dispatch({ type: 'AUTH_ERROR', payload: errorMsg })
            throw err
        }
    }

    const logout = async () => {
        try {
            await api.post('/api/auth/logout')
        } catch {
            // Ignore errors during logout
        }
        clearTokens()
        dispatch({ type: 'LOGOUT' })
    }

    const clearError = () => dispatch({ type: 'CLEAR_ERROR' })

    const hasPermission = (perm) => {
        return state.permissions?.[perm] === true
    }

    return (
        <AuthContext.Provider value={{
            user: state.user,
            permissions: state.permissions,
            loading: state.loading,
            error: state.error,
            login, register, logout, clearError, hasPermission, fetchCurrentUser,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
