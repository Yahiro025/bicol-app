export default function LearnLoading() {
  return (
    <main className="min-h-screen pt-12 pb-32 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 space-y-12 animate-pulse">
        {/* Back link skeleton */}
        <div className="flex items-center gap-2 w-40">
          <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Header skeleton */}
        <header className="space-y-6 pt-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-purple-500/20" />
              <div className="w-24 h-3 bg-purple-500/20 rounded" />
            </div>
            <div className="w-80 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="w-full max-w-xl h-6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </header>

        {/* Drill card skeleton */}
        <section className="relative">
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <div className="w-48 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="w-full max-w-2xl mx-auto p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-8">
            <div className="space-y-4 text-center">
              <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
              <div className="w-full h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="w-32 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
            <div className="w-full h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="w-full h-14 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </section>

        {/* Curriculum path skeleton */}
        <section className="space-y-8 pt-20">
          <div className="space-y-2">
            <div className="w-48 h-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="w-64 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-[32px] bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-24 h-6 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Stats skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
              <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="w-16 h-7 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
