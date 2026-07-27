import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const { id } = await params;
  const body = await getBody(req);
  const { label, line1, line2, city, state, pincode, country, isDefault } = body;
  if (isDefault) {
    await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  const data: any = {};
  if (label !== undefined) data.label = label;
  if (line1 !== undefined) data.line1 = line1;
  if (line2 !== undefined) data.line2 = line2;
  if (city !== undefined) data.city = city;
  if (state !== undefined) data.state = state;
  if (pincode !== undefined) data.pincode = pincode;
  if (country !== undefined) data.country = country;
  if (isDefault !== undefined) data.isDefault = isDefault;
  const address = await db.address.update({ where: { id }, data });
  return ok({ address });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const { id } = await params;
  await db.address.deleteMany({ where: { id, userId: user.id } });
  return ok({ message: "Address deleted" });
}
