import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    nodeEnv: process.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
  });
}
