import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  const banners = await db.heroBanner.findMany({ orderBy: { sortOrder: "asc" } });
  return ok({ banners });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) return err("Forbidden", 403);
  const body = await getBody(req);
  const { title, subtitle, eyebrow, imageUrl, ctaText, ctaLink, isActive, sortOrder } = body;
  if (!title) return err("Title required", 422);
  const banner = await db.heroBanner.create({
    data: { title, subtitle: subtitle || null, eyebrow: eyebrow || null, imageUrl: imageUrl || null, ctaText: ctaText || null, ctaLink: ctaLink || null, isActive: isActive !== false, sortOrder: sortOrder ? parseInt(sortOrder) : 0 },
  });
  return ok({ banner });
}
