export default function FlashcardsLoading() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-12 animate-pulse">
        {/* Back link skeleton */}
        <div className="flex items-center gap-2 w-40">
          <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-blue-500/20" />
            <div className="w-20 h-3 bg-blue-500/20 rounded" />
          </div>
          <div className="w-64 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="w-full max-w-xl h-6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Tier selection skeleton */}
        <div className="space-y-4">
          <div className="w-28 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                <div className="w-20 h-7 bg-blue-500/20 rounded" />
                <div className="w-32 h-3 bg-zinc-200 dark:bg-zinc-800 rounded mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <div className="w-28 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Word count skeleton */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div>
            <div className="w-28 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="w-40 h-3 bg-zinc-200 dark:bg-zinc-800 rounded mt-1" />
          </div>
        </div>

        {/* Start button skeleton */}
        <div className="w-full h-14 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    </main>
  );
}
