import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole, hashPassword, slugify } from "@/lib/auth";
import { ok, err, getBody, logActivity } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const { id } = await params;
  const body = await getBody(req);
  const { status, reviewNote, createAccount } = body;
  const request = await db.ownerRequest.findUnique({ where: { id } });
  if (!request) return err("Request not found", 404);

  await db.ownerRequest.update({ where: { id }, data: { status, reviewNote: reviewNote || null, reviewedById: user!.id } });

  let newOwner = null;
  if (status === "APPROVED" && createAccount) {
    const tempPass = Math.random().toString(36).slice(2, 10);
    const passwordHash = await hashPassword(tempPass);
    const existing = await db.user.findUnique({ where: { email: request.email } });
    if (!existing) {
      const newUser = await db.user.create({
        data: {
          email: request.email, name: request.name, passwordHash, role: "OWNER", isVerified: true, isActive: true, phone: request.phone,
          owner: {
            create: {
              storeName: request.shopName, storeSlug: slugify(request.shopName), isApproved: true, approvedAt: new Date(), approvedById: user!.id,
              permission: { create: { canManageProducts: true, canManageOrders: true, canViewCustomers: true, canManageSettings: true, canUploadImages: true, canViewAnalytics: true } },
              storeSetting: { create: {} },
            },
          },
        },
        include: { owner: true },
      });
      newOwner = { email: newUser.email, password: tempPass, name: newUser.name };
      console.log(`[OWNER ACCOUNT CREATED] ${newUser.email} / ${tempPass}`);
    }
    await logActivity(user!.id, "OWNER_APPROVE", "ownerRequest", id, { email: request.email }, req.headers.get("x-forwarded-for") || undefined);
  }

  return ok({ message: "Request updated", credentials: newOwner });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const { id } = await params;
  await db.ownerRequest.delete({ where: { id } });
  return ok({ message: "Request deleted" });
}
