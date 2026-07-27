import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://'))) {
    return envUrl
  }
  if (envUrl && envUrl.startsWith('file:')) {
    if (envUrl.startsWith('file:/')) {
      return envUrl
    }
    const relativePath = envUrl.replace(/^file:/, '')
    return `file:${path.resolve(process.cwd(), relativePath)}`
  }
  // Default fallback for local dev SQLite
  return `file:${path.resolve(process.cwd(), 'db/custom.db')}`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
