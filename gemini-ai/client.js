const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function extractJson(text) {
  try {
    const m = text && text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const jsonStr = m ? m[1] : text;
    return JSON.parse(jsonStr);
  } catch (e) {
    return text;
  }
}

async function generateGoalSteps({ title = '', description = '', durationDays = 7 } = {}) {
  const prompt = `You are a health coach. Break the following goal into a concise,simplest achievable step-by-step plan as JSON array.
Each step must include: "id" (string, short slug), "title" (string), "description" (string), "order" (number starting from 1).
Keep it between 4 and 8 steps maximum. Do not include any surrounding text, only JSON.

Goal Title: ${title}
Goal Description: ${description}
Suggested duration (days): ${durationDays}
`;
  const result = await model.generateContent([{ text: prompt }]);
  const text = result.response.text();
  const steps = extractJson(text);
  return Array.isArray(steps) ? steps : [];
}

async function generateGoals(userContext = {}) {
  const prompt = `
    You are a health coach. Generate 3 SMART health goals as a JSON array.
    Each goal object must include: "title" (string), "description" (string), "target" (number), "unit" (string), "durationDays" (number), "category" (string).
    User context:
    ${JSON.stringify(userContext)}
    Return ONLY valid JSON. No extra text.`;

  const result = await model.generateContent([{ text: prompt }]);
  const text = result.response.text();
  return extractJson(text);
}

async function summarizeBlog({ title = '', content = '' } = {}) {
  const prompt = `You are a helpful medical blog assistant.
Summarize the following blog content in 5-7 bullet points, using plain text suitable for a patient audience. Avoid adding new facts.

Title: ${title}
Content:
${content}
`;
  const result = await model.generateContent([{ text: prompt }]);
  const text = result.response.text();
  return text;
}

// Generate short, actionable recommendations for a completed goal
async function generateGoalRecommendations({ title = '', description = '', steps = [], durationDays = 0 } = {}) {
  const prompt = `You are a health coach. Based on the completed goal and its steps, provide simple concise, personalized recommendations (bulleted text) to sustain progress and suggest a next challenge. Keep it under 120 words.

                  Goal Title: ${title}
                  Goal Description: ${description}
                  Duration (days): ${durationDays}
                  Steps (with completion): ${JSON.stringify(steps)}
                  `;
  const result = await model.generateContent([{ text: prompt }]);
  return result.response.text();
}

module.exports = { generateGoals, summarizeBlog, generateGoalSteps,generateGoalRecommendations };