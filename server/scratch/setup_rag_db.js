const prisma = require('../src/services/db.service');

async function main() {
  console.log("🔄 Running RAG database initialization script...");
  try {
    // 1. Enable Vector Extension
    console.log("1️⃣ Enabling pgvector extension...");
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("✅ Vector extension ensured.");

    // 2. Create ResumeChunk Table
    console.log("2️⃣ Creating ResumeChunk table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ResumeChunk" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "embedding" vector(768),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ResumeChunk_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ResumeChunk_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("✅ ResumeChunk table ensured.");

    // 3. Create Similarity Search Index (Optional but highly performant)
    console.log("3️⃣ Creating similarity search index...");
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ResumeChunk_embedding_idx" 
      ON "ResumeChunk" USING hnsw ("embedding" vector_cosine_ops);
    `);
    console.log("✅ Vector index ensured.");

    console.log("\n🎉 DATABASE SETUP SUCCESSFUL! Ready for RAG.\n");
  } catch (err) {
    console.error("❌ Setup failed:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
