import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * Supabase Auth callback route.
 * Handles the code exchange for magic link and email confirmation flows.
 * GET /auth/callback?code=...
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to home with error
  return NextResponse.redirect(`${origin}/?auth_error=invalid_code`);
}
