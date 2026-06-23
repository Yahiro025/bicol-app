'use client';

import ErrorPage from '@/components/ErrorPage';

export default function FlashcardsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      icon="📇"
      title="Unable to Load Flashcards"
      message="Something went wrong while loading the flashcard deck. This is usually temporary."
    />
  );
}
