import { z } from "zod"

export const AssessmentSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    quizScore: z.number().min(0).max(100, "Score must be between 0 and 100"),
    questions: z.array(
        z.object({
            question: z.string(),
            answer: z.string(),
            userAnswer: z.string(),
            isCorrect: z.boolean(),
        })
    ),
    category: z.enum(["Technical", "Behavioral", "Other"]),
    improvementTip: z.string().optional(),
});

export type AssessmentType = z.infer<typeof AssessmentSchema>;
