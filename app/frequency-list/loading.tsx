export default function FrequencyListLoading() {
  return (
    <main className="min-h-screen p-8" style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}>
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-9 w-56 rounded-lg mb-6" style={{ backgroundColor: 'var(--editorial-surface)' }} />
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
          <div style={{ borderColor: 'var(--editorial-divider)' }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--editorial-divider)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-4 rounded" style={{ backgroundColor: 'var(--editorial-bg)' }} />
                  <div className="h-5 w-32 rounded" style={{ backgroundColor: 'var(--editorial-bg)' }} />
                </div>
                <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--editorial-bg)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
