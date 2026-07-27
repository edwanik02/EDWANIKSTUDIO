import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return ok({ orders });
}
