const skel = 'animate-pulse';
const surfaceStyle = { backgroundColor: 'var(--editorial-surface)' };
const surfaceBorderStyle = { backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' };

export default function BrowseLoading() {
  return (
    <main className="min-h-screen p-8 relative" style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}>
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 rounded-full animate-pulse" style={{ borderColor: 'var(--editorial-border)' }} />
            <div className="absolute inset-0 w-12 h-12 border-t-4 rounded-full animate-spin" style={{ borderTopColor: 'var(--editorial-accent)' }} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse" style={{ color: 'var(--editorial-muted)' }}>Accessing Archive...</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto opacity-50 blur-[2px]">
        <div className={`h-9 w-64 rounded-lg ${skel} mb-6`} style={surfaceStyle} />
        <div className="mb-8 max-w-2xl">
          <div className={`w-full h-14 rounded-full ${skel}`} style={surfaceBorderStyle} />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className={`w-36 h-10 rounded-xl ${skel}`} style={surfaceBorderStyle} />
          <div className="flex gap-2">
            <div className={`w-20 h-6 rounded-full ${skel}`} style={surfaceBorderStyle} />
          </div>
        </div>
        <div className={`h-5 w-32 rounded ${skel} mb-6`} style={surfaceStyle} />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`block p-6 rounded-2xl h-32 ${skel}`} style={surfaceBorderStyle}>
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="h-7 w-48 rounded-md" style={surfaceStyle} />
                  <div className="h-5 w-64 rounded-md" style={{ backgroundColor: 'var(--editorial-surface)' }} />
                  <div className="h-3 w-32 rounded-md mt-2" style={{ backgroundColor: 'var(--editorial-surface)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
