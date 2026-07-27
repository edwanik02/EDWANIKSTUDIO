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

export const DEFAULT_SETTINGS = {
  id: "singleton",
  siteName: "FunziToys",
  tagline: "Where Fun Meets Imagination",
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "#FF6B35",
  accentColor: "#FFA500",
  whatsappNum: "919876543210",
  supportEmail: "support@funzitoys.com",
  phone: "+91 98765 43210",
  address: "123 Toy Street, Play City, India 560001",
  facebook: "https://facebook.com/funzitoys",
  instagram: "https://instagram.com/funzitoys",
  twitter: "https://twitter.com/funzitoys",
  youtube: null,
  footerText: "FunziToys brings joy to children with premium, safe, and educational toys.",
  copyrightText: "© 2024 FunziToys. All rights reserved.",
  metaTitle: "FunziToys - Premium Toys & Games for Kids | Shop Online",
  metaDesc: "Shop premium toys, action figures, building blocks, educational games and more at FunziToys. Fast delivery, best prices, quality guaranteed.",
  metaKeywords: "toys, kids toys, action figures, building blocks, educational toys, board games, remote control toys",
  fontHeading: "Inter",
  fontBody: "Inter",
  headerStyle: "standard",
  footerStyle: "standard",
  cardStyle: "standard",
  buttonStyle: "rounded",
  customerHeroTitle: "Bring Home the Magic of Play",
  customerHeroSubtitle: "Discover thousands of premium toys that spark imagination, creativity, and joy.",
  customerHeroImage: null,
  customerAboutTitle: "About FunziToys",
  customerAboutText: "For over a decade, FunziToys has been delighting children and parents with carefully curated, safe, and educational toys. Every product is tested for quality and safety.",
  ownerHeroTitle: "Grow Your Toy Business With Us",
  ownerHeroSubtitle: "Join hundreds of shop owners selling on FunziToys. Reach more customers, manage inventory easily.",
  ownerHeroImage: null,
  ownerAboutTitle: "Why Sell on FunziToys",
  ownerAboutText: "Our platform gives shop owners powerful tools to manage products, track orders, and grow sales. You focus on great toys, we handle the rest.",
  updatedAt: new Date().toISOString(),
};

export async function getSettings() {
  try {
    const s = await db.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (s) return s;
    return await db.siteSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });
  } catch (error) {
    console.error("Error retrieving settings from database:", error);
    return DEFAULT_SETTINGS;
  }
}
