import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && envUrl.startsWith('file:')) {
    return envUrl
  }
  const dbPath = path.resolve(process.cwd(), 'db', 'custom.db')
  return `file:${dbPath}`
}

const dbUrl = getDatabaseUrl()

// Ensure process.env.DATABASE_URL is a valid file URL for Prisma engine internally
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = dbUrl
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
