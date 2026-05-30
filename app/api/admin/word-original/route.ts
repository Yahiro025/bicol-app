import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET || "bikoldict-admin-secret-change-me";

/**
 * GET /api/admin/word-original?id=<original_id>&type=<normalized|legacy>
 *
 * Fetches the current data for a word so the admin can compare
 * it against a suggested edit submission.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("x-admin-secret");
  if (authHeader !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const originalId = searchParams.get("id");
  const originalType = searchParams.get("type");

  if (!originalId || !originalType) {
    return NextResponse.json(
      { error: "Missing id or type parameter" },
      { status: 400 },
    );
  }

  try {
    if (originalType === "normalized") {
      const root = await prisma.root.findUnique({
        where: { id: originalId },
        include: {
          definitions: {
            orderBy: { createdAt: "asc" },
            take: 1,
            include: {
              exampleSentences: { orderBy: { createdAt: "asc" }, take: 1 },
            },
          },
        },
      });

      if (!root) {
        return NextResponse.json({ error: "Original word not found" }, { status: 404 });
      }

      const firstDef = root.definitions[0] ?? null;
      const firstEx = firstDef?.exampleSentences?.[0] ?? null;

      return NextResponse.json({
        word: root.bikol,
        pos: root.pos,
        pronunciation: root.pronunciation,
        definition: firstDef?.english ?? null,
        dialect: firstDef?.dialect ?? null,
        example_bikol: firstEx?.bikol ?? null,
        example_english: firstEx?.english ?? null,
        source: firstDef?.source_url ?? null,
      });
    } else {
      // Legacy table
      const word = await prisma.word.findUnique({
        where: { id: BigInt(originalId) },
      });

      if (!word) {
        return NextResponse.json({ error: "Original word not found" }, { status: 404 });
      }

      return NextResponse.json({
        word: word.bikol,
        pos: word.pos,
        pronunciation: word.pronunciation,
        definition: word.english,
        dialect: word.dialect,
        example_bikol: word.example_bikol,
        example_english: word.example_english,
        source: word.source_url,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
