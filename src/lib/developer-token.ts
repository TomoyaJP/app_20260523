import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "kad_dev_sess";

export function developerCookieName() {
  return COOKIE_NAME;
}

function jwtSecret(): Uint8Array | null {
  const s = process.env.DEVELOPER_JWT_SECRET ?? "";
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

export async function createDeveloperSessionToken(): Promise<string> {
  const secret = jwtSecret();
  if (!secret) {
    throw new Error("JWT secret unavailable");
  }
  return new SignJWT({ role: "developer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function isDeveloperSessionValid(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const secret = jwtSecret();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}
