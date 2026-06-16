import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 1. Create a safe global object to hold the Prisma instance during Next.js hot-reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 2. Setup the Postgres connection pool using your direct URL
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma 7 with the adapter, OR use the existing one if it's cached
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

// 4. Save the instance to the global object in development mode
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}