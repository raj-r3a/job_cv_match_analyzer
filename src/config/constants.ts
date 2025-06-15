import dotenv from 'dotenv';
dotenv.config();

export const geminiApiConfig: Record<string, string | undefined> = {
  endpoint: process.env.GEMINI_API_URL,
  authToken: process.env.GEMINI_AUTH_TOKEN,
};
