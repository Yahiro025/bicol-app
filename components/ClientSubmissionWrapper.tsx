"use client";

import dynamic from "next/dynamic";

const UserSubmissionForm = dynamic(
  () => import("@/components/UserSubmissionForm"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm animate-pulse">
        <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2 mb-4" />
        <div className="space-y-4">
          <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    ),
  }
);

export default function ClientSubmissionWrapper() {
  return <UserSubmissionForm />;
}
