import axios from 'axios'
import toast from 'react-hot-toast'

export const getAccessToken = () => {
    return localStorage.getItem("access_token")
}

export const setTokens = (access, refresh) => {
    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)
}

export const clearTokens = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Attach token dynamically
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken()
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor with Hot-Toast integrations
api.interceptors.response.use(
    (response) => response,
    async (error) => {

        if (error.response) {
            const status = error.response.status
            if (status === 400) {
                toast.success(error.response.data?.message || 'Invalid Request Data')
            } else if (status === 401) {
                // Silently handle 401
            } else if (status === 403) {
                toast.success('Access Denied', { style: { background: 'var(--bg-surface)', border: '1px solid var(--gold)', color: 'var(--gold)' } })
            }
        } else {
            toast.success('System Notice: Check Connection', { icon: 'ℹ️' })
        }

        return Promise.reject(error)
    }
)

export default api
