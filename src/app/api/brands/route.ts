import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, slugify } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true, isApproved: true } } } } },
  });
  return ok({ brands });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) return err("Forbidden", 403);
  const body = await getBody(req);
  const { name, description, logoUrl, sortOrder, isActive } = body;
  if (!name) return err("Name is required", 422);
  const slug = slugify(name);
  const exists = await db.brand.findUnique({ where: { slug } });
  if (exists) return err("Brand already exists", 409);
  const brand = await db.brand.create({
    data: { name, slug, description: description || null, logoUrl: logoUrl || null, sortOrder: sortOrder ? parseInt(sortOrder) : 0, isActive: isActive !== false },
  });
  return ok({ brand });
}
