import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/word-original?id=<original_id>&type=<normalized|legacy>
 *
 * Fetches the current data for a word so the admin can compare
 * it against a suggested edit submission.
 */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
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
          definitions: { orderBy: { createdAt: "asc" }, take: 1, include: { exampleSentences: { orderBy: { createdAt: "asc" }, take: 1 } } },
        },
      });

      if (!root) return NextResponse.json({ error: "Original word not found" }, { status: 404 });

      const def = root.definitions[0];
      const ex = def?.exampleSentences?.[0];

      return NextResponse.json({
        word: root.bikol, pos: root.pos, pronunciation: root.pronunciation,
        definition: def?.english ?? null, tagalog: def?.tagalog ?? null, dialect: def?.dialect ?? null,
        example_bikol: ex?.bikol ?? null, example_english: ex?.english ?? null, source: def?.source_url ?? null,
      });
    }

    const word = await prisma.word.findUnique({ where: { id: BigInt(originalId) } });
    if (!word) return NextResponse.json({ error: "Original word not found" }, { status: 404 });

    return NextResponse.json({
      word: word.bikol, pos: word.pos, pronunciation: word.pronunciation,
      definition: word.english, tagalog: word.tagalog ?? null, dialect: word.dialect,
      example_bikol: word.example_bikol, example_english: word.example_english, source: word.source_url,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
