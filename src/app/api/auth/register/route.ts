import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, setSessionCookie, generateOTP, getSessionUser } from "@/lib/auth";
import { ok, err, getBody, logActivity } from "@/lib/api";

export async function POST(req: NextRequest) {
  console.log("[Auth Register] Processing registration request...", {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    nodeEnv: process.env.NODE_ENV,
  });

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

    // Step 1: Check existing user
    console.log("[Auth Register] Checking if user exists:", cleanEmail);
    const exists = await db.user.findUnique({ where: { email: cleanEmail } });
    if (exists) {
      return err("An account with this email already exists. Please log in.", 409);
    }

    // Step 2: Hash password & create user
    console.log("[Auth Register] Hashing password and creating user record...");
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
    console.log("[Auth Register] User created with ID:", user.id);

    // Step 3: Generate OTP
    const code = generateOTP();
    await db.oTPVerification.create({
      data: { email: user.email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), userId: user.id },
    });
    console.log(`[OTP] Verification code generated for ${user.email}`);

    // Step 4: Session creation & cookie set
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
    console.error("[Auth Register Error Full Details]:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
      rawError: error,
    });

    if (error?.code === "P2002") {
      return err("An account with this email already exists. Please log in.", 409);
    }

    if (error?.code === "P1001" || error?.code === "P1002") {
      return err("Database connection failed. Please check server connection configuration.", 500);
    }

    if (error?.code === "P2021" || error?.code === "P2022") {
      return err("Database schema issue encountered. Please ensure migrations are up to date.", 500);
    }

    return err("An unexpected server error occurred during registration. Please try again.", 500);
  }
}
