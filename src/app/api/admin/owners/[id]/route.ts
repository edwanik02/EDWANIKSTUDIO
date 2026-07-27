import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const { id } = await params;
  const body = await getBody(req);
  const { canManageProducts, canManageOrders, canViewCustomers, canManageSettings, canUploadImages, canViewAnalytics, canEditLanding } = body;
  const owner = await db.owner.findUnique({ where: { id } });
  if (!owner) return err("Owner not found", 404);
  const perm = await db.ownerPermission.upsert({
    where: { ownerId: id },
    update: { canManageProducts, canManageOrders, canViewCustomers, canManageSettings, canUploadImages, canViewAnalytics, canEditLanding },
    create: { ownerId: id, canManageProducts: !!canManageProducts, canManageOrders: !!canManageOrders, canViewCustomers: !!canViewCustomers, canManageSettings: !!canManageSettings, canUploadImages: !!canUploadImages, canViewAnalytics: !!canViewAnalytics, canEditLanding: !!canEditLanding },
  });
  return ok({ permission: perm });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const { id } = await params;
  await db.owner.delete({ where: { id } });
  return ok({ message: "Owner removed" });
}
