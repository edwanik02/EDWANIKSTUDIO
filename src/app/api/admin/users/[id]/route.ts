import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err, getBody, logActivity } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const { id } = await params;
  const body = await getBody(req);
  const { name, role, isActive, isVerified, phone } = body;
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role;
  if (isActive !== undefined) data.isActive = isActive;
  if (isVerified !== undefined) data.isVerified = isVerified;
  if (phone !== undefined) data.phone = phone;
  const updated = await db.user.update({ where: { id }, data, include: { owner: true } });
  await logActivity(user!.id, "USER_UPDATE", "user", id, data, req.headers.get("x-forwarded-for") || undefined);
  return ok({ user: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const { id } = await params;
  if (id === user!.id) return err("You cannot delete your own account", 422);
  await db.user.delete({ where: { id } });
  await logActivity(user!.id, "USER_DELETE", "user", id, undefined, req.headers.get("x-forwarded-for") || undefined);
  return ok({ message: "User deleted" });
}
