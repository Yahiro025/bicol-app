import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminAuthConfigured,
  isAdminRequest,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function GET(request: Request) {
  return NextResponse.json({
    authenticated: isAdminRequest(request),
    configured: isAdminAuthConfigured(),
  });
}

const COOKIE_BASE = {
  httpOnly: true as const,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isValidAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set({ name: ADMIN_SESSION_COOKIE, value: token, ...COOKIE_BASE, maxAge: 60 * 60 * 8 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({ name: ADMIN_SESSION_COOKIE, value: "", ...COOKIE_BASE, maxAge: 0 });
  return response;
}
