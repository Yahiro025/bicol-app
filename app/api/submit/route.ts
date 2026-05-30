import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-auth";

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .nullable()
  .optional()
  .transform((value) => (value === undefined ? undefined : value || null));

const publicSubmissionSchema = z.object({
  word: z.string().trim().min(1).max(200),
  definition: z.string().trim().min(1).max(4000),
  pos: optionalText,
  dialect: optionalText,
  pronunciation: optionalText,
  example_bikol: optionalText,
  example_english: optionalText,
  source: optionalText,
  original_id: optionalText,
  original_type: z.enum(["normalized", "legacy"]).nullable().optional(),
});

const patchSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["approved", "rejected", "pending"]).optional(),
  targetTable: z.enum(["legacy", "normalized"]).optional(),
  admin_notes: optionalText,
  word: z.string().trim().min(1).max(200).optional(),
  definition: z.string().trim().min(1).max(4000).optional(),
  pos: optionalText,
  dialect: optionalText,
  pronunciation: optionalText,
  example_bikol: optionalText,
  example_english: optionalText,
  source: optionalText,
});

class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function badRequest(error: z.ZodError) {
  return NextResponse.json(
    { error: "Invalid request", details: z.treeifyError(error) },
    { status: 400 },
  );
}

function requireAdmin(request: Request): NextResponse | null {
  if (isAdminRequest(request)) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function editableUpdates(data: z.infer<typeof patchSchema>) {
  const updates: Record<string, string | null> = {};
  const fields = [
    "word",
    "definition",
    "pos",
    "dialect",
    "pronunciation",
    "example_bikol",
    "example_english",
    "source",
    "admin_notes",
  ] as const;

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates[field] = data[field] ?? null;
    }
  }

  return updates;
}

async function applyApprovedSubmission(
  tx: Prisma.TransactionClient,
  submission: NonNullable<
    Awaited<ReturnType<typeof prisma.userSubmission.findUnique>>
  >,
  target: "legacy" | "normalized",
) {
  if (submission.original_id && submission.original_type) {
    if (submission.original_type === "normalized") {
      await tx.root.update({
        where: { id: submission.original_id },
        data: {
          bikol: submission.word,
          pos: submission.pos || null,
          pronunciation: submission.pronunciation || null,
        },
      });

      const firstDef = await tx.definition.findFirst({
        where: { rootId: submission.original_id },
        orderBy: { createdAt: "asc" },
      });

      const definition =
        firstDef ??
        (await tx.definition.create({
          data: {
            rootId: submission.original_id,
            source: "user_submission",
          },
        }));

      await tx.definition.update({
        where: { id: definition.id },
        data: {
          english: submission.definition,
          dialect: submission.dialect || null,
          source_url: submission.source || null,
        },
      });

      if (submission.example_bikol || submission.example_english) {
        const firstExample = await tx.exampleSentence.findFirst({
          where: { definitionId: definition.id },
          orderBy: { createdAt: "asc" },
        });

        if (firstExample) {
          await tx.exampleSentence.update({
            where: { id: firstExample.id },
            data: {
              bikol: submission.example_bikol || null,
              english: submission.example_english || null,
            },
          });
        } else {
          await tx.exampleSentence.create({
            data: {
              definitionId: definition.id,
              bikol: submission.example_bikol || null,
              english: submission.example_english || null,
            },
          });
        }
      }
      return;
    }

    const legacyId = Number.parseInt(submission.original_id, 10);
    if (!Number.isSafeInteger(legacyId)) {
      throw new HttpError("Invalid legacy original id", 400);
    }

    await tx.word.update({
      where: { id: BigInt(legacyId) },
      data: {
        bikol: submission.word,
        english: submission.definition,
        pos: submission.pos || null,
        dialect: submission.dialect || null,
        pronunciation: submission.pronunciation || null,
        example_bikol: submission.example_bikol || null,
        example_english: submission.example_english || null,
        source_url: submission.source || null,
      },
    });
    return;
  }

  if (target === "normalized") {
    const existingRoot = await tx.root.findFirst({
      where: { bikol: { equals: submission.word, mode: "insensitive" } },
    });

    const root =
      existingRoot ??
      (await tx.root.create({
        data: {
          bikol: submission.word,
          pos: submission.pos || null,
          pronunciation: submission.pronunciation || null,
        },
      }));

    const definition = await tx.definition.create({
      data: {
        rootId: root.id,
        english: submission.definition,
        dialect: submission.dialect || null,
        source: "user_submission",
        source_url: submission.source || null,
      },
    });

    if (submission.example_bikol || submission.example_english) {
      await tx.exampleSentence.create({
        data: {
          definitionId: definition.id,
          bikol: submission.example_bikol || null,
          english: submission.example_english || null,
        },
      });
    }
    return;
  }

  await tx.word.upsert({
    where: { bikol: submission.word },
    create: {
      bikol: submission.word,
      english: submission.definition,
      pos: submission.pos || null,
      dialect: submission.dialect || null,
      pronunciation: submission.pronunciation || null,
      example_bikol: submission.example_bikol || null,
      example_english: submission.example_english || null,
      source_url: submission.source || null,
    },
    update: {
      english: submission.definition,
      pos: submission.pos || null,
      dialect: submission.dialect || null,
      pronunciation: submission.pronunciation || null,
      example_bikol: submission.example_bikol || null,
      example_english: submission.example_english || null,
      source_url: submission.source || null,
    },
  });
}

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

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

export async function PATCH(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error);

  try {
    const { id, status, targetTable, admin_notes: adminNotes } = parsed.data;
    const updates = editableUpdates(parsed.data);

    if (!status && Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No editable fields provided" },
        { status: 400 },
      );
    }

    if (!status) {
      const submission = await prisma.userSubmission.update({
        where: { id },
        data: updates,
      });

      return NextResponse.json({ success: true, data: submission });
    }

    const submission = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${id})`;

      const fullSubmission = await tx.userSubmission.findUnique({
        where: { id },
      });
      if (!fullSubmission) {
        throw new HttpError("Submission not found", 404);
      }

      if (fullSubmission.status === status) {
        return fullSubmission;
      }

      if (fullSubmission.status !== "pending") {
        throw new HttpError(
          `Cannot change a ${fullSubmission.status ?? "non-pending"} submission`,
          409,
        );
      }

      const target = targetTable || fullSubmission.target_table || "legacy";
      if (target !== "legacy" && target !== "normalized") {
        throw new HttpError("Invalid target table", 400);
      }

      if (status === "approved") {
        await applyApprovedSubmission(tx, fullSubmission, target);
      }

      const updateData: Record<string, unknown> = {
        status,
        target_table: target,
      };
      if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

      return tx.userSubmission.update({
        where: { id },
        data: updateData,
      });
    });

    return NextResponse.json({ success: true, data: submission });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const parsed = publicSubmissionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return badRequest(parsed.error);

  try {
    const data = await prisma.userSubmission.create({
      data: {
        word: parsed.data.word,
        definition: parsed.data.definition,
        pos: parsed.data.pos,
        dialect: parsed.data.dialect,
        pronunciation: parsed.data.pronunciation,
        example_bikol: parsed.data.example_bikol,
        example_english: parsed.data.example_english,
        source: parsed.data.source,
        original_id: parsed.data.original_id,
        original_type: parsed.data.original_type ?? null,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
