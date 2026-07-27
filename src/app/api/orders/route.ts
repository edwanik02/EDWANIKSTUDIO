import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, requireRole, generateOrderNumber } from "@/lib/auth";
import { ok, err, getBody, trackEvent, logActivity } from "@/lib/api";

// Create order
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Please login to place an order", 401);

  const body = await getBody(req);
  const { items, addressId, paymentMethod, notes } = body;
  if (!items || !Array.isArray(items) || items.length === 0) return err("Cart is empty", 422);

  // Build order items from cart/products
  const orderItems = [];
  let subtotal = 0;
  for (const it of items) {
    const product = await db.product.findUnique({ where: { id: it.productId } });
    if (!product || !product.isActive) return err(`Product unavailable`, 422);
    if (product.stock < it.quantity) return err(`Insufficient stock for ${product.name}`, 422);
    const lineTotal = product.price * it.quantity;
    subtotal += lineTotal;
    orderItems.push({
      productId: product.id,
      productName: product.name,
      productImage: (await db.productImage.findFirst({ where: { productId: product.id, isPrimary: true } }))?.url || null,
      price: product.price,
      quantity: it.quantity,
      total: lineTotal,
    });
  }

  const shippingFee = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shippingFee;
  const orderNumber = generateOrderNumber();

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: user.id,
      addressId: addressId || null,
      subtotal,
      shippingFee,
      total,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: paymentMethod || "COD",
      notes: notes || null,
      items: { create: orderItems },
      history: { create: { status: "PENDING", note: "Order placed" } },
    },
    include: { items: true },
  });

  // Decrement stock
  for (const it of orderItems) {
    await db.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } });
  }
  // Clear cart
  await db.cartItem.deleteMany({ where: { userId: user.id } });

  await trackEvent("ORDER_PLACE", user.id, undefined, order.id, { total });
  await logActivity(user.id, "ORDER_PLACE", "order", order.id, { orderNumber }, req.headers.get("x-forwarded-for") || undefined);

  return ok({ order });
}

// List orders (admin/owner see all relevant; customer sees own)
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let where: any = {};
  if (user.role === "CUSTOMER") {
    where.userId = user.id;
  } else if (user.role === "OWNER") {
    where.items = { some: { product: { ownerId: user.ownerId } } };
  }
  if (status) where.status = status;

  const orders = await db.order.findMany({
    where,
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return ok({ orders });
}
