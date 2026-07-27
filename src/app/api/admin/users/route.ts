import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole, hashPassword, slugify } from "@/lib/auth";
import { ok, err, getBody, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const where: any = {};
  if (role) where.role = role;
  const users = await db.user.findMany({
    where,
    select: { id: true, email: true, name: true, role: true, isActive: true, isVerified: true, phone: true, avatarUrl: true, createdAt: true, owner: { select: { id: true, storeName: true, storeSlug: true, isApproved: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ users });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const body = await getBody(req);
  const { name, email, password, role, phone, storeName } = body;
  if (!name || !email || !password) return err("Name, email and password are required", 422);
  const exists = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (exists) return err("Email already in use", 409);
  const passwordHash = await hashPassword(password);

  const finalRole = role || "CUSTOMER";
  const newUser = await db.user.create({
    data: {
      name, email: String(email).toLowerCase(), passwordHash, phone: phone || null,
      role: finalRole, isVerified: true, isActive: true,
      ...(finalRole === "OWNER" && storeName
        ? { owner: { create: { storeName, storeSlug: slugify(storeName), isApproved: true, approvedAt: new Date(), approvedById: user!.id, permission: { create: {} }, storeSetting: { create: {} } } } }
        : finalRole === "CUSTOMER" ? { customer: { create: {} } } : {}),
    },
    include: { owner: true },
  });
  await logActivity(user!.id, "USER_CREATE", "user", newUser.id, { role: finalRole }, req.headers.get("x-forwarded-for") || undefined);
  return ok({ user: newUser });
}
