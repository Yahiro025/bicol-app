import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { BookOpen, Heart } from "lucide-react";

const FOOTER_LINK = "/frequency-list";

export default function Footer() {
  return (
    <footer className="relative mt-32 px-6 py-16" style={{ backgroundColor: "var(--editorial-surface)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="rule-divider mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tighter" style={{ fontFamily: "var(--font-display)", color: "var(--editorial-accent)" }}>
              BIKOL Dictionary
            </h3>
            <p className="text-sm leading-relaxed max-w-xs" style={{ fontFamily: "var(--font-body)", color: "var(--editorial-muted)" }}>
              A comprehensive lexicon of the Bikol language — preserving and celebrating the linguistic heritage of the Bicol Region, Philippines.
            </p>
          </div>

          <div className="space-y-4">
            <span className="section-number" style={{ fontFamily: "var(--font-body)" }}>Explore</span>
            <nav className="space-y-2">
              {[...NAV_LINKS, { href: FOOTER_LINK, label: "Frequency List" }].map(({ href, label }) => (
                <Link key={href} href={href} className="block text-sm font-medium transition-colors hover:text-[var(--editorial-accent)] w-fit" style={{ fontFamily: "var(--font-body)", color: "var(--editorial-muted)" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <span className="section-number" style={{ fontFamily: "var(--font-body)" }}>About</span>
            <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--editorial-muted)" }}>
              Built with data from Malcolm Mintz&apos; Bikol Dictionary, Wiktionary, and LearnBikol.com. AI-enhanced with Groq for interactive learning.
            </p>
            <Link href="/contribute" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[var(--editorial-accent)]" style={{ fontFamily: "var(--font-body)", color: "var(--editorial-accent-dim)" }}>
              <BookOpen className="w-3.5 h-3.5" />
              Contribute a Word
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: "1px solid var(--editorial-divider)", color: "var(--editorial-muted)", fontFamily: "var(--font-body)" }}>
          <p>&copy; {new Date().getFullYear()} BIKOL Dictionary. Open-source project.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 inline" style={{ color: "var(--editorial-rust)" }} /> for the Bikol language community
          </p>
        </div>
      </div>
    </footer>
  );
}
