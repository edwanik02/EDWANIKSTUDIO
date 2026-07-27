import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return ok({ items: [] });
  const items = await db.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Please login to save wishlist", 401);
  const body = await getBody(req);
  const { productId } = body;
  if (!productId) return err("Product ID required", 422);
  const existing = await db.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
  if (!existing) {
    await db.wishlistItem.create({ data: { userId: user.id, productId } });
  }
  return ok({ message: "Added to wishlist" });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const { id } = await params;
  await db.wishlistItem.deleteMany({ where: { id, userId: user.id } });
  return ok({ message: "Removed from wishlist" });
}
