import BrowseClient from "@/components/BrowseClient";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import {
  browseWords,
  getCategoryCounts,
  countDistinctWords,
} from "@/lib/word-search";

// ISR: dictionary content changes infrequently, revalidate every 5 minutes
export const revalidate = 300;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    letter?: string;
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { letter, category, q, sort, page } = await searchParams;

  let dbError: string | null = null;

  const totalWords = await countDistinctWords().catch((err) => {
    console.error("Count failed:", err);
    dbError = err?.message || "Failed to load word count";
    return 0;
  });

  const maxPage = Math.ceil(totalWords / 50) || 1;
  const initialPage = Math.min(Math.max(1, parseInt(page || "1", 10) || 1), maxPage);
  const offset = (initialPage - 1) * 50;

  const [wordsResult, categoriesResult] = await Promise.allSettled([
    browseWords({ filters: { letter, category, q }, sort, limit: 50, offset }),
    getCategoryCounts(50),
  ]);

  const words = wordsResult.status === "fulfilled" ? wordsResult.value : [];
  if (wordsResult.status === "rejected") {
    console.error(wordsResult.reason);
    dbError = wordsResult.reason?.message || "Failed to load words";
  }

  const categories = categoriesResult.status === "fulfilled"
    ? categoriesResult.value.map((c) => c.category).sort()
    : [];
  if (categoriesResult.status === "rejected") {
    console.error("Categories failed:", categoriesResult.reason);
  }

  return (
    <main className="min-h-screen p-8" style={{ backgroundColor: "var(--editorial-bg)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Section label + heading */}
        <span className="section-number">Dictionary</span>
        <div className="flex items-center justify-between mt-3 mb-8 flex-wrap gap-4">
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--editorial-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Browse Dictionary
          </h1>
          <Link
            href="/flashcards"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--editorial-accent)",
              color: "#fff",
            }}
          >
            <BookOpen className="w-4 h-4" />
            Study with Flashcards
          </Link>
        </div>
        <div className="rule-divider mb-10" />

        {dbError && (
          <div
            className="p-4 rounded-xl text-sm mb-6"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(194,106,62,0.08)",
              color: "var(--editorial-rust)",
              border: "1px solid rgba(194,106,62,0.2)",
            }}
          >
            Database Error: {dbError}
          </div>
        )}

        <BrowseClient
          initialWords={words}
          initialCategories={categories}
          totalWords={totalWords}
          initialLetter={letter || ""}
          initialCategory={category || ""}
          initialQuery={q || ""}
          initialSort={sort || ""}
          initialPage={initialPage}
        />
      </div>
    </main>
  );
}
