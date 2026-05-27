"use client";

import ErrorPage from "@/components/ErrorPage";

export default function WordError({
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
      icon="📖"
      title="Word Not Available"
      message="We couldn't load this word entry. It may have been removed or there may be a temporary issue."
      homeHref="/browse"
      homeLabel="Browse Dictionary"
    />
  );
}
