import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return ok({ items: [] });
  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Please login to add items to cart", 401);
  const body = await getBody(req);
  const { productId, quantity } = body;
  if (!productId) return err("Product ID required", 422);
  const qty = Math.max(parseInt(quantity || "1"), 1);

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return err("Product unavailable", 404);

  const existing = await db.cartItem.findFirst({ where: { userId: user.id, productId } });
  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + qty } });
  } else {
    await db.cartItem.create({ data: { userId: user.id, productId, quantity: qty } });
  }
  return ok({ message: "Added to cart" });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const body = await getBody(req);
  const { id, quantity } = body;
  if (!id) return err("Cart item id required", 422);
  const qty = parseInt(quantity);
  if (qty <= 0) {
    await db.cartItem.deleteMany({ where: { id, userId: user.id } });
    return ok({ message: "Removed from cart" });
  }
  await db.cartItem.updateMany({ where: { id, userId: user.id }, data: { quantity: qty } });
  return ok({ message: "Cart updated" });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    await db.cartItem.deleteMany({ where: { id, userId: user.id } });
  } else {
    await db.cartItem.deleteMany({ where: { userId: user.id } });
  }
  return ok({ message: "Cart cleared" });
}
