import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "OWNER") return err("Forbidden", 403);
  const owner = await db.owner.findUnique({ where: { userId: user.id } });
  if (!owner) return err("Owner not found", 404);

  // Customers who ordered owner's products
  const orders = await db.order.findMany({
    where: { items: { some: { product: { ownerId: owner.id } } } },
    include: { user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } }, items: true },
  });
  const map = new Map<string, { id: string; name: string; email: string; phone: string; orders: number; spent: number; createdAt: string }>();
  for (const o of orders) {
    const u = o.user;
    const spent = o.items.filter((i) => i.product?.ownerId === owner.id).reduce((s, i) => s + i.total, 0);
    const e = map.get(u.id) || { ...u, orders: 0, spent: 0, createdAt: u.createdAt.toISOString() };
    e.orders += 1;
    e.spent += spent;
    map.set(u.id, e);
  }
  return ok({ customers: Array.from(map.values()) });
}
