import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET || "bikoldict-admin-secret-change-me";

function requireAuth(request: Request): string | null {
  const authHeader = request.headers.get("x-admin-secret");
  if (authHeader === ADMIN_SECRET) return null;
  return "Unauthorized";
}

// ─── GET: List submissions ───────────────────────────────────────────────────
export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

    const where = status && status !== "all" ? { status } : {};

    const submissions = await prisma.userSubmission.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return NextResponse.json(submissions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PATCH: Approve, reject, or edit a submission ────────────────────────────
export async function PATCH(request: Request) {
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, targetTable, admin_notes: adminNotes, ...editableFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing submission id" }, { status: 400 });
    }

    // ── Editing: update fields without changing status ──
    if (!status && Object.keys(editableFields).length > 0) {
      const allowedFields = [
        "word",
        "definition",
        "pos",
        "dialect",
        "pronunciation",
        "example_bikol",
        "example_english",
        "source",
        "admin_notes",
      ];
      const updates: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (field in editableFields) {
          updates[field] = editableFields[field];
        }
      }
      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
      }

      const submission = await prisma.userSubmission.update({
        where: { id },
        data: updates,
      });

      return NextResponse.json({ success: true, data: submission });
    }

    // ── Status update (approve/reject) ──
    if (status && !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const target = targetTable || "legacy";

    // Create the word entry BEFORE updating status to prevent orphaned approved submissions
    if (status === "approved") {
      // Fetch the full submission first (it may have been edited since loaded)
      const fullSubmission = await prisma.userSubmission.findUnique({
        where: { id },
      });
      if (!fullSubmission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      if (target === "normalized") {
        // Create in the normalized Root + Definition schema
        const root = await prisma.root.create({
          data: {
            bikol: fullSubmission.word,
            pos: fullSubmission.pos || null,
            pronunciation: fullSubmission.pronunciation || null,
          },
        });

        const definition = await prisma.definition.create({
          data: {
            rootId: root.id,
            english: fullSubmission.definition,
            dialect: fullSubmission.dialect || null,
            source: "user_submission",
            source_url: fullSubmission.source || null,
          },
        });

        if (fullSubmission.example_bikol || fullSubmission.example_english) {
          await prisma.exampleSentence.create({
            data: {
              definitionId: definition.id,
              bikol: fullSubmission.example_bikol || null,
              english: fullSubmission.example_english || null,
            },
          });
        }
      } else {
        // Legacy Word table
        await prisma.word.create({
          data: {
            bikol: fullSubmission.word,
            english: fullSubmission.definition,
            pos: fullSubmission.pos || null,
            dialect: fullSubmission.dialect || null,
            pronunciation: fullSubmission.pronunciation || null,
            example_bikol: fullSubmission.example_bikol || null,
            example_english: fullSubmission.example_english || null,
            source_url: fullSubmission.source || null,
          },
        });
      }
    }

    // Now update the submission status
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
    updateData.target_table = target;

    const submission = await prisma.userSubmission.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: submission });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST: Create a new submission ──────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      word,
      definition,
      pos,
      dialect,
      pronunciation,
      example_bikol,
      example_english,
      source,
    } = body;

    if (!word || !word.trim()) {
      return NextResponse.json({ error: "Bikol word is required" }, { status: 400 });
    }
    if (!definition || !definition.trim()) {
      return NextResponse.json({ error: "Definition is required" }, { status: 400 });
    }

    const data = await prisma.userSubmission.create({
      data: {
        word: word.trim(),
        definition: definition.trim(),
        pos: pos || null,
        dialect: dialect || null,
        pronunciation: pronunciation || null,
        example_bikol: example_bikol || null,
        example_english: example_english || null,
        source: source || null,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
