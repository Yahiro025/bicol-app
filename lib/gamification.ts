/**
 * Core gamification engine — pure functions for rank computation, XP scoring, and SRS.
 * These are side-effect-free; database writes happen in API routes.
 */

// ─── Rank Computation ──────────────────────────────────────────────────────

export type Rank = {
  level: number;
  title: string;
  xpCurrent: number;
  xpToNextLevel: number;
  progress: number; // 0.0 – 1.0 fraction toward next level
};

const RANK_THRESHOLDS: { level: number; minXp: number; title: string }[] = [
  { level: 1, minXp: 0, title: "New Contributor" },
  { level: 2, minXp: 100, title: "Active Contributor" },
  { level: 3, minXp: 500, title: "Senior Contributor" },
  { level: 4, minXp: 1_000, title: "Lexicographer" },
  { level: 5, minXp: 5_000, title: "Master Lexicographer" },
  { level: 6, minXp: 15_000, title: "Grand Lexicographer" },
];

/** Compute the rank data for a given total XP */
export function computeRank(totalXp: number): Rank {
  let current = RANK_THRESHOLDS[0]!;
  let next = RANK_THRESHOLDS[1]!;

  for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
    const tier = RANK_THRESHOLDS[i]!;
    if (totalXp >= tier.minXp) {
      current = tier;
      next = RANK_THRESHOLDS[i + 1]!;
    }
  }

  // Edge case: max rank reached
  if (!next) {
    return {
      level: current.level,
      title: current.title,
      xpCurrent: totalXp,
      xpToNextLevel: 0,
      progress: 1.0,
    };
  }

  const xpInCurrentLevel = totalXp - current.minXp;
  const xpRequiredForNext = next.minXp - current.minXp;

  return {
    level: current.level,
    title: current.title,
    xpCurrent: totalXp,
    xpToNextLevel: next.minXp - totalXp,
    progress: Math.min(1, xpInCurrentLevel / xpRequiredForNext),
  };
}

// ─── XP Scoring ────────────────────────────────────────────────────────────

/** Calculate quiz XP: 2 base + up to 8 bonus based on score */
export function computeQuizXp(score: number): number {
  return 2 + Math.floor(score * 8);
}

/** Calculate drill phase XP: 5 base + up to 10 bonus based on accuracy */
export function computeDrillXp(accuracy: number): number {
  return 5 + Math.floor(accuracy * 10);
}

/** Calculate dialogue XP: 10 base + up to 10 bonus based on audit score / 10 */
export function computeDialogueXp(auditScore: number): number {
  return 10 + Math.floor((auditScore / 10) * 10);
}

// ─── Contribution XP Table ─────────────────────────────────────────────────

export const CONTRIBUTION_XP: Record<string, number> = {
  ADD_HEADWORD: 10,
  EDIT_DEFINITION: 5,
  ADD_EXAMPLE: 15,
  FIX_TYPO: 3,
  ADD_TAGALOG: 5,
  REVIEW_APPROVED: 10,
  HIGH_QUALITY_BONUS: 2,
};

// ─── Spaced Repetition (SM-2) ──────────────────────────────────────────────

export function updateSRS(
  currentProficiency: number,
  quality: number, // 0–5, how well user recalled
): { newProficiency: number; nextReview: Date } {
  if (quality < 3) {
    // Failed recall — reset
    return {
      newProficiency: Math.max(0, currentProficiency - 20),
      nextReview: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    };
  }

  const interval =
    currentProficiency < 30
      ? 1
      : currentProficiency < 60
        ? 3
        : currentProficiency < 80
          ? 7
          : currentProficiency < 90
            ? 14
            : 30;

  const bonus = quality === 5 ? 5 : quality === 4 ? 0 : -5;

  return {
    newProficiency: Math.min(100, currentProficiency + 10 + bonus),
    nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
  };
}
