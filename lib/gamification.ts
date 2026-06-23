export type Rank = {
  level: number;
  title: string;
  xpCurrent: number;
  xpToNextLevel: number;
  progress: number;
};

const RANK_THRESHOLDS: { level: number; minXp: number; title: string }[] = [
  { level: 1, minXp: 0, title: "New Contributor" },
  { level: 2, minXp: 100, title: "Active Contributor" },
  { level: 3, minXp: 500, title: "Senior Contributor" },
  { level: 4, minXp: 1_000, title: "Lexicographer" },
  { level: 5, minXp: 5_000, title: "Master Lexicographer" },
  { level: 6, minXp: 15_000, title: "Grand Lexicographer" },
];

export function computeRank(totalXp: number): Rank {
  const last = RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1]!;
  if (totalXp >= last.minXp) {
    return { level: last.level, title: last.title, xpCurrent: totalXp, xpToNextLevel: 0, progress: 1 };
  }

  let current = RANK_THRESHOLDS[0]!;
  for (const tier of RANK_THRESHOLDS) {
    if (totalXp >= tier.minXp) current = tier;
    else break;
  }

  const next = RANK_THRESHOLDS[RANK_THRESHOLDS.indexOf(current) + 1]!;
  const xpInLevel = totalXp - current.minXp;
  const xpRequired = next.minXp - current.minXp;

  return {
    level: current.level,
    title: current.title,
    xpCurrent: totalXp,
    xpToNextLevel: next.minXp - totalXp,
    progress: Math.min(1, xpInLevel / xpRequired),
  };
}

export const computeQuizXp = (score: number) => 2 + Math.floor(score * 8);
export const computeDrillXp = (accuracy: number) => 5 + Math.floor(accuracy * 10);
export const computeDialogueXp = (auditScore: number) => 10 + Math.floor(auditScore);

export const CONTRIBUTION_XP: Record<string, number> = {
  ADD_HEADWORD: 10,
  EDIT_DEFINITION: 5,
  ADD_EXAMPLE: 15,
  FIX_TYPO: 3,
  ADD_TAGALOG: 5,
  REVIEW_APPROVED: 10,
  HIGH_QUALITY_BONUS: 2,
};

const MS_PER_DAY = 86_400_000;
const MS_PER_MINUTE = 60_000;

const SRS_INTERVALS = [
  { threshold: 30, days: 1 },
  { threshold: 60, days: 3 },
  { threshold: 80, days: 7 },
  { threshold: 90, days: 14 },
  { threshold: Infinity, days: 30 },
];

export function updateSRS(
  currentProficiency: number,
  quality: number,
): { newProficiency: number; nextReview: Date } {
  if (quality < 3) {
    return {
      newProficiency: Math.max(0, currentProficiency - 20),
      nextReview: new Date(Date.now() + 10 * MS_PER_MINUTE),
    };
  }

  const { days } = SRS_INTERVALS.find((i) => currentProficiency < i.threshold)!;
  const bonus = quality === 5 ? 5 : quality === 4 ? 0 : -5;

  return {
    newProficiency: Math.min(100, currentProficiency + 10 + bonus),
    nextReview: new Date(Date.now() + days * MS_PER_DAY),
  };
}
