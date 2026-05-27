"use client";

import ErrorPage from "@/components/ErrorPage";

export default function BrowseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title="Browse Unavailable"
      message="We couldn't load the dictionary browse page. This might be a temporary issue."
    />
  );
}
