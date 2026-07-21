import { z } from "zod";

export const sourceSchema = z.enum(["sample", "custom"]);

export const analyzeRequestSchema = z
  .object({
    sessionText: z.string().trim().min(40).max(60_000),
    diffText: z.string().trim().min(40).max(60_000),
    consentToOpenAI: z.literal(true),
    source: sourceSchema,
  })
  .strict();

export const evidenceClaimSchema = z.object({
  claim: z.string().trim().min(1).max(600),
  refs: z.array(z.string().trim().min(1).max(40)).min(1).max(4),
});

export const questionSchema = z.object({
  id: z.string().trim().regex(/^q[1-3]$/),
  prompt: z.string().trim().min(1).max(500),
  whyItMatters: z.string().trim().min(1).max(500),
  evidenceRefs: z.array(z.string().trim().min(1).max(40)).min(1).max(4),
  teachingPoint: z.string().trim().min(1).max(800),
});

export const handoffSchema = z.object({
  title: z.string().trim().min(1).max(120),
  thesis: z.string().trim().min(1).max(500),
  intent: z.array(evidenceClaimSchema).min(1).max(3),
  implementation: z.array(evidenceClaimSchema).min(1).max(3),
  consequences: z.array(evidenceClaimSchema).min(1).max(3),
  questions: z.array(questionSchema).length(3),
});

export const coachRequestSchema = z
  .object({
    question: questionSchema,
    answer: z.string().trim().min(1).max(4_000),
    questionNumber: z.number().int().min(1).max(3),
  })
  .strict();

export const coachingSchema = z.object({
  whatYouSaw: z.string().trim().min(1).max(600),
  whatToAdd: z.string().trim().min(1).max(800),
  takeaway: z.string().trim().min(1).max(400),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type Handoff = z.infer<typeof handoffSchema>;
export type Question = z.infer<typeof questionSchema>;
export type CoachRequest = z.infer<typeof coachRequestSchema>;
export type Coaching = z.infer<typeof coachingSchema>;
