const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates the next interview question based on user response and history.
 */
async function generateNextQuestion(history, lastUserResponse) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a professional technical interviewer. Keep responses concise and focus on one question at a time. Maintain a helpful but rigorous tone." 
        },
        ...history,
        { role: "user", content: lastUserResponse }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating question:', error);
    return "I'm sorry, I encountered an error. Could you repeat that?";
  }
}

module.exports = { generateNextQuestion };
