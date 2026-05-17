export default function WordLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button Skeleton */}
        <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse" />

        <section className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1 space-y-4">
              {/* Badge */}
              <div className="h-6 w-32 bg-zinc-800 rounded-full animate-pulse" />
              {/* Heading */}
              <div className="h-20 md:h-32 w-3/4 bg-zinc-800 rounded-2xl animate-pulse" />
              {/* Pronunciation */}
              <div className="h-8 w-48 bg-zinc-800/50 rounded-lg animate-pulse" />
            </div>
            {/* Share Button */}
            <div className="h-14 w-14 bg-zinc-800 rounded-2xl animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            {/* Definitions column */}
            <div className="space-y-6">
              <div className="h-4 w-24 bg-zinc-800/70 rounded animate-pulse" />
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-zinc-800/30 rounded animate-pulse" />
                  <div className="h-8 w-full bg-zinc-800 rounded-lg animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-zinc-800/30 rounded animate-pulse" />
                  <div className="h-8 w-full bg-zinc-800 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>

            {/* Usage column */}
            <div className="space-y-6">
              <div className="h-4 w-24 bg-zinc-800/70 rounded animate-pulse" />
              <div className="h-32 bg-zinc-800/20 border border-white/5 rounded-3xl animate-pulse" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
