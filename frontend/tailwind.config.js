/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'rgba(201,168,76,0.08)',
                    100: 'rgba(201,168,76,0.12)',
                    200: '#E2C97E',
                    300: '#D4B85E',
                    400: '#C9A84C',
                    500: '#C9A84C',
                    600: '#C9A84C',
                    700: '#B8963A',
                    800: '#9A7D30',
                    900: '#7C6426',
                    950: '#5E4B1C',
                },
                accent: {
                    50: 'rgba(16,185,129,0.08)',
                    100: 'rgba(16,185,129,0.12)',
                    200: '#6EE7B7',
                    300: '#34D399',
                    400: '#10B981',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                },
                dark: {
                    50: '#0A0E1A',
                    100: '#111827',
                    200: '#1F2D4A',
                    300: '#2A3A5C',
                    400: '#4A5568',
                    500: '#8896B3',
                    600: '#8896B3',
                    700: '#A0AEC0',
                    800: '#C9D1E0',
                    900: '#EEF2FF',
                    950: '#F7F8FC',
                },
                navy: {
                    base: '#0A0E1A',
                    surface: '#111827',
                    card: '#161D2F',
                    'card-hover': '#1C2540',
                    border: '#1F2D4A',
                },
                gold: {
                    DEFAULT: '#C9A84C',
                    light: '#E2C97E',
                    dim: 'rgba(201,168,76,0.12)',
                    glow: 'rgba(201,168,76,0.15)',
                },
            },
            fontFamily: {
                sans: ['DM Sans', 'system-ui', 'sans-serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 200ms ease-out both',
                'fade-slide-up': 'fadeSlideUp 400ms ease both',
                'slide-in-right': 'slideInRight 250ms ease-out both',
                'shimmer': 'shimmer 1.5s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                fadeSlideUp: {
                    from: { opacity: '0', transform: 'translateY(16px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    from: { transform: 'translateX(100%)' },
                    to: { transform: 'translateX(0)' },
                },
                shimmer: {
                    from: { backgroundPosition: '-200% 0' },
                    to: { backgroundPosition: '200% 0' },
                },
            },
            boxShadow: {
                'card': '0 4px 24px rgba(0,0,0,0.4)',
                'gold': '0 0 24px rgba(201,168,76,0.15)',
            },
            borderRadius: {
                'card': '10px',
                'card-lg': '16px',
            },
        },
    },
    plugins: [],
}
