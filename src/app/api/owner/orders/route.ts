import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "OWNER") return err("Forbidden", 403);
  const owner = await db.owner.findUnique({ where: { userId: user.id } });
  if (!owner) return err("Owner not found", 404);

  const orders = await db.order.findMany({
    where: { items: { some: { product: { ownerId: owner.id } } } },
    include: { items: { include: { product: true } }, user: { select: { name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok({ orders });
}
