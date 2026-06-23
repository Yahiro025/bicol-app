import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: pg.Pool | undefined;
};

const getPool = () => {
  if (globalForPrisma.pgPool) return globalForPrisma.pgPool;
  if (!connectionString) throw new Error('DATABASE_URL is not defined');
  const isSupabase = connectionString.includes('supabase.co');
  globalForPrisma.pgPool = new pg.Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ...(isSupabase ? { ssl: { rejectUnauthorized: false } } : {}),
  });
  return globalForPrisma.pgPool;
};

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const adapter = new PrismaPg(getPool());
  globalForPrisma.prisma = new PrismaClient({ adapter });
  return globalForPrisma.prisma;
};

export const prisma = getPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = getPool();
}
