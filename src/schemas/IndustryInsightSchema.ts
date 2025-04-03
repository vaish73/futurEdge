import { z } from "zod";

export const IndustryInsightSchema = z.object({
    industry: z.string().min(1, "Industry name is required"),
    salaryRanges: z.array(
        z.object({
            role: z.string(),
            min: z.number().min(0),
            max: z.number().min(0),
            median: z.number().min(0),
            location: z.string().optional(),
        })
    ),
    growthRate: z.number().min(0, "Growth rate must be a positive number"),
    demandLevel: z.enum(["High", "Medium", "Low"]),
    marketOutlook: z.enum(["Positive", "Neutral", "Negative"]),
    topSkills: z.array(z.string()),
    keyTrends: z.array(z.string()),
    recommendedSkills: z.array(z.string()),
});

export type IndustryInsightType = z.infer<typeof IndustryInsightSchema>;
