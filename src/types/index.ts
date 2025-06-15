import { z } from 'zod';
export { GenerateContentRequest, SchemaType } from '@google-cloud/vertexai';

export const AnalysisResult = z.object({
  candidateName: z.string().optional(),
  overallMatch: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  keySkillsMatch: z.array(
    z.object({
      skill: z.string(),
      hasSkill: z.boolean(),
      proficiencyLevel: z
        .enum(['beginner', 'intermediate', 'advanced', 'expert'])
        .optional(),
    })
  ),
  recommendations: z.array(z.string()),
  summary: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisResult>;

export interface PDFFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export const cvAnalysisResponseType = {};
