import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

// Reset password with OTP + new password
export async function POST(req: NextRequest) {
  const body = await getBody(req);
  const { email, code, password } = body;
  if (!email || !code || !password) return err("Email, OTP and new password are required", 422);
  if (password.length < 6) return err("Password must be at least 6 characters", 422);

  const user = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (!user) return err("No account found", 404);

  const record = await db.oTPVerification.findFirst({
    where: { email: user.email, code: String(code), used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return err("Invalid or expired OTP", 400);

  const passwordHash = await hashPassword(password);
  await db.$transaction([
    db.oTPVerification.update({ where: { id: record.id }, data: { used: true } }),
    db.user.update({ where: { id: user.id }, data: { passwordHash } }),
  ]);
  return ok({ message: "Password reset successfully. Please login." });
}
