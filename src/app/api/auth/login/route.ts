import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie, getSessionUser } from "@/lib/auth";
import { ok, err, getBody, logActivity } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await getBody(req);
  const { email, password } = body;
  if (!email || !password) return err("Email and password are required", 422);

  const user = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (!user) return err("Invalid email or password", 401);
  if (!user.isActive) return err("Account is disabled. Contact support.", 403);

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return err("Invalid email or password", 401);

  const { token, expiresAt } = await createSession(user.id, req);
  await setSessionCookie(token, expiresAt);
  await logActivity(user.id, "LOGIN", "user", user.id, undefined, req.headers.get("x-forwarded-for") || undefined);

  return ok({
    user: {
      id: user.id, email: user.email, name: user.name, role: user.role,
      avatarUrl: user.avatarUrl, isVerified: user.isVerified,
    },
  });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return ok({ user: null });
  return ok({ user });
}
