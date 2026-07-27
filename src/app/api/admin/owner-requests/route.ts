import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  try {
    const { error } = await requireRole("SUPER_ADMIN", "ADMIN");
    if (error) return err(error.message, error.status);
    const requests = await db.ownerRequest.findMany({ orderBy: { createdAt: "desc" } });
    return ok({ requests });
  } catch (error) {
    console.error("GET owner-requests error:", error);
    return err("Failed to fetch owner requests", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Public submission of owner access request
    const body = await req.json().catch(() => ({}));
    const { name, shopName, email, phone, businessType, address, message } = body;
    if (!name || !shopName || !email || !phone) return err("Required fields missing (Name, Shop Name, Email, Phone)", 422);
    
    const cleanEmail = String(email).trim().toLowerCase();
    const request = await db.ownerRequest.create({
      data: {
        name: String(name).trim(),
        shopName: String(shopName).trim(),
        email: cleanEmail,
        phone: String(phone).trim(),
        businessType: businessType ? String(businessType).trim() : "Retail",
        address: address ? String(address).trim() : null,
        message: message ? String(message).trim() : null,
      },
    });
    return ok({ request, message: "Your request has been submitted. We will contact you soon." });
  } catch (error) {
    console.error("POST owner-requests error:", error);
    return err("An unexpected error occurred while submitting your request.", 500);
  }
}
