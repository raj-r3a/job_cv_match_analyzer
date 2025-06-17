import { GenerateContentRequest, SchemaType } from '../types';

/**
 * Forms the request payload for the Gemini AI model to analyze CV and job description
 * Creates a structured prompt with validation rules and expected response format
 *
 * @param jd - Base64 encoded job description PDF
 * @param cv - Base64 encoded CV PDF
 * @returns GenerateContentRequest payload with:
 * - System instructions for validation and analysis
 * - Structured prompt for CV analysis
 * - Response schema for consistent output format
 * @throws Error if payload formation fails
 */
export function formGenerateContentPayloadWithFiles(jd: string, cv: string) {
  try {
    const prompt = `
You are an expert HR analyst. Your task is to analyze CVs against job descriptions with strict validation.

**CRITICAL VALIDATION RULES:**
1. BEFORE any analysis, you MUST verify that BOTH documents contain meaningful content
2. If the job description is empty, contains only whitespace, or has fewer than 50 characters, STOP and return an error
3. If the CV is empty, contains only whitespace, or has fewer than 100 characters, STOP and return an error
4. If either document appears to be corrupted, unreadable, or contains only metadata, STOP and return an error

**VALIDATION CHECKLIST - Check these FIRST:**
- [ ] Job description exists and has substantial content (>50 chars)
- [ ] Job description contains job-related keywords (role, requirements, responsibilities)
- [ ] CV exists and has substantial content (>100 chars)  
- [ ] CV contains resume-related content (experience, skills, education)

**IF VALIDATION FAILS:** Return immediately with the error format shown below.

You will receive two PDF documents:
1. The first PDF is the **job description**
2. The second PDF is the **candidate's CV**

**ONLY IF BOTH DOCUMENTS PASS VALIDATION**, analyze them and respond in the following JSON format:

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
  "error": null
}

**ERROR RESPONSE FORMAT** (use when validation fails):
{
  "overallMatch": null,
  "strengths": null,
  "weaknesses": null,
  "skillsAlignment": null,
  "experienceAlignment": null,
  "recommendations": null,
  "redFlags": null,
  "error": "<specific error message>"
}

**ERROR MESSAGES TO USE:**
- "Job description is empty or contains insufficient content"
- "CV is empty or contains insufficient content"  
- "Job description file is corrupted or unreadable"
- "CV file is corrupted or unreadable"
- "Both documents are invalid or could not be processed"

⚠️ **STRICT REQUIREMENTS:**
- ALWAYS validate documents FIRST before any analysis
- Return ONLY raw JSON (no markdown, no code blocks, no explanations)
- NEVER generate analysis for empty or invalid documents
- NEVER assume or hallucinate content that isn't present
- If unsure about document validity, err on the side of returning an error
`;

    const systemInstruction = `
You are a strict document validator and HR analyst. 

CORE BEHAVIOR:
- Always validate input documents before analysis
- Never generate content for empty or invalid inputs
- Return structured errors for invalid cases
- Be precise and factual, never assume missing information

VALIDATION PRIORITY:
Document validation takes absolute priority over being helpful or generating analysis.
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
        temperature: 1,
        candidateCount: 1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            validationStatus: {
              type: SchemaType.STRING,
              enum: ['VALID', 'INVALID_JD', 'INVALID_CV', 'INVALID_BOTH'],
            },
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
      systemInstruction: systemInstruction,
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
