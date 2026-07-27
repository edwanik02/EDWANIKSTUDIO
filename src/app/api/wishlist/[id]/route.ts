import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const { id } = await params;
  await db.wishlistItem.deleteMany({ where: { id, userId: user.id } });
  return ok({ message: "Removed from wishlist" });
}
