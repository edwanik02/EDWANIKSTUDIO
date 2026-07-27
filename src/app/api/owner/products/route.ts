import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "OWNER") return err("Forbidden", 403);
  const owner = await db.owner.findUnique({ where: { userId: user.id } });
  if (!owner) return err("Owner not found", 404);
  const products = await db.product.findMany({
    where: { ownerId: owner.id },
    include: { images: { take: 1 }, category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });
  return ok({ products });
}
