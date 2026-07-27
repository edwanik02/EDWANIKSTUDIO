import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, setSessionCookie, generateOTP, getSessionUser } from "@/lib/auth";
import { ok, err, getBody, logActivity } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await getBody(req);
  const { email, password, name, phone } = body;
  if (!email || !password || !name) return err("Name, email and password are required", 422);
  if (password.length < 6) return err("Password must be at least 6 characters", 422);

  const exists = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (exists) return err("Email already registered. Please login.", 409);

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email: String(email).toLowerCase(),
      name,
      passwordHash,
      phone: phone || null,
      role: "CUSTOMER",
      isVerified: false,
      customer: { create: {} },
    },
  });

  // Generate OTP
  const code = generateOTP();
  await db.oTPVerification.create({
    data: { email: user.email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), userId: user.id },
  });
  console.log(`[OTP] Verification code for ${user.email}: ${code}`);

  // Auto-login (unverified)
  const { token, expiresAt } = await createSession(user.id, req);
  await setSessionCookie(token, expiresAt);
  await logActivity(user.id, "REGISTER", "user", user.id, undefined, req.headers.get("x-forwarded-for") || undefined);

  return ok({
    user: {
      id: user.id, email: user.email, name: user.name, role: user.role,
      isVerified: user.isVerified,
    },
    message: "Account created. Please verify your email with the OTP sent.",
  });
}
