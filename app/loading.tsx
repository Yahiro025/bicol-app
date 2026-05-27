export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Skeleton */}
      <section className="relative px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-pulse">
          <div className="space-y-4">
            <div className="h-24 md:h-32 w-64 md:w-96 bg-zinc-900 rounded-2xl mx-auto" />
            <div className="h-8 w-3/4 max-w-xl bg-zinc-900 rounded-lg mx-auto" />
          </div>
          <div className="mx-auto w-full max-w-2xl h-16 bg-zinc-900 rounded-full" />
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl h-40" />
            ))}
          </div>
          <div className="mt-16 flex justify-center gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-10 w-20 bg-zinc-900 rounded-lg" />
                <div className="h-3 w-16 bg-zinc-900/50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
