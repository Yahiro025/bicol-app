import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "bikoldict_admin_session";

const getAdminPassword = (): string | null => {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length >= 12 ? p : null;
};

const getSessionSecret = (): string | null => {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
};

export const isAdminAuthConfigured = (): boolean =>
  Boolean(getAdminPassword() && getSessionSecret());

const constantTimeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

export const isValidAdminPassword = (password: string): boolean => {
  const configured = getAdminPassword();
  return configured ? constantTimeEqual(password, configured) : false;
};

export const createAdminSessionToken = (): string | null => {
  const password = getAdminPassword();
  const secret = getSessionSecret();
  if (!password || !secret) return null;
  return createHmac("sha256", secret)
    .update(`admin-session:${password}`)
    .digest("hex");
};

export const isAdminRequest = (request: Request): boolean => {
  const expected = createAdminSessionToken();
  if (!expected) return false;
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const token = match?.slice(ADMIN_SESSION_COOKIE.length + 1);
  return Boolean(token && constantTimeEqual(token, expected));
};
