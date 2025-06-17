import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import { analyzeCVWithGemini } from '../services/aiService';
import { logger } from '../utils';

const t = initTRPC.context<Context>().create();

/**
 * tRPC router configuration for the CV analysis API
 * Provides type-safe endpoints for CV and job description analysis
 */
export const appRouter = t.router({
  /**
   * Analyzes a CV against a job description
   * Accepts PDF files for both CV and job description
   * Returns detailed analysis including match score, strengths, and recommendations
   *
   * @throws TRPCError with:
   * - BAD_REQUEST if files are missing or invalid
   * - INTERNAL_SERVER_ERROR if analysis fails
   */
  analyzeCVMatch: t.procedure
    .input(
      z.object({
        // We'll validate files are present in the middleware
      })
    )
    .mutation(async ({ ctx }) => {
      try {
        const files = ctx.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (!files || !files.jobDescription || !files.cv) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Both jobDescription and cv PDF files are required',
          });
        }

        const jobDescriptionFile = files.jobDescription[0];
        const cvFile = files.cv[0];

        // Convert PDFs to base64
        const jobDescriptionBase64 =
          jobDescriptionFile.buffer.toString('base64');
        const cvBase64 = cvFile.buffer.toString('base64');

        // Analyze with Gemini (PDFs sent as base64)
        const analysis = await analyzeCVWithGemini(
          jobDescriptionBase64,
          cvBase64
        );

        return {
          success: true,
          analysis,
          metadata: {
            jobDescriptionSize: jobDescriptionFile.size,
            cvSize: cvFile.size,
            analyzedAt: new Date().toISOString(),
          },
        };
      } catch (error) {
        logger.error({ message: 'Analysis error:', error });

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze CV and job description',
          cause: error,
        });
      }
    }),
});

export type AppRouter = typeof appRouter;
