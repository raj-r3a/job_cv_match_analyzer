import { GenerateContentRequest, SchemaType } from '../types';

export function formGenerateContentPayloadWithFiles(jd: string, cv: string) {
  try {
    const prompt = `
You are an expert HR analyst. Analyze the following CV against the job description and provide a comprehensive assessment.

You will receive two PDF documents:
1. The first PDF is the **job description**
2. The second PDF is the **candidate's CV**

Analyze both documents and respond **only** in the following strict JSON format. If you are unsure or the data is missing, fill that field with null or an empty array (as appropriate).

Your response **must include all the fields below**, even if some of them are empty or null.

{
  "overallMatch": {
    "score": <number between 0-100>,
    "summary": "<brief overall assessment>"
  },
  "strengths": [
    {
      "area": "<strength area>",
      "description": "<detailed description>",
      "evidence": "<specific evidence from CV>"
    }
  ],
  "weaknesses": [
    {
      "area": "<weakness area>",
      "description": "<detailed description>",
      "impact": "<potential impact on job performance>"
    }
  ],
  "skillsAlignment": {
    "matched": ["<list of matched skills>"],
    "missing": ["<list of missing required skills>"],
    "additional": ["<list of additional valuable skills>"]
  },
  "experienceAlignment": {
    "relevantExperience": "<assessment of relevant experience>",
    "yearsOfExperience": "<estimated years in relevant field>",
    "industryMatch": "<assessment of industry alignment>"
  },
  "recommendations": [
    "<actionable recommendations for the candidate>",
    "<suggestions for skill development>",
    "<interview focus areas>"
  ],
  "redFlags": [
    "<any concerning aspects that need clarification>"
  ],
  "error": "<if there is any issue in reading or understanding the PDFs, describe the error message here; otherwise use null>"
}

⚠️ Important instructions:
- Return only the raw JSON.
- Do **not** omit any fields.
- If you don’t find relevant content for a field, return null or an empty array, but keep the field.
- Do not use markdown, code blocks, or extra commentary—just the JSON.

If either PDF is unreadable, set all fields to null and include the error message in the "error" field.

Example error case:
{
  "overallMatch": null,
  "strengths": null,
  "weaknesses": null,
  "skillsAlignment": null,
  "experienceAlignment": null,
  "recommendations": null,
  "redFlags": null,
  "error": "Candidate CV/JD is invalid or could not be processed."
}
`;
    const requestPayload: GenerateContentRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: jd,
              },
            },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: cv,
              },
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        topK: 1,
        topP: 0.8,
        temperature: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            overallMatch: {
              type: SchemaType.OBJECT,
              nullable: false,
              properties: {
                score: { type: SchemaType.NUMBER },
                summary: { type: SchemaType.STRING },
              },
            },
            strengths: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  area: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  evidence: { type: SchemaType.STRING },
                },
              },
            },
            weaknesses: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  area: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  impact: { type: SchemaType.STRING },
                },
              },
            },
            skillsAlignment: {
              type: SchemaType.OBJECT,
              nullable: false,
              properties: {
                matched: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING, nullable: false },
                },
                missing: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
                additional: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
              },
            },
            experienceAlignment: {
              type: SchemaType.OBJECT,
              nullable: false,
              properties: {
                relevantExperience: { type: SchemaType.STRING },
                yearsOfExperience: { type: SchemaType.STRING },
                industryMatch: { type: SchemaType.STRING },
              },
            },
            recommendations: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            redFlags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            error: {
              type: SchemaType.STRING,
            },
          },
        },
      },
    };

    return requestPayload;
  } catch (error) {
    console.error({
      message: 'error forming the request payload for GenerateContentRequest',
      error,
    });
    throw error;
  }
}
