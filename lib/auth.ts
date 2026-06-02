import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "studyflow_super_secret_key_change_me_in_prod";

/**
  Hashes a plain text password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
  Compares a plain text password against a hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
  Signs a JWT session token.
 */
export function signToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
  Verifies a JWT session token.
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

/**
  Gets the current logged in user session from Next.js server cookie.
 */
export async function getSessionUser(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("studyflow_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}
