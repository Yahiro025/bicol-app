const skel = 'animate-pulse';
const surfaceStyle = { backgroundColor: 'var(--editorial-surface)' };
const surfaceBorder = { backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' };

export default function WordLoading() {
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--editorial-bg)' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className={`h-6 w-32 rounded ${skel}`} style={surfaceStyle} />

        <section className="rounded-[40px] p-8 md:p-12 shadow-2xl space-y-8" style={surfaceBorder}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className={`h-6 w-32 rounded-full ${skel}`} style={surfaceStyle} />
              <div className={`h-20 md:h-32 w-3/4 rounded-2xl ${skel}`} style={surfaceStyle} />
              <div className={`h-8 w-48 rounded-lg ${skel}`} style={{ backgroundColor: 'var(--editorial-surface)' }} />
            </div>
            <div className={`h-14 w-14 rounded-2xl ${skel}`} style={surfaceStyle} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <div className="space-y-6">
              <div className={`h-4 w-24 rounded ${skel}`} style={surfaceStyle} />
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className={`h-3 w-16 rounded ${skel}`} style={{ backgroundColor: 'var(--editorial-surface)' }} />
                    <div className={`h-8 w-full rounded-lg ${skel}`} style={surfaceStyle} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className={`h-4 w-24 rounded ${skel}`} style={surfaceStyle} />
              <div className={`h-32 rounded-3xl ${skel}`} style={surfaceBorder} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
