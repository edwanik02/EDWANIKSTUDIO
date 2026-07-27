import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok, err, getBody, getSettings } from "@/lib/api";

export async function GET() {
  const settings = await getSettings();
  return ok({ settings });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) return err("Forbidden", 403);
  const body = await getBody(req);
  const allowed = [
    "siteName","tagline","logoUrl","faviconUrl","primaryColor","accentColor","whatsappNum","supportEmail",
    "phone","address","facebook","instagram","twitter","youtube","footerText","copyrightText",
    "metaTitle","metaDesc","metaKeywords","fontHeading","fontBody","headerStyle","footerStyle","cardStyle","buttonStyle",
    "customerHeroTitle","customerHeroSubtitle","customerHeroImage","customerAboutTitle","customerAboutText",
    "ownerHeroTitle","ownerHeroSubtitle","ownerHeroImage","ownerAboutTitle","ownerAboutText",
  ];
  const data: any = {};
  for (const k of allowed) {
    if (body[k] !== undefined) data[k] = body[k] === "" ? null : body[k];
  }
  const settings = await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  return ok({ settings });
}
