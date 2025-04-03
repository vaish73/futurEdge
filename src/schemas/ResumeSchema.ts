import {z} from "zod";

export const ResumeSchema = z.object({
    id: z.string().min(1, "User ID is required"),
    content: z.string().min(10, "Resume must be at least 10 characters"),
    atsScore: z.number().min(0).max(100).optional(),
    feedback: z.string().optional()
})

export type ResumeType = z.infer<typeof ResumeSchema>