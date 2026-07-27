import { NextRequest } from "next/server";
import { clearSessionCookie, getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (user) {
    const token = (await import("next/headers")).cookies;
    const t = (await token).get("ft_session")?.value;
    if (t) await db.session.deleteMany({ where: { token: t } });
  }
  await clearSessionCookie();
  return ok({ message: "Logged out" });
}
