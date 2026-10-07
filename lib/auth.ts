import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "nw_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  code: string;
  name: string;
  email: string;
  role: Role;
  specialization: string;
  skills: string;
};

export type SessionPayload = {
  uid: string;
  role: Role;
  name: string;
};

/** Thrown by requireUser/requireAdmin so routes can map it to a status code. */
export class AuthError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or shorter than 32 characters. Add it to .env (see .env.example).",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign a session JWT and store it in the httpOnly `nw_session` cookie. */
export async function createSession(user: {
  id: string;
  role: Role;
  name: string;
}): Promise<void> {
  const token = await new SignJWT({
    uid: user.id,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Read and verify the session cookie. Returns null when absent or invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.uid !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return {
      uid: payload.uid,
      role: payload.role as Role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Always re-read the user from the database so role/permission changes are
 * picked up immediately. Never selects passwordHash.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.uid },
    select: {
      id: true,
      code: true,
      name: true,
      email: true,
      role: true,
      specialization: true,
      skills: true,
    },
  });
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "You must be signed in.");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new AuthError(403, "Administrator access is required.");
  }
  return user;
}

/** Verify an email/password pair. Returns the full user row, or null. */
export async function verifyLogin(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return {
    id: user.id,
    code: user.code,
    name: user.name,
    email: user.email,
    role: user.role,
    specialization: user.specialization,
    skills: user.skills,
  };
}
