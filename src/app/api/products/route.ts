import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, slugify } from "@/lib/auth";
import { ok, err, getBody, trackEvent } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const cat = searchParams.get("cat");
  const brand = searchParams.get("brand");
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const badge = searchParams.get("badge");
  const limit = Math.min(parseInt(searchParams.get("limit") || "60"), 200);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const featured = searchParams.get("featured");
  const ownerId = searchParams.get("ownerId");

  const where: any = { isActive: true, isApproved: true };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
    ];
  }
  if (cat) {
    const category = await db.category.findFirst({ where: { slug: cat } });
    if (category) where.categoryId = category.id;
  }
  if (brand) {
    const b = await db.brand.findFirst({ where: { slug: brand } });
    if (b) where.brandId = b.id;
  }
  if (badge) where.badge = badge;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (ownerId) where.ownerId = ownerId;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };
  else if (sort === "popular") orderBy = { reviewCount: "desc" };

  const total = await db.product.count({ where });
  const products = await db.product.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      brand: true,
      owner: { select: { id: true, storeName: true, storeSlug: true } },
    },
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  if (featured === "true") {
    // already handled by sort/where; kept for compat
  }

  return ok({ products, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  if (!["SUPER_ADMIN", "ADMIN", "OWNER"].includes(user.role)) return err("Forbidden", 403);

  const body = await getBody(req);
  const { name, description, price, mrpPrice, sku, badge, categoryId, brandId, stock, images, isActive } = body;
  if (!name || price == null) return err("Name and price are required", 422);

  let ownerId: string | null = null;
  if (user.role === "OWNER") {
    const owner = await db.owner.findUnique({ where: { userId: user.id } });
    if (!owner) return err("Owner profile not found", 404);
    ownerId = owner.id;
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let i = 1;
  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const product = await db.product.create({
    data: {
      name,
      slug,
      description: description || null,
      price: parseFloat(price),
      mrpPrice: mrpPrice ? parseFloat(mrpPrice) : null,
      sku: sku || null,
      badge: badge || null,
      categoryId: categoryId || null,
      brandId: brandId || null,
      ownerId,
      stock: stock ? parseInt(stock) : 0,
      isActive: isActive !== false,
      isApproved: user.role === "OWNER" ? true : true,
      images: images?.length
        ? { create: images.map((img: any, idx: number) => ({ url: img.url, alt: img.alt || name, sortOrder: idx, isPrimary: idx === 0 })) }
        : [],
    },
    include: { images: true },
  });

  await trackEvent("PRODUCT_CREATE", user.id, product.id);
  return ok({ product });
}
