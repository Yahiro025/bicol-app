import type { Metadata } from "next";
import ClientSubmissionWrapper from "@/components/ClientSubmissionWrapper";

export const metadata: Metadata = {
  title: "Contribute a Word",
  description: "Help grow the Bikol dictionary by submitting new words and definitions.",
};

export default function ContributePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl font-display font-black tracking-tight text-zinc-900 dark:text-white">
            Contribute a Word
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            Help us document and preserve the Bikol language. All submissions are reviewed by moderators.
          </p>
        </div>
        <ClientSubmissionWrapper />
      </div>
    </main>
  );
}
