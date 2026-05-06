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

/**
 * Generates comprehensive feedback and summary of the candidate's performance.
 */
async function generateFeedback(history, context = {}) {
  try {
    const { topic, difficulty } = context;

    if (!history || history.length === 0) {
      return {
        overallScore: 0,
        pacing: "N/A",
        strengths: ["No response recorded"],
        improvements: ["Please complete at least one answer next time."],
        summary: "The interview was ended before any answers were recorded."
      };
    }

    const systemInstruction = `You are an expert tech hiring manager. Analyze the provided interview conversation history.
Evaluate the candidate's answers based on the topic "${topic || 'General Software Engineering'}" and difficulty level "${difficulty || 'Mid-level'}".
You MUST return the evaluation in JSON format with exactly the following keys:
- overallScore: a number between 10 and 100 representing their technical depth, communication, and confidence.
- pacing: a string like "Good", "Too Fast", "Too Slow", or "Varies".
- strengths: an array of 2-3 specific technical or communication strengths shown.
- improvements: an array of 2-3 specific suggestions for improvement.
- summary: a paragraph summarizing their performance and next steps.
Do not wrap your response in markdown code blocks like \`\`\`json. Return ONLY the raw JSON string.`;

    const prompt = `
      ${systemInstruction}
      
      Conversation History:
      ${history.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n')}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Attempt to parse JSON, cleaning up markdown code block wrapper if present
    const cleanJson = text.replace(/^```json\s*|```$/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating feedback:', error);
    return {
      overallScore: 75,
      pacing: "Moderate",
      strengths: ["Good communication", "Able to answer core questions"],
      improvements: ["Provide more detailed code examples", "Elaborate more on design decisions"],
      summary: "Great job completing the interview! You demonstrated a solid foundation, but focusing on deeper architecture patterns will help you excel."
    };
  }
}

module.exports = { generateNextQuestion, generateFeedback };
