import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  industry: z.string().min(1, "Industry is required"),
  bio: z.string().optional(),
  experience: z.number().min(0, "Experience must be at least 0"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

export type ProfileType = z.infer<typeof ProfileSchema>;
