import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  const { error } = await requireRole("SUPER_ADMIN", "ADMIN");
  if (error) return err(error.message, error.status);
  const requests = await db.ownerRequest.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ requests });
}

export async function POST(req: NextRequest) {
  // Public submission of owner access request
  const body = await req.json().catch(() => ({}));
  const { name, shopName, email, phone, businessType, address, message } = body;
  if (!name || !shopName || !email || !phone) return err("Required fields missing", 422);
  const request = await db.ownerRequest.create({
    data: { name, shopName, email: String(email).toLowerCase(), phone, businessType: businessType || "Retail", address: address || null, message: message || null },
  });
  return ok({ request, message: "Your request has been submitted. We will contact you soon." });
}
