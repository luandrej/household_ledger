import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export type Person = "LU" | "WIFE";

export interface SessionPayload {
  person: Person;
  displayName: string;
}

const COOKIE_NAME = "budget_session";
const SESSION_DURATION = "30d";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is not set (or too short). Set a long random string in your environment."
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Two accounts only, configured entirely through environment variables:
 *   LU_USERNAME / LU_PASSWORD_HASH
 *   WIFE_USERNAME / WIFE_PASSWORD_HASH
 * Password hashes are bcrypt hashes — generate one with `npm run hash-password -- "yourpassword"`.
 */
function getAccounts() {
  return [
    {
      person: "LU" as Person,
      displayName: "Lu",
      username: process.env.LU_USERNAME || "",
      passwordHash: process.env.LU_PASSWORD_HASH || "",
    },
    {
      person: "WIFE" as Person,
      displayName: process.env.WIFE_DISPLAY_NAME || "Wife",
      username: process.env.WIFE_USERNAME || "",
      passwordHash: process.env.WIFE_PASSWORD_HASH || "",
    },
  ];
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<SessionPayload | null> {
  const accounts = getAccounts();
  const account = accounts.find(
    (a) => a.username && a.username.toLowerCase() === username.toLowerCase()
  );
  if (!account || !account.passwordHash) return null;

  const valid = await bcrypt.compare(password, account.passwordHash);
  if (!valid) return null;

  return { person: account.person, displayName: account.displayName };
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { person: payload.person as Person, displayName: payload.displayName as string };
  } catch {
    return null;
  }
}

export function otherPerson(person: Person): Person {
  return person === "LU" ? "WIFE" : "LU";
}
