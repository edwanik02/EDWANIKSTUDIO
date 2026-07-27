import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return ok({ addresses });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const body = await getBody(req);
  const { label, line1, line2, city, state, pincode, country, isDefault } = body;
  if (!line1 || !city || !state || !pincode) return err("Required fields missing", 422);
  if (isDefault) {
    await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  const address = await db.address.create({
    data: { userId: user.id, label: label || "Home", line1, line2: line2 || null, city, state, pincode, country: country || "India", isDefault: !!isDefault },
  });
  return ok({ address });
}
