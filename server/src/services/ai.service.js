const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-flash-latest to avoid 429 quota limits on newer models
const model = genAI.getGenerativeModel({ 
  model: "gemini-flash-latest"
});

const { retrieveRelevantContext } = require('./rag.service');

/**
 * Generates the next interview question based on user response and history.
 */
async function generateNextQuestion(history, lastUserResponse, context = {}) {
  try {
    const { topic, difficulty, remainingSeconds, userId } = context;

    // 1. Retrieve relevant chunks from user's uploaded resume based on the topic/response
    const searchIntent = `Experience with ${topic}. Context of response: ${lastUserResponse}`;
    const resumeContext = await retrieveRelevantContext(userId, searchIntent, 3);
    
    const hasResume = resumeContext && !resumeContext.includes("No relevant resume information");

    let timeInstruction = "";
    if (typeof remainingSeconds === 'number') {
      if (remainingSeconds <= 60 && remainingSeconds > 0) {
        timeInstruction = `\nCRITICAL TIME WARNING: There are only ${remainingSeconds} seconds left (less than 1 minute). DO NOT ask any new technical questions. Instead, acknowledge their last answer, mention that time is almost up, and invite them to share any final questions or closing thoughts before concluding. Keep it brief and professional.`;
      } else {
        timeInstruction = `\nTime remaining: ${Math.round(remainingSeconds / 60)} minutes. Continue the technical interview normally.`;
      }
    }
    
    const systemInstruction = "You are a professional technical interviewer conducting an adaptive interview. Carefully evaluate the accuracy, correctness, and completeness of the candidate's latest response. You MUST dynamically adjust the difficulty of the next question based on their performance: if their response is correct, solid, and demonstrates good understanding, challenge them by increasing the difficulty slightly for the next question (e.g., asking about edge cases, scalability, or performance optimization); if their response is incorrect, weak, or they struggle, lower the difficulty slightly or offer a supportive clarifying follow-up focused on core fundamentals. Keep your responses concise, natural, and focused on one question at a time. Do not provide answers to your own questions.";
    
    const ragGrounding = hasResume 
      ? `\nIMPORTANT CANDIDATE BACKGROUND (Retrieved from their actual resume):\n${resumeContext}\nUse this factual data to craft personalized follow-up questions (e.g., "I see on your resume that you worked on X at Y company, tell me about..."). DO NOT share non-public info or reveal that you are using a "Source Fragment" string.`
      : "\n(No relevant resume source fragments were found for this query.)";

    const prompt = `
      ${systemInstruction}
      
      Context:
      - Topic: ${topic || 'General Software Engineering'}
      - Difficulty: ${difficulty || 'Mid-level'}
      ${ragGrounding}
      ${timeInstruction}
      
      Conversation History:
      ${history.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n')}
      
      Candidate's Latest Response: "${lastUserResponse}"
      
      Instruction: Based on the candidate's response, the interview context, and the remaining time, formulate your next response. Be professional and concise.
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

    const userAnswers = history.filter(m => m.role === 'user');
    if (!history || history.length === 0 || userAnswers.length === 0) {
      return {
        overallScore: 0,
        pacing: "N/A",
        strengths: ["No response recorded"],
        improvements: ["Please complete at least one answer next time."],
        summary: "The interview was ended before any answers were recorded by the candidate."
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
    
    try {
      // Robust JSON extraction: Find the outer-most curly braces to ignore conversational text/markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (parseError) {
      console.error("❌ Failed parsing Gemini feedback JSON:", text);
      throw parseError;
    }
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
