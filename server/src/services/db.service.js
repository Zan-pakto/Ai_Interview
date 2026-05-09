const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig, Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Ensure environment variables are loaded
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Enable WebSocket support for Node.js environments
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is missing! Please check your .env file.");
  process.exit(1);
}

console.log("🚀 Initializing Prisma Client with Neon serverless driver (WebSocket)...");

try {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("✅ Prisma Client initialized successfully");
  module.exports = prisma;
} catch (error) {
  console.error("❌ Failed to initialize Prisma Client:", error);
  console.error("❌ Error name:", error.name);
  console.error("❌ Error message:", error.message);
  console.error("❌ Error stack:", error.stack);
  process.exit(1);
}
