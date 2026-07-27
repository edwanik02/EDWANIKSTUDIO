import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  const { error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);

  const [totalUsers, totalCustomers, totalOwners, totalProducts, totalOrders, orders] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "OWNER" } }),
    db.product.count(),
    db.order.count(),
    db.order.findMany({ select: { total: true, status: true, createdAt: true } }),
  ]);

  const revenue = orders.reduce((s, o) => s + (o.status !== "CANCELLED" && o.status !== "REFUNDED" ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  // Last 7 days sales
  const days: { date: string; sales: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < next);
    days.push({
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      sales: dayOrders.reduce((s, o) => s + (o.status !== "CANCELLED" ? o.total : 0), 0),
      orders: dayOrders.length,
    });
  }

  // Top categories
  const products = await db.product.findMany({ include: { category: true } });
  const catMap = new Map<string, number>();
  for (const p of products) {
    const k = p.category?.name || "Uncategorized";
    catMap.set(k, (catMap.get(k) || 0) + 1);
  }
  const topCategories = Array.from(catMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  return ok({
    totals: { totalUsers, totalCustomers, totalOwners, totalProducts, totalOrders, revenue, pendingOrders },
    salesTrend: days,
    topCategories,
    ordersByStatus: {
      PENDING: orders.filter((o) => o.status === "PENDING").length,
      CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
      PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
      SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
      DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
      CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
    },
  });
}
