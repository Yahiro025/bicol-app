export default function HomeLoading() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}>
      <section className="relative px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-pulse">
          <div className="space-y-4">
            <div className="h-24 md:h-32 w-64 md:w-96 rounded-2xl mx-auto" style={{ backgroundColor: 'var(--editorial-surface)' }} />
            <div className="h-8 w-3/4 max-w-xl rounded-lg mx-auto" style={{ backgroundColor: 'var(--editorial-surface)' }} />
          </div>
          <div className="mx-auto w-full max-w-2xl h-16 rounded-full" style={{ backgroundColor: 'var(--editorial-surface)' }} />
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 rounded-3xl h-40" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }} />
            ))}
          </div>
          <div className="mt-16 flex justify-center gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-10 w-20 rounded-lg" style={{ backgroundColor: 'var(--editorial-surface)' }} />
                <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--editorial-surface)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
