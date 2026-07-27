import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./db";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "funzitoys-dev-secret-change-in-production-9k2m";
const SESSION_COOKIE = "ft_session";
const SESSION_DAYS = 7;

export type Role = "SUPER_ADMIN" | "ADMIN" | "OWNER" | "CUSTOMER";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
  isVerified: boolean;
  ownerId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password provided for hashing");
  }
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash || typeof password !== "string" || typeof hash !== "string") {
    return false;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Error verifying password hash:", error);
    return false;
  }
}

export function createToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, req?: NextRequest) {
  const token = createToken(userId);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const ipAddress = req?.headers.get("x-forwarded-for") || null;
  const userAgent = req?.headers.get("user-agent") || null;
  await db.session.create({
    data: { userId, token, expiresAt, ipAddress, userAgent },
  });
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  try {
    await db.session.deleteMany({ where: { token } });
  } catch {
    // ignore
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    const session = await db.session.findUnique({
      where: { token },
      include: { user: { include: { owner: true } } },
    });
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        try {
          await db.session.delete({ where: { id: session.id } });
        } catch {
          // ignore session delete error
        }
      }
      return null;
    }
    const u = session.user;
    if (!u.isActive) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as Role,
      avatarUrl: u.avatarUrl,
      isVerified: u.isVerified,
      ownerId: u.owner?.id ?? null,
    };
  } catch (error) {
    console.error("Error fetching session user:", error);
    return null;
  }
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function requireRole(...roles: Role[]) {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: { status: 401, message: "Unauthorized" } };
  }
  if (!roles.includes(user.role)) {
    return { user, error: { status: 403, message: "Forbidden" } };
  }
  return { user, error: null };
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: { status: 401, message: "Unauthorized" } as const };
  }
  return { user, error: null };
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FT${ts}${rand}`;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
