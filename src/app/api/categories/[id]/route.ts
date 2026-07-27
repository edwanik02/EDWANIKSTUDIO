import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) return err("Forbidden", 403);
  const { id } = await params;
  const body = await getBody(req);
  const { name, description, imageUrl, sortOrder, isActive } = body;
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
  if (isActive !== undefined) data.isActive = isActive;
  const category = await db.category.update({ where: { id }, data });
  return ok({ category });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) return err("Forbidden", 403);
  const { id } = await params;
  await db.category.delete({ where: { id } });
  return ok({ message: "Category deleted" });
}
