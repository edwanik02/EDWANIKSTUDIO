import { NextResponse } from "next/server";
import { db } from "./db";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function getBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function logActivity(
  userId: string | null,
  action: string,
  entity?: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    await db.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
      },
    });
  } catch {
    // ignore logging errors
  }
}

export async function trackEvent(
  event: string,
  userId?: string | null,
  productId?: string,
  orderId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await db.analyticsEvent.create({
      data: {
        event,
        userId: userId ?? null,
        productId: productId ?? null,
        orderId: orderId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // ignore
  }
}

export async function getSettings() {
  const s = await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return s;
}
