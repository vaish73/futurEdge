import { z } from "zod";

export const CoverLetterSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    content: z.string().min(50, "Cover letter must be at least 50 characters"),
    jobDescription: z.string().optional(),
    companyName: z.string().min(1, "Company name is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    status: z.enum(["draft", "completed"]).default("draft"),
});

export type CoverLetterType = z.infer<typeof CoverLetterSchema>;
