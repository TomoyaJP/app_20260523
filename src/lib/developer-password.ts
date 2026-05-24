import bcryptjs from "bcryptjs";
import { createHash, timingSafeEqual } from "node:crypto";

/** Prefer `DEVELOPER_PASSWORD_BCRYPT`. Fallback plain `DEVELOPER_PASSWORD`. */
export function verifyDeveloperPassword(attempted: string): boolean {
  const envHash = process.env.DEVELOPER_PASSWORD_BCRYPT?.trim();
  if (envHash) {
    try {
      return bcryptjs.compareSync(attempted, envHash);
    } catch {
      return false;
    }
  }
  const expected = process.env.DEVELOPER_PASSWORD ?? "";
  if (!expected.length) return false;
  const a = saltedDigest(expected);
  const b = saltedDigest(attempted);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function saltedDigest(value: string) {
  return createHash("sha256").update(`${value}::kad-dev-login`, "utf8").digest();
}
