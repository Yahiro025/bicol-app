"use client";

import ErrorPage from "@/components/ErrorPage";

export default function HomeError({
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
      title="Archive Connection Issue"
      message="We are having trouble connecting to the Bicol Dictionary archive. Please try again or return to the home page."
    />
  );
}
