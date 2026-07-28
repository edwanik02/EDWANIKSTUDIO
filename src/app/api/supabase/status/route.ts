import { NextResponse } from "next/server";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import { db } from "@/lib/db";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
  const supabaseConfigured = isSupabaseConfigured();

  let supabaseApiStatus = "not_configured";
  let supabaseApiError = null;

  if (supabaseConfigured) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Simple health ping to Supabase REST API
        const { error } = await supabase.from("_health_check").select("*").limit(1);
        // Table error like 42P01 (relation does not exist) means Supabase API is reachable and alive
        if (!error || error.code === "PGRST205" || error.code === "42P01") {
          supabaseApiStatus = "connected";
        } else {
          supabaseApiStatus = "error";
          supabaseApiError = error.message;
        }
      }
    } catch (err: any) {
      supabaseApiStatus = "error";
      supabaseApiError = err.message;
    }
  }

  let dbConnectionStatus = "unknown";
  try {
    await db.$queryRaw`SELECT 1`;
    dbConnectionStatus = "connected";
  } catch (err: any) {
    dbConnectionStatus = "error";
  }

  return NextResponse.json({
    configured: supabaseConfigured,
    isPostgres,
    dbConnectionStatus,
    supabaseApiStatus,
    supabaseApiError,
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing",
      DATABASE_URL: process.env.DATABASE_URL ? (isPostgres ? "PostgreSQL (Supabase)" : "SQLite (Local)") : "Missing",
    },
    instructions: {
      step1: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables",
      step2: "Set DATABASE_URL to your Supabase PostgreSQL connection string (postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres)",
      step3: "Run 'npm run db:push' or update provider to postgresql in prisma/schema.prisma",
    },
  });
}
