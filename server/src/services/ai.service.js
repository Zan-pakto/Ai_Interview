const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-flash-latest to avoid 429 quota limits on newer models
const model = genAI.getGenerativeModel({ 
  model: "gemini-flash-latest"
});

/**
 * Generates the next interview question based on user response and history.
 */
async function generateNextQuestion(history, lastUserResponse, context = {}) {
  try {
    const { topic, difficulty } = context;
    
    const systemInstruction = "You are a professional technical interviewer. Your goal is to conduct a rigorous but fair interview. Keep your responses concise and focused on one question at a time. Do not provide answers to your own questions. If the candidate's answer is brief or incomplete, you can ask a follow-up or move to a more challenging topic.";

    const prompt = `
      ${systemInstruction}
      
      Context:
      - Topic: ${topic || 'General Software Engineering'}
      - Difficulty: ${difficulty || 'Mid-level'}
      
      Conversation History:
      ${history.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n')}
      
      Candidate's Latest Response: "${lastUserResponse}"
      
      Instruction: Based on the candidate's response and the interview context, ask the next relevant question. Be professional and concise.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating question:', error);
    return "I'm sorry, I encountered an error. Could you repeat that?";
  }
}

module.exports = { generateNextQuestion };
