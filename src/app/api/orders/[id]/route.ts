import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody, logActivity } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true, phone: true } }, address: true, history: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) return err("Order not found", 404);
  if (user.role === "CUSTOMER" && order.userId !== user.id) return err("Forbidden", 403);
  return ok({ order });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "ADMIN", "OWNER"].includes(user.role)) return err("Forbidden", 403);
  const { id } = await params;
  const body = await getBody(req);
  const { status, paymentStatus, note } = body;

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) return err("Order not found", 404);

  const data: any = {};
  if (status) data.status = status;
  if (paymentStatus) data.paymentStatus = paymentStatus;

  const order = await db.order.update({ where: { id }, data, include: { items: true } });

  if (status && status !== existing.status) {
    await db.orderStatusHistory.create({ data: { orderId: id, status, note: note || null } });
  }
  await logActivity(user.id, "ORDER_UPDATE", "order", id, { status, paymentStatus }, req.headers.get("x-forwarded-for") || undefined);
  return ok({ order });
}
