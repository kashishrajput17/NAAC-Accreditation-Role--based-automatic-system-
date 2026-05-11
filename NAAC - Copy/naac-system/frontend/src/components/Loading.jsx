export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
            <div className="text-center">
                <div
                    className="inline-block w-12 h-12 rounded-full animate-spin mb-4"
                    style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
                />
                <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        </div>
    )
}
