import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const full = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, phone: true, avatarUrl: true, role: true, isVerified: true, createdAt: true },
  });
  return ok({ user: full });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const body = await getBody(req);
  const { name, phone, avatarUrl } = body;
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
  const updated = await db.user.update({ where: { id: user.id }, data, select: { id: true, email: true, name: true, phone: true, avatarUrl: true, role: true, isVerified: true } });
  return ok({ user: updated });
}
