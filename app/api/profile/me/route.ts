import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { computeRank } from "@/lib/gamification";

/**
 * GET /api/profile/me — Full profile for the authenticated user
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: "desc" },
        },
        _count: {
          select: {
            contributions: true,
            badges: true,
            quizAttempts: true,
            drillSessions: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Sign in again or contact support." },
        { status: 404 },
      );
    }

    const rank = computeRank(profile.totalXp);

    return NextResponse.json({ ...profile, rank });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching own profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/profile/me — Update displayName, username, or isAnonymous
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { username, displayName, isAnonymous } = body;

    // Validate username (alphanumeric + underscore, 3-30 chars)
    if (username !== undefined) {
      if (typeof username !== "string" || username.length < 3 || username.length > 30) {
        return NextResponse.json(
          { error: "Username must be 3–30 characters" },
          { status: 400 },
        );
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          { error: "Username can only contain letters, numbers, and underscores" },
          { status: 400 },
        );
      }

      // Check uniqueness
      const existing = await prisma.profile.findUnique({
        where: { username },
        select: { id: true },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.profile.update({
      where: { id: user.id },
      data: {
        ...(username !== undefined && { username }),
        ...(displayName !== undefined && { displayName }),
        ...(isAnonymous !== undefined && { isAnonymous }),
      },
    });

    const rank = computeRank(updated.totalXp);

    return NextResponse.json({ ...updated, rank });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
