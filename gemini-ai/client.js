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

module.exports = { generateGoals };
