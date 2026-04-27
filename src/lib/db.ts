import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl() {
  // Supabase auto-set POSTGRES_URL (connection pooler) or POSTGRES_URL_NON_POOLING (direct)
  const nonPoolingUrl = process.env.POSTGRES_URL_NON_POOLING
  const poolingUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''

  // Prefer direct connection for Prisma (more compatible)
  if (nonPoolingUrl) return nonPoolingUrl

  // Fallback: use pooler URL with pgbouncer flag
  if (poolingUrl.includes('supabase') || poolingUrl.includes('pooler')) {
    const separator = poolingUrl.includes('?') ? '&' : '?'
    return poolingUrl + separator + 'pgbouncer=true&connect_timeout=15'
  }

  return poolingUrl
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
