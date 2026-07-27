import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

// Forgot password: send OTP to email
export async function POST(req: NextRequest) {
  try {
    const body = await getBody(req);
    const { email } = body;
    if (!email) return err("Email is required", 422);

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await db.user.findUnique({ where: { email: cleanEmail } });
    if (!user) return err("No account found with that email", 404);

    const code = generateOTP();
    await db.oTPVerification.create({
      data: { email: user.email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), userId: user.id },
    });
    console.log(`[RESET OTP] for ${user.email}: ${code}`);
    return ok({ message: "Reset OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return err("An unexpected server error occurred. Please try again.", 500);
  }
}
