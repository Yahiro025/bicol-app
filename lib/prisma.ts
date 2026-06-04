import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: pg.Pool | undefined;
};

const getPool = () => {
  if (!globalForPrisma.pgPool) {
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not defined. Set it in .env or your deployment environment.'
      );
    }
    const isSupabase = connectionString.includes('supabase.co');
    globalForPrisma.pgPool = new pg.Pool({
      connectionString,
      max: 20,                         // Limit concurrent connections
      idleTimeoutMillis: 30000,        // Close idle connections after 30s
      connectionTimeoutMillis: 5000,   // Fail fast if DB unreachable
      ...(isSupabase ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }
  return globalForPrisma.pgPool;
};

const getPrisma = () => {
  if (!globalForPrisma.prisma) {
    const pool = getPool();
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
};

export const prisma = getPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = getPool();
}
