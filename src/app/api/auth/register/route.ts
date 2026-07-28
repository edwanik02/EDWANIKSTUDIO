import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, setSessionCookie, generateOTP, getSessionUser } from "@/lib/auth";
import { ok, err, getBody, logActivity } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await getBody(req);
    const { email, password, name, phone } = body;
    if (!email || !password || !name) return err("Name, email and password are required", 422);

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);
    const cleanName = String(name).trim();
    const cleanPhone = phone ? String(phone).trim() : null;

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return err("Please provide a valid email address", 422);
    }

    if (cleanPassword.length < 6) {
      return err("Password must be at least 6 characters long", 422);
    }

    const exists = await db.user.findUnique({ where: { email: cleanEmail } });
    if (exists) {
      return err("An account with this email already exists. Please log in.", 409);
    }

    const passwordHash = await hashPassword(cleanPassword);
    const user = await db.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        phone: cleanPhone,
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
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      message: "Account created successfully. Please verify your email with the OTP sent.",
    });
  } catch (error: any) {
    console.error("Register API exception:", error);
    if (error?.code === "P2002") {
      return err("An account with this email already exists. Please log in.", 409);
    }
    return err("An unexpected server error occurred during registration. Please try again.", 500);
  }
}
