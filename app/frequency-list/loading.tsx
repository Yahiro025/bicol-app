export default function FrequencyListLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-9 w-56 bg-zinc-900 rounded-lg mb-6" />
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-zinc-800">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-4 bg-zinc-800 rounded" />
                  <div className="h-5 w-32 bg-zinc-800 rounded" />
                </div>
                <div className="h-4 w-24 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
