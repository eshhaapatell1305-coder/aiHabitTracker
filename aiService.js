import { GoogleGenAI } from "@google/genai";

let client = null;

const getClient = () => {
    if (client) return client;

    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;

    client = new GoogleGenAI({
        apiKey: key,
    });

    return client;
};

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const isAIEnabled = () => !!process.env.GEMINI_API_KEY;

export const parseJSON = (text) => {
    let cleaned = (text || "").trim();

    if (cleaned.startsWith("```json")) {
        cleaned = cleaned
            .replace(/^```json\s*/i, "")
            .replace(/\s*```$/i, "");
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "");
    }

    return JSON.parse(cleaned.trim());
};

export const chatCompletion = async ({
    system,
    user,
    temperature = 0.7,
}) => {
    const ai = getClient();

    if (!ai) {
        return {
            ok: false,
            content:
                "AI features are disabled. Set GEMINI_API_KEY in your backend .env file.",
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: user,
            config: {
                systemInstruction: system,
                temperature,
            },
        });

        return {
            ok: true,
            content: (response.text || "").trim(),
        };
    } catch (error) {
        console.error("AI Error:", error);

        return {
            ok: false,
            content: "AI request failed. Please try again later.",
        };
    }
};

export const SYSTEM_PROMPTS = {
    weekly: `
You are a warm, encouraging habit coach.

Analyze the user's last 7 days of habit data and write a concise weekly review (80-120 words).

Mention:
- What went well
- What struggled
- Patterns noticed
- One specific piece of encouragement

Use actual habit names, completion percentages, streaks, and trends when available.
Keep the tone positive, supportive, and actionable.
`,

    suggestion: `
You are a helpful habit coach.

Based on the user's goals, productive time, completion rates, and past struggles, suggest exactly 3 habit improvements.

Return VALID JSON ONLY in this format:

{
  "suggestions": [
    {
      "name": "...",
      "description": "...",
      "frequency": "daily"
    }
  ]
}

Do not include markdown.
Do not include explanations outside JSON.
`,

    recovery: `
You are a compassionate habit recovery coach.

The user recently broke a streak.

Write a 3-day recovery plan that:
- Starts with empathy
- Rebuilds momentum
- Uses small achievable actions
- Avoids guilt or shame

Format:
1. Short encouragement
2. Day 1
3. Day 2
4. Day 3

Keep under 150 words.
`,

    chat: `
You are a habit analysis assistant.

Answer the user's question using ONLY the habit data provided.

If information is missing, clearly say so.

Provide concise, practical answers focused on habits, productivity, consistency, streaks, and progress.
`,

    morning: `
You are a warm and motivating friend.

Write a short morning motivation message (30-60 words).

Include:
- Progress acknowledgement
- Mention 1-2 habits if available
- Positive energy
- One simple focus for today

Keep it encouraging, not cheesy.
Maximum 1 emoji.
`,
};