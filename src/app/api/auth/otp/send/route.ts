import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateOTP, getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await getBody(req);
    const { email } = body;
    const sessionUser = await getSessionUser();
    const targetEmail = email || sessionUser?.email;
    if (!targetEmail) return err("Email is required", 422);

    const cleanEmail = String(targetEmail).trim().toLowerCase();
    const user = await db.user.findUnique({ where: { email: cleanEmail } });
    if (!user) return err("No account found", 404);

    const code = generateOTP();
    await db.oTPVerification.create({
      data: { email: user.email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), userId: user.id },
    });
    console.log(`[OTP] Resend code for ${user.email}: ${code}`);
    return ok({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return err("Failed to send OTP", 500);
  }
}
