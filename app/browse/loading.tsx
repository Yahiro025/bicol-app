export default function BrowseLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Title Skeleton */}
        <div className="h-9 w-64 bg-zinc-900 rounded-lg animate-pulse mb-6" />
        
        {/* Search Bar Skeleton */}
        <div className="mb-8 max-w-2xl">
          <div className="w-full h-14 bg-zinc-900 border border-zinc-800 rounded-full animate-pulse" />
        </div>

        {/* Filter Button Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-36 h-10 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="w-20 h-6 bg-zinc-900 border border-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Results Count Skeleton */}
        <div className="h-5 w-32 bg-zinc-900 rounded animate-pulse mb-6" />

        {/* Word Cards Skeletons */}
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="block bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl h-32 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="h-7 w-48 bg-zinc-800 rounded-md" />
                  <div className="h-5 w-64 bg-zinc-800/50 rounded-md" />
                  <div className="h-3 w-32 bg-zinc-800/30 rounded-md mt-2" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-16 bg-zinc-800 rounded ml-auto" />
                  <div className="h-5 w-20 bg-zinc-800/50 rounded ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
