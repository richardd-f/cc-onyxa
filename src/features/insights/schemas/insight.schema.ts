import { z } from "zod";

export const generatedInsightItemSchema = z.object({
  type: z.enum([
    "SPENDING_INCREASE",
    "SPENDING_DECREASE",
    "RECURRING_HABIT",
    "CATEGORY_CONCENTRATION",
    "MERCHANT_CONCENTRATION",
    "UNUSUAL_ACTIVITY",
    "SAVING_OPPORTUNITY",
  ]),
  title: z.string().min(3),
  description: z.string().min(10),
  recommendation: z.string().optional(),
  evidence: z.record(z.string(), z.any()).default({}),
});

export const generatedInsightsResponseSchema = z.object({
  insights: z.array(generatedInsightItemSchema),
});

export type GeneratedInsightItem = z.infer<typeof generatedInsightItemSchema>;
