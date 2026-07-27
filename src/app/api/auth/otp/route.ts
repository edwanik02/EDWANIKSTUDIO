import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateOTP, getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await getBody(req);
  const { email } = body;
  if (!email) return err("Email is required", 422);

  const user = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (!user) return err("No account found with that email", 404);

  const code = generateOTP();
  await db.oTPVerification.create({
    data: { email: user.email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), userId: user.id },
  });
  console.log(`[OTP] New verification code for ${user.email}: ${code}`);
  return ok({ message: "OTP sent to your email" });
}

export async function PUT(req: NextRequest) {
  const body = await getBody(req);
  const { code } = body;
  if (!code) return err("OTP code is required", 422);

  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);

  const record = await db.oTPVerification.findFirst({
    where: { email: user.email, code: String(code), used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return err("Invalid or expired OTP", 400);

  await db.$transaction([
    db.oTPVerification.update({ where: { id: record.id }, data: { used: true } }),
    db.user.update({ where: { id: user.id }, data: { isVerified: true } }),
  ]);
  return ok({ message: "Email verified successfully", user: { ...user, isVerified: true } });
}
