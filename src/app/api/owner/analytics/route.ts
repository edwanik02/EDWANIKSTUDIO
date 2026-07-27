import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "OWNER") return err("Forbidden", 403);
  const owner = await db.owner.findUnique({ where: { userId: user.id } });
  if (!owner) return err("Owner not found", 404);

  const products = await db.product.findMany({ where: { ownerId: owner.id }, select: { id: true, name: true, price: true, stock: true } });
  const orders = await db.order.findMany({
    where: { items: { some: { product: { ownerId: owner.id } } } },
    include: { items: { include: { product: true } } },
  });

  const revenue = orders.reduce((s, o) => s + (o.status !== "CANCELLED" && o.status !== "REFUNDED" ? o.items.filter((i) => i.product?.ownerId === owner.id).reduce((x, i) => x + i.total, 0) : 0), 0);
  const totalSold = orders.flatMap((o) => o.items).filter((i) => i.product?.ownerId === owner.id).reduce((s, i) => s + i.quantity, 0);
  const lowStock = products.filter((p) => p.stock <= 5);

  // last 7 days
  const days: { date: string; sales: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const dayRev = orders.filter((o) => o.createdAt >= d && o.createdAt < next && o.status !== "CANCELLED")
      .flatMap((o) => o.items.filter((i) => i.product?.ownerId === owner.id))
      .reduce((s, i) => s + i.total, 0);
    days.push({ date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), sales: dayRev });
  }

  return ok({
    totals: { products: products.length, orders: orders.length, revenue, totalSold, lowStock: lowStock.length },
    salesTrend: days,
    lowStockProducts: lowStock,
    topProducts: products.slice(0, 5),
  });
}
