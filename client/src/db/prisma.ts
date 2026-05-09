import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Enable WebSocket support for Node.js environments
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not defined in process.env");
    throw new Error("DATABASE_URL is not defined.");
  }

  console.log("🚀 Initializing Prisma Client with Neon serverless driver (WebSocket)...");

  try {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);
    const client = new PrismaClient({ adapter });

    console.log("✅ Prisma Client initialized successfully");
    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Prisma Client:", error);
    console.error("❌ Error name:", (error as Error).name);
    console.error("❌ Error message:", (error as Error).message);
    console.error("❌ Error stack:", (error as Error).stack);
    throw error;
  }
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
