import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import WordOfTheDay from "@/components/WordOfTheDay";
import CategoryGrid from "@/components/CategoryGrid";
import WordCard from "@/components/WordCard";
import HomeVerbDemo from "@/components/HomeVerbDemo";
import HeroSection from "@/components/HeroSection";
import { ArrowRight } from "lucide-react";
import {
  countDistinctWords,
  getCategoryCounts,
  findWordsByBikol,
  getWordOfTheDay,
  getInitialDictionary,
} from "@/lib/word-search";
import { POPULAR_WORDS } from "@/lib/constants";

// ISR: revalidate every 5 minutes.
export const revalidate = 300;

export default async function HomePage() {
  const [wordCountResult, wotdResult, dictionaryResult, categoriesResult, popularResult] =
    await Promise.allSettled([
      countDistinctWords(),
      getWordOfTheDay(),
      getInitialDictionary(50),
      getCategoryCounts(12),
      findWordsByBikol(POPULAR_WORDS),
    ]);

  const wordCount = wordCountResult.status === "fulfilled" ? wordCountResult.value : 0;
  const wotd = wotdResult.status === "fulfilled" && wotdResult.value
    ? { bikol: wotdResult.value.bikol, english: wotdResult.value.english || "", tagalog: wotdResult.value.tagalog, pos: wotdResult.value.pos, dialect: wotdResult.value.dialect, pronunciation: wotdResult.value.pronunciation }
    : null;
  const categoryCounts = categoriesResult.status === "fulfilled"
    ? categoriesResult.value.map((c) => ({ category: c.category, _count: { bikol: c.count } }))
    : [];
  const popularWords = popularResult.status === "fulfilled"
    ? popularResult.value.map((w) => ({ bikol: w.bikol, english: w.english || "", tagalog: w.tagalog, pos: w.pos, dialect: w.dialect, pronunciation: w.pronunciation }))
    : [];
  const initialDictionary = dictionaryResult.status === "fulfilled" ? dictionaryResult.value : [];

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--editorial-bg)" }}
    >
      {/* ── Hero ── */}
      <HeroSection wordCount={wordCount}>
        <SearchBar initialDictionary={initialDictionary} />
      </HeroSection>

      {/* ── Content Sections ── */}
      <div
        className="relative px-6 pb-32"
        style={{ backgroundColor: "var(--editorial-bg)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* ── Word of the Day ── */}
          {wotd && (
            <section className="py-20">
              <span className="section-number">Featured Entry</span>
              <h2
                className="text-3xl sm:text-4xl font-black tracking-tight mt-3 mb-10 text-[var(--editorial-text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Word of the Day
              </h2>
              <WordOfTheDay word={wotd} className="max-w-2xl" />
              <div className="rule-divider mt-20" />
            </section>
          )}

          {/* ── Verb Conjugator Demo ── */}
          <section className="py-20">
            <span className="section-number">Tool</span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3 mb-10">
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--editorial-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Verb Conjugator
                </h2>
                <p
                  className="text-[var(--editorial-muted)] mt-2 max-w-lg"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Instantly see how Bikol verbs transform across tenses and focus
                  types.
                </p>
              </div>
              <Link
                href="/word/bakal"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--editorial-accent-dim)] hover:text-[var(--editorial-accent)] transition-colors group"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Explore More Verbs
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <HomeVerbDemo />
            <div className="rule-divider mt-20" />
          </section>

          {/* ── Categories ── */}
          <section className="py-20">
            <span className="section-number">Browse</span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3 mb-10">
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--editorial-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  By Category
                </h2>
                <p
                  className="text-[var(--editorial-muted)] mt-2 max-w-lg"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Words organized by topic — from anatomy to weather, curated for
                  deliberate exploration.
                </p>
              </div>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--editorial-accent-dim)] hover:text-[var(--editorial-accent)] transition-colors group"
                style={{ fontFamily: "var(--font-body)" }}
              >
                View All Categories
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <CategoryGrid categoryCounts={categoryCounts} className="grid gap-6" />
            <div className="rule-divider mt-20" />
          </section>

          {/* ── Popular Words ── */}
          <section className="py-20">
            <span className="section-number">Popular</span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3 mb-10">
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--editorial-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Most Searched Words
                </h2>
                <p
                  className="text-[var(--editorial-muted)] mt-2 max-w-lg"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Frequently looked up by learners and speakers across the Bikol
                  community.
                </p>
              </div>
              <Link
                href="/browse?sort=popular"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--editorial-accent-dim)] hover:text-[var(--editorial-accent)] transition-colors group"
                style={{ fontFamily: "var(--font-body)" }}
              >
                See All Popular
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid gap-4">
              {popularWords.map((word) => (
                <WordCard
                  key={word.bikol!}
                  word={word}
                  className="hover:scale-[1.01] transition-transform duration-200"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
