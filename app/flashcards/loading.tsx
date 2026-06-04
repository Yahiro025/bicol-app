export default function FlashcardsLoading() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}>
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-12 animate-pulse">
        {/* Back link skeleton */}
        <div className="flex items-center gap-2 w-40">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--editorial-surface)' }} />
          <div className="w-24 h-3 rounded" style={{ backgroundColor: 'var(--editorial-surface)' }} />
        </div>

        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-blue-500/20" />
            <div className="w-20 h-3 bg-blue-500/20 rounded" />
          </div>
          <div className="w-64 h-14 rounded-2xl" style={{ backgroundColor: 'var(--editorial-surface)' }} />
          <div className="w-full max-w-xl h-6 rounded" style={{ backgroundColor: 'var(--editorial-surface)' }} />
        </div>

        {/* Tier selection skeleton */}
        <div className="space-y-4">
          <div className="w-28 h-4 rounded" style={{ backgroundColor: 'var(--editorial-surface)' }} />
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
                <div className="w-20 h-7 rounded" style={{ backgroundColor: 'var(--editorial-bg)' }} />
                <div className="w-32 h-3 rounded mt-2" style={{ backgroundColor: 'var(--editorial-bg)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--editorial-border)', borderTopColor: 'var(--editorial-accent)' }} />
          <div className="w-28 h-4 rounded" style={{ backgroundColor: 'var(--editorial-surface)' }} />
        </div>

        {/* Word count skeleton */}
        <div className="p-4 rounded-2xl flex items-center gap-4" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
          <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: 'var(--editorial-bg)' }} />
          <div>
            <div className="w-28 h-5 rounded" style={{ backgroundColor: 'var(--editorial-bg)' }} />
            <div className="w-40 h-3 rounded mt-1" style={{ backgroundColor: 'var(--editorial-bg)' }} />
          </div>
        </div>

        {/* Start button skeleton */}
        <div className="w-full h-14 rounded-2xl" style={{ backgroundColor: 'var(--editorial-surface)' }} />
      </div>
    </main>
  );
}
