const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Ensure environment variables are loaded
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is missing! Please check your .env file.");
  process.exit(1);
}

// Use standard Postgres Pool
const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for some hosted environments like Neon/Aiven
  }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
