import {z} from "zod";

export const ResumeSchema = z.object({
    id: z.string().min(1, "User ID is required"),
    content: z.string().min(10, "Resume must be at least 10 characters"),
    atsScore: z.number().min(0).max(100).optional(),
    feedback: z.string().optional()
})

export type ResumeType = z.infer<typeof ResumeSchema>


export const contactSchema = z.object({
    email: z.string().email("Invalid Email address"),
    mobile: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional()
})

export const entrySchema = z.object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean().default(false),
})
.refine(
    (data) => {
      if (!data.current && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    }
);

export const resumeSchema = z.object({
    contactInfo: contactSchema,
    summary: z.string().min(1, "Professional summary is required"),
    skills: z.string().min(1, "Skills are required"),
    experience: z.array(entrySchema),
    education: z.array(entrySchema),
    projects: z.array(entrySchema),
});


export const coverLetterSchema = z.object({
companyName: z.string().min(1, "Company name is required"),
jobTitle: z.string().min(1, "Job title is required"),
jobDescription: z.string().min(1, "Job description is required"),
});