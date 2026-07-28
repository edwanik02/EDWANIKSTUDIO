import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith("file:")) {
    return envUrl;
  }

  // On Vercel or serverless, copy SQLite DB to /tmp so write operations succeed
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const projectDbPath = path.resolve(process.cwd(), "prisma", "db", "custom.db");
    const tmpDbPath = path.join("/tmp", "custom.db");
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(projectDbPath)) {
      try {
        fs.copyFileSync(projectDbPath, tmpDbPath);
      } catch (e) {
        console.error("[Database] Failed to copy SQLite DB to /tmp:", e);
      }
    }
    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  return "file:./db/custom.db";
}

const dbUrl = getDatabaseUrl();

// Ensure process.env.DATABASE_URL is set for Prisma internal engine checks
process.env.DATABASE_URL = dbUrl;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
