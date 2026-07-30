const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PDFParse } = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./db.service');

// Load API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedder = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

/**
 * Processes an uploaded resume:
 * 1. Extracts text from PDF.
 * 2. Chunks the text.
 * 3. Generates embeddings.
 * 4. Stores them in the database for future retrieval.
 */
async function ingestResume(userId, pdfBuffer) {
  try {
    console.log(`🔄 Starting ingestion for user ${userId}...`);

    // 1. Extract raw text from pdf
    const parser = new PDFParse({ data: pdfBuffer });
    await parser.load();
    const data = await parser.getText();
    const rawText = data.text;

    if (!rawText || rawText.trim().length < 10) {
      throw new Error("PDF contains no valid extractable text.");
    }

    // 2. Chunk the text logically (approx 500 chars with 100 char overlap)
    const chunks = createTextChunks(rawText, 500, 100);
    console.log(`📜 Created ${chunks.length} chunks from the document.`);

    // Clear previous resume chunks for this user to prevent duplicates/stale data
    await prisma.resumeChunk.deleteMany({ where: { userId } });
    console.log(`🗑️ Flushed existing resume data for clean ingestion.`);

    // 3. Process and embed chunks in parallel batches to avoid overwhelming rate limits
    // Wait, gemini's free tier might throttle. We'll process them sequentially or in small chunks.
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      
      // Generate embedding vector for this specific chunk (truncated to 768 dims to match DB schema)
      const result = await embedder.embedContent({
        content: { parts: [{ text: chunkContent }] },
        outputDimensionality: 768
      });
      const vector = result.embedding.values;

      // Format vector as string compatible with PostgreSQL vector extension syntax '[0.1, 0.2...]'
      const vectorString = `[${vector.join(',')}]`;

      // Generate a proper string ID (uuid) since the schema expects a string ID 
      const chunkId = uuidv4();

      // Using raw SQL execution to correctly typecast and insert vector
      await prisma.$executeRawUnsafe(`
        INSERT INTO "ResumeChunk" ("id", "userId", "content", "embedding")
        VALUES ($1, $2, $3, $4::vector)
      `, chunkId, userId, chunkContent, vectorString);
    }

    console.log(`✅ Succesfully ingested and indexed ${chunks.length} resume chunks.`);
    return { success: true, chunkCount: chunks.length };
  } catch (error) {
    console.error("❌ Fatal error during resume ingestion:", error);
    throw error;
  }
}

/**
 * Searches for the most semantically similar chunks relative to the search query.
 */
async function retrieveRelevantContext(userId, queryText, limit = 3) {
  try {
    if (!userId) return "";

    // 1. Embed the incoming query (truncated to 768 dims to match DB schema)
    const result = await embedder.embedContent({
      content: { parts: [{ text: queryText }] },
      outputDimensionality: 768
    });
    const queryVector = `[${result.embedding.values.join(',')}]`;

    // 2. Perform Cosine Similarity search via the pgvector <=> operator
    // Order by similarity and take top matching chunks
    const results = await prisma.$queryRawUnsafe(`
      SELECT content
      FROM "ResumeChunk"
      WHERE "userId" = $1
      ORDER BY "embedding" <=> $2::vector
      LIMIT $3
    `, userId, queryVector, limit);

    if (!results || results.length === 0) {
      return "No relevant resume information found.";
    }

    // 3. Return joined text snippets
    const contextString = results.map((row, index) => `[Source Fragment ${index + 1}]: ${row.content.replace(/\n/g, ' ').trim()}`).join('\n\n');
    
    return contextString;
  } catch (err) {
    console.error("⚠️ Failed to retrieve context from RAG:", err);
    return ""; // Fail silently to not crash the conversation flow
  }
}

/**
 * Utility to chunk text with a defined overlap to maintain context boundary continuity.
 */
function createTextChunks(text, size, overlap) {
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  
  let startIndex = 0;
  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + size;
    const chunk = cleanedText.substring(startIndex, endIndex);
    
    chunks.push(chunk);
    startIndex += (size - overlap); // Move forward by chunk size, backing up by overlap length
  }
  return chunks;
}

module.exports = {
  ingestResume,
  retrieveRelevantContext
};
