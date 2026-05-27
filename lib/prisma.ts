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
      console.error('DATABASE_URL is not defined');
    }
    const isSupabase = connectionString?.includes('supabase.co');
    globalForPrisma.pgPool = new pg.Pool({
      connectionString,
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
