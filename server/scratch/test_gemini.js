const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Testing models/gemini-1.5-flash...");
    const models = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await models.generateContent("test");
    console.log("Success with models/gemini-1.5-flash");
  } catch (e) {
    console.error("Error:", e.message);
  }
}

listModels();
