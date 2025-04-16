"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ProfileModel from "@/models/Profile";
import { getServerSession, Profile } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ResumeModel from "@/models/Resume";
import { revalidatePath } from "next/cache";
import { IResume } from '../src/models/Resume';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function saveResume(content: string): Promise<IResume> {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(session);

  const userId = session.user.id;

  const profile = (await ProfileModel.findOne({
    userId,
  }).lean()) as Profile | null;

  if (!profile) {
    throw new Error("User doesn't exist")
  }

  try {
    const resume = await ResumeModel.findOneAndUpdate({
      userId
    }, {
      content,
      atsScore: 0,
      feedback: "Not generated Yet",
    }, { upsert: true, new: true, setDefaultsOnInsert:true })
    if (!resume) {
      throw new Error("Error creating Resume or resume not found")
    }
    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume(): Promise<IResume | null> {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(session);

  const userId = session.user.id;

  const profile = (await ProfileModel.findOne({
    userId,
  }).lean()) as Profile | null;

  if (!profile) {
    throw new Error("User doesn't exist")
  }

  return await ResumeModel.findOne({ userId })
}

interface ImproveAIInput{
  current: string;
  type: string;
}

export async function improveWithAI({ current, type }: ImproveAIInput): Promise<string> {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(session);

  const userId = session.user.id;

  const profile = await ProfileModel.findOne({userId});

  if (!profile) throw new Error("User doesn't exist")

  if(!profile.industry){
    revalidatePath("/onboarding");
    throw new Error("User has not chosen an industry yet")
  }
  
  const prompt = `
  As an expert resume writer, improve the following ${type} description for a ${profile.industry} professional.
  Make it more impactful, quantifiable, and aligned with industry standards.

  Current content: "${current}"

  Requirements:
  1. Use action verbs
  2. Include metrics and results
  3. Highlight relevant skills
  4. Keep it concise but detailed
  5. Use industry-specific keywords
  6. Focus on achievements, not responsibilities

  Format as a single paragraph with no extra commentary.
`;

  try {
    const result = await model.generateContent(prompt);
    const improved = result.response.text().trim();
    return improved;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Faield to improve content");
  }


}
