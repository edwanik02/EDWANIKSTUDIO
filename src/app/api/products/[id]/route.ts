import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody, trackEvent } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product = null;
  if (id.length > 10) {
    product = await db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true, brand: true, owner: { select: { storeName: true, storeSlug: true } }, reviews: { include: { user: { select: { name: true } } }, where: { isApproved: true }, orderBy: { createdAt: "desc" } } },
    });
  }
  if (!product) {
    product = await db.product.findUnique({
      where: { slug: id },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true, brand: true, owner: { select: { storeName: true, storeSlug: true } }, reviews: { include: { user: { select: { name: true } } }, where: { isApproved: true }, orderBy: { createdAt: "desc" } } },
    });
  }
  if (!product) return err("Product not found", 404);

  const related = await db.product.findMany({
    where: { isActive: true, isApproved: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { images: { take: 1 } },
    take: 4,
  });

  return ok({ product, related });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  if (!["SUPER_ADMIN", "ADMIN", "OWNER"].includes(user.role)) return err("Forbidden", 403);
  const { id } = await params;
  const body = await getBody(req);

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return err("Product not found", 404);

  if (user.role === "OWNER" && existing.ownerId !== user.ownerId) {
    return err("You can only edit your own products", 403);
  }

  const { name, description, price, mrpPrice, sku, badge, categoryId, brandId, stock, isActive, images } = body;
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = parseFloat(price);
  if (mrpPrice !== undefined) data.mrpPrice = mrpPrice ? parseFloat(mrpPrice) : null;
  if (sku !== undefined) data.sku = sku;
  if (badge !== undefined) data.badge = badge || null;
  if (categoryId !== undefined) data.categoryId = categoryId || null;
  if (brandId !== undefined) data.brandId = brandId || null;
  if (stock !== undefined) data.stock = parseInt(stock);
  if (isActive !== undefined) data.isActive = isActive;

  if (images !== undefined) {
    await db.productImage.deleteMany({ where: { productId: id } });
    if (Array.isArray(images) && images.length) {
      data.images = { create: images.map((img: any, idx: number) => ({ url: img.url, alt: img.alt || name, sortOrder: idx, isPrimary: idx === 0 })) };
    }
  }

  const product = await db.product.update({ where: { id }, data, include: { images: true } });
  await trackEvent("PRODUCT_UPDATE", user.id, product.id);
  return ok({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  if (!["SUPER_ADMIN", "ADMIN", "OWNER"].includes(user.role)) return err("Forbidden", 403);
  const { id } = await params;
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return err("Product not found", 404);
  if (user.role === "OWNER" && existing.ownerId !== user.ownerId) {
    return err("You can only delete your own products", 403);
  }
  await db.product.delete({ where: { id } });
  await trackEvent("PRODUCT_DELETE", user.id, id);
  return ok({ message: "Product deleted" });
}
