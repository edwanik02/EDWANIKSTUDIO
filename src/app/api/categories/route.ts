import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, slugify } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true, isApproved: true } } } } },
  });
  return ok({ categories });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) return err("Forbidden", 403);
  const body = await getBody(req);
  const { name, description, imageUrl, sortOrder, isActive } = body;
  if (!name) return err("Name is required", 422);
  const slug = slugify(name);
  const exists = await db.category.findUnique({ where: { slug } });
  if (exists) return err("Category already exists", 409);
  const category = await db.category.create({
    data: { name, slug, description: description || null, imageUrl: imageUrl || null, sortOrder: sortOrder ? parseInt(sortOrder) : 0, isActive: isActive !== false },
  });
  return ok({ category });
}
