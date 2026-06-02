import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeRank } from "@/lib/gamification";

/**
 * GET /api/profile/[id] — Public profile (limited info for anonymous users)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isAnonymous: true,
        totalXp: true,
        scholarXp: true,
        contributorXp: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
        _count: {
          select: {
            contributions: true,
            badges: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const rank = computeRank(profile.totalXp);

    // Respect anonymity: mask identifiable info
    const response = {
      ...profile,
      rank,
      username: profile.isAnonymous ? null : profile.username,
      displayName: profile.isAnonymous
        ? "Anonymous Lexicographer"
        : profile.displayName,
      avatarUrl: profile.isAnonymous ? null : profile.avatarUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
