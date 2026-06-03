import type { Metadata } from "next";
import ClientSubmissionWrapper from "@/components/ClientSubmissionWrapper";

export const metadata: Metadata = {
  title: "Contribute a Word",
  description: "Help grow the Bikol dictionary by submitting new words and definitions.",
};

export default function ContributePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--editorial-bg)' }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl font-display font-black tracking-tight" style={{ color: 'var(--editorial-text)' }}>
            Contribute a Word
          </h1>
          <p className="text-lg" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
            Help us document and preserve the Bikol language. All submissions are reviewed by moderators.
          </p>
        </div>
        <ClientSubmissionWrapper />
      </div>
    </main>
  );
}
