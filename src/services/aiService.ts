import { generateContentRequest } from '../utils/aiApiSdk';
import { formGenerateContentPayloadWithFiles, logger } from '../utils';

// Rate limiting variables
let requestCount = 0;
let hourlyRequestCount = 0;
let lastMinuteReset = Date.now();
let lastHourReset = Date.now();

// const model = vertexAI.getGenerativeModel({
//   model: 'gemini-1.5-flash',
// });

/**
 * Checks and enforces rate limits for API requests
 * - Limits: 20 requests per minute and 300 requests per hour
 * - Automatically resets counters when time windows expire
 * @throws Error if rate limits are exceeded
 */
async function rateLimitCheck(): Promise<void> {
  const now = Date.now();

  // Reset minute counter
  if (now - lastMinuteReset >= 60000) {
    requestCount = 0;
    lastMinuteReset = now;
  }

  // Reset hour counter
  if (now - lastHourReset >= 3600000) {
    hourlyRequestCount = 0;
    lastHourReset = now;
  }

  // Check limits
  if (requestCount >= 20) {
    throw new Error('Rate limit exceeded: 20 requests per minute');
  }

  if (hourlyRequestCount >= 300) {
    throw new Error('Rate limit exceeded: 300 requests per hour');
  }

  // Increment counters
  requestCount++;
  hourlyRequestCount++;
}

/**
 * Analyzes a CV against a job description using Google's Gemini AI model
 * @param jobDescriptionBase64 - Base64 encoded job description PDF
 * @param cvBase64 - Base64 encoded CV PDF
 * @returns Analysis result containing match score, strengths, weaknesses, and recommendations
 * @throws Error if analysis fails or rate limits are exceeded
 */
export async function analyzeCVWithGemini(
  jobDescriptionBase64: string,
  cvBase64: string
): Promise<any> {
  await rateLimitCheck();

  try {
    const requestBody = formGenerateContentPayloadWithFiles(
      jobDescriptionBase64,
      cvBase64
    );
    const response = await generateContentRequest(requestBody);
    logger.debug({
      message: 'received this response from gemini',
      data: JSON.stringify(response),
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }

    const content = response.candidates[0].content;
    if (!content.parts || content.parts.length === 0) {
      throw new Error('No content in Gemini response');
    }

    const analysisText = content.parts[0].text;

    // Try to parse as JSON, fallback to structured text if parsing fails
    try {
      const finalResult = JSON.parse(analysisText || '{}');
      if (finalResult.error) {
        return {
          message: 'some error occurred while analyzing cv and job description',
          error: finalResult.error,
        };
      }
      return finalResult;
    } catch (parseError) {
      logger.warn({
        message: 'Failed to parse Gemini response as JSON, returning as text',
      });
      return {
        rawAnalysis: analysisText,
        note: 'Analysis returned as text due to JSON parsing issues',
      };
    }
  } catch (error) {
    logger.error({ message: 'Gemini API error:', error });
    throw new Error(
      `Failed to analyze with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
