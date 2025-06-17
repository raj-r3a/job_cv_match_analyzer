import dotenv from 'dotenv';
dotenv.config();

export const geminiApiConfig: Record<string, string | undefined> = {
  endpoint: process.env.GEMINI_API_URL,
  authToken: process.env.GEMINI_AUTH_TOKEN,
};

export const loggerConfig = {
  logLevel: process.env.LOG_LEVEL || 'debug',
};

export const serverConfig = {
  port: process.env.PORT || 80,
};
