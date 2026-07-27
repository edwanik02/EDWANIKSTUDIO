import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  const { user, error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const owners = await db.owner.findMany({
    include: {
      user: { select: { id: true, email: true, name: true, phone: true, isActive: true, isVerified: true, createdAt: true } },
      permission: true,
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok({ owners });
}

export async function POST(req: NextRequest) {
  // Approve/toggle owner
  const { user, error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const body = await getBody(req);
  const { id, isApproved } = body;
  const owner = await db.owner.update({
    where: { id },
    data: { isApproved: isApproved !== undefined ? isApproved : undefined, approvedAt: isApproved ? new Date() : null, approvedById: user!.id },
  });
  return ok({ owner });
}
