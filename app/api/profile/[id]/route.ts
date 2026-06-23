import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeRank } from "@/lib/gamification";

const PROFILE_SELECT = {
  id: true, username: true, displayName: true, avatarUrl: true, isAnonymous: true,
  totalXp: true, scholarXp: true, contributorXp: true, currentStreak: true, longestStreak: true,
  createdAt: true, _count: { select: { contributions: true, badges: true } },
} as const;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({ where: { id }, select: PROFILE_SELECT });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const { isAnonymous } = profile;
    return NextResponse.json({
      ...profile,
      rank: computeRank(profile.totalXp),
      username: isAnonymous ? null : profile.username,
      displayName: isAnonymous ? "Anonymous Lexicographer" : profile.displayName,
      avatarUrl: isAnonymous ? null : profile.avatarUrl,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
