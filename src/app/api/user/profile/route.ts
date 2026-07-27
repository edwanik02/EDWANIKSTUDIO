import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return err("Unauthorized", 401);
    const full = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, phone: true, avatarUrl: true, role: true, isVerified: true, createdAt: true },
    });
    return ok({ user: full });
  } catch (error) {
    console.error("GET profile error:", error);
    return err("Failed to fetch profile", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return err("Unauthorized", 401);
    const body = await getBody(req);
    const { name, phone, avatarUrl } = body;
    const data: any = {};
    if (name !== undefined) data.name = String(name).trim();
    if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    const updated = await db.user.update({ where: { id: user.id }, data, select: { id: true, email: true, name: true, phone: true, avatarUrl: true, role: true, isVerified: true } });
    return ok({ user: updated });
  } catch (error) {
    console.error("PUT profile error:", error);
    return err("Failed to update profile", 500);
  }
}
