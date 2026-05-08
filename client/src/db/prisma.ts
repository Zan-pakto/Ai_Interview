import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not defined in process.env");
    throw new Error("DATABASE_URL is not defined.");
  }

  console.log("🚀 Initializing Prisma Client with standard Postgres driver...");

  try {
    // Use standard pg Pool (no WebSockets, avoids bufferUtil errors)
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("❌ Failed to initialize Prisma Client:", error);
    throw error;
  }
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
