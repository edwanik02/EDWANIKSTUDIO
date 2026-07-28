import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie, getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user) {
      const cookieStore = await cookies();
      const t = cookieStore.get("ft_session")?.value;
      if (t) {
        try {
          await db.session.deleteMany({ where: { token: t } });
        } catch (e) {
          console.error("Error deleting session token from DB:", e);
        }
      }
    }
    await clearSessionCookie();
    return ok({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    await clearSessionCookie();
    return ok({ message: "Logged out" });
  }
}
