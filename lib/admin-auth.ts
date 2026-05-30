import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "bikoldict_admin_session";

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password && password.length >= 12 ? password : null;
}

function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getAdminPassword() && getSessionSecret());
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function isValidAdminPassword(password: string): boolean {
  const configuredPassword = getAdminPassword();
  if (!configuredPassword) return false;
  return constantTimeEqual(password, configuredPassword);
}

export function createAdminSessionToken(): string | null {
  const password = getAdminPassword();
  const secret = getSessionSecret();
  if (!password || !secret) return null;

  return createHmac("sha256", secret)
    .update(`admin-session:${password}`)
    .digest("hex");
}

export function isAdminRequest(request: Request): boolean {
  const expectedToken = createAdminSessionToken();
  if (!expectedToken) return false;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`)
  );
  const token = sessionCookie?.slice(ADMIN_SESSION_COOKIE.length + 1);

  return Boolean(token && constantTimeEqual(token, expectedToken));
}
