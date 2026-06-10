import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  // Neon provides a pooled connection string via DATABASE_URL (uses PgBouncer)
  // The direct connection is via DIRECT_DATABASE_URL (bypasses pooler, needed for migrations)
  if (databaseUrl?.startsWith('postgresql://') || databaseUrl?.startsWith('postgres://')) {
    // Use Neon's connection pooler via the pg adapter
    const adapter = new PrismaPg(databaseUrl)
    return new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['query'] : [] })
  }

  // Fallback for local development or non-Neon setups
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db